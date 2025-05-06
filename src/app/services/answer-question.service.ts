import { Injectable } from '@angular/core';
import { ANSWER_QUESTION_ENDPOINT } from './predefined-variables';
import { QuestionAnswererConfig } from '../models/question-answerer-config';

@Injectable({
  providedIn: 'root'
})
export class AnswerQuestionService {

  answer_question(config: QuestionAnswererConfig, question: string): Promise<Response> {

    const body: Record<string, any> = {
      "question": question,
      "scenario_id": config.scenario_id,
      "validate_question_model": config.validate_question_model,
    }

    if (!["1", "2"].includes(config.scenario_id)) {
      Object.assign(body, { "text_embedding_model": config.text_embedding_model });
    }

    if (["1"].includes(config.scenario_id)) {
      Object.assign(body, { "ask_question_model": config.ask_question_model });
    }

    if (!["1"].includes(config.scenario_id)) {
      Object.assign(body, { "generate_query_model": config.generate_query_model });
    }

    if (!["1"].includes(config.scenario_id)) {
      Object.assign(body, { "interpret_results_model": config.interpret_results_model });
    }

    if (["7"].includes(config.scenario_id)) {
      Object.assign(body, { "judge_query_model": config.judge_query_model });
    }

    if (["7"].includes(config.scenario_id)) {
      Object.assign(body, { "judge_regenerate_query_model": config.judge_regenerate_query_model });
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
