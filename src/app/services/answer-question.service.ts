import { Injectable } from '@angular/core';
import { LLMModel } from '../models/llmmodel';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { ANSWER_QUESTION_ENDPOINT, GRAPH_SCHEMA_ENDPOINT } from './predefined-variables';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AnswerQuestionService {

  constructor(private http: HttpClient) { }

  answer_question(selectedLLM: LLMModel, scenario_id: number, question: string): Promise<Response> {

    const body = {
      "model_provider": selectedLLM.modelProvider,
      "model_name": selectedLLM.modelName,
      "base_uri": selectedLLM.baseUri,
      "question": question,
      "scenario_id": scenario_id
    }

    return fetch(ANSWER_QUESTION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
  }

  get_graph_schema(scenario_id: number): Observable<any> {

    const body = {
      "scenario_id": scenario_id,
    }
    return this.http.post(GRAPH_SCHEMA_ENDPOINT, body);
  }

}
