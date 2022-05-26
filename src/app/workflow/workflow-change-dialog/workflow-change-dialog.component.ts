import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkflowChangeForm } from '../workflow.model';

@Component({
    selector: 'app-workflow-change-dialog',
    templateUrl: './workflow-change-dialog.component.html',
    styleUrls: ['./workflow-change-dialog.component.scss']
})
export class WorkflowChangeDialogComponent implements OnInit {
    @Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRejected: EventEmitter<any> = new EventEmitter<any>();

    workflowChangesForm = new FormControl();
    extensionForm: WorkflowChangeForm;

    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            dialogHeader: string,
            formFieldLabel: string,
            formFieldPlaceholder: string
        },
        private dialogRef: MatDialogRef<WorkflowChangeDialogComponent>
    ) {
        this.extensionForm = new WorkflowChangeForm();
     }

    ngOnInit(): void {
    }

    close(): void {
        this.onRejected.emit();
        this.closeInternal();
    }

    confirm(): void {
        this.onConfirmed.emit();
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
