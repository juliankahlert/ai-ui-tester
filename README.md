# ai-ui-tester
AI UI testing proof-of-concept using multimodal LLMs.

## Objective
Create a proof-of-concept for using multimodal LLMs to test GUIs.

## Concept
Provide the multimodal LLM with a screenshot of the current UI page overlaid with a grid. This allows the LLM to issue commands based on the grid sectors.

### Testing the Tester
To test the Tester, a webpage is created. The tool `puppeteer` executes actions (clicks with X-Y pixel coordinates) on the webpage and creates a 512x512 (GPT-4 tile size) grid-overlaid image. The ai-ui-tester then uses this image as input along with a test definition containing the prompts.

Steps:
1. Use `puppeteer` to create a 470x470 screenshot of the webpage.
2. Use `sharp` to overlay the 510x510 grid and save it as a final 512x512 image.
3. Call the ai-ui-tester with a test definition and a state store to process the output.png.
4. Repeat until the test passes or fails.

