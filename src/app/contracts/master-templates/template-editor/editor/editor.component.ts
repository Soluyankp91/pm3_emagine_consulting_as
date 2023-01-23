import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
// Project
import { EditorService } from './_api/editor.service';
import { FileManagementService } from './services/file-management.service';
import { 
  DownloadActions, 
  FileActions, 
  FileToolbarService,
  FormatToolbarService,
  MergeFieldsActions,
  MergeFieldsToolbarService
} from './services/toolbar';


// party
import { 
  DxButtonModule, 
  DxTabsModule, 
  DxHtmlEditorModule,
  DxDropDownButtonModule,
  DxHtmlEditorComponent,
  DxPopupModule,
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
    DxPopupModule,
    DxHtmlEditorModule,

    // components
    
  ],
  providers: [
    EditorService,
    // toolbar
    FileToolbarService,
    FormatToolbarService,
    MergeFieldsToolbarService,

    FileManagementService
  ]
})
export class EditorComponent implements OnInit, OnDestroy {
  _destroy$ = new Subject();

  @ViewChild(DxHtmlEditorComponent, { static: false }) htmlEditor: DxHtmlEditorComponent;
  liveTextpopupVisible: boolean;

  template$ = this.editorService.getTemplate();
  template = '';

  toolbars = [
    this.fileToolbarService.getToolbar(),
    this.formatToolbarService.getToolbar(),
    this.mergeFieldsToolbarService.getToolbar()
  ]
  toolbar = this.toolbars[0];
  
  selectedIndex = 0;
  tabs: string[] = [
    'File', 'Format', 'Merge Fields', 'Compare', 'View'
  ]

  constructor(
    private editorService: EditorService,
    private fileToolbarService: FileToolbarService,
    private formatToolbarService: FormatToolbarService,
    private fileManagementService: FileManagementService,
    private mergeFieldsToolbarService: MergeFieldsToolbarService,
    private changeDetector: ChangeDetectorRef
  ) {
    
  }

  ngOnInit(): void {
    this.template$.pipe(
      tap(template => this.template = template)
    ).subscribe();

    this.registerFileActions();
    this.registerMergeFieldsActions();
  }

  selectTab(event: {itemIndex: number}) {
    this.selectedIndex = event.itemIndex;
    this.toolbar = this.toolbars[this.selectedIndex];
  }

  registerFileActions() {
    this.fileToolbarService.fileToolbarActions$.pipe(
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

  registerMergeFieldsActions() {
    this.mergeFieldsToolbarService.mergeFieldsToolbarActions$.pipe(
      takeUntil(this._destroy$),
      tap((res: MergeFieldsActions) => {
        switch (res) {
          case MergeFieldsActions.INSERT_FIELD:
            // implement
            break;
          case MergeFieldsActions.SHOW_LIVETEXT:
            this.liveTextpopupVisible = true;
            this.changeDetector.detectChanges();
            break;
        }
      })
    ).subscribe()
  }

  ngOnDestroy(): void {
    this._destroy$.complete();
  }
}
