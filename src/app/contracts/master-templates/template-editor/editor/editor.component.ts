import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DxButtonModule, DxTabsModule, DxTabPanelModule, DxCheckBoxModule, DxTemplateModule  } from 'devextreme-angular';
import { EditorService } from './_api/editor.service';
@Component({
  standalone: true,
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  imports: [
    CommonModule,
    DxButtonModule,
    DxTabsModule,
    DxTabPanelModule,
    DxCheckBoxModule,
    DxTemplateModule,
  ],
  providers: [EditorService]
})
export class EditorComponent {
  template$ = this.editorService.getTemplate();

  constructor(private editorService: EditorService) {
    
  }

}
