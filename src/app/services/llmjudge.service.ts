import { Injectable } from '@angular/core';
import { SPARQLPartInfo } from '../models/extraction';
import { JUDGE_QUERY_ENDPOINT } from './predefined-variables';


@Injectable({
  providedIn: 'root'
})
export class LLMJudgeService {

  getLLMAnswer(model_config_id: string, question: string, sparqlQuery: string, dataSource: SPARQLPartInfo[]): Promise<Response> {

    const body = {
      "model_config_id": model_config_id,
      "question": question,
      "sparql_query": sparqlQuery,
      "sparql_query_context": dataSource.map((info) => `${info.uri}: ${info.info}`).join("\n")
    }

    return fetch(JUDGE_QUERY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
  }
}
