import { Component, EventEmitter, Injector, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AppComopnentBase } from 'src/shared/app-component-base';

@Component({
    selector: 'app-create-workflow-dialog',
    templateUrl: './create-workflow-dialog.component.html',
    styleUrls: ['./create-workflow-dialog.component.scss']
})
export class CreateWorkflowDialogComponent extends AppComopnentBase implements OnInit {
    @Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRejected: EventEmitter<any> = new EventEmitter<any>();

    startDate = new FormControl();
    endDate = new FormControl();
    noEndDate = new FormControl(false);
    constructor(
        injector: Injector,
        private dialogRef: MatDialogRef<CreateWorkflowDialogComponent>
    ) {
        super(injector);
    }

    ngOnInit(): void {
    }

    reject() {
        this.onRejected.emit();
        this.closeInternal();
    }

    confirm() {
        let outputData = {
            startDate: this.startDate.value,
            endDate: this.endDate.value
        }
        this.onConfirmed.emit(outputData);
        this.closeInternal();
    }

    private closeInternal(): void {
        this.dialogRef.close();
    }

}
