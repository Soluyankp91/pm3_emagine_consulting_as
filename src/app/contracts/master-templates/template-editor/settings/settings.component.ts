import {
    map,
    startWith,
    switchMap,
    tap,
    skip,
    takeUntil,
} from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ViewEncapsulation,
    OnDestroy,
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
import { FileUpload } from 'src/app/contracts/shared/components/new-file-uploader/new-file-uploader.interface';
import {
    INITIAL_MASTER_TEMPLATE_FORM_VALUE,
    MasterTemplateModel,
} from '../../../shared/models/master-template.model';
import { REQUIRED_VALIDATION_MESSAGE } from 'src/app/contracts/shared/entities/contracts.constants';
import { ConfirmDialogComponent } from 'src/app/contracts/shared/components/popUps/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { dirtyCheck } from 'src/app/contracts/shared/operators/dirtyCheckOperator';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { SettingsOptions } from 'src/app/contracts/shared/models/settings.model';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class CreateMasterTemplateComponent implements OnInit, OnDestroy {
    preselectedFiles: FileUpload[] = [];

    creationModes = AgreementCreationMode;

    agreementCreationMode = new FormControl(AgreementCreationMode.FromScratch);

    createControl = new FormControl();
    duplicateTemplateControl = new FormControl();

    isFormDirty = false;

    attachmentFiles: FileUpload[] = [];

    masterTemplateFormGroup = new MasterTemplateModel();

    requiredValidationMessage = REQUIRED_VALIDATION_MESSAGE;

    autoNames: string[];

    options$: Observable<SettingsOptions> =
        this._contractsService.settingsPageOptions$();

    modeControl$ = new BehaviorSubject(AgreementCreationMode.FromScratch);
    masterTemplateOptions$: Observable<SimpleAgreementTemplatesListItemDto[]>;
    masterTemplateOptionsChanged$ = new Subject<string>();

    private initialFormValue$ = of(INITIAL_MASTER_TEMPLATE_FORM_VALUE);
    private unSubscribe$ = new Subject<void>();

    constructor(
        private readonly _dialog: MatDialog,
        private readonly _contractsService: ContractsService,
        private readonly apiServiceProxy: AgreementTemplateServiceProxy,
        private readonly cdr: ChangeDetectorRef,
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.agreementCreationMode.disable();
        this._subscribeOnDuplicateControlChanges();
        this.masterTemplateOptions$ = this._getExistingTemplate$();
        this._subscribeOnDirtyStatus();
        this._subscribeOnCreationModeResolver();
        this.masterTemplateFormGroup.valueChanges.subscribe((x) =>
            console.log(x)
        );
    }

    ngOnDestroy(): void {
        this.unSubscribe$.next();
        this.unSubscribe$.complete();
    }

    onSave() {
        let creationMode = this.agreementCreationMode.value;
        const agreementPostDto = Object.assign(
            {},
            {
                ...this.masterTemplateFormGroup.value,
                creationMode: creationMode,
            }
        ) as SaveAgreementTemplateDto;
        switch (creationMode) {
            case AgreementCreationMode.FromScratch: {
                agreementPostDto.attachments =
                    this.masterTemplateFormGroup.uploadedFiles?.value.map(
                        (attachment: any) => {
                            return new AgreementTemplateAttachmentDto(
                                attachment
                            );
                        }
                    );
                break;
            }
            case AgreementCreationMode.Duplicated: {
                agreementPostDto.attachments = [
                    ...this.masterTemplateFormGroup.uploadedFiles?.value,
                    ...this.masterTemplateFormGroup.selectedInheritedFiles
                        ?.value,
                ].map((attachment: FileUpload) => {
                    return new AgreementTemplateAttachmentDto(attachment);
                });
                agreementPostDto.sourceAgreementTemplateId =
                    this.duplicateTemplateControl.value;
                break;
            }
        }
        this.apiServiceProxy
            .agreementTemplatePOST(
                new SaveAgreementTemplateDto(
                    new SaveAgreementTemplateDto(agreementPostDto)
                )
            )
            .pipe(takeUntil(this.unSubscribe$))
            .subscribe((x) => {
                this.navigateOnAction();
            });
    }

    onCancel() {
        this.navigateOnAction();
    }

    private _getExistingTemplate$() {
        return this.masterTemplateOptionsChanged$.pipe(
            startWith(''),
            switchMap((searchStr) => {
                return this.apiServiceProxy.simpleList2(
                    false,
                    searchStr,
                    1,
                    20
                );
            }),
            map(
                (response) =>
                    response.items as SimpleAgreementTemplatesListItemDto[]
            )
        );
    }

    private onCreationModeChange(mode: AgreementCreationMode) {
        if (mode === AgreementCreationMode.FromScratch) {
        } else {
        }
        this.masterTemplateFormGroup.reset(INITIAL_MASTER_TEMPLATE_FORM_VALUE);
        this.preselectedFiles = [];
    }

    private navigateOnAction() {
        this.router.navigate(['../../master-templates'], {
            relativeTo: this.route,
        });
    }

    private _subscribeOnDuplicateControlChanges() {
        this.duplicateTemplateControl.valueChanges
            .pipe(
                takeUntil(this.unSubscribe$),
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
}
