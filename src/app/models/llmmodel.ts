export interface LLMModel {
    modelProvider: string;
    modelName: string;
    apiKey?: string;
    baseUri?: string;
} 

export interface LLMJudgeStructureOutput {
    grade: number;
    justification: string;
}

import { z } from "zod";

export const LLMJudgeStructureOutputSchema = z.object({
  grade: z.number().describe("The grade given to the student's answer"),
  justification: z
    .string()
    .describe("The justification for the grade given to the student's answer"),
});