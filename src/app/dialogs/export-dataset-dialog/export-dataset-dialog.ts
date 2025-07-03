import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';
import { CommonModule } from '@angular/common';
import { DataSetCookie, DataSetItem, isDataSetCookie } from '../../models/cookie-items';
import { ExportedFormat } from '../../models/exported-format';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-export-dataset-dialog',
  imports: [MatDialogModule, MatButtonModule, MatInputModule, MatIconModule, MatTableModule,
    MatSelectModule, ReactiveFormsModule, FormsModule, RouterModule, MarkdownComponent, CommonModule],
  templateUrl: './export-dataset-dialog.html',
  styleUrl: './export-dataset-dialog.scss'
})
export class ExportDatasetDialog implements OnInit {

  constructor() { }

  availableFormats: ExportedFormat[] = [
    { name: 'CSV', extension: 'csv' },
    { name: 'JSONL', extension: 'jsonl' },
    { name: 'XML', extension: 'xml' },
    { name: 'JSON', extension: 'json' },
  ]

  selectedFormat: ExportedFormat = this.availableFormats[0];

  datasetCookie: DataSetCookie = {
    dataset: [],
    expirationDate: ""
  }

  displayedColumns: string[] = ['question', 'query', 'actions'];

  ngOnInit() {
    
    let datasetString = localStorage.getItem('dataset');

    if (datasetString) {
      try {
        let cookie = JSON.parse(datasetString);
        if (isDataSetCookie(cookie)) {
          this.datasetCookie = cookie;
        } else {
          localStorage.removeItem('dataset');
        }
      } catch (e) {
        localStorage.removeItem('dataset');
      }
    }

  }

  exportDataset() {

    let data = '';

    if (this.selectedFormat.name === 'CSV') {
      data = 'question,query\n'
        + this.datasetCookie.dataset.map(item => `"${item.question}","${item.query}"`).join('\n');
    } else if (this.selectedFormat.name === 'JSONL') {
      data = this.datasetCookie.dataset.map(item => JSON.stringify(item)).join('\n');
    }
    else if (this.selectedFormat.name === 'XML') {
      data = '<?xml version="1.0" encoding="UTF-8"?>\n<dataset>\n' +
        this.datasetCookie.dataset.map(item => `<item><question>${item.question}</question><query>${item.query}</query></item>`).join('\n') +
        '\n</dataset>';
    } else if (this.selectedFormat.name === 'JSON') {
      data = JSON.stringify(this.datasetCookie.dataset, null, 2);
    }

    // Create a blob and download it
    const blob = new Blob([data]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "dataset." + this.selectedFormat.extension;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  removeDatasetItem(item: DataSetItem) {
    this.datasetCookie.dataset.splice(this.datasetCookie.dataset.indexOf(item), 1);
    localStorage.setItem('dataset', JSON.stringify(this.datasetCookie));
  }
}
