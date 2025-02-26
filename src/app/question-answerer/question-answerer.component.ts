import { Component } from '@angular/core';
import { AVAILABLE_LLM_MODELS, DEFAULT_JUDGE_QUESTION } from '../services/predefined-variables';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { AnswerQuestionService } from '../services/answer-question.service';
import { LLMModel } from '../models/llmmodel';
import { MatSelectModule } from '@angular/material/select';
import { MarkdownComponent } from 'ngx-markdown';
import { JsonPipe } from '@angular/common';
import { ChatMessage } from '../models/chat-message';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-question-answerer',
  imports: [MatInputModule, MatIconModule, ReactiveFormsModule, MatButtonModule, MatSelectModule, MarkdownComponent, FormsModule,
    JsonPipe, MatTooltipModule],
  templateUrl: './question-answerer.component.html',
  styleUrl: './question-answerer.component.scss'
})
export class QuestionAnswererComponent {

  model = {
    question: DEFAULT_JUDGE_QUESTION
  }

  question_fc = new FormControl(this.model.question);

  loadingLLMAnswer = false;
  errorLLMAnswer = '';

  availableLLMModels: LLMModel[] = AVAILABLE_LLM_MODELS;
  selectedLLM = this.availableLLMModels[5];

  chat_messages: ChatMessage[] = [];

  constructor(private answerQuestionService: AnswerQuestionService) { }

  ask_question() {
    if (this.question_fc.value) {
      this.loadingLLMAnswer = true;
      this.errorLLMAnswer = '';
      this.chat_messages.push(
        {
          "sender": "user",
          "content": this.question_fc.value
        }
      )
      this.answerQuestionService.answer_question(
        this.selectedLLM,
        this.question_fc.value!,
      ).then(response => {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = ''; // Accumulate stream chunks
        this.loadingLLMAnswer = false;

        const read = () => {
          reader?.read().then(({ done, value }) => {
            if (done) {
              // console.log('Stream complete');
              processBuffer(buffer, true); // Process any remaining valid JSON
              return;
            }

            buffer += decoder.decode(value, { stream: true }); // Append streamed data

            // console.log('Buffer:', buffer);
            processBuffer(buffer, false); // Try parsing valid JSON objects

            read();
          });
        };

        const processBuffer = (data: any, isComplete: boolean) => {
          try {
            let jsonObjects = [];
            let startIdx = 0;
            let lastJsonEnd = 0;
            // let tryCount = 0;

            while (startIdx < data.length) {
              // console.log(`Try count: ${++tryCount}`);

              let jsonStart = data.indexOf('{', startIdx);
              let jsonEnd = data.indexOf('}', lastJsonEnd);

              if (jsonStart !== -1 && jsonEnd !== -1) {
                try {
                  let jsonChunk = data.substring(jsonStart, jsonEnd + 1);
                  // console.log(jsonChunk);

                  let parsedJson = JSON.parse(jsonChunk);

                  if (
                    typeof parsedJson === 'object' &&
                    parsedJson.hasOwnProperty('event') &&
                    parsedJson.hasOwnProperty('node')
                  ) {
                    jsonObjects.push(parsedJson);
                    // console.log(`Parsed JSON: ${JSON.stringify(parsedJson)}`);
                    startIdx = jsonEnd + 1; // Move past processed JSON
                  } else {
                    // If it doesn't match the expected schema, ignore and continue
                    // console.log('Invalid JSON:', jsonChunk);
                    startIdx = jsonStart + 1;
                  }

                } catch (error) {
                  lastJsonEnd = jsonEnd + 1;
                  // console.error('JSON parsing error:', error);
                  // console.log(`startIdx < data.length: ${startIdx < data.length}`);   
                  // Incomplete JSON, keep accumulating
                  // break;
                }
              } else {
                // No complete JSON found, break
                break;
              }
            }

            // Keep only the unprocessed part in buffer
            buffer = data.substring(startIdx);

            // Process parsed JSON objects
            jsonObjects.forEach(stream_part => {
              // console.log(json); // Handle the valid JSON


              if (stream_part.event === 'on_chain_end') {
                this.chat_messages.push(
                  {
                    "sender": stream_part.node,
                    "content": this.extractDataFromStreamPart(stream_part.data, stream_part.node)
                  }
                );
              }
              else if (stream_part.event === 'on_chat_model_start') {
                this.chat_messages.push(
                  {
                    "sender": stream_part.node,
                    "content": `Node ${stream_part.node} starts streaming the answer\n`
                  }
                );
                this.chat_messages.push(
                  {
                    "sender": stream_part.node,
                    "content": ""
                  }
                );
              }
              else if (stream_part.event === 'on_chat_model_stream') {
                this.chat_messages[this.chat_messages.length - 1].content = this.chat_messages[this.chat_messages.length - 1].content + stream_part.data;
              }
              else if (stream_part.event === 'on_chat_model_end') {
                this.chat_messages.push({
                  "sender": stream_part.node,
                  "content": `Node ${stream_part.node} ended streaming the answer\n`
                });
              }

              if (isComplete) {
                this.chat_messages.push({
                  "sender": "system",
                  "content": `End of the conversation`
                });
              }
            });

          } catch (error) {
            console.error("JSON parsing error:", error);
          }
        };

        read();
      })
        .catch(error => {
          console.error('Stream error:', error);
          this.errorLLMAnswer = error?.error?.detail;
          this.loadingLLMAnswer = false;
        });
    }
  }
  extractDataFromStreamPart(data: any, node: string): string {

    switch (node) {
      case "init":
        return data.scenario_id;
      case "preprocess_question":
        return data.question_relevant_entities;
      case "select_similar_query_examples":
        return data.selected_queries;
      case "select_similar_classes":
        return data.selected_classes.join("\n");
      case "get_context_class_from_cache":
        return data.selected_classes_context.join("\n");
      case "get_context_class_from_kg":
        return data.selected_classes_context.join("\n");
      case "create_prompt":
        return data.query_generation_prompt;
      case "create_retry_prompt":
        return data.query_generation_prompt;
      case "verify_query":
        if (data.last_generated_query) {
          return data.last_generated_query;
        } else {
          return data.number_of_tries;
        }
      case "run_query":
        return data.last_query_results;

      default:
        return JSON.stringify(data);
    }
  }
}
