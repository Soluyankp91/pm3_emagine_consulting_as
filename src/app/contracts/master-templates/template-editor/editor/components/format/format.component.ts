import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

import { DxButtonModule, DxHtmlEditorModule } from 'devextreme-angular';
@Component({
  standalone: true,
  selector: 'app-format',
  templateUrl: './format.component.html',
  styleUrls: ['./format.component.scss'],
  imports: [
    CommonModule,
    DxHtmlEditorModule,
    DxButtonModule
  ]
})
export class FormatComponent implements OnInit {
  @Input() template = '';
  constructor() { }

  ngOnInit(): void {
  }

}
