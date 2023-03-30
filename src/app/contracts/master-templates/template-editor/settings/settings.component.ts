import {
	map,
	switchMap,
	tap,
	takeUntil,
	filter,
	finalize,
	distinctUntilChanged,
	debounceTime,
	withLatestFrom,
	take,
	startWith,
} from 'rxjs/operators';
import { Subject, BehaviorSubject, Observable, of, race, combineLatest } from 'rxjs';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, Injector } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
	AgreementCreationMode,
	AgreementTemplateAttachmentDto,
	AgreementTemplateDetailsDto,
	AgreementTemplateServiceProxy,
	LegalEntityDto,
	SaveAgreementTemplateDto,
	SimpleAgreementTemplatesListItemDto,
} from 'src/shared/service-proxies/service-proxies';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MasterTemplateModel } from '../../../shared/models/master-template.model';
import { ConfirmDialogComponent } from 'src/app/contracts/shared/components/popUps/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { dirtyCheck } from 'src/app/contracts/shared/operators/dirtyCheckOperator';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { SettingsOptions } from 'src/app/contracts/shared/models/settings.model';
import { FileUpload } from 'src/app/contracts/shared/components/file-uploader/files';
import { AppComponentBase } from 'src/shared/app-component-base';
import { CreationTitleService } from '../../../shared/services/creation-title.service';
import { AUTOCOMPLETE_SEARCH_ITEMS_COUNT } from 'src/app/contracts/shared/components/grid-table/master-templates/entities/master-templates.constants';
import { BaseEnumDto, MappedTableCells } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { MapFlagFromTenantId } from 'src/shared/helpers/tenantHelper';
import { MASTER_CREATION } from 'src/app/contracts/shared/entities/contracts.constants';
import { GetDocumentTypesByRecipient } from 'src/app/contracts/shared/utils/relevant-document-type';
import { ExtraHttpsService } from 'src/app/contracts/shared/services/extra-https.service';
import { Location } from '@angular/common';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateMasterTemplateComponent extends AppComponentBase implements OnInit, OnDestroy {
	creationRadioButtons = MASTER_CREATION;

	nextButtonLabel: string;

	editMode = false;
	currentTemplate: AgreementTemplateDetailsDto;

	possibleDocumentTypes: BaseEnumDto[];
	documentTypes$: Observable<BaseEnumDto[]>;

	legalEntities: LegalEntityDto[];

	preselectedFiles: FileUpload[] = [];

	agreementCreationMode = new FormControl({ value: AgreementCreationMode.Duplicated, disabled: true });
	creationModeControlReplay$ = new BehaviorSubject<AgreementCreationMode>(AgreementCreationMode.Duplicated);

	isFormDirty = false;

	masterTemplateFormGroup = new MasterTemplateModel();

	options$: Observable<[SettingsOptions, MappedTableCells]>;

	modeControl$ = new BehaviorSubject(AgreementCreationMode.Duplicated);
	masterTemplateOptions$: Observable<{ options$: Observable<any>; optionsChanged$: BehaviorSubject<string> } | null>;
	masterTemplateOptionsChanged$ = new BehaviorSubject<string>('');
	isMasterTemplateOptionsLoading$ = new BehaviorSubject(false);

	private _unSubscribe$ = new Subject<void>();

	private _templateId: number;

	constructor(
		private readonly _dialog: MatDialog,
		private readonly _contractsService: ContractsService,
		private readonly _apiServiceProxy: AgreementTemplateServiceProxy,
		private readonly _cdr: ChangeDetectorRef,
		private readonly _router: Router,
		private readonly _route: ActivatedRoute,
		private readonly _creationTitleService: CreationTitleService,
		private readonly _extraHttp: ExtraHttpsService,
		private readonly _location: Location,
		private _injector: Injector
	) {
		super(_injector);
	}

	ngOnInit(): void {
		this._setDocumentType();
		this._setOptions();
		this._subscribeOnTemplateNameChanges();
		this._subsribeOnLegEntitiesChanges();
		this._subscribeOnAgreementsFromOtherParty();
		if (this._route.snapshot.params.id) {
			this.editMode = true;
			this.nextButtonLabel = 'Save';
			this._templateId = this._route.snapshot.params.id;
			this._prefillForm();
		} else {
			this.nextButtonLabel = 'Next';
			this._subscribeOnModeReplay();
			this._subscribeOnDirtyStatus();
			this._initMasterTemplateOptions();
			this._subscribeOnCreationModeResolver();
			this._subscribeOnCreationMode();
			this._subscribeOnQueryParams();
		}
	}

	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
	}

	onSave(discarded = false) {
		if (this.masterTemplateFormGroup.receiveAgreementsFromOtherParty.value && !discarded) {
			this._showDiscardDialog();
			return;
		}
		if (!this.masterTemplateFormGroup.valid) {
			this.masterTemplateFormGroup.markAllAsTouched();
			return;
		}
		const toSend = new SaveAgreementTemplateDto({
			creationMode: this.editMode ? this.currentTemplate.creationMode : this.agreementCreationMode.value,
			...this.masterTemplateFormGroup.getRawValue(),
			attachments: this._agreementTemplateAttachmentDto(),
		});
		this.showMainSpinner();
		if (this.editMode) {
			this._extraHttp
				.agreementPatch(this.currentTemplate.agreementTemplateId, toSend)
				.pipe(
					switchMap(() => {
						return this._apiServiceProxy.preview2(this.currentTemplate.agreementTemplateId);
					}),
					tap(() => {
						this._creationTitleService.updateReceiveAgreementsFromOtherParty(toSend.receiveAgreementsFromOtherParty);
					}),
					tap((template) => {
						this.masterTemplateFormGroup.attachments.reset();
						this.preselectedFiles = template.attachments as FileUpload[];
					}),
					tap(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe();
		} else {
			this.showMainSpinner();
			this._extraHttp
				.agreementPost(new SaveAgreementTemplateDto(toSend))
				.pipe(
					takeUntil(this._unSubscribe$),
					finalize(() => this.hideMainSpinner()),
					tap((templateId: number | undefined) => {
						if (toSend.receiveAgreementsFromOtherParty) {
							this.navigateToEdit(templateId);
						} else {
							this.navigateToEditor(templateId);
						}
					})
				)
				.subscribe();
		}
	}

	onModeControlChange(creationMode: AgreementCreationMode) {
		this.modeControl$.next(creationMode);
	}

	private _subscribeOnQueryParams() {
		this._route.queryParams.pipe(takeUntil(this._unSubscribe$)).subscribe(({ id }) => {
			if (id) {
				this.agreementCreationMode.setValue(AgreementCreationMode.Duplicated);
				this.masterTemplateOptionsChanged$.next(String(id));
				this.masterTemplateFormGroup.duplicationSourceAgreementTemplateId.setValue(id);
			}
		});
	}

	private _agreementTemplateAttachmentDto(): AgreementTemplateAttachmentDto[] {
		return this.masterTemplateFormGroup.attachments.value.map((attachment: FileUpload) => {
			return new AgreementTemplateAttachmentDto(attachment);
		});
	}
	private _subscribeOnCreationMode() {
		this.creationModeControlReplay$
			.pipe(
				takeUntil(this._unSubscribe$),
				tap(() => {
					this.masterTemplateOptionsChanged$.next('');
				})
			)
			.subscribe((mode) => {
				if (mode === AgreementCreationMode.Duplicated) {
					this.masterTemplateFormGroup.addControl('duplicationSourceAgreementTemplateId', new FormControl(null));
					this._subscribeOnDuplicateControlChanges();
				} else {
					this.masterTemplateFormGroup.removeControl('duplicationSourceAgreementTemplateId');
				}
			});
	}

	private _subscribeOnModeReplay() {
		this.agreementCreationMode.valueChanges.pipe(takeUntil(this._unSubscribe$), distinctUntilChanged()).subscribe((val) => {
			this.creationModeControlReplay$.next(val);
		});
	}

	private _resetForm() {
		this.masterTemplateFormGroup.reset();
		this.preselectedFiles = [];
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

	private _setDocumentType() {
		this.documentTypes$ = (this.masterTemplateFormGroup.recipientTypeId.valueChanges as Observable<number>).pipe(
			switchMap((recipientTypeId) => {
				if (recipientTypeId) {
					return of(GetDocumentTypesByRecipient(this.possibleDocumentTypes, recipientTypeId));
				}
				return of(null);
			})
		);
	}

	private _subscribeOnDuplicateControlChanges() {
		this.masterTemplateFormGroup.duplicationSourceAgreementTemplateId.valueChanges
			.pipe(
				takeUntil(
					race([
						this.agreementCreationMode.valueChanges.pipe(
							filter((creationMode) => creationMode !== AgreementCreationMode.Duplicated)
						),
						this._unSubscribe$,
					])
				),
				filter((val: number | null | undefined) => !!val),
				tap((agreementTemplateId) => {
					const queryParams: Params = {
						id: `${agreementTemplateId}`,
					};
					this._router.navigate([], {
						queryParams: queryParams,
					});
				}),
				tap(() => {
					this.showMainSpinner();
				}),
				switchMap((parentTemplateId) => this._apiServiceProxy.preview2(parentTemplateId)),
				tap((template) => {
					this._onDuplicateChanged(template);
				}),
				tap(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe();
	}

	private _onDuplicateChanged(template: AgreementTemplateDetailsDto) {
		this.masterTemplateFormGroup.patchValue({
			isEnabled: template.isEnabled,
			agreementType: template.agreementType,
			recipientTypeId: template.recipientTypeId,
			name: template.name,
			agreementNameTemplate: template.agreementNameTemplate,
			definition: template.definition,
			legalEntities: template.legalEntityIds,
			contractTypes: template.contractTypeIds,
			salesTypes: template.salesTypeIds,
			deliveryTypes: template.deliveryTypeIds,
			language: template.language,
			note: template.note,
			receiveAgreementsFromOtherParty: template.receiveAgreementsFromOtherParty,
			isSignatureRequired: template.isSignatureRequired,
			isDefaultTemplate: template.isDefaultTemplate,
			selectedInheritedFiles: null,
			uploadedFiles: null,
		});
		this.preselectedFiles = template.attachments as FileUpload[];
		this._cdr.detectChanges();
	}

	private _subscribeOnCreationModeResolver() {
		this.modeControl$
			.pipe(
				takeUntil(this._unSubscribe$),
				switchMap(() => {
					if (this.isFormDirty) {
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
					this.agreementCreationMode.setValue(this.modeControl$.value);
					this._resetForm();
				}
			});
	}

	private _subscribeOnTemplateNameChanges() {
		this.masterTemplateFormGroup.controls['name'].valueChanges.subscribe((name: string) => {
			this._creationTitleService.updateTemplateName(name);
		});
	}

	private _subsribeOnLegEntitiesChanges() {
		this.masterTemplateFormGroup.controls['legalEntities'].valueChanges.subscribe((legalEntities: number[]) => {
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

	private _subscribeOnDirtyStatus() {
		this.masterTemplateFormGroup.valueChanges
			.pipe(
				takeUntil(this._unSubscribe$),
				map(() => this.masterTemplateFormGroup.getRawValue()),
				dirtyCheck(this.masterTemplateFormGroup.initial$)
			)
			.subscribe((isDirty) => {
				this.isFormDirty = isDirty;
			});
	}

	private _initMasterTemplateOptions() {
		this.masterTemplateOptions$ = this.creationModeControlReplay$.pipe(
			switchMap((creationMode) => {
				if (creationMode === AgreementCreationMode.Duplicated) {
					return of({
						options$: this.masterTemplateOptionsChanged$.pipe(
							takeUntil(this._unSubscribe$),
							startWith(this.masterTemplateOptionsChanged$.value),
							distinctUntilChanged(),
							debounceTime(500),
							tap(() => {
								this.isMasterTemplateOptionsLoading$.next(true);
							}),
							switchMap((freeText: string) => {
								return this._apiServiceProxy
									.simpleList2(false, undefined, undefined, freeText, 1, AUTOCOMPLETE_SEARCH_ITEMS_COUNT)
									.pipe(
										tap(() => {
											this.isMasterTemplateOptionsLoading$.next(false);
										}),
										withLatestFrom(this._contractsService.getEnumMap$()),
										map(([response, maps]) => {
											return response.items.map(
												(item) =>
													Object.assign(item, {
														tenantIds: item.tenantIds?.map((i) => maps.legalEntityIds[i]),
													}) as SimpleAgreementTemplatesListItemDto
											);
										})
									);
							})
						),
						optionsChanged$: this.masterTemplateOptionsChanged$,
					});
				} else {
					return of(null);
				}
			})
		);
	}

	private _disableFields() {
		this.masterTemplateFormGroup.agreementType.disable({ emitEvent: false });
		this.masterTemplateFormGroup.recipientTypeId.disable({ emitEvent: false });
	}

	private _prefillForm() {
		this._apiServiceProxy
			.agreementTemplateGET(this._templateId)
			.pipe(
				tap((template) => {
					this._creationTitleService.updateReceiveAgreementsFromOtherParty(template.receiveAgreementsFromOtherParty);
					if (template.creationMode === AgreementCreationMode.Duplicated) {
						this._initMasterTemplateOptions();
						this.masterTemplateFormGroup.addControl(
							'duplicationSourceAgreementTemplateId',
							new FormControl({
								value: template.duplicationSourceAgreementTemplateId,
								disabled: true,
							})
						);
						this.masterTemplateOptionsChanged$.next(String(template.duplicationSourceAgreementTemplateId));
					}
				}),
				tap((template) => {
					this.agreementCreationMode.setValue(template.creationMode);
					this.currentTemplate = template;
					this.preselectedFiles = template.attachments as FileUpload[];
					this._cdr.detectChanges();

					this.masterTemplateFormGroup.patchValue({
						agreementType: template.agreementType,
						recipientTypeId: template.recipientTypeId,
						duplicationSourceAgreementTemplateId: template.duplicationSourceAgreementTemplateId,
						name: template.name,
						agreementNameTemplate: template.agreementNameTemplate,
						definition: template.definition,
						legalEntities: template.legalEntityIds,
						salesTypes: template.salesTypeIds,
						deliveryTypes: template.deliveryTypeIds,
						contractTypes: template.contractTypeIds,
						language: template.language,
						note: template.note,
						isSignatureRequired: template.isSignatureRequired,
						isEnabled: template.isEnabled,
						receiveAgreementsFromOtherParty: template.receiveAgreementsFromOtherParty,
						isDefaultTemplate: template.isDefaultTemplate,
						selectedInheritedFiles: template.attachments,
					});
				}),
				tap(() => {
					this._disableFields();
				})
			)
			.subscribe();
	}

	private _subscribeOnAgreementsFromOtherParty() {
		this.masterTemplateFormGroup.receiveAgreementsFromOtherParty.valueChanges
			.pipe(takeUntil(this._unSubscribe$))
			.subscribe((receiveAgreementsFromOtherParty) => {
				if (receiveAgreementsFromOtherParty && !this.editMode) {
					this.nextButtonLabel = 'Complete';
					this.masterTemplateFormGroup.removeControl('isSignatureRequired');
				}
				if (!receiveAgreementsFromOtherParty && this.editMode) {
					this.nextButtonLabel = 'Save';
					this.masterTemplateFormGroup.addControl('isSignatureRequired', new FormControl(false));
				}
				if (receiveAgreementsFromOtherParty && this.editMode) {
					this.nextButtonLabel = 'Save';
					this.masterTemplateFormGroup.removeControl('isSignatureRequired');
				}
				if (!receiveAgreementsFromOtherParty && !this.editMode) {
					this.nextButtonLabel = 'Next';
					this.masterTemplateFormGroup.addControl(
						'isSignatureRequired',
						new FormControl(this.masterTemplateFormGroup.initialValue.isSignatureRequired)
					);
				}
			});
	}

	private _showDiscardDialog() {
		let dialogRef = this._dialog.open(ConfirmDialogComponent, {
			width: '500px',
			minHeight: '240px',
			height: 'auto',
			backdropClass: 'backdrop-modal--wrapper',
			data: {
				message: `You\'ve selected “Always receive from other party”. By doing so you are permanently discarding any previous document changes and disabling document editor.  Are you sure you want to proceed?`,
			},
		});
		dialogRef.afterClosed().subscribe((discarded) => {
			if (discarded) {
				this.onSave(discarded);
			}
		});
	}
}
