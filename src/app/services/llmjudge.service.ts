import { Injectable } from '@angular/core';
import { SPARQLPartInfo } from '../models/extraction';
import { LLMJudgeStructureOutputSchema } from '../models/llmmodel';

import { ChatOllama } from "@langchain/ollama";
import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { LLMModel } from '../models/llmmodel';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { environment } from '../../../environment';


@Injectable({
  providedIn: 'root'
})
export class LLMJudgeService {

  private readonly prompt = `Role: You are a Semantic Web teacher tasked with grading students' SPARQL queries based on a given natural language question.

Input:

- A natural language question.
- A student's SPARQL query (provided in "sparql" markdown).
- Context of the QNames and Full QNames used in the query.

Output:
Your evaluation should be structured in two parts:

1. Grade (1–10):
  - 1 = Completely incorrect or irrelevant.
  - 10 = Fully correct and optimal.

2. Justification:
  - Provide a concise and direct explanation of your score.
  - Focus on accuracy, completeness, efficiency, and syntax correctness.
  - Avoid unnecessary details—keep it clear and to the point.

Question:
{question}

SPARQL Query:
'''sparql
{sparql}
'''

QName Context:
{qname_info} 
`

  async getLLMAnswer(selectedLLM: LLMModel, question: string, sparqlQuery: string, dataSource: SPARQLPartInfo[]): Promise<any> {
    const promptForJsonMode = ChatPromptTemplate.fromTemplate(this.prompt);
    let llm!: BaseChatModel;
    if (selectedLLM.modelProvider === 'Ollama-local') {
      llm = new ChatOllama({
        baseUrl: "http://localhost:11434", // Default value
        model: selectedLLM.modelName,
      });
    }
    else if (selectedLLM.modelProvider === 'DeepSeek') {
      llm = new ChatDeepSeek({
        model: selectedLLM.modelName,
        apiKey: environment.DEEPSEEK_API_KEY,
      });
    }
    else if (selectedLLM.modelProvider === 'Ovh') {
      llm = new ChatOpenAI({
        model: selectedLLM.modelName,
        configuration: {
          baseURL: selectedLLM.baseUri,
          apiKey : environment.OVH_API_KEY,
        },
      });
    }
    // const structuredLLM = llm.withStructuredOutput(LLMJudgeStructureOutputSchema);
    const chainForJsonMode = promptForJsonMode.pipe(llm);

    const resultFromJsonMode = await chainForJsonMode.invoke({
      question: question,
      sparql: sparqlQuery,
      qname_info: dataSource.map((info) => `${info.uri}: ${info.info}`).join("\n"),
    });

    return resultFromJsonMode.content;
  }
}
