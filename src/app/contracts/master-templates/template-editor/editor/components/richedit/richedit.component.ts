import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import {
  create, 
  createOptions, 
  FileTabItemId, 
  HomeTabCommandId, 
  MailMergeTabCommandId, 
  Options,
  RibbonButtonItem,
  RibbonTab, 
  RibbonTabType, 
  RichEdit
} from 'devexpress-richedit';
import { Subject } from 'rxjs';

import { IMergeField } from '../../_api/merge-fields.service';
import { getIndexes } from './helper';
@Component({
  standalone: true,
  selector: 'app-richedit',
  template: '<div class="editor"></div>',
  styleUrls: ['./richedit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RicheditComponent implements AfterViewInit, OnDestroy {
  private _rich: RichEdit;

  @Input() template: File | Blob | ArrayBuffer | string = '';
  @Input() mergeFields: IMergeField;

  templateAsBase64$ = new Subject<string>();

  constructor(private element: ElementRef) { }

  ribbonCustomization(options: Options) {
    const fileTab = options.ribbon.getTab(RibbonTabType.File);
    fileTab.insertItem(new RibbonButtonItem('updateStyles', 'Update Styles') , 5);
    fileTab.removeItem(FileTabItemId.ExportDocument);

    this.insertCompareTab(options);

    // merge fields
    options.mailMerge.dataSource = [
      this.mergeFields
    ]
  }

  insertCompareTab(options: Options) {
    const selectBtn = new RibbonButtonItem('selectBtn', 'Select Document', {
      showText: true,
      beginGroup: true,
      icon: 'home'
    });

    const compareTabId = 'CompareTabID';
    options.ribbon.insertTab(
      new RibbonTab('Compare', compareTabId, [
        selectBtn
      ]),
    );
  }

  ngAfterViewInit(): void {
    const options: Options = createOptions();
    this.ribbonCustomization(options);

    options.width = 'calc(100vw - 160px)';
    options.height = 'calc(100vh - 240px)';
    options.spellCheck.enabled = false;

    this._rich = create(this.element.nativeElement.firstElementChild, options);
    this._rich.openDocument(this.template, 'emagine_doc', 4);

    this.registerCustomEvents();
  }

  registerCustomEvents() {
    this._rich.events.customCommandExecuted.addHandler((s, e) => {
      switch (e.commandName) {
        case 'updateStyles':
          this.updateFontsToDefault();
          this.updateFileds();
          break;
      }
    })
  }


  setTemplateAsBase64() {
    this._rich.exportToBase64(s => {
      this.templateAsBase64$.next(s);
    });
  }

  updateFileds() {
    this._rich.beginUpdate();
    for (let i = 0; i < this._rich.document.paragraphs.count; i++) {
      const p = this._rich.document.paragraphs.getByIndex(i);
      const t = this._rich.document.getText(p.interval);

      if (t.indexOf('{') > -1) {
        const regExp = /{([^}]+)}/g;
        let match = t.match(regExp);
        
        if (match.length > 1) {
          match.forEach((item, index) => {
            this.updateMergeFields(index, i);
          })    
        } else {
          const firstIndex = t.indexOf('{');
          const lastIndex = t.indexOf('}');

          const isMergeField = this._rich.document.fields.find({
            start: p.interval.start,
            length: p.interval.length - 1
          });

          if (!isMergeField.length) {
            const rxp = /{([^}]+)}/g;
            const arr = t.match(rxp);
            const mergeFieldName = arr.map(item => item.replace(/\{|\}/gi, ''));
            this._rich.document.fields.createMergeField(p.interval.end - 1, mergeFieldName[0]);
            this._rich.document.deleteText({
              start: p.interval.start + firstIndex,
              length: lastIndex - firstIndex + 1
            })
          }
        }
      }
    }

    this._rich.executeCommand(MailMergeTabCommandId.UpdateAllFields);
    this._rich.endUpdate();
  }

  updateMergeFields(index, i) {
    const p = this._rich.document.paragraphs.getByIndex(i);
    const t = this._rich.document.getText(p.interval);

    let item = getIndexes(t, p.interval)[index];

    const firstIndex = item.start;
    const lastIndex = item.end;

    const isMergeField = this._rich.document.fields.find({
      start: firstIndex,
      length: lastIndex - firstIndex - 1
    });

    if (!isMergeField.length) {
      const rxp = /{([^}]+)}/g;
      const arr = t.match(rxp);
      const mergeFieldName = arr.map(item => item.replace(/\{|\}/gi, ''));
      this._rich.document.fields.createMergeField(lastIndex + 1, mergeFieldName[index]);
      this._rich.document.deleteText({
        start: firstIndex,
        length: lastIndex - firstIndex + 1
      })
    }
  }

  updateFontsToDefault() {
    this._rich.beginUpdate();
    this._rich.selection.selectAll();
    this._rich.executeCommand(HomeTabCommandId.ChangeFontName, 'Arial');
    this._rich.endUpdate();
  }

  hasUnsavedChanges() {
    return this._rich.hasUnsavedChanges;
  }

  ngOnDestroy() {
    if (this._rich) {
      this._rich.dispose();
      this._rich = null;
    }
  }
}