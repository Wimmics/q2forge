import { Component, inject, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ExtractedData, SPARQLPartInfo } from './../models/extraction';
// import { JsonPipe } from '@angular/common';
import { SPARQLQNExtractorService } from './../services/sparqlqnextractor.service';
import { AdditionalSPARQLInfoService } from '../services/additional-sparqlinfo.service';
import { LLMJudgeService } from '../services/llmjudge.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { LLMModel } from '../models/llmmodel';
import { MarkdownComponent } from 'ngx-markdown';
import { DEFAULT_SPARQL_JUDGE_QUERY, KNOWN_PREFIXES, AVAILABLE_LLM_MODELS, SPARQL_ENDPOINT_URI, DEFAULT_JUDGE_QUESTION } from '../services/predefined-variables';


@Component({
  selector: 'app-sparqljudge',
  imports: [
    FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatTableModule, MatFormFieldModule,
    MatChipsModule, MatIconModule, MatSlideToggleModule, MatSelectModule, MatCardModule, MatListModule, MarkdownComponent,
    // JsonPipe
  ],
  templateUrl: './sparqljudge.component.html',
  styleUrl: './sparqljudge.component.scss'
})
export class SPARQLJudgeComponent {

  displayedColumns: string[] = ['uri', 'info'];
  dataSource: SPARQLPartInfo[] = [];

  loading: boolean = false;
  error: string = '';

  constructor(private sparqlExtractorQNService: SPARQLQNExtractorService,
    private additionalSPARQLInfoService: AdditionalSPARQLInfoService,
    private llmJudgeService: LLMJudgeService) { }

  model = {
    endpoint: SPARQL_ENDPOINT_URI,
    question: DEFAULT_JUDGE_QUESTION,
    query: DEFAULT_SPARQL_JUDGE_QUERY,
  }

  knownPrefixeds = KNOWN_PREFIXES;

  endpoint = new FormControl(this.model.endpoint,
    [
      Validators.required,
      Validators.pattern(/^(https?):\/\/[^\s/$.?#].[^\s]*$/i)
    ]);
  query = new FormControl(this.model.query);
  question = new FormControl(this.model.question);

  parsedData: ExtractedData | undefined;

  displayAllInfo = new FormControl(false);

  getQandFQNames() {
    if (this.query.value) {
      try {

        this.parsedData = this.sparqlExtractorQNService.parseQuery(this.query.value);
        this.dataSource = [];
        for (let qname of this.parsedData.qnames) {
          this.dataSource.push({ uri: qname });
        }
        this.error = "";
      } catch (error) {
        this.error = `${error}`;
      }
    }
  }

  addKnownPrefixes() {
    this.query.setValue(this.knownPrefixeds + "\n" + this.query.value);
  }

  getQandFQNamesInfo() {
    if (this.endpoint.value) {
      this.loading = true;
      for (let item of this.dataSource) {
        const ppts = this.properties()
        this.additionalSPARQLInfoService.getPropertyDetails(item.uri, this.endpoint.value, ppts).subscribe(
          (response) => {
            this.loading = false;
            if (response.results.bindings.length > 0) {
              item.info = [];
              const result = response.results.bindings[0];
              if (this.displayAllInfo.value) {
                for (let index = 0; index < ppts.length; index++) {
                  let line = [`${ppts[index]}`, (result[`p${index}`] ? result[`p${index}`]["value"] : 'No data found')];
                  item.info.push(line);
                }
              } else {
                for (let index = 0; index < ppts.length; index++) {
                  if (result[`p${index}`]) {
                    let line = [`${ppts[index]}`, result[`p${index}`]["value"]];
                    item.info.push(line);
                  }
                }
              }
              this.error = '';
            } else {
              this.error = 'No data found For :' + item.uri;
            }
          },
          (error) => {
            this.loading = false;
            this.error = 'Error fetching data from SPARQL endpoint';
          }
        );
      }
    }
  }

  reset() {
    this.dataSource = [];
    this.query.setValue(this.model.query);
    this.endpoint.setValue(this.model.endpoint);
    this.loading = false;
    this.error = '';
    this.properties.set([...this.defaultProperties]);
    this.llmAnswer = '';
  }

  readonly addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly defaultProperties: string[] = ['rdfs:label', 'rdfs:comment', 'dcterms:description', 'obo:IAO_0000115'];
  readonly announcer = inject(LiveAnnouncer);
  properties = signal<string[]>([...this.defaultProperties]);

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.properties.update(properties => [...properties, value]);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(property: string): void {
    this.properties.update(properties => {
      const index = properties.indexOf(property);
      if (index < 0) {
        return properties;
      }

      properties.splice(index, 1);
      this.announcer.announce(`Removed ${property}`);
      return [...properties];
    });
  }

  edit(property: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove fruit if it no longer has a name
    if (!value) {
      this.remove(property);
      return;
    }

    // Edit existing fruit
    this.properties.update(properties => {
      const index = properties.indexOf(property);
      if (index >= 0) {
        properties[index] = value;
        return [...properties];
      }
      return properties;
    });
  }


  availableLLMModels: LLMModel[] = AVAILABLE_LLM_MODELS;
  selectedLLM = this.availableLLMModels[0];
  llmAnswer!: string;
  errorLLMAnswer: string = '';
  getLLMasJudgeAnswer() {
    if (this.question.value && this.query.value) {
      this.llmAnswer = '';
      this.errorLLMAnswer = '';
      this.llmJudgeService.getLLMAnswer(this.selectedLLM, this.question.value, this.query.value, this.dataSource)
        .then(response => {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let buffer = ''; // Accumulate stream chunks

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
                      parsedJson.hasOwnProperty('event')) {
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

                if (stream_part.event === 'on_chat_model_start') {
                  this.llmAnswer = `The answer from the model will be streamed soon ... \n\n`;
                }
                else if (stream_part.event === 'on_chat_model_stream') {
                  this.llmAnswer += stream_part.data;
                }
                else if (stream_part.event === 'on_chat_model_end') {
                  this.llmAnswer += `\nThe streaming of the response ended.\n`;
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
        });
    }
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
