import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { ADDITIONAL_CONTEXT, AVAILABLE_LLM_MODELS, DEFAULT_JUDGE_QUESTION, KG_DESCRIPTION, KG_SCHEMA, llm_generation_answer, NUMBER_OF_QUESTIONS_TO_GENERATE, SPARQL_ENDPOINT_URI } from '../services/predefined-variables';
import { LLMModel } from '../models/llmmodel';
import { GenerateQuestionService } from '../services/generate-question.service';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-question-generator',
  imports: [
    FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatButtonModule, MatTableModule, MatFormFieldModule,
    MatChipsModule, MatIconModule, MatSlideToggleModule, MatSelectModule, MatCardModule, MatListModule, MarkdownComponent,
    JsonPipe
  ], templateUrl: './question-generator.component.html',
  styleUrl: './question-generator.component.scss'
})
export class QuestionGeneratorComponent {

  constructor(private generateQuestionService: GenerateQuestionService) { }

  model = {
    endpoint: SPARQL_ENDPOINT_URI,
    question: DEFAULT_JUDGE_QUESTION,
    kg_description: KG_DESCRIPTION,
    kg_schema: KG_SCHEMA,
    additional_context: ADDITIONAL_CONTEXT,
    number_of_questions: NUMBER_OF_QUESTIONS_TO_GENERATE,
  }

  endpoint = new FormControl(this.model.endpoint, [
    Validators.required,
    Validators.pattern(/^(https?):\/\/[^\s/$.?#].[^\s]*$/i)
  ]);
  kgDescription = new FormControl(this.model.kg_description, [
    Validators.required,
  ])
  kgSchema = new FormControl(this.model.kg_schema)
  additionalContext = new FormControl(this.model.additional_context)
  number_of_questions_fc = new FormControl(this.model.number_of_questions, [Validators.required, Validators.min(1), Validators.max(100)]);
  enforceStructuredOutput = new FormControl(false);

  loading = false;
  error = '';

  loadingLLMAnswer = false;
  errorLLMAnswer = '';
  llmAnswer = '';

  availableLLMModels: LLMModel[] = AVAILABLE_LLM_MODELS;
  selectedLLM = this.availableLLMModels[0];

  generateQuestionWithLLM() {
    if (this.kgDescription.value && this.kgDescription.value) {
      this.loadingLLMAnswer = true;
      this.llmAnswer = '';
      this.errorLLMAnswer = '';
      this.generateQuestionService.getLLMAnswer(
        this.selectedLLM,
        this.number_of_questions_fc.value!,
        this.kgDescription.value,
        this.kgSchema.value ? this.kgSchema.value : "No schema provided",
        this.additionalContext.value ? this.additionalContext.value : "No additional context provided",
        this.enforceStructuredOutput.value ? this.enforceStructuredOutput.value : false
      ).
        subscribe((answer) => {
          this.llmAnswer = answer.result;
          this.loadingLLMAnswer = false;
        }, (error) => {
          this.errorLLMAnswer = error?.error?.detail
          this.loadingLLMAnswer = false;
        })
    }
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  sampleSchema() {

  }

  reset() {
    // this.dataSource = [];
    // this.query.setValue(this.model.query);
    this.endpoint.setValue(this.model.endpoint);
    this.kgDescription.setValue(this.model.kg_description);
    this.kgSchema.setValue(this.model.kg_schema);
    this.additionalContext.setValue(this.model.additional_context);
    this.loading = false;
    this.error = '';
    // this.properties.set([...this.defaultProperties]);
    this.loadingLLMAnswer = false;
    this.llmAnswer = '';
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
}
