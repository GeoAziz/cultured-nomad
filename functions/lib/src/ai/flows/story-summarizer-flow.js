"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeStory = summarizeStory;
/**
 * @fileOverview An AI flow to summarize a story into a short excerpt.
 *
 * - summarizeStory - A function that takes a story's content and returns a one-sentence summary.
 * - SummarizeStoryInput - The input type for the summarizeStory function.
 * - SummarizeStoryOutput - The return type for the summarizeStory function.
 */
const genkit_1 = require("@/ai/genkit");
const genkit_2 = require("genkit");
const SummarizeStoryInputSchema = genkit_2.z.object({
    content: genkit_2.z.string().describe('The full content of the story or journal entry.'),
});
const SummarizeStoryOutputSchema = genkit_2.z.object({
    excerpt: genkit_2.z.string().describe('A compelling, one-sentence summary of the story content.'),
});
async function summarizeStory(input) {
    return storySummarizerFlow(input);
}
const prompt = genkit_1.ai.definePrompt({
    name: 'storySummarizerPrompt',
    input: { schema: SummarizeStoryInputSchema },
    output: { schema: SummarizeStoryOutputSchema },
    prompt: `You are an expert editor for a journal. Your task is to read the following story content and write a single, compelling, one-sentence summary that captures its essence. This will be used as a teaser or excerpt.

Story Content:
{{{content}}}`,
});
const storySummarizerFlow = genkit_1.ai.defineFlow({
    name: 'storySummarizerFlow',
    inputSchema: SummarizeStoryInputSchema,
    outputSchema: SummarizeStoryOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    return output;
});
//# sourceMappingURL=story-summarizer-flow.js.map