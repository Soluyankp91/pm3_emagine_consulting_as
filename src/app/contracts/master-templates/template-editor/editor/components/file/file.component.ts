import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

// Party
import { DxButtonModule, DxDropDownButtonModule } from 'devextreme-angular';

declare var require: any;
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');

const htmlToPdfmake = require("html-to-pdfmake");
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

enum DownloadActions {
  SAFE_AS_PDF = 'Safe as pdf',
  SOME_ACTION = 'Some Action'
}
@Component({
  standalone: true,
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  imports: [
    CommonModule,
    DxDropDownButtonModule,
    DxButtonModule
  ]
})
export class FileComponent implements OnInit {
  @Input() html = '';
  downloadActions = Object.values(DownloadActions);

  constructor() { }

  ngOnInit(): void {
  }

  onDownloadActionsClick(event: {itemData: string}) {
    switch (event.itemData ) {
      case DownloadActions.SAFE_AS_PDF:
        this.exportAsPdf();
        break;
      case DownloadActions.SOME_ACTION:
        break;
    }
  }

  exportAsPdf () {
    var html = htmlToPdfmake(this.html);
    const documentDefinition = { content: html };
    pdfMake.createPdf(documentDefinition).download(); 
  };

  print() {
		let popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');

		if (popupWin) {
			popupWin.document.open();
			popupWin.document.write(`
				<html>
					<head>
            <body onload="window.print();window.close()">${this.html}</body>
          </head>
        </html>
      `)
      popupWin.document.close();
    }

  }
}
