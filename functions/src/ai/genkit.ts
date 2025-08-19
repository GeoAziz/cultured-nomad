
import {genkit,getModel} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
});

export const geminiPro = getModel({
  name: 'googleai/gemini-2.0-flash',
  config: {
    // These are just examples, you can configure them as needed.
    temperature: 0.5,
    maxOutputTokens: 2048,
  },
});
