import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppComponentBase } from 'src/shared/app-component-base';
import { AvailableConsultantDto, ChangeClientPeriodDto, ConsultantPeriodAddDto, ExtendClientPeriodDto, NewContractRequiredConsultantPeriodDto } from 'src/shared/service-proxies/service-proxies';
import { WorkflowDiallogAction } from '../workflow.model';
import { ChangeWorkflowForm, ExtendWorkflowForm } from './workflow-actions-dialog.model';

@Component({
  selector: 'app-workflow-actions-dialog',
  templateUrl: './workflow-actions-dialog.component.html',
  styleUrls: ['./workflow-actions-dialog.component.scss']
})
export class WorkflowActionsDialogComponent extends AppComponentBase implements OnInit {
    @Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
    // Change workflow
    newCutoverDate = new FormControl(null);
    newLegalContractRequired = new FormControl(false);
    // Extend workflow
    workflowChangesForm = new FormControl();
    startDate = new FormControl(null);
    endDate = new FormControl(null);
    noEndDate = new FormControl(false);
    // Terminate workflow
    // TBD
    changeWorkflowForm: ChangeWorkflowForm;
    extendWorkflowForm: ExtendWorkflowForm;
    // Dialog data
    dialogTypes = WorkflowDiallogAction;
    consultants: AvailableConsultantDto[];
    constructor(
        injector: Injector,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            dialogType: number,
            consultantData: any,
            dialogTitle: string,
            rejectButtonText: string,
            confirmButtonText: string,
            isNegative: boolean
        },
        private dialogRef: MatDialogRef<WorkflowActionsDialogComponent>,
        private _fb: FormBuilder
        ) {
            super(injector);
            this.changeWorkflowForm = new ChangeWorkflowForm();
            this.extendWorkflowForm = new ExtendWorkflowForm();
            this.consultants = data.consultantData;
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
    }

    addConsutlantToChangeForm(consultant: AvailableConsultantDto) {
        const form = this._fb.group({
            consulantName: new FormControl(consultant.consultantName),
            consutlantId: new FormControl(consultant.consultantId),
            externalId: new FormControl(consultant.externalId),
            newLegalContractRequired: new FormControl(false)
        });
        this.changeWorkflowForm.consultants.push(form);
    }

    addConsutlantToExtendForm(consultant: AvailableConsultantDto) {
        const form = this._fb.group({
            consulantName: new FormControl(consultant.consultantName),
            consutlantId: new FormControl(consultant.consultantId),
            externalId: new FormControl(consultant.externalId),
            extendConsutlant: new FormControl(false)
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
                const consutlants = this.changeWorkflowForm.value.consultants;
                let changeWorkflowOutput = new ChangeClientPeriodDto();
                changeWorkflowOutput.clientNewLegalContractRequired = this.changeWorkflowForm.newLegalContractRequired?.value;
                changeWorkflowOutput.cutoverDate = this.changeWorkflowForm.cutoverDate?.value;
                changeWorkflowOutput.consultantPeriods = new Array<NewContractRequiredConsultantPeriodDto>();
                consutlants.forEach((consultant: any) => {
                    let consultantInput = new NewContractRequiredConsultantPeriodDto();
                    consultantInput.consultantNewLegalContractRequired = consultant.newLegalContractRequired,
                    consultantInput.consultantId = consultant.consultantId;
                    changeWorkflowOutput.consultantPeriods?.push(consultantInput);
                });
                this.onConfirmed.emit(changeWorkflowOutput);
                break;
            case WorkflowDiallogAction.Extend:
                const consutlantsToExtend = this.extendWorkflowForm.value.consultants;
                let extendWorkflowOutput = new ExtendClientPeriodDto();
                extendWorkflowOutput.startDate = this.extendWorkflowForm.startDate?.value,
                extendWorkflowOutput.endDate = this.extendWorkflowForm.endDate?.value,
                extendWorkflowOutput.noEndDate = this.extendWorkflowForm.noEndDate?.value ?? false,
                extendWorkflowOutput.extendConsultantIds = consutlantsToExtend.filter((x: any) => x.extendConsutlant).map((y: any) => y.consutlantId);
                console.log(extendWorkflowOutput.extendConsultantIds);
                this.onConfirmed.emit(extendWorkflowOutput);
                break;
            case WorkflowDiallogAction.Terminate:

                break;
        }
        // this.onConfirmed.emit(outputData);
        this.closeInternal();
    }

    reject(): void {
        this.onRejected.emit();
        this.closeInternal();
    }

    private closeInternal(): void {
        this.dialogRef.close();
    }

}
