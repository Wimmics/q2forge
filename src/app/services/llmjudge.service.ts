import { Injectable } from '@angular/core';
import { SPARQLPartInfo } from '../models/extraction';
import { LLMModel } from '../models/llmmodel';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JUDGE_QUERY_ENDPOINT } from './predefined-variables';


@Injectable({
  providedIn: 'root'
})
export class LLMJudgeService {

  constructor(private http: HttpClient) { }

  getLLMAnswer(selectedLLM: LLMModel, question: string, sparqlQuery: string, dataSource: SPARQLPartInfo[]): Observable<any> {

    const body = {
      "modelProvider": selectedLLM.modelProvider,
      "modelName": selectedLLM.modelName,
      "base_uri": selectedLLM.baseUri,
      "question": question,
      "sparql_query": sparqlQuery,
      "sparql_query_context": dataSource.map((info) => `${info.uri}: ${info.info}`).join("\n")
    }

    return this.http.post<any>(JUDGE_QUERY_ENDPOINT, body);
  }
}
