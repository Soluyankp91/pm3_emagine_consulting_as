import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { create, createOptions, Options, RichEdit, ViewTabCommandId } from 'devexpress-richedit';
import { DocumentFormatApi } from 'devexpress-richedit/lib/model-api/formats/enum';
import { of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AgreementAbstractService } from '../editor/data-access/agreement-abstract.service';

@Component({
  standalone: true,
  selector: 'app-editor-preview',
  template: '<div></div>',
})
export class EditorPreviewComponent implements AfterViewInit, OnChanges {
  @Input() templateId: number;

  private _rich: RichEdit;

  constructor(private _element: ElementRef, private _templateService: AgreementAbstractService) { }

  ngOnChanges(changes: SimpleChanges): void {
      if (changes.templateId?.currentValue) {
          this._loadTemplate(changes.templateId?.currentValue)
      }
  }

  ngAfterViewInit(): void {
      const options: Options = createOptions();
      this._setupOptions(options);
      this._rich = create(this._element.nativeElement.firstElementChild, options);
      this._rich.readOnly = true;
      this._rich.events.documentLoaded.addHandler(() => {
        this._rich.executeCommand(ViewTabCommandId.ToggleShowHorizontalRuler)
      })
  }

  ngOnDestroy() {
      if (this._rich) {
        this._rich.dispose();
        this._rich = null;
      }
  }

  private _loadTemplate(templateId: number) {
      this._templateService.getTemplate(templateId, false).pipe(
        tap(template => this._rich.openDocument(template, 'emagine_doc', DocumentFormatApi.OpenXml)),
      ).subscribe()
  }

  private _setupOptions(options: Options) {
      options.width = '100%';
      options.height = '100vh';
      options.ribbon.visible = false;
      options.contextMenu.enabled = false;
      options.readOnly = true;
  }

  
}
