import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { catchError, filter } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';

// Project Specific
import { CommentService, CompareService, EditorCoreService } from './services';
import { RichEditorDirective } from './directives';
import { RichEditorOptionsProvider } from './providers';
import { AgreementService, MergeFieldsService } from './data-access';
import { IDocumentItem, IDocumentVersion, IMergeField, ITemplateSaveType } from './types';

import { InsertMergeFieldPopupComponent } from './components/insert-merge-field-popup';
import { CompareSelectVersionPopupComponent } from './components/compare-select-version-popup';
import { CompareSelectDocumentPopupComponent } from './components/compare-select-document-popup';

@Component({
	standalone: true,
	selector: 'app-editor',
	templateUrl: './editor.component.html',
	styleUrls: ['./editor.component.scss'],
	imports: [
		CommonModule,
		RichEditorDirective,
		InsertMergeFieldPopupComponent,
		CompareSelectVersionPopupComponent,
		CompareSelectDocumentPopupComponent,
	],
	providers: [
		RichEditorOptionsProvider,
		AgreementService,
		MergeFieldsService,
		CompareService,
		CommentService,
		EditorCoreService,
	],
})
export class EditorComponent implements OnInit, OnDestroy {
	_destroy$ = new Subject();
	templateId: number | undefined;
	template$ = new BehaviorSubject<File | Blob | ArrayBuffer | string>(null);
	documentList$ = new BehaviorSubject<Array<IDocumentItem>>([]);
	templateVersions$ = new BehaviorSubject<Array<IDocumentVersion>>([]);
	mergeFields$ = new BehaviorSubject<IMergeField>({});

	isLoading: boolean = false;
	hasUnsavedChanges: boolean = false;

	constructor(
		private _route: ActivatedRoute,
		private _agreementService: AgreementService,
		private _mergeFieldsService: MergeFieldsService,
		private _editorCoreService: EditorCoreService
	) {}

	ngOnInit(): void {
		this.isLoading = true;
		this.templateId = this._route.snapshot.params.id;
		this._agreementService
			.getTemplate(this.templateId)
			.pipe(catchError(() => this._agreementService.getTemplateMock()))
			.subscribe((tmp) => {
				this.template$.next(tmp);
				this.isLoading = false;
				this._editorCoreService.loadDocument(tmp);
			});

		this._agreementService.getTemplateVersions(this.templateId).subscribe((res) => {
			this.templateVersions$.next(res || []);
		});

		this._agreementService.getSimpleList().subscribe((res) => {
			this.documentList$.next(res.items);
		});

		this._mergeFieldsService.getMergeFields(this.templateId).subscribe((res) => {
			this.mergeFields$.next(res);
		});
	}

	mergeSelectedField(field: string) {
		this._editorCoreService.insertMergeField(field);
	}

	loadCompareTemplateByVersion(version: number) {
		const tmpID = this.templateId;
		this._agreementService.getTemplateByVersion(tmpID, version).subscribe((blob) => {
			this._editorCoreService.compareTemplate(blob);
		});
	}

	loadCompareDocumentTemplate(templateID: number) {
		this._agreementService.getTemplate(templateID).subscribe((blob) => {
			this._editorCoreService.compareTemplate(blob);
		});
	}

	saveAsDraft() {
		this._saveFileAs(ITemplateSaveType.Draft);
	}

	saveAsComplete() {
		this._saveFileAs(ITemplateSaveType.Complete);
	}

	private _saveFileAs(type: ITemplateSaveType) {
		let functionName = type === ITemplateSaveType.Draft ? 'saveAsDraftTemplate' : 'completeTemplate';
		this.isLoading = true;
		this._editorCoreService.setTemplateAsBase64((base64) => {
			if (base64) {
				this._agreementService[functionName](this.templateId, { value: base64 }).subscribe(() => {
					this._editorCoreService.hasUnsavedChanges = true;
					this.hasUnsavedChanges = true;
					this.isLoading = false;
				});
			}
		});
	}

	ngOnDestroy(): void {
		this._destroy$.complete();
	}
}
