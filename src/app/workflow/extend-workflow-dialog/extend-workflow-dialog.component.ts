import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkflowExtensionForm } from '../workflow.model';

@Component({
  selector: 'app-extend-workflow-dialog',
  templateUrl: './extend-workflow-dialog.component.html',
  styleUrls: ['./extend-workflow-dialog.component.scss']
})
export class ExtendWorkflowDialogComponent implements OnInit {

    @Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRejected: EventEmitter<any> = new EventEmitter<any>();

    workflowChangesForm = new FormControl();
    extensionForm: WorkflowExtensionForm;
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            dialogHeader: string,
            formFieldLabel: string,
            formFieldPlaceholder: string
        },
        private dialogRef: MatDialogRef<ExtendWorkflowDialogComponent>
    ) {
        this.extensionForm = new WorkflowExtensionForm();
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
