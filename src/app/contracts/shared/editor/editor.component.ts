import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, filter, map, pluck, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { BehaviorSubject, forkJoin, Observable, of, Subject } from 'rxjs';

// Project Specific
import { CommentService, CompareService, EditorCoreService } from './services';
import { RichEditorDirective } from './directives';
import { RichEditorOptionsProvider } from './providers';
import { IDocumentItem, IDocumentVersion, IMergeField, IMergeFieldState } from './entities';

import { InsertMergeFieldPopupComponent } from './components/insert-merge-field-popup';
import { CompareSelectVersionPopupComponent } from './components/compare-select-version-popup';
import { CompareSelectDocumentPopupComponent } from './components/compare-select-document-popup';
import { SaveAsPopupComponent } from './components/save-as-popup/save-as-popup.component';

import { AgreementAbstractService } from './data-access/agreement-abstract.service';
import { MergeFieldsAbstractService } from './data-access/merge-fields-abstract';

import { MatButtonModule } from '@angular/material/button';
import { CommentSidebarComponent } from './components/comment-sidebar/comment-sidebar.component';
import { inOutPaneAnimation } from './entities/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AppCommonModule } from 'src/app/shared/common/app-common.module';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
	AgreementServiceProxy,
	CompleteTemplateDocumentFileDraftDto,
	EnvelopeStatus,
	SendDocuSignEnvelopeCommand,
	SendEmailEnvelopeCommand,
	StringWrappedValueDto,
} from 'src/shared/service-proxies/service-proxies';
import { custom } from 'devextreme/ui/dialog';
import { EditorObserverService } from '../services/editor-observer.service';
import { SignersPreviewDialogComponent } from 'src/app/workflow/workflow-contracts/legal-contracts/signers-preview-dialog/signers-preview-dialog.component';
import {
	EDocuSignMenuOption,
	EEmailMenuOption,
} from 'src/app/workflow/workflow-contracts/legal-contracts/signers-preview-dialog/signers-preview-dialog.model';
import { NotificationPopupComponent } from './components/notification-popup';
import { CommentsAbstractService } from './data-access/comments-abstract.service';
import { VoidEnvelopePopupComponent } from './components/void-envelope-popup/void-envelope-popup.component';
import { NotificationType, NotifierService } from './services/notifier.service';
import { ExtraHttpsService } from '../services/extra-https.service';

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
		VoidEnvelopePopupComponent,
		InsertMergeFieldPopupComponent,
		CompareSelectVersionPopupComponent,
		CompareSelectDocumentPopupComponent,
		CommentSidebarComponent,
		MatFormFieldModule,
		MatSelectModule,
		AppCommonModule,
	],
	providers: [
		RichEditorOptionsProvider,
		NotifierService,
		CompareService,
		CommentService,
		EditorCoreService,
		EditorObserverService,
	],
	animations: [inOutPaneAnimation],
})
export class EditorComponent implements OnInit, OnDestroy {
	_destroy$ = new Subject();
	templateId: number | undefined;
	notification$ = this._notifierService.notification$;
	hasUnsavedChanges$ = this._editorCoreService.hasUnsavedChanges$;
	template$ = new BehaviorSubject<File | Blob | ArrayBuffer | string>(null);
	documentList$ = new BehaviorSubject<IDocumentItem[]>([]);
	templateVersions$ = new BehaviorSubject<IDocumentVersion[]>([]);
	mergeFields$ = new BehaviorSubject<IMergeField>({});
	isAgreement$ = this._route.data.pipe(pluck('isAgreement'));
	isAgreement: boolean = false;

	selectedVersion: IDocumentVersion = null;
	versions: IDocumentVersion[] = [];
	isLatestVersionSelected$ = new BehaviorSubject(false);

	commentSidebarEnabled$ = this._editorCoreService.commentSidebarEnabled$;
	currentTemplateVersion: number | undefined;
	currentVersionIsSent: boolean = null;
	prevValue = 0;

	isLoading: boolean = false;
	isPageLoading: boolean = true;
	mergeFieldStateBeforeProcessing: IMergeFieldState = null;

	selectedVersionControl = new FormControl();

	envelopeStatuses = EnvelopeStatus;

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
		private _notifierService: NotifierService,
		private _editorObserverService: EditorObserverService,
		private _agreementServiceProxy: AgreementServiceProxy,
		private _extraHttp: ExtraHttpsService
	) {}

	ngOnInit(): void {
		this.isLoading = true;
		this.templateId = this._route.snapshot.params.id;
		const clientPeriodID = this._route.snapshot.queryParams.clientPeriodId;

		this.registerChangeVersionListener(this.selectedVersionControl);
		this.registerAgreementChangeNotifier(this.templateId, clientPeriodID);

		this.getTemplateVersions(this.templateId, () => {
			if (!this.currentVersionIsSent) {
				this.loadComments(this.templateId, true);
			}
		});

		this._agreementService.getSimpleList().subscribe((res) => {
			this.documentList$.next(res);
		});

		this._mergeFieldsService.getMergeFields(this.templateId).subscribe((res) => {
			this.mergeFields$.next(res);
		});

		this.isAgreement$.pipe(take(1)).subscribe((res) => {
			this.isAgreement = !!res;
		});

		this.hasUnsavedChanges$.pipe(takeUntil(this._destroy$)).subscribe((hasUnsavedChanges) => {
			if (hasUnsavedChanges) {
				this._notifierService.notify(NotificationType.ChangesNotSavedYet);
			} else {
				if (this._notifierService.currentNotification?.id === NotificationType.ChangesNotSavedYet) {
					this._notifierService.notify(NotificationType.Noop);
				}
			}
		});
	}

	ngOnDestroy(): void {
		this._destroy$.next();
		this._destroy$.complete();
	}

	getTemplateVersions(templateId: number, callback?: () => void) {
		this._agreementService.getTemplateVersions(templateId).subscribe((res) => {
			this.versions = res;
			this.currentTemplateVersion = res.length ? res[res.length - 1].version : 1;
			this.templateVersions$.next(res || []);
			this.selectedVersionControl.setValue(this.currentTemplateVersion);
			this.updateViewModeByVersion(this.currentTemplateVersion);
			if (callback && typeof callback === 'function') {
				callback();
			}
		});
	}

	loadTemplate(templateId: number, version: number) {
		this.isLoading = true;
		this.isPageLoading = true;
		this._agreementService
			.getTemplateByVersion(templateId, version)
			.pipe(catchError(() => of(null)))
			.subscribe((tmp) => {
				this.template$.next(tmp);
				this.loadComments(templateId, false);

				if (tmp) {
					if (version === this.versions[this.versions.length - 1].version) {
						this.isLatestVersionSelected$.next(true);
					} else {
						this.isLatestVersionSelected$.next(false);
					}
					this.selectedVersion = this.versions[version - 1];
					this._chd.detectChanges();
				} else {
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
								this.updateViewModeByVersion(version);
								this.loadTemplate(this.templateId, version);
							} else {
								control.setValue(this.prevValue, { emitEvent: false });
							}
						});
					} else {
						this.prevValue = version;
						this._editorCoreService.removeUnsavedChanges();
						this.updateViewModeByVersion(version);
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

	updateViewModeByVersion(version: number) {
		let isAgreement = this._route.snapshot.data.isAgreement || false;
		let versionMetaData = this.versions.find((v) => v.version === version);
		this.currentVersionIsSent =
			isAgreement &&
			versionMetaData &&
			versionMetaData.isCurrent &&
			versionMetaData.envelopeStatus &&
			[3, 10].includes(versionMetaData.envelopeStatus);
	}

	handleDocumentReady() {
		this.isLoading = false;
		this.isPageLoading = false;
	}

	mergeSelectedField(fields: string[]) {
		fields.forEach((field, index) => {
			setTimeout(() => {
				this._editorCoreService.insertMergeField(field, index > 0);
			});
		});
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
				this._editorCoreService.insertComments(comments);
				if (isInitial) {
					this._editorCoreService.editor.hasUnsavedChanges = false;
					this._editorCoreService.hasUnsavedChanges$.next(false);
				}
			});
	}

	createComment({ text, metadata }: { text: string; metadata: string }) {
		let tmpID = this.templateId;
		this._commentService
			.createComment(tmpID, text, metadata)
			.pipe(
				switchMap((id) =>
					this._commentService.getByTemplateID(tmpID).pipe(map((res) => res.find((comment) => comment.id === id)))
				)
			)
			.subscribe((comment) => {
				this._editorCoreService.applyNewComment(comment);
			});
	}

	deleteComment(entityID: number) {
		this._commentService.deleteComment(entityID).subscribe(() => {
			this._editorCoreService.deleteComment(entityID);
		});
	}

	editComment({ text, entityID, metadata }: { text: string; metadata: string; entityID: number }) {
		this._commentService.editComment(entityID, text, metadata).subscribe(() => {
			this._editorCoreService.applyCommentChanges(entityID, text);
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
		this.prepareToProcessDocument();
		let version = this.selectedVersion.version + 1;
		this._notifierService.notify(NotificationType.VersionBeingCreated, { version });

		this._editorCoreService.setTemplateAsBase64((base64) => {
			this._agreementService
				.saveCurrentAsDraftTemplate(this.templateId, false, StringWrappedValueDto.fromJS({ value: base64 }))
				.subscribe(() => {
					this._updateCommentByNeeds();
					this.getTemplateVersions(this.templateId);
					this.cleanUp();
					this._notifierService.notify(NotificationType.VersionCreatedSuccess, { version });
				});
		});
	}

	saveCurrentAsCompleteAgreementOnly() {
		this.prepareToProcessDocument();
		let version = this.selectedVersion.version + 1;
		this._notifierService.notify(NotificationType.VersionBeingCreated, { version });
		this._agreementService
			.unlockAgreementByConfirmation(this.templateId, this.selectedVersion.version)
			.subscribe((editOpened) => {
				if (editOpened) {
					this._editorCoreService.toggleFields();
					this._editorCoreService.setTemplateAsBase64((base64) => {
						this._agreementService
							.saveDraftAsDraftTemplate(this.templateId, false, StringWrappedValueDto.fromJS({ value: base64 }))
							.subscribe(() => {
								this._updateCommentByNeeds();
								this.getTemplateVersions(this.templateId);
								this.cleanUp();
								this._notifierService.notify(NotificationType.VersionCreatedSuccess, { version });
							});
					});
				} else {
					this.cleanUp(true);
					this._notifierService.notify(NotificationType.ChangesNotSavedYet);
				}
			});
	}

	saveCurrentAsComplete(isAgreement: boolean) {
		this.prepareToProcessDocument();

		this._editorCoreService.setTemplateAsBase64((base64) => {
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
							this._notifierService.notify(NotificationType.SavingChanges);
							return res;
						} else {
							this.cleanUp(true);
							return null;
						}
					}),
					filter((res) => !!res),
					switchMap((res: CompleteTemplateDocumentFileDraftDto) =>
						this._agreementService.saveCurrentAsCompleteTemplate(this.templateId, res).pipe(
							tap(() => {
								if (isAgreement) {
									this._updateCommentByNeeds();
									this.getTemplateVersions(this.templateId);
								}
							})
						)
					)
				)
				.subscribe(() => {
					this.cleanUp();
					this._notifierService.notify(NotificationType.ChangesSaved);
				});
		});
	}

	saveDraftAsDraft() {
		this.prepareToProcessDocument();
		let version = this.currentTemplateVersion;

		this._notifierService.notify(NotificationType.SavingAsADraft, { version });
		this._editorCoreService.setTemplateAsBase64((base64) => {
			this._agreementService
				.saveDraftAsDraftTemplate(this.templateId, false, StringWrappedValueDto.fromJS({ value: base64 }))
				.subscribe((res) => {
					this._updateCommentByNeeds();
					this.cleanUp();
					this._notifierService.notify(NotificationType.DraftSavedSuccess, { version });
				});
		});
	}

	promoteToDraft() {
		this.prepareToProcessDocument();

		this._editorCoreService.setTemplateAsBase64((base64) => {
			this._agreementService
				.saveCurrentAsDraftTemplate(this.templateId, false, StringWrappedValueDto.fromJS({ value: base64 }))
				.subscribe(() => {
					this._updateCommentByNeeds();
					this.getTemplateVersions(this.templateId);
					this.cleanUp();
				});
		});
	}

	saveDraftAsComplete() {
		this.prepareToProcessDocument();
		let sentVersion = this.versions.find((version) => version.envelopeStatus && version.envelopeStatus === 3);
		if (sentVersion) {
			this._notifierService.notify(NotificationType.EnvelopeBeingVoided, { version: sentVersion.version });
		} else {
			this._notifierService.notify(NotificationType.SavingChanges);
		}

		this._editorCoreService.setTemplateAsBase64((base64) => {
			this._agreementService
				.saveDraftAndCompleteTemplate(
					this.templateId,
					StringWrappedValueDto.fromJS({ value: base64 }),
					this.selectedVersion,
					this.versions
				)
				.subscribe((res) => {
					if (!res) {
						this.cleanUp(true);
						return this._notifierService.notifyPrevState();
					}

					this.cleanUp();
					this._updateCommentByNeeds();
					this.getTemplateVersions(this.templateId, () => {
						this.isLoading = false;
						if (sentVersion) {
							this._notifierService.notify(NotificationType.EnvelopeVoidedSuccess, {
								version: sentVersion.version,
							});
						} else {
							this._notifierService.notify(NotificationType.ChangesSaved);
						}
					});
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
					this._sendViaEmail([this.templateId], true, option, result[0].envelopeName);
				});
				dialogRef.componentInstance.onSendViaDocuSign.subscribe(({ option, emailBody, emailSubject }) => {
					this._sendViaDocuSign([this.templateId], true, option, result[0].envelopeName, emailBody, emailSubject);
				});
			});
		}
	}

	private _sendViaEmail(agreementIds: number[], singleEmail: boolean, option: EEmailMenuOption, envelopeName: string) {
		this._notifierService.notify(NotificationType.SendingInProgress);
		let input = new SendEmailEnvelopeCommand({
			agreementIds: agreementIds,
			singleEmail: singleEmail,
			convertDocumentFileToPdf: option === EEmailMenuOption.AsPdfFile,
		});
		this._extraHttp.sendEmailEnvelope(input).subscribe(() => {
			this._notifierService.notify(NotificationType.SentSuccessfully, { filename: envelopeName });
			this.getTemplateVersions(this.templateId);
		});
	}

	private _sendViaDocuSign(
		agreementIds: number[],
		singleEnvelope: boolean,
		option: EDocuSignMenuOption,
		envelopeName: string,
		emailBody: string,
		emailSubject: string
	) {
		this._notifierService.notify(NotificationType.SendingInProgress);
		let input = new SendDocuSignEnvelopeCommand({
			agreementIds: agreementIds,
			singleEnvelope: singleEnvelope,
			createDraftOnly: option === EDocuSignMenuOption.CreateDocuSignDraft,
			emailBody: emailBody,
			emailSubject: emailSubject,
		});
		this._extraHttp.sendDocusignEnvelope(input).subscribe(() => {
			this.getTemplateVersions(this.templateId);
			this._notifierService.notify(NotificationType.SentSuccessfully, { filename: envelopeName });
		});
	}

	cancel() {
		this._location.back();
	}

	cleanUp(skipUnsavedChangesCheck: boolean = false): void {
		this.isLoading = false;
		if (!this.isAgreement) {
			this._editorCoreService.toggleFields();
			this._editorCoreService.toggleMergedData();
		}
		this.rollbackMergeFieldViewState();

		if (!skipUnsavedChangesCheck) {
			this._editorCoreService.removeUnsavedChanges();
		}
		this._chd.detectChanges();
	}

	prepareToProcessDocument(): void {
		this.isLoading = true;
		this._takeMergeFieldStateSnapshot();
		this._editorCoreService.toggleFields();
		if (!this.isAgreement) {
			this._editorCoreService.toggleMergedData();
		}
	}

	rollbackMergeFieldViewState(): void {
		let fieldState = this.mergeFieldStateBeforeProcessing;

		if (fieldState !== undefined || fieldState !== null) {
			switch (fieldState) {
				case IMergeFieldState.Field:
					this._editorCoreService.toggleFields();
					break;
				case IMergeFieldState.Code:
					this._editorCoreService.showAllFieldCodes();
					break;
				case IMergeFieldState.Result:
					this._editorCoreService.showAllFieldResults();
			}

			this.mergeFieldStateBeforeProcessing = null;
		}
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

	private _updateCommentByNeeds() {
		of(this._editorCoreService.getSyncedCommentState())
			.pipe(
				switchMap(({ updated, deleted }) => {
					let obs: Array<Observable<unknown>> = [];
					if (updated && updated.length) {
						obs.push(this._commentService.updateMany(updated));
					}
					if (deleted && deleted.length) {
						obs.push(this._commentService.deleteMany(deleted));
					}
					return forkJoin(obs);
				})
			)
			.subscribe(() => {
				this.loadComments(this.templateId);
			});
	}

	private _takeMergeFieldStateSnapshot(): void {
		this.mergeFieldStateBeforeProcessing = this._editorCoreService.mergeFieldState;
	}
}
