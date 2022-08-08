import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppComponentBase } from 'src/shared/app-component-base';
import { ConsultantDiallogAction } from '../workflow-sales/workflow-sales.model';

@Component({
    selector: 'app-workflow-consultant-actions-dialog',
    templateUrl: './workflow-consultant-actions-dialog.component.html',
    styleUrls: ['./workflow-consultant-actions-dialog.component.scss']
})
export class WorkflowConsultantActionsDialogComponent extends AppComponentBase implements OnInit {
    @Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
    // Change consultant
    newCutoverDate = new FormControl(null);
    newLegalContractRequired = new FormControl(false);
    // Extend consultant
    startDate = new FormControl(null);
    endDate = new FormControl(null);
    noEndDate = new FormControl(false);
    // Terminate consultant
    // TBD

    // Dialog data
    dialogTypes = ConsultantDiallogAction;
    consultant: {externalId: string, name: string};
    constructor(
        injector: Injector,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            dialogType: number,
            consultantData: {externalId: string, name: string},
            dialogTitle: string,
            rejectButtonText: string,
            confirmButtonText: string,
            isNegative: boolean
        },
        private dialogRef: MatDialogRef<WorkflowConsultantActionsDialogComponent>
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
            case ConsultantDiallogAction.Change:
                outputData = {
                    newCutoverDate: this.newCutoverDate.value,
                    newLegalContractRequired: this.newLegalContractRequired.value
                }
                break;
            case ConsultantDiallogAction.Extend:
                outputData = {
                    startDate: this.startDate.value,
                    endDate: this.endDate.value,
                    noEndDate: this.noEndDate.value
                }
                break;
            case ConsultantDiallogAction.Terminate:

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
