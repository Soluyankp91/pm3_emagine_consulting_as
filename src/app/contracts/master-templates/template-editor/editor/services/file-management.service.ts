import { Injectable } from "@angular/core";

declare var require: any;
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');

const htmlToPdfmake = require("html-to-pdfmake");
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Injectable()
export class FileManagementService {
  constructor() {}

  exportAsPdf(htmlTemplate: string) {
    const html = htmlToPdfmake(htmlTemplate);
    const documentDefinition = { content: html };
    pdfMake.createPdf(documentDefinition).download(); 
  };

  print(html: string) {
		let popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');

		if (popupWin) {
			popupWin.document.open();
			popupWin.document.write(`
				<html>
					<head>
            <body onload="window.print();window.close()">${html}</body>
          </head>
        </html>
      `)
      popupWin.document.close();
    }

  }
}