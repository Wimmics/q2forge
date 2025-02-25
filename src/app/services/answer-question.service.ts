import { Injectable } from '@angular/core';
import { LLMModel } from '../models/llmmodel';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { ANSWER_QUESTION_ENDPOINT } from './predefined-variables';


@Injectable({
  providedIn: 'root'
})
export class AnswerQuestionService {

  constructor(private http: HttpClient) { }

  answer_question(selectedLLM: LLMModel, question: string): Promise<Response> {

    const body = {
      "model_provider": selectedLLM.modelProvider,
      "model_name": selectedLLM.modelName,
      "base_uri": selectedLLM.baseUri,
      "question": question,
    }

    return fetch(ANSWER_QUESTION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
      
  }
}
