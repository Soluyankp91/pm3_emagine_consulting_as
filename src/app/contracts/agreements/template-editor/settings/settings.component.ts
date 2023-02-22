import { OnDestroy, Component, OnInit, ViewEncapsulation, Injector, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { combineLatest, Observable, Subject, of, BehaviorSubject, race } from 'rxjs';
import {
	startWith,
	switchMap,
	take,
	map,
	debounceTime,
	filter,
	skip,
	withLatestFrom,
	tap,
	takeUntil,
	distinctUntilChanged,
} from 'rxjs/operators';
import { FileUpload } from 'src/app/contracts/shared/components/file-uploader/files';
import { ConfirmDialogComponent } from 'src/app/contracts/shared/components/popUps/confirm-dialog/confirm-dialog.component';
import { CLIENT_AGREEMENTS_CREATION } from 'src/app/contracts/shared/entities/contracts.constants';
import { BaseEnumDto, MappedTableCells, SettingsPageOptions } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { AgreementModel } from 'src/app/contracts/shared/models/agreement-model';
import { dirtyCheck } from 'src/app/contracts/shared/operators/dirtyCheckOperator';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { GetDocumentTypesByRecipient } from 'src/app/contracts/shared/utils/relevant-document-type';
import { AppComponentBase } from 'src/shared/app-component-base';
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
} from 'src/shared/service-proxies/service-proxies';
import { DuplicateOrParentOptions, ParentTemplateDto } from './settings.interfaces';
@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class SettingsComponent extends AppComponentBase implements OnInit, OnDestroy {
	creationRadioButtons = CLIENT_AGREEMENTS_CREATION;
	creationModes = AgreementCreationMode;

	possibleDocumentTypes: BaseEnumDto[];
	documentTypes$: Observable<BaseEnumDto[]>;

	agreementFormGroup = new AgreementModel();

	preselectedFiles: FileUpload[] = [];

	options$: Observable<[SettingsPageOptions, MappedTableCells]>;

	clientOptionsChanged$ = new BehaviorSubject('');

	creationMode = new FormControl<AgreementCreationMode>({
		value: AgreementCreationMode.FromScratch,
		disabled: true,
	});
	modeControl$ = new BehaviorSubject<AgreementCreationMode>(AgreementCreationMode.FromScratch);
	dirtyStatus$: Observable<boolean>;
	clientDropdown$: Observable<{
		options$: Observable<SupplierResultDto[] | ConsultantResultDto[] | ClientResultDto[] | LegalEntityDto[]>;
		outputProperty: string;
		labelKey: string;
	} | null>;

	duplicateOrInherit$: Observable<DuplicateOrParentOptions | null>;
	duplicateOptionsChanged$ = new BehaviorSubject('');
	parentOptionsChanged$ = new BehaviorSubject('');

	creationModeControlReplay$ = new BehaviorSubject<AgreementCreationMode>(AgreementCreationMode.FromScratch);

	editMode: boolean = false;

	currentAgreementId: number;

	currentAgreementTemplate: AgreementDetailsDto;
	private _unSubscribe$ = new Subject<void>();

	constructor(
		private readonly _contractService: ContractsService,
		private readonly _lookupService: LookupServiceProxy,
		private readonly _enumService: EnumServiceProxy,
		private readonly _apiServiceProxy: AgreementServiceProxy,
		private readonly _apiServiceProxy2: AgreementTemplateServiceProxy,
		private readonly _dialog: MatDialog,
		private readonly _router: Router,
		private readonly _route: ActivatedRoute,
		private readonly _injector: Injector,
		private readonly _cdr: ChangeDetectorRef
	) {
		super(_injector);
	}

	ngOnInit(): void {
		this._initOptions();
		this._setClientOptions();
		this._setDocumentType();
		this._subscribeOnSignatureRequire();
		const paramId = this._route.snapshot.params.id;
		if (paramId) {
			this.editMode = true;
			this.currentAgreementId = paramId;
			this._preselectAgreement(paramId);
		} else {
			this._setDuplicateObs();
			this._subscribeOnCreationMode();
			this._setDirtyStatus();
			this._subscribeOnModeReplay();
			this._subsribeOnCreationModeChanges();
			this._subscribeOnQueryParams();
		}
	}

	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
	}

	onModeControlChange(creationMode: AgreementCreationMode) {
		this.modeControl$.next(creationMode);
	}

	onSave() {
		if (!this.agreementFormGroup.valid) {
			this.agreementFormGroup.markAllAsTouched();
			return;
		}
		const toSend = {
			creationMode: this.creationModeControlReplay$.value,
			...this.agreementFormGroup.getRawValue(),
			isSignatureRequired: !!this.agreementFormGroup.isSignatureRequired,
			signers: this.agreementFormGroup.signers.value ? this.agreementFormGroup.signers.value : [],
		};
		const uploadedFiles = toSend.uploadedFiles ? toSend.uploadedFiles : [];
		const selectedInheritedFiles = toSend.selectedInheritedFiles ? toSend.selectedInheritedFiles : [];
		const signers = toSend.signers ? toSend.signers : [];
		if (this.creationModeControlReplay$.value === 2) {
			toSend.parentAgreementTemplateId =
				toSend.parentAgreementTemplate.agreementTemplateId || this.currentAgreementTemplate.parentAgreementTemplateId;
			toSend.parentAgreementTemplateVersion =
				toSend.parentAgreementTemplate.currentVersion || this.currentAgreementTemplate.parentAgreementTemplateVersion;
			toSend.parentSelectedAttachmentIds = selectedInheritedFiles.map(
				(file: FileUpload) => file.agreementTemplateAttachmentId
			);
			toSend.attachments = uploadedFiles.map((attachment: FileUpload) => new AgreementAttachmentDto(attachment));
		} else if (this.creationModeControlReplay$.value === 3) {
			toSend.attachments = [...uploadedFiles, ...selectedInheritedFiles].map(
				(attachment: FileUpload) => new AgreementAttachmentDto(attachment)
			);
		}
		toSend.signers = signers.map((signer: any) => new AgreementDetailsSignerDto(signer));
		this.showMainSpinner();
		if (this.editMode) {
			this._apiServiceProxy
				.agreementPATCH(this.currentAgreementId, new SaveAgreementDto(toSend))
				.pipe(
					tap(() => {
						this.hideMainSpinner();
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
				.subscribe();
		}
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
		]);
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
			switchMap((recipientTypeId) => {
				if (recipientTypeId) {
					return of(GetDocumentTypesByRecipient(this.possibleDocumentTypes, recipientTypeId));
				}
				return of(null);
			})
		);
	}

	private _setClientOptions() {
		this.clientDropdown$ = (this.agreementFormGroup.recipientTypeId?.valueChanges as Observable<number>).pipe(
			switchMap((recipientTypeId) => {
				if (recipientTypeId === 1) {
					return of({
						options$: this.clientOptionsChanged$.pipe(
							startWith(this.clientOptionsChanged$.value),
							debounceTime(300),
							switchMap((search) => {
								return this._lookupService.suppliers(search, 20);
							})
						),
						outputProperty: 'supplierId',
						labelKey: 'supplierName',
					});
				} else if (recipientTypeId === 2) {
					return of({
						options$: this.clientOptionsChanged$.pipe(
							startWith(this.clientOptionsChanged$.value),
							debounceTime(300),
							switchMap((search) => {
								return this._lookupService.consultants(search, 20);
							})
						),
						outputProperty: 'id',
						labelKey: 'name',
					});
				} else if (recipientTypeId === 3) {
					return of({
						options$: this.clientOptionsChanged$.pipe(
							startWith(this.clientOptionsChanged$.value),
							debounceTime(300),
							switchMap((search) => {
								return this._lookupService.clientsAll(search, 20);
							})
						),
						outputProperty: 'clientId',
						labelKey: 'clientName',
					});
				} else if (recipientTypeId === 4) {
					return of({
						options$: this.clientOptionsChanged$.pipe(
							startWith(this.clientOptionsChanged$.value),
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
						outputProperty: 'id',
						labelKey: 'name',
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
				})
			)
			.subscribe((creationMode) => {
				this.agreementFormGroup.removeControl('parentAgreementTemplate');
				this.agreementFormGroup.removeControl('duplicationSourceAgreementId');
				if (creationMode === AgreementCreationMode.InheritedFromParent) {
					this.agreementFormGroup.addControl('parentAgreementTemplate', new FormControl(null));
					this._subscribeOnParentChanges();
				} else if (creationMode === AgreementCreationMode.Duplicated) {
					this.agreementFormGroup.addControl('duplicationSourceAgreementId', new FormControl(null));
					this._subscribeOnDuplicateAgreementChanges();
				}
			});
	}

	private _subscribeOnSignatureRequire() {
		this.agreementFormGroup.isSignatureRequired.valueChanges.subscribe((isSignatureRequired) => {
			if (isSignatureRequired) {
				this.agreementFormGroup.signers.reset([]);
				this.agreementFormGroup.signers.reset([]);
			}
		});
	}

	private _subscribeOnParentChanges() {
		this.agreementFormGroup.controls['parentAgreementTemplate'].valueChanges
			.pipe(
				filter((val) => !!val),
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
					return this._apiServiceProxy2.agreementTemplateGET(agreementTemplateId);
				}),
				tap(() => {
					this.hideMainSpinner();
				}),
				tap((agreementTemplateDetailsDto) => {
					this.preselectedFiles = agreementTemplateDetailsDto.attachments as FileUpload[];
				}),
				tap((agreementTemplateDetailsDto) => {
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
					});
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
					return this._apiServiceProxy.agreementGET(duplicationSourceAgreementId);
				}),
				tap(() => {
					this.hideMainSpinner();
				}),
				tap((agreementDetailsDto) => {
					const queryParams: Params = {
						id: `${agreementDetailsDto.agreementId}`,
					};
					this._router.navigate([], {
						queryParams: queryParams,
					});
				}),
				tap((agreementDetailsDto) => {
					this.preselectedFiles = agreementDetailsDto.attachments as FileUpload[];
					this.clientOptionsChanged$.next(String(agreementDetailsDto.recipientId));
				}),
				tap((agreementDetailsDto) => {
					this.agreementFormGroup.patchValue({
						agreementType: agreementDetailsDto.agreementType,
						recipientTypeId: agreementDetailsDto.recipientTypeId,
						recipientId: agreementDetailsDto.recipientId,
						nameTemplate: agreementDetailsDto.name,
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
						signers: agreementDetailsDto.signers,
					});
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
							switchMap((search) => {
								return this._apiServiceProxy
									.simpleList(undefined, search)
									.pipe(map((response) => response.items));
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
						options$: this.parentOptionsChanged$.pipe(
							startWith(''),
							debounceTime(300),
							switchMap((search) => {
								return this._apiServiceProxy2
									.simpleList2(undefined, undefined, undefined, search, 1, 20)
									.pipe(map((response) => response.items));
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
			if (agreement.creationMode === 3) {
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
					}),
					{
						emitEvent: false,
					}
				);
				this._subscribeOnParentChanges();
				this.parentOptionsChanged$.next(String(agreement.parentAgreementTemplateId));
			}
			this.creationModeControlReplay$.next(agreement.creationMode);

			this.agreementFormGroup.recipientId.setValue(agreement.recipientId);
			this.clientOptionsChanged$.next(String(agreement.recipientId));
			this.agreementFormGroup.recipientTypeId.setValue(agreement.recipientTypeId);

			this.clientOptionsChanged$.next(String(agreement.recipientId));

			this.preselectedFiles = agreement.attachments as FileUpload[];
			this._cdr.detectChanges();
			this.agreementFormGroup.patchValue({
				agreementType: agreement.agreementType,
				recipientTypeId: agreement.recipientTypeId,
				nameTemplate: agreement.name,
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
				signers: agreement.signers,
				selectedInheritedFiles: agreement.attachments,
			});

			this._disableFields();
		});
	}

	private _disableFields() {
		this.agreementFormGroup.agreementType.disable({ emitEvent: false });
		this.agreementFormGroup.recipientTypeId.disable({ emitEvent: false });
		this.agreementFormGroup.recipientId.disable({ emitEvent: false });
	}

	private _resetForm() {
		this.agreementFormGroup.reset(this.agreementFormGroup.initialValue, { onlySelf: false });
		this.preselectedFiles = [];
	}
}
