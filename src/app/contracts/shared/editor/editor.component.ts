import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, filter, map, pluck, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { BehaviorSubject, of, Subject } from 'rxjs';

// Project Specific
import { CommentService, CompareService, EditorCoreService } from './services';
import { RichEditorDirective } from './directives';
import { RichEditorOptionsProvider } from './providers';
import { IDocumentItem, IDocumentVersion, IMergeField } from './entities';

import { InsertMergeFieldPopupComponent } from './components/insert-merge-field-popup';
import { CompareSelectVersionPopupComponent } from './components/compare-select-version-popup';
import { CompareSelectDocumentPopupComponent } from './components/compare-select-document-popup';
import { SaveAsPopupComponent } from './components/save-as-popup/save-as-popup.component';

import { AgreementAbstractService } from './data-access/agreement-abstract.service';
import { MergeFieldsAbstractService } from './data-access/merge-fields-abstract';

import { MatButtonModule } from '@angular/material/button';
import { CommentSidebarComponent } from './components/comment-sidebar/comment-sidebar.component';
import { inOutPaneAnimation } from './entities/animations';
import { IntervalApi } from 'devexpress-richedit/lib/model-api/interval';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
	AgreementCommentDto,
	AgreementServiceProxy,
	AgreementTemplateCommentDto,
	CompleteTemplateDocumentFileDraftDto,
	SendDocuSignEnvelopeCommand,
	SendEmailEnvelopeCommand,
	StringWrappedValueDto,
} from 'src/shared/service-proxies/service-proxies';
import { MatSnackBar } from '@angular/material/snack-bar';
import { custom } from 'devextreme/ui/dialog';
import { EditorObserverService } from '../services/editor-observer.service';
import { SignersPreviewDialogComponent } from 'src/app/workflow/workflow-contracts/legal-contracts/signers-preview-dialog/signers-preview-dialog.component';
import {
	EDocuSignMenuOption,
	EEmailMenuOption,
} from 'src/app/workflow/workflow-contracts/legal-contracts/signers-preview-dialog/signers-preview-dialog.model';
import { NotificationPopupComponent } from './components/notification-popup';
import { CommentsAbstractService } from './data-access/comments-abstract.service';

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
		AppCommonModule,
	],
	providers: [RichEditorOptionsProvider, CompareService, CommentService, EditorCoreService, EditorObserverService],
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
	isAgreement$ = this._route.data.pipe(pluck('isAgreement'));

	selectedVersion: IDocumentVersion = null;
	versions: IDocumentVersion[] = [];
	isLatestVersionSelected$ = new BehaviorSubject(false);

	commentSidebarEnabled$ = this._editorCoreService.commentSidebarEnabled$;
	comments$ = new BehaviorSubject<Array<AgreementCommentDto | AgreementTemplateCommentDto>>([]);
	currentTemplateVersion: number | undefined;
	prevValue = 0;

	isLoading: boolean = false;
	isPageLoading: boolean = true;

	selectedVersionControl = new FormControl();

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _location: Location,
		private _agreementService: AgreementAbstractService,
		private _commentService: CommentsAbstractService,
		private _mergeFieldsService: MergeFieldsAbstractService,
		private _editorCoreService: EditorCoreService,
		private _dialog: MatDialog,
		private _chd: ChangeDetectorRef,
		private _snackBar: MatSnackBar,
		private _editorObserverService: EditorObserverService,
		private _agreementServiceProxy: AgreementServiceProxy
	) {}

	ngOnInit(): void {
		this.isLoading = true;
		this.templateId = this._route.snapshot.params.id;
		const clientPeriodID = this._route.snapshot.queryParams.clientPeriodId;

		this.registerChangeVersionListener(this.selectedVersionControl);
		this.registerAgreementChangeNotifier(this.templateId, clientPeriodID);

		this.getTemplateVersions(this.templateId);
		// this.loadComments(this.templateId, true);

		this._agreementService.getSimpleList().subscribe((res) => {
			this.documentList$.next(res);
		});

		this._mergeFieldsService.getMergeFields(this.templateId).subscribe((res) => {
			this._editorCoreService.applyMergeFields(res);
			this.mergeFields$.next(res);
		});
	}

	ngOnDestroy(): void {
		this._destroy$.next();
		this._destroy$.complete();
	}

	getTemplateVersions(templateId: number) {
		this._agreementService.getTemplateVersions(templateId).subscribe((res) => {
			this.versions = res;
			this.currentTemplateVersion = res.length ? res[res.length - 1].version : 1;
			this.templateVersions$.next(res || []);
			this.selectedVersionControl.setValue(this.currentTemplateVersion);
		});
	}

	loadTemplate(templateId: number, version: number) {
		this.isLoading = true;
		this.isPageLoading = true;

		this._agreementService
			.getTemplateByVersion(templateId, version)
			.pipe(
				catchError(() => {
					this.isLoading = false;
					this.isPageLoading = false;
					return of(null);
				})
			)
			.subscribe((tmp) => {
				this.template$.next(tmp);
				this.isLoading = false;
				this.isPageLoading = false;

				if (tmp) {
					if (version === this.versions[this.versions.length - 1].version) {
						this.isLatestVersionSelected$.next(true);
					} else {
						this.isLatestVersionSelected$.next(false);
					}

					this._editorCoreService.loadDocument(tmp);
					this.selectedVersion = this.versions[version - 1];
					this._chd.detectChanges();
				} else {
					this._editorCoreService.newDocument();
					this.selectedVersion = null;
				}
			});
	}

	registerChangeVersionListener(control: FormControl) {
		this.prevValue = control.value;

		control.valueChanges
			.pipe(
				takeUntil(this._destroy$),
				withLatestFrom(this._editorCoreService.hasUnsavedChanges$),
				tap(([version, hasChanges]) => {
					if (hasChanges) {
						this._showCompleteConfirmDialog((confirmed) => {
							if (confirmed) {
								this.prevValue = version;
								this._editorCoreService.removeUnsavedChanges();
								this.loadTemplate(this.templateId, version);
							} else {
								control.setValue(this.prevValue, { emitEvent: false });
							}
						});
					} else {
						this.prevValue = version;
						this._editorCoreService.removeUnsavedChanges();
						this.loadTemplate(this.templateId, version);
					}
				})
			)
			.subscribe();
	}

	registerAgreementChangeNotifier(templateId?: number, clientPeriodID?: string) {
		(!templateId && !clientPeriodID
			? of(null)
			: templateId
			? this._editorObserverService.runAgreementEditModeNotifier(templateId)
			: this._editorObserverService.runAgreementCreateModeNotifier(clientPeriodID)
		)
			.pipe(takeUntil(this._destroy$))
			.subscribe();
	}

	mergeSelectedField(fields: string[]) {
		fields.forEach((field, index) => {
			setTimeout(() => {
				this._editorCoreService.insertMergeField(field);
			})
		})
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

	loadComments(templateID: number, isInitial: boolean = false) {
		this._editorCoreService.afterViewInit$
			.pipe(switchMap(() => this._commentService.getByTemplateID(templateID)))
			.subscribe((comments) => {
				this.comments$.next(comments);
				this._editorCoreService.insertComments(comments);
				if (isInitial) {
					this._editorCoreService.editor.hasUnsavedChanges = false;
					this._editorCoreService.hasUnsavedChanges$.next(false);
				}
			});
	}

	createComment({ body, interval }: { body: string; interval: IntervalApi }) {
		let tmpID = this.templateId;
		let version = this.currentTemplateVersion;

		this._commentService.createComment(tmpID, version, body).subscribe((commentID) => {
			this._editorCoreService.registerCommentThread(interval, commentID);
			this.loadComments(tmpID);

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

	editComment({ body, entityID }: { body: string; entityID: number }) {
		this._commentService.editComment(entityID, body).subscribe(() => {
			this.comments$.next(
				this.comments$.value.map((comment) => {
					if (comment.id === entityID) {
						return { ...comment, text: body } as AgreementCommentDto;
					}
					return comment;
				})
			);
			this._editorCoreService.applyCommentChanges(entityID);
		});
	}

	saveAsComplete() {
		if (this.selectedVersion.isCurrent) {
			this.isAgreement$.subscribe((res) => {
				this.saveCurrentAsComplete(!!res);
			});
		} else {
			this.isAgreement$.subscribe(() => {
				this.saveDraftAsComplete();
			});
		}
	}

	saveCurrentAsDraft() {
		this.isLoading = true;
		this._editorCoreService.toggleFields();

		this._editorCoreService.setTemplateAsBase64((base64) => {
			this._agreementService
				.saveCurrentAsDraftTemplate(this.templateId, false, StringWrappedValueDto.fromJS({ value: base64 }))
				.subscribe(() => {
					this.getTemplateVersions(this.templateId);
					this.cleanUp();
				});
		});
	}

	saveCurrentAsComplete(isAgreement: boolean) {
		this.isLoading = true;
		this._editorCoreService.toggleFields();

		this._editorCoreService.setTemplateAsBase64((base64) => {
			if (isAgreement) {
				this._agreementService
					.saveDraftAsDraftTemplate(this.templateId, false, StringWrappedValueDto.fromJS({ value: base64 }))
					.subscribe(() => {
						this.getTemplateVersions(this.templateId);
						this.cleanUp();
					});
			} else {
				this._dialog
					.open(SaveAsPopupComponent, {
						data: {
							document: this.selectedVersion,
							base64,
							isAgreement,
							versions: this.versions,
						},
						height: 'auto',
						width: '540px',
						maxWidth: '100%',
						disableClose: true,
						hasBackdrop: true,
						backdropClass: 'backdrop-modal--wrapper',
					})
					.afterClosed()
					.pipe(
						map((res) => {
							if (res) {
								return res;
							} else {
								this.isLoading = false;
								this._chd.detectChanges();
								return null;
							}
						}),
						filter((res) => !!res),
						switchMap((res: CompleteTemplateDocumentFileDraftDto) =>
							this._agreementService.saveCurrentAsCompleteTemplate(this.templateId, res).pipe(
								tap(() => {
									if (isAgreement) {
										this.getTemplateVersions(this.templateId);
									}
								})
							)
						)
					)
					.subscribe(() => {
						this.cleanUp();
					});
			}
		});
	}

	saveDraftAsDraft() {
		this.isLoading = true;
		this._editorCoreService.toggleFields();

		this._editorCoreService.setTemplateAsBase64((base64) => {
			this._agreementService
				.saveDraftAsDraftTemplate(this.templateId, false, StringWrappedValueDto.fromJS({ value: base64 }))
				.subscribe(() => {
					this.cleanUp();
				});
		});
	}

	promoteToDraft() {
		this.isLoading = true;
		this._editorCoreService.toggleFields();

		this._editorCoreService.setTemplateAsBase64((base64) => {
			this._agreementService
				.saveCurrentAsDraftTemplate(this.templateId, false, StringWrappedValueDto.fromJS({ value: base64 }))
				.subscribe(() => {
					this.getTemplateVersions(this.templateId);
					this.cleanUp();
				});
		});
	}

	saveDraftAsComplete() {
		this.isLoading = true;
		this._editorCoreService.toggleFields();

		this._editorCoreService.setTemplateAsBase64((base64) => {
			this._agreementService
				.saveDraftAndCompleteTemplate(
					this.templateId,
					StringWrappedValueDto.fromJS({ value: base64 }),
					this.selectedVersion,
					this.versions
				)
				.subscribe((res) => {
					if (res) {
						this.showSnackbar();
						this.getTemplateVersions(this.templateId);
					}

					this.isLoading = false;
					this._editorCoreService.removeUnsavedChanges();
					this._chd.detectChanges();
				});
		});
	}

	sendEmail() {
		if (this._editorCoreService.getUnsavedChanges()) {
			this._dialog.open(NotificationPopupComponent, {
				width: '500px',
				data: {
					title: 'Oops! Please check your request',
					body: 'Changes were added to the agreement. Please reverse applied changes or Save as a new version in order to proceed.',
				},
			});
		} else {
			this._agreementServiceProxy.envelopeRecipientsPreview([this.templateId], true).subscribe((result) => {
				const dialogRef = this._dialog.open(SignersPreviewDialogComponent, {
					width: '100vw',
					maxWidth: '100vw',
					height: 'calc(100vh - 115px)',
					panelClass: 'signers-preview--modal',
					autoFocus: false,
					hasBackdrop: true,
					backdropClass: 'backdrop-modal--wrapper',
					data: {
						envelopePreviewList: result,
						singleEmail: true,
					},
				});

				dialogRef.componentInstance.onSendViaEmail.subscribe((option: any) => {
					this._sendViaEmail([this.templateId], true, option);
				});
				dialogRef.componentInstance.onSendViaDocuSign.subscribe((option: any) => {
					this._sendViaDocuSign([this.templateId], true, option);
				});
			});
		}
	}

	private _sendViaEmail(agreementIds: number[], singleEmail: boolean, option: EEmailMenuOption) {
		let input = new SendEmailEnvelopeCommand({
			agreementIds: agreementIds,
			singleEmail: singleEmail,
			convertDocumentFileToPdf: option === EEmailMenuOption.AsPdfFile,
		});
		this._agreementServiceProxy.sendEmailEnvelope(input).subscribe(() =>
			this._snackBar.open('Successfully sent!', '', {
				duration: 2500,
				panelClass: 'green-panel',
			})
		);
	}

	private _sendViaDocuSign(agreementIds: number[], singleEnvelope: boolean, option: EDocuSignMenuOption) {
		let input = new SendDocuSignEnvelopeCommand({
			agreementIds: agreementIds,
			singleEnvelope: singleEnvelope,
			createDraftOnly: option === EDocuSignMenuOption.CreateDocuSignDraft,
		});
		this._agreementServiceProxy.sendDocusignEnvelope(input).subscribe(() =>
			this._snackBar.open('Successfully sent!', '', {
				duration: 2500,
				panelClass: 'green-panel',
			})
		);
	}

	cancel() {
		this._location.back();
	}

	cleanUp() {
		this.showSnackbar();
		this.isLoading = false;
		this._editorCoreService.removeUnsavedChanges();
		this._chd.detectChanges();
	}

	showSnackbar() {
		this._snackBar.open('Successfully saved!', '', {
			duration: 2500,
			panelClass: 'green-panel',
		});
	}

	private _showCompleteConfirmDialog(callback: (value: boolean) => void) {
		let dialog = custom({
			title: 'You have unsaved changes!',
			buttons: [
				{ type: 'normal', text: 'No', onClick: () => false },
				{ type: 'danger', text: 'Yes', onClick: () => true },
			],
			messageHtml: `
                <p>All changes will be lost!</p>
                <p>Are you sure you want to proceed with loosing data?</p>`,
		});

		dialog.show().then((res) => {
			callback(res);
		});
	}
}
