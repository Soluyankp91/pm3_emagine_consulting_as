import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { catchError, filter, map, pluck, skip, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
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

import { MatButtonModule } from '@angular/material/button';
import { CommentSidebarComponent } from './components/comment-sidebar/comment-sidebar.component';
import { TemplateCommentService } from './data-access/template-comments.service';
import { inOutPaneAnimation } from './entities/animations';
import { IntervalApi } from 'devexpress-richedit/lib/model-api/interval';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CompleteTemplateDocumentFileDraftDto, StringWrappedValueDto, UpdateCompletedTemplateDocumentFileDto } from 'src/shared/service-proxies/service-proxies';
import { EditorObserverService } from './data-access/editor-observer.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
		CommentSidebarComponent,
		MatFormFieldModule,
		MatSelectModule,
		AppCommonModule
	],
	providers: [
		RichEditorOptionsProvider,
		CompareService,
		CommentService,
		TemplateCommentService,
		EditorCoreService,
		EditorObserverService
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
	
	selectedVersion: IDocumentVersion = null;
	versions: IDocumentVersion[] = [];
	isLatestVersionSelected$ = new BehaviorSubject(false);


	commentSidebarEnabled$ = this._editorCoreService.commentSidebarEnabled$;
	comments$ = new BehaviorSubject<IComment[]>([]);
	currentTemplateVersion: number | undefined;

	isLoading: boolean = false;
	selectedVersionControl = new FormControl();

	constructor(
		private _route: ActivatedRoute,
		private _agreementService: AgreementAbstractService,
		private _commentService: TemplateCommentService,
		private _mergeFieldsService: MergeFieldsAbstractService,
		private _editorCoreService: EditorCoreService,
		private _dialog: MatDialog,
		private chd: ChangeDetectorRef,
		private _snackBar: MatSnackBar,
		private _editorObserverService: EditorObserverService
	) {}

	ngOnInit(): void {
		this.isLoading = true;
		this.templateId = this._route.snapshot.params.id;

		this.registerChangeVersionListener(this.selectedVersionControl);
		this.getTemplateVersions(this.templateId);

		this._agreementService.getSimpleList().subscribe((res) => {
			this.documentList$.next(res);
		});

		this._mergeFieldsService.getMergeFields(this.templateId).subscribe((res) => {
			this._editorCoreService.applyMergeFields(res);
			this.mergeFields$.next(res);
		});

		this._editorObserverService.startObserve(1, 2);
	}

	ngOnDestroy(): void {
		this._destroy$.complete();
		this._editorObserverService.stopObserve();
	}

	getTemplateVersions(templateId: number) {
		this._agreementService.getTemplateVersions(templateId).subscribe((res) => {
			this.versions = res;
			this.currentTemplateVersion = res.length ? res[res.length - 1].version : 1;
			this.templateVersions$.next(res || []);
			this.selectedVersionControl.setValue(this.currentTemplateVersion)
		});
	}

	loadTemplate(templateId: number, version: number) {
		this.isLoading = true;

		this._agreementService
			.getTemplateByVersion(templateId, version)
			.pipe(catchError(() => {
				this.isLoading = false;
				return of(null)
			}))
			.subscribe((tmp) => {
				this.template$.next(tmp);
				this.isLoading = false;

				if (tmp) {
					if (version === this.versions[this.versions.length -1].version) {
						this.isLatestVersionSelected$.next(true);
					} else {
						this.isLatestVersionSelected$.next(false);
					}

					this._editorCoreService.loadDocument(tmp);
					this.selectedVersion = this.versions[version - 1];
					this.chd.detectChanges();

				} else {
					this._editorCoreService.newDocument();
					this.selectedVersion = null;
				}
			});
	}

	registerChangeVersionListener(control: FormControl) {
		control.valueChanges.pipe(
			takeUntil(this._destroy$),
			tap(version => {
				this.loadTemplate(this.templateId, version);
				this.loadCommentsByTemplateVersion(this.templateId, version);
			})
		)
		.subscribe()
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
				this.comments$.next(comments);
				this._editorCoreService.insertComments(comments);
			});
	}

	createComment({ body, interval }: {body: string, interval: IntervalApi}) {
		let tmpID = this.templateId;
		let version = this.currentTemplateVersion;

		this._commentService.createComment(tmpID, version, body).subscribe((commentID) => {
			this._editorCoreService.registerCommentThread(interval, commentID);
			this.loadCommentsByTemplateVersion(tmpID, version);
			if (this.selectedVersion.isCurrent) {
				this.saveCurrentAsDraft();
			} else {
				this.saveDraftAsDraft();
			}
		});
	}

	deleteComment(entityID: number) {
		this._commentService.deleteComment(entityID).subscribe(() => {
			this.comments$.next(this.comments$.value.filter((c) => c.id !== entityID));
			this._editorCoreService.deleteComment(entityID);
		});
	}

	editComment({ body, entityID }: {body: string, entityID: number}) {
		this._commentService.editComment(entityID, body).subscribe(() => {
			this._editorCoreService.applyCommentChanges(entityID);
		});
	}

	saveAsComplete() {
		if (this.selectedVersion.isCurrent) {
			this.isAgreement$.subscribe(res => {
				this.saveCurrentAsComplete(!!res);
			})
		} else {
			this.isAgreement$.subscribe(() => {
				this.saveDraftAsComplete();
			})
		}
	}

	saveCurrentAsDraft() {
		this.isLoading = true;
		
		this._editorCoreService.setTemplateAsBase64(base64 => {
			this._agreementService.saveCurrentAsDraftTemplate(
				this.templateId, 
				false, 
				StringWrappedValueDto.fromJS({value: base64})
			).subscribe(() => {
				this.getTemplateVersions(this.templateId);
				this.cleanUp();
			})
		})
	}

	saveCurrentAsComplete(isAgreement: boolean) {
		this.isLoading = true;

		this._editorCoreService.setTemplateAsBase64(base64 => {
			if (isAgreement) {
				this._agreementService.saveDraftAsDraftTemplate(
					this.templateId, false, StringWrappedValueDto.fromJS({value: base64})
				)
				.subscribe(() => {
					this.getTemplateVersions(this.templateId);
					this.cleanUp();
				})
			} else {
				this._dialog.open(SaveAsPopupComponent, {
					data: {
						document: this.selectedVersion,
						base64,
						isAgreement
					},
					height: 'auto',
					width: '500px',
					maxWidth: '100%',
					disableClose: true,
					hasBackdrop: true,
					backdropClass: 'backdrop-modal--wrapper',
				}).afterClosed().pipe(
					map(res => {
						if (res) {
							return res;
						} else {
							this.isLoading = false;
							this.chd.detectChanges();
							return null;
						}
					}),
					filter(res => !!res),
					switchMap((res: CompleteTemplateDocumentFileDraftDto) => 
						this._agreementService.saveCurrentAsCompleteTemplate(
							this.templateId, 
							res
						).pipe(
							tap(() => {
								if (isAgreement) {
									this.getTemplateVersions(this.templateId);
								}
							})
						))
				).subscribe(() => {
					this.cleanUp();
				});
			}
		})
	}

	saveDraftAsDraft() {
		this.isLoading = true;
		
		this._editorCoreService.setTemplateAsBase64(base64 => {
			this._agreementService.saveDraftAsDraftTemplate(
				this.templateId, false, StringWrappedValueDto.fromJS({value: base64})
			)
			.subscribe(() => {
				this.cleanUp();
			})
		})
	}

	saveDraftAsComplete() {
		this.isLoading = true;

		this._editorCoreService.setTemplateAsBase64(base64 => {
			this._agreementService.saveDraftAndCompleteTemplate(
				this.templateId,
				StringWrappedValueDto.fromJS({value: base64}),
				this.selectedVersion
			)
			.subscribe((res) => {
				if (res) {
					this.showSnackbar();
					this.getTemplateVersions(this.templateId);
				}
				
				this.isLoading = false;
				this.hasUnsavedChanges$.next(false);
				this.chd.detectChanges();
			})
		})
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

	cleanUp() {
		this.showSnackbar();
		this.isLoading = false;
		this._editorCoreService.removeUnsavedChanges();
		this.chd.detectChanges();
	}

	showSnackbar() {
		this._snackBar.open('Successdully saved!', '', {
			duration: 2500,
			panelClass: 'green-panel'
		});
	}
}
