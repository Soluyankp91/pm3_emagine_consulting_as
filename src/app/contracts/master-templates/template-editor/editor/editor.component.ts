import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';

// Project
import { EditorService } from './_api/editor.service';
import { RicheditComponent } from './components/richedit/richedit.component';
import { ActivatedRoute } from '@angular/router';


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
  ]
})
export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {
  _destroy$ = new Subject();
  initiliazed = false;

  template$ = new BehaviorSubject<string | null>(null);

  constructor(
    private editorService: EditorService,
    private changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    const templateId = this.route.snapshot.params.id;
    this.editorService.getTemplate(templateId).pipe(
      tap(template => this.template$.next(template)),
    ).subscribe(
      () => {},
      () => {
        this.template$.next(this.editorService.getTemplateMock())
      },
      () => {
        this.changeDetector.detectChanges();
      }
    )
  }

  ngAfterViewInit(): void {

  }

  onSave(template: string) {
    const templateId = this.route.snapshot.params.id;
    this.editorService.upsertTemplate(templateId, { value: template }).subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.complete();
  }
}
