import { Component, inject, OnInit, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { AnswerQuestionService } from '../../services/answer-question.service';
import { MatSelectModule } from '@angular/material/select';
import { MarkdownComponent } from 'ngx-markdown';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChatMessage, SPARQLChatMessages } from '../../models/chat-message';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDropzone } from '@ngx-dropzone/material';
import { MatDialog } from '@angular/material/dialog';
import { QuestionAnswererConfigDialog } from '../../dialogs/question-answerer-config-dialog/question-answerer-config-dialog';
import { QuestionAnswererConfig } from '../../models/question-answerer-config';
import { toStringMarkdown } from '../../models/judge-state';
import { map, Observable, startWith } from 'rxjs';
import { MatChipRow } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FileInputDirective, FileInputValidators } from '@ngx-dropzone/cdk';
import { isCompetencyQuestion, isCompetencyQuestionArray } from '../../models/competency-question';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ExtractCodeBlocksService } from '../../services/extract-code-blocks.service';
import { DialogService } from '../../services/dialog.service';
import { isQuestionsCookie } from '../../models/cookie-items';
import { LocalStorageManagerService } from '../../services/localstorage-manager.service';
import { DEFAULT_ANSWER_QUESTION } from '../../services/predefined-variables-commun';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user-data';

@Component({
  selector: 'app-sparql-query-generator-executor',
  imports: [
    MatInputModule, MatIconModule, ReactiveFormsModule, MatButtonModule, MatSelectModule, MarkdownComponent,
    FormsModule, JsonPipe, MatTooltipModule, MatExpansionModule, RouterModule, MatAutocompleteModule, AsyncPipe,
    MatDropzone, MatChipRow, ReactiveFormsModule, MatSlideToggleModule, MatFormFieldModule, MatInputModule,
    MatChipsModule, MatIconModule, FileInputDirective, MatProgressSpinnerModule
  ],
  templateUrl: './sparql-query-generator-executor.component.html',
  styleUrl: './sparql-query-generator-executor.component.scss'
})
export class SPARQLQueryGeneratorExecutorComponent implements OnInit {

  model = {
    question: ""
  }

  question_fc = new FormControl(this.model.question, [
    Validators.required,
  ]);

  workflowRunning = false;
  errorLLMAnswer = '';

  chat_messages: ChatMessage[] = [];
  chat_id: string = ''

  expandAllMessages = true;

  questionExample = DEFAULT_ANSWER_QUESTION;

  activeConfig = signal(false)

  constructor(private answerQuestionService: AnswerQuestionService,
    private extractCodeBlocksService: ExtractCodeBlocksService,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private userService: UserService,
    private localStorageManagerService: LocalStorageManagerService) {
  }

  showActivateConfigDialog() {
    this.dialogService.activateConfig()
  }

  ask_question() {
    if (this.question_fc.value && this.currentConfig) {

      this.chat_id = crypto.randomUUID()

      this.workflowRunning = true;
      this.errorLLMAnswer = '';
      this.chat_messages.push(
        {
          "sender": "user",
          "content": this.question_fc.value,
          "eventType": "user_message"
        }
      )
      this.answerQuestionService.answer_question(
        this.currentConfig,
        this.question_fc.value!,
      ).then(response => {
        if (response.status === 403) {
          this.dialogService.notifyUser('403 Forbidden', "You don't have the quota to do this operation");
        }
        else if (!response.ok) {
          this.dialogService.notifyUser('Error', "An error occurred while answering the questions: " + response.statusText);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = ''; // Accumulate stream chunks

        const read = () => {
          reader?.read().then(({ done, value }) => {
            if (done) {
              // console.log('Stream complete');
              processBuffer(buffer, true); // Process any remaining valid JSON
              this.workflowRunning = false;
              this.chat_messages.push({
                "sender": "system",
                "content": `End of the conversation`,
                "eventType": "end_of_conversation"
              });
              this.checkLlmMessagesWithSPARQLCodeBlock();
              this.updateUserSPARQLChats();
              return;
            }

            buffer += decoder.decode(value, { stream: true }); // Append streamed data

            // console.log('Buffer:', buffer);
            processBuffer(buffer, false); // Try parsing valid JSON objects

            read();
          });
        };

        const processBuffer = (data: any, isComplete: boolean) => {
          // console.log(data);
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
                      "content": content,
                      "eventType": stream_part.event
                    }
                  );
                }
              }
              else if (stream_part.event === 'on_chat_model_start') {
                this.chat_messages.push(
                  {
                    "sender": stream_part.node,
                    "content": `The answer from the model will be streamed soon ...\n`,
                    "eventType": stream_part.event
                  }
                );
                this.chat_messages.push(
                  {
                    "sender": stream_part.node,
                    "content": "",
                    "eventType": "on_chat_model_stream"
                  }
                );
              }
              else if (stream_part.event === 'on_chat_model_stream') {
                this.chat_messages[this.chat_messages.length - 1].content = this.chat_messages[this.chat_messages.length - 1].content + stream_part.data;
              }
              else if (stream_part.event === 'on_chat_model_end') {
                this.chat_messages.push({
                  "sender": stream_part.node,
                  "content": `The streaming of the response ended.\n`,
                  "eventType": stream_part.event
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
  updateUserSPARQLChats() {
    this.userService.addASPARQLChat(this.chat_id, this.chat_messages).subscribe({
      error: (error: any) => {
        this.dialogService.notifyUser("SPARQL Chat", "Error in updating the chat: " + error?.error?.detail);
      }
    });
  }

  extractDataFromStreamPart(data: any, node: string): string {

    switch (node) {
      case "init":
        return "**Using the scenario:** " + data.scenario_id + ".";
      case "preprocess_question":
        return "**The relevant entities in the question:**\n" + data.question_relevant_entities.map((item: string) => `* ${item}.`).join("\n");
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
          return "**The number of tries up to now:** " + data.number_of_tries + "\n\n";
        }
      case "run_query":
        return this.csvToMarkdown(data.last_query_results);

      case "validate_sparql_syntax":
        return "**The number of tries up to now:** " + data.number_of_tries + "\n\n " + toStringMarkdown(data.query_judgements.at(-1));
      case "extract_query_qnames":
        return toStringMarkdown(data.query_judgements.at(-1));
      case "find_qnames_info":
        return toStringMarkdown(data.query_judgements.at(-1));
      case "judge_regeneration_prompt":
        return toStringMarkdown(data.query_judgements.at(-1));


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

  readonly questionAnswererConfigDialog = inject(MatDialog);

  currentConfig: QuestionAnswererConfig = {
    scenario_id: "1",
    text_embedding_model: "nomic-embed-text_faiss@local",
    ask_question_model: "gemma-3_4b@local",
    validate_question_model: "gemma-3_4b@local",
    generate_query_model: "gemma-3_4b@local",
    judge_query_model: "gemma-3_4b@local",
    judge_regenerate_query_model: "gemma-3_4b@local",
    interpret_results_model: "gemma-3_4b@local"
  };

  setConfiguration() {
    const dialogRef = this.questionAnswererConfigDialog.open(QuestionAnswererConfigDialog,
      {
        data: this.currentConfig,
        maxWidth: '95vw',
        width: '1900px',
      });

    dialogRef.afterOpened().subscribe(result => {
      this.fixMermaidGraphTextBug();
    });
  }

  fixMermaidGraphTextBug() {
    let old_scenario_id = this.currentConfig.scenario_id;
    this.currentConfig.scenario_id = "2";
    setTimeout(() => { this.currentConfig.scenario_id = old_scenario_id; }, 5);
  }


  filteredQuestionOptions!: Observable<string[]>;

  ngOnInit() {
    this.filteredQuestionOptions = this.question_fc.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );

    this.setQuestionsFromCookie();

    this.route.queryParamMap.subscribe(params => {
      const chatId = params.get('chat_id');
      if (chatId) {
        this.chat_id = chatId
        this.userService.getUserDataSub().subscribe((user: User) => {
          this.chat_messages = user.sparql_chats?.find((chat) => chat._id === chatId)?.messages || [];
        });

        this.userService.getUserData();
      } else {
        this.chat_messages = [];
      }

    });

    this.userService.getUserDataSub().subscribe((user: User) => {
      if (user.active_config_id) {
        this.activeConfig.set(true)
      } else {
        this.activeConfig.set(false)
      }
    });
    this.userService.getUserData()

  }

  setQuestionsFromCookie() {

    this.uploaded_questions = []

    let questionsString = localStorage.getItem('questions')
    if (questionsString) {
      try {
        let cookie = JSON.parse(questionsString);
        if (isQuestionsCookie(cookie)) {
          this.uploaded_questions.push(...cookie.questions.map((q) => q.question).filter((q) => !this.uploaded_questions.includes(q)))
        } else {
          localStorage.removeItem('questions');
        }
      } catch (e) {
        localStorage.removeItem('questions');
      }
    }
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.uploaded_questions.filter(option => option.toLowerCase().includes(filterValue));
  }

  onQuestionOptionSelected(event: any) {
    this.question_fc.setValue(event.option.value);
  }

  addCustomQuestion() {
    if (this.question_fc.value) {
      const inputValue = this.question_fc.value.trim();
      if (inputValue && !this.uploaded_questions.includes(inputValue)) {
        this.uploaded_questions.push(inputValue); // Add custom input to list
      }
    }
  }

  filesCtrl: FormControl = new FormControl<File[]>([], [
    FileInputValidators.accept("application/json"),
    Validators.required
  ]);

  get questionFiles() {
    const _files = this.filesCtrl.value;

    if (!_files) return [];
    return Array.isArray(_files) ? _files : [_files];
  }

  remove(file: File) {
    if (Array.isArray(this.filesCtrl.value)) {
      this.filesCtrl.setValue(this.filesCtrl.value.filter((i) => i !== file));
      return;
    }

    this.filesCtrl.setValue(null);
  }

  uploaded_questions: string[] = []

  uploadQuestions() {
    this.questionFiles.forEach((file) => {
      file.text().then((text: any) => {
        let updated = false
        try {
          let obj = JSON.parse(text)
          if (isCompetencyQuestion(obj) && !this.uploaded_questions.includes(obj.question)) {
            updated = true
            this.localStorageManagerService.addQuestionsToLocalStorage([obj]);
            this.setQuestionsFromCookie();
          }
          else if (isCompetencyQuestionArray(obj)) {
            updated = true
            this.localStorageManagerService.addQuestionsToLocalStorage(obj);
            this.setQuestionsFromCookie();
          } else {
            this.dialogService.notifyUser("Questions upload", `Invalid JSON format`)
          }
        } catch (error) {
          this.dialogService.notifyUser("Questions upload", `Error in parsing JSON ${error}`)
        }
        if (updated) {
          this.dialogService.checkCurrentQuestions();
        }
      });
    });
  }

  checkLlmMessagesWithSPARQLCodeBlock(): void {
    let lastSeenAskedQuestion = "";
    for (let message of this.chat_messages) {
      if (message.eventType === "on_chat_model_stream") {
        let sparqlCodeBlocks = this.extractCodeBlocksService.findSPARQLBlocks(message.content);
        if (sparqlCodeBlocks.length > 0) {
          message.queryToRefine = sparqlCodeBlocks[0];
          message.questionOfTheQueryToRefine = lastSeenAskedQuestion;
        }
      } else if (message.eventType === "user_message") {
        lastSeenAskedQuestion = message.content;
      }
    }
  }

  checkCurrentQuestions() {
    this.dialogService.checkCurrentQuestions();
  }
}
