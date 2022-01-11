import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AddClientSpecialFeeDto, AddClientSpecialRateDto, ClientSpecialFeeDto, ClientSpecialRateDto, ClientsServiceProxy, EnumEntityTypeDto, EnumServiceProxy } from 'src/shared/service-proxies/service-proxies';
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
    clientSpecialRateOrFeeDirections: EnumEntityTypeDto[];

    showHiddenSpecialRates = true;
    showHiddenSpecialFees = true;

    clientId: number;

    private _unsubscribe = new Subject();
    constructor(
        private _fb: FormBuilder,
        private _lookupService: InternalLookupService,
        private _clientService: ClientsServiceProxy,
        private _activatedSnapshot: ActivatedRoute
    ) {
        this.clientSpecailRateForm = new ClientSpecailRateForm();
        this.clientFeesForm = new ClientFeesForm();
    }

    ngOnInit(): void {
        this._activatedSnapshot.paramMap.pipe(
            takeUntil(this._unsubscribe)
        ).subscribe(params => {
            this.clientId = +params.get('id')!;
        });
        this.getCurrencies();
        this.getUnitTypes();
        this.getSpecialRatesReportingUnits();
        this.getSpecialFeeSpecifications();
        this.getSpecialRateSpecifications();
        this.getSpecialRateOrFeeDirections();

        this.getClientRates();
        this.getClientFees();
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
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

    getClientRates() {
        this._clientService.specialRatesGet(this.clientId)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                result.forEach(item => {
                    this.addSpecialRate(item);
                });
            });
    }

    getClientFees() {
        this._clientService.specialFeesGet(this.clientId)
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                result.forEach(item => {
                    this.addClientFee(item);
                });
            });
    }

    addSpecialRate(clientRate?: ClientSpecialRateDto) {
        const form = this._fb.group({
            id: new FormControl(clientRate?.id ?? null),
            rateName: new FormControl(clientRate?.internalRateName ?? null),
            nameForInvoices: new FormControl(clientRate?.publicRateName ?? null),
            rateDirection: new FormControl(clientRate?.specialRateOrFeeDirection ?? null),
            reportingUnit: new FormControl(clientRate?.specialRateReportingUnit ?? null),
            rateSpecifiedAs: new FormControl(clientRate?.specialRateSpecifiedAs ?? null),
            clientRateValue: new FormControl(clientRate?.clientRate ?? null),
            clientRateCurrency: new FormControl(clientRate?.clientRateCurrency ?? null),
            proDataRate: new FormControl(clientRate?.proDataToProDataRate ?? null),
            consultantRate: new FormControl(clientRate?.consultantRate ?? null),
            category: new FormControl(null), // missing category in a response
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

    editOrSaveSpecialRate(isEditMode: boolean, index: number) {
        this.specialRates.at(index).get('editable')?.setValue(!isEditMode, {emitEvent: false});
        if (isEditMode) {
            this.saveOrUpdateSpecialRate(index);
        }
    }

    saveOrUpdateSpecialRate(index: number) {
        const clientRate = this.specialRates.at(index).value;
        let input = new AddClientSpecialRateDto();
        input.internalRateName = clientRate.rateName;
        input.publicRateName = clientRate.nameForInvoices;
        input.specialRateOrFeeDirectionId = clientRate.rateDirection?.id;
        input.specialRateReportingUnitId = clientRate.reportingUnit?.id;
        input.specialRateSpecifiedAsId = clientRate.rateSpecifiedAs?.id;
        input.specialRateCategoryId = clientRate.category?.id;
        input.clientRate = clientRate.clientRateValue;
        input.clientRateCurrencyId = clientRate.clientRateCurrency?.id;
        input.prodataToProdataRate = clientRate.proDataRate;
        input.prodataToProdataRateCurrencyId = clientRate.clientRateCurrency?.id;
        input.consultantRate = clientRate.consultantRate;
        input.consultantCurrencyId = clientRate.clientRateCurrency?.id;
        if (clientRate?.id === null || clientRate?.id === undefined) {
            this._clientService.specialRatesPost(this.clientId, input)
                .pipe(finalize(() => {

                }))
                .subscribe(result => {

                });
        } else {
            this._clientService.specialRatesPut(this.clientId, input)
                .pipe(finalize(() => {

                }))
                .subscribe(result => {

                });
        }
    }

    toggleSpecialRateHiddenState(index: number) {
        this.specialRates.at(index).get('hidden')?.setValue(!this.specialRates.at(index).get('hidden')?.value);
    }

    addClientFee(clientFee?: ClientSpecialFeeDto) {
        const form = this._fb.group({
            id: new FormControl(clientFee?.id ?? null),
            rateName: new FormControl(clientFee?.name ?? null),
            nameForInvoices: new FormControl(clientFee?.invoiceName ?? null),
            rateDirection: new FormControl(clientFee?.specialRateOrFeeDirection ?? null),
            reportingUnit: new FormControl(clientFee?.clientSpecialFeeFrequency ?? null),
            rateSpecifiedAs: new FormControl(clientFee?.clientSpecialFeeSpecifiedAs ?? null),
            clientRateValue: new FormControl(clientFee?.clientRate ?? null),
            clientRateCurrency: new FormControl(clientFee?.clientRateCurrency ?? null),
            proDataRate: new FormControl(clientFee?.prodataToProdataRate ?? null),
            consultantRate: new FormControl(clientFee?.consultantRate ?? null),
            category: new FormControl(null), // missing category in a response
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

    editOrSaveClientFee(isEditMode: boolean, index: number) {
        this.clientFees.at(index).get('editable')?.setValue(!isEditMode, {emitEvent: false});
        if (isEditMode) {
            this.saveOrUpdateSpecialFee(index);
        }
    }

    saveOrUpdateSpecialFee(index: number) {
        const clientRate = this.clientFees.at(index).value;
        let input = new AddClientSpecialFeeDto();
        input.name = clientRate.rateName;
        input.invoiceName = clientRate.nameForInvoices;
        input.specialRateOrFeeDirectionId = clientRate.rateDirection?.id;
        input.clientSpecialFeeFrequencyId = clientRate.reportingUnit?.id;
        input.clientSpecialFeeSpecifiedAsId = clientRate.rateSpecifiedAs?.id;
        // input.specialRateCategoryId = clientRate.category?.id;
        input.clientRate = clientRate.clientRateValue;
        input.clientRateCurrencyId = clientRate.clientRateCurrency?.id;
        input.prodataToProdataRate = clientRate.proDataRate;
        input.prodataToProdataRateCurrencyId = clientRate.clientRateCurrency?.id;
        input.consultantRate = clientRate.consultantRate;
        input.consultantCurrencyId = clientRate.clientRateCurrency?.id;
        if (clientRate.id === null || clientRate.id === undefined) {
            this._clientService.specialFeesPost(this.clientId, input)
                .pipe(finalize(() => {

                }))
                .subscribe(result => {

                });
        } else {
            this._clientService.specialFeesPut(this.clientId, input)
                .pipe(finalize(() => {

                }))
                .subscribe(result => {

                });
        }
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
