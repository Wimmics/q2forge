import { Injectable } from '@angular/core';
import { LLMModel } from '../models/llmmodel';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GENERATE_QUESTION_ENDPOINT } from './predefined-variables';


@Injectable({
  providedIn: 'root'
})
export class GenerateQuestionService {

  constructor(private http: HttpClient) { }

  getLLMAnswer(selectedLLM: LLMModel, number_of_questions: number, kg_description: string, kg_schema: string, additional_context: string, enforce_structured_output: boolean): Observable<any> {

    const body = {
      "model_provider": selectedLLM.modelProvider,
      "model_name": selectedLLM.modelName,
      "base_uri": selectedLLM.baseUri,
      "number_of_questions": number_of_questions,
      "kg_description": kg_description,
      "kg_schema": kg_schema,
      "additional_context": additional_context,
      "enforce_structured_output": enforce_structured_output,
    }

    return this.http.post<any>(GENERATE_QUESTION_ENDPOINT, body);
  }
}
