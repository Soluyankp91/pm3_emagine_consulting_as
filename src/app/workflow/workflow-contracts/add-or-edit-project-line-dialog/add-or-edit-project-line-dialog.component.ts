import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppComopnentBase } from 'src/shared/app-component-base';
import { ProjectLineDto } from 'src/shared/service-proxies/service-proxies';
import { ProjectLineDiallogMode } from '../../workflow.model';
import { ProjectLineForm } from './add-or-edit-project-line-dialog.model';

@Component({
    selector: 'app-add-or-edit-project-line-dialog',
    templateUrl: './add-or-edit-project-line-dialog.component.html',
    styleUrls: ['./add-or-edit-project-line-dialog.component.scss']
})

export class AddOrEditProjectLineDialogComponent extends AppComopnentBase implements OnInit {
    @Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
    dialogType = ProjectLineDiallogMode;
    projectLineForm: ProjectLineForm;
    projectLine: ProjectLineDto;
    constructor(
        injector: Injector,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            dialogType: number,
            projectLineData: any
        },
        private dialogRef: MatDialogRef<AddOrEditProjectLineDialogComponent>
    ) {
        super(injector);
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
        this.projectLineForm.invoicingReferenceNumber?.setValue(data.invoicingReferenceNumber, {emitEvent: false});
        this.projectLineForm.optionalInvoicingInfo?.setValue(data.optionalInvoicingInfo, {emitEvent: false});
        this.projectLineForm.debtorNumber?.setValue(data.debtorNumber, {emitEvent: false});
        this.projectLineForm.differentDebtorNumber?.setValue(data.differentDebtorNumber, {emitEvent: false});
        this.projectLineForm.invoiceRecipientId?.setValue(data.invoiceRecipientId, {emitEvent: false});
        this.projectLineForm.differentInvoiceRecipient?.setValue(data.differentInvoiceRecipient, {emitEvent: false});
    }

    close(): void {
        this.onRejected.emit();
        this.closeInternal();
    }

    confirm(): void {
        let result = new ProjectLineDto(this.projectLineForm.value);
        this.onConfirmed.emit(result);
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
