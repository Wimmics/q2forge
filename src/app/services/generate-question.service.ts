import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GENERATE_QUESTION_ENDPOINT } from './predefined-variables';


@Injectable({
  providedIn: 'root'
})
export class GenerateQuestionService {

  constructor(private http: HttpClient) { }

  getLLMAnswer(selectedModelConfigId: string, number_of_questions: number, kg_description: string, kg_schema: string, additional_context: string, enforce_structured_output: boolean):
    Promise<Response> {

    const body = {
      "model_config_id": selectedModelConfigId,
      "number_of_questions": number_of_questions,
      "kg_description": kg_description,
      "kg_schema": kg_schema,
      "additional_context": additional_context,
      "enforce_structured_output": enforce_structured_output,
    }


    return fetch(GENERATE_QUESTION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
  }
}
