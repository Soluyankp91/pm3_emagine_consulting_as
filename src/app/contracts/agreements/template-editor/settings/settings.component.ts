import { OnDestroy, Component, OnInit, Injector, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
	combineLatest,
	Observable,
	Subject,
	of,
	BehaviorSubject,
	race,
	forkJoin,
	ReplaySubject,
	concat,
	merge,
	timer,
} from 'rxjs';
import {
	startWith,
	switchMap,
	take,
	map,
	debounceTime,
	debounce,
	filter,
	skip,
	withLatestFrom,
	tap,
	takeUntil,
	distinctUntilChanged,
	finalize,
} from 'rxjs/operators';
import { FileUpload } from 'src/app/contracts/shared/components/file-uploader/files';
import { ConfirmDialogComponent } from 'src/app/contracts/shared/components/popUps/confirm-dialog/confirm-dialog.component';
import { AGREEMENTS_CREATION, WORKFLOW_TEMPLATE_TYPES } from 'src/app/contracts/shared/entities/contracts.constants';
import { BaseEnumDto, MappedTableCells, SettingsPageOptions } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { AgreementModel } from 'src/app/contracts/shared/models/agreement-model';
import { dirtyCheck } from 'src/app/contracts/shared/operators/dirtyCheckOperator';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { CreationTitleService } from 'src/app/contracts/shared/services/creation-title.service';
import { GetDocumentTypesByRecipient } from 'src/app/contracts/shared/utils/relevant-document-type';
import { AppComponentBase } from 'src/shared/app-component-base';
import { MapCountryCodeTenant, MapFlagFromTenantId } from 'src/shared/helpers/tenantHelper';
import {
	AgreementAttachmentDto,
	AgreementCreationMode,
	AgreementDetailsSignerDto,
	AgreementServiceProxy,
	ClientResultDto,
	ConsultantResultDto,
	EnumServiceProxy,
	LegalEntityDto,
	LookupServiceProxy,
	SaveAgreementDto,
	SupplierResultDto,
	AgreementTemplateServiceProxy,
	AgreementDetailsDto,
	ClientPeriodServiceProxy,
	AgreementType,
	SignerType,
	ConsultantPeriodServiceProxy,
} from 'src/shared/service-proxies/service-proxies';
import { DuplicateOrParentOptions, ParentTemplateDto, WorkflowSummary } from './settings.interfaces';
import { EditorObserverService } from '../../../shared/services/editor-observer.service';
import { union } from 'lodash';
import { NotificationDialogComponent } from 'src/app/contracts/shared/components/popUps/notification-dialog/notification-dialog.component';
import { Location } from '@angular/common';

export enum RecipientDropdowns {
	SUPPLIER,
	CONSULTANT,
	CLIENT,
	PDC,
}
@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
	providers: [EditorObserverService],
})
export class SettingsComponent extends AppComponentBase implements OnInit, OnDestroy {
	creationRadioButtons = AGREEMENTS_CREATION;
	creationModes = AgreementCreationMode;

	workflowTemplateTypes = WORKFLOW_TEMPLATE_TYPES;
	workflowTemplateTypeControl = new FormControl(WORKFLOW_TEMPLATE_TYPES[0].value);

	workflowTemplateType$ = new BehaviorSubject(true);

	recipientDropdowns = RecipientDropdowns;

	nextButtonLabel: string;

	isDuplicating: boolean = false;

	workflowSummary: WorkflowSummary;
	workFlowMetadata: {
		agreementTypeId: number;
		recipientTypeId: number;
		clientId: number;
		legalEntityId: number;
		salesTypeId: number;
		deliveryTypeId: number;
		contractType: number;
	};
	isDefaultTemplate: boolean;

	possibleDocumentTypes: BaseEnumDto[];
	documentTypes$: Observable<BaseEnumDto[]>;

	legalEntities: LegalEntityDto[];

	agreementFormGroup = new AgreementModel();

	noExpirationDateControl = new FormControl(false);

	attachmentsFromParent: FileUpload[] = [];
	preselectedFiles: FileUpload[] = [];

	options$: Observable<[SettingsPageOptions, MappedTableCells]>;

	recipientOptionsChanged$ = new BehaviorSubject('');
	recipientOptionsLoading$ = new BehaviorSubject(false);

	creationMode = new FormControl<AgreementCreationMode>({
		value: AgreementCreationMode.InheritedFromParent,
		disabled: true,
	});
	modeControl$ = new BehaviorSubject<AgreementCreationMode>(AgreementCreationMode.InheritedFromParent);
	dirtyStatus$: Observable<boolean>;
	recipientDropdown$: Observable<{
		options$: Observable<SupplierResultDto[] | ConsultantResultDto[] | ClientResultDto[] | LegalEntityDto[]>;
		outputProperty: string;
		labelKey: string;
		label: string;
		dropdownType: RecipientDropdowns;
	} | null>;

	duplicateOrInherit$: Observable<DuplicateOrParentOptions | null>;
	duplicateOptionsChanged$ = new BehaviorSubject('');
	parentOptionsChanged$ = new BehaviorSubject('');
	duplicateOptionsLoading$ = new BehaviorSubject(false);

	defaultTemplate$ = new ReplaySubject(1);

	creationModeControlReplay$ = new BehaviorSubject<AgreementCreationMode>(AgreementCreationMode.InheritedFromParent);

	editMode: boolean = false;

	currentAgreementId: number;
	currentAgreement: AgreementDetailsDto;
	isLocked: boolean;

	currentDuplicatedTemplate: AgreementDetailsDto;

	currentAgreementTemplate: AgreementDetailsDto;
	clientPeriodId: string;
	consultantPeriodId: string;
	private _unSubscribe$ = new Subject<void>();

	constructor(
		private readonly _contractService: ContractsService,
		private readonly _lookupService: LookupServiceProxy,
		private readonly _enumService: EnumServiceProxy,
		private readonly _apiServiceProxy: AgreementServiceProxy,
		private readonly _apiServiceProxy2: AgreementTemplateServiceProxy,
		private readonly _clientPeriodServiceProxy: ClientPeriodServiceProxy,
		private readonly _consultantPeriodServiceProxy: ConsultantPeriodServiceProxy,
		private readonly _dialog: MatDialog,
		private readonly _router: Router,
		private readonly _route: ActivatedRoute,
		private readonly _injector: Injector,
		private readonly _cdr: ChangeDetectorRef,
		private readonly _location: Location,
		private readonly _creationTitleService: CreationTitleService,
		private _editorObserverService: EditorObserverService
	) {
		super(_injector);
	}

	ngOnInit(): void {
		this._initOptions();
		this._setClientOptions();
		this._setDocumentType();
		this._subscribeOnSignatureRequire();
		this._subscribeOnTemplateNameChanges();
		this._subsribeOnLegEntitiesChanges();
		this._subscribeOnNoExpirationDates();
		this._subscribeOnAgreementsFromOtherParty();

		const paramId = this._route.snapshot.params.id;
		const clientPeriodID = this._route.snapshot.queryParams.clientPeriodId;
		this._registerAgreementChangeNotifier(paramId, clientPeriodID);

		const consultantPeriodId = this._route.snapshot.queryParams.consultantPeriodId;

		if (paramId) {
			this.editMode = true;
			this.nextButtonLabel = 'Save';
			this.currentAgreementId = paramId;
			this._preselectAgreement(paramId);
		} else {
			this.clientPeriodId = clientPeriodID;
			this.consultantPeriodId = consultantPeriodId;
			this._subscribeOnCreationMode();
			if (clientPeriodID && !consultantPeriodId) {
				this._setClientPeriodId();
			}
			if (consultantPeriodId) {
				this._setConsultantPeriodId();
			}
			this.nextButtonLabel = 'Next';
			this._setDuplicateObs();
			this._setDirtyStatus();
			this._subscribeOnModeReplay();
			this._subsribeOnCreationModeChanges();
			this._subscribeOnQueryParams();
		}

		if (consultantPeriodId) {
			this.consultantPeriodId = consultantPeriodId;
		}
	}

	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
	}

	onModeControlChange(creationMode: AgreementCreationMode) {
		this.modeControl$.next(creationMode);
	}

	navigateBack() {
		this._location.back();
	}

	navigateToEdit(templateId: number) {
		this._router.navigate([`../${templateId}/settings`], {
			relativeTo: this._route,
		});
	}

	navigateToEditor(templateId: number) {
		this._router.navigate([`../${templateId}/editor`], {
			relativeTo: this._route,
			queryParams: this.clientPeriodId
				? {
						clientPeriodId: this.clientPeriodId,
				  }
				: {
						consultantPeriodId: this.consultantPeriodId,
				  },
		});
	}

	async onSave() {
		if (this.isLocked) {
			let dialogRef = this._dialog.open(ConfirmDialogComponent, {
				width: '500px',
				height: '306px',
				backdropClass: 'backdrop-modal--wrapper',
				data: {
					label: 'Agreement number change',
					message:
						'Editing sent agreement settings will result in the current agreement number {number} change to {new number}. Are you sure you want to proceed?',
					confirmButtonText: 'Proceed',
				},
			});
			let proceed = await dialogRef.afterClosed().toPromise();
			if (proceed) {
				await this._apiServiceProxy.openEdit(this.currentAgreement.agreementId).toPromise();
			} else {
				return;
			}
		}
		if (
			this.agreementFormGroup.receiveAgreementsFromOtherParty.value &&
			this.agreementFormGroup.initialValue.receiveAgreementsFromOtherParty === false &&
			this.editMode
		) {
			let discard = await this._showDiscardDialog().afterClosed().toPromise();
			if (!discard) {
				return;
			}
		}
		if (!this.agreementFormGroup.valid) {
			this.agreementFormGroup.markAllAsTouched();
			return;
		}
		const toSend = {
			creationMode: this.creationModeControlReplay$.value,
			...this.agreementFormGroup.getRawValue(),
		};

		if (this.creationModeControlReplay$.value === 2) {
			toSend.parentAgreementTemplateId =
				toSend.parentAgreementTemplate.agreementTemplateId || this.currentAgreementTemplate.parentAgreementTemplateId;
			toSend.parentAgreementTemplateVersion = toSend.parentAgreementTemplate.currentVersion;
			toSend.parentSelectedAttachmentIds = this.agreementFormGroup.parentSelectedAttachmentIds.value.map(
				(file: any) => file.agreementTemplateAttachmentId
			);
		}

		if (
			this.creationModeControlReplay$.value === AgreementCreationMode.Duplicated &&
			this.currentDuplicatedTemplate.parentAgreementTemplateId
		) {
			toSend.parentAgreementTemplateId = this.currentDuplicatedTemplate.parentAgreementTemplateId;
			toSend.parentSelectedAttachmentIds = this.agreementFormGroup.parentSelectedAttachmentIds.value.map(
				(file: FileUpload) => file.agreementTemplateAttachmentId
			);
		}

		toSend.attachments = this._createAttachments(this.agreementFormGroup.attachments.value);
		toSend.signers = toSend.signers.map((signer: any) => {
			const newObj = Object.assign({}, signer);
			delete newObj.agreementSignerId;
			return new AgreementDetailsSignerDto(newObj);
		});

		if (!this.consultantPeriodId && !this.currentAgreementTemplate?.consultantPeriodId) {
			toSend.clientPeriodId = this.clientPeriodId ?? this.currentAgreementTemplate?.clientPeriodId;
		}
		toSend.consultantPeriodId = this.consultantPeriodId ?? this.currentAgreementTemplate?.consultantPeriodId;
		this.showMainSpinner();
		if (this.editMode) {
			this._apiServiceProxy
				.agreementPATCH(this.currentAgreementId, new SaveAgreementDto(toSend))
				.pipe(
					tap(() => {
						this._creationTitleService.updateReceiveAgreementsFromOtherParty(toSend.receiveAgreementsFromOtherParty);
					}),
					switchMap(() => {
						return this._apiServiceProxy.preview(this.currentAgreementId);
					}),
					tap((agreement) => {
						this.agreementFormGroup.attachments.reset();
						this.preselectedFiles = agreement.attachments as FileUpload[];
					}),
					tap((agreement) => {
						this.isLocked = agreement.isLocked;
					}),
					tap((agreement) => {
						this.agreementFormGroup.updateInitialFormValue({
							receiveAgreementsFromOtherParty: agreement.receiveAgreementsFromOtherParty,
						});
					}),
					tap(() => {
						this.hideMainSpinner();
					}),
					tap(() => {
						this._creationTitleService.updateReceiveAgreementsFromOtherParty(toSend.receiveAgreementsFromOtherParty);
					})
				)
				.subscribe();
		} else {
			this._apiServiceProxy
				.agreementPOST(new SaveAgreementDto(toSend))
				.pipe(
					tap(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe(({ agreementId }) => {
					if (toSend.receiveAgreementsFromOtherParty) {
						this.navigateToEdit(agreementId);
					} else {
						this.navigateToEditor(agreementId);
					}
				});
		}
	}

	private _setClientPeriodId() {
		this._clientPeriodServiceProxy
			.clientSalesGET(this.clientPeriodId)
			.pipe(
				withLatestFrom(this._contractService.getEnumMap$()),
				switchMap(([clientPeriodSales, maps]) => {
					let agreementTypeId = AgreementType.WorkOrder;
					let recipientTypeId = 3;

					let contractTypes = union(
						clientPeriodSales.consultantSalesData.map((consultantSale) => consultantSale.employmentTypeId)
					);
					let salesTypeId = clientPeriodSales.salesMainData.salesTypeId;
					let deliveryTypeId = clientPeriodSales.salesMainData.deliveryTypeId;

					let client = clientPeriodSales.salesClientData.directClient;
					let legalEntityId = clientPeriodSales.salesClientData.pdcInvoicingEntityId;

					let startDate = clientPeriodSales.startDate;
					let endDate = clientPeriodSales.endDate;

					let countryCode = clientPeriodSales.salesClientData.directClient.tenantCountryCode;

					let contractSigners = clientPeriodSales.salesClientData.contractSigners.map(
						(contractSigner) =>
							<AgreementDetailsSignerDto>{
								signerType: SignerType.Client,
								signerId: contractSigner.contact.id,
								signOrder: contractSigner.signOrder,
								roleId: contractSigner.signerRoleId,
							}
					);
					this.workflowSummary = {
						client: client,
						consultants: clientPeriodSales.consultantSalesData,

						actualRecipient: client,
						legalEntityId: maps.legalEntityIds[legalEntityId],
						contractTypes: contractTypes.map((contractTypeId) => maps.contractTypeIds[contractTypeId]),
						salesManager: clientPeriodSales.salesMainData.salesAccountManagerData,

						salesTypeId: maps.salesTypeIds[salesTypeId],
						deliveryTypeId: maps.deliveryTypeIds[deliveryTypeId],
						countryCode: countryCode,
						country: MapCountryCodeTenant(countryCode),
					};
					this.workFlowMetadata = {
						agreementTypeId: agreementTypeId,
						recipientTypeId: recipientTypeId,
						clientId: client.clientId,

						legalEntityId: legalEntityId,
						salesTypeId: salesTypeId,
						deliveryTypeId: deliveryTypeId,
						contractType: contractTypes[0],
					};
					this.agreementFormGroup.updateInitialFormValue({
						agreementType: agreementTypeId,
						recipientId: client.clientId,
						recipientTypeId: recipientTypeId,
						legalEntityId: legalEntityId,
						salesTypes: [salesTypeId],
						deliveryTypes: [deliveryTypeId],
						contractTypes: contractTypes,
						startDate: startDate,
						isSignatureRequired: contractSigners.length ? true : false,
						endDate: endDate,
						signers: contractSigners,
					});
					this.showMainSpinner();
					return this._apiServiceProxy2
						.defaultTemplateId(
							recipientTypeId,
							legalEntityId,
							deliveryTypeId,
							salesTypeId,
							contractTypes[0],
							client.clientId
						)
						.pipe(
							tap((defaultTemplateId) => {
								this.parentOptionsChanged$.next(String(defaultTemplateId));
								this.recipientOptionsChanged$.next(String(client.clientId));
								this.defaultTemplate$.next();
							}),
							switchMap((defaultTemplateId) => {
								if (defaultTemplateId) {
									this.isDefaultTemplate = true;
									return this._apiServiceProxy2.agreementTemplateGET(defaultTemplateId).pipe(
										tap((defaultTemplate) => {
											this.parentOptionsChanged$.next(String(defaultTemplateId));
											this.isDuplicating = true;

											this.attachmentsFromParent = [
												...(defaultTemplate.attachments as FileUpload[]),
												...(defaultTemplate.attachmentsFromParent
													? (defaultTemplate.attachmentsFromParent as FileUpload[])
													: []),
											];
										}),
										tap((defaultTemplate) => {
											this.agreementFormGroup.patchValue({
												parentAgreementTemplate: defaultTemplateId,
												agreementType: agreementTypeId,
												recipientTypeId: recipientTypeId,
												recipientId: client.clientId,
												nameTemplate: defaultTemplate.name,
												definition: defaultTemplate.definition,
												legalEntityId: legalEntityId,
												salesTypes: [salesTypeId],
												deliveryTypes: [deliveryTypeId],
												contractTypes: contractTypes,
												language: defaultTemplate.language,
												startDate: startDate,
												endDate: clientPeriodSales.noEndDate ? null : endDate,
												note: defaultTemplate.note,
												receiveAgreementsFromOtherParty: defaultTemplate.receiveAgreementsFromOtherParty,
												isSignatureRequired: contractSigners.length
													? true
													: defaultTemplate.isSignatureRequired,
												signers: contractSigners.length ? contractSigners : [],
												attachments: defaultTemplate.attachments,
												parentSelectedAttachmentIds: defaultTemplate.attachmentsFromParent
													? defaultTemplate.attachmentsFromParent
													: [],
											});
											if (clientPeriodSales.noEndDate) {
												this.noExpirationDateControl.setValue(true);
											}
											this.isDuplicating = false;
											this.hideMainSpinner();
										})
									);
								} else {
									this.creationMode.setValue(AgreementCreationMode.FromScratch);
									this.isDuplicating = true;
									this.recipientOptionsChanged$.next(String(client.clientId));

									this.agreementFormGroup.patchValue({
										agreementType: agreementTypeId,
										recipientTypeId: recipientTypeId,
										recipientId: client.clientId,
										legalEntityId: legalEntityId,
										salesTypes: [salesTypeId],
										deliveryTypes: [deliveryTypeId],
										contractTypes: contractTypes,
										startDate: startDate,
										endDate: clientPeriodSales.noEndDate ? null : endDate,
										isSignatureRequired: contractSigners.length ? true : false,
										signers: contractSigners,
									});
									if (clientPeriodSales.noEndDate) {
										this.noExpirationDateControl.setValue(true);
									}
									let dialogRef = this._dialog.open(NotificationDialogComponent, {
										width: '500px',
										height: '240px',
										backdropClass: 'backdrop-modal--wrapper',
										data: {
											label: 'No default template',
											message: 'Default template was not found basing on data from Workflow',
										},
									});
									this.hideMainSpinner();
									return dialogRef.afterClosed().pipe(
										tap(() => {
											this.isDuplicating = false;
										})
									);
								}
							})
						);
				})
			)
			.subscribe(() => {});
	}

	private _setConsultantPeriodId() {
		forkJoin([
			this._clientPeriodServiceProxy.clientSalesGET(this.clientPeriodId),
			this._consultantPeriodServiceProxy.consultantSalesGET(this.consultantPeriodId),
			this._contractService.getEnumMap$().pipe(take(1)),
		])
			.pipe(
				switchMap(([clientSalesData, consultantData, maps]) => {
					let agreementTypeId = AgreementType.ServiceOrder;
					let recipientTypeId = 2;

					let contractType = consultantData.consultantSalesData.employmentTypeId;
					let salesTypeId = clientSalesData.salesMainData.salesTypeId;
					let deliveryTypeId = clientSalesData.salesMainData.deliveryTypeId;

					let client = clientSalesData.salesClientData.directClient;
					let consultant = consultantData.consultantSalesData;
					let legalEntityId = consultantData.clientPeriodPdcInvoicingEntityId;

					let startDate = clientSalesData.startDate;
					let endDate = clientSalesData.endDate;

					let countryCode = clientSalesData.salesClientData.directClient.tenantCountryCode;

					this.workflowSummary = {
						client: client,
						consultants: [consultantData.consultantSalesData],

						actualRecipient: client,
						legalEntityId: maps.legalEntityIds[legalEntityId],
						contractTypes: [maps.contractTypeIds[contractType]],
						salesManager: clientSalesData.salesMainData.salesAccountManagerData,

						salesTypeId: maps.salesTypeIds[salesTypeId],
						deliveryTypeId: maps.deliveryTypeIds[deliveryTypeId],
						countryCode: countryCode,
						country: MapCountryCodeTenant(countryCode),
					};

					this.workFlowMetadata = {
						agreementTypeId: agreementTypeId,
						recipientTypeId: recipientTypeId,
						clientId: client.clientId,

						legalEntityId: legalEntityId,
						salesTypeId: salesTypeId,
						deliveryTypeId: deliveryTypeId,
						contractType: contractType,
					};
					this.agreementFormGroup.updateInitialFormValue({
						agreementType: agreementTypeId,
						recipientId: consultant.consultantId,
						recipientTypeId: recipientTypeId,
						legalEntityId: legalEntityId,
						salesTypes: [salesTypeId],
						deliveryTypes: [deliveryTypeId],
						contractTypes: [contractType],
						startDate: startDate,
						endDate: endDate,
					});
					this.showMainSpinner();
					return this._apiServiceProxy2
						.defaultTemplateId(
							recipientTypeId,
							legalEntityId,
							deliveryTypeId,
							salesTypeId,
							contractType,
							client.clientId
						)
						.pipe(
							tap((defaultTemplateId) => {
								this.parentOptionsChanged$.next(String(defaultTemplateId));
								this.recipientOptionsChanged$.next(String(consultant.consultantId));
								this.defaultTemplate$.next();
							}),
							switchMap((defaultTemplateId) => {
								if (defaultTemplateId) {
									this.isDefaultTemplate = true;
									return this._apiServiceProxy2.agreementTemplateGET(defaultTemplateId).pipe(
										tap((defaultTemplate) => {
											this.isDuplicating = true;

											this.attachmentsFromParent = [
												...(defaultTemplate.attachments as FileUpload[]),
												...(defaultTemplate.attachmentsFromParent
													? (defaultTemplate.attachmentsFromParent as FileUpload[])
													: []),
											];
										}),
										tap((defaultTemplate) => {
											this.agreementFormGroup.patchValue({
												parentAgreementTemplate: defaultTemplateId,
												agreementType: agreementTypeId,
												recipientTypeId: recipientTypeId,
												recipientId: consultant.consultantId,
												nameTemplate: defaultTemplate.name,
												definition: defaultTemplate.definition,
												legalEntityId: legalEntityId,
												salesTypes: [salesTypeId],
												deliveryTypes: [deliveryTypeId],
												contractTypes: [contractType],
												language: defaultTemplate.language,
												startDate: startDate,
												endDate: clientSalesData.noEndDate ? null : endDate,
												note: defaultTemplate.note,
												receiveAgreementsFromOtherParty: defaultTemplate.receiveAgreementsFromOtherParty,
												isSignatureRequired: defaultTemplate.isSignatureRequired,
												attachments: defaultTemplate.attachments,
												parentSelectedAttachmentIds: defaultTemplate.attachmentsFromParent
													? defaultTemplate.attachmentsFromParent
													: [],
											});
											if (clientSalesData.noEndDate) {
												this.noExpirationDateControl.setValue(true);
											}
											this.isDuplicating = false;
											this.hideMainSpinner();
										})
									);
								} else {
									this.creationMode.setValue(AgreementCreationMode.FromScratch);
									this.recipientOptionsChanged$.next(String(consultant.consultantId));
									this.isDuplicating = true;
									this.agreementFormGroup.patchValue({
										agreementType: agreementTypeId,
										recipientTypeId: recipientTypeId,
										recipientId: consultant.consultantId,
										legalEntityId: legalEntityId,
										salesTypes: [salesTypeId],
										deliveryTypes: [deliveryTypeId],
										contractTypes: [contractType],
										startDate: startDate,
										endDate: clientSalesData.noEndDate ? null : endDate,
									});
									if (clientSalesData.noEndDate) {
										this.noExpirationDateControl.setValue(true);
									}
									let dialogRef = this._dialog.open(NotificationDialogComponent, {
										width: '500px',
										height: '240px',
										backdropClass: 'backdrop-modal--wrapper',
										data: {
											label: 'No default template',
											message: 'Default template was not found basing on data from Workflow',
										},
									});
									this.hideMainSpinner();
									return dialogRef.afterClosed().pipe(
										tap(() => {
											this.isDuplicating = false;
										})
									);
								}
							})
						);
				})
			)
			.subscribe();
	}

	private _registerAgreementChangeNotifier(templateId?: number, clientPeriodID?: string) {
		(!templateId && !clientPeriodID
			? of(null)
			: templateId
			? this._editorObserverService.runAgreementEditModeNotifier(templateId)
			: this._editorObserverService.runAgreementCreateModeNotifier(clientPeriodID)
		)
			.pipe(takeUntil(this._unSubscribe$))
			.subscribe();
	}

	private _createAttachments(files: FileUpload[]) {
		return files.map((attachment: FileUpload) => new AgreementAttachmentDto(attachment));
	}

	private _subscribeOnNoExpirationDates() {
		this.noExpirationDateControl.valueChanges.pipe(takeUntil(this._unSubscribe$)).subscribe((val) => {
			if (val) {
				this.agreementFormGroup.endDate.reset(null);
				this.agreementFormGroup.endDate.disable({ emitEvent: false });
			} else {
				this.agreementFormGroup.enable({ emitEvent: false });
			}
		});
	}

	private _subscribeOnTemplateNameChanges() {
		this.agreementFormGroup.nameTemplate.valueChanges.pipe(takeUntil(this._unSubscribe$)).subscribe((name: string) => {
			this._creationTitleService.updateTemplateName(name);
		});
	}

	private _subsribeOnLegEntitiesChanges() {
		this.agreementFormGroup.legalEntityId.valueChanges.subscribe((legalEntity: number) => {
			if (legalEntity) {
				let entity = this.legalEntities.filter((extendedEntity) => legalEntity === extendedEntity.id);
				let modifiedEntities = entity.map((entity) => ({
					...entity,
					code: MapFlagFromTenantId(entity.id as number),
				})) as (LegalEntityDto & { code: string })[];
				this._creationTitleService.updateTenants(modifiedEntities);
				return;
			}
			this._creationTitleService.updateTenants([]);
		});
	}

	private _subscribeOnModeReplay() {
		this.creationMode.valueChanges.pipe(takeUntil(this._unSubscribe$), distinctUntilChanged()).subscribe((val) => {
			this.creationModeControlReplay$.next(val);
		});
	}

	private _unwrap = ({ agreementTemplateId, currentVersion }: ParentTemplateDto) =>
		<ParentTemplateDto>{
			agreementTemplateId,
			currentVersion,
		};

	private _initOptions() {
		this.options$ = combineLatest([
			this._contractService.settingsPageOptions$().pipe(
				tap(({ agreementTypes }) => {
					this.possibleDocumentTypes = agreementTypes;
				})
			),
			this._contractService.getEnumMap$().pipe(take(1)),
		]).pipe(
			tap(([{ legalEntities }, maps]) => {
				this.legalEntities = legalEntities.map(
					(i) => <LegalEntityDto>{ ...i, name: maps.legalEntityIds[i.id as number] }
				);
			})
		);
	}

	private _subscribeOnQueryParams() {
		this._route.queryParams.pipe(takeUntil(this._unSubscribe$)).subscribe(({ id }) => {
			if (id) {
				this.creationMode.setValue(AgreementCreationMode.Duplicated);
				this.duplicateOptionsChanged$.next(id);
				this.agreementFormGroup.controls['duplicationSourceAgreementId'].setValue(id);
			}
		});
	}

	private _setDocumentType() {
		this.documentTypes$ = (this.agreementFormGroup.recipientTypeId.valueChanges as Observable<number>).pipe(
			takeUntil(this._unSubscribe$),
			switchMap((recipientTypeId) => {
				if (recipientTypeId) {
					return of(GetDocumentTypesByRecipient(this.possibleDocumentTypes, recipientTypeId));
				}
				return of(null);
			})
		);
	}

	private _setClientOptions() {
		this.recipientDropdown$ = (this.agreementFormGroup.recipientTypeId?.valueChanges as Observable<number>).pipe(
			tap(() => {
				if (!this.editMode && !this.isDuplicating) {
					this.recipientOptionsChanged$.next('');
					this.agreementFormGroup.recipientId.setValue(null);
				}
			}),
			switchMap((recipientTypeId) => {
				if (recipientTypeId === 1) {
					return of({
						options$: this.recipientOptionsChanged$.pipe(
							startWith(this.recipientOptionsChanged$.value),
							debounceTime(300),
							tap(() => {
								this.recipientOptionsLoading$.next(true);
							}),
							switchMap((search) => {
								return this._lookupService.suppliers(search, 20).pipe(
									tap(() => {
										this.recipientOptionsLoading$.next(false);
									})
								);
							})
						),
						dropdownType: RecipientDropdowns.SUPPLIER,
						outputProperty: 'supplierId',
						labelKey: 'supplierName',
						label: 'Supplier',
					});
				} else if (recipientTypeId === 2) {
					return of({
						options$: this.recipientOptionsChanged$.pipe(
							startWith(this.recipientOptionsChanged$.value),
							debounceTime(300),
							tap(() => {
								this.recipientOptionsLoading$.next(true);
							}),
							switchMap((search) => {
								return this._lookupService.consultants(search, 20).pipe(
									tap(() => {
										this.recipientOptionsLoading$.next(false);
									})
								);
							})
						),
						dropdownType: RecipientDropdowns.CONSULTANT,
						outputProperty: 'id',
						labelKey: 'name',
						label: 'Consultant',
					});
				} else if (recipientTypeId === 3) {
					return of({
						options$: this.recipientOptionsChanged$.pipe(
							startWith(this.recipientOptionsChanged$.value),
							debounceTime(300),
							tap(() => {
								this.recipientOptionsLoading$.next(true);
							}),
							switchMap((search) => {
								return this._lookupService.clientsAll(search, 20).pipe(
									tap(() => {
										this.recipientOptionsLoading$.next(false);
									})
								);
							})
						),
						dropdownType: RecipientDropdowns.CLIENT,
						outputProperty: 'clientId',
						labelKey: 'clientName',
						label: 'Client',
					});
				} else if (recipientTypeId === 4) {
					return of({
						options$: this.recipientOptionsChanged$.pipe(
							startWith(this.recipientOptionsChanged$.value),
							debounceTime(300),
							switchMap((search) => {
								return this._enumService
									.legalEntities()
									.pipe(
										map((legalEntities) =>
											legalEntities.filter(
												(legalEntity) =>
													legalEntity.name?.toLowerCase().includes(search.toLowerCase()) ||
													String(legalEntity.id)?.toLowerCase().includes(search.toLowerCase())
											)
										)
									);
							})
						),
						dropdownType: RecipientDropdowns.PDC,
						outputProperty: 'id',
						labelKey: 'name',
						label: 'PDC entity',
					});
				} else {
					return of(null);
				}
			})
		);
	}

	private _setDirtyStatus(): void {
		this.dirtyStatus$ = this.agreementFormGroup.valueChanges.pipe(
			takeUntil(this._unSubscribe$),
			startWith(this.agreementFormGroup.value),
			map(() => this.agreementFormGroup.getRawValue()),
			dirtyCheck(this.agreementFormGroup.initial$)
		);
	}
	private _subsribeOnCreationModeChanges() {
		this.modeControl$
			.pipe(
				takeUntil(this._unSubscribe$),
				skip(1),
				withLatestFrom(this.dirtyStatus$),
				switchMap(([, isDirty]) => {
					if (isDirty) {
						let dialogRef = this._dialog.open(ConfirmDialogComponent, {
							width: '500px',
							height: '240px',
							backdropClass: 'backdrop-modal--wrapper',
							data: {
								label: 'Discard Changes',
								message:
									'Changing main template settings will result in discarding all the data that has been applied',
								confirmButtonText: 'Discard',
							},
						});
						return dialogRef.afterClosed();
					}
					return of(true);
				})
			)
			.subscribe((discard) => {
				if (discard) {
					this.creationMode.patchValue(this.modeControl$.value);
					this._resetForm();
				}
				if (this.clientPeriodId || this.consultantPeriodId) {
					this.recipientOptionsChanged$.next(String(this.agreementFormGroup.recipientId.value));
				}

				this.agreementFormGroup.markAsUntouched();
				this.agreementFormGroup.markAsPristine();
			});
	}

	private _subscribeOnCreationMode() {
		this.creationModeControlReplay$
			.pipe(
				takeUntil(this._unSubscribe$),
				tap(() => {
					this.duplicateOptionsChanged$.next('');
					this.parentOptionsChanged$.next('');
				}),
				map((creationMode, index) => ({ creationMode, index }))
			)
			.subscribe(({ creationMode, index }) => {
				this.agreementFormGroup.removeControl('parentAgreementTemplate');
				this.agreementFormGroup.removeControl('duplicationSourceAgreementId');
				this.agreementFormGroup.removeControl('parentSelectedAttachmentIds');
				if (creationMode !== AgreementCreationMode.InheritedFromParent) {
					this.isDefaultTemplate = false;
				}
				if (creationMode === AgreementCreationMode.InheritedFromParent) {
					this.agreementFormGroup.addControl('parentAgreementTemplate', new FormControl(null));
					this.agreementFormGroup.addControl('parentSelectedAttachmentIds', new FormControl([]));
					this._subscribeOnParentChanges();
					this._subscribeOnTemplateTypeChanges();
				} else if (creationMode === AgreementCreationMode.Duplicated) {
					this.agreementFormGroup.addControl('duplicationSourceAgreementId', new FormControl(null));
					this.agreementFormGroup.addControl('parentSelectedAttachmentIds', new FormControl([]));
					this._subscribeOnDuplicateAgreementChanges();
				}
			});
	}

	private _subscribeOnTemplateTypeChanges() {
		this.workflowTemplateTypeControl.valueChanges
			.pipe(
				takeUntil(
					race([
						this._unSubscribe$,
						this.creationMode.valueChanges.pipe(filter((v) => v !== this.creationModes.InheritedFromParent)),
					])
				),
				map((v) => (typeof v === 'string' ? undefined : v))
			)
			.subscribe((v) => {
				this.workflowTemplateType$.next(v);
				this.parentOptionsChanged$.next('');
				this.agreementFormGroup.controls['parentAgreementTemplate'].reset();
			});
	}

	private _subscribeOnSignatureRequire() {
		this.agreementFormGroup.isSignatureRequired.valueChanges
			.pipe(takeUntil(this._unSubscribe$))
			.subscribe((isSignatureRequired) => {
				if (!isSignatureRequired) {
					this.agreementFormGroup.signers.reset([]);
				}
			});
	}

	private _subscribeOnParentChanges() {
		this.agreementFormGroup.controls['parentAgreementTemplate'].valueChanges
			.pipe(
				filter((val) => !!val),
				filter((val) => typeof val === 'object'),
				distinctUntilChanged(),
				takeUntil(
					race([
						this.creationMode.valueChanges.pipe(
							filter((creationMode) => creationMode !== AgreementCreationMode.InheritedFromParent)
						),
						this._unSubscribe$,
					])
				),
				tap(() => {
					this.showMainSpinner();
				}),
				switchMap(({ agreementTemplateId }) => {
					return this._apiServiceProxy2.preview2(agreementTemplateId);
				}),
				tap(() => {
					this.hideMainSpinner();
				}),
				tap((agreementTemplateDetailsDto) => {
					this.attachmentsFromParent = [
						...(agreementTemplateDetailsDto.attachments as FileUpload[]),
						...(agreementTemplateDetailsDto.attachmentsFromParent
							? (agreementTemplateDetailsDto.attachmentsFromParent as FileUpload[])
							: []),
					];
					this._cdr.detectChanges();
				}),
				tap((agreementTemplateDetailsDto) => {
					if ((this.clientPeriodId || this.consultantPeriodId) && this.workflowTemplateType$.value !== undefined) {
						this.agreementFormGroup.patchValue({
							nameTemplate: agreementTemplateDetailsDto.name,
							definition: agreementTemplateDetailsDto.definition,
							language: agreementTemplateDetailsDto.language,
							isSignatureRequired: this.agreementFormGroup.initialValue.signers.length
								? true
								: agreementTemplateDetailsDto.isSignatureRequired,
							signers: this.agreementFormGroup.initialValue.signers,
							note: agreementTemplateDetailsDto.note,
							parentSelectedAttachmentIds: agreementTemplateDetailsDto.attachmentsFromParent
								? agreementTemplateDetailsDto.attachmentsFromParent
								: [],
							selectedInheritedFiles: [],
							receiveAgreementsFromOtherParty: agreementTemplateDetailsDto.receiveAgreementsFromOtherParty,
						});
					} else {
						this.agreementFormGroup.patchValue({
							agreementType: agreementTemplateDetailsDto.agreementType,
							recipientTypeId: agreementTemplateDetailsDto.recipientTypeId,
							nameTemplate: agreementTemplateDetailsDto.name,
							definition: agreementTemplateDetailsDto.definition,
							salesTypes: agreementTemplateDetailsDto.salesTypeIds,
							deliveryTypes: agreementTemplateDetailsDto.deliveryTypeIds,
							contractTypes: agreementTemplateDetailsDto.contractTypeIds,
							language: agreementTemplateDetailsDto.language,
							isSignatureRequired: agreementTemplateDetailsDto.isSignatureRequired,
							note: agreementTemplateDetailsDto.note,
							receiveAgreementsFromOtherParty: agreementTemplateDetailsDto.receiveAgreementsFromOtherParty,
							parentSelectedAttachmentIds: agreementTemplateDetailsDto.attachmentsFromParent
								? agreementTemplateDetailsDto.attachmentsFromParent
								: [],
							legalEntityId: null,
							recipientId: null,
							startDate: null,
							endDate: null,
						});
					}
					this.agreementFormGroup.markAsUntouched();
				})
			)
			.subscribe();
	}
	private _subscribeOnDuplicateAgreementChanges() {
		this.agreementFormGroup.controls['duplicationSourceAgreementId'].valueChanges
			.pipe(
				filter((val) => !!val),
				distinctUntilChanged(),
				takeUntil(
					race([
						this.creationMode.valueChanges.pipe(
							filter((creationMode) => creationMode !== AgreementCreationMode.Duplicated)
						),
						this._unSubscribe$,
					])
				),
				tap(() => {
					this.showMainSpinner();
				}),
				switchMap((duplicationSourceAgreementId) => {
					return this._apiServiceProxy.preview(duplicationSourceAgreementId);
				}),
				tap(() => {
					this.hideMainSpinner();
				}),
				tap((agreementDetailsDto) => {
					const queryParams: Params = {
						id: `${agreementDetailsDto.agreementId}`,
					};
					if (!(this.consultantPeriodId || this.clientPeriodId)) {
						this._router.navigate([], {
							queryParams: queryParams,
						});
					}
					this.currentDuplicatedTemplate = agreementDetailsDto;
					this._cdr.detectChanges();
				}),
				tap((agreementDetailsDto) => {
					this.preselectedFiles = agreementDetailsDto.attachments as FileUpload[];
					if (this.clientPeriodId || this.consultantPeriodId) {
						this.recipientOptionsChanged$.next(String(this.agreementFormGroup.initialValue.recipientId));
					} else {
						this.recipientOptionsChanged$.next(String(agreementDetailsDto.recipientId));
					}
					this.isDuplicating = true;
					this.attachmentsFromParent = agreementDetailsDto.attachmentsFromParent
						? (agreementDetailsDto.attachmentsFromParent as FileUpload[])
						: [];
					this._cdr.detectChanges();
				}),
				tap((agreementDetailsDto) => {
					if (this.clientPeriodId || this.consultantPeriodId) {
						this.agreementFormGroup.patchValue({
							nameTemplate: agreementDetailsDto.nameTemplate,
							definition: agreementDetailsDto.definition,
							language: agreementDetailsDto.language,
							isSignatureRequired: this.agreementFormGroup.initialValue.signers.length
								? true
								: agreementDetailsDto.isSignatureRequired,
							note: agreementDetailsDto.note,
							parentSelectedAttachmentIds: agreementDetailsDto.attachmentsFromParent
								? agreementDetailsDto.attachmentsFromParent
								: [],
							signers: [...this.agreementFormGroup.initialValue.signers, ...agreementDetailsDto.signers],
							selectedInheritedFiles: [],
						});
					} else {
						this.agreementFormGroup.patchValue({
							agreementType: agreementDetailsDto.agreementType,
							recipientTypeId: agreementDetailsDto.recipientTypeId,
							recipientId: agreementDetailsDto.recipientId,
							nameTemplate: agreementDetailsDto.nameTemplate,
							definition: agreementDetailsDto.definition,
							legalEntityId: agreementDetailsDto.legalEntityId,
							salesTypes: agreementDetailsDto.salesTypeIds,
							deliveryTypes: agreementDetailsDto.deliveryTypeIds,
							contractTypes: agreementDetailsDto.contractTypeIds,
							startDate: agreementDetailsDto.startDate,
							endDate: agreementDetailsDto.endDate,
							language: agreementDetailsDto.language,
							isSignatureRequired: agreementDetailsDto.isSignatureRequired,
							note: agreementDetailsDto.note,
							receiveAgreementsFromOtherParty: agreementDetailsDto.receiveAgreementsFromOtherParty,
							parentSelectedAttachmentIds: agreementDetailsDto.attachmentsFromParent
								? agreementDetailsDto.attachmentsFromParent
								: [],
							signers: agreementDetailsDto.signers,
							selectedInheritedFiles: [],
						});
					}
					this.isDuplicating = false;
				})
			)
			.subscribe();
	}
	private _setDuplicateObs() {
		this.duplicateOrInherit$ = this.creationModeControlReplay$.pipe(
			takeUntil(this._unSubscribe$),
			switchMap((creationMode: AgreementCreationMode | null) => {
				if (creationMode === AgreementCreationMode.Duplicated) {
					return of<DuplicateOrParentOptions>({
						options$: this.duplicateOptionsChanged$.pipe(
							startWith(this.duplicateOptionsChanged$.value),
							debounceTime(300),
							tap(() => {
								this.duplicateOptionsLoading$.next(true);
							}),
							switchMap((search) => {
								return this._apiServiceProxy.simpleList(undefined, search).pipe(
									tap(() => {
										this.duplicateOptionsLoading$.next(false);
									}),
									map((response) => response.items)
								);
							})
						),
						optionsChanged$: this.duplicateOptionsChanged$,
						outputProperty: 'agreementId',
						isDuplicate: true,
						label: 'Duplicate from',
						labelKey: 'agreementName',
						formControlName: 'duplicationSourceAgreementId',
					});
				} else if (creationMode === AgreementCreationMode.InheritedFromParent) {
					return of<DuplicateOrParentOptions>({
						options$: concat(
							this.parentOptionsChanged$.pipe(
								debounce((s) => {
									if (this.clientPeriodId) {
										return this.defaultTemplate$;
									}
									return of(s);
								}),
								take(1)
							),
							this.parentOptionsChanged$.pipe(debounceTime(300), skip(1))
						).pipe(
							tap(() => {
								this.duplicateOptionsLoading$.next(true);
							}),
							switchMap((search) => {
								return this._apiServiceProxy2
									.simpleList2(
										this.workflowTemplateType$.value,
										undefined,
										this.workFlowMetadata && this.workflowTemplateType$.value !== undefined
											? this.workFlowMetadata.legalEntityId
											: undefined,
										this.workFlowMetadata && this.workflowTemplateType$.value !== undefined
											? this.workFlowMetadata.salesTypeId
											: undefined,
										this.workFlowMetadata && this.workflowTemplateType$.value !== undefined
											? this.workFlowMetadata.contractType
											: undefined,
										this.workFlowMetadata && this.workflowTemplateType$.value !== undefined
											? this.workFlowMetadata.deliveryTypeId
											: undefined,
										this.workFlowMetadata && this.workflowTemplateType$.value === true
											? this.workFlowMetadata.clientId
											: undefined,
										this.workFlowMetadata && this.workflowTemplateType$.value !== undefined
											? this.workFlowMetadata.recipientTypeId
											: undefined,
										undefined,
										search,
										1,
										20
									)
									.pipe(
										tap(() => {
											this.duplicateOptionsLoading$.next(false);
										}),
										map((response) => response.items)
									);
							})
						),
						optionsChanged$: this.parentOptionsChanged$,
						outputProperty: 'agreementTemplateId',
						isDuplicate: false,
						label: 'Parent master template',
						labelKey: 'name',
						formControlName: 'parentAgreementTemplate',
						unwrapFunction: this._unwrap,
					});
				} else {
					return of(null);
				}
			})
		);
	}

	private _preselectAgreement(agreementId: number) {
		this._apiServiceProxy.agreementGET(agreementId).subscribe((agreement) => {
			this.agreementFormGroup.updateInitialFormValue({
				receiveAgreementsFromOtherParty: agreement.receiveAgreementsFromOtherParty,
			});
			this.currentAgreement = agreement;
			this.isLocked = this.currentAgreement.isLocked;
			this._creationTitleService.updateReceiveAgreementsFromOtherParty(agreement.receiveAgreementsFromOtherParty);
			if (agreement.creationMode === 3) {
				this.currentDuplicatedTemplate = agreement;
				this._setDuplicateObs();
				this.agreementFormGroup.addControl(
					'duplicationSourceAgreementId',
					new FormControl({ value: agreement.duplicationSourceAgreementId, disabled: true }),
					{
						emitEvent: false,
					}
				);
				this._subscribeOnDuplicateAgreementChanges();
				this.duplicateOptionsChanged$.next(String(agreement.duplicationSourceAgreementId));
			}
			if (agreement.creationMode === 2) {
				this.currentAgreementTemplate = agreement;
				this._setDuplicateObs();
				this.agreementFormGroup.addControl(
					'parentAgreementTemplate',
					new FormControl({
						value: agreement.parentAgreementTemplateId,
						disabled: true,
					})
				);
				this._subscribeOnParentChanges();
				this.parentOptionsChanged$.next(String(agreement.parentAgreementTemplateId));
			}
			if (agreement.parentAgreementTemplateId) {
				this.agreementFormGroup.addControl(
					'parentSelectedAttachmentIds',
					new FormControl(agreement.attachmentsFromParent.filter((attachement) => attachement.isSelected))
				);
				this.attachmentsFromParent = agreement.attachmentsFromParent as FileUpload[];
			}
			if (this.editMode) {
				this.creationMode.setValue(agreement.creationMode);
			}

			this.creationModeControlReplay$.next(agreement.creationMode);

			this.agreementFormGroup.recipientId.setValue(agreement.recipientId);
			this.recipientOptionsChanged$.next(String(agreement.recipientId));
			this.isDuplicating = true;
			this.agreementFormGroup.recipientTypeId.setValue(agreement.recipientTypeId);

			this.recipientOptionsChanged$.next(String(agreement.recipientId));

			this.preselectedFiles = agreement.attachments as FileUpload[];
			this._cdr.detectChanges();

			if (!agreement.endDate) {
				this.noExpirationDateControl.setValue(true);
			}

			this.agreementFormGroup.patchValue({
				agreementType: agreement.agreementType,
				recipientTypeId: agreement.recipientTypeId,
				nameTemplate: agreement.nameTemplate,
				definition: agreement.definition,
				legalEntityId: agreement.legalEntityId,
				salesTypes: agreement.salesTypeIds,
				deliveryTypes: agreement.deliveryTypeIds,
				contractTypes: agreement.contractTypeIds,
				startDate: agreement.startDate,
				endDate: agreement.endDate,
				language: agreement.language,
				isSignatureRequired: agreement.isSignatureRequired,
				note: agreement.note,
				receiveAgreementsFromOtherParty: agreement.receiveAgreementsFromOtherParty,
				signers: agreement.signers,
				selectedInheritedFiles: agreement.attachments,
			});

			this.isDuplicating = false;

			this._disableFields();
		});
	}

	private _disableFields() {
		this.agreementFormGroup.agreementType.disable({ emitEvent: false });
		this.agreementFormGroup.recipientTypeId.disable({ emitEvent: false });
		this.agreementFormGroup.recipientId.disable({ emitEvent: false });
	}

	private _resetForm() {
		this.agreementFormGroup.reset();
		this.noExpirationDateControl.setValue(false);
		this.workflowTemplateTypeControl.setValue(true);
		this.preselectedFiles = [];
		this.attachmentsFromParent = [];
	}

	private _subscribeOnAgreementsFromOtherParty() {
		this.agreementFormGroup.receiveAgreementsFromOtherParty.valueChanges
			.pipe(takeUntil(this._unSubscribe$))
			.subscribe((receiveAgreementsFromOtherParty) => {
				if (receiveAgreementsFromOtherParty && !this.editMode) {
					this.nextButtonLabel = 'Complete';
					this.agreementFormGroup.removeControl('isSignatureRequired');
					this.agreementFormGroup.signers.reset([]);
				}
				if (!receiveAgreementsFromOtherParty && this.editMode) {
					this.nextButtonLabel = 'Save';
					this.agreementFormGroup.addControl('isSignatureRequired', new FormControl(false));
				}
				if (receiveAgreementsFromOtherParty && this.editMode) {
					this.nextButtonLabel = 'Save';
					this.agreementFormGroup.removeControl('isSignatureRequired');
					this.agreementFormGroup.signers.reset([]);
				}
				if (!receiveAgreementsFromOtherParty && !this.editMode) {
					this.nextButtonLabel = 'Next';
					this.agreementFormGroup.addControl(
						'isSignatureRequired',
						new FormControl(this.agreementFormGroup.initialValue.isSignatureRequired)
					);
				}
			});
	}

	private _showDiscardDialog() {
		return this._dialog.open(ConfirmDialogComponent, {
			width: '500px',
			minHeight: '240px',
			height: 'auto',
			backdropClass: 'backdrop-modal--wrapper',
			data: {
				label: 'Discard Changes',
				message: `You\'ve selected “Receive from other party”. By doing so you are permanently discarding any previous document changes and disabling document editor.  Are you sure you want to proceed?`,
				confirmButtonText: 'Discard',
			},
		});
	}
}
