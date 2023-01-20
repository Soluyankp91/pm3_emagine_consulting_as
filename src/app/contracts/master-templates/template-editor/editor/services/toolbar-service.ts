import { Injectable } from "@angular/core";
import { dxHtmlEditorToolbar } from "devextreme/ui/html_editor";
import { Subject } from "rxjs";

export enum DownloadActions {
  SAFE_AS_PDF = 'Safe as pdf',
  SOME_ACTION = 'Some Action'
}

export enum FileActions {
  DOWNLOAD = 'download',
  UPLOAD = 'upload',
  PRINT = 'print'
}

@Injectable()
export class ToolbarService {
  toolbarActions$ = new Subject<FileActions | DownloadActions>();

  fileToolbar: dxHtmlEditorToolbar = {
    items: [
      {
        widget: 'dxDropDownButton',
        options: {
          text: 'Download',
          icon: 'download',
          stylingMode: 'text',
          items: Object.values(DownloadActions),
          onItemClick: (ev: {itemData: string}) => this.toolbarActions$.next(ev.itemData as DownloadActions)
        }
      },
      {
        widget: 'dxButton',
        options: {
          text: 'Upload',
          icon: 'doc',
          stylingMode: 'text',
          items: Object.values(DownloadActions),
          onClick: () => this.toolbarActions$.next(FileActions.UPLOAD)
        }
      },
      {
        widget: 'dxButton',
        options: {
          text: 'Print',
          icon: 'print',
          stylingMode: 'text',
          onClick: () => this.toolbarActions$.next(FileActions.PRINT)
        }
      },
      'separator',
      'italic'
    ]
  }

  formatToolbar: dxHtmlEditorToolbar = {
    items: [
      'undo',
      'redo',
      'separator',
      {
        name: 'size',
        acceptedValues: ['8px', '14px', '18px', '24px'],
      },
      {
        name: 'font',
        acceptedValues: [
          'Arial',
          'Courier New',
          'Georgia',
          'Impact',
          'Lucida Console',
          'Tahoma',
          'Times New Roman',
          'Verdana'
        ]
      },
      'separator',
      'bold',
      'italic',
      'strike',
      'underline',
      'separator',
      'alignLeft',
      'alignCenter',
      'alignRight',
      'alignJustify',
      'separator',
      'orderedList',
      'bulletList',
      'separator',
      {
        name: 'header',
        acceptedValues: [false, 1, 2, 3, 4, 5]
      },
      'separator',
      'color',
      'background',
      'separator',
      'link',
      'separator',
      'clear',
      'codeBlock',
      'blockquote',
      'separator',
      'insertTable',
      'deleteTable',
      'insertRowAbove',
      'insertRowBelow',
      'deleteRow',
      'insertColumnLeft',
      'insertColumnRight',
      'deleteColumn'
    ],
    multiline: false
  }

  constructor() {}

  getToolbars() {
    return [this.fileToolbar, this.formatToolbar];
  }
}