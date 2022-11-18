import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AddClientSpecialFeeDto, AddClientSpecialRateDto, ClientSpecialFeeDto, ClientSpecialRateDto, ClientsServiceProxy, EnumEntityTypeDto, SpecialFeesServiceProxy, SpecialRatesServiceProxy, UpdateClientSpecialFeeDto, UpdateClientSpecialRateDto } from 'src/shared/service-proxies/service-proxies';
import { ClientFeesForm, ClientSpecailRateForm } from './client-rates-and-fees.model';

@Component({
    selector: 'app-client-rates-and-fees',
    templateUrl: './client-rates-and-fees.component.html',
    styleUrls: ['./client-rates-and-fees.component.scss']
})
export class ClientRatesAndFeesComponent implements OnInit, OnDestroy {
    clientSpecailRateForm: ClientSpecailRateForm;
    clientFeesForm: ClientFeesForm;

    editableInlineInput = false;

    currencies: EnumEntityTypeDto[];
    rateUnitTypes: EnumEntityTypeDto[];
    clientSpecialRateReportUnits: EnumEntityTypeDto[];
    clientSpecialFeeSpecifications: EnumEntityTypeDto[];
    clientSpecialRateSpecifications: EnumEntityTypeDto[];
    clientSpecialFeeFrequencies: EnumEntityTypeDto[];
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
        private _fb: FormBuilder,
        private _internalLookupService: InternalLookupService,
        private _clientService: ClientsServiceProxy,
        private _specialRatesService: SpecialRatesServiceProxy,
        private _specialFeesService: SpecialFeesServiceProxy,
        private _activatedSnapshot: ActivatedRoute,
        private _snackBar: MatSnackBar
    ) {
        this.clientSpecailRateForm = new ClientSpecailRateForm();
        this.clientFeesForm = new ClientFeesForm();
    }

    ngOnInit(): void {
        this._activatedSnapshot.parent!.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.clientId = +params.get('id')!;
        });
        this.getCurrencies();
        this.getUnitTypes();
        this.getSpecialRatesReportingUnits();
        this.getSpecialFeeSpecifications();
        this.getSpecialRateSpecifications();
        this.getSpecialFeeFrequencies();

        this.getClientRates();
        this.getClientFees();
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    getCurrencies() {
        this._internalLookupService.getCurrencies()
            .subscribe(response => {
                this.currencies = response;
            });
    }

    getUnitTypes() {
        this._internalLookupService.getUnitTypes()
            .subscribe(response => {
                this.rateUnitTypes = response;
            });
    }

    getSpecialRatesReportingUnits() {
        this._internalLookupService.getSpecialRateReportUnits()
            .subscribe(response => {
                this.clientSpecialRateReportUnits = response;
            });
    }

    getSpecialFeeSpecifications() {
        this._internalLookupService.getSpecialFeeSpecifications()
            .subscribe(response => {
                this.clientSpecialFeeSpecifications = response;
            });
    }

    getSpecialRateSpecifications() {
        this._internalLookupService.getSpecialRateSpecifications()
            .subscribe(response => {
                this.clientSpecialRateSpecifications = response;
            });
    }

    getSpecialFeeFrequencies() {
        this._internalLookupService.getSpecialFeeFrequencies()
            .subscribe(response => {
                this.clientSpecialFeeFrequencies = response;
            });
    }

    getClientRates() {
        this._clientService.specialRatesGet(this.clientId, this.showHiddenSpecialRates)
            .subscribe(result => {
                this.clientSpecailRateForm = new ClientSpecailRateForm();
                this.rateIsEditing = false;
                result.forEach(item => {
                    this.addSpecialRate(item);
                });
            });
    }

    getClientFees() {
        this._clientService.specialFeesGet(this.clientId, this.showHiddenSpecialFees)
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
            id: new FormControl(clientRate?.id ?? null),
            rateName: new FormControl(clientRate?.internalName ?? null),
            nameForInvoices: new FormControl(clientRate?.publicName ?? null),
            reportingUnit: new FormControl(clientRate?.specialRateReportingUnit ?? null),
            rateSpecifiedAs: new FormControl(clientRate?.specialRateSpecifiedAs ?? null),
            clientRateValue: new FormControl(clientRate?.clientRate ?? null),
            clientRateCurrency: new FormControl(clientRate?.clientRateCurrency ?? null),
            proDataRate: new FormControl(clientRate?.proDataToProDataRate ?? null),
            proDataRateCurrency: new FormControl(clientRate?.proDataToProDataRateCurrency ?? null),
            consultantRate: new FormControl(clientRate?.consultantRate ?? null),
            consultantRateCurrency: new FormControl(clientRate?.consultantCurrency ?? null),
            editable: new FormControl(clientRate?.id ? false : true),
            inUse: new FormControl(clientRate?.inUse ? clientRate?.inUse : false),
            hidden: new FormControl(clientRate?.isHidden ?? false)
        });
        if (!clientRate?.id) {
            this.rateIsEditing = true;
        }
        this.clientSpecailRateForm.specialRates.push(form);
    }

    get specialRates(): FormArray {
        return this.clientSpecailRateForm.get('specialRates') as FormArray;
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
        this._specialRatesService.delete(this.clientId, rateId)
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
            this._clientService.specialRatesPost(this.clientId, input)
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
            this._clientService.specialRatesPut(this.clientId, updateInput)
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
            id: new FormControl(clientFee?.id ?? null),
            feeName: new FormControl(clientFee?.internalName ?? null),
            nameForInvoices: new FormControl(clientFee?.publicName ?? null),
            feeFrequency: new FormControl(clientFee?.clientSpecialFeeFrequency ?? null),
            feeSpecifiedAs: new FormControl(clientFee?.clientSpecialFeeSpecifiedAs ?? null),
            clientRateValue: new FormControl(clientFee?.clientRate ?? null),
            clientRateCurrency: new FormControl(clientFee?.clientRateCurrency ?? null),
            proDataRate: new FormControl(clientFee?.prodataToProdataRate ?? null),
            proDataRateCurrency: new FormControl(clientFee?.prodataToProdataRateCurrency ?? null),
            consultantRate: new FormControl(clientFee?.consultantRate ?? null),
            consultantRateCurrency: new FormControl(clientFee?.consultantCurrency ?? null),
            category: new FormControl(null), // missing category in a response
            editable: new FormControl(clientFee ? false : true),
            inUse: new FormControl(clientFee?.inUse ? clientFee?.inUse : false),
            hidden: new FormControl(clientFee?.isHidden ?? false)
        });
        if (!clientFee?.id) {
            this.feeIsEditing = true;
        }
        this.clientFeesForm.clientFees.push(form);
    }

    get clientFees(): FormArray {
        return this.clientFeesForm.get('clientFees') as FormArray;
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
        this._specialFeesService.delete(this.clientId, feeId)
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
            this._clientService.specialFeesPost(this.clientId, input)
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
            this._clientService.specialFeesPut(this.clientId, updateInput)
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
