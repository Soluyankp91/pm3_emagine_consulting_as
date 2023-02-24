import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, mapTo, pluck, switchMap, take, tap } from 'rxjs/operators';
import { BehaviorSubject, of, Subject } from 'rxjs';

// Project Specific
import { CommentService, CompareService, EditorCoreService } from './services';
import { RichEditorDirective } from './directives';
import { RichEditorOptionsProvider } from './providers';
import { IDocumentItem, IDocumentVersion, IMergeField, ITemplateSaveType } from './entities';

import { InsertMergeFieldPopupComponent } from './components/insert-merge-field-popup';
import { CompareSelectVersionPopupComponent } from './components/compare-select-version-popup';
import { CompareSelectDocumentPopupComponent } from './components/compare-select-document-popup';
import { SaveUsPopupComponent } from './components/save-as-popup/save-us-popup.component';

import { AgreementAbstractService } from './data-access/agreement-abstract.service';
import { MergeFieldsAbstractService } from './data-access/merge-fields-abstract';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';


@Component({
	standalone: true,
	selector: 'app-editor',
	templateUrl: './editor.component.html',
	styleUrls: ['./editor.component.scss'],
	imports: [
		CommonModule,
		MatButtonModule,
		RichEditorDirective,
		SaveUsPopupComponent,
		InsertMergeFieldPopupComponent,
		CompareSelectVersionPopupComponent,
		CompareSelectDocumentPopupComponent,
	],
	providers: [
		RichEditorOptionsProvider,
		CompareService,
		CommentService,
		EditorCoreService,
	],
})
export class EditorComponent implements OnInit, OnDestroy {
	_destroy$ = new Subject();
	templateId: number | undefined;
	hasUnsavedChanges$ = this._editorCoreService.hasUnsavedChanges$;
	template$ = new BehaviorSubject<File | Blob | ArrayBuffer | string>(null);
	documentList$ = new BehaviorSubject<IDocumentItem[]>([]);
	templateVersions$ = new BehaviorSubject<IDocumentVersion[]>([]);
	mergeFields$ = new BehaviorSubject<IMergeField>({});
	isAgreement$ = this._route.data.pipe(
		pluck('isAgreement')
	);

	isLoading: boolean = false;

	constructor(
		private _route: ActivatedRoute,
		private _agreementService: AgreementAbstractService,
		private _mergeFieldsService: MergeFieldsAbstractService,
		private _editorCoreService: EditorCoreService,
		private _dialog: MatDialog
	) {}

	ngOnInit(): void {
		this.isLoading = true;
		this.templateId = this._route.snapshot.params.id;
		this._agreementService
			.getTemplate(this.templateId)
			.pipe(catchError(() => of(null)))
			.subscribe((tmp) => {
				this.template$.next(tmp);
				this.isLoading = false;
				if (tmp) {
					this._editorCoreService.loadDocument(tmp);
				} else {
					this._editorCoreService.newDocument();
				}
			});

		this._agreementService.getTemplateVersions(this.templateId).subscribe((res) => {
			this.templateVersions$.next(res || []);
		});

		this._agreementService.getSimpleList().subscribe((res) => {
			this.documentList$.next(res);
		});

		this._mergeFieldsService.getMergeFields(this.templateId).subscribe((res) => {
			this._editorCoreService.applyMergeFields(res);
			this.mergeFields$.next(res);
		});
	}

	mergeSelectedField(field: string) {
		this._editorCoreService.insertMergeField(field);
	}

	loadCompareTemplateByVersion(version: number) {
		const tmpID = this.templateId;
		this.templateVersions$
			.pipe(
				switchMap((versions) => {
					const selected = versions.find((v) => v.version === version);
					return this._agreementService.getTemplateByVersion(tmpID, version).pipe(
						map((template) => ({
							template,
							filename: 'Version ' + selected.version,
						}))
					);
				})
			)
			.subscribe(({ template, filename }) => {
				this._editorCoreService.compareTemplate(template, filename);
			});
	}

	loadCompareDocumentTemplate(templateID: number) {
		this.documentList$
			.pipe(
				switchMap((documents) => {
					const selected = documents.find((v) => v.agreementTemplateId === templateID);
					return this._agreementService.getTemplate(templateID).pipe(
						map((template) => ({
							template,
							filename: selected.name,
						}))
					);
				})
			)
			.subscribe(({ template, filename }) => {
				this._editorCoreService.compareTemplate(template, filename);
			});
	}

	saveAsDraft() {
		this._saveFileAs(ITemplateSaveType.Draft);
	}

	saveAsComplete() {
		this._dialog.open(SaveUsPopupComponent, {
			data: {},
			height: 'auto',
			width: '500px',
			maxWidth: '100%',
			disableClose: true,
			hasBackdrop: true,
			backdropClass: 'backdrop-modal--wrapper',
		}).afterClosed().subscribe(console.log);

		// this._saveFileAs(ITemplateSaveType.Complete);
	}

	cancel() {
		this.template$.pipe(
			tap(template => {
				this._editorCoreService.loadDocument(template);
			}),
			take(1)
		).subscribe()
	}

	private _saveFileAs(type: ITemplateSaveType) {
		let functionName = type === ITemplateSaveType.Draft ? 'saveAsDraftTemplate' : 'completeTemplate';
		this.isLoading = true;
		this._editorCoreService.setTemplateAsBase64((base64) => {
			if (base64) {
				this._agreementService[functionName](this.templateId, { value: base64 }).subscribe(() => {
					this.hasUnsavedChanges$.next(false);
					this.isLoading = false;
				});
			}
		});
	}

	ngOnDestroy(): void {
		this._destroy$.complete();
	}
}
