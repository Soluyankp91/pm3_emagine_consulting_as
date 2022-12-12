import {
    map,
    startWith,
    switchMap,
    tap,
    skip,
    takeUntil,
    filter,
    finalize,
} from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject, of, forkJoin } from 'rxjs';
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
    AgreementTemplateServiceProxy,
    SaveAgreementTemplateDto,
    SimpleAgreementTemplatesListItemDto,
} from 'src/shared/service-proxies/service-proxies';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterTemplateModel } from '../../../shared/models/master-template.model';
import { ConfirmDialogComponent } from 'src/app/contracts/shared/components/popUps/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { dirtyCheck } from 'src/app/contracts/shared/operators/dirtyCheckOperator';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { SettingsOptions } from 'src/app/contracts/shared/models/settings.model';
import { FileUpload } from 'src/app/contracts/shared/components/file-uploader/files';
import { AppComponentBase } from 'src/shared/app-component-base';

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
    isDuplicated = false;

    preselectedFiles: FileUpload[] = [];

    creationModes = AgreementCreationMode;
    agreementCreationMode = new FormControl(AgreementCreationMode.FromScratch);

    createControl = new FormControl();
    duplicateTemplateControl = new FormControl(null);

    isFormDirty = false;

    attachmentFiles: FileUpload[] = [];

    masterTemplateFormGroup = new MasterTemplateModel();

    autoNames: string[];

    options$: Observable<SettingsOptions> =
        this._contractsService.settingsPageOptions$();

    modeControl$ = new BehaviorSubject(AgreementCreationMode.FromScratch);
    masterTemplateOptions$: Observable<SimpleAgreementTemplatesListItemDto[]>;
    masterTemplateOptionsChanged$ = new Subject<string>();

    private initialFormValue$ = this.masterTemplateFormGroup.initial$;
    private unSubscribe$ = new Subject<void>();

    constructor(
        private readonly _dialog: MatDialog,
        private readonly _contractsService: ContractsService,
        private readonly apiServiceProxy: AgreementTemplateServiceProxy,
        private readonly cdr: ChangeDetectorRef,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private injector: Injector
    ) {
        super(injector);
    }

    ngOnInit(): void {
        if (this.route.snapshot.params.id) {
            this.editMode = true;
            this.templateId = this.route.snapshot.params.id;
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
        this.masterTemplateOptions$ = this._getExistingTemplate$();
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
        const agreementPostDto = new SaveAgreementTemplateDto({
            creationMode: this.editMode
                ? this.currentTemplate.creationMode
                : this.agreementCreationMode.value,
            attachments: this._agreementTemplateAttachmentDto(),
            ...this.masterTemplateFormGroup.getRawValue(),
        });

        if (this.editMode) {
            agreementPostDto.duplicationSourceAgreementTemplateId =
                this.currentTemplate.duplicationSourceAgreementTemplateId.agreementTemplateId;
            this.apiServiceProxy
                .agreementTemplatePATCH(this.templateId, agreementPostDto)
                .subscribe(() => {
                    this.navigateOnAction();
                });
            return;
        }
        this.showMainSpinner();
        this.apiServiceProxy
            .agreementTemplatePOST(
                new SaveAgreementTemplateDto(
                    new SaveAgreementTemplateDto(agreementPostDto)
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

    private _getExistingTemplate$() {
        return this.masterTemplateOptionsChanged$.pipe(
            startWith(''),
            switchMap((searchStr) => {
                if (this.editMode) {
                    return of([]);
                }
                return this.apiServiceProxy
                    .simpleList2(false, searchStr, 1, 20)
                    .pipe(
                        map(
                            (response) =>
                                response.items as SimpleAgreementTemplatesListItemDto[]
                        )
                    );
            })
        );
    }

    private onCreationModeChange(mode: AgreementCreationMode) {
        if (mode === AgreementCreationMode.FromScratch) {
            this.masterTemplateFormGroup.removeControl(
                'duplicationSourceAgreementTemplateId'
            );
        } else {
            this.masterTemplateFormGroup.addControl(
                'duplicationSourceAgreementTemplateId',
                this.duplicateTemplateControl
            );
            this.masterTemplateOptionsChanged$.next('');
        }
        this.masterTemplateFormGroup.reset();
        this.preselectedFiles = [];
    }

    private navigateOnAction(templateId?: number) {
        if (!this.editMode) {
            this.router.navigate([`../${templateId}/settings`], {
                relativeTo: this.route,
            });
            return;
        }
        this.router.navigate(['../../'], {
            relativeTo: this.route,
        });
    }

    private _subscribeOnDuplicateControlChanges() {
        this.duplicateTemplateControl.valueChanges
            .pipe(
                takeUntil(this.unSubscribe$),
                filter((val) => !!val),
                switchMap((templateId) => {
                    return this.apiServiceProxy.agreementTemplateGET(
                        templateId
                    );
                }),
                tap((template) => {
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
                    });
                    this.preselectedFiles = template.attachments?.map(
                        (attachment) =>
                            ({
                                agreementTemplateAttachmentId:
                                    attachment.agreementTemplateAttachmentId,
                                name: attachment.name,
                            } as FileUpload)
                    ) as FileUpload[];
                    this.cdr.detectChanges();
                })
            )
            .subscribe();
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
                    this.onCreationModeChange(this.modeControl$.value);
                }
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

    private _prefillForm() {
        this.showMainSpinner();
        this.apiServiceProxy
            .agreementTemplateGET(this.templateId)
            .pipe(
                tap((template) => {
                    if (template.duplicationSourceAgreementTemplateId) {
                        this.isDuplicated = true;
                        return;
                    }
                }),
                finalize(() => this.hideMainSpinner())
            )
            .subscribe((template) => {
                this.currentTemplate = template;
                this.preselectedFiles = template.attachments as FileUpload[];
                this.cdr.detectChanges();
                this.masterTemplateFormGroup.patchValue({
                    agreementType: template.agreementType,
                    recipientTypeId: template.recipientTypeId,
                    duplicationSourceAgreementTemplateId:
                        template.duplicationSourceAgreementTemplateName,
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
