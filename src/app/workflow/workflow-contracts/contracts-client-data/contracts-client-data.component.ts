import { Component, Injector, Input, OnInit } from '@angular/core';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
    AgreementServiceProxy,
	AgreementSimpleListItemDto,
	AgreementType,
	ClientSpecialFeeDto,
	ClientSpecialRateDto,
	EnumEntityTypeDto,
	PeriodClientSpecialFeeDto,
	PeriodClientSpecialRateDto,
	PeriodConsultantSpecialFeeDto,
	PeriodConsultantSpecialRateDto,
    TimeReportingCapDto,
} from 'src/shared/service-proxies/service-proxies';
import { ClientTimeReportingCaps, WorkflowContractsClientDataForm, WorkflowContractsMainForm } from '../workflow-contracts.model';
import { forkJoin, Subject } from 'rxjs';
import { UntypedFormControl, UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { WorkflowDataService } from '../../workflow-data.service';
@Component({
	selector: 'app-contracts-client-data',
	templateUrl: './contracts-client-data.component.html',
	styleUrls: ['../workflow-contracts.component.scss'],
})
export class ContractsClientDataComponent extends AppComponentBase implements OnInit {
	@Input() readOnlyMode: boolean;
	@Input() clientSpecialRateList: ClientSpecialRateDto[];
	@Input() clientSpecialFeeList: ClientSpecialFeeDto[];
    @Input() contractsMainForm: WorkflowContractsMainForm;
	contractClientForm: WorkflowContractsClientDataForm;
	clientTimeReportingCaps = ClientTimeReportingCaps;
	clientTimeReportingCap: EnumEntityTypeDto[];
	currencies: EnumEntityTypeDto[];
    valueUnitTypes: EnumEntityTypeDto[];
    periodUnitTypes: EnumEntityTypeDto[];
	clientSpecialRateFilter = new UntypedFormControl('');
	clientRateToEdit: PeriodClientSpecialRateDto;
	isClientRateEditing = false;

    clientSpecialFeeFilter = new UntypedFormControl('');
	clientFeeToEdit: PeriodClientSpecialFeeDto;
	isClientFeeEditing = false;
    frameAgreements: AgreementSimpleListItemDto[];
    isContractModuleEnabled = this._workflowDataService.contractModuleEnabled;

	private _unsubscribe = new Subject();
	constructor(injector: Injector, private _fb: UntypedFormBuilder, private _internalLookupService: InternalLookupService, private _agreementService: AgreementServiceProxy, private _workflowDataService: WorkflowDataService) {
		super(injector);
		this.contractClientForm = new WorkflowContractsClientDataForm();
	}

	ngOnInit(): void {
        this._getEnums();
    }

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	private _getEnums() {
		forkJoin({
			currencies: this._internalLookupService.getCurrencies(),
			clientTimeReportingCap: this._internalLookupService.getClientTimeReportingCap(),
            valueUnitTypes: this._internalLookupService.getValueUnitTypes(),
            periodUnitTypes: this._internalLookupService.getPeriodUnitTypes(),
		}).subscribe((result) => {
			this.currencies = result.currencies;
			this.clientTimeReportingCap = result.clientTimeReportingCap;
            this.valueUnitTypes = result.valueUnitTypes;
            this.periodUnitTypes = result.periodUnitTypes;
		});
	}

    getFrameAgreements(agreementId: number | undefined = undefined, search: string = '') {
        let dataToSend = {
            agreementId: agreementId,
            search: search,
            clientId: this.contractClientForm.directClientId.value.clientId,
            agreementType: AgreementType.Frame,
            validity: undefined,
            legalEntityId: this.contractClientForm.pdcInvoicingEntityId.value,
            salesTypeId: this.contractsMainForm.salesType.value?.id,
            contractTypeId: undefined,
            deliveryTypeId: this.contractsMainForm.deliveryType.value?.id,
            startDate: undefined,
            endDate: undefined,
            pageNumber: 1,
            pageSize: 1000,
            sort: ''
        }
        this._agreementService
			.simpleList(
				dataToSend.agreementId,
				dataToSend.search,
				dataToSend.clientId,
				dataToSend.agreementType,
				dataToSend.validity,
				dataToSend.legalEntityId,
				dataToSend.salesTypeId,
				dataToSend.contractTypeId,
				dataToSend.deliveryTypeId,
				dataToSend.startDate,
				dataToSend.endDate,
                [], // recipientClientIds
                undefined, // recipientConsultantId
                undefined, // recipientSupplierId
				dataToSend.pageNumber,
				dataToSend.pageSize,
				dataToSend.sort
			)
			.subscribe((result) => {
				this.frameAgreements = result.items;
                if (result.items.length === 1) {
                    this._checkAndPreselectFrameAgreement();
                }
			});
    }

    private _checkAndPreselectFrameAgreement() {
        if (
			this.contractClientForm.directClientId.value?.clientId &&
			this.contractsMainForm.salesType.value?.id &&
			this.contractsMainForm.deliveryType.value?.id
		) {
            if (this.frameAgreements.length === 1) {
                this.contractClientForm.frameAgreementId.setValue(this.frameAgreements[0].agreementId, { emitEvent: false });
            }
		}
    }

	selectClientRate(rate: ClientSpecialRateDto, clientRateMenuTrigger: MatMenuTrigger) {
		const clientRate = new PeriodClientSpecialRateDto();
		clientRate.id = undefined;
		clientRate.clientSpecialRateId = rate.id;
		clientRate.rateName = rate.internalName;
		clientRate.reportingUnit = rate.specialRateReportingUnit;
		clientRate.rateSpecifiedAs = rate.specialRateSpecifiedAs;
		if (clientRate.rateSpecifiedAs?.id === 1) {
			clientRate.clientRate = +((this.contractClientForm.clientRate?.value?.normalRate * rate.clientRate!) / 100).toFixed(
				2
			);
			clientRate.clientRateCurrencyId = this.contractClientForm.currency?.value?.id;
		} else {
			clientRate.clientRate = rate.clientRate;
			clientRate.clientRateCurrencyId = rate.clientRateCurrency?.id;
		}
		clientRateMenuTrigger.closeMenu();
		this.addSpecialRate(clientRate);
	}

	addSpecialRate(clientRate?: PeriodClientSpecialRateDto) {
		const form = this._fb.group({
			id: new UntypedFormControl(clientRate?.id ?? null),
			clientSpecialRateId: new UntypedFormControl(clientRate?.clientSpecialRateId ?? null),
			rateName: new UntypedFormControl(clientRate?.rateName ?? null),
			reportingUnit: new UntypedFormControl(clientRate?.reportingUnit ?? null),
			clientRateValue: new UntypedFormControl(clientRate?.clientRate ?? null),
			clientRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, clientRate?.clientRateCurrencyId) ?? null
			),
			editable: new UntypedFormControl(clientRate ? false : true),
		});
		this.contractClientForm.clientRates.push(form);
	}

	removeClientRate(index: number) {
		this.clientRates.removeAt(index);
	}

	editOrSaveSpecialRate(isEditable: boolean, index: number) {
		if (isEditable) {
			// save
			this.clientRateToEdit = new PeriodClientSpecialRateDto();
			this.isClientRateEditing = false;
		} else {
			// make editable
			const clientFeeValue = this.clientRates.at(index).value;
			this.clientRateToEdit = new PeriodClientSpecialRateDto({
				id: clientFeeValue.id,
				clientSpecialRateId: clientFeeValue.clientSpecialRateId,
				rateName: clientFeeValue.rateName,
				reportingUnit: clientFeeValue.reportingUnit,
				clientRate: clientFeeValue.clientRateValue,
				clientRateCurrencyId: clientFeeValue.clientRateCurrency?.id,
			});
			this.isClientRateEditing = true;
		}
		this.clientRates.at(index).get('editable')?.setValue(!isEditable, { emitEvent: false });
	}

	cancelEditClientRate(index: number) {
		const rateRow = this.clientFees.at(index);
		rateRow?.get('clientRateValue')?.setValue(this.clientRateToEdit.clientRate, { emitEvent: false });
		rateRow
			?.get('clientRateCurrencyId')
			?.setValue(this.findItemById(this.currencies, this.clientRateToEdit.clientRateCurrencyId), { emitEvent: false });
		this.clientRateToEdit = new PeriodConsultantSpecialRateDto();
		this.isClientRateEditing = false;
		this.clientRates.at(index).get('editable')?.setValue(false, { emitEvent: false });
	}

	selectClientFee(event: any, fee: ClientSpecialFeeDto, clientFeeMenuTrigger: MatMenuTrigger) {
		const clientFee = new PeriodClientSpecialFeeDto();
		clientFee.id = undefined;
		clientFee.clientSpecialFeeId = fee.id;
		clientFee.feeName = fee.internalName;
		clientFee.frequency = fee.clientSpecialFeeFrequency;
		clientFee.clientRate = fee.clientRate;
		clientFee.clientRateCurrencyId = fee.clientRateCurrency?.id;
		clientFeeMenuTrigger.closeMenu();
		this.addClientFee(clientFee);
	}

	addClientFee(clientFee?: PeriodClientSpecialFeeDto) {
		const form = this._fb.group({
			id: new UntypedFormControl(clientFee?.id ?? null),
			clientSpecialFeeId: new UntypedFormControl(clientFee?.clientSpecialFeeId ?? null),
			feeName: new UntypedFormControl(clientFee?.feeName ?? null),
			feeFrequency: new UntypedFormControl(clientFee?.frequency ?? null),
			clientRateValue: new UntypedFormControl(clientFee?.clientRate ?? null),
			clientRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, clientFee?.clientRateCurrencyId) ?? null
			),

			editable: new UntypedFormControl(clientFee ? false : true),
		});
		this.contractClientForm.clientFees.push(form);
	}

	removeClientFee(index: number) {
		this.clientFees.removeAt(index);
	}

	editOrSaveClientFee(isEditable: boolean, index: number) {
		if (isEditable) {
			// save
			this.clientFeeToEdit = new PeriodClientSpecialFeeDto();
			this.isClientFeeEditing = false;
		} else {
			// make editable
			const clientFeeValue = this.clientFees.at(index).value;
			this.clientFeeToEdit = new PeriodClientSpecialFeeDto({
				id: clientFeeValue.id,
				clientSpecialFeeId: clientFeeValue.clientSpecialFeeId,
				feeName: clientFeeValue.feeName,
				frequency: clientFeeValue.feeFrequency,
				clientRate: clientFeeValue.clientRateValue,
				clientRateCurrencyId: clientFeeValue.clientRateCurrency?.id,
			});
			this.isClientFeeEditing = true;
		}
		this.clientFees.at(index).get('editable')?.setValue(!isEditable, { emitEvent: false });
	}

	cancelEditClientFee(index: number) {
		const feeRow = this.clientFees.at(index);
		feeRow?.get('clientRateValue')?.setValue(this.clientFeeToEdit.clientRate, { emitEvent: false });
		feeRow
			?.get('clientRateCurrencyId')
			?.setValue(this.findItemById(this.currencies, this.clientFeeToEdit.clientRateCurrencyId), { emitEvent: false });
		this.clientFeeToEdit = new PeriodConsultantSpecialFeeDto();
		this.isClientFeeEditing = false;
		this.clientFees.at(index).get('editable')?.setValue(false, { emitEvent: false });
	}

    addTimeReportingCap(cap?: TimeReportingCapDto) {
		const form = this._fb.group({
            id: new UntypedFormControl(cap?.id?.value ?? null),
			timeReportingCapMaxValue: new UntypedFormControl(cap?.timeReportingCapMaxValue ?? null),
			valueUnitId: new UntypedFormControl(cap?.valueUnitId ?? null),
			periodUnitId: new UntypedFormControl(cap?.periodUnitId ?? null),
		});
		this.contractClientForm.timeReportingCaps.push(form);
	}

	removeTimeReportingCap(index: number) {
		this.timeReportingCaps.removeAt(index);
	}

    get clientRates(): UntypedFormArray {
		return this.contractClientForm.get('clientRates') as UntypedFormArray;
	}

    get clientFees(): UntypedFormArray {
		return this.contractClientForm.get('clientFees') as UntypedFormArray;
	}

    get timeReportingCaps(): UntypedFormArray {
        return this.contractClientForm.get('timeReportingCaps') as UntypedFormArray;
    }
}
