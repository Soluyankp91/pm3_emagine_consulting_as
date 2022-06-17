import { Component, EventEmitter, Inject, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import { ContactResultDto, EnumEntityTypeDto, LookupServiceProxy, ProjectLineDto } from 'src/shared/service-proxies/service-proxies';
import { ProjectLineDiallogMode } from '../../workflow.model';
import { ProjectLineForm } from './add-or-edit-project-line-dialog.model';

@Component({
    selector: 'app-add-or-edit-project-line-dialog',
    templateUrl: './add-or-edit-project-line-dialog.component.html',
    styleUrls: ['./add-or-edit-project-line-dialog.component.scss']
})

export class AddOrEditProjectLineDialogComponent extends AppComponentBase implements OnInit, OnDestroy {
    @Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
    dialogType = ProjectLineDiallogMode;
    projectLineForm: ProjectLineForm;
    projectLine: ProjectLineDto;
    filteredReferencePersons: any[] = [];
    consultantInsuranceOptions: { [key: string]: string; };
    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            dialogType: number,
            projectLineData: any,
            clientId: number
        },
        private dialogRef: MatDialogRef<AddOrEditProjectLineDialogComponent>,
        private _lookupService: LookupServiceProxy,
        private _internalLookupService: InternalLookupService
    ) {
        super(injector);
        this.projectLineForm = new ProjectLineForm();
        this.projectLineForm.invoicingReferencePersonId?.valueChanges
            .pipe(
                takeUntil(this._unsubscribe),
                debounceTime(300),
                switchMap((value: any) => {
                    let toSend = {
                        clientId: this.data?.clientId,
                        name: value,
                        maxRecordsCount: 1000,
                    };
                    if (value?.id) {
                        toSend.name = value.id
                            ? value.firstName
                            : value;
                    }
                    return this._lookupService.contacts(toSend.clientId, toSend.name, toSend.maxRecordsCount);
                }),
            ).subscribe((list: ContactResultDto[]) => {
                if (list.length) {
                    this.filteredReferencePersons = list;
                } else {
                    this.filteredReferencePersons = [{ firstName: 'No records found', lastName: '', id: 'no-data' }];
                }
            });
    }

    ngOnInit(): void {
        this.getConsultantInsuranceOptions();
        this.fillForm(this.data.projectLineData);
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    getConsultantInsuranceOptions() {
        this._internalLookupService.getConsultantInsuranceOptions()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.consultantInsuranceOptions = result;
            });
    }

    fillForm(data: any) {
        console.log(data);
        this.projectLineForm.id?.setValue(data.id, {emitEvent: false});
        this.projectLineForm.projectName?.setValue(data.projectName, {emitEvent: false});
        this.projectLineForm.startDate?.setValue(data.startDate, {emitEvent: false});
        this.projectLineForm.endDate?.setValue(data.endDate, {emitEvent: false, disabled: !data.noEndDate});
        this.projectLineForm.noEndDate?.setValue(data.noEndDate ?? false, {emitEvent: false});
        if (data.noEndDate) {
            this.projectLineForm.endDate?.disable();
        }
        this.projectLineForm.invoicingReferenceNumber?.setValue(data.invoicingReferenceNumber, {emitEvent: false});
        this.projectLineForm.differentInvoicingReferenceNumber?.setValue(data.differentInvoicingReferenceNumber ?? false, {emitEvent: false});
        if (!data.differentInvoicingReferenceNumber) {
            this.projectLineForm.invoicingReferenceNumber?.disable();
        }

        this.projectLineForm.invoicingReferencePersonId?.setValue(data.invoicingReferencePersonId ?? '', {emitEvent: false});
        this.projectLineForm.differentInvoicingReferencePerson?.setValue(data.differentInvoicingReferencePerson ?? false, {emitEvent: false});
        if (!data.differentInvoicingReferencePerson) {
            this.projectLineForm.invoicingReferencePersonId?.disable();
        }

        this.projectLineForm.optionalInvoicingInfo?.setValue(data.optionalInvoicingInfo, {emitEvent: false});
        this.projectLineForm.debtorNumber?.setValue(data.debtorNumber, {emitEvent: false});
        this.projectLineForm.differentDebtorNumber?.setValue(data.differentDebtorNumber ?? false, {emitEvent: false});
        if (!data.differentDebtorNumber) {
            this.projectLineForm.debtorNumber?.disable();
        }

        this.projectLineForm.invoiceRecipientId?.setValue(data.invoiceRecipientId, {emitEvent: false});
        this.projectLineForm.differentInvoiceRecipient?.setValue(data.differentInvoiceRecipient ?? false, {emitEvent: false});
        if (!data.differentInvoiceRecipient) {
            this.projectLineForm.invoiceRecipientId?.disable();
        }
        this.projectLineForm.consultantInsuranceOptionId?.setValue(data.consultantInsuranceOptionId ?? 0, {emitEvent: false});

        this.projectLineForm.markAsDirty();
        this.projectLineForm.markAllAsTouched();
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

    displayFullNameFn(option: any) {
        return option ? option?.firstName + ' ' + option?.lastName : '';
    }

    private closeInternal(): void {
        this.dialogRef.close();
    }

}
