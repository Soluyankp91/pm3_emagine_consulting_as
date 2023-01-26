import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';

// Project
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

  onSave(template: string) {
    const templateId = this._route.snapshot.params.id;
    this._editorService.upsertTemplate(templateId, { value: template }).subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.complete();
  }
}
