import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-workflow-change-dialog',
    templateUrl: './workflow-change-dialog.component.html',
    styleUrls: ['./workflow-change-dialog.component.scss']
})
export class WorkflowChangeDialogComponent implements OnInit {
    @Output() onConfimrmed: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRejected: EventEmitter<any> = new EventEmitter<any>();

    workflowChangesForm = new FormControl();
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            dialogHeader: string,
            formFieldLabel: string,
            formFieldPlaceholder: string
        },
        private dialogRef: MatDialogRef<WorkflowChangeDialogComponent>
    ) { }

    ngOnInit(): void {
    }

    close(): void {
        this.onRejected.emit();
        this.closeInternal();
    }

    confirm(): void {
        this.onConfimrmed.emit();
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
