import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormArray } from '@angular/forms';
import { FileUploaderComponent } from 'src/app/shared/components/file-uploader/file-uploader.component';
import { FileUploaderFile } from 'src/app/shared/components/file-uploader/file-uploader.model';
import { DocumentForm } from 'src/app/workflow/workflow-sales/workflow-sales.model';
import { AppComponentBase } from 'src/shared/app-component-base';
import { FileParameter, DocumentTypeEnum } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'app-documents',
	templateUrl: './documents.component.html',
	styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent extends AppComponentBase implements OnInit {
	@ViewChild('fileUploader') fileUploader: FileUploaderComponent;
	isDocumentsLoading = true;
	documentsNoData = true;
	documentForm: DocumentForm;
	constructor(injector: Injector, private _fb: UntypedFormBuilder) {
		super(injector);
		this.documentForm = new DocumentForm();
	}

	ngOnInit(): void {}

	openDialogToAddFile(files: FileUploaderFile[]) {
		const fileToUpload = files[0];
		let fileInput: FileParameter;
		fileInput = {
			fileName: fileToUpload.name,
			// fileType: 'pdf',
			data: fileToUpload.internalFile,
		};
		this.fileUploader.clear();
		this.getDocuments(fileInput);
	}

	getDocuments(documents?: any) {
		// this.isDocumentsLoading = true;
		// this._clientDocumentsService.generalAttachments(this.clientId, this.generalDocumentsIncludeLinked.value)
		// .pipe(finalize(() => this.isDocumentsLoading = false))
		// .subscribe(result => {
		this.documentForm.documents.clear();
		// documents.forEach((dcument: any) => {
		if (documents !== null && documents !== undefined) {
			this.addDocument(documents);
			this.documentsNoData = documents?.length === 0;
		}
		// });
		console.log(this.documentsNoData);
		// });
	}

	addDocument(document?: any) {
		const form = this._fb.group({
			// clientAttachmentGuid: new FormControl(document?.clientAttachmentGuid ?? null),
			// documentStorageGuid: new FormControl(document?.documentStorageGuid ?? null),
			// icon: new FormControl(this.getFileTypeIcon(document?.documentType!) ?? null),
			icon: new UntypedFormControl('pdf'),
			headline: new UntypedFormControl(document?.headline ?? null),
			filename: new UntypedFormControl(document?.fileName ?? null),
			// attachmentTypeId: new FormControl(this.findItemById(this.generalFileTypes, document?.attachmentTypeId) ?? null),
			// dateUpdated: new FormControl(document?.dateUpdated ?? null),
			dateUpdated: new UntypedFormControl(new Date()),
			updatedBy: new UntypedFormControl(document?.updatedBy ?? null),
			editable: new UntypedFormControl(document ? false : true),
		});
		this.documentForm.documents.push(form);
	}

	get documents(): UntypedFormArray {
		return this.documentForm.get('documents') as UntypedFormArray;
	}

	getFileTypeIcon(fileIcon: number) {
		switch (fileIcon) {
			case DocumentTypeEnum.Pdf:
				return 'pdf';
			case DocumentTypeEnum.Word:
				return 'doc';
			case DocumentTypeEnum.Excel:
				return 'xls';
			case DocumentTypeEnum.Image:
				return 'jpg';
			case DocumentTypeEnum.Misc:
				return 'txt';
			default:
				return '';
		}
	}

	deleteGeneralDocument(clientAttachmentGuid: string) {
		// this.showMainSpinner();
		// this._clientDocumentsService.generalFileDELETE(this.clientId, clientAttachmentGuid)
		//     .pipe(finalize(() => this.hideMainSpinner()))
		//     .subscribe(result => {
		//         this.getGeneralDocuments();
		//     });
	}

	downloadDocument(clientAttachmentGuid: string) {
		// this.localHttpService.getTokenPromise().then((response: AuthenticationResult) => {
		//     const fileUrl = `${this.apiUrl}/api/ClientDocuments/Document/${clientAttachmentGuid}`;
		//     this.httpClient.get(fileUrl, {
		//         headers: new HttpHeaders({
		//             'Authorization': `Bearer ${response.accessToken}`,
		//         }), responseType: 'blob',
		//         observe: 'response'
		//     }).subscribe((data: HttpResponse<Blob>) => {
		//         const blob = new Blob([data.body!], { type: data.body!.type });
		//         const contentDispositionHeader = data.headers.get('Content-Disposition');
		//         if (contentDispositionHeader !== null) {
		//             const contentDispositionHeaderResult = contentDispositionHeader.split(';')[1].trim().split('=')[1];
		//             const contentDispositionFileName = contentDispositionHeaderResult.replace(/"/g, '');
		//             const downloadlink = document.createElement('a');
		//             downloadlink.href = window.URL.createObjectURL(blob);
		//             downloadlink.download = contentDispositionFileName;
		//             const nav = (window.navigator as any);
		//             if (nav.msSaveOrOpenBlob) {
		//                 nav.msSaveBlob(blob, contentDispositionFileName);
		//             } else {
		//                 downloadlink.click();
		//             }
		//         }
		//     });
		// });
	}
}
