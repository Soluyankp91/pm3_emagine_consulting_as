import {
  create, createOptions, HomeTabItemId, Options,
  RibbonButtonItem,
  RibbonItem, RibbonMenuItem, RibbonSubMenuItem, RibbonTab, RibbonTabType, RichEdit
} from 'devexpress-richedit';

import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { IMergeField } from '../../_api/merge-fields.service';
@Component({
  standalone: true,
  selector: 'app-richedit',
  template: '<div class="editor"></div>',
  styleUrls: ['./richedit.component.scss']
})
export class RicheditComponent implements AfterViewInit, OnDestroy {
  private _rich: RichEdit;

  @Input() template: File | Blob | ArrayBuffer | string = '';
  @Input() mergeFields: IMergeField;
  @Output() save = new EventEmitter();

  constructor(private element: ElementRef) { }

  ribbonCustomization(options: Options) {
    const homeTab = options.ribbon.getTab(RibbonTabType.Home);
  
    const findElem: RibbonItem = homeTab.getItem(HomeTabItemId.Find);
    const replaceElem: RibbonItem = homeTab.getItem(HomeTabItemId.Replace);
    homeTab.removeItem(findElem);
    homeTab.removeItem(replaceElem);

    // insert tab
    const findTabId = 'FindTabId';
    options.ribbon.insertTab(
      new RibbonTab('Find', findTabId, 
      //@ts-ignore
      [findElem, replaceElem]), 2);
    
    // insert compare tab
    
    this.addCompareTab(options);
    options.mailMerge.dataSource = [
      this.mergeFields
    ]
  }  

  addCompareTab(options: Options) {
    const selectBtn = new RibbonButtonItem('selectBtn', 'Select Document', {
      showText: true,
      beginGroup: true,
      icon: 'home'
    });

    const compareTabId = 'CompareTabID';
    const compareTab = options.ribbon.insertTab(
      new RibbonTab('Compare', compareTabId, [
        selectBtn
      ]),
    );
  }

  ngAfterViewInit(): void {
    const options: Options = createOptions();
    this.ribbonCustomization(options);

    options.width = 'calc(100vw - 160px)';
    options.height = 'calc(100vh - 120px)';
    options.events.saving = (s, f) => {
      this.save.emit(f.base64);
      this._rich.downloadPdf('test');
    }

    this._rich = create(this.element.nativeElement.firstElementChild, options);
    this._rich.openDocument(this.template, 'emagine_doc', 4);
    

    this._rich.events.customCommandExecuted.addHandler((s, e) => {
      // this._rich.document.subDocuments.main.insertContent(0, this.template, 4);
      this._rich.exportToPdf('a.pdf');
      this._rich.downloadPdf('a.pdf')
    })
  }

  ngOnDestroy() {
    if (this._rich) {
      this._rich.dispose();
      this._rich = null;
    }
  }
}