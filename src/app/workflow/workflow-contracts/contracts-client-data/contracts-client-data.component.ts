import { Component, Injector, Input, OnInit } from '@angular/core';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
    AgreementServiceProxy,
	AgreementSimpleListItemDto,
	AgreementSimpleListItemDtoPaginatedList,
	AgreementType,
	AgreementValidityState,
	ClientPeriodServiceProxy,
	ClientSpecialFeeDto,
	ClientSpecialRateDto,
	EnumEntityTypeDto,
	FrameAgreementServiceProxy,
	PeriodClientSpecialFeeDto,
	PeriodClientSpecialRateDto,
	PeriodConsultantSpecialFeeDto,
	PeriodConsultantSpecialRateDto,
    WorkflowAgreementsDto,
} from 'src/shared/service-proxies/service-proxies';
import { ClientTimeReportingCaps, WorkflowContractsClientDataForm, WorkflowContractsMainForm } from '../workflow-contracts.model';
import { forkJoin, of, Subject } from 'rxjs';
import { UntypedFormControl, UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { WorkflowDataService } from '../../workflow-data.service';
import { debounceTime, finalize, startWith, switchMap, takeUntil } from 'rxjs/operators';

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
    @Input() periodId: string;
	contractClientForm: WorkflowContractsClientDataForm;
	clientTimeReportingCaps = ClientTimeReportingCaps;
	clientTimeReportingCap: EnumEntityTypeDto[];
	currencies: EnumEntityTypeDto[];

	clientSpecialRateFilter = new UntypedFormControl('');
	clientRateToEdit: PeriodClientSpecialRateDto;
	isClientRateEditing = false;

	clientSpecialFeeFilter = new UntypedFormControl('');
	clientFeeToEdit: PeriodClientSpecialFeeDto;
	isClientFeeEditing = false;
	isContractModuleEnabled = this._workflowDataService.contractModuleEnabled;
    filteredFrameAgreements: AgreementSimpleListItemDto[];
    selectedFrameAgreementId: number | null;
	private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
		private _fb: UntypedFormBuilder,
		private _internalLookupService: InternalLookupService,
		private _agreementService: AgreementServiceProxy,
		private _workflowDataService: WorkflowDataService,
		private _frameAgreementServiceProxy: FrameAgreementServiceProxy,
	) {
		super(injector);
		this.contractClientForm = new WorkflowContractsClientDataForm();
        this.contractClientForm.frameAgreementId.valueChanges
            .pipe(
                takeUntil(this._unsubscribe),
                debounceTime(300),
                startWith(''),
                switchMap((value: any) => {
                    let dataToSend = {
                        recipientClientIds: [this.contractClientForm.directClientId.value, this.contractClientForm.endClientId.value].filter(Boolean),
                        search: value ?? '',
                        maxRecordsCount: 1000,
                    };
                    if (value?.agreementId) {
                        dataToSend.search = value.agreementId ? value.agreementName : value;
                    }
                    if (dataToSend.recipientClientIds?.length) {
                        return this.getFrameAgreements(false, dataToSend.search);
                    } else {
                        return of([]);
                    }
                }))
            .subscribe((list: AgreementSimpleListItemDtoPaginatedList) => {
                if (list?.items?.length) {
                    this.filteredFrameAgreements = list.items;
                    if (this.selectedFrameAgreementId) {
                        this.contractClientForm.frameAgreementId.setValue(list.items.find(x => x.agreementId === this.selectedFrameAgreementId), {emitEvent: false});
                        this.selectedFrameAgreementId = null;
                    }
                } else {
                    this.filteredFrameAgreements = [
                        new AgreementSimpleListItemDto({
                            agreementName: 'No records found',
                            agreementId: undefined,
                        }),
                    ];
                }
            });
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
		}).subscribe((result) => {
			this.currencies = result.currencies;
			this.clientTimeReportingCap = result.clientTimeReportingCap;
		});
	}

    getInitialFrameAgreements() {
        this.getFrameAgreements(true)
            .subscribe((result) => {
				console.log(result, 'result');
                this.filteredFrameAgreements = result.items;
                if (this.selectedFrameAgreementId !== null) {
                    this.contractClientForm.frameAgreementId.setValue(this.selectedFrameAgreementId);
                } else if (result.totalCount === 1) {
                    this._checkAndPreselectFrameAgreement();
                } else if (result?.totalCount === 0) {
                    this.contractClientForm.frameAgreementId.setValue('');
                }
            });
    }

	getFrameAgreements(isInitial = false, search: string = '') {
		let dataToSend = {
			agreementId: undefined,
			search: search,
			clientId: this.contractClientForm.directClientId.value,
			agreementType: AgreementType.Frame,
			validity: undefined,
			legalEntityId: isInitial ? this.contractClientForm.pdcInvoicingEntityId.value : undefined,
			salesTypeId: isInitial ? this.contractsMainForm.salesType.value?.id : undefined,
			contractTypeId: undefined,
			deliveryTypeId: isInitial ? this.contractsMainForm.deliveryType.value?.id : undefined,
			startDate: undefined,
			endDate: undefined,
            recipientClientIds: [this.contractClientForm.directClientId.value, this.contractClientForm.endClientId.value].filter(Boolean),
			pageNumber: 1,
			pageSize: 1000,
			sort: '',
		};
		return this._frameAgreementServiceProxy
			.clientFrameAgreementList(
				dataToSend.agreementId,
				dataToSend.search,
				undefined, // dataToSend.clientId,
				// dataToSend.agreementType,
				// dataToSend.validity,
				dataToSend.legalEntityId,
				dataToSend.salesTypeId,
				dataToSend.contractTypeId,
				dataToSend.deliveryTypeId,
				dataToSend.startDate,
				dataToSend.endDate,
                dataToSend.recipientClientIds,
                // undefined, //recipientConsultantId
                // undefined, //recipientSupplierId
				dataToSend.pageNumber,
				dataToSend.pageSize,
				dataToSend.sort
			);
	}

	private _checkAndPreselectFrameAgreement() {
		if (
			(this.contractClientForm.directClientId.value !== null &&
			this.contractClientForm.directClientId.value !== undefined) &&
			(this.contractsMainForm.salesType.value?.id !== null &&
            this.contractsMainForm.salesType.value?.id !== undefined) &&
			(this.contractsMainForm.deliveryType.value?.id !== null &&
            this.contractsMainForm.deliveryType.value?.id !== undefined)
		) {
			if (this.filteredFrameAgreements.length === 1) {
				this.contractClientForm.frameAgreementId.setValue(this.filteredFrameAgreements[0], { emitEvent: false });
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





	get clientRates(): UntypedFormArray {
		return this.contractClientForm.get('clientRates') as UntypedFormArray;
	}

	get clientFees(): UntypedFormArray {
		return this.contractClientForm.get('clientFees') as UntypedFormArray;
	}

}
