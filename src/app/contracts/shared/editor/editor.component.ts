import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { catchError, filter, map, mapTo, pluck, skip, switchMap, take, tap } from 'rxjs/operators';
import { BehaviorSubject, of, Subject } from 'rxjs';

// Project Specific
import { CommentService, CompareService, EditorCoreService } from './services';
import { RichEditorDirective } from './directives';
import { RichEditorOptionsProvider } from './providers';
import { IComment, IDocumentItem, IDocumentVersion, IMergeField, ITemplateSaveType } from './entities';

import { InsertMergeFieldPopupComponent } from './components/insert-merge-field-popup';
import { CompareSelectVersionPopupComponent } from './components/compare-select-version-popup';
import { CompareSelectDocumentPopupComponent } from './components/compare-select-document-popup';
import { SaveAsPopupComponent } from './components/save-as-popup/save-as-popup.component';

import { AgreementAbstractService } from './data-access/agreement-abstract.service';
import { MergeFieldsAbstractService } from './data-access/merge-fields-abstract';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommentSidebarComponent } from './components/comment-sidebar/comment-sidebar.component';
import { TemplateCommentService } from './data-access/template-comments.service';
import { inOutPaneAnimation } from './entities/animations';


@Component({
	standalone: true,
	selector: 'app-editor',
	templateUrl: './editor.component.html',
	styleUrls: ['./editor.component.scss'],
	imports: [
		CommonModule,
		MatButtonModule,
		RichEditorDirective,
		SaveAsPopupComponent,
		InsertMergeFieldPopupComponent,
		CompareSelectVersionPopupComponent,
		CompareSelectDocumentPopupComponent,
		CommentSidebarComponent
	],
	providers: [
		RichEditorOptionsProvider,
		CompareService,
		CommentService,
		TemplateCommentService,
		EditorCoreService,
	],
	animations: [inOutPaneAnimation],
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

	commentSidebarEnabled$ = this._editorCoreService.commentSidebarEnabled$;
	comments$ = new BehaviorSubject<IComment[]>([]);
	currentTemplateVersion: number | undefined;

	isLoading: boolean = false;

	constructor(
		private _route: ActivatedRoute,
		private _agreementService: AgreementAbstractService,
		private _commentService: TemplateCommentService,
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
			this.currentTemplateVersion = res || res.length ? res[res.length - 1].version : 1;
			this.templateVersions$.next(res || []);
		});

		this._agreementService.getSimpleList().subscribe((res) => {
			this.documentList$.next(res);
		});

		this._mergeFieldsService.getMergeFields(this.templateId).subscribe((res) => {
			this._editorCoreService.applyMergeFields(res);
			this.mergeFields$.next(res);
		});

		this.templateVersions$.pipe(skip(1), take(1)).subscribe((versions) => {
			let tmpID = this.templateId;
			let version = versions.length ? versions[versions.length - 1].version : 1;
			this.loadCommentsByTemplateVersion(tmpID, version);
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

	loadCommentsByTemplateVersion(templateID: number, version: number) {
		this._editorCoreService.afterViewInit$
			.pipe(switchMap(() => this._commentService.getByTemplateID(templateID, version)))
			.subscribe((comments) => {
				console.log(comments);
				this.comments$.next(comments);
				this._editorCoreService.insertComments(comments);
			});
	}

	createComment({ body, interval }) {
		let tmpID = this.templateId;
		let version = this.currentTemplateVersion;

		this._commentService.createComment(tmpID, version, body).subscribe((commentID) => {
			this._editorCoreService.registerCommentThread(interval, commentID);
			this.loadCommentsByTemplateVersion(tmpID, version);
			this.saveAsDraft();
		});
	}

	deleteComment(entityID: number) {
		this._commentService.deleteComment(entityID).subscribe(() => {
			this.comments$.next(this.comments$.value.filter((c) => c.id !== entityID));
			this._editorCoreService.deleteComment(entityID);
		});
	}

	editComment({ body, entityID }) {
		this._commentService.editComment(entityID, body).subscribe(() => {
			this._editorCoreService.applyCommentChanges(entityID);
		});
	}

	saveAsDraft(cb?: () => void) {
		this._saveFileAs(ITemplateSaveType.Draft, cb);
	}

	saveAsComplete() {
		// FOR NEW VERSIONING

		// this._dialog.open(SaveAsPopupComponent, {
		// 	data: {},
		// 	height: 'auto',
		// 	width: '500px',
		// 	maxWidth: '100%',
		// 	disableClose: true,
		// 	hasBackdrop: true,
		// 	backdropClass: 'backdrop-modal--wrapper',
		// }).afterClosed().pipe(
		// 	filter(res => !!res),
		// ).subscribe(() => {
		// 	this._saveFileAs(ITemplateSaveType.Complete);
		// });
		
		this._saveFileAs(ITemplateSaveType.Complete);
	}

	cancel() {
		this.template$.pipe(
			tap(template => {
				this._editorCoreService.loadDocument(template);
				this.hasUnsavedChanges$.next(false);
			}),
			take(1)
		).subscribe()
	}

	private _saveFileAs(type: ITemplateSaveType, callback?: () => void) {
		let functionName = type === ITemplateSaveType.Draft ? 'saveAsDraftTemplate' : 'completeTemplate';
		this.isLoading = true;
		this._editorCoreService.setTemplateAsBase64((base64) => {
			if (base64) {
				this._agreementService[functionName](this.templateId, { value: base64 }).subscribe(() => {
					this.hasUnsavedChanges$.next(false);
					this.isLoading = false;
					if (callback && typeof callback === 'function') {
						callback();
					}
				});
			}
		});
	}

	ngOnDestroy(): void {
		this._destroy$.complete();
	}
}
