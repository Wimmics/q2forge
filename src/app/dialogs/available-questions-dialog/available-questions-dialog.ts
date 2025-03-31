import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { ExportedFormat } from '../../models/exported-format';
import { MatTableModule } from '@angular/material/table';
import { CompetencyQuestion } from '../../models/competency-question';
import { isQuestionsCookie, QuestionsCookie } from '../../models/cookie-items';

@Component({
  selector: 'app-available-questions-dialog',
  imports: [MatDialogModule, MatButtonModule, MatInputModule, MatIconModule, MatTableModule,
    MatSelectModule, ReactiveFormsModule, FormsModule, RouterModule, CommonModule],
  templateUrl: './available-questions-dialog.html',
  styleUrl: './available-questions-dialog.scss'
})
export class AvailableQuestionsDialog implements OnInit {

  constructor(private cookieService: CookieService) { }

  availableFormats: ExportedFormat[] = [
    { name: 'CSV', extension: 'csv' },
    { name: 'JSONL', extension: 'jsonl' },
    { name: 'XML', extension: 'xml' },
    { name: 'JSON', extension: 'json' },
  ]

  selectedFormat: ExportedFormat = this.availableFormats[0];

  questionsCookie: QuestionsCookie = {
    questions: [],
    expirationDate: ""
  }

  displayedColumns: string[] = ['question','complexity','tags', 'actions'];

  ngOnInit() {
    // Check if the cookie exists and is valid
    if (this.cookieService.check('questions')) {
      try {
        let cookie = JSON.parse(this.cookieService.get('questions'));
        if (isQuestionsCookie(cookie)) {
          this.questionsCookie = cookie;
        } else {
          this.cookieService.delete('questions');
        }
      } catch (e) {
        this.cookieService.delete('datquestionsaset');
      }
    }

  }

  exportQuestions() {

    let data = '';

    if (this.selectedFormat.name === 'CSV') {
      data = 'question,complexity,tags\n'
        + this.questionsCookie.questions.map(item => `"${item.question}","${item.complexity}","${item.tags?.join(',')}"`).join('\n');
    } else if (this.selectedFormat.name === 'JSONL') {
      data = this.questionsCookie.questions.map(item => JSON.stringify(item)).join('\n');
    }
    else if (this.selectedFormat.name === 'XML') {
      data = '<?xml version="1.0" encoding="UTF-8"?>\n<questions>\n' +
        this.questionsCookie.questions.map(item => `<item><question>${item.question}</question><complexity>${item.complexity}</complexity><tags>${item.tags?.join(',')}</tags></item>`).join('\n') +
        '\n</questions>';
    } else if (this.selectedFormat.name === 'JSON') {
      data = JSON.stringify(this.questionsCookie.questions, null, 2);
    }

    // Create a blob and download it
    const blob = new Blob([data]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "questions." + this.selectedFormat.extension;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  removeQuestion(item: CompetencyQuestion) {
    this.questionsCookie.questions.splice(this.questionsCookie.questions.indexOf(item), 1);
    this.cookieService.set('questions', JSON.stringify(this.questionsCookie), new Date(this.questionsCookie.expirationDate));
    this.questionsCookie = JSON.parse(this.cookieService.get('questions'));
  }
}
