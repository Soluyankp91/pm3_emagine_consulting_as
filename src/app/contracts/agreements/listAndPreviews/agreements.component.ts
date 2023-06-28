import {
	Component,
	ElementRef,
	OnInit,
	QueryList,
	ViewChildren,
	ViewEncapsulation,
	Injector,
	OnDestroy,
	ViewChild,
	TemplateRef,
	ChangeDetectorRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { ERouteTitleType } from 'src/shared/AppEnums';
import { TitleService } from 'src/shared/common/services/title.service';
import { Observable, combineLatest, ReplaySubject, Subject, fromEvent, Subscription, BehaviorSubject, EMPTY, of } from 'rxjs';
import { takeUntil, startWith, pairwise, switchMap, catchError, filter } from 'rxjs/operators';
import { map, tap } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { GetCountryCodeByLanguage } from 'src/shared/helpers/tenantHelper';
import {
	AgreementLanguage,
	AgreementListItemDto,
	AgreementListItemDtoPaginatedList,
	AgreementServiceProxy,
	AgreementType,
	AgreementDetailsPreviewDto,
	EnvelopeStatus,
	FileParameter,
} from 'src/shared/service-proxies/service-proxies';
import {
	AGREEMENT_BOTTOM_ACTIONS,
	AGREEMENT_HEADER_CELLS,
	BASE_AGREEMENT_ACTIONS,
	DISPLAYED_COLUMNS,
	INVALIDA_ENVELOPE_DOWNLOAD_MESSAGE,
	INVALID_MANUAL_AGREEMENT_UPLOAD_MESSAGE,
	MANUAL_AGREEMENT_UPLOAD_MESSAGE,
	INVALID_REMINDER_MESSAGE,
	SEND_REMINDER_CONFIRMATION_MESSAGE,
	SEND_REMINDER_SUCCESS_MESSAGE,
} from '../../../shared/components/grid-table/agreements/entities/agreements.constants';
import { ITableConfig } from '../../../shared/components/grid-table/mat-grid.interfaces';
import { NotificationDialogComponent } from '../../shared/components/popUps/notification-dialog/notification-dialog.component';
import { AgreementFiltersEnum, MappedAgreementTableItem, MappedTableCells } from '../../shared/entities/contracts.interfaces';
import { ContractsService } from '../../shared/services/contracts.service';
import { DownloadFilesService } from '../../shared/services/download-files.service';
import { GridHelpService } from '../../shared/services/mat-grid-service.service';
import { DownloadFile, DownloadFileAsDataURL } from '../../shared/utils/download-file';
import { AgreementPreviewComponent } from './components/agreement-preview/agreement-preview.component';
import { AgreementService } from './services/agreement.service';
import { ActionDialogComponent } from '../../shared/components/popUps/action-dialog/action-dialog.component';
import { DefaultFileUploaderComponent } from '../../shared/components/default-file-uploader/default-file-uploader.component';
import { ExtraHttpsService } from '../../shared/services/extra-https.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
	selector: 'app-agreements',
	templateUrl: './agreements.component.html',
	styleUrls: ['./agreements.component.scss'],
	providers: [GridHelpService],
	encapsulation: ViewEncapsulation.None,
})
export class AgreementsComponent extends AppComponentBase implements OnInit, OnDestroy {
	@ViewChildren(AgreementPreviewComponent, { read: ElementRef }) preview: QueryList<ElementRef>;
	cells = this._gridHelpService.generateTableConfig(DISPLAYED_COLUMNS, AGREEMENT_HEADER_CELLS);
	displayedColumns = DISPLAYED_COLUMNS;
	table$: Observable<ITableConfig>;

	baseActions = BASE_AGREEMENT_ACTIONS;
	selectedItemsActions = AGREEMENT_BOTTOM_ACTIONS;

	dataSource$: Observable<AgreementListItemDtoPaginatedList> = this._agreementService.getContracts$();
	currentRowInfo$: ReplaySubject<{ name: string; id: number } | null> = new ReplaySubject(1);

	private _outsideClicksSub: Subscription;

	private _unSubscribe$ = new Subject<void>();

	@ViewChild('dialogFileUpload') dialogUploaderTemplate: TemplateRef<any>;
	@ViewChildren(DefaultFileUploaderComponent, { read: DefaultFileUploaderComponent })
	defaultFileUploaderComponents: QueryList<DefaultFileUploaderComponent>;

	get defaultFileUploaderComponent(): DefaultFileUploaderComponent {
		return this.defaultFileUploaderComponents.get(0) as DefaultFileUploaderComponent;
	}

	constructor(
		private readonly _router: Router,
		private readonly _route: ActivatedRoute,
		private readonly _gridHelpService: GridHelpService,
		private readonly _agreementService: AgreementService,
		private readonly _agreementServiceProxy: AgreementServiceProxy,
		private readonly _contractService: ContractsService,
		private readonly _downloadFilesService: DownloadFilesService,
		private readonly _snackBar: MatSnackBar,
		private readonly _dialog: MatDialog,
		private readonly _extraHttp: ExtraHttpsService,
		private readonly _cdr: ChangeDetectorRef,
		private readonly _injector: Injector,
		private readonly _titleService: TitleService
	) {
		super(_injector);
	}

	ngOnInit(): void {
		this._titleService.setTitle(ERouteTitleType.ContractAgreement);
		this._initTable$();
		this._initPreselectedFilters();
		this._subscribeOnOuterClicks();
		this._subscribeOnLoading();
	}
	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
	}

	onSortChange($event: Sort) {
		this._agreementService.updateSort($event);
	}

	onFormControlChange($event: AgreementFiltersEnum) {
		this._agreementService.updateTableFilters($event);
	}

	onPageChange($event: PageEvent) {
		this._agreementService.updatePage($event);
	}

	onAction($event: { row: AgreementListItemDto; action: string }) {
		switch ($event.action) {
			case 'UPLOAD_SIGNED_CONTRACT':
				const acceptButtonDisabled$ = new BehaviorSubject(true);
				let dialogRef = this._dialog.open(ActionDialogComponent, {
					width: '500px',
					height: '306px',
					backdropClass: 'backdrop-modal--wrapper',
					data: {
						label: 'Upload contract',
						message: MANUAL_AGREEMENT_UPLOAD_MESSAGE,
						acceptButtonLabel: 'Upload',
						cancelButtonLabel: 'Cancel',
						template: this.dialogUploaderTemplate,
						acceptButtonDisabled$: acceptButtonDisabled$,
					},
				});
				dialogRef
					.afterOpened()
					.pipe(switchMap(() => this.defaultFileUploaderComponent.file$))
					.subscribe(() => {
						acceptButtonDisabled$.next(false);
					});
				let file$: ReplaySubject<FileParameter>;
				dialogRef
					.afterClosed()
					.pipe(
						switchMap((proceed) => {
							if (!proceed) {
								return EMPTY;
							}
							file$ = this.defaultFileUploaderComponent.file$;
							return file$;
						}),
						tap(() => {
							this.showMainSpinner();
						}),
						switchMap((file) =>
							this._extraHttp
								.uploadSigned($event.row.agreementId, false, {
									fileName: file.fileName,
									data: file.data,
								})
								.pipe(
									catchError((err: HttpErrorResponse) => {
										if (
											err?.error?.error?.code &&
											err.error.error.code === 'contracts.documents.cant.upload.completed.in.docusign'
										) {
											this.hideMainSpinner();
											this._dialog.open(NotificationDialogComponent, {
												width: '500px',
												backdropClass: 'backdrop-modal--wrapper',
												data: {
													label: 'Upload contract',
													message: 'Cannot upload completed contract in DocuSign.',
												},
											});
											return EMPTY;
										}

										this.hideMainSpinner();
										dialogRef = this._dialog.open(ActionDialogComponent, {
											width: '500px',
											height: '350px',
											backdropClass: 'backdrop-modal--wrapper',
											data: {
												label: 'Upload contract',
												message: INVALID_MANUAL_AGREEMENT_UPLOAD_MESSAGE,
												acceptButtonLabel: 'Upload',
												cancelButtonLabel: 'Cancel',
												template: this.dialogUploaderTemplate,
												acceptButtonDisabled$: acceptButtonDisabled$,
											},
										});
										dialogRef
											.afterOpened()
											.pipe(
												tap(() => {
													this._cdr.detectChanges();
													this.defaultFileUploaderComponent.file$ = file$;
												})
											)
											.subscribe();

										return dialogRef.afterClosed().pipe(
											switchMap((proceed) => {
												if (!proceed) {
													return EMPTY;
												}
												return file$;
											}),
											tap(() => {
												this.showMainSpinner();
											}),
											switchMap(() =>
												this._extraHttp.uploadSigned($event.row.agreementId, true, {
													fileName: file.fileName,
													data: file.data,
												})
											)
										);
									})
								)
						),
						tap(() => {
							this.hideMainSpinner();
						})
					)
					.subscribe(() => {
						this._snackBar.open('Signed contract uploaded', undefined, {
							duration: 5000,
						});
						setTimeout(() => {
							this._agreementService.reloadTable();
						}, 500);
					});
				break;
			case 'DOWNLOAD_SIGNED_CONTRACT':
				this.showMainSpinner();
				this._downloadFilesService.signedDocument($event.row.agreementId).subscribe((d) => {
					this.hideMainSpinner();
					DownloadFileAsDataURL(d as any, `${$event.row.agreementId}`);
				});
				break;
			case 'DOWNLOAD_PDF':
				this.showMainSpinner();
				this._downloadFilesService.pdf($event.row.agreementId).subscribe((d) => {
					this.hideMainSpinner();
					DownloadFile(d as any, `${$event.row.agreementId}.pdf`);
				});
				break;
			case 'DOWNLOAD_DOC':
				this.showMainSpinner();
				this._downloadFilesService.latestAgreementVersion($event.row.agreementId, true).subscribe((d) => {
					this.hideMainSpinner();
					DownloadFile(d as any, `${$event.row.agreementId}.doc`);
				});
				break;
			case 'WORKFLOW_LINK':
				let url = this._router.serializeUrl(this._router.createUrlTree(['app', 'workflow', `${$event.row.workflowId}`]));
				window.open(url, '_blank');
				break;
			case 'EDIT':
				this._router.navigate([`${$event.row.agreementId}`, 'settings'], { relativeTo: this._route });
				break;
			case 'DELETE':
				this.showMainSpinner();
				this._agreementServiceProxy.agreementDELETE($event.row.agreementId).subscribe(() => {
					this._snackBar.open('Agreement was deleted', undefined, {
						duration: 5000,
					});
					setTimeout(() => {
						this._agreementService.reloadTable();
					}, 1000);
				});
				break;
		}
	}

	catchManualUploadError() {}

	onSelectionAction($event: { selectedRows: AgreementListItemDto[]; action: string }) {
		switch ($event.action) {
			case 'REMINDER':
				this._handleReminderEvent($event.selectedRows);
				break;

			case 'DOWNLOAD':
				this._handleDownloadEvent($event.selectedRows);
				break;
		}
	}

	onSelectRowId(selectionRowID: number, rows: AgreementListItemDto[]) {
		if (selectionRowID) {
			let rowData = rows.find((r) => r.agreementId === selectionRowID);
			this.currentRowInfo$.next({ id: rowData.agreementId, name: rowData.agreementName });
		} else {
			this.currentRowInfo$.next(null);
		}
	}

	resetAllTopFilters() {
		this._agreementService.updateSearchFilter('');
		this._agreementService.updateTenantFilter([]);
	}

	private _handleDownloadEvent(selectedRows: AgreementListItemDto[]) {
		this.showMainSpinner();
		this._downloadFilesService
			.agreementFiles(selectedRows.map((selectedRow) => selectedRow.agreementId))
			.pipe(
				tap(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((d) => DownloadFile(d as any, 'signed-documents.zip'));
	}

	private _handleReminderEvent(selectedRows: AgreementListItemDto[]) {
		const allowedStatuses = [EnvelopeStatus.Sent, EnvelopeStatus.AboutToExpire, EnvelopeStatus.WaitingForOthers];
		const eachRowIsValid = selectedRows.every(
			(row) => allowedStatuses.includes(row.status) && row.envelopeProcessingPath === 2
		);

		if (eachRowIsValid) {
			let selectedRowsIds = selectedRows.map((row) => row.agreementId);
			this._dialog
				.open(ActionDialogComponent, {
					width: '500px',
					backdropClass: 'backdrop-modal--wrapper',
					data: {
						label: 'Send a reminder',
						message: SEND_REMINDER_CONFIRMATION_MESSAGE,
						acceptButtonLabel: 'SEND',
						cancelButtonLabel: 'Cancel',
						acceptButtonClass: 'confirm-button',
					},
				})
				.afterClosed()
				.pipe(
					filter((proceed) => proceed),
					tap(() => this.showMainSpinner()),
					switchMap(() => this._agreementServiceProxy.resendDocusignEnvelope(selectedRowsIds))
				)
				.subscribe((res) => {
					this._snackBar.open(SEND_REMINDER_SUCCESS_MESSAGE, 'X', {
						panelClass: ['general-snackbar-success'],
						duration: 5000,
					});
					setTimeout(() => {
						this._agreementService.reloadTable();
					}, 1000);
				});
		} else {
			return this._dialog.open(NotificationDialogComponent, {
				width: '500px',
				backdropClass: 'backdrop-modal--wrapper',
				data: {
					label: 'Send a reminder',
					message: INVALID_REMINDER_MESSAGE,
				},
			});
		}
	}

	private _initTable$() {
		this.table$ = combineLatest([
			this.dataSource$,
			this._contractService.getEnumMap$(),
			this._agreementService.getSort$(),
		]).pipe(
			map(([data, maps, sort]) => {
				const tableConfig: ITableConfig = {
					pageSize: data.pageSize as number,
					pageIndex: (data.pageIndex as number) - 1,
					totalCount: data.totalCount as number,
					items: this._mapTableItems(data.items, maps),
					direction: sort.direction,
					active: sort.active,
				};
				return tableConfig;
			})
		);
	}

	private _initPreselectedFilters() {
		const templateId = this._route.snapshot.queryParams['agreementId'];
		if (templateId) {
			this.currentRowInfo$.next({ id: parseInt(templateId), name: 'unknown' });
			return this._agreementService.setIdFilter([templateId]);
		}
		this._agreementService.setIdFilter([]);
	}

	private _mapTableItems(items: AgreementListItemDto[], maps: MappedTableCells): MappedAgreementTableItem[] {
		return items.map((item: AgreementListItemDto) => {
			let itemActions = [...this.baseActions];
			if (item.hasSignedDocumentFile) {
				itemActions.splice(1, 0, {
					label: 'Download signed contract',
					actionType: 'DOWNLOAD_SIGNED_CONTRACT',
					actionIcon: 'download-icon',
				});
			}

			if (!item['hasCurrentVersion']) {
				itemActions = itemActions.filter(
					(action) => action.actionType !== 'DOWNLOAD_PDF' && action.actionType !== 'DOWNLOAD_DOC'
				);
			}

			if (item.isWorkflowRelated) {
				itemActions.push({
					label: 'Open workflow',
					actionType: 'WORKFLOW_LINK',
					actionIcon: 'open-workflow-icon',
				});
			} else {
				itemActions.push(
					{
						label: 'Edit',
						actionType: 'EDIT',
						actionIcon: 'table-edit-icon',
					},
					{
						label: 'Delete',
						actionType: 'DELETE',
						actionIcon: 'table-delete-icon',
					}
				);
			}

			return <MappedAgreementTableItem>{
				language: maps.language[item.languageId as AgreementLanguage],
				countryCode: GetCountryCodeByLanguage(maps.language[item.languageId as AgreementLanguage]),
				agreementId: item.agreementId,
				agreementName: item.agreementName,
				actualRecipientName: item.actualRecipientName,
				recipientTypeId: maps.recipientTypeId[item.recipientTypeId as number],
				agreementType: maps.agreementType[item.agreementType as AgreementType],
				legalEntityId: maps.legalEntityIds[item.legalEntityId],
				clientName: item.clientName,
				companyName: item.companyName,
				consultantName: item.consultantName,
				salesTypeIds: item.salesTypeIds?.map((i) => maps.salesTypeIds[i]),
				deliveryTypeIds: item.deliveryTypeIds?.map((i) => maps.deliveryTypeIds[i]),
				contractTypeIds: item.contractTypeIds?.map((i) => maps.contractTypeIds[i]),
				mode: item.validity,
				status: item.status,
				envelopeProcessingPath: item.envelopeProcessingPath,
				startDate: item.startDate,
				endDate: item.endDate,
				salesManager: item.salesManager ? item.salesManager : null,
				contractManager: item.contractManager ? item.contractManager : null,
				isWorkflowRelated: item.isWorkflowRelated,
				workflowId: item.workflowId,
				receiveAgreementsFromOtherParty: item.receiveAgreementsFromOtherParty,
				actionList: itemActions,
			};
		});
	}

	private _subscribeOnOuterClicks() {
		this.currentRowInfo$
			.pipe(
				takeUntil(this._unSubscribe$),
				startWith(null),
				pairwise(),
				map(([previous, current]) => {
					if (!previous && current) {
						this._outsideClicksSub = fromEvent(document, 'click').subscribe((e: Event) => {
							if (!this.preview.get(0)?.nativeElement.contains(e.target)) {
								this.currentRowInfo$.next(null);
							}
						});
					} else if (previous && !current) {
						this._outsideClicksSub.unsubscribe();
					}
				})
			)
			.subscribe();
	}

	private _subscribeOnLoading() {
		this._agreementService.contractsLoading$$.pipe(takeUntil(this._unSubscribe$)).subscribe((isLoading) => {
			if (isLoading) {
				this.showMainSpinner();
			} else {
				this.hideMainSpinner();
			}
		});
	}
}
