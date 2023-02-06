import { Component, Injector, Input, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormArray } from '@angular/forms';
import { FileUploaderComponent } from 'src/app/shared/components/file-uploader/file-uploader.component';
import { FileUploaderFile } from 'src/app/shared/components/file-uploader/file-uploader.model';
import { DocumentForm } from 'src/app/workflow/workflow-sales/workflow-sales.model';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
	FileParameter,
	FileServiceProxy,
	EmployeeServiceProxy,
	EmployeeDto,
	WorkflowProcessType,
	StepType,
	WorkflowDocumentQueryDto,
} from 'src/shared/service-proxies/service-proxies';
import { WFDocument } from './wf-documents.model';
import * as moment from 'moment';
import { AuthenticationResult } from '@azure/msal-browser';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';

@Component({
	selector: 'app-documents',
	templateUrl: './wf-documents.component.html',
	styleUrls: ['./wf-documents.component.scss'],
})
export class DocumentsComponent extends AppComponentBase {
	@ViewChild('fileUploader') fileUploader: FileUploaderComponent;
	@Input() workflowProcessType: WorkflowProcessType;
	@Input() stepType: StepType;
	@Input() clientPeriodId: string | undefined;
	@Input() workflowTerminationId: string | undefined;
    @Input() readOnlyMode: boolean;
	isDocumentsLoading = true;
	documentsNoData = true;
	documentForm: DocumentForm;
	tempFilesIds: string[] = [];
	currentEmployee: EmployeeDto;
	constructor(
		injector: Injector,
		private _fb: UntypedFormBuilder,
		private _fileService: FileServiceProxy,
		private _employeeService: EmployeeServiceProxy,
		private _localHttpService: LocalHttpService,
		private _httpClient: HttpClient
	) {
		super(injector);
		this.documentForm = new DocumentForm();
        this.getCurrentEmployee();
	}

	tempFileAdded(files: FileUploaderFile[]) {
		const fileToUpload = files[0];
		let fileInput: FileParameter;
		fileInput = {
			fileName: fileToUpload.name,
			data: fileToUpload.internalFile,
		};
		this._fileService.temporaryPOST(fileInput).subscribe((result) => {
			const wrappedDocument = WFDocument.wrap(
				fileToUpload.name,
				moment(),
				this.currentEmployee,
				this.workflowProcessType,
				this.stepType,
				this.clientPeriodId,
				this.workflowTerminationId,
				undefined,
				result.value!
			);
			this.addDocument(wrappedDocument);
		});
	}

	addExistingFile(files: WorkflowDocumentQueryDto[]) {
		for (const file of files) {
			const wrappedDocument = WFDocument.wrap(
				file.name!,
				file.createdDateUtc!,
				file.createdBy!,
				file.workflowProcessType!,
				file.stepType!,
				file.clientPeriodId,
				file.workflowTerminationId,
				file.id,
				undefined
			);
			this.addDocument(wrappedDocument);
		}
	}

	deleteDocument(fileId: string, index: number) {
		if (fileId) {
			this._fileService.temporaryDELETE(fileId).subscribe(() => this.documents.removeAt(index));
		} else {
			this.documents.removeAt(index);
		}
	}

	getCurrentEmployee() {
		this._employeeService.current().subscribe((result) => {
			this.currentEmployee = new EmployeeDto(result);
		});
	}

	addDocument(document: WFDocument) {
		const form = this._fb.group({
			icon: new UntypedFormControl(document.icon),
			name: new UntypedFormControl(document?.name),
			temporaryFileId: new UntypedFormControl(document.temporaryFileId),
			workflowDocumentId: new UntypedFormControl(document.workflowDocumentId),
			createdDateUtc: new UntypedFormControl(document.createdDateUtc),
			createdBy: new UntypedFormControl(document.createdBy),
			clientPeriodId: new UntypedFormControl(document.clientPeriodId),
			workflowTerminationId: new UntypedFormControl(document.workflowTerminationId),
			workflowProcessType: new UntypedFormControl(document.workflowProcessType),
			stepType: new UntypedFormControl(document.stepType),
		});
		this.documentForm.documents.push(form);
	}

	downloadDocument(workflowDocumentId: number) {
		this._localHttpService.getTokenPromise().then((response: AuthenticationResult) => {
			const fileUrl = `${this.apiUrl}/api/WorkflowDocument/${workflowDocumentId}`;
			this._httpClient
				.get(fileUrl, {
					headers: new HttpHeaders({
						Authorization: `Bearer ${response.accessToken}`,
					}),
					responseType: 'blob',
					observe: 'response',
				})
				.subscribe((data: HttpResponse<Blob>) => {
					const blob = new Blob([data.body!], { type: data.body!.type });
					const contentDispositionHeader = data.headers.get('Content-Disposition');
					if (contentDispositionHeader !== null) {
						const contentDispositionHeaderResult = contentDispositionHeader.split(';')[1].trim().split('=')[1];
						const contentDispositionFileName = contentDispositionHeaderResult.replace(/"/g, '');
						const downloadlink = document.createElement('a');
						downloadlink.href = window.URL.createObjectURL(blob);
						downloadlink.download = contentDispositionFileName;
						const nav = window.navigator as any;
						if (nav.msSaveOrOpenBlob) {
							nav.msSaveBlob(blob, contentDispositionFileName);
						} else {
							downloadlink.click();
						}
					}
				});
		});
	}

	get documents(): UntypedFormArray {
		return this.documentForm.get('documents') as UntypedFormArray;
	}
}
