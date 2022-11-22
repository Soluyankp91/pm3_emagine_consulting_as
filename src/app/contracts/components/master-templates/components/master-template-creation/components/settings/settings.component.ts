import { map, startWith, switchMap, tap, skip } from 'rxjs/operators';
import {
    BehaviorSubject,
    combineLatest,
    forkJoin,
    Observable,
    Subject,
    of,
} from 'rxjs';
import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    ViewEncapsulation,
} from '@angular/core';
import { ContractsService } from 'src/app/contracts/contracts.service';
import { FormControl, Validators } from '@angular/forms';
import {
    AgreementCreationMode,
    AgreementTemplateAttachmentDto,
    AgreementTemplateServiceProxy,
    ApiServiceProxy,
    EnumEntityTypeDto,
    FileServiceProxy,
    LegalEntityDto,
    SaveAgreementTemplateDto,
    SimpleAgreementTemplatesListItemDto,
} from 'src/shared/service-proxies/service-proxies';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseEnumDto } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { FileUpload } from 'src/app/contracts/shared/components/new-file-uploader/new-file-uploader.interface';
import { MasterTemplateModel } from './entities/master-template.model';
import { REQUIRED_VALIDATION_MESSAGE } from 'src/app/contracts/shared/entities/contracts.constants';
import { ConfirmDialogComponent } from 'src/app/contracts/shared/components/popUps/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { dirtyCheck } from 'src/app/contracts/components/client-specific-templates/components/client-specific/creation/dirtyCheckOperator';
import { DirtyCheckService } from './dirty-check-service.service';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: DirtyCheckService,
        },
    ],
})
export class CreateMasterTemplateComponent implements OnInit {
    preselectedFiles: FileUpload[] = [];

    creationModes = AgreementCreationMode;
    agreementCreationMode = new FormControl(AgreementCreationMode.FromScratch);

    createControl = new FormControl();
    duplicateTemplateControl = new FormControl();

    isDirty: boolean = false;

    attachmentFiles: FileUpload[] = [];

    masterTemplateFormGroup = new MasterTemplateModel();
    isFormValid = false;

    requiredValidationMessage = REQUIRED_VALIDATION_MESSAGE;

    autoNames: string[];

    agreementTypes$ = this.contractsService.getAgreementTypes$();
    recipientTypes$ = this.contractsService.getRecipientTypes$();
    legalEntities$ = this.contractsService.getLegalEntities$();
    salesTypes = this.contractsService.getSalesTypes$();
    deliveryTypes = this.contractsService.getDeliveryTypes$();
    contractTypes = this.contractsService.getEmploymentTypes$();
    languages$ = this.contractsService.getAgreementLanguages$();

    options$ = combineLatest([
        this.agreementTypes$,
        this.recipientTypes$,
        this.legalEntities$,
        this.salesTypes,
        this.deliveryTypes,
        this.contractTypes,
        this.languages$,
    ]).pipe(
        map((combined) => {
            return {
                agreementTypes: combined[0] as unknown as BaseEnumDto[],
                recipientTypes: combined[1] as unknown as EnumEntityTypeDto[],
                legalEntities: combined[2] as unknown as LegalEntityDto[],
                salesTypes: combined[3] as unknown as EnumEntityTypeDto[],
                deliveryTypes: combined[4] as unknown as EnumEntityTypeDto[],
                contractTypes: combined[5] as unknown as EnumEntityTypeDto[],
                languages: combined[6] as unknown as BaseEnumDto[],
            };
        })
    );

    modeControl = new BehaviorSubject(AgreementCreationMode.FromScratch);

    private _subscribeOnCreationModeResolver() {
        this.modeControl
            .pipe(
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
                    this.agreementCreationMode.setValue(mode);
                    this.onCreationModeChange(mode);
                }
            });
    }
    private _subscribeOnDirtyStatus() {
        this.masterTemplateFormGroup.valueChanges
            .pipe(
                map(() => this.masterTemplateFormGroup.getRawValue()),
                dirtyCheck(this.dirtyCheckService.initialFormValue$)
            )
            .subscribe((isDirty) => {
                this.isDirty = isDirty;
            });
    }

    constructor(
        private readonly dialog: MatDialog,
        private readonly dirtyCheckService: DirtyCheckService,
        private readonly contractsService: ContractsService,
        private readonly apiServiceProxy: ApiServiceProxy,
        private readonly agreementServiceProxy: AgreementTemplateServiceProxy,
        private readonly cdr: ChangeDetectorRef,
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) {}
    ngOnInit(): void {
        this.agreementCreationMode.disable();
        this._subscribeOnFormValid();
        this._subscribeOnDuplicateControlChanges();
        this.masterTemplateOptions$ = this._getExistingTemplate$();
        this._subscribeOnDirtyStatus();
        this._subscribeOnCreationModeResolver();
    }
    masterTemplateOptions$: Observable<SimpleAgreementTemplatesListItemDto[]>;
    masterTemplateOptionsChanged$ = new Subject<string>();

    private _getExistingTemplate$() {
        return this.masterTemplateOptionsChanged$.pipe(
            startWith(''),
            switchMap((searchStr) => {
                return this.agreementServiceProxy.simpleList(
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
        this.masterTemplateFormGroup.reset(
            this.dirtyCheckService.initialFormValue$.value
        );
        this.preselectedFiles = [];
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
                    this.masterTemplateFormGroup.attachments?.value.uploadedFiles.map(
                        (attachment: any) => {
                            return new AgreementTemplateAttachmentDto(
                                attachment
                            );
                        }
                    );
                break;
            }
            case AgreementCreationMode.Duplicated: {
                const attachments =
                    this.masterTemplateFormGroup.attachments?.value;
                agreementPostDto.attachments = [
                    ...attachments.uploadedFiles,
                    ...attachments.selectedInheritedFiles,
                ].map((attachment: FileUpload) => {
                    return new AgreementTemplateAttachmentDto(attachment);
                });
                agreementPostDto.duplicationSourceAgreementTemplateId =
                    this.duplicateTemplateControl.value;
                break;
            }
        }
        this.apiServiceProxy
            .agreementTemplatePost(
                new SaveAgreementTemplateDto(
                    new SaveAgreementTemplateDto(agreementPostDto)
                )
            )
            .subscribe((x) => {
                this.navigateOnAction();
            });
    }
    onCancel() {
        this.navigateOnAction();
    }
    private navigateOnAction() {
        this.router.navigate(['../../master-templates'], {
            relativeTo: this.route,
        });
    }
    private _subscribeOnFormValid() {
        this.masterTemplateFormGroup.statusChanges.subscribe((isValid) => {
            this.isFormValid = isValid === 'INVALID' ? false : true;
        });
    }

    private _subscribeOnDuplicateControlChanges() {
        this.duplicateTemplateControl.valueChanges
            .pipe(
                switchMap((templateId) => {
                    return this.apiServiceProxy.agreementTemplateGet(
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
                            Object.assign(
                                {},
                                {
                                    agreementTemplateAttachmentId:
                                        attachment.agreementTemplateAttachmentId,
                                    name: attachment.name,
                                }
                            ) as FileUpload
                    ) as FileUpload[];
                    this.cdr.detectChanges();
                })
            )
            .subscribe();
    }
}
