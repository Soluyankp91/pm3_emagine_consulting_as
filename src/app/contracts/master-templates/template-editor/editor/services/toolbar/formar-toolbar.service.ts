import { Injectable } from "@angular/core";
import { dxHtmlEditorToolbar } from "devextreme/ui/html_editor";

@Injectable()
export class FormatToolbarService {

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

  getToolbar() {
    return this.formatToolbar;
  }
}