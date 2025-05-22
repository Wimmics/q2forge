import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MarkdownComponent } from 'ngx-markdown';
import { GenerateQuestionService } from '../../services/generate-question.service';
import { JsonPipe } from '@angular/common';
import { ExtractCodeBlocksService } from '../../services/extract-code-blocks.service';
import { CompetencyQuestion, isCompetencyQuestion, isCompetencyQuestionArray } from '../../models/competency-question';
import { Router } from '@angular/router';
import { CookieManagerService } from '../../services/cookie-manager.service';
import { ConfigManagerService } from '../../services/config-manager.service';
import { Location } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Seq2SeqModel } from '../../models/seq2seqmodel';
import { AdditionalSPARQLInfoService } from '../../services/additional-sparqlinfo.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-competency-question-generation',
  imports: [
    FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatTableModule, MatFormFieldModule,
    MatChipsModule, MatIconModule, MatSlideToggleModule, MatSelectModule, MatCardModule, MatListModule, MarkdownComponent,
    JsonPipe, MatTooltipModule
  ], templateUrl: './competency-question-generation.component.html',
  styleUrl: './competency-question-generation.component.scss'
})
export class CompetencyQuestionGeneratorComponent {

  constructor(private generateQuestionService: GenerateQuestionService,
    private extractCodeBlocksService: ExtractCodeBlocksService,
    private router: Router,
    private cookieManagerService: CookieManagerService,
    private configManagerService: ConfigManagerService,
    private _formBuilder: FormBuilder,
    private location: Location,
    private dialogService: DialogService,
    private additionalSPARQLInfoService: AdditionalSPARQLInfoService) {

    this.currentConfig = this.configManagerService.getActiveConfiguration()
      .subscribe({
        next: (config: any) => {
          this.formGroup.get("endpoint")?.setValue(config.kg_sparql_endpoint_url);
          this.formGroup.get("kg_description")?.setValue(config.kg_description);
          this.formGroup.get("kg_schema")?.setValue(config.ontology_named_graphs?.join('\n'));
        },
        error: (error: any) => {
          this.dialogService.notifyUser("Error", "Error while fetching the active configuration: " + error.error.detail);
        }
      });

    this.formGroup = this._formBuilder.group({
      endpoint: ["", Validators.pattern('https?://.+')],
      kg_description: ["", Validators.required],
      kg_schema: [""],
      additional_context: [""],
      number_of_questions: [5, Validators.required],
      model_config_id: ["", Validators.required],
      enforceStructuredOutput: [true],
    })
  }


  ngAfterViewInit(): void {
    this.configManagerService.getSeq2SeqModels().then((data) => {
      this.availableSeq2SeqModels = data;
      this.formGroup.get('model_config_id')?.setValue(this.availableSeq2SeqModels[0].configName);
    });
  }

  currentConfig: any;

  formGroup: FormGroup;


  availableSeq2SeqModels: Seq2SeqModel[] = [];

  workflowDone = false;

  loading = false;
  error = '';

  errorLLMAnswer = '';
  llmAnswer = '';
  competencyQuestions: CompetencyQuestion[] = [
    // {
    //   "question": "What are the specific structural similarities between compounds classified under the CHEMINF ontology that exhibit biological activity in BioAssay experiments, categorized by disease associations in the Human Disease Ontology (DO)?",
    //   "complexity": "Advanced",
    //   "tags": ["compound", "bioassay", "ontology", "structure", "inference"]
    // },
    // {
    //   "question": "What are the most common cell lines used in BioAssay experiments for compounds classified as anti-cancer agents under the ChEBI Ontology, according to the PubChemRDF data?",
    //   "complexity": "Intermediate",
    //   "tags": ["bioassay", "cell line", "ChEBI", "compound", "classification"]
    // }
  ];


  showActivateConfigDialog() {
    this.dialogService.activateConfig()
  }
  generateQuestionWithLLM() {
    let endpoint = this.formGroup.get("endpoint")?.value;
    let kg_description = this.formGroup.get("kg_description")?.value;
    let kg_schema = this.formGroup.get("kg_schema")?.value;
    let number_of_questions = this.formGroup.get("number_of_questions")?.value;
    let additional_context = this.formGroup.get("additional_context")?.value;
    let model_config_id = this.formGroup.get("model_config_id")?.value;
    let enforceStructuredOutput: boolean = this.formGroup.get('enforceStructuredOutput')?.value

    if (kg_description) {
      this.llmAnswer = '';
      this.competencyQuestions = [];
      this.errorLLMAnswer = '';
      this.generateQuestionService.getLLMAnswer(
        model_config_id,
        number_of_questions,
        kg_description,
        kg_schema,
        additional_context,
        enforceStructuredOutput
      )
        .then(response => {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let buffer = ''; // Accumulate stream chunks

          const read = () => {
            reader?.read().then(({ done, value }) => {
              if (done) {
                // console.log('Stream complete');
                processBuffer(buffer, true); // Process any remaining valid JSON
                this.workflowDone = true;
                this.extractStructuredOutput()
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

  extractKGSchema() {
    this.additionalSPARQLInfoService.getKGVocabularies(this.formGroup.get("endpoint")?.value).subscribe({
      next: (response: any) => {
        if (response.results.bindings.length > 0) {
          let vocabularies = response.results.bindings.map((binding: any) => {
            return binding.vocabulary.value;
          });
          this.formGroup.get("kg_schema")?.setValue(vocabularies.join('\n'));
        } else {
          this.dialogService.notifyUser("Error", "No data found for the KG vocabularies");
        }
      },
      error: (error: any) => {
        this.dialogService.notifyUser("Error", "Error while fetching the KG schema: " + error.message);
      }
    })

    this.additionalSPARQLInfoService.getKGDescriptions(this.formGroup.get("endpoint")?.value).subscribe({
      next: (response: any) => {
        if (response.results.bindings.length > 0) {
          let descriptions = response.results.bindings.map((binding: any) => {
            return binding.dataset.value + " => " + binding.description.value;
          });
          this.formGroup.get("kg_description")?.setValue(descriptions.join('\n'));
        } else {
          this.dialogService.notifyUser("Error", "No data found for the KG descriptions");
        }
      },
      error: (error: any) => {
        this.dialogService.notifyUser("Error", "Error while fetching the KG descriptions: " + error.message);
      }
    })
  }

  reset() {
    // this.dataSource = [];
    // this.query.setValue(this.model.query);
    this.formGroup.reset();
    // this.endpoint.setValue(this.model.endpoint);
    // this.kgDescription.setValue(this.model.kg_description);
    // this.kgSchema.setValue(this.model.kg_schema);
    // this.additionalContext.setValue(this.model.additional_context);
    this.loading = false;
    this.error = '';
    // this.properties.set([...this.defaultProperties]);
    // this.loadingLLMAnswer = false;
    this.llmAnswer = '';
    this.competencyQuestions = [];
    this.workflowDone = false;
  }

  downloadResults(): void {
    const blob = new Blob([this.llmAnswer]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "generated_questions.";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  downloadStructuredResults(): void {
    const blob = new Blob([JSON.stringify(this.competencyQuestions)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "generated_questions.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  addQuestionsToCookies() {
    this.cookieManagerService.addQuestionsToCookies(this.competencyQuestions);
    let url = this.router.createUrlTree(['sparql-query-generator']).toString();
    url = this.location.prepareExternalUrl(url); // adds base href
    window.open(url, '_blank');
  }

  extractStructuredOutput() {
    if (this.llmAnswer) {
      try {
        let jsonBlocks = this.extractCodeBlocksService.findJsonBlocks(this.llmAnswer);
        let obj;
        if (jsonBlocks.length > 0) {
          obj = JSON.parse(jsonBlocks[0]);
        } else {
          obj = JSON.parse(this.llmAnswer);
        }

        if (isCompetencyQuestion(obj)) {
          this.competencyQuestions = [obj];
        } else if (isCompetencyQuestionArray(obj)) {
          this.competencyQuestions = obj;
        }

      } catch (error) {
        console.error('No JSON found in the generated output');
      }
    }
  }

}
