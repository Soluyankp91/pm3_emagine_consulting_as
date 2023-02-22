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
} from 'src/shared/service-proxies/service-proxies';
import {
	map,
	switchMap,
	startWith,
	tap,
	skip,
	takeUntil,
	debounceTime,
	distinctUntilChanged,
	withLatestFrom,
	filter,
	take,
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
import { BaseEnumDto } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { GetDocumentTypesByRecipient } from 'src/app/contracts/shared/utils/relevant-document-type';
@Component({
	selector: 'app-creation',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class CreationComponent extends AppComponentBase implements OnInit, OnDestroy {
	creationRadioButtons = CLIENT_AGREEMENTS_CREATION;

	creationModes = AgreementCreationMode;

	possibleDocumentTypes: BaseEnumDto[];
	documentTypes$: Observable<BaseEnumDto[]>;

	editMode: boolean = false;
	currentAgreementId: number;

	creationModeControl = new FormControl({
		value: AgreementCreationMode.FromScratch,
		disabled: true,
	});

	clientTemplateFormGroup = new ClientTemplatesModel();

	preselectedFiles: FileUpload[] = [];

	legalEntities: LegalEntityDto[];

	options$: Observable<SettingsOptions>;

	modeControl$ = new BehaviorSubject(AgreementCreationMode.FromScratch);

	clientOptions$: Observable<ClientResultDto[]>;

	clientOptionsChanged$ = new BehaviorSubject<string>('');
	clientOptionsLoaded$ = new Subject();

	duplicateOrInherit$: Observable<any>;

	dirtyStatus$: Observable<boolean>;

	duplicateOptionsChanged$ = new BehaviorSubject('');
	parentOptionsChanged$ = new BehaviorSubject('');

	creationModeControlReplay$ = new BehaviorSubject<AgreementCreationMode>(AgreementCreationMode.FromScratch);

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
		public _dialog: MatDialog
	) {
		super(_injector);
	}

	ngOnInit(): void {
		this._setDocumentType();
		this._setOptions();
		this._initClients();
		this._subsribeOnLegEntitiesChanges();
		const paramId = this._route.snapshot.params.id;
		if (paramId) {
			this.editMode = true;
			this.currentAgreementId = paramId;
			this._preselectAgreementTemplate(paramId);
		} else {
			this._subscribeOnModeReplay();
			this._subscribeOnDirtyStatus();
			this._setDuplicateObs();
			this._subscribeOnCreationModeResolver();
			this._subscribeOnCreationMode();
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
		});
	}

	onSave() {
		if (!this.clientTemplateFormGroup.valid) {
			this.clientTemplateFormGroup.markAllAsTouched();
			return;
		}
		let creationMode = this.creationModeControlReplay$.value;
		const toSend = {
			...this.clientTemplateFormGroup.getRawValue(),
			creationMode: creationMode,
			documentFileProvidedByClient: false,
		};
		const uploadedFiles = this.clientTemplateFormGroup.uploadedFiles?.value
			? this.clientTemplateFormGroup.uploadedFiles?.value
			: [];
		const selectedInheritedFiles = this.clientTemplateFormGroup.selectedInheritedFiles?.value
			? this.clientTemplateFormGroup.selectedInheritedFiles?.value
			: [];

		if (creationMode === AgreementCreationMode.InheritedFromParent && !this.editMode) {
			toSend.parentSelectedAttachmentIds = selectedInheritedFiles.map((file: any) => file.agreementTemplateAttachmentId);
			toSend.attachments = uploadedFiles.map((attachment: FileUpload) => {
				return new AgreementTemplateAttachmentDto(attachment);
			});
		} else {
			toSend.attachments = [...uploadedFiles, ...selectedInheritedFiles].map((attachment: FileUpload) => {
				return new AgreementTemplateAttachmentDto(attachment);
			});
		}
		this.showMainSpinner();
		if (this.editMode) {
			this._apiServiceProxy
				.agreementTemplatePATCH(this.currentAgreementId, new SaveAgreementTemplateDto(toSend))
				.pipe(
					tap(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe();
		} else {
			this._apiServiceProxy
				.agreementTemplatePOST(new SaveAgreementTemplateDto(toSend))
				.pipe(
					tap(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe(({ agreementTemplateId }) => {
					this.navigateToEditor(agreementTemplateId);
				});
		}
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
			}),
			map(([options]) => {
				return options;
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
				this.clientTemplateFormGroup.controls['duplicationSourceAgreementTemplateId'].setValue(id);
			}
		});
	}

	private _initClients(): void {
		this.clientOptions$ = this.clientOptionsChanged$.pipe(
			takeUntil(this._unSubscribe$),
			startWith(this.clientOptionsChanged$.value),
			switchMap((search) => {
				return this._lookupServiceProxy.clientsAll(search, 20);
			}),
			tap(() => {
				this.clientOptionsLoaded$.next();
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
			isSignatureRequired: data.isSignatureRequired,
			isEnabled: data.isEnabled,
		});
		this.preselectedFiles = [
			...(data.attachments?.map((attachment) => ({
				agreementTemplateAttachmentId: attachment.agreementTemplateAttachmentId,
				name: attachment.name,
			})) as FileUpload[]),
			...(data.attachmentsFromParent
				? data.attachmentsFromParent.map((attachment) => ({
						agreementTemplateAttachmentId: attachment.agreementTemplateAttachmentId,
						name: attachment.name,
				  }))
				: []),
		];
		this._cdr.detectChanges();
	}

	private _subscribeOnCreationModeResolver(): void {
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
					this.creationModeControl.setValue(this.modeControl$.value);
					this.clientTemplateFormGroup.reset();
					this.preselectedFiles = [];
				}
			});
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
									.simpleList2(true, undefined, undefined, search)
									.pipe(map((response) => response.items));
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
							switchMap((search) => {
								return this._apiServiceProxy
									.simpleList2(false, undefined, undefined, search)
									.pipe(map((response) => response.items));
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
				if (creationMode === AgreementCreationMode.InheritedFromParent) {
					this.clientTemplateFormGroup.addControl('parentAgreementTemplateId', new FormControl(null), {
						emitEvent: false,
					});
					this._subscribeOnParentTemplateChanges();
				} else if (creationMode === AgreementCreationMode.Duplicated) {
					this.clientTemplateFormGroup.addControl('duplicationSourceAgreementTemplateId', new FormControl(null), {
						emitEvent: false,
					});
					this._subscribeOnDuplicateTemplateChanges();
				} else {
					this.clientTemplateFormGroup.enable({ emitEvent: false });
				}
			});
	}

	private _subscribeOnParentTemplateChanges(): void {
		this.clientTemplateFormGroup.controls['parentAgreementTemplateId'].valueChanges
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
					return this._apiServiceProxy.agreementTemplateGET(agreementTemplateId);
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
		this.clientTemplateFormGroup.controls['duplicationSourceAgreementTemplateId'].valueChanges
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
					return this._apiServiceProxy.agreementTemplateGET(agreementTemplateId);
				}),
				tap((agreementTemplate) => {
					this._setDataFromRetrievedTemplate(agreementTemplate);
				}),
				tap(() => {
					this.hideMainSpinner();
				}),
				tap((AgreementTemplateDetailsDto) => {
					const queryParams: Params = {
						id: `${AgreementTemplateDetailsDto.agreementTemplateId}`,
					};
					this._router.navigate([], {
						queryParams: queryParams,
					});
				})
			)
			.subscribe();
	}

	private _preselectAgreementTemplate(agreementTemplateId: number) {
		this._apiServiceProxy.agreementTemplateGET(agreementTemplateId).subscribe((agreementTemplate) => {
			if (agreementTemplate.creationMode === 3) {
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
				isSignatureRequired: agreementTemplate.isSignatureRequired,
				isEnabled: agreementTemplate.isEnabled,
				selectedInheritedFiles: agreementTemplate.attachments,
			});
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
}
