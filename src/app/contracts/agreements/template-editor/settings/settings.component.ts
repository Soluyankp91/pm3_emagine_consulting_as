import { OnDestroy, Component, OnInit, Injector, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
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
import { CreationTitleService } from 'src/app/contracts/shared/services/creation-title.service';
import { GetDocumentTypesByRecipient } from 'src/app/contracts/shared/utils/relevant-document-type';
import { AppComponentBase } from 'src/shared/app-component-base';
import { MapFlagFromTenantId } from 'src/shared/helpers/tenantHelper';
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
import { EditorObserverService } from '../../../shared/services/editor-observer.service';
@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
	providers: [EditorObserverService],
})
export class SettingsComponent extends AppComponentBase implements OnInit, OnDestroy {
	creationRadioButtons = CLIENT_AGREEMENTS_CREATION;
	creationModes = AgreementCreationMode;

    nextButtonLabel: string;

	possibleDocumentTypes: BaseEnumDto[];
	documentTypes$: Observable<BaseEnumDto[]>;

	legalEntities: LegalEntityDto[];

	agreementFormGroup = new AgreementModel();

	noExpirationDateControl = new FormControl(false);

	attachmentsFromParent: FileUpload[] = [];
	preselectedFiles: FileUpload[] = [];

	options$: Observable<[SettingsPageOptions, MappedTableCells]>;

	clientOptionsChanged$ = new BehaviorSubject('');

	creationMode = new FormControl<AgreementCreationMode>({
		value: AgreementCreationMode.InheritedFromParent,
		disabled: true,
	});
	modeControl$ = new BehaviorSubject<AgreementCreationMode>(AgreementCreationMode.InheritedFromParent);
	dirtyStatus$: Observable<boolean>;
	clientDropdown$: Observable<{
		options$: Observable<SupplierResultDto[] | ConsultantResultDto[] | ClientResultDto[] | LegalEntityDto[]>;
		outputProperty: string;
		labelKey: string;
	} | null>;

	duplicateOrInherit$: Observable<DuplicateOrParentOptions | null>;
	duplicateOptionsChanged$ = new BehaviorSubject('');
	parentOptionsChanged$ = new BehaviorSubject('');

	creationModeControlReplay$ = new BehaviorSubject<AgreementCreationMode>(AgreementCreationMode.InheritedFromParent);

	editMode: boolean = false;

	currentAgreementId: number;
	currentAgreement: AgreementDetailsDto;

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
		private readonly _dialog: MatDialog,
		private readonly _router: Router,
		private readonly _route: ActivatedRoute,
		private readonly _injector: Injector,
		private readonly _cdr: ChangeDetectorRef,
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

		const paramId = this._route.snapshot.params.id;
		const clientPeriodID = this._route.snapshot.queryParams.clientPeriodId;
		this._registerAgreementChangeNotifier(paramId, clientPeriodID);

		const consultantPeriodId = this._route.snapshot.queryParams.consultantPeriodId;

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

		if (clientPeriodID) {
			this.clientPeriodId = clientPeriodID;
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
		if (this.editMode) {
			this._router.navigate([`../../`], {
				relativeTo: this._route,
			});
		} else {
			this._router.navigate([`../`], {
				relativeTo: this._route,
			});
		}
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

	onSave() {
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
			toSend.parentAgreementTemplateVersion =
				toSend.parentAgreementTemplate.currentVersion || this.currentAgreementTemplate.parentAgreementTemplateVersion;
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

		toSend.signers = toSend.signers.map((signer: any) => new AgreementDetailsSignerDto(signer));
		toSend.clientPeriodId = this.clientPeriodId ?? undefined;
		toSend.consultantPeriodId = this.consultantPeriodId ?? undefined;
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
				.subscribe(({ agreementId }) => {
					this.navigateToEditor(agreementId);
				});
		}
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
				this.agreementFormGroup.removeControl('parentSelectedAttachmentIds');
				if (creationMode === AgreementCreationMode.InheritedFromParent) {
					this.agreementFormGroup.addControl('parentAgreementTemplate', new FormControl(null));
					this.agreementFormGroup.addControl('parentSelectedAttachmentIds', new FormControl([]));
					this._subscribeOnParentChanges();
				} else if (creationMode === AgreementCreationMode.Duplicated) {
					this.agreementFormGroup.addControl('duplicationSourceAgreementId', new FormControl(null));
					this.agreementFormGroup.addControl('parentSelectedAttachmentIds', new FormControl([]));
					this._subscribeOnDuplicateAgreementChanges();
				}
			});
	}

	private _subscribeOnSignatureRequire() {
		this.agreementFormGroup.isSignatureRequired.valueChanges.subscribe((isSignatureRequired) => {
			if (!isSignatureRequired) {
				this.agreementFormGroup.signers.reset([]);
			}
		});
	}

	private _subscribeOnParentChanges() {
		this.agreementFormGroup.controls['parentAgreementTemplate'].valueChanges
			.pipe(
				filter((val) => !!val),
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
						parentSelectedAttachmentIds: agreementTemplateDetailsDto.attachmentsFromParent
							? agreementTemplateDetailsDto.attachmentsFromParent
							: [],
						legalEntityId: null,
						recipientId: null,
						startDate: null,
						endDate: null,
					});
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
					this._router.navigate([], {
						queryParams: queryParams,
					});
					this.currentDuplicatedTemplate = agreementDetailsDto;
					this._cdr.detectChanges();
				}),
				tap((agreementDetailsDto) => {
					this.preselectedFiles = agreementDetailsDto.attachments as FileUpload[];
					this.clientOptionsChanged$.next(String(agreementDetailsDto.recipientId));
					this.attachmentsFromParent = agreementDetailsDto.attachmentsFromParent
						? (agreementDetailsDto.attachmentsFromParent as FileUpload[])
						: [];
					this._cdr.detectChanges();
				}),
				tap((agreementDetailsDto) => {
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
						parentSelectedAttachmentIds: agreementDetailsDto.attachmentsFromParent
							? agreementDetailsDto.attachmentsFromParent
							: [],
						signers: agreementDetailsDto.signers,
						selectedInheritedFiles: [],
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
			this.currentAgreement = agreement;
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
			this.clientOptionsChanged$.next(String(agreement.recipientId));
			this.agreementFormGroup.recipientTypeId.setValue(agreement.recipientTypeId);

			this.clientOptionsChanged$.next(String(agreement.recipientId));

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
		this.agreementFormGroup.reset();
		this.noExpirationDateControl.setValue(false);
		this.preselectedFiles = [];
		this.attachmentsFromParent = [];
	}

    // private _subscribeOnAgreementsFromOtherParty() {
    //     this.agreementFormGroup.agre
    // }
}
