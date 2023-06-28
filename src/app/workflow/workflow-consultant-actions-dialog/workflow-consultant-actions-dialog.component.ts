import { Component, EventEmitter, Inject, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppComponentBase } from 'src/shared/app-component-base';
import { ConsultantDiallogAction } from '../workflow-sales/workflow-sales.model';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-workflow-consultant-actions-dialog',
    templateUrl: './workflow-consultant-actions-dialog.component.html',
    styleUrls: ['./workflow-consultant-actions-dialog.component.scss']
})
export class WorkflowConsultantActionsDialogComponent extends AppComponentBase implements OnInit, OnDestroy {
    @Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
    // Change consultant
    newCutoverDate = new UntypedFormControl(null);
    newLegalContractRequired = new UntypedFormControl(false);
    // Extend consultant
    startDate = new UntypedFormControl(null);
    endDate = new UntypedFormControl(null);
    noEndDate = new UntypedFormControl(false);
    minEndDate: Date;
    dialogTypes = ConsultantDiallogAction;
    consultant: {externalId: string, name: string};
    private _unsubscribe = new Subject();
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
        this?.startDate?.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe((value) => {
            let startDate = value as moment.Moment;
            this.minEndDate = new Date(startDate.toDate().getFullYear(), startDate.toDate().getMonth(), startDate.toDate().getDate() + 1);
        });
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
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
