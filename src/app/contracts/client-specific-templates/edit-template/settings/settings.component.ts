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
import { Observable, Subject, of, BehaviorSubject } from 'rxjs';
import { FormControl } from '@angular/forms';
import {
    ClientTemplatesModel,
    INITIAL_CLIENT_TEMPLATE_FORM_VALUE,
} from '../../../shared/models/client-templates.model';
import { MatDialog } from '@angular/material/dialog';
import { dirtyCheck } from '../../../shared/operators/dirtyCheckOperator';
import { ConfirmDialogComponent } from 'src/app/contracts/shared/components/popUps/confirm-dialog/confirm-dialog.component';
import { AppComponentBase } from 'src/shared/app-component-base';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { FileUpload } from 'src/app/contracts/shared/components/file-uploader/files';
@Component({
    selector: 'app-creation',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class CreationComponent
    extends AppComponentBase
    implements OnInit, OnDestroy
{
    get currentMode() {
        return this.creationModeControl.value;
    }

    creationModes = AgreementCreationMode;

    isDirty: boolean = false;
    isValid: boolean = false;

    isDuplicateFromInherited = false;

    parentMasterTemplateControl = new FormControl();
    clientTemplateControl = new FormControl(null);
    creationModeControl = new FormControl(AgreementCreationMode.FromScratch);

    clientTemplateFormGroup = new ClientTemplatesModel();

    preselectedFiles: FileUpload[] = [];

    options$ = this._contractService.settingsPageOptions$();

    modeControl = new BehaviorSubject(AgreementCreationMode.FromScratch);

    clientOptions$: Observable<ClientResultDto[]>;
    clientTemplatesOptions$: Observable<SimpleAgreementTemplatesListItemDto[]>;
    masterTemplatesOptions$: Observable<SimpleAgreementTemplatesListItemDto[]>;

    clientOptionsChanged$ = new Subject<string>();
    masterTemplateOptionsChanged$ = new Subject<string>();
    clientTemplateOptionsChanged$ = new Subject<string>();

    private _unSubscribe$ = new Subject<void>();
    private initialFormValue$ = of(INITIAL_CLIENT_TEMPLATE_FORM_VALUE);

    constructor(
        private readonly _injector: Injector,
        private readonly _contractService: ContractsService,
        private readonly _cdr: ChangeDetectorRef,
        private readonly _apiServiceProxy: AgreementTemplateServiceProxy,
        private readonly _lookupServiceProxy: LookupServiceProxy,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        public _dialog: MatDialog
    ) {
        super(_injector);
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
        this._unSubscribe$.next();
        this._unSubscribe$.complete();
    }

    navigateOnAction() {
        this.router.navigate(['../../client-specific-templates'], {
            relativeTo: this.route,
        });
    }

    //delete as any after nswag fix
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

        const uploadedFiles = this.clientTemplateFormGroup.uploadedFiles?.value
            ? this.clientTemplateFormGroup.uploadedFiles?.value
            : [];
        const selectedInheritedFiles = this.clientTemplateFormGroup
            .selectedInheritedFiles?.value
            ? this.clientTemplateFormGroup.selectedInheritedFiles?.value
            : [];
        switch (creationMode) {
            case AgreementCreationMode.FromScratch: {
                agreementPostDto.attachments = uploadedFiles.map(
                    (attachment: any) => {
                        return new AgreementTemplateAttachmentDto(attachment);
                    }
                );
                break;
            }
            case AgreementCreationMode.InheritedFromParent: {
                agreementPostDto.parentAgreementTemplateId =
                    this.parentMasterTemplateControl.value;
                agreementPostDto.attachments = uploadedFiles.map(
                    (attachment: any) => {
                        return new AgreementTemplateAttachmentDto(attachment);
                    }
                );
                agreementPostDto.parentSelectedAttachmentIds =
                    selectedInheritedFiles.map(
                        (file: any) => file.agreementTemplateAttachmentId
                    );
                break;
            }
            case AgreementCreationMode.Duplicated: {
                agreementPostDto.attachments = [
                    ...uploadedFiles,
                    ...selectedInheritedFiles,
                ].map((attachment: FileUpload) => {
                    return new AgreementTemplateAttachmentDto(attachment);
                });
                agreementPostDto.duplicationSourceAgreementTemplateId =
                    this.clientTemplateControl.value;
                break;
            }
        }
        this._apiServiceProxy
            .agreementTemplatePOST(
                new SaveAgreementTemplateDto(agreementPostDto)
            )
            .subscribe(() => {
                this.navigateOnAction();
            });
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
                return this._apiServiceProxy.simpleList2(
                    isClientTemplate,
                    true, // FIXME: hardcoded
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
                let search = searchInput ? searchInput : '';
                return this._lookupServiceProxy.clientsAll(search, 20);
            })
        );
    }
    private _subscribeOnStatusChanges(): void {
        this.clientTemplateFormGroup.statusChanges
            .pipe(takeUntil(this._unSubscribe$))
            .subscribe((status) => {
                if (status === 'VALID') {
                    return (this.isValid = true);
                }
                this.isValid = false;
            });
    }

    private _subscribeOnDirtyStatus(): void {
        this.clientTemplateFormGroup.valueChanges
            .pipe(
                takeUntil(this._unSubscribe$),
                map(() => this.clientTemplateFormGroup.getRawValue()),
                dirtyCheck(this.initialFormValue$)
            )
            .subscribe((isDirty) => {
                this.isDirty = isDirty;
            });
    }

    private _subscribeOnMasterTemplateChanges(): void {
        this.parentMasterTemplateControl.valueChanges
            .pipe(
                takeUntil(this._unSubscribe$),
                switchMap((agreementTemplateId: number) => {
                    return this._apiServiceProxy.agreementTemplateGET(
                        agreementTemplateId
                    );
                }),
                tap((agreementTemplate: AgreementTemplateDetailsDto) => {
                    this._setDataFromRetrievedTemplate(agreementTemplate);
                    this.clientTemplateFormGroup.enable({
                        emitEvent: false,
                    });
                    this._disableControls();
                })
            )
            .subscribe();
    }

    private _subscribeOnClientTemplateChanges(): void {
        this.clientTemplateControl.valueChanges
            .pipe(
                takeUntil(this._unSubscribe$),
                switchMap((agreementTemplateId: number) => {
                    return this._apiServiceProxy.agreementTemplateGET(
                        agreementTemplateId
                    );
                }),
                tap((agreementTemplate) => {
                    this._setDataFromRetrievedTemplate(agreementTemplate);
                    this.clientTemplateFormGroup.enable({
                        emitEvent: false,
                    });
                    if (this.isDuplicateFromInherited) {
                        this._disableControls();
                    }
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
        this._cdr.detectChanges();
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
                takeUntil(this._unSubscribe$),
                skip(1),
                switchMap(() => {
                    if (this.isDirty) {
                        let dialogRef = this._dialog.open(
                            ConfirmDialogComponent,
                            {
                                width: '280px',
                            }
                        );
                        return dialogRef.afterClosed();
                    }
                    return of(true);
                })
            )
            .subscribe((discard) => {
                if (discard) {
                    this.creationModeControl.setValue(this.modeControl.value);
                    this.onCreationModeChange(this.modeControl.value);
                }
            });
    }

    private onCreationModeChange(mode: AgreementCreationMode): void {
        this.clientTemplateFormGroup.reset();
        switch (mode) {
            case AgreementCreationMode.FromScratch: {
                this.clientTemplateControl.reset(null, { emitEvent: false });
                this.parentMasterTemplateControl.reset(null, {
                    emitEvent: false,
                });
                this.clientTemplateFormGroup.enable({ emitEvent: false });
                break;
            }
            case AgreementCreationMode.InheritedFromParent: {
                this.clientTemplateControl.reset(null, { emitEvent: false });
                this.masterTemplateOptionsChanged$.next('');
                this.clientTemplateFormGroup.disable({
                    emitEvent: false,
                });
                break;
            }
            case AgreementCreationMode.Duplicated: {
                this.parentMasterTemplateControl.reset(null, {
                    emitEvent: false,
                });
                this.clientTemplateOptionsChanged$.next('');
                this.clientTemplateFormGroup.disable({
                    emitEvent: false,
                });
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
