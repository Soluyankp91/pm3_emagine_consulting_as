import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { FileComponent } from './components/file/file.component';
import { EditorService } from './_api/editor.service';

// party
import { 
  DxButtonModule, 
  DxTabsModule, 
  DxTabPanelModule,
  DxCheckBoxModule, 
  DxTemplateModule,
  DxHtmlEditorModule,
  DxBoxModule
} from 'devextreme-angular';
import { FormatComponent } from './components/format/format.component';
import { tap } from 'rxjs/operators';
@Component({
  standalone: true,
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  imports: [
    CommonModule,

    // Dev-extreme
    DxButtonModule,
    DxTabsModule,
    DxTabPanelModule,
    DxCheckBoxModule,
    DxTemplateModule,
    DxHtmlEditorModule,
    DxBoxModule,

    // components
    FileComponent,
    FormatComponent
  ],
  providers: [EditorService]
})
export class EditorComponent {
  template$ = this.editorService.getTemplate();
  template = '';
  selectedIndex = 0;
  multiLine = false;
  
  tabs: string[] = [
    'File', 'Format', 'Merge Fields', 'Compare', 'View'
  ]

  constructor(private editorService: EditorService) {
    this.template$.pipe(
      tap(t => this.template = t)
    ).subscribe();
  }

  selectTab(event: {itemIndex: number}) {
    this.selectedIndex = event.itemIndex;
    this.multiLine = false;
  }
}
