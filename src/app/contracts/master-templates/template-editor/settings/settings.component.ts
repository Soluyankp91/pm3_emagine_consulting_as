import {
    map,
    switchMap,
    tap,
    skip,
    takeUntil,
    filter,
    finalize,
    distinctUntilChanged,
    catchError,
    debounceTime,
} from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject, of, EMPTY, merge } from 'rxjs';
import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ViewEncapsulation,
    OnDestroy,
    Injector,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
    AgreementCreationMode,
    AgreementTemplateAttachmentDto,
    AgreementTemplateDetailsDto,
    AgreementTemplateServiceProxy,
    LegalEntityDto,
    SaveAgreementTemplateDto,
    SimpleAgreementTemplatesListItemDto,
    SimpleAgreementTemplatesListItemDtoPaginatedList,
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
import { CreationTitleService } from '../creation-title.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class CreateMasterTemplateComponent
    extends AppComponentBase
    implements OnInit, OnDestroy
{
    editMode = false;
    templateId: number;
    currentTemplate: { [key: string]: any };

    initialLoading = true;

    legalEntities: LegalEntityDto[];

    preselectedFiles: FileUpload[] = [];

    creationModes = AgreementCreationMode;
    agreementCreationMode = new FormControl(AgreementCreationMode.FromScratch);

    createControl = new FormControl();
    duplicateTemplateControl = new FormControl(null);

    isFormDirty = false;

    masterTemplateFormGroup = new MasterTemplateModel();

    options$: Observable<SettingsOptions> = this._contractsService
        .settingsPageOptions$()
        .pipe(
            tap(({ legalEntities }) => {
                this.legalEntities = legalEntities;
            })
        );

    modeControl$ = new BehaviorSubject(AgreementCreationMode.FromScratch);
    masterTemplateOptions$: Observable<
        SimpleAgreementTemplatesListItemDto[] | null
    >;
    masterTemplateOptionsChanged$ = new Subject<string>();
    null$ = new Subject<null>();
    creationChange$ = new Subject<null | ''>();

    private initialFormValue$ = this.masterTemplateFormGroup.initial$;
    private unSubscribe$ = new Subject<void>();

    constructor(
        private readonly _dialog: MatDialog,
        private readonly _contractsService: ContractsService,
        private readonly _apiServiceProxy: AgreementTemplateServiceProxy,
        private readonly _cdr: ChangeDetectorRef,
        private readonly _router: Router,
        private readonly _route: ActivatedRoute,
        private readonly _creationTitleService: CreationTitleService,
        private _injector: Injector
    ) {
        super(_injector);
    }

    ngOnInit(): void {
        if (this._route.snapshot.params.id) {
            this.editMode = true;
            this.templateId = this._route.snapshot.params.id;
            this.masterTemplateFormGroup.addControl(
                'duplicationSourceAgreementTemplateId',
                this.duplicateTemplateControl
            );
            this.duplicateTemplateControl.disable({ emitEvent: false });
            this._prefillForm();
        } else {
            this.agreementCreationMode.disable({ emitEvent: false });
            this._subscribeOnDuplicateControlChanges();
            this._subscribeOnDirtyStatus();
            this._subscribeOnCreationModeResolver();
        }
        this._subscribeOnTemplateNameChanges();
        this._subsribeOnLegEntitiesChanges();
        this._initMasterTemplateOptions();
    }

    ngOnDestroy(): void {
        this.unSubscribe$.next();
        this.unSubscribe$.complete();
    }

    onSave() {
        if (!this.masterTemplateFormGroup.valid) {
            this.masterTemplateFormGroup.markAllAsTouched();
            return;
        }
        const toSend = new SaveAgreementTemplateDto({
            creationMode: this.editMode
                ? this.currentTemplate.creationMode
                : this.agreementCreationMode.value,
            attachments: this._agreementTemplateAttachmentDto(),
            ...this.masterTemplateFormGroup.getRawValue(),
        });

        if (this.editMode) {
            toSend.duplicationSourceAgreementTemplateId =
                this.currentTemplate.duplicationSourceAgreementTemplateId;
            this.showMainSpinner();
            this._apiServiceProxy
                .agreementTemplatePATCH(this.templateId, toSend)
                .pipe(
                    finalize(() => {
                        this.hideMainSpinner();
                    })
                )
                .subscribe(() => {
                    this.navigateOnAction();
                });
            return;
        }
        this.showMainSpinner();
        this._apiServiceProxy
            .agreementTemplatePOST(
                new SaveAgreementTemplateDto(
                    new SaveAgreementTemplateDto(toSend)
                )
            )
            .pipe(
                takeUntil(this.unSubscribe$),
                map((result) => result.agreementTemplateId),
                finalize(() => this.hideMainSpinner())
            )
            .subscribe((templateId) => {
                this.navigateOnAction(templateId);
            });
    }

    onCancel() {
        this.navigateOnAction();
    }

    private _agreementTemplateAttachmentDto() {
        const uploadedFiles = this.masterTemplateFormGroup.uploadedFiles?.value
            ? this.masterTemplateFormGroup.uploadedFiles?.value
            : [];
        const selectedInheritedFiles = this.masterTemplateFormGroup
            .selectedInheritedFiles?.value
            ? this.masterTemplateFormGroup.selectedInheritedFiles?.value
            : [];
        return [...uploadedFiles, ...selectedInheritedFiles].map(
            (attachment: FileUpload) => {
                return new AgreementTemplateAttachmentDto(attachment);
            }
        );
    }

    private onCreationModeChange() {
        let mode = this.agreementCreationMode.value;
        if (mode === AgreementCreationMode.FromScratch) {
            this.masterTemplateFormGroup.removeControl(
                'duplicationSourceAgreementTemplateId'
            );
            this._router.navigate([], {
                relativeTo: this._route,
                queryParams: {},
            });
        } else {
            this.masterTemplateFormGroup.addControl(
                'duplicationSourceAgreementTemplateId',
                this.duplicateTemplateControl
            );
        }
    }

    private _resetForm() {
        this.masterTemplateFormGroup.reset();
        this.duplicateTemplateControl.reset();
        this.preselectedFiles = [];
    }

    private navigateOnAction(templateId?: number) {
        if (!this.editMode && templateId) {
            return this._router.navigate([`../${templateId}/settings`], {
                relativeTo: this._route,
            });
        }
        if (this.editMode) {
            return this._router.navigate(['../../'], {
                relativeTo: this._route,
            });
        }
        return this._router.navigate(['../'], {
            relativeTo: this._route,
        });
    }

    private _subscribeOnDuplicateControlChanges() {
        this.duplicateTemplateControl.valueChanges
            .pipe(
                takeUntil(this.unSubscribe$),
                filter((val: number | null | undefined) => !!val),
                distinctUntilChanged(),
                tap((agreementTemplateId) => {
                    const queryParams: Params = {
                        parentTemplateId: `${agreementTemplateId}`,
                    };
                    this._router.navigate([], {
                        queryParams: queryParams,
                    });
                })
            )
            .subscribe();
    }

    private _onDuplicateChanges(template: AgreementTemplateDetailsDto) {
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
            isSignatureRequired: template.isSignatureRequired,
            defaultTemplate: template.documentFileProvidedByClient,
            selectedInheritedFiles: null,
            uploadedFiles: null,
        });
        this.preselectedFiles = template.attachments?.map(
            (attachment) =>
                ({
                    agreementTemplateAttachmentId:
                        attachment.agreementTemplateAttachmentId,
                    name: attachment.name,
                } as FileUpload)
        ) as FileUpload[];
        this._cdr.detectChanges();
    }

    private _subscribeOnCreationModeResolver() {
        this.modeControl$
            .pipe(
                takeUntil(this.unSubscribe$),
                skip(1),
                switchMap(() => {
                    if (this.isFormDirty) {
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
                    this.agreementCreationMode.setValue(
                        this.modeControl$.value
                    );
                    if (
                        !(
                            this.modeControl$.value ===
                            this.creationModes.FromScratch
                        )
                    ) {
                        this.onCreationModeChange();
                        this._resetForm();
                        this.creationChange$.next('');
                        return;
                    }
                    this.creationChange$.next(null);
                }
            });
    }

    private _subscribeOnTemplateNameChanges() {
        this.masterTemplateFormGroup.controls['name'].valueChanges.subscribe(
            (name) => {
                this._creationTitleService.updateTemplateName(name);
            }
        );
    }

    private _subsribeOnLegEntitiesChanges() {
        this.masterTemplateFormGroup.controls[
            'legalEntities'
        ].valueChanges.subscribe((legalEntities: number[]) => {
            if (legalEntities) {
                let entities = this.legalEntities.filter((extendedEntity) =>
                    legalEntities.find(
                        (simpleEntity) => extendedEntity.id === simpleEntity
                    )
                );
                this._creationTitleService.updateTenants(entities);
                return;
            }
            this._creationTitleService.updateTenants([]);
        });
    }

    private _subscribeOnDirtyStatus() {
        this.masterTemplateFormGroup.valueChanges
            .pipe(
                takeUntil(this.unSubscribe$),
                map(() => this.masterTemplateFormGroup.getRawValue()),
                dirtyCheck(this.initialFormValue$)
            )
            .subscribe((isDirty) => {
                this.isFormDirty = isDirty;
            });
    }

    private _initMasterTemplateOptions() {
        const freeText$: Observable<SimpleAgreementTemplatesListItemDtoPaginatedList> =
            this.masterTemplateOptionsChanged$.pipe(
                takeUntil(this.unSubscribe$),
                distinctUntilChanged(),
                debounceTime(500),
                switchMap((freeText: string) => {
                    return this._apiServiceProxy.simpleList2(
                        false,
                        freeText,
                        1,
                        1000
                    );
                })
            );
        const routeParams$: Observable<SimpleAgreementTemplatesListItemDtoPaginatedList> =
            this._route.queryParams.pipe(
                takeUntil(this.unSubscribe$),
                distinctUntilChanged(),
                map((queryParams) => queryParams.parentTemplateId),
                switchMap((parentTemplateId) => {
                    if (!parentTemplateId) {
                        this.agreementCreationMode.setValue(
                            this.creationModes.FromScratch
                        );
                        this.null$.next(null);
                        return EMPTY;
                    }
                    this.showMainSpinner();
                    return this._apiServiceProxy.agreementTemplateGET(
                        parentTemplateId
                    );
                }),
                tap(() => {
                    if (
                        this.agreementCreationMode.value ===
                        this.creationModes.FromScratch
                    ) {
                        this.agreementCreationMode.setValue(
                            this.creationModes.Duplicated
                        );
                    }
                    this.onCreationModeChange();
                }),
                catchError(() => {
                    this.agreementCreationMode.setValue(
                        this.creationModes.FromScratch
                    );
                    this.onCreationModeChange();
                    this.hideMainSpinner();
                    return EMPTY;
                }),
                switchMap((parentTemplate) =>
                    this._apiServiceProxy
                        .simpleList2(false, parentTemplate.name, 1, 1000)
                        .pipe(
                            finalize(() => {
                                setTimeout(() => {
                                    this.duplicateTemplateControl.setValue(
                                        parentTemplate.agreementTemplateId,
                                        { emitEvent: false }
                                    );
                                    this._onDuplicateChanges(parentTemplate);
                                    this.hideMainSpinner();
                                });
                            })
                        )
                )
            );
        const null$: Observable<null> = this.null$.pipe(
            takeUntil(this.unSubscribe$),
            tap(() => {
                this.onCreationModeChange();
                this._resetForm();
            })
        );
        const creationChange$: Observable<SimpleAgreementTemplatesListItemDtoPaginatedList> =
            this.creationChange$.pipe(
                takeUntil(this.unSubscribe$),
                switchMap((val) => {
                    if (val === null) {
                        this.null$.next(null);
                        return EMPTY;
                    }
                    return this._apiServiceProxy.simpleList2(false, val, 1, 100);
                })
            );
        this.masterTemplateOptions$ = merge(
            freeText$,
            routeParams$,
            null$,
            creationChange$
        ).pipe(
            map((response) => {
                return response
                    ? (response.items as SimpleAgreementTemplatesListItemDto[])
                    : null;
            })
        );
    }

    private _prefillForm() {
        this.showMainSpinner();
        this._apiServiceProxy
            .agreementTemplateGET(this.templateId)
            .pipe(
                tap((template) => {
                    if (template.duplicationSourceAgreementTemplateId) {
                        this.masterTemplateOptionsChanged$.next(template.name);
                        return;
                    }
                }),
                finalize(() => this.hideMainSpinner())
            )
            .subscribe((template) => {
                this.currentTemplate = template;
                this.preselectedFiles = template.attachments as FileUpload[];
                this._cdr.detectChanges();
                this.masterTemplateFormGroup.patchValue({
                    agreementType: template.agreementType,
                    recipientTypeId: template.recipientTypeId,
                    duplicationSourceAgreementTemplateId:
                        template.duplicationSourceAgreementTemplateId,
                    name: template.name,
                    agreementNameTemplate: template.agreementNameTemplate,
                    definition: template.definition,
                    legalEntities: template.legalEntityIds,
                    salesTypes: template.salesTypeIds,
                    deliveryTypes: template.deliveryTypeIds,
                    contractTypes: template.contractTypeIds,
                    language: template.language,
                    isSignatureRequired: template.isSignatureRequired,
                    isEnabled: template.isEnabled,
                    selectedInheritedFiles: template.attachments,
                });
            });
    }
}
