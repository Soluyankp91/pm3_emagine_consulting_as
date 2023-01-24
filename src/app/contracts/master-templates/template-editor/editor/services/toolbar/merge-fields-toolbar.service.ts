import { Injectable } from "@angular/core";
import { dxHtmlEditorToolbar } from "devextreme/ui/html_editor";
import { BehaviorSubject, Subject } from "rxjs";

export enum MergeFieldsActions {
  INSERT_FIELD = 'Insert merge field',
  SHOW_LIVETEXT = 'Show live text'
}

@Injectable()
export class MergeFieldsToolbarService {
  mergeFieldsToolbarActions$ = new Subject<MergeFieldsActions>();
  liveTextpopupVisible = false;

  mergeFieldsToolbar: dxHtmlEditorToolbar = {
    items: [
      {
        widget: 'dxButton',
        options: {
          text: 'Insert Merge Field',
          icon: 'edit',
          stylingMode: 'text',
          items: Object.values(MergeFieldsActions),
          onClick: () => this.mergeFieldsToolbarActions$.next(MergeFieldsActions.INSERT_FIELD)
        }
      },
      'separator',
      {
        widget: 'dxButton',
        options: {
          text: 'Show live text',
          icon: 'print',
          stylingMode: 'text',
          onClick: () => this.mergeFieldsToolbarActions$.next(MergeFieldsActions.SHOW_LIVETEXT)
        }
      }
    ]
  }

  constructor() {}

  getToolbar() {
    return this.mergeFieldsToolbar;
  }
}