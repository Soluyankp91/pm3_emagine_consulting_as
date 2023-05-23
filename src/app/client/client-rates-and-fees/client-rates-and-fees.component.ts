import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AddClientSpecialFeeDto, AddClientSpecialRateDto, ClientSpecialFeeDto, ClientSpecialRateDto, ClientsServiceProxy, EnumEntityTypeDto, UpdateClientSpecialFeeDto, UpdateClientSpecialRateDto } from 'src/shared/service-proxies/service-proxies';
import { ClientFeesForm, ClientSpecailRateForm } from './client-rates-and-fees.model';
import { AppComponentBase } from 'src/shared/app-component-base';

@Component({
    selector: 'app-client-rates-and-fees',
    templateUrl: './client-rates-and-fees.component.html',
    styleUrls: ['./client-rates-and-fees.component.scss']
})
export class ClientRatesAndFeesComponent extends AppComponentBase implements OnInit, OnDestroy {
    clientSpecailRateForm: ClientSpecailRateForm;
    clientFeesForm: ClientFeesForm;

    editableInlineInput = false;

    currencies: EnumEntityTypeDto[];
    rateUnitTypes: EnumEntityTypeDto[];
    specialRateReportUnits: EnumEntityTypeDto[];
    specialFeeSpecifications: EnumEntityTypeDto[];
    specialRateSpecifications: EnumEntityTypeDto[];
    specialFeeFrequencies: EnumEntityTypeDto[];
    rateCategories: EnumEntityTypeDto[] = [];

    showHiddenSpecialRates = false;
    showHiddenSpecialFees = false;

    clientId: number;

    feeIsEditing = false;
    rateIsEditing = false;

    feeIsSaving = false;
    rateIsSaving = false;

    private _unsubscribe = new Subject();
    constructor(
        injector: Injector,
        private _fb: UntypedFormBuilder,
        private _internalLookupService: InternalLookupService,
        private _clientService: ClientsServiceProxy,
        private _activatedSnapshot: ActivatedRoute,
        private _snackBar: MatSnackBar
    ) {
        super(injector);
        this.clientSpecailRateForm = new ClientSpecailRateForm();
        this.clientFeesForm = new ClientFeesForm();
    }

    ngOnInit(): void {
        this._activatedSnapshot.parent!.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.clientId = +params.get('id')!;
        });
        this._getEnums();
        this.getClientRates();
        this.getClientFees();
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    private _getEnums() {
        this.currencies = this._internalLookupService.getEnumValue('currencies');
        this.rateUnitTypes = this._internalLookupService.getEnumValue('rateUnitTypes');
        this.specialRateReportUnits = this._internalLookupService.getEnumValue('specialRateReportUnits');
        this.specialRateSpecifications = this._internalLookupService.getEnumValue('specialRateSpecifications');
        this.specialFeeSpecifications = this._internalLookupService.getEnumValue('specialFeeSpecifications');
        this.specialFeeFrequencies = this._internalLookupService.getEnumValue('specialFeeFrequencies');
    }

    getClientRates() {
        this._clientService.specialRatesAll(this.clientId, this.showHiddenSpecialRates)
            .subscribe(result => {
                this.clientSpecailRateForm = new ClientSpecailRateForm();
                this.rateIsEditing = false;
                result.forEach(item => {
                    this.addSpecialRate(item);
                });
            });
    }

    getClientFees() {
        this._clientService.specialFeesAll(this.clientId, this.showHiddenSpecialFees)
            .subscribe(result => {
                this.clientFeesForm = new ClientFeesForm();
                this.feeIsEditing = false;
                result.forEach(item => {
                    this.addClientFee(item);
                });
            });
    }

    addSpecialRate(clientRate?: ClientSpecialRateDto) {
        const form = this._fb.group({
            id: new UntypedFormControl(clientRate?.id ?? null),
            rateName: new UntypedFormControl(clientRate?.internalName ?? null),
            nameForInvoices: new UntypedFormControl(clientRate?.publicName ?? null),
            reportingUnit: new UntypedFormControl(clientRate?.specialRateReportingUnit ?? null),
            rateSpecifiedAs: new UntypedFormControl(clientRate?.specialRateSpecifiedAs ?? null),
            clientRateValue: new UntypedFormControl(clientRate?.clientRate ?? null),
            clientRateCurrency: new UntypedFormControl(clientRate?.clientRateCurrency ?? null),
            proDataRate: new UntypedFormControl(clientRate?.proDataToProDataRate ?? null),
            proDataRateCurrency: new UntypedFormControl(clientRate?.proDataToProDataRateCurrency ?? null),
            consultantRate: new UntypedFormControl(clientRate?.consultantRate ?? null),
            consultantRateCurrency: new UntypedFormControl(clientRate?.consultantCurrency ?? null),
            editable: new UntypedFormControl(clientRate?.id ? false : true),
            inUse: new UntypedFormControl(clientRate?.inUse ? clientRate?.inUse : false),
            hidden: new UntypedFormControl(clientRate?.isHidden ?? false)
        });
        if (!clientRate?.id) {
            this.rateIsEditing = true;
        }
        this.clientSpecailRateForm.specialRates.push(form);
    }

    get specialRates(): UntypedFormArray {
        return this.clientSpecailRateForm.get('specialRates') as UntypedFormArray;
    }

    removeSpecialRate(rateId: number, isUsed: boolean, index: number) {
        if (this.specialRates.at(index).get('editable')?.value) {
            this.rateIsEditing = false;
        }
        if (rateId) {
            this.deleteClientRate(rateId, isUsed);
        } else {
            this.specialRates.removeAt(index);
        }
    }

    deleteClientRate(rateId: number, isUsed: boolean) {
        if (isUsed) {
            this._snackBar.open(('This special client fee cannot be deleted and be will hidden instead.'), 'Dismiss', {
                panelClass: ['warning-snackbar'],
                duration: 5000
            });
        }
        this._clientService.delete(this.clientId, rateId)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.getClientRates();
            });
    }

    startEditSpecialRate(isEditMode: boolean, index: number) {
        this.specialRates.at(index).get('editable')?.setValue(!isEditMode, {emitEvent: false});
        this.rateIsEditing = !isEditMode;
    }

    cancelRateEdit(index: number) {
        this.specialRates.at(index).get('editable')?.setValue(false, {emitEvent: false});
        this.rateIsEditing = false;
        this.getClientRates();
    }

    saveOrUpdateSpecialRate(index: number) {
        this.rateIsSaving = true;
        const clientRate = this.specialRates.at(index).value;
        let input = new AddClientSpecialRateDto();
        input.internalName = clientRate.rateName;
        input.publicName = clientRate.nameForInvoices;
        input.specialRateReportingUnitId = clientRate.reportingUnit?.id;
        input.specialRateSpecifiedAsId = clientRate.rateSpecifiedAs?.id;
        input.clientRate = clientRate.clientRateValue;
        input.clientRateCurrencyId = clientRate.clientRateCurrency?.id;
        input.prodataToProdataRate = clientRate.proDataRate;
        input.prodataToProdataRateCurrencyId = clientRate.proDataRateCurrency?.id;
        input.consultantRate = clientRate.consultantRate;
        input.consultantCurrencyId = clientRate.consultantRateCurrency?.id;
        input.isHidden = clientRate.hidden ?? false;
        if (clientRate?.id === null || clientRate?.id === undefined) {
            this._clientService.specialRatesPOST(this.clientId, input)
                .pipe(finalize(() => {
                    this.rateIsSaving = false;
                    this.rateIsEditing = false;
                }))
                .subscribe(result => {
                    this.getClientRates();
                });
        } else {
            let updateInput = new UpdateClientSpecialRateDto(input);
            updateInput.id = clientRate.id;
            this._clientService.specialRatesPUT(this.clientId, updateInput)
                .pipe(finalize(() => {
                    this.rateIsSaving = false;
                    this.rateIsEditing = false;
                }))
                .subscribe(result => {
                    this.getClientRates();
                });
        }
    }

    toggleSpecialRateHiddenState(index: number) {
        this.specialRates.at(index).get('hidden')?.setValue(!this.specialRates.at(index).get('hidden')?.value);
        this.saveOrUpdateSpecialRate(index);
    }

    addClientFee(clientFee?: ClientSpecialFeeDto) {
        const form = this._fb.group({
            id: new UntypedFormControl(clientFee?.id ?? null),
            feeName: new UntypedFormControl(clientFee?.internalName ?? null),
            nameForInvoices: new UntypedFormControl(clientFee?.publicName ?? null),
            feeFrequency: new UntypedFormControl(clientFee?.clientSpecialFeeFrequency ?? null),
            feeSpecifiedAs: new UntypedFormControl(clientFee?.clientSpecialFeeSpecifiedAs ?? null),
            clientRateValue: new UntypedFormControl(clientFee?.clientRate ?? null),
            clientRateCurrency: new UntypedFormControl(clientFee?.clientRateCurrency ?? null),
            proDataRate: new UntypedFormControl(clientFee?.prodataToProdataRate ?? null),
            proDataRateCurrency: new UntypedFormControl(clientFee?.prodataToProdataRateCurrency ?? null),
            consultantRate: new UntypedFormControl(clientFee?.consultantRate ?? null),
            consultantRateCurrency: new UntypedFormControl(clientFee?.consultantCurrency ?? null),
            category: new UntypedFormControl(null), // missing category in a response
            editable: new UntypedFormControl(clientFee ? false : true),
            inUse: new UntypedFormControl(clientFee?.inUse ? clientFee?.inUse : false),
            hidden: new UntypedFormControl(clientFee?.isHidden ?? false)
        });
        if (!clientFee?.id) {
            this.feeIsEditing = true;
        }
        this.clientFeesForm.clientFees.push(form);
    }

    get clientFees(): UntypedFormArray {
        return this.clientFeesForm.get('clientFees') as UntypedFormArray;
    }

    removeClientFee(feeId: number, isUsed: boolean, index: number) {
        if (this.clientFees.at(index).get('editable')?.value) {
            this.feeIsEditing = false;
        }
        if (feeId) {
            this.deleteClientFee(feeId, isUsed, index);
        } else {
            this.clientFees.removeAt(index);
        }
    }

    deleteClientFee(feeId: number, isUsed: boolean, index: number) {
        if (isUsed) {
            this._snackBar.open(('This special client fee cannot be deleted and be will hidden instead.'), 'Dismiss', {
                panelClass: ['warning-snackbar'],
                duration: 5000
            });
        }
        this._clientService.delete2(this.clientId, feeId)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.clientFees.removeAt(index);
            });
    }

    startEditSpecialFee(isEditMode: boolean, index: number) {
        this.clientFees.at(index).get('editable')?.setValue(!isEditMode, {emitEvent: false});
        this.feeIsEditing = !isEditMode;
    }

    cancelFeeEdit(index: number) {
        this.clientFees.at(index).get('editable')?.setValue(false, {emitEvent: false});
        this.feeIsEditing = false;
        this.getClientFees();
    }

    saveOrUpdateSpecialFee(index: number) {
        const clientFee = this.clientFees.at(index).value;
        let input = new AddClientSpecialFeeDto();
        input.internalName = clientFee.feeName;
        input.publicName = clientFee.nameForInvoices;
        input.clientSpecialFeeFrequencyId = clientFee.feeFrequency?.id;
        input.clientSpecialFeeSpecifiedAsId = clientFee.feeSpecifiedAs?.id;
        input.clientRate = clientFee.clientRateValue;
        input.clientRateCurrencyId = clientFee.clientRateCurrency?.id;
        input.prodataToProdataRate = clientFee.proDataRate;
        input.prodataToProdataRateCurrencyId = clientFee.proDataRateCurrency?.id;
        input.consultantRate = clientFee.consultantRate;
        input.consultantCurrencyId = clientFee.consultantRateCurrency?.id;
    input.isHidden = clientFee.hidden ?? false;
        this.feeIsSaving = true;
        if (clientFee.id === null || clientFee.id === undefined) {
            this._clientService.specialFeesPOST(this.clientId, input)
                .pipe(finalize(() => {
                    this.feeIsSaving = false;
                    this.feeIsEditing = false;
                }))
                .subscribe(() => {
                    this.getClientFees();
                });
        } else {
            let updateInput = new UpdateClientSpecialFeeDto(input);
            updateInput.id = clientFee.id;
            this._clientService.specialFeesPUT(this.clientId, updateInput)
                .pipe(finalize(() => {
                    this.feeIsSaving = false;
                    this.feeIsEditing = false;
                }))
                .subscribe(() => {
                    this.getClientFees();
                });
        }
    }

    toggleSpecialFeeHiddenState(index: number) {
        this.clientFees.at(index).get('hidden')?.setValue(!this.clientFees.at(index).get('hidden')?.value);
        this.saveOrUpdateSpecialFee(index);
    }

    disableOrEnableRateFields(event: MatSelectChange, rateIndex: number) {
        if (event.value.id === 3) { // Different for each
            this.specialRates.at(rateIndex).get('clientRateValue')?.disable();
            this.specialRates.at(rateIndex).get('clientRateCurrency')?.disable();
            this.specialRates.at(rateIndex).get('proDataRate')?.disable();
            this.specialRates.at(rateIndex).get('proDataRateCurrency')?.disable();
            this.specialRates.at(rateIndex).get('consultantRate')?.disable();
            this.specialRates.at(rateIndex).get('consultantRateCurrency')?.disable();
        } else {
            this.specialRates.at(rateIndex).get('clientRateValue')?.enable();
            this.specialRates.at(rateIndex).get('clientRateCurrency')?.enable();
            this.specialRates.at(rateIndex).get('proDataRate')?.enable();
            this.specialRates.at(rateIndex).get('proDataRateCurrency')?.enable();
            this.specialRates.at(rateIndex).get('consultantRate')?.enable();
            this.specialRates.at(rateIndex).get('consultantRateCurrency')?.enable();
        }
    }

    compareWithFn(listOfItems: any, selectedItem: any) {
        return listOfItems && selectedItem && listOfItems.id === selectedItem.id;;
    }

}
