import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { EnumEntityTypeDto, EnumServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { ClientFeesForm, ClientSpecailRateForm } from './client-rates-and-fees.model';

@Component({
    selector: 'app-client-rates-and-fees',
    templateUrl: './client-rates-and-fees.component.html',
    styleUrls: ['./client-rates-and-fees.component.scss']
})
export class ClientRatesAndFeesComponent implements OnInit {
    clientSpecailRateForm: ClientSpecailRateForm;
    clientFeesForm: ClientFeesForm;

    editableInlineInput = false;

    currencies: EnumEntityTypeDto[];
    rateUnitTypes: EnumEntityTypeDto[];
    clientSpecialRateReportUnits: EnumEntityTypeDto[];
    clientSpecialFeeSpecifications: EnumEntityTypeDto[];
    clientSpecialRateSpecifications: EnumEntityTypeDto[];
    clientSpecialRateOrFeeDirections: EnumEntityTypeDto[];

    showHiddenSpecialRates = true;
    showHiddenSpecialFees = true;
    constructor(
        private _fb: FormBuilder,
        private _lookupService: InternalLookupService
    ) {
        this.clientSpecailRateForm = new ClientSpecailRateForm();
        this.clientFeesForm = new ClientFeesForm();
    }

    ngOnInit(): void {
        this.getCurrencies();
        this.getUnitTypes();
        this.getSpecialRatesReportingUnits();
        this.getSpecialFeeSpecifications();
        this.getSpecialRateSpecifications();
        this.getSpecialRateOrFeeDirections();
    }

    getCurrencies() {
        this._lookupService.getCurrencies()
            .subscribe(response => {
                this.currencies = response;
            });
    }

    getUnitTypes() {
        this._lookupService.getUnitTypes()
            .subscribe(response => {
                this.rateUnitTypes = response;
            });
    }

    getSpecialRatesReportingUnits() {
        this._lookupService.getSpecialRateReportUnits()
            .subscribe(response => {
                this.clientSpecialRateReportUnits = response;
            });
    }

    getSpecialFeeSpecifications() {
        this._lookupService.getSpecialFeeSpecifications()
            .subscribe(response => {
                this.clientSpecialFeeSpecifications = response;
            });
    }

    getSpecialRateSpecifications() {
        this._lookupService.getSpecialRateSpecifications()
            .subscribe(response => {
                this.clientSpecialRateSpecifications = response;
            });
    }

    getSpecialRateOrFeeDirections() {
        this._lookupService.getSpecialRateOrFeeDirections()
            .subscribe(response => {
                this.clientSpecialRateOrFeeDirections = response;
            });
    }

    addSpecialRate() {
        const form = this._fb.group({
            rateName: new FormControl(null),
            nameForInvoices: new FormControl(null),
            rateDirection: new FormControl(null),
            reportingUnit: new FormControl(null),
            rateSpecifiedAs: new FormControl(null),
            clientRateValue: new FormControl(null),
            clientRateCurrency: new FormControl(null),
            proDataRate: new FormControl(null),
            consultantRate: new FormControl(null),
            categoryId: new FormControl(null),
            editable: new FormControl(true),
            hidden: new FormControl(false)
        });
        this.clientSpecailRateForm.specialRates.push(form);
    }

    get specialRates(): FormArray {
        return this.clientSpecailRateForm.get('specialRates') as FormArray;
    }

    removeSpecialRate(index: number) {
        this.specialRates.removeAt(index);
    }

    editOrSaveSpecialRate(index: number) {
        this.specialRates.at(index).get('editable')?.setValue(!this.specialRates.at(index).get('editable')?.value, {emitEvent: false});
    }

    toggleSpecialRateHiddenState(index: number) {
        this.specialRates.at(index).get('hidden')?.setValue(!this.specialRates.at(index).get('hidden')?.value);
    }

    addClientFee() {
        const form = this._fb.group({
            rateName: new FormControl(null),
            nameForInvoices: new FormControl(null),
            rateDirection: new FormControl(null),
            reportingUnit: new FormControl(null),
            rateSpecifiedAs: new FormControl(null),
            clientRateValue: new FormControl(null),
            clientRateCurrency: new FormControl(null),
            proDataRate: new FormControl(null),
            consultantRate: new FormControl(null),
            categoryId: new FormControl(null),
            editable: new FormControl(true),
            hidden: new FormControl(false)
        });
        this.clientFeesForm.clientFees.push(form);
    }

    get clientFees(): FormArray {
        return this.clientFeesForm.get('clientFees') as FormArray;
    }

    removeClientFee(index: number) {
        this.clientFees.removeAt(index);
    }

    editOrSaveClientFee(index: number) {
        this.clientFees.at(index).get('editable')?.setValue(!this.clientFees.at(index).get('editable')?.value, {emitEvent: false});
    }

    toggleSpecialFeeHiddenState(index: number) {
        this.clientFees.at(index).get('hidden')?.setValue(!this.clientFees.at(index).get('hidden')?.value);
    }

    showHideSpecialRatesToggle(event: MatSlideToggleChange) {
        if (event.checked) {
            // logic to show hidden rows
        } else {
            // logic to hide hidden rows
        }
    }

    showHideSpecialFeesToggle(event: MatSlideToggleChange) {
        if (event.checked) {
            // logic to show hidden rows
        } else {
            // logic to hide hidden rows
        }
    }

}
