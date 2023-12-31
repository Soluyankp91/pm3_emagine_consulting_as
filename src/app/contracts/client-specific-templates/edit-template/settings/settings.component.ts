import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
	ViewEncapsulation,
	Injector,
	OnDestroy,
} from '@angular/core';
import {
	AgreementCreationMode,
	AgreementTemplateAttachmentDto,
	AgreementTemplateDetailsDto,
	AgreementTemplateServiceProxy,
	ClientResultDto,
	LegalEntityDto,
	LookupServiceProxy,
	SaveAgreementTemplateDto,
	SimpleAgreementTemplatesListItemDto,
} from 'src/shared/service-proxies/service-proxies';
import {
	map,
	switchMap,
	startWith,
	tap,
	takeUntil,
	debounceTime,
	distinctUntilChanged,
	withLatestFrom,
	filter,
	take,
	finalize,
} from 'rxjs/operators';
import { Observable, Subject, of, BehaviorSubject, race, combineLatest } from 'rxjs';
import { FormControl } from '@angular/forms';
import { ClientTemplatesModel } from '../../../shared/models/client-templates.model';
import { MatDialog } from '@angular/material/dialog';
import { dirtyCheck } from '../../../shared/operators/dirtyCheckOperator';
import { ConfirmDialogComponent } from 'src/app/contracts/shared/components/popUps/confirm-dialog/confirm-dialog.component';
import { AppComponentBase } from 'src/shared/app-component-base';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { FileUpload } from 'src/app/contracts/shared/components/file-uploader/files';
import { SettingsOptions } from 'src/app/contracts/shared/models/settings.model';
import { MapFlagFromTenantId } from 'src/shared/helpers/tenantHelper';
import { CreationTitleService } from 'src/app/contracts/shared/services/creation-title.service';
import { CLIENT_AGREEMENTS_CREATION } from 'src/app/contracts/shared/entities/contracts.constants';
import { BaseEnumDto, MappedTableCells } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { GetDocumentTypesByRecipient } from 'src/app/contracts/shared/utils/relevant-document-type';
import { ExtraHttpsService } from 'src/app/contracts/shared/services/extra-https.service';
import { Location } from '@angular/common';
@Component({
	selector: 'app-creation',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreationComponent extends AppComponentBase implements OnInit, OnDestroy {
	creationRadioButtons = CLIENT_AGREEMENTS_CREATION;

	creationModes = AgreementCreationMode;

	nextButtonLabel: string;

	possibleDocumentTypes: BaseEnumDto[];
	documentTypes$: Observable<BaseEnumDto[]>;

	editMode: boolean = false;

	currentAgreementId: number;
	currentAgreementTemplate: AgreementTemplateDetailsDto;

	currentDuplicatedTemplate: AgreementTemplateDetailsDto;

	creationModeControl = new FormControl({
		value: AgreementCreationMode.InheritedFromParent,
		disabled: true,
	});

	clientTemplateFormGroup = new ClientTemplatesModel();

	attachmentsFromParent: FileUpload[] = [];
	preselectedFiles: FileUpload[] = [];

	legalEntities: LegalEntityDto[];

	options$: Observable<[SettingsOptions, MappedTableCells]>;

	modeControl$ = new BehaviorSubject(AgreementCreationMode.InheritedFromParent);

	clientOptions$: Observable<ClientResultDto[]>;

	clientOptionsChanged$ = new BehaviorSubject<string>('');
	isClientOptionsLoading$ = new BehaviorSubject(false);

	duplicateOrInherit$: Observable<any>;

	dirtyStatus$: Observable<boolean>;

	duplicateOptionsChanged$ = new BehaviorSubject('');
	parentOptionsChanged$ = new BehaviorSubject('');
	isDuplicateParentOptionsLoading$ = new BehaviorSubject(false);

	creationModeControlReplay$ = new BehaviorSubject<AgreementCreationMode>(AgreementCreationMode.InheritedFromParent);

	private _unSubscribe$ = new Subject<void>();

	constructor(
		private readonly _injector: Injector,
		private readonly _contractsService: ContractsService,
		private readonly _cdr: ChangeDetectorRef,
		private readonly _apiServiceProxy: AgreementTemplateServiceProxy,
		private readonly _lookupServiceProxy: LookupServiceProxy,
		private readonly _route: ActivatedRoute,
		private readonly _router: Router,
		private readonly _creationTitleService: CreationTitleService,
		private readonly _extraHttp: ExtraHttpsService,
		private readonly _location: Location,
		public _dialog: MatDialog
	) {
		super(_injector);
	}

	ngOnInit(): void {
		this._setDocumentType();
		this._setOptions();
		this._subscribeOnTemplateNameChanges();
		this._subsribeOnLegEntitiesChanges();
		this._subscribeOnAgreementsFromOtherParty();
		const paramId = this._route.snapshot.params.id;
		if (paramId) {
			this.editMode = true;
			this.nextButtonLabel = 'Save';
			this.currentAgreementId = paramId;
			this._preselectAgreementTemplate(paramId);
		} else {
			this.nextButtonLabel = 'Next';
			this._subscribeOnModeReplay();
			this._subscribeOnDirtyStatus();
			this._setDuplicateObs();
			this._subscribeOnCreationModeResolver();
			this._subscribeOnCreationMode();
			this._subscribeOnQueryParams();
			this._initClients();
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
		});
	}

	async onSave() {
		if (
			this.clientTemplateFormGroup.receiveAgreementsFromOtherParty.value &&
			this.clientTemplateFormGroup.initialValue.receiveAgreementsFromOtherParty === false &&
			this.editMode
		) {
			let discard = await this._showDiscardDialog().afterClosed().toPromise();
			if (!discard) {
				return;
			}
		}
		if (!this.clientTemplateFormGroup.valid) {
			this.clientTemplateFormGroup.markAllAsTouched();
			return;
		}
		const toSend = {
			...this.clientTemplateFormGroup.getRawValue(),
			creationMode: this.creationModeControlReplay$.value,
			documentFileProvidedByClient: false,
		};

		if (this.creationModeControlReplay$.value === AgreementCreationMode.InheritedFromParent) {
			toSend.parentSelectedAttachmentIds = this.clientTemplateFormGroup.parentSelectedAttachmentIds.value.map(
				(file: FileUpload) => file.agreementTemplateAttachmentId
			);
		}
		if (
			this.creationModeControlReplay$.value === AgreementCreationMode.Duplicated &&
			this.currentDuplicatedTemplate.parentAgreementTemplateId
		) {
			toSend.parentAgreementTemplateId = this.currentDuplicatedTemplate.parentAgreementTemplateId;
			toSend.parentSelectedAttachmentIds = this.clientTemplateFormGroup.parentSelectedAttachmentIds.value.map(
				(file: FileUpload) => file.agreementTemplateAttachmentId
			);
		}

		toSend.attachments = this._createAttachments(this.clientTemplateFormGroup.attachments.value);
		this.showMainSpinner();
		if (this.editMode) {
			this._extraHttp
				.agreementPatch(this.currentAgreementId, new SaveAgreementTemplateDto(toSend))
				.pipe(
					tap(() => {
						this._creationTitleService.updateReceiveAgreementsFromOtherParty(toSend.receiveAgreementsFromOtherParty);
					}),
					switchMap(() => {
						return this._apiServiceProxy.agreementTemplateGET(this.currentAgreementId);
					}),
					tap((template) => {
						this.clientTemplateFormGroup.attachments.reset();
						this.preselectedFiles = template.attachments as FileUpload[];
						this.attachmentsFromParent = template.attachmentsFromParent;
					}),
					tap((template) => {
						this.clientTemplateFormGroup.updateInitialFormValue({
							receiveAgreementsFromOtherParty: template.receiveAgreementsFromOtherParty,
						});
					}),
					tap(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe();
		} else {
			this._extraHttp
				.agreementPost(new SaveAgreementTemplateDto(toSend))
				.pipe(
					finalize(() => {
						this.hideMainSpinner();
					}),
					tap((agreementTemplateId) => {
						if (toSend.receiveAgreementsFromOtherParty) {
							this.navigateToEdit(agreementTemplateId);
						} else {
							this.navigateToEditor(agreementTemplateId);
						}
					})
				)
				.subscribe();
		}
	}

	private _createAttachments(files: FileUpload[]) {
		return files.map((attachment: FileUpload) => new AgreementTemplateAttachmentDto(attachment));
	}

	private _subscribeOnTemplateNameChanges() {
		this.clientTemplateFormGroup.controls['name'].valueChanges
			.pipe(takeUntil(this._unSubscribe$))
			.subscribe((name: string) => {
				this._creationTitleService.updateTemplateName(name);
			});
	}

	private _setDocumentType() {
		this.documentTypes$ = (this.clientTemplateFormGroup.recipientTypeId.valueChanges as Observable<number>).pipe(
			switchMap((recipientTypeId) => {
				if (recipientTypeId) {
					return of(GetDocumentTypesByRecipient(this.possibleDocumentTypes, recipientTypeId));
				}
				return of(null);
			})
		);
	}

	private _setOptions() {
		this.options$ = combineLatest([
			this._contractsService.settingsPageOptions$().pipe(
				tap(({ agreementTypes }) => {
					this.possibleDocumentTypes = agreementTypes;
				})
			),
			this._contractsService.getEnumMap$().pipe(take(1)),
		]).pipe(
			tap(([{ legalEntities }, maps]) => {
				this.legalEntities = legalEntities.map(
					(i) => <LegalEntityDto>{ ...i, name: maps.legalEntityIds[i.id as number] }
				);
			})
		);
	}

	private _subscribeOnModeReplay() {
		this.creationModeControl.valueChanges.pipe(takeUntil(this._unSubscribe$), distinctUntilChanged()).subscribe((val) => {
			this.creationModeControlReplay$.next(val);
		});
	}

	private _subscribeOnQueryParams() {
		this._route.queryParams.pipe(takeUntil(this._unSubscribe$)).subscribe(({ id }) => {
			if (id) {
				this.creationModeControl.setValue(AgreementCreationMode.Duplicated);
				this.duplicateOptionsChanged$.next(id);
				this.clientTemplateFormGroup.duplicationSourceAgreementTemplateId.setValue(id);
			}
		});
	}

	private _initClients(): void {
		this.clientOptions$ = this.clientOptionsChanged$.pipe(
			takeUntil(this._unSubscribe$),
			startWith(this.clientOptionsChanged$.value),
			tap(() => {
				this.isClientOptionsLoading$.next(true);
			}),
			switchMap((search) => {
				return this._lookupServiceProxy.clientsAll(search, 20).pipe(
					tap(() => {
						this.isClientOptionsLoading$.next(false);
					})
				);
			})
		);
	}

	private _subscribeOnDirtyStatus(): void {
		this.dirtyStatus$ = this.clientTemplateFormGroup.valueChanges.pipe(
			takeUntil(this._unSubscribe$),
			startWith(this.clientTemplateFormGroup.value),
			dirtyCheck(this.clientTemplateFormGroup.initial$)
		);
	}

	private _setDataFromRetrievedTemplate(data: AgreementTemplateDetailsDto): void {
		if (data.clientId) {
			this.clientOptionsChanged$.next(String(data.clientId));
			this._initClients();
			this.clientTemplateFormGroup.controls['clientId'].setValue(data.clientId);
		}
		this.clientTemplateFormGroup.patchValue({
			agreementType: data.agreementType,
			recipientTypeId: data.recipientTypeId,
			name: data.name,
			agreementNameTemplate: data.agreementNameTemplate,
			definition: data.definition,
			legalEntities: data.legalEntityIds,
			salesTypes: data.salesTypeIds,
			deliveryTypes: data.deliveryTypeIds,
			contractTypes: data.contractTypeIds,
			language: data.language,
			note: data.note,
			receiveAgreementsFromOtherParty: data.receiveAgreementsFromOtherParty,
			isSignatureRequired: data.isSignatureRequired,
			isDefaultTemplate: data.isDefaultTemplate,
			parentSelectedAttachmentIds: data.attachmentsFromParent
				? data.attachmentsFromParent.filter((attachement) => attachement.isSelected)
				: [],
			isEnabled: data.isEnabled,
		});
		if (this.creationModeControl.value === this.creationModes.InheritedFromParent) {
			this.attachmentsFromParent = data.attachments as FileUpload[];
			this._cdr.detectChanges();
		} else {
			this.preselectedFiles = data.attachments as FileUpload[];
			this._cdr.detectChanges();
		}
	}

	private _subscribeOnCreationModeResolver(): void {
		this.modeControl$
			.pipe(
				takeUntil(this._unSubscribe$),
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
					this.creationModeControl.setValue(this.modeControl$.value);
					this.clientTemplateFormGroup.reset();
					this.preselectedFiles = [];
				}
			});
	}

	private _setDuplicateObs() {
		let onlyNoDraftTemplates = (items: SimpleAgreementTemplatesListItemDto[]) =>
			items.map((item) => (item.hasDraftVersion ? Object.assign({ disabled: true }, item) : item));

		this.duplicateOrInherit$ = this.creationModeControlReplay$.pipe(
			takeUntil(this._unSubscribe$),
			switchMap((creationMode: AgreementCreationMode | null) => {
				if (creationMode === AgreementCreationMode.Duplicated) {
					return of({
						options$: this.duplicateOptionsChanged$.pipe(
							startWith(this.duplicateOptionsChanged$.value),
							debounceTime(300),
							tap(() => {
								this.isDuplicateParentOptionsLoading$.next(true);
							}),
							switchMap((search) => {
								return this._apiServiceProxy
									.simpleList2(
										true,
										undefined,
										undefined,
										undefined,
										undefined,
										undefined,
										undefined,
										undefined,
										undefined,
										search
									)
									.pipe(
										tap(() => {
											this.isDuplicateParentOptionsLoading$.next(false);
										}),
										withLatestFrom(this._contractsService.getEnumMap$()),
										map(([response, maps]) => {
											return onlyNoDraftTemplates(response.items).map(
												(item) =>
													Object.assign(item, {
														tenantIds: item.tenantIds?.map((i) => maps.legalEntityIds[i]),
													}) as SimpleAgreementTemplatesListItemDto
											);
										})
									);
							})
						),
						optionsChanged$: this.duplicateOptionsChanged$,
						label: 'Duplicate from',
						formControlName: 'duplicationSourceAgreementTemplateId',
					});
				} else if (creationMode === AgreementCreationMode.InheritedFromParent) {
					return of({
						options$: this.parentOptionsChanged$.pipe(
							startWith(this.parentOptionsChanged$.value),
							debounceTime(300),
							tap(() => {
								this.isDuplicateParentOptionsLoading$.next(true);
							}),
							switchMap((search) => {
								return this._apiServiceProxy
									.simpleList2(
										false,
										undefined,
										undefined,
										undefined,
										undefined,
										undefined,
										undefined,
										undefined,
										true,
										search
									)
									.pipe(
										tap(() => {
											this.isDuplicateParentOptionsLoading$.next(false);
										}),
										withLatestFrom(this._contractsService.getEnumMap$()),
										map(([response, maps]) => {
											return onlyNoDraftTemplates(response.items).map(
												(item) =>
													Object.assign(item, {
														tenantIds: item.tenantIds?.map((i) => maps.legalEntityIds[i]),
													}) as SimpleAgreementTemplatesListItemDto
											);
										})
									);
							})
						),
						optionsChanged$: this.parentOptionsChanged$,
						label: 'Parent master template',
						formControlName: 'parentAgreementTemplateId',
					});
				} else {
					return of(null);
				}
			})
		);
	}

	private _subscribeOnCreationMode() {
		this.creationModeControlReplay$
			.pipe(
				takeUntil(this._unSubscribe$),
				tap(() => {
					this.duplicateOptionsChanged$.next('');
					this.parentOptionsChanged$.next('');
					this.clientOptionsChanged$.next('');
				})
			)
			.subscribe((creationMode) => {
				this.clientTemplateFormGroup.removeControl('parentAgreementTemplateId', { emitEvent: false });
				this.clientTemplateFormGroup.removeControl('duplicationSourceAgreementTemplateId', { emitEvent: false });
				this.clientTemplateFormGroup.removeControl('parentSelectedAttachmentIds', { emitEvent: false });
				if (creationMode === AgreementCreationMode.InheritedFromParent) {
					this.clientTemplateFormGroup.addControl('parentAgreementTemplateId', new FormControl(null), {
						emitEvent: false,
					});
					this.clientTemplateFormGroup.addControl('parentSelectedAttachmentIds', new FormControl([]));
					this._subscribeOnParentTemplateChanges();
				} else if (creationMode === AgreementCreationMode.Duplicated) {
					this.clientTemplateFormGroup.addControl('duplicationSourceAgreementTemplateId', new FormControl(null), {
						emitEvent: false,
					});
					this.clientTemplateFormGroup.addControl('parentSelectedAttachmentIds', new FormControl(null), {
						emitEvent: false,
					});
					this._subscribeOnDuplicateTemplateChanges();
				} else {
					this.clientTemplateFormGroup.enable({ emitEvent: false });
				}
			});
	}

	private _subscribeOnParentTemplateChanges(): void {
		this.clientTemplateFormGroup.parentAgreementTemplateId.valueChanges
			.pipe(
				takeUntil(
					race([
						this.creationModeControl.valueChanges.pipe(
							filter((creationMode) => creationMode !== AgreementCreationMode.InheritedFromParent)
						),
						this._unSubscribe$,
					])
				),
				filter((val) => !!val),
				distinctUntilChanged(),
				tap(() => {
					this.showMainSpinner();
				}),
				switchMap((agreementTemplateId: number) => {
					return this._apiServiceProxy.preview2(agreementTemplateId);
				}),
				tap((agreementTemplate: AgreementTemplateDetailsDto) => {
					this._setDataFromRetrievedTemplate(agreementTemplate);
				}),
				tap(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe();
	}

	private _subscribeOnDuplicateTemplateChanges(): void {
		this.clientTemplateFormGroup.duplicationSourceAgreementTemplateId.valueChanges
			.pipe(
				takeUntil(
					race([
						this.creationModeControl.valueChanges.pipe(
							filter((creationMode) => creationMode !== AgreementCreationMode.Duplicated)
						),
						this._unSubscribe$,
					])
				),
				filter((val) => !!val),
				distinctUntilChanged(),
				tap(() => {
					this.showMainSpinner();
				}),
				switchMap((agreementTemplateId: number) => {
					return this._apiServiceProxy.preview2(agreementTemplateId);
				}),
				tap((agreementTemplateDetailsDto) => {
					this.attachmentsFromParent = agreementTemplateDetailsDto.attachmentsFromParent as FileUpload[];
					this._cdr.detectChanges();
				}),
				tap((agreementTemplate) => {
					this._setDataFromRetrievedTemplate(agreementTemplate);
				}),
				tap(() => {
					this.hideMainSpinner();
				}),
				tap((agreementTemplateDetailsDto) => {
					const queryParams: Params = {
						id: `${agreementTemplateDetailsDto.agreementTemplateId}`,
					};
					this._router.navigate([], {
						queryParams: queryParams,
					});
					this.currentDuplicatedTemplate = agreementTemplateDetailsDto;
				})
			)
			.subscribe();
	}

	private _preselectAgreementTemplate(agreementTemplateId: number) {
		this._apiServiceProxy.agreementTemplateGET(agreementTemplateId).subscribe((agreementTemplate) => {
			this.clientTemplateFormGroup.updateInitialFormValue({
				receiveAgreementsFromOtherParty: agreementTemplate.receiveAgreementsFromOtherParty,
			});
			this.currentAgreementTemplate = agreementTemplate;
			this.creationModeControl.setValue(agreementTemplate.creationMode);
			this._creationTitleService.updateReceiveAgreementsFromOtherParty(agreementTemplate.receiveAgreementsFromOtherParty);
			if (agreementTemplate.creationMode === 3) {
				this.currentDuplicatedTemplate = agreementTemplate;
				this._setDuplicateObs();
				this.clientTemplateFormGroup.addControl(
					'duplicationSourceAgreementTemplateId',
					new FormControl({
						value: agreementTemplate.duplicationSourceAgreementTemplateId,
						disabled: true,
					})
				);
				this._subscribeOnDuplicateTemplateChanges();
				this.duplicateOptionsChanged$.next(String(agreementTemplate.duplicationSourceAgreementTemplateId));
			}
			if (agreementTemplate.creationMode === 2) {
				this._setDuplicateObs();
				this.clientTemplateFormGroup.addControl(
					'parentAgreementTemplateId',
					new FormControl({
						value: agreementTemplate.parentAgreementTemplateId,
						disabled: true,
					})
				);
				this._subscribeOnParentTemplateChanges();
				this.parentOptionsChanged$.next(String(agreementTemplate.parentAgreementTemplateId));
			}
			if (agreementTemplate.parentAgreementTemplateId) {
				this.clientTemplateFormGroup.addControl(
					'parentSelectedAttachmentIds',
					new FormControl(agreementTemplate.attachmentsFromParent.filter((attachement) => attachement.isSelected))
				);
				this.attachmentsFromParent = agreementTemplate.attachmentsFromParent as FileUpload[];
			}
			this.creationModeControlReplay$.next(agreementTemplate.creationMode);
			this.clientOptionsChanged$.next(String(agreementTemplate.clientId));

			this.preselectedFiles = agreementTemplate.attachments as FileUpload[];

			this._cdr.detectChanges();

			this._disableFields();

			this.clientTemplateFormGroup.patchValue({
				agreementType: agreementTemplate.agreementType,
				recipientTypeId: agreementTemplate.recipientTypeId,
				name: agreementTemplate.name,
				clientId: agreementTemplate.clientId,
				agreementNameTemplate: agreementTemplate.agreementNameTemplate,
				definition: agreementTemplate.definition,
				legalEntities: agreementTemplate.legalEntityIds,
				salesTypes: agreementTemplate.salesTypeIds,
				deliveryTypes: agreementTemplate.deliveryTypeIds,
				contractTypes: agreementTemplate.contractTypeIds,
				language: agreementTemplate.language,
				note: agreementTemplate.note,
				receiveAgreementsFromOtherParty: agreementTemplate.receiveAgreementsFromOtherParty,
				isSignatureRequired: agreementTemplate.isSignatureRequired,
				isDefaultTemplate: agreementTemplate.isDefaultTemplate,
				isEnabled: agreementTemplate.isEnabled,
				selectedInheritedFiles: agreementTemplate.attachments,
			});

			this._initClients();
		});
	}

	private _disableFields() {
		this.clientTemplateFormGroup.agreementType.disable({ emitEvent: false });
		this.clientTemplateFormGroup.recipientTypeId.disable({ emitEvent: false });
		this.clientTemplateFormGroup.clientId.disable({ emitEvent: false });
	}

	private _subsribeOnLegEntitiesChanges() {
		this.clientTemplateFormGroup.legalEntities.valueChanges.subscribe((legalEntities: number[]) => {
			if (legalEntities) {
				let entities = this.legalEntities.filter((extendedEntity) =>
					legalEntities.find((simpleEntity: number) => extendedEntity.id === simpleEntity)
				);
				let modifiedEntities = entities.map((entity) => ({
					...entity,
					code: MapFlagFromTenantId(entity.id as number),
				})) as (LegalEntityDto & { code: string })[];
				this._creationTitleService.updateTenants(modifiedEntities);
				return;
			}
			this._creationTitleService.updateTenants([]);
		});
	}

	private _subscribeOnAgreementsFromOtherParty() {
		this.clientTemplateFormGroup.receiveAgreementsFromOtherParty.valueChanges
			.pipe(takeUntil(this._unSubscribe$))
			.subscribe((receiveAgreementsFromOtherParty) => {
				if (receiveAgreementsFromOtherParty && !this.editMode) {
					this.nextButtonLabel = 'Complete';
					this.clientTemplateFormGroup.removeControl('isSignatureRequired');
				}
				if (!receiveAgreementsFromOtherParty && this.editMode) {
					this.nextButtonLabel = 'Save';
					this.clientTemplateFormGroup.addControl('isSignatureRequired', new FormControl(false));
				}
				if (receiveAgreementsFromOtherParty && this.editMode) {
					this.nextButtonLabel = 'Save';
					this.clientTemplateFormGroup.removeControl('isSignatureRequired');
				}
				if (!receiveAgreementsFromOtherParty && !this.editMode) {
					this.nextButtonLabel = 'Next';
					this.clientTemplateFormGroup.addControl(
						'isSignatureRequired',
						new FormControl(this.clientTemplateFormGroup.initialValue.isSignatureRequired)
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
				message: `You\'ve selected “Always receive from other party”. By doing so you are permanently discarding any previous document changes and disabling document editor.  Are you sure you want to proceed?`,
				confirmButtonText: 'Discard',
			},
		});
	}
}
