import { Component, EventEmitter, Inject, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import { ClientResultDto, ContactResultDto, LookupServiceProxy, ProjectLineDto } from 'src/shared/service-proxies/service-proxies';
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
    filteredClientInvoicingRecipients: any[] = [];
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
        private _internalLookupService: InternalLookupService,
        private router: Router
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
                    return this._lookupService.contacts(toSend.clientId, toSend.name, undefined, toSend.maxRecordsCount);
                }),
            ).subscribe((list: ContactResultDto[]) => {
                if (list.length) {
                    this.filteredReferencePersons = list;
                } else {
                    this.filteredReferencePersons = [{ firstName: 'No records found', lastName: '', id: 'no-data' }];
                }
            });

        this.projectLineForm.invoiceRecipientId?.valueChanges
            .pipe(
                takeUntil(this._unsubscribe),
                debounceTime(300),
                switchMap((value: any) => {
                    if (value) {
                        let toSend = {
                            name: value ?? '',
                            maxRecordsCount: 1000,
                        };
                        if (value?.id) {
                            toSend.name = value.id
                                ? value.clientName
                                : value;
                        }
                        return this._lookupService.clients(toSend.name, toSend.maxRecordsCount);
                    } else {
                        return of([]);
                    }
                }),
            ).subscribe((list: ClientResultDto[]) => {
                if (list.length) {
                    this.filteredClientInvoicingRecipients = list;
                } else {
                    this.filteredClientInvoicingRecipients = [{ clientName: 'No records found', id: 'no-data' }];
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

        this.projectLineForm.invoicingReferencePersonId?.setValue(data.invoicingReferencePerson ?? '', {emitEvent: false});
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

        this.projectLineForm.invoiceRecipientId?.setValue(data.invoiceRecipient, {emitEvent: false});
        this.projectLineForm.differentInvoiceRecipient?.setValue(data.differentInvoiceRecipient ?? false, {emitEvent: false});
        if (!data.differentInvoiceRecipient) {
            this.projectLineForm.invoiceRecipientId?.disable();
        }
        this.projectLineForm.consultantInsuranceOptionId?.setValue(data.consultantInsuranceOptionId ?? 0, {emitEvent: false});
        this.projectLineForm.modificationDate?.setValue(data.modificationDate, {emitEvent: false});
        this.projectLineForm.modifiedById?.setValue(data.modifiedBy, {emitEvent: false});
        this.projectLineForm.wasSynced?.setValue(data.wasSynced, {emitEvent: false});
        this.projectLineForm.isLineForFees?.setValue(data.isLineForFees, {emitEvent: false});

        this.projectLineForm.markAsDirty();
        this.projectLineForm.markAllAsTouched();
    }

    close(): void {
        this.onRejected.emit();
        this.closeInternal();
    }

    confirm(): void {
        let result = new ProjectLineDto();
        result.id = this.projectLineForm.id?.value;
        result.projectName = this.projectLineForm.projectName?.value;
        result.startDate = this.projectLineForm.startDate?.value;
        result.endDate = this.projectLineForm.endDate?.value;
        result.noEndDate = this.projectLineForm.noEndDate?.value;
        result.differentInvoicingReferenceNumber = this.projectLineForm.differentInvoicingReferenceNumber?.value;
        result.invoicingReferenceNumber = this.projectLineForm.invoicingReferenceNumber?.value;
        result.differentInvoicingReferencePerson = this.projectLineForm.differentInvoicingReferencePerson?.value;
        if (this.projectLineForm.invoicingReferencePersonId?.value?.id) {
            result.invoicingReferencePersonId = this.projectLineForm.invoicingReferencePersonId?.value?.id;
            result.invoicingReferencePerson = this.projectLineForm.invoicingReferencePersonId?.value;
        } else {
            result.invoicingReferenceString = this.projectLineForm.invoicingReferencePersonId?.value;
        }
        result.optionalInvoicingInfo = this.projectLineForm.optionalInvoicingInfo?.value;
        result.differentDebtorNumber = this.projectLineForm.differentDebtorNumber?.value;
        result.debtorNumber = this.projectLineForm.debtorNumber?.value;
        result.differentInvoiceRecipient = this.projectLineForm.differentInvoiceRecipient?.value;
        result.invoiceRecipientId = this.projectLineForm.invoiceRecipientId?.value?.clientId;
        result.invoiceRecipient = this.projectLineForm.invoiceRecipientId?.value;
        result.modifiedById = this.projectLineForm.modifiedById?.value?.id;
        result.modifiedBy = this.projectLineForm.modifiedById?.value;
        result.modificationDate = this.projectLineForm.modificationDate?.value;
        result.consultantInsuranceOptionId = this.projectLineForm.consultantInsuranceOptionId?.value;
        result.wasSynced = this.projectLineForm.wasSynced?.value;
        result.isLineForFees = this.projectLineForm.isLineForFees?.value;

        this.onConfirmed.emit(result);
        this.closeInternal();
    }

    reject(): void {
        this.onRejected.emit();
        this.closeInternal();
    }

    displayFullNameFn(option: any) {
        if (option) {
            if (option.firstName) {
                return option ? option?.firstName + ' ' + option?.lastName : '';
            } else {
                return option;
            }
        } else {
            return '';
        }
    }

    displayClientNameFn(option: any) {
        return option?.clientName?.trim();
    }

    private closeInternal(): void {
        this.dialogRef.close();
    }

    openInNewTab(clientId: number | undefined) {
        const url = this.router.serializeUrl(
            this.router.createUrlTree([`/app/clients/${clientId}/rates-and-fees`])
        );
        window.open(url, '_blank');
    }

}
