import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
// Project
import { EditorService } from './_api/editor.service';
import { FileManagementService } from './services/file-management.service';
import { DownloadActions, FileActions, ToolbarService } from './services/toolbar-service';

// party
import { 
  DxButtonModule, 
  DxTabsModule, 
  DxHtmlEditorModule,
  DxDropDownButtonModule
} from 'devextreme-angular';

@Component({
  standalone: true,
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  imports: [
    CommonModule,

    // Dev-extreme
    DxButtonModule,
    DxDropDownButtonModule,
    DxTabsModule,
    DxHtmlEditorModule,

    // components
    
  ],
  providers: [
    EditorService,
    ToolbarService,
    FileManagementService
  ]
})
export class EditorComponent implements OnInit, OnDestroy {
  _destroy$ = new Subject();

  template$ = this.editorService.getTemplate();
  template = '';

  toolbars = this.toolbarService.getToolbars();
  toolbar = this.toolbars[0];
  
  selectedIndex = 0;
  tabs: string[] = [
    'File', 'Format', 'Merge Fields', 'Compare', 'View'
  ]

  constructor(
    private editorService: EditorService,
    private toolbarService: ToolbarService,
    private fileManagementService: FileManagementService
  ) {
    
  }

  ngOnInit(): void {
    this.template$.pipe(
      tap(template => this.template = template)
    ).subscribe();

    this.registerFileActions();
  }

  selectTab(event: {itemIndex: number}) {
    this.selectedIndex = event.itemIndex;
    this.toolbar = this.toolbars[this.selectedIndex];
  }

  registerFileActions() {
    this.toolbarService.toolbarActions$.pipe(
      takeUntil(this._destroy$),
      tap((res: FileActions | DownloadActions) => {
        switch (res) {
          case FileActions.PRINT:
            this.fileManagementService.print(this.template);
            break;
          case DownloadActions.SAFE_AS_PDF: 
            this.fileManagementService.exportAsPdf(this.template);
            break;
        }
      })
    ).subscribe()
  }

  ngOnDestroy(): void {
    this._destroy$.complete();
  }
}
