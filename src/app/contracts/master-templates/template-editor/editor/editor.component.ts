import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

// Project
import { EditorService } from './_api/editor.service';
import { RicheditComponent } from './components/richedit/richedit.component';


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

  template$ = this.editorService.getTemplate();
  template = '';


  constructor(
    private editorService: EditorService,
    private changeDetector: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.template$.pipe(
      tap(template => this.template = template)
    ).subscribe();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initiliazed = true;
      this.changeDetector.detectChanges();
    })
  }

  ngOnDestroy(): void {
    this._destroy$.complete();
  }
}
