const puppeteer = require('puppeteer');
const { program } = require('commander');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

program
  .option('--get-args <getargs>', 'GET arguments to append to the URL')
  .parse(process.argv);

const options = program.opts();
const baseURL = 'http://localhost:5173/index.html'; // Replace with your base URL
const url = options.getArgs ? `${baseURL}?${options.getArgs}` : baseURL;
const screenshotPath = 'tmp.png';
const gridSvgPath = 'grid.svg';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 470, height: 470 });

  await page.goto(url, { waitUntil: 'networkidle2' });

  // Define an array of X-Y coordinates to click
  const clickCoordinates = [
    { x: 235, y: 350 },
    { x: 235, y: 350 },
    // Add more coordinates as needed
  ];

  // Simulate clicks at each coordinate
  for (const coord of clickCoordinates) {
    await page.mouse.click(coord.x, coord.y);
    console.log(`Clicked at (${coord.x}, ${coord.y})`);

    // Add a delay between clicks if needed
    // await page.waitForTimeout(100);
  }

  await page.screenshot({ path: screenshotPath });

  await browser.close();

  try {
    await fs.access(gridSvgPath);
  } catch (error) {
    console.error(`Grid SVG file not found: ${gridSvgPath}`);
    return;
  }

  const screenshotBuffer = await fs.readFile(screenshotPath);
  let gridSvgBuffer = await fs.readFile(gridSvgPath);

  // Resize the SVG to 510x510
  gridSvgBuffer = await sharp(gridSvgBuffer)
    .resize(510, 510)
    .toBuffer();

  // Get the dimensions of the grid SVG
  const gridSvgMetadata = await sharp(gridSvgBuffer).metadata();
  process.stdout.write(`Grid SVG size ${gridSvgMetadata.width}x${gridSvgMetadata.height}\n`);

  // Calculate the positions to center the PNG within the SVG
  const left = Math.max(0, (gridSvgMetadata.width - 470) / 2) + 1;
  const top = Math.max(0, (gridSvgMetadata.height - 470) / 2) + 1;

  process.stdout.write(`Creating a base image\n`);
  // Create a base image with the SVG dimensions filled with transparency
  const baseImage = sharp({
    create: {
      width: 512,
      height: 512,
      channels: 3,
      background: { r: 255, g: 255, b: 255 }
    }
  });

  // Composite the PNG onto the base image
  const compositedImage = await baseImage
    .composite([{ input: screenshotBuffer, top: top, left: left, blend: 'over' }])
    .png()
    .toBuffer();

  const gridBuffer = await sharp(gridSvgBuffer)
    .png()
    .toBuffer();

  // Overlay the SVG on top of the composited image
  const outputBuffer = await sharp(compositedImage)
    .composite([{ input: gridBuffer, top: 1, left: 1, blend: 'over' }])
    .png()
    .toBuffer();

  // Save the final image
  const outputPath = 'output.png';
  await fs.writeFile(outputPath, outputBuffer);

  console.log(`Final image saved as ${outputPath}`);
})();
