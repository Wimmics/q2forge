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

@Component({
  selector: 'app-question-answerer',
  imports: [MatInputModule, MatIconModule, ReactiveFormsModule, MatButtonModule, MatSelectModule, MarkdownComponent, FormsModule, JsonPipe],
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

  chat_messages: string[] = [];

  constructor(private answerQuestionService: AnswerQuestionService) { }

  ask_question() {
    if (this.question_fc.value) {
      this.loadingLLMAnswer = true;
      this.errorLLMAnswer = '';
      this.chat_messages.push(this.question_fc.value)
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
              processBuffer(buffer); // Process any remaining valid JSON
              return;
            }

            buffer += decoder.decode(value, { stream: true }); // Append streamed data

            processBuffer(buffer); // Try parsing valid JSON objects

            read();
          });
        };

        const processBuffer = (data: any) => {
          try {
            let jsonObjects = [];
            let startIdx = 0;

            while (startIdx < data.length) {
              let openBraces = 0;
              let closeBraces = 0;
              let jsonStart = -1;
              let jsonEnd = -1;

              for (let i = startIdx; i < data.length; i++) {
                if (data[i] === '{') {
                  if (jsonStart === -1) jsonStart = i;
                  openBraces++;
                }
                if (data[i] === '}') {
                  closeBraces++;
                }

                if (openBraces > 0 && openBraces === closeBraces) {
                  jsonEnd = i + 1;
                  break;
                }
              }

              if (jsonStart !== -1 && jsonEnd !== -1) {
                try {
                  let jsonChunk = data.substring(jsonStart, jsonEnd);
                  let parsedJson = JSON.parse(jsonChunk);
                  jsonObjects.push(parsedJson);
                  startIdx = jsonEnd; // Move to the next potential JSON object
                } catch (error) {
                  // Incomplete JSON, keep accumulating
                  break;
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
                this.chat_messages.push(JSON.stringify(stream_part.data));
              }
              else if (stream_part.event === 'on_chat_model_start') {
                this.chat_messages.push(`Node ${stream_part.node} starts streaming the answer\n`);
                this.chat_messages.push("");
              }
              else if (stream_part.event === 'on_chat_model_stream') {
                this.chat_messages[this.chat_messages.length - 1] = this.chat_messages[this.chat_messages.length - 1] + stream_part.data;
              }
              else if (stream_part.event === 'on_chat_model_end') {
                this.chat_messages.push(`Node ${stream_part.node} ended streaming the answer\n`);
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
}
