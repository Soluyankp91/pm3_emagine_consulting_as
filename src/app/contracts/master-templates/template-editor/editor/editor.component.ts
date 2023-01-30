import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { filter, take, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';

// Project Specific
import { EditorService } from './_api/editor.service';
import { RicheditComponent } from './components/richedit/richedit.component';
import { ActivatedRoute } from '@angular/router';
import { MergeFieldsService } from './_api/merge-fields.service';

@Component({
  standalone: true,
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  imports: [
    CommonModule,

    // components
    RicheditComponent
  ],
  providers: [
    EditorService,
    MergeFieldsService
  ]
})
export class EditorComponent implements OnInit, OnDestroy {
  _destroy$ = new Subject();

  template$ = new BehaviorSubject<File | Blob | ArrayBuffer | string>(null);
  mergeFields$ = this._mergeFieldsService.getMergeFields(this._route.snapshot.params.id);
  
  docReady$ = combineLatest([this.template$, this.mergeFields$]).pipe(
    filter(res => !!res[0] && !!res[1])
  );

  isLoading$ = new Subject();

  @ViewChild(RicheditComponent) richEdit: RicheditComponent;

  constructor(
    private _editorService: EditorService,
    private _mergeFieldsService: MergeFieldsService,
    private _route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    const templateId = this._route.snapshot.params.id;
    this._editorService.getTemplate(templateId).pipe(
      tap(template => this.template$.next(template)),
    ).subscribe(
      () => {},
      () => {
        this.template$.next(this._editorService.getTemplateMock())
      }
    )
  }

  onSaveDraft() {
    this.isLoading$.next(true);
    this.richEdit.setTemplateAsBase64();
    
    this.richEdit.templateAsBase64$.pipe(
      take(1)
    ).subscribe(base64 => {
      const templateId = this._route.snapshot.params.id;
      this._editorService.saveAsDraftTemplate(templateId, { value: base64 }).subscribe(
        () => this.isLoading$.next(false)
      );
    })   
  }

  onSaveComplete() {
    this.isLoading$.next(true);
    this.richEdit.setTemplateAsBase64();

    this.richEdit.templateAsBase64$.pipe(
      take(1)
    ).subscribe(base64 => {
      const templateId = this._route.snapshot.params.id;
      this._editorService.comleteTemplate(templateId, { value: base64 }).subscribe(
        () => this.isLoading$.next(false)
      );
    })   
  }

  ngOnDestroy(): void {
    this._destroy$.complete();
  }
}
