
'use server';
/**
 * @fileOverview An AI flow to summarize a story into a short excerpt.
 *
 * - summarizeStory - A function that takes a story's content and returns a one-sentence summary.
 * - SummarizeStoryInput - The input type for the summarizeStory function.
 * - SummarizeStoryOutput - The return type for the summarizeStory function.
 */

import {ai} from '../genkit';
import {z} from 'genkit';

const SummarizeStoryInputSchema = z.object({
  content: z.string().describe('The full content of the story or journal entry.'),
});
export type SummarizeStoryInput = z.infer<typeof SummarizeStoryInputSchema>;

const SummarizeStoryOutputSchema = z.object({
  excerpt: z.string().describe('A compelling, one-sentence summary of the story content.'),
});
export type SummarizeStoryOutput = z.infer<typeof SummarizeStoryOutputSchema>;

export async function summarizeStory(input: SummarizeStoryInput): Promise<SummarizeStoryOutput> {
  return storySummarizerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'storySummarizerPrompt',
  input: {schema: SummarizeStoryInputSchema},
  output: {schema: SummarizeStoryOutputSchema},
  prompt: `You are an expert editor for a journal. Your task is to read the following story content and write a single, compelling, one-sentence summary that captures its essence. This will be used as a teaser or excerpt.

Story Content:
{{{content}}}`,
});

const storySummarizerFlow = ai.defineFlow(
  {
    name: 'storySummarizerFlow',
    inputSchema: SummarizeStoryInputSchema,
    outputSchema: SummarizeStoryOutputSchema,
  },
  async (input: SummarizeStoryInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
