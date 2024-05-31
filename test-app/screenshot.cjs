const puppeteer = require('puppeteer');
const { program } = require('commander');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const delay = time => new Promise(resolve => setTimeout(resolve, time));

let events = []
program
  .option('--tap <click_json>', 'JSON tap event', (evt, _) => {
    evt = JSON.parse(evt);
    events = events.concat([{"type":"tap","value":evt}]);
  }, null)
  .option('--screen <path>', 'Save screen to path', (evt, _) => {
    events = events.concat([{"type":"screen","value":evt}]);
  }, null)
  .parse(process.argv);

try {
    const options = program.opts();
} catch (error) {
    console.error('Invalid JSON:', error.message);
    return 1;
}

const baseURL = 'http://localhost:5173/index.html';
const url = baseURL;
const screenshotPath = 'tmp.png';
const gridSvgPath = 'grid.svg';
const outputPath = 'output.png';

const post_process = async (input, output) => {
  console.log(`access ${gridSvgPath}`)
  await fs.access(gridSvgPath);

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
    .composite([{ input: input, top: top, left: left, blend: 'over' }])
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
  console.log(`writeFile ${output}`)
  await fs.writeFile(output, outputBuffer);
}

(async () => {
  console.log("launch browser");
  const browser = await puppeteer.launch();
  console.log("open blank page");
  const page = await browser.newPage();

  console.log("set viewport 470x470");
  await page.setViewport({ width: 470, height: 470 });

  console.log(`goto <${url}>`);
  await page.goto(url, { waitUntil: 'networkidle2' });

  console.log("process events: ", events);
  for (const evt of events) {
    if (evt["type"] == "tap") {
      const coord = evt["value"]
      const x = coord.x * 20
      const y = coord.y * 20
      await page.mouse.click(x, y);
      console.log(`Clicked at (${x}, ${y})`);
      await delay(100);
    } else if (evt["type"] == "screen") {
      const dst = evt["value"]
      await page.screenshot({ path: screenshotPath });
      console.log('post process screen');
      await post_process(screenshotPath, dst);
      console.log(`Screen saved as ${dst}`);
    }
  }

  await browser.close();

})();
