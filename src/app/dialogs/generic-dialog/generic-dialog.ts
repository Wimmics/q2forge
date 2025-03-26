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
import { MarkdownComponent } from 'ngx-markdown';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generic-dialog',
  imports: [MatDialogModule, MatButtonModule, MatInputModule, MatIconModule, MatTooltipModule,
    MatSelectModule, ReactiveFormsModule, FormsModule, RouterModule, MarkdownComponent, CommonModule],
  templateUrl: './generic-dialog.html',
  styleUrl: './generic-dialog.scss'
})
export class GenericDialog{

  data = inject(MAT_DIALOG_DATA);


}
