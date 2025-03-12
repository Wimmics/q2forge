import { AfterViewInit, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QuestionAnswererConfig } from '../../models/question-answerer-config';
import { Seq2SeqModel } from '../../models/seq2seqmodel';
import { TextEmbeddingModel } from '../../models/text-embedding-model';
import { RouterModule } from '@angular/router';
import { GraphSchema } from '../../models/graph-schema';
import { ConfigManagerService } from '../../services/config-manager.service';
import { ScenarioSchemaDialog } from '../scenario-schema-dialog/scenario-schema-dialog';

@Component({
  selector: 'app-question-answerer-config-dialog',
  imports: [MatDialogModule, MatButtonModule, MatInputModule, MatIconModule, MatTooltipModule,
    MatSelectModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './question-answerer-config-dialog.html',
  styleUrl: './question-answerer-config-dialog.scss'
})
export class QuestionAnswererConfigDialog implements AfterViewInit {

  config = inject<QuestionAnswererConfig>(MAT_DIALOG_DATA);

  availableSeq2SeqModels: Seq2SeqModel[] = [];

  availableEmbeddingModels: TextEmbeddingModel[] = [];

  graphSchemas: GraphSchema[] = [];

  constructor(private configManagerService: ConfigManagerService, private dialogRef: MatDialogRef<QuestionAnswererConfigDialog>) { }

  ngAfterViewInit(): void {
    this.init_scenario_schemas();
    this.init_available_models();
  }

  init_scenario_schemas() {
    this.configManagerService.getScenariosSchema().then(response => {
      this.graphSchemas = response;
    });
  }

  init_available_models() {

    this.configManagerService.getSeq2SeqModels().then((data) => {
      this.availableSeq2SeqModels = data;
    });

    this.configManagerService.getTextEmbeddingModels().then((data) => {
      this.availableEmbeddingModels = data;
    });
  }


  readonly scenarioSchemaDialog = inject(MatDialog);

  showScenarioSchema() {
    const scenarioDialogRef = this.scenarioSchemaDialog.open(ScenarioSchemaDialog,
      {
        data: this.graphSchemas[this.config.scenario_id - 1],
        width: '95vh',
        // height: '95vh',
        maxWidth: '100vh',
        maxHeight: '100vh',
        panelClass: 'scenario-schema',
      });

    scenarioDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dialogRef.close();
      }
    });
  }

  getTextEmbeddingModelTooltip() {
    return JSON.stringify(this.availableEmbeddingModels.find(model => model.configName === this.config.text_embedding_model));
  }

  getSeq2SeqModelTooltip(node_name: string) {
    switch (node_name) {
      case 'validate_question_model':
        return JSON.stringify(this.availableSeq2SeqModels.find(model => model.configName === this.config.validate_question_model));
      case 'ask_question_model':
        return JSON.stringify(this.availableSeq2SeqModels.find(model => model.configName === this.config.ask_question_model));
      case 'generate_query_model':
        return JSON.stringify(this.availableSeq2SeqModels.find(model => model.configName === this.config.generate_query_model));
      case 'interpret_csv_query_results_model':
        return JSON.stringify(this.availableSeq2SeqModels.find(model => model.configName === this.config.interpret_csv_query_results_model));
    }
    return '';
  }

}
