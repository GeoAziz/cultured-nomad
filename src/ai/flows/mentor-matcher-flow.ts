
'use server';
/**
 * @fileOverview An AI flow to match a user with the best mentor.
 *
 * - matchMentor - A function that takes a user and a list of mentors and returns the best match.
 * - MatchMentorInput - The input type for the matchMentor function.
 * - MatchMentorOutput - The return type for the matchMentor function.
 */

import { ai } from '../genkit';
import { z } from 'zod';

// Define the schema for a single mentor
const MentorSchema = z.object({
  id: z.string().describe('The unique ID of the mentor.'),
  name: z.string().describe("The mentor's name."),
  bio: z.string().describe("The mentor's professional biography."),
  industry: z.string().describe("The mentor's primary industry."),
  interests: z.array(z.string()).describe("A list of the mentor's interests or skills."),
});

const MatchMentorInputSchema = z.object({
  user: z.object({
    bio: z.string().describe("The user's professional biography or goals."),
    interests: z.array(z.string()).describe("A list of the user's interests."),
  }).describe("The user seeking mentorship."),
  mentors: z.array(MentorSchema).describe('A list of available mentors to choose from.'),
});
export type MatchMentorInput = z.infer<typeof MatchMentorInputSchema>;

const MatchMentorOutputSchema = z.object({
  mentorId: z.string().describe('The ID of the most suitable mentor for the user.'),
  reason: z.string().describe('A short, one-sentence explanation for why this mentor is a good match.'),
});
export type MatchMentorOutput = z.infer<typeof MatchMentorOutputSchema>;

export async function matchMentor(input: MatchMentorInput): Promise<MatchMentorOutput> {
  return mentorMatcherFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mentorMatcherPrompt',
  input: {schema: MatchMentorInputSchema},
  output: {schema: MatchMentorOutputSchema},
  prompt: `You are an expert matchmaker for a professional mentorship program called "Cultured Nomads". Your goal is to find the ideal mentor for a user based on their profile and the available mentors.

Analyze the user's bio and interests to understand their needs. Then, review the list of available mentors.

User's Bio:
"{{{user.bio}}}"

User's Interests:
{{#each user.interests}} - {{{this}}} {{/each}}

Available Mentors:
{{#each mentors}}
---
Mentor ID: {{{id}}}
Name: {{{name}}}
Bio: "{{{bio}}}"
Industry: {{{industry}}}
Interests: {{#each interests}}"{{{this}}}"{{#if @last}}{{else}}, {{/if}}{{/each}}
---
{{/each}}

Based on this information, identify the single best mentor for the user. Your decision should be based on overlapping interests, industry alignment, and potential for a fruitful mentorship.

Output the ID of the best mentor and a compelling, one-sentence reason for the match.`,
});

const mentorMatcherFlow = ai.defineFlow(
  {
    name: 'mentorMatcherFlow',
    inputSchema: MatchMentorInputSchema,
    outputSchema: MatchMentorOutputSchema,
  },
  async (input: MatchMentorInput) => {
    // If there are no mentors, we can't make a match.
    if (input.mentors.length === 0) {
        throw new Error("No mentors available to match.");
    }
    // If there is only one mentor, they are the best match by default.
    if (input.mentors.length === 1) {
        return {
            mentorId: input.mentors[0].id,
            reason: `They are a great available mentor to start your journey.`
        }
    }

    const {output} = await prompt(input);
    return output!;
  }
);
