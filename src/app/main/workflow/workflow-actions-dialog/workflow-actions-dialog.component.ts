import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppComopnentBase } from 'src/shared/app-component-base';
import { WorkflowDiallogAction } from '../workflow.model';

@Component({
  selector: 'app-workflow-actions-dialog',
  templateUrl: './workflow-actions-dialog.component.html',
  styleUrls: ['./workflow-actions-dialog.component.scss']
})
export class WorkflowActionsDialogComponent extends AppComopnentBase implements OnInit {
    @Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
    // Change consultant
    newCutoverDate = new FormControl(null);
    newLegalContractRequired = new FormControl(false);
    // Extend consultant
    workflowChangesForm = new FormControl();
    startDate = new FormControl(null);
    endDate = new FormControl(null);
    noEndDate = new FormControl(false);
    // Terminate consultant
    // TBD

    // Dialog data
    dialogTypes = WorkflowDiallogAction;
    consultant: any;
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
        private dialogRef: MatDialogRef<WorkflowActionsDialogComponent>
        ) {
            super(injector);
            this.consultant = data.consultantData;
        }

    ngOnInit(): void {
    }

    close(): void {
        this.onRejected.emit();
        this.closeInternal();
    }

    confirm(): void {
        let outputData = {};
        switch (this.data.dialogType) {
            case WorkflowDiallogAction.Add:
                outputData = {
                    startDate: this.startDate.value,
                    endDate: this.endDate.value,
                    noEndDate: this.noEndDate.value
                }
                break;
            case WorkflowDiallogAction.Change:
                outputData = {
                    newCutoverDate: this.newCutoverDate.value,
                    newLegalContractRequired: this.newLegalContractRequired.value
                }
                break;
            case WorkflowDiallogAction.Extend:
                outputData = {
                    startDate: this.startDate.value,
                    endDate: this.endDate.value,
                    noEndDate: this.noEndDate.value
                }
                break;
            case WorkflowDiallogAction.Terminate:

                break;
        }
        this.onConfirmed.emit(outputData);
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
