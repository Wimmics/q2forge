import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AVAILABLE_LLM_MODELS, DEFAULT_JUDGE_QUESTION } from '../services/predefined-variables';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { AnswerQuestionService } from '../services/answer-question.service';
import { MatSelectModule } from '@angular/material/select';
import { MarkdownComponent } from 'ngx-markdown';
import { JsonPipe } from '@angular/common';
import { ChatMessage } from '../models/chat-message';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { GraphSchema } from '../models/graph-schema';
import { ConfigManagerService } from '../services/config-manager.service';
import { Seq2SeqModel } from '../models/seq2seqmodel';
import { TextEmbeddingModel } from '../models/text-embedding-model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-question-answerer',
  imports: [MatInputModule, MatIconModule, ReactiveFormsModule, MatButtonModule, MatSelectModule, MarkdownComponent, FormsModule,
    JsonPipe, MatTooltipModule, MatExpansionModule, RouterModule],
  templateUrl: './question-answerer.component.html',
  styleUrl: './question-answerer.component.scss'
})
export class QuestionAnswererComponent implements OnInit, AfterViewInit {

  model = {
    question: DEFAULT_JUDGE_QUESTION
  }

  question_fc = new FormControl(this.model.question, [
    Validators.required,
  ]);

  workflowRunning = false;
  errorLLMAnswer = '';

  availableSeq2SeqModels: Seq2SeqModel[] = [];
  selectedSeq2SeqModel!: Seq2SeqModel;

  availableEmbeddingModels: TextEmbeddingModel[] = [];
  selectedEmbeddingModel!: TextEmbeddingModel;

  chat_messages: ChatMessage[] = [
    // {
    //   "sender": "user",
    //   "content": "What is the name of the person?"
    // },
    // {
    //   "sender": "init",
    //   "content": "I 🐢 ngx-markdown"
    // },
    // {
    //   "sender": "system",
    //   "content": "```turtle\n@prefix ex: <http://example.org/>\n@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n\nex:John rdf:type ex:Person .\n```"
    // }
  ];

  constructor(private answerQuestionService: AnswerQuestionService,
    private configManagerService: ConfigManagerService) {
  }

  ngOnInit(): void {
    this.init_scenario_schemas();
  }

  ngAfterViewInit(): void {
    this.init_available_models();
  }

  ask_question() {
    if (this.question_fc.value) {
      this.workflowRunning = true;
      this.errorLLMAnswer = '';
      this.chat_messages.push(
        {
          "sender": "user",
          "content": this.question_fc.value
        }
      )
      this.answerQuestionService.answer_question(
        this.selectedSeq2SeqModel,
        this.selectedEmbeddingModel,
        this.selectedScenario.scenario_id,
        this.question_fc.value!,
      ).then(response => {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = ''; // Accumulate stream chunks

        const read = () => {
          reader?.read().then(({ done, value }) => {
            if (done) {
              // console.log('Stream complete');
              processBuffer(buffer, true); // Process any remaining valid JSON
              this.workflowRunning = false;
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
                let content = this.extractDataFromStreamPart(stream_part.data, stream_part.node);
                if (content.length > 0) {
                  this.chat_messages.push(
                    {
                      "sender": stream_part.node,
                      "content": content
                    }
                  );
                }
              }
              else if (stream_part.event === 'on_chat_model_start') {
                this.chat_messages.push(
                  {
                    "sender": stream_part.node,
                    "content": `The answer from the model will be streamed soon ...\n`
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
                  "content": `The streaming of the response ended.\n`
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
          this.workflowRunning = false;
        });
    }
  }

  graphSchemas: GraphSchema[] | undefined;
  selectedScenario!: GraphSchema;

  isScenarioButtonHovered = false;

  init_scenario_schemas() {
    this.configManagerService.getScenariosSchema().then(response => {
      this.graphSchemas = response;
      this.selectedScenario = response[5];
    });
  }

  init_available_models() {

    this.configManagerService.getSeq2SeqModels().then((data) => {
      this.availableSeq2SeqModels = data;
      this.selectedSeq2SeqModel = this.availableSeq2SeqModels[0];
    });

    this.configManagerService.getTextEmbeddingModels().then((data) => {
      this.availableEmbeddingModels = data;
      this.selectedEmbeddingModel = this.availableEmbeddingModels[0];
    });
  }

  showHideSchemaDiv() {
    this.isScenarioButtonHovered = !this.isScenarioButtonHovered;
  }

  hideSchemaDiv() {
    this.isScenarioButtonHovered = false;
  }

  extractDataFromStreamPart(data: any, node: string): string {

    switch (node) {
      case "init":
        return "**Using the scenario:** " + data.scenario_id + ".";
      case "preprocess_question":
        return "**The relevant entities in the question:**\n" + data.question_relevant_entities.split(',').map((item: string) => `* ${item}.`).join("\n");
      case "select_similar_query_examples":
        return "**The relevant found SPARQL query examples:**\n" + data.selected_queries;
      case "select_similar_classes":
        return "**The relevant retrieved classes with their label and description in the question:**\n" + data.selected_classes.map((item: string) => `* ${item}.`).join("\n")
      case "get_context_class_from_cache":
      case "get_context_class_from_kg": {
        let content = data.selected_classes_context[0].trim() as string;
        if (content.length != 0) {
          return "**The following class context was retrieved from the cache:**\n" + "```turtle\n" + data.selected_classes_context[0] + "\n```";
        } else
          return "";
      }
      case "create_prompt":
        return "**The following prompt would be use to generate the SPARQL query:**\n" + data.query_generation_prompt;
      case "create_retry_prompt":
        return "**The following prompt would be use to generate the SPARQL query:**\n" + data.query_generation_prompt;
      case "verify_query":
        if (data.last_generated_query) {
          return "**We will verify the following query:**\n" + "```sparql\n" + data.last_generated_query + "\n```";
        } else {
          return "**The number of tries up to now:** " + data.number_of_tries;
        }
      case "run_query":
        return this.csvToMarkdown(data.last_query_results);

      default:
        return JSON.stringify(data);
    }
  }

  csvToMarkdown(csv: string): string {
    const rows = csv.trim().split("\r\n").map(row => row.split(","));

    if (rows.length < 2) {
      // throw new Error("CSV must have at least a header and one row of data.");
      return "**After running the query we obtained an empty result 🫢**\n";
    }

    const header = `| ${rows[0].join(" | ")} |`;
    const separator = `| ${rows[0].map(() => "---").join(" | ")} |`;
    const dataRows = rows.slice(1).map(row => `| ${row.join(" | ")} |`);

    return "**After running the query we obtained the following results:**\n" + [header, separator, ...dataRows].join("\n");
  }

  stop_wrkflow() {

  }


}
