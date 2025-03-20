export interface QuestionAnswererConfig {
    [key: string]: any;
    scenario_id: number;
    validate_question_model: string;
    ask_question_model?: string;
    generate_query_model?: string;
    judge_query_model?: string;
    interpret_results_model?: string;
    judge_regenerate_query_model?: string;
    text_embedding_model?: string;
}

// Custom type guard function
export function isQuestionAnswererConfig(obj: any): obj is QuestionAnswererConfig {
    return typeof obj === 'object' &&
           obj !== null &&
           'scenario_id' in obj &&
           'validate_question_model' in obj;
  }