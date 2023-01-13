import { Component, EventEmitter, Inject, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { AreaRoleNodeDto, AvailableConsultantDto, BranchRoleNodeDto, ChangeClientPeriodDto, ConsultantPeriodAddDto, EnumEntityTypeDto, ExtendClientPeriodDto, LookupServiceProxy, NewContractRequiredConsultantPeriodDto, RoleNodeDto } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDiallogAction } from '../workflow.model';
import { ChangeWorkflowForm, ExtendWorkflowForm, ProjectCategoryForm } from './workflow-actions-dialog.model';

@Component({
  selector: 'app-workflow-actions-dialog',
  templateUrl: './workflow-actions-dialog.component.html',
  styleUrls: ['./workflow-actions-dialog.component.scss']
})
export class WorkflowActionsDialogComponent extends AppComponentBase implements OnInit, OnDestroy {
    @Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
    // Change workflow
    newCutoverDate = new UntypedFormControl(null);
    newLegalContractRequired = new UntypedFormControl(false);
    // Extend workflow
    workflowChangesForm = new UntypedFormControl();
    startDate = new UntypedFormControl(null);
    endDate = new UntypedFormControl(null);
    noEndDate = new UntypedFormControl(false);
    minEndDate: Date;

    projectCategoryForm: ProjectCategoryForm;
    changeWorkflowForm: ChangeWorkflowForm;
    extendWorkflowForm: ExtendWorkflowForm;
    // Dialog data
    dialogTypes = WorkflowDiallogAction;
    consultants: AvailableConsultantDto[];

    projectCategory: EnumEntityTypeDto | undefined;
    primaryCategoryAreas: BranchRoleNodeDto[] = [];
    primaryCategoryTypes: AreaRoleNodeDto[] = [];
    primaryCategoryRoles: RoleNodeDto[] = [];

    validationTriggered = false
    changeConsultantsValid = true;
    extendConsultantsValid = true;

    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            dialogType: number,
            consultantData: any,
            dialogTitle: string,
            rejectButtonText: string,
            confirmButtonText: string,
            isNegative: boolean,
            isMigrationNeeded: boolean,
            projectCategory: EnumEntityTypeDto | undefined
        },
        private dialogRef: MatDialogRef<WorkflowActionsDialogComponent>,
        private _fb: UntypedFormBuilder,
        private _lookupService: LookupServiceProxy
        ) {
            super(injector);
            this.changeWorkflowForm = new ChangeWorkflowForm();
            this.extendWorkflowForm = new ExtendWorkflowForm();
            this.projectCategoryForm = new ProjectCategoryForm();
            this.consultants = data.consultantData;
            this.extendWorkflowForm?.startDate?.valueChanges.pipe(
                takeUntil(this._unsubscribe),
                debounceTime(500)
            ).subscribe(() => {
                let startDate = this.extendWorkflowForm?.startDate?.value as moment.Moment;
                this.minEndDate = new Date(startDate.toDate().getFullYear(), startDate.toDate().getMonth(), startDate.toDate().getDate() + 1);
            });
            if (this.data.isMigrationNeeded) {
                this.projectCategoryForm?.primaryCategoryArea?.valueChanges
                    .pipe(
                        takeUntil(this._unsubscribe),
                        map(
                            (value) =>
                                this.primaryCategoryAreas?.find((x) => x.id === value?.id)
                                    ?.areas
                        )
                    )
                    .subscribe((list) => {
                        this.primaryCategoryTypes = list!;
                        this.projectCategoryForm?.primaryCategoryType?.setValue(
                            null
                        );
                        this.projectCategoryForm?.primaryCategoryRole?.setValue(
                            null
                        );
                    });

                this.projectCategoryForm?.primaryCategoryType?.valueChanges
                    .pipe(
                        takeUntil(this._unsubscribe),
                        map(
                            (value) =>
                                this.primaryCategoryTypes?.find((x) => x.id === value?.id)
                                    ?.roles
                        )
                    )
                    .subscribe((list) => {
                        this.primaryCategoryRoles = list!;
                        this.projectCategoryForm?.primaryCategoryRole?.setValue(
                            null
                        );
                    });
            }
        }

    ngOnInit(): void {
        switch (this.data.dialogType) {
            case WorkflowDiallogAction.AddConsultant:
                break;
            case WorkflowDiallogAction.Change:
                this.consultants.forEach((consultant: AvailableConsultantDto) => {
                    this.addConsutlantToChangeForm(consultant);
                });
                break;
            case WorkflowDiallogAction.Extend:
                this.consultants.forEach((consultant: AvailableConsultantDto) => {
                    this.addConsutlantToExtendForm(consultant);
                });
                break;
        }
        if (this.data.isMigrationNeeded) {
            this.getPrimaryCategoryTree();
            this.projectCategory = this.data.projectCategory;
        }
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    getPrimaryCategoryTree(): void {
        this._lookupService
            .tree()
            .subscribe((result) => {
                this.primaryCategoryAreas = result.branches!;
                this.setPrimaryCategoryTypeAndRole();
            });
    }

    setPrimaryCategoryTypeAndRole(): void {
        if (this.projectCategoryForm?.primaryCategoryArea?.value?.id) {
            this.primaryCategoryTypes = this.primaryCategoryAreas?.find(
                (x) =>
                    x.id ===
                    this.projectCategoryForm?.primaryCategoryArea?.value?.id
            )?.areas!;
        }
        if (this.projectCategoryForm?.primaryCategoryType?.value?.id) {
            this.primaryCategoryRoles = this.primaryCategoryTypes?.find(
                (x) =>
                    x.id ===
                    this.projectCategoryForm?.primaryCategoryType?.value.id
            )?.roles!;
        }
    }

    addConsutlantToChangeForm(consultant: AvailableConsultantDto) {
        const form = this._fb.group({
            consulantName: new UntypedFormControl(consultant.consultantName),
            consultantId: new UntypedFormControl(consultant.consultantId),
            externalId: new UntypedFormControl(consultant.externalId),
            newLegalContractRequired: new UntypedFormControl(false),
            changeConsultant: new UntypedFormControl(false)
        });
        this.changeWorkflowForm.consultants.push(form);
    }

    addConsutlantToExtendForm(consultant: AvailableConsultantDto) {
        const form = this._fb.group({
            consulantName: new UntypedFormControl(consultant.consultantName),
            consultantId: new UntypedFormControl(consultant.consultantId),
            externalId: new UntypedFormControl(consultant.externalId),
            extendConsultant: new UntypedFormControl(false)
        });
        this.extendWorkflowForm.consultants.push(form);
    }

    close(): void {
        this.onRejected.emit();
        this.closeInternal();
    }

    confirm(): void {
        switch (this.data.dialogType) {
            case WorkflowDiallogAction.AddConsultant:
                let addConsultantOutput = new ConsultantPeriodAddDto();
                addConsultantOutput.startDate = this.startDate.value;
                addConsultantOutput.noEndDate = this.noEndDate.value ?? false;
                addConsultantOutput.endDate = this.endDate.value;
                this.onConfirmed.emit(addConsultantOutput);
                break;
            case WorkflowDiallogAction.Change:
                if (!this.validateChangeForm()) {
                    return;
                }
                const consultants = this.changeWorkflowForm.value.consultants;
                let changeWorkflowOutput = new ChangeClientPeriodDto();
                changeWorkflowOutput.clientNewLegalContractRequired = this.changeWorkflowForm.newLegalContractRequired?.value;
                changeWorkflowOutput.cutoverDate = this.changeWorkflowForm.cutoverDate?.value;
                changeWorkflowOutput.consultantPeriods = new Array<NewContractRequiredConsultantPeriodDto>();
                consultants.forEach((consultant: any) => {
                    if (consultant.changeConsultant) {
                        let consultantInput = new NewContractRequiredConsultantPeriodDto();
                        consultantInput.consultantNewLegalContractRequired = consultant.newLegalContractRequired,
                        consultantInput.consultantId = consultant.consultantId;
                        changeWorkflowOutput.consultantPeriods?.push(consultantInput);
                    }
                });
                changeWorkflowOutput.primaryCategoryArea = this.projectCategoryForm.primaryCategoryArea?.value;
                changeWorkflowOutput.primaryCategoryType = this.projectCategoryForm.primaryCategoryType?.value;
                changeWorkflowOutput.primaryCategoryRole = this.projectCategoryForm.primaryCategoryRole?.value;
                this.onConfirmed.emit(changeWorkflowOutput);
                break;
            case WorkflowDiallogAction.Extend:
                if (!this.validateExtendForm()) {
                    return;
                }
                const consultantsToExtend = this.extendWorkflowForm.value.consultants;
                let extendWorkflowOutput = new ExtendClientPeriodDto();
                extendWorkflowOutput.startDate = this.extendWorkflowForm.startDate?.value,
                extendWorkflowOutput.endDate = this.extendWorkflowForm.endDate?.value,
                extendWorkflowOutput.noEndDate = this.extendWorkflowForm.noEndDate?.value ?? false,
                extendWorkflowOutput.extendConsultantIds = consultantsToExtend.filter((x: any) => x.extendConsultant).map((y: any) => y.consultantId);
                extendWorkflowOutput.primaryCategoryArea = this.projectCategoryForm.primaryCategoryArea?.value;
                extendWorkflowOutput.primaryCategoryType = this.projectCategoryForm.primaryCategoryType?.value;
                extendWorkflowOutput.primaryCategoryRole = this.projectCategoryForm.primaryCategoryRole?.value;
                this.onConfirmed.emit(extendWorkflowOutput);
                break;
            case WorkflowDiallogAction.Terminate:

                break;
        }
        this.closeInternal();
    }

    validateChangeForm() {
        this.validationTriggered = true;
        this.changeWorkflowForm.markAllAsTouched();
        this.projectCategoryForm.markAllAsTouched();
        this.changeConsultantsValid = this.changeWorkflowForm.consultants.value.some((item: any) => item.changeConsultant);
        return this.changeWorkflowForm.valid && this.projectCategoryForm.valid && this.changeConsultantsValid;
    }

    validateExtendForm() {
        this.validationTriggered = true;
        this.extendWorkflowForm.markAllAsTouched();
        this.projectCategoryForm.markAllAsTouched();
        this.extendConsultantsValid = this.extendWorkflowForm.consultants.value.some((item: any) => item.extendConsultant);
        return this.extendWorkflowForm.valid && this.projectCategoryForm.valid && this.extendConsultantsValid;
    }


    reject(): void {
        this.onRejected.emit();
        this.closeInternal();
    }

    private closeInternal(): void {
        this.validationTriggered = false;
        this.changeConsultantsValid = true;
        this.extendConsultantsValid = true;
        this.dialogRef.close();
    }

}
