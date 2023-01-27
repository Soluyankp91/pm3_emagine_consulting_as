import { OnDestroy, Component, OnInit, ViewEncapsulation, Injector } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { combineLatest, Observable, Subject, forkJoin, of, BehaviorSubject, ReplaySubject } from 'rxjs';
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
import { BaseEnumDto, MappedTableCells, SettingsPageOptions } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { AgreementModel } from 'src/app/contracts/shared/models/agreement-model';
import { dirtyCheck } from 'src/app/contracts/shared/operators/dirtyCheckOperator';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
	AgreementAttachmentDto,
	AgreementCreationMode,
	AgreementDetailsSignerDto,
	AgreementServiceProxy,
	ClientResultDto,
	ConsultantResultDto,
	EnumEntityTypeDto,
	EnumServiceProxy,
	LegalEntityDto,
	LookupServiceProxy,
	SaveAgreementDto,
	SignerType,
	SupplierResultDto,
	AgreementTemplateServiceProxy,
} from 'src/shared/service-proxies/service-proxies';
import { DuplicateOrParentOptions, InputParentTemplate, OutputParentTemplate, SignerOptions } from './settings.interfaces';
@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class SettingsComponent extends AppComponentBase implements OnInit, OnDestroy {
	creationModes = AgreementCreationMode;

	agreementFormGroup = new AgreementModel();

	preselectedFiles: FileUpload[] = [];

	options$: Observable<[SettingsPageOptions, MappedTableCells, [BaseEnumDto[], EnumEntityTypeDto[]]]>;

	clientOptionsChanged$ = new BehaviorSubject('');

	signerTableData: AbstractControl[] = [];
	displayedSignerColumns = ['signerType', 'signerName', 'signingRole', 'signOrder', 'actions'];

	signerOptionsArr$: SignerOptions[] = [];

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

	creationModeControlReplay$ = new ReplaySubject<AgreementCreationMode | null>(1);

	private _unSubscribe$ = new Subject();

	constructor(
		private readonly _contractService: ContractsService,
		private readonly _lookupService: LookupServiceProxy,
		private readonly _enumService: EnumServiceProxy,
		private readonly _apiServiceProxy: AgreementServiceProxy,
		private readonly _apiServiceProxy2: AgreementTemplateServiceProxy,
		private readonly _dialog: MatDialog,
		private readonly _fb: FormBuilder,
		private readonly _router: Router,
		private readonly _route: ActivatedRoute,
		private readonly _injector: Injector
	) {
		super(_injector);
	}

	ngOnInit(): void {
		this._initOptions();
		this._subscribeOnModeReplay();
		this._setClientOptions();
		this._setDuplicateObs();
		this._setDirtyStatus();
		this._subsribeOnCreationModeChanges();
		this._subscribeOnCreationMode();
		this._subscribeOnQueryParams();
		this._subscribeOnSignatureRequire();
	}

	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
	}

	addSigner() {
		this.agreementFormGroup.signers.push(
			this._fb.group({
				signerType: new FormControl<null | SignerType>(null, [Validators.required]),
				signerId: new FormControl<null | number>(null, [Validators.required]),
				roleId: new FormControl<null | number>(null, [Validators.required]),
				signOrder: new FormControl<null | number>(null, [Validators.required]),
			})
		);
		this.signerTableData = [...this.agreementFormGroup.signers.controls];
		this.signerOptionsArr$.push(<SignerOptions>{
			options$: null,
			optionsChanged$: new BehaviorSubject<string>(''),
		});
	}

	deleteSigner(signerRowIndex: number) {
		this.agreementFormGroup.signers.removeAt(signerRowIndex);
		this.signerTableData = [...this.agreementFormGroup.signers.controls];
		this.signerOptionsArr$.splice(signerRowIndex, 1);
	}

	onSignerTypeChange(signerType: SignerType, rowIndex: number) {
		switch (signerType) {
			case 1: {
				this.signerOptionsArr$[rowIndex].options$ = this.signerOptionsArr$[rowIndex].optionsChanged$.pipe(
					switchMap((search: string) => {
						return forkJoin([
							of({ label: 'InternalEmagine', labelKey: 'name', outputProperty: 'id' }),
							this._lookupService.employees(search, true),
						]);
					})
				);
				break;
			}
			case 2:
				this.signerOptionsArr$[rowIndex].options$ = this.signerOptionsArr$[rowIndex].optionsChanged$.pipe(
					switchMap((search: string) => {
						return forkJoin([
							of({ label: 'Clients', labelKey: 'clientName', outputProperty: 'clientId' }),
							this._lookupService.clientsAll(search, 20),
						]);
					})
				);
				break;
			case 3:
				this.signerOptionsArr$[rowIndex].options$ = this.signerOptionsArr$[rowIndex].optionsChanged$.pipe(
					switchMap((search: string) => {
						return forkJoin([
							of({ label: 'Consultants', labelKey: 'name', outputProperty: 'id' }),
							this._lookupService.consultants(search, 20),
						]);
					})
				);
				break;
			case 4:
				this.signerOptionsArr$[rowIndex].options$ = this.signerOptionsArr$[rowIndex].optionsChanged$.pipe(
					switchMap((search: string) => {
						return forkJoin([
							of({ label: 'Suppliers', labelKey: 'supplierName', outputProperty: 'supplierId' }),
							this._lookupService.suppliers(search, 20),
						]);
					})
				);
				break;
			default:
				break;
		}
	}

	onSave() {
		if (!this.agreementFormGroup.valid) {
			this.agreementFormGroup.markAllAsTouched();
			return;
		}
		const toSend = { creationMode: this.creationMode.value, ...this.agreementFormGroup.value };
		const uploadedFiles = toSend.uploadedFiles ? toSend.uploadedFiles : [];
		const selectedInheritedFiles = toSend.selectedInheritedFiles ? toSend.selectedInheritedFiles : [];
		const signers = toSend.signers ? toSend.signers : [];
		if (this.creationMode.value === 2) {
			toSend.parentAgreementTemplateId = toSend.parentAgreementTemplate.parentAgreementTemplateId;
			toSend.parentAgreementTemplateVersion = toSend.parentAgreementTemplate.parentAgreementTemplateVersion;
			toSend.parentSelectedAttachmentIds = selectedInheritedFiles.map(
				(file: FileUpload) => file.agreementTemplateAttachmentId
			);
			toSend.attachments = uploadedFiles.map((attachment: FileUpload) => new AgreementAttachmentDto(attachment));
			toSend.parentSele;
		} else if (this.creationMode.value === 3) {
			toSend.attachments = [...uploadedFiles, ...selectedInheritedFiles].map(
				(attachment: FileUpload) => new AgreementAttachmentDto(attachment)
			);
		}
		toSend.signers = signers.map((signer: any) => new AgreementDetailsSignerDto(signer));
		this.showMainSpinner();
		this._apiServiceProxy
			.agreementPOST(new SaveAgreementDto(toSend))
			.pipe(
				tap(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((id) => {});
	}

	private _subscribeOnModeReplay() {
		this.creationMode.valueChanges
			.pipe(takeUntil(this._unSubscribe$), startWith(this.creationMode.value), distinctUntilChanged())
			.subscribe((val) => {
				this.creationModeControlReplay$.next(val);
			});
	}

	private _unwrap = ({ agreementTemplateId, currentVersion }: InputParentTemplate) =>
		<OutputParentTemplate>{
			parentAgreementTemplateId: agreementTemplateId,
			parentAgreementTemplateVersion: currentVersion,
		};

	private _initOptions() {
		this.options$ = combineLatest([
			this._contractService.settingsPageOptions$(),
			this._contractService.getEnumMap$().pipe(take(1)),
			this._contractService.signersEnum$$,
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
							width: '280px',
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
				this.agreementFormGroup.removeControl('parentAgreementTemplate', { emitEvent: false });
				this.agreementFormGroup.removeControl('duplicationSourceAgreementId', { emitEvent: false });
				if (creationMode === AgreementCreationMode.InheritedFromParent) {
					this.agreementFormGroup.addControl('parentAgreementTemplate', new FormControl(null), {
						emitEvent: false,
					});
					this._subscribeOnParentChanges();
				} else if (creationMode === AgreementCreationMode.Duplicated) {
					this.agreementFormGroup.addControl('duplicationSourceAgreementId', new FormControl(null), {
						emitEvent: false,
					});
					this._subscribeOnDuplicateAgreementChanges();
				} else {
					this.agreementFormGroup.enable({ emitEvent: false });
				}
			});
	}

	private _subscribeOnSignatureRequire() {
		this.agreementFormGroup.isSignatureRequired.valueChanges.subscribe((isSignatureRequired) => {
			if (isSignatureRequired) {
				this._clearSigners();
			}
		});
	}

	private _subscribeOnParentChanges() {
		this.agreementFormGroup.controls['parentAgreementTemplate'].valueChanges
			.pipe(
				filter((val) => !!val),
				takeUntil(
					this.creationMode.valueChanges.pipe(
						filter((creationMode) => creationMode !== AgreementCreationMode.InheritedFromParent)
					)
				),
				tap(() => {
					this.showMainSpinner();
				}),
				switchMap(({ parentAgreementTemplateId }) => {
					return this._apiServiceProxy2.agreementTemplateGET(parentAgreementTemplateId);
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
				distinctUntilChanged(),
				takeUntil(
					this.creationMode.valueChanges.pipe(
						filter((creationMode) => creationMode !== AgreementCreationMode.Duplicated)
					)
				),
				tap(() => {
					this._clearSigners();
				}),
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
					});
					agreementDetailsDto.signers?.forEach((signerDto, index) => {
						this.agreementFormGroup.signers.push(
							new FormGroup({
								signerType: new FormControl(signerDto.signerType as SignerType),
								signerId: new FormControl(signerDto.signerId as number),
								roleId: new FormControl(signerDto.roleId as number),
								signOrder: new FormControl(signerDto.signOrder as number),
							})
						);
						this.signerTableData = [...this.agreementFormGroup.signers.controls];
						this.signerOptionsArr$.push(<SignerOptions>{
							options$: null,
							optionsChanged$: new BehaviorSubject<string>(String(signerDto.signerId as number)),
						});
						this.onSignerTypeChange(signerDto.signerType as SignerType, index);
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
					return of({
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
						labelKey: 'agreementName',
						label: 'Duplicate from',
						formControlName: 'duplicationSourceAgreementId',
					});
				} else if (creationMode === AgreementCreationMode.InheritedFromParent) {
					let freeText$ = new BehaviorSubject<string>('');
					return of({
						options$: freeText$.pipe(
							startWith(''),
							debounceTime(300),
							switchMap((search) => {
								return this._apiServiceProxy2
									.simpleList2(undefined, undefined, undefined, search)
									.pipe(map((response) => response.items));
							})
						),
						optionsChanged$: freeText$,
						outputProperty: 'agreementTemplateId',
						labelKey: 'name',
						label: 'Parent master template',
						formControlName: 'parentAgreementTemplate',
						unwrapFunction: this._unwrap,
					});
				} else {
					return of(null);
				}
			})
		);
	}

	private _resetForm() {
		this.agreementFormGroup.reset(undefined, { emitEvent: false });
		this.preselectedFiles = [];
		this._clearSigners();
	}

	private _clearSigners() {
		this.agreementFormGroup.signers.clear();
		this.signerOptionsArr$ = [];
		this.signerTableData = [];
	}
}
