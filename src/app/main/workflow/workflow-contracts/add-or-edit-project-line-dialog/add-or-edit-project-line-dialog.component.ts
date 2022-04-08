import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProjectLineDto } from 'src/shared/service-proxies/service-proxies';
import { ProjectLineDiallogMode } from '../../workflow.model';
import { ProjectLineForm } from './add-or-edit-project-line-dialog.model';

@Component({
    selector: 'app-add-or-edit-project-line-dialog',
    templateUrl: './add-or-edit-project-line-dialog.component.html',
    styleUrls: ['./add-or-edit-project-line-dialog.component.scss']
})
export class AddOrEditProjectLineDialogComponent implements OnInit {
    @Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
    dialogType = ProjectLineDiallogMode;
    projectLineForm: ProjectLineForm;
    projectLine: ProjectLineDto;
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            dialogType: number,
            projectLineData: any
        },
        private dialogRef: MatDialogRef<AddOrEditProjectLineDialogComponent>
    ) {
        this.projectLineForm = new ProjectLineForm();
    }

    ngOnInit(): void {
        if (this.data.dialogType === ProjectLineDiallogMode.Edit) {
            this.fillForm(this.data.projectLineData);
        }
    }

    fillForm(data: any) {
        console.log(data);
        this.projectLineForm.id?.setValue(data.id, {emitEvent: false});
        this.projectLineForm.projectName?.setValue(data.projectName, {emitEvent: false});
        this.projectLineForm.assignmentID?.setValue(data.id, {emitEvent: false}); // asignmentID ?
        this.projectLineForm.startDate?.setValue(data.startDate, {emitEvent: false});
        this.projectLineForm.endDate?.setValue(data.endDate, {emitEvent: false});
        this.projectLineForm.invoiceReference?.setValue(data.invoicingReferenceNumber, {emitEvent: false});
        this.projectLineForm.optionalInvoicingInfo?.setValue(data.optionalInvoicingInfo, {emitEvent: false});
        this.projectLineForm.debitorNumber?.setValue(data.debtorNumber, {emitEvent: false});
        this.projectLineForm.diffrentDebitorNumber?.setValue(data.differentDebtorNumber, {emitEvent: false});
        this.projectLineForm.invoiceRecipient?.setValue(data.invoiceRecipientId, {emitEvent: false});
        this.projectLineForm.differentInvoiceRecipient?.setValue(data.differentInvoiceRecipient, {emitEvent: false});
    }

    close(): void {
        this.onRejected.emit();
        this.closeInternal();
    }

    confirm(): void {
        this.onConfirmed.emit(this.projectLineForm.value);
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
