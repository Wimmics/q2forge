import { Component, OnInit } from '@angular/core';
import { DOCUMENTATION_URI } from '../../services/predefined-variables';

@Component({
  selector: 'app-external-redirect',
  template: ''
})
export class DocumentationComponent implements OnInit {
  ngOnInit() {
    window.location.href = DOCUMENTATION_URI;
  }
}