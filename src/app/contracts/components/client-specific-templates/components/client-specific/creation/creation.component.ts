import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    ViewEncapsulation,
    Injector,
    OnDestroy,
} from '@angular/core';
import { ContractsService } from 'src/app/contracts/contracts.service';
import {
    AgreementCreationMode,
    AgreementTemplateAttachmentDto,
    AgreementTemplateDetailsDto,
    AgreementTemplateServiceProxy,
    ApiServiceProxy,
    ClientResultDto,
    EnumEntityTypeDto,
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
    skip,
    takeUntil,
} from 'rxjs/operators';
import {
    combineLatest,
    Observable,
    Subject,
    forkJoin,
    of,
    BehaviorSubject,
    ReplaySubject,
} from 'rxjs';
import { BaseEnumDto } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { FormControl } from '@angular/forms';
import { ClientTemplatesModel } from './entities/client-templates.model';
import { FileUpload } from 'src/app/contracts/shared/components/new-file-uploader/new-file-uploader.interface';
import { MatDialog } from '@angular/material/dialog';
import { DirtyCheckService } from './dirty-check.service';
import { dirtyCheck } from './dirtyCheckOperator';
import { ConfirmDialogComponent } from 'src/app/contracts/shared/components/popUps/confirm-dialog/confirm-dialog.component';
import { AppComponentBase } from 'src/shared/app-component-base';
import { REQUIRED_VALIDATION_MESSAGE } from 'src/app/contracts/shared/entities/contracts.constants';
@Component({
    selector: 'app-creation',
    templateUrl: './creation.component.html',
    styleUrls: ['./creation.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [DirtyCheckService],
})
export class CreationComponent
    extends AppComponentBase
    implements OnInit, OnDestroy
{
    constructor(
        private readonly injector: Injector,
        private readonly cdr: ChangeDetectorRef,
        private readonly dirtyCheckService: DirtyCheckService,
        private readonly apiServiceProxy: ApiServiceProxy,
        private readonly contractService: ContractsService,
        private readonly lookupServiceProxy: LookupServiceProxy,
        private readonly agreementTemplateServiceProxy: AgreementTemplateServiceProxy,
        public dialog: MatDialog
    ) {
        super(injector);
    }
    get currentMode() {
        return this.creationModeControl.value;
    }
    // to use in template
    creationModes = AgreementCreationMode;

    isDirty: boolean = false;
    isValid: boolean = false;

    isDuplicateFromInherited = false;
    requiredValidationMessage = REQUIRED_VALIDATION_MESSAGE;
    //parent template && client template controls
    parentMasterTemplateControl = new FormControl({});
    clientTemplateControl = new FormControl({});
    creationModeControl = new FormControl(AgreementCreationMode.FromScratch);

    clientTemplateFormGroup = new ClientTemplatesModel();

    agreementTypes$ = this.contractService.getAgreementTypes$();
    recipientTypes$ = this.contractService.getRecipientTypes$();

    legalEntities$ = this.contractService.getLegalEntities$();
    salesTypes$ = this.contractService.getSalesTypes$();
    deliveryTypes$ = this.contractService.getDeliveryTypes$();
    contractTypes$ = this.contractService.getEmploymentTypes$();
    languages$ = this.contractService.getAgreementLanguages$();

    preselectedFiles: FileUpload[] = [];
    optionsObservable$: [
        ReplaySubject<BaseEnumDto[]>,
        ReplaySubject<EnumEntityTypeDto[]>,
        ReplaySubject<LegalEntityDto[]>,
        ReplaySubject<EnumEntityTypeDto[]>,
        ReplaySubject<EnumEntityTypeDto[]>,
        ReplaySubject<EnumEntityTypeDto[]>,
        ReplaySubject<BaseEnumDto[]>
    ] = [
        this.agreementTypes$,
        this.recipientTypes$,
        this.legalEntities$,
        this.salesTypes$,
        this.deliveryTypes$,
        this.contractTypes$,
        this.languages$,
    ];
    options$ = combineLatest(this.optionsObservable$).pipe(
        map((combined) => {
            return {
                agreementType: combined[0] as unknown as BaseEnumDto[],
                recipientTypeId: combined[1] as unknown as EnumEntityTypeDto[],
                legalEntities: combined[2] as unknown as LegalEntityDto[],
                salesTypes: combined[3] as unknown as EnumEntityTypeDto[],
                deliveryTypes: combined[4] as unknown as EnumEntityTypeDto[],
                contractTypes: combined[5] as unknown as EnumEntityTypeDto[],
                languages: combined[6] as unknown as BaseEnumDto[],
            };
        })
    );

    modeControl = new BehaviorSubject(AgreementCreationMode.FromScratch);

    clientOptions$: Observable<ClientResultDto[]>;
    clientTemplatesOptions$: Observable<SimpleAgreementTemplatesListItemDto[]>;
    masterTemplatesOptions$: Observable<SimpleAgreementTemplatesListItemDto[]>;

    clientOptionsChanged$ = new Subject<string>();
    masterTemplateOptionsChanged$ = new Subject<string>();
    clientTemplateOptionsChanged$ = new Subject<string>();

    private unSubscribe$ = new Subject<void>();

    trackByRecipientId(index: number, item: EnumEntityTypeDto) {
        return item.id;
    }
    trackByLegalEntityId(index: number, item: LegalEntityDto) {
        return item.id;
    }
    trackByDeliveryTypeId(index: number, item: EnumEntityTypeDto) {
        return item.id;
    }
    trackByContractTypeId(index: number, item: EnumEntityTypeDto) {
        return item.id;
    }

    private _initExistingTemplates(): void {
        this.clientTemplatesOptions$ =
            this._getExistingTemplatesObservable$(true);
        this.masterTemplatesOptions$ =
            this._getExistingTemplatesObservable$(false);
    }

    private _getExistingTemplatesObservable$(isClientTemplate: boolean) {
        return this.masterTemplateOptionsChanged$.pipe(
            startWith(''),
            switchMap((searchInput) => {
                return this.agreementTemplateServiceProxy.simpleList(
                    isClientTemplate,
                    searchInput,
                    1,
                    20
                );
            }),
            map(
                (paginatedList) =>
                    paginatedList.items as SimpleAgreementTemplatesListItemDto[]
            )
        );
    }
    private _initClients(): void {
        this.clientOptions$ = this.clientOptionsChanged$.pipe(
            startWith(''),
            switchMap((searchInput) => {
                return this.lookupServiceProxy.clients(searchInput, 20);
            })
        );
    }
    private _subscribeOnStatusChanges(): void {
        this.clientTemplateFormGroup.statusChanges
            .pipe(takeUntil(this.unSubscribe$))
            .subscribe((status) => {
                if (status === 'VALID') {
                    return (this.isValid = true);
                }
                this.isValid = false;
            });
    }
    ngOnInit(): void {
        //disable creation mode changes, so we can make resolver for radio buttons
        this.creationModeControl.disable();
        this._subscribeOnMasterTemplateChanges();
        this._subscribeOnDirtyStatus();
        this._initClients();
        this._initExistingTemplates();
        this._subscribeOnClientTemplateChanges();
        this._subscribeOnCreationModeResolver();
        this._subscribeOnStatusChanges();
    }
    ngOnDestroy(): void {
        this.unSubscribe$.next();
    }
    onSave() {
        let creationMode = this.creationModeControl.value;
        const agreementPostDto = Object.assign(
            {},
            {
                ...this.clientTemplateFormGroup.getRawValue(),
                creationMode: creationMode,
                documentFileProvidedByClient: false,
            }
        ) as SaveAgreementTemplateDto;
        switch (creationMode) {
            case AgreementCreationMode.FromScratch: {
                agreementPostDto.attachments =
                    this.clientTemplateFormGroup.attachments?.value.uploadedFiles.map(
                        (attachment: any) => {
                            return new AgreementTemplateAttachmentDto(
                                attachment
                            );
                        }
                    );
                break;
            }
            case AgreementCreationMode.InheritedFromParent: {
                (agreementPostDto as any).parentAgreementTemplateId =
                    this.parentMasterTemplateControl.value;
                agreementPostDto.attachments =
                    this.clientTemplateFormGroup.attachments?.value.uploadedFiles.map(
                        (attachment: any) => {
                            return new AgreementTemplateAttachmentDto(
                                attachment
                            );
                        }
                    );
                agreementPostDto.parentSelectedAttachmentIds =
                    this.clientTemplateFormGroup.attachments?.value.selectedInheritedFiles.map(
                        (file: any) => file.agreementTemplateAttachmentId
                    );
                break;
            }
            case AgreementCreationMode.Duplicated: {
                const attachments =
                    this.clientTemplateFormGroup.attachments?.value;
                agreementPostDto.attachments = [
                    ...attachments.uploadedFiles,
                    ...attachments.selectedInheritedFiles,
                ].map((attachment: FileUpload) => {
                    return new AgreementTemplateAttachmentDto(attachment);
                });
                agreementPostDto.duplicationSourceAgreementTemplateId =
                    this.clientTemplateControl.value;
                break;
            }
        }
        this.apiServiceProxy
            .agreementTemplatePost(
                new SaveAgreementTemplateDto(agreementPostDto)
            )
            .subscribe();
    }

    private _subscribeOnDirtyStatus(): void {
        this.clientTemplateFormGroup.valueChanges
            .pipe(
                takeUntil(this.unSubscribe$),
                map(() => this.clientTemplateFormGroup.getRawValue()),
                dirtyCheck(this.dirtyCheckService.initialFormValue$)
            )
            .subscribe((isDirty) => {
                this.isDirty = isDirty;
            });
    }

    private _subscribeOnMasterTemplateChanges(): void {
        this.parentMasterTemplateControl.valueChanges
            .pipe(
                takeUntil(this.unSubscribe$),
                switchMap((agreementTemplateId: number) => {
                    return this.apiServiceProxy.agreementTemplateGet(
                        agreementTemplateId as number
                    );
                }),
                tap((data: AgreementTemplateDetailsDto) => {
                    this._setDataFromRetrievedTemplate(data);
                })
            )
            .subscribe();
    }
    private _subscribeOnClientTemplateChanges(): void {
        this.clientTemplateControl.valueChanges
            .pipe(
                takeUntil(this.unSubscribe$),
                switchMap((agreementTemplateId) => {
                    return this.apiServiceProxy.agreementTemplateGet(
                        agreementTemplateId as number
                    );
                }),
                tap((agreementTemplate) => {
                    this._setDataFromRetrievedTemplate(agreementTemplate);
                })
            )
            .subscribe();
    }
    private _setDataFromRetrievedTemplate(
        data: AgreementTemplateDetailsDto
    ): void {
        this.clientTemplateFormGroup.patchValue({
            agreementType: data.agreementType,
            recipientTypeId: data.recipientTypeId,
            clientId: {
                clientId: data.clientId,
                clientName: data.clientName,
            },
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
            attachments: [],
        });
        this.preselectedFiles = [
            ...(data.attachments?.map(
                (attachment) =>
                    Object.assign(
                        {},
                        {
                            agreementTemplateAttachmentId:
                                attachment.agreementTemplateAttachmentId,
                            name: attachment.name,
                        }
                    ) as FileUpload
            ) as FileUpload[]),
            ...(data.attachmentsFromParent
                ? data.attachmentsFromParent.map(
                      (attachment) =>
                          Object.assign(
                              {},
                              {
                                  agreementTemplateAttachmentId:
                                      attachment.agreementTemplateAttachmentId,
                                  name: attachment.name,
                              }
                          ) as FileUpload
                  )
                : []),
        ];
        this.isDuplicateFromInherited = !!data.parentAgreementTemplateId;
        this._updateDisabledStateForDuplicate();
        this.cdr.detectChanges();
    }
    private _updateDisabledStateForDuplicate(): void {
        if (this.isDuplicateFromInherited) {
            this._disableControls();
        } else {
            this._enableControls();
        }
    }
    private _subscribeOnCreationModeResolver(): void {
        this.modeControl
            .pipe(
                takeUntil(this.unSubscribe$),
                skip(1),
                switchMap((mode) => {
                    if (this.isDirty) {
                        let dialogRef = this.dialog.open(
                            ConfirmDialogComponent,
                            {
                                width: '280px',
                            }
                        );
                        return forkJoin([of(mode), dialogRef.afterClosed()]);
                    }
                    return forkJoin([of(mode), of(true)]);
                })
            )
            .subscribe(([mode, discard]) => {
                if (discard) {
                    this.creationModeControl.setValue(mode);
                    this.onCreationModeChange(mode);
                }
            });
    }
    private onCreationModeChange(mode: AgreementCreationMode): void {
        switch (mode) {
            case AgreementCreationMode.FromScratch: {
                this._enableControls();
                this.clientTemplateFormGroup.reset(
                    this.dirtyCheckService.initialFormValue$.value
                );
                break;
            }
            case AgreementCreationMode.InheritedFromParent: {
                this._disableControls();
                this.clientTemplateFormGroup.reset(
                    this.dirtyCheckService.initialFormValue$.value
                );
                break;
            }
            case AgreementCreationMode.Duplicated: {
                this.clientTemplateFormGroup.reset(
                    this.dirtyCheckService.initialFormValue$.value
                );
                break;
            }
        }
    }
    private _enableControls(): void {
        this.clientTemplateFormGroup.agreementType?.enable({
            emitEvent: false,
        });
        this.clientTemplateFormGroup.recipientTypeId?.enable({
            emitEvent: false,
        });
        this.clientTemplateFormGroup.language?.enable({
            emitEvent: false,
        });
    }
    private _disableControls(): void {
        this.clientTemplateFormGroup.agreementType?.disable({
            emitEvent: false,
        });
        this.clientTemplateFormGroup.recipientTypeId?.disable({
            emitEvent: false,
        });
        this.clientTemplateFormGroup.language?.disable({
            emitEvent: false,
        });
    }
}
