import { Injectable } from '@angular/core';
import { LLMModel } from '../models/llmmodel';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { ANSWER_QUESTION_ENDPOINT, GRAPH_SCHEMA_ENDPOINT } from './predefined-variables';
import { Observable } from 'rxjs';
import { Seq2SeqModel } from '../models/seq2seqmodel';
import { TextEmbeddingModel } from '../models/text-embedding-model';


@Injectable({
  providedIn: 'root'
})
export class AnswerQuestionService {

  constructor(private http: HttpClient) { }

  answer_question(seq2SeqModel: Seq2SeqModel, textEmbeddingModel: TextEmbeddingModel, scenario_id: number, question: string): Promise<Response> {


    const body: Record<string, any> = {
      "seq2seq_model": seq2SeqModel.configName,
      "question": question,
      "scenario_id": scenario_id
    }

    if (![1, 2].includes(scenario_id)) {
      Object.assign(body, { "text_embedding_model": textEmbeddingModel.configName});
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
