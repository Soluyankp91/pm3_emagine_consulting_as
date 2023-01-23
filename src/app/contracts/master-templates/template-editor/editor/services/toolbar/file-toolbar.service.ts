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
export class FileToolbarService {
  fileToolbarActions$ = new Subject<FileActions | DownloadActions>();

  fileToolbar: dxHtmlEditorToolbar = {
    items: [
      {
        widget: 'dxDropDownButton',
        options: {
          text: 'Download',
          icon: 'download',
          stylingMode: 'text',
          items: Object.values(DownloadActions),
          onItemClick: (ev: {itemData: string}) => this.fileToolbarActions$.next(ev.itemData as DownloadActions)
        }
      },
      {
        widget: 'dxButton',
        options: {
          text: 'Upload',
          icon: 'doc',
          stylingMode: 'text',
          items: Object.values(DownloadActions),
          onClick: () => this.fileToolbarActions$.next(FileActions.UPLOAD)
        }
      },
      {
        widget: 'dxButton',
        options: {
          text: 'Print',
          icon: 'print',
          stylingMode: 'text',
          onClick: () => this.fileToolbarActions$.next(FileActions.PRINT)
        }
      },
      'separator',
      'italic'
    ]
  }

  constructor() {}

  getToolbar() {
    return this.fileToolbar;
  }
}