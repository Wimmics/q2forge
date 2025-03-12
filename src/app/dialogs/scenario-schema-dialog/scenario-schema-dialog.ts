import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { GraphSchema } from '../../models/graph-schema';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scenario-schema-dialog',
  imports: [MatDialogModule, MatIconModule, MarkdownModule, RouterModule, MatButtonModule, CommonModule],
  templateUrl: './scenario-schema-dialog.html',
  styleUrl: './scenario-schema-dialog.scss'
})
export class ScenarioSchemaDialog {

  selectedScenario = inject<GraphSchema>(MAT_DIALOG_DATA);

  showScenarioSchema = false;

  scale: number = 1; // Default zoom level
  translate: number = 0; // Default vertical translation
  zoomIn() {
    this.scale += 0.1; // Increase zoom level
    this.translate += 50; // Increase vertical translation
  }
  
  zoomOut() {
    if (this.scale > 0.5) {
      this.scale -= 0.1; // Decrease zoom level
      this.translate -= 50; // Decrease vertical translation
    }
  }
}
