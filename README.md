# ai-ui-tester
AI UI testing prove-of-concept using multimodal LLMs.

## Ojective
The objective is to create a prove-of-concept for
using multimodal LLMs to test GUIs.

## Idea
The idea is to supply the multi modal LLM with a screenshot
of the current UI page overlayed with a grid.
This way the LLM can issue commands based on the grid sectors.

## Testing the Tester
To the the the Tester a Webpage is created.
The tool `pupeteer` will be used to execute actions (clicks with X-Y pixel coordinates)
on the Webpage and finaly create 512x512 (GPT-4o tile size) grid overlayed image.
Finally run the ai-ui-tester using the image as input and a test-definition containing
the prompts.

- Use `pupeteer` to create a 470x470 screenshot of the webpage.
- Use `sharp` to overlay the 510x510 grid and save it to a final 512x512 image
- The ai-ui-tester called with a test-deefinition and a state store to process the output.png
- Repeat until test is pass or fail

```sh
node screenshot.cjs --get-args events=#
ai-ui-tester --test test-definition.yaml --state state.json --input output.png
node screenshot.cjs --get-args events=#click42-24#
ai-ui-tester --test test-definition.yaml --state state.json --input output.png
node screenshot.cjs --get-args events=#click42-24#click55-77
ai-ui-tester --test test-definition.yaml --state state.json --input output.png
...
```
