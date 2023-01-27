import {
  create, createOptions, HomeTabItemId, Options,
  RibbonItem, RibbonTab, RibbonTabType, RichEdit
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
  private rich: RichEdit;

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
    
    options.mailMerge.dataSource = [
      this.mergeFields
    ]
  }  

  ngAfterViewInit(): void {
    const options: Options = createOptions();
    this.ribbonCustomization(options);

    options.width = 'calc(100vw - 160px)';
    options.height = 'calc(100vh - 120px)';
    options.events.saving = (s, f) => {
      this.save.emit(f.base64);
    }

    this.rich = create(this.element.nativeElement.firstElementChild, options);
    this.rich.openDocument(this.template, 'name', 4);
  }

  ngOnDestroy() {
    if (this.rich) {
      this.rich.dispose();
      this.rich = null;
    }
  }
}