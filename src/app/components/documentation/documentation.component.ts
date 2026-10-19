import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DOCUMENTATION_URI } from '../../services/predefined-variables';

@Component({
  selector: 'app-external-redirect',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: ''
})
export class DocumentationComponent implements OnInit {
  ngOnInit() {
    window.location.href = DOCUMENTATION_URI;
  }
}