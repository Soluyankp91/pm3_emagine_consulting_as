import { Overlay } from '@angular/cdk/overlay';
import { NumberSymbol } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { AuthenticationResult } from '@azure/msal-browser';
import { forkJoin, of, Subject } from 'rxjs';
import { finalize, takeUntil, debounceTime, switchMap, startWith } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { environment } from 'src/environments/environment';
import { AppComponentBase } from 'src/shared/app-component-base';
import { MediumDialogConfig } from 'src/shared/dialog.configs';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import { ClientResultDto, ClientSpecialFeeDto, ClientSpecialRateDto, ConsultantSalesDataDto, ConsultantWithSourcingRequestResultDto, ConsultantResultDto, CountryDto, EmployeeDto, EnumEntityTypeDto, LegalEntityDto, LookupServiceProxy, PeriodConsultantSpecialFeeDto, PeriodConsultantSpecialRateDto, StepType, WorkflowProcessType, ExtendConsultantPeriodDto, ChangeConsultantPeriodDto, ConsultantPeriodServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { CustomValidators } from 'src/shared/utils/custom-validators';
import { WorkflowConsultantActionsDialogComponent } from '../../workflow-consultant-actions-dialog/workflow-consultant-actions-dialog.component';
import { WorkflowDataService } from '../../workflow-data.service';
import { IConsultantAnchor, WorkflowProcessWithAnchorsDto } from '../../workflow-period/workflow-period.model';
import { EmploymentTypes } from '../../workflow.model';
import { ClientRateTypes, ConsultantDiallogAction, WorkflowSalesConsultantsForm } from '../workflow-sales.model';

@Component({
	selector: 'app-consultant-data',
	templateUrl: './consultant-data.component.html',
	styleUrls: ['../workflow-sales.component.scss']
})
export class ConsultantDataComponent extends AppComponentBase implements OnInit, OnDestroy {
	@Input() readOnlyMode: boolean;
	@Input() activeSideSection: WorkflowProcessWithAnchorsDto;
    @Input() isCompleted: boolean;
    @Input() editEnabledForcefuly: boolean;

    @Input() clientDataForm: any;
    @Input() mainDataForm: any;
    @Input() clientSpecialRateList: ClientSpecialRateDto[];
    @Input() clientSpecialFeeList: ClientSpecialFeeDto[];

    appEnv = environment;

	workflowSideSections = WorkflowProcessType;
	consultantsForm: WorkflowSalesConsultantsForm;
    clientRateTypes = ClientRateTypes;
	employmentTypesEnum = EmploymentTypes;

    employmentTypes: EnumEntityTypeDto[];
    emagineOffices: EnumEntityTypeDto[];
    expectedWorkloadUnits: EnumEntityTypeDto[];
    consultantTimeReportingCapList: EnumEntityTypeDto[];
    rateUnitTypes: EnumEntityTypeDto[];
    invoiceFrequencies: EnumEntityTypeDto[];
    invoicingTimes: EnumEntityTypeDto[];
    currencies: EnumEntityTypeDto[];
    countries: CountryDto[];
    legalEntities: LegalEntityDto[];
	filteredAccountManagers: EmployeeDto[] = [];
	filteredConsultantClientAddresses: ClientResultDto[] = [];
	filteredConsultantCountries: EnumEntityTypeDto[];
    filteredConsultants: ConsultantWithSourcingRequestResultDto[] = []

    consultantRateToEdit: PeriodConsultantSpecialRateDto;
	isConsultantRateEditing = false;
	consultantFeeToEdit: PeriodConsultantSpecialFeeDto;
	isConsultantFeeEditing = false;

    private _unsubscribe = new Subject();
	constructor(
        injector: Injector,
        private _fb: UntypedFormBuilder,
        private overlay: Overlay,
		private dialog: MatDialog,
        private router: Router,
        private httpClient: HttpClient,
        private localHttpService: LocalHttpService,
        private _workflowDataService: WorkflowDataService,
        private _lookupService: LookupServiceProxy,
        private _internalLookupService: InternalLookupService,
        private _consultantPeriodSerivce: ConsultantPeriodServiceProxy
        ) {
		super(injector);
		this.consultantsForm = new WorkflowSalesConsultantsForm();
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
            employmentTypes: this._internalLookupService.getEmploymentTypes(),
            emagineOffices: this._internalLookupService.getEmagineOfficeList(),
            countries: this._internalLookupService.getCountries(),
            expectedWorkloadUnits: this._internalLookupService.getExpectedWorkloadUnit(),
            consultantTimeReportingCapList: this._internalLookupService.getConsultantTimeReportingCap(),
            legalEntities: this._internalLookupService.getLegalEntities(),
            rateUnitTypes: this._internalLookupService.getUnitTypes(),
            invoiceFrequencies: this._internalLookupService.getInvoiceFrequencies(),
            invoicingTimes: this._internalLookupService.getInvoicingTimes(),
            currencies: this._internalLookupService.getCurrencies()
        })
        .subscribe(result => {
            this.employmentTypes = result.employmentTypes;
            this.emagineOffices = result.emagineOffices;
            this.countries = result.countries;
            this.expectedWorkloadUnits = result.expectedWorkloadUnits;
            this.consultantTimeReportingCapList = result.consultantTimeReportingCapList;
            this.legalEntities = result.legalEntities;
            this.rateUnitTypes = result.rateUnitTypes;
            this.invoiceFrequencies = result.invoiceFrequencies;
            this.invoicingTimes = result.invoicingTimes;
            this.currencies = result.currencies;
        });
    }

    updateConsultantDates(event: MatSelectChange, consultantIndex: number) {
		if (event.value) {
			this.consultants
				.at(consultantIndex)
				.get('consultantProjectStartDate')
				?.setValue(this.clientDataForm.startDate?.value, { emitEvent: false });
			this.consultants
				.at(consultantIndex)
				.get('consultantProjectEndDate')
				?.setValue(this.clientDataForm.endDate?.value, { emitEvent: false });
			this.consultants
				.at(consultantIndex)
				.get('consultantProjectNoEndDate')
				?.setValue(this.clientDataForm.noEndDate?.value, { emitEvent: false });
			if (this.clientDataForm.noEndDate?.value) {
				this.consultants.at(consultantIndex).get('consultantProjectEndDate')?.disable();
			} else {
				this.consultants.at(consultantIndex).get('consultantProjectEndDate')?.enable();
			}
		}
	}

    changeConsultantWorkplace(event: MatCheckboxChange, consultantIndex: number) {
		if (event.checked) {
			this.consultants
				.at(consultantIndex)
				.get('consultantWorkplaceClientAddress')
				?.setValue(this.clientDataForm.directClientIdValue?.value, { emitEvent: false });
		}
	}

	addConsultantForm(consultant?: ConsultantSalesDataDto) {
		let consultantRate = this.findItemById(this.clientRateTypes, 1); // 1: time based
		if (consultant?.consultantRate?.isFixedRate) {
			consultantRate = this.findItemById(this.clientRateTypes, 2); // 2: fixed
		}
		let consultantDto = null;
		if (consultant?.consultantId) {
			consultantDto = new ConsultantWithSourcingRequestResultDto();
			consultantDto.consultant = consultant?.consultant;
			consultantDto.sourcingRequestConsultantId = consultant?.soldRequestConsultantId;
			consultantDto.sourcingRequestId = consultant?.requestId;
		}
		const form = this._fb.group({
			employmentType: new UntypedFormControl(this.findItemById(this.employmentTypes, consultant?.employmentTypeId) ?? null),
			consultantName: new UntypedFormControl(consultantDto ?? null, CustomValidators.autocompleteConsultantValidator()),
			consultantPeriodId: new UntypedFormControl(consultant?.consultantPeriodId ?? null),
			consultantNameOnly: new UntypedFormControl(consultant?.nameOnly ?? null),

			consultantProjectDurationSameAsClient: new UntypedFormControl(consultant?.durationSameAsClientPeriod ?? true),
			consultantProjectStartDate: new UntypedFormControl(consultant?.startDate ?? null),
			consultantProjectEndDate: new UntypedFormControl({
				value: consultant?.endDate ?? null,
				disabled: consultant?.noEndDate,
			}),
			consultantProjectNoEndDate: new UntypedFormControl(consultant?.noEndDate ?? false),

			consultantWorkplace: new UntypedFormControl(null),
			consultantWorkplaceClientAddress: new UntypedFormControl(consultant?.onsiteClient ?? null),
			consultantWorkplaceEmagineOffice: new UntypedFormControl(
				this.findItemById(this.emagineOffices, consultant?.emagineOfficeId) ?? null
			),
			consultantWorkplaceRemote: new UntypedFormControl(
				this.findItemById(this.countries, consultant?.remoteAddressCountryId) ?? null,
				CustomValidators.autocompleteValidator(['id'])
			),
			consultantWorkplacePercentageOnSite: new UntypedFormControl(consultant?.percentageOnSite ?? null, [
				Validators.min(1),
				Validators.max(100),
			]),

			consultantIsOnsiteWorkplace: new UntypedFormControl(consultant?.isOnsiteWorkplace ?? false),
			consultantIsEmagineOfficeWorkplace: new UntypedFormControl(consultant?.isEmagineOfficeWorkplace ?? false),
			consultantIsRemoteWorkplace: new UntypedFormControl(consultant?.isRemoteWorkplace ?? false),

			expectedWorkloadHours: new UntypedFormControl(consultant?.expectedWorkloadHours ?? null),
			expectedWorkloadUnitId: new UntypedFormControl(
				this.findItemById(this.expectedWorkloadUnits, consultant?.expectedWorkloadUnitId) ?? null
			),
			consultantCapOnTimeReporting: new UntypedFormControl(
				this.findItemById(this.consultantTimeReportingCapList, consultant?.consultantTimeReportingCapId ?? 4)
			), // ?? default value = no cap - id:4
			consultantTimeReportingCapMaxValue: new UntypedFormControl(consultant?.consultantTimeReportingCapMaxValue ?? null),
			consultantProdataEntity: new UntypedFormControl(
				this.findItemById(this.legalEntities, consultant?.pdcPaymentEntityId) ?? null
			),
			consultantPaymentType: new UntypedFormControl(consultantRate),
			consultantRate: new UntypedFormControl(consultant?.consultantRate?.normalRate ?? null),
			consultantRateUnitType: new UntypedFormControl(
				this.findItemById(this.rateUnitTypes, consultant?.consultantRate?.rateUnitTypeId) ?? null
			),
			consultantRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, consultant?.consultantRate?.currencyId) ?? null
			),
			consultantPDCRate: new UntypedFormControl(consultant?.consultantRate?.prodataToProdataRate ?? null),
			consultantPDCRateUnitType: new UntypedFormControl(
				this.findItemById(this.rateUnitTypes, consultant?.consultantRate?.rateUnitTypeId) ?? null
			),
			consultantPDCRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, consultant?.consultantRate?.prodataToProdataCurrencyId) ?? null
			),
			consultantInvoicingFrequency: new UntypedFormControl(
				this.findItemById(this.invoiceFrequencies, consultant?.consultantRate?.invoiceFrequencyId) ?? null
			),
			consultantInvoicingTime: new UntypedFormControl(
				this.findItemById(this.invoicingTimes, consultant?.consultantRate?.invoicingTimeId) ?? null
			),
			consultantInvoicingManualDate: new UntypedFormControl(consultant?.consultantRate?.manualDate ?? null),
			prodataToProdataInvoiceCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, consultant?.consultantRate?.prodataToProdataInvoiceCurrencyId) ?? null
			),
			consultantSpecialRateFilter: new UntypedFormControl(''),
			specialRates: new UntypedFormArray([]),
			consultantSpecialFeeFilter: new UntypedFormControl(''),
			specialFees: new UntypedFormArray([]),
            noSpecialPaymentTerms: new UntypedFormControl(consultant?.noSpecialPaymentTerms ?? false),
            specialPaymentTerms: new UntypedFormControl({value: consultant?.specialPaymentTerms ?? null, disabled: consultant?.noSpecialPaymentTerms}),
			consultantSpecialContractTermsNone: new UntypedFormControl(consultant?.noSpecialContractTerms ?? false),
			consultantSpecialContractTerms: new UntypedFormControl({
				value: consultant?.specialContractTerms ?? null,
				disabled: consultant?.noSpecialContractTerms,
			}),
			deliveryManagerSameAsAccountManager: new UntypedFormControl(consultant?.deliveryManagerSameAsAccountManager ?? false),
			deliveryAccountManager: new UntypedFormControl(
				{
					value: consultant?.deliveryAccountManager ?? '',
					disabled: consultant?.deliveryManagerSameAsAccountManager,
				},
				CustomValidators.autocompleteValidator(['id'])
			),
		});
		this.consultants.push(form);
		if (consultant?.periodConsultantSpecialRates?.length) {
			for (let rate of consultant?.periodConsultantSpecialRates) {
				this.addConsultantSpecialRate(this.consultants.length - 1, rate);
			}
		}
		if (consultant?.periodConsultantSpecialFees?.length) {
			for (let fee of consultant?.periodConsultantSpecialFees) {
				this.addConsultantSpecialFee(this.consultants.length - 1, fee);
			}
		}
		this.manageManagerAutocomplete(this.consultants.length - 1);
		this.manageConsultantAutocomplete(this.consultants.length - 1);
		this.manageConsultantClientAddressAutocomplete(this.consultants.length - 1);
		this.manageConsultantCountryAutocomplete(this.consultants.length - 1);
	}

	updateConsultantStepAnchors() {
		let consultantNames: IConsultantAnchor[] = this.consultants.value.map((item: any) => {
            if (item.employmentType?.id === EmploymentTypes.FeeOnly || item.employmentType?.id === EmploymentTypes.Recruitment) {
                return {employmentType: item.employmentType?.id, name: item.consultantNameOnly};
            } else {
                return {employmentType: item.employmentType?.id, name: item.consultantName?.consultant?.name};
            }
        });
		this._workflowDataService.consultantsAddedToStep.emit({
			stepType: StepType.Sales,
			processTypeId: this.activeSideSection.typeId!,
			consultantNames: consultantNames,
		});
		this._workflowDataService.workflowOverviewUpdated.emit(true);
	}

	manageManagerAutocomplete(consultantIndex: number) {
		let arrayControl = this.consultants.at(consultantIndex);
		arrayControl!
			.get('deliveryAccountManager')!
			.valueChanges.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
                startWith(''),
				switchMap((value: any) => {
					let toSend = {
						name: value,
						maxRecordsCount: 1000,
					};
					if (value?.id) {
						toSend.name = value.id ? value.name : value;
					}
					return this._lookupService.employees(value);
				})
			)
			.subscribe((list: EmployeeDto[]) => {
				if (list.length) {
					this.filteredAccountManagers = list;
				} else {
					this.filteredAccountManagers = [
						new EmployeeDto({ name: 'No managers found', externalId: '', id: undefined }),
					];
				}
			});
	}

	manageConsultantClientAddressAutocomplete(consultantIndex: number) {
		let arrayControl = this.consultants.at(consultantIndex);
		arrayControl!
			.get('consultantWorkplaceClientAddress')!
			.valueChanges.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				startWith(''),
				switchMap((value: any) => {
					let toSend = {
						name: value,
						maxRecordsCount: 1000,
					};
					if (value?.id) {
						toSend.name = value.id ? value.clientName : value;
					}
					return this._lookupService.clientsAll(toSend.name, toSend.maxRecordsCount);
				})
			)
			.subscribe((list: ClientResultDto[]) => {
				if (list.length) {
					this.filteredConsultantClientAddresses = list;
				} else {
					this.filteredConsultantClientAddresses = [
						new ClientResultDto({ clientName: 'No records found', clientId: undefined }),
					];
				}
			});
	}

	manageConsultantCountryAutocomplete(consultantIndex: number) {
		let arrayControl = this.consultants.at(consultantIndex);
		arrayControl!
			.get('consultantWorkplaceRemote')!
			.valueChanges.pipe(takeUntil(this._unsubscribe))
			.subscribe((value) => {
				if (typeof value === 'string') {
					this.filteredConsultantCountries = this._filterConsultantCountry(value);
				}
			});
	}

	private _filterConsultantCountry(value: string): CountryDto[] {
		const filterValue = value.toLowerCase();
		const result = this.countries.filter((option) => option.name!.toLowerCase().includes(filterValue));
		return result;
	}

	updateProdataUnitType(event: MatSelectChange, consultantIndex: number) {
		this.consultants.at(consultantIndex).get('consultantPDCRateUnitType')?.setValue(event.value, { emitEvent: false });
	}

	getConsultantRateControls(consultantIndex: number): AbstractControl[] | null {
		return (this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray).controls;
	}

	removeConsutlantRate(consultantIndex: number, specialRateIndex: number) {
		(this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray).removeAt(specialRateIndex);
	}

	editOrSaveConsultantRate(consultantIndex: number, specialRateIndex: number, isEditable: boolean) {
		if (isEditable) {
			this.consultantRateToEdit = new PeriodConsultantSpecialRateDto();
			this.isConsultantRateEditing = false;
		} else {
			const consultantRateValue = (this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray).at(
				specialRateIndex
			).value;
			this.consultantRateToEdit = new PeriodConsultantSpecialRateDto({
				id: consultantRateValue.id,
				clientSpecialRateId: consultantRateValue.clientSpecialRateId,
				rateName: consultantRateValue.rateName,
				reportingUnit: consultantRateValue.reportingUnit,
				prodataToProdataRate: consultantRateValue.prodataToProdataRate,
				prodataToProdataRateCurrencyId: consultantRateValue.prodataToProdataRateCurrency?.id,
				consultantRate: consultantRateValue.consultantRate,
				consultantRateCurrencyId: consultantRateValue.consultantRateCurrency?.id,
			});
			this.isConsultantRateEditing = true;
		}
		(this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray)
			.at(specialRateIndex)
			.get('editable')
			?.setValue(!isEditable, { emitEvent: false });
	}

	cancelEditConsultantRate(consultantIndex: number, specialRateIndex: number) {
		const rateRow = (this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray).at(specialRateIndex);
		rateRow.get('prodataToProdataRate')?.setValue(this.consultantRateToEdit.prodataToProdataRate, {
			emitEvent: false,
		});
		rateRow
			.get('prodataToProdataRateCurrency')
			?.setValue(this.findItemById(this.currencies, this.consultantRateToEdit.prodataToProdataRateCurrencyId), {
				emitEvent: false,
			});
		rateRow.get('consultantRate')?.setValue(this.consultantRateToEdit.consultantRate, {
			emitEvent: false,
		});
		rateRow
			.get('consultantRateCurrency')
			?.setValue(this.findItemById(this.currencies, this.consultantRateToEdit.consultantRateCurrencyId), {
				emitEvent: false,
			});
		this.isConsultantRateEditing = false;
		(this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray)
			.at(specialRateIndex)
			.get('editable')
			?.setValue(false, { emitEvent: false });
	}

	selectConsultantSpecialRate(
		event: any,
		consultantIndex: number,
		rate: ClientSpecialRateDto,
		consultantRateMenuTrigger: MatMenuTrigger
	) {
		event.stopPropagation();
		const consultantRate = new PeriodConsultantSpecialRateDto();
		consultantRate.id = undefined;
		consultantRate.clientSpecialRateId = rate.id;
		consultantRate.rateName = rate.internalName;
		consultantRate.reportingUnit = rate.specialRateReportingUnit;
		consultantRate.rateSpecifiedAs = rate.specialRateSpecifiedAs;
		if (consultantRate.rateSpecifiedAs?.id === 1) {
			consultantRate.prodataToProdataRate = +(
				(this.consultants.at(consultantIndex)!.get('consultantRate')!.value * rate.proDataToProDataRate!) /
				100
			).toFixed(2);
			consultantRate.prodataToProdataRateCurrencyId = this.consultants
				.at(consultantIndex)!
				.get('consultantRateCurrency')!.value?.id;
			consultantRate.consultantRate = +(
				(this.consultants.at(consultantIndex)!.get('consultantRate')!.value * rate.consultantRate!) /
				100
			).toFixed(2);
			consultantRate.consultantRateCurrencyId = this.consultants
				.at(consultantIndex)!
				.get('consultantRateCurrency')!.value?.id;
		} else {
			consultantRate.prodataToProdataRate = rate.proDataToProDataRate;
			consultantRate.prodataToProdataRateCurrencyId = rate.proDataToProDataRateCurrency?.id;
			consultantRate.consultantRate = rate.consultantRate;
			consultantRate.consultantRateCurrencyId = rate.consultantCurrency?.id;
		}
		consultantRateMenuTrigger.closeMenu();
		this.addConsultantSpecialRate(consultantIndex, consultantRate);
	}

	addConsultantSpecialRate(consultantIndex: NumberSymbol, consultantRate?: PeriodConsultantSpecialRateDto) {
		const form = this._fb.group({
			id: new UntypedFormControl(consultantRate?.id ?? null),
			clientSpecialRateId: new UntypedFormControl(consultantRate?.clientSpecialRateId ?? null),
			rateName: new UntypedFormControl(consultantRate?.rateName ?? null),
			reportingUnit: new UntypedFormControl(consultantRate?.reportingUnit ?? null),
			prodataToProdataRate: new UntypedFormControl(consultantRate?.prodataToProdataRate ?? null),
			prodataToProdataRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, consultantRate?.prodataToProdataRateCurrencyId) ?? null
			),
			consultantRate: new UntypedFormControl(consultantRate?.consultantRate ?? null),
			consultantRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, consultantRate?.consultantRateCurrencyId) ?? null
			),
			editable: new UntypedFormControl(false),
		});
		(this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray).push(form);
	}

	getConsultantFeeControls(consultantIndex: number): AbstractControl[] | null {
		return (this.consultants.at(consultantIndex).get('specialFees') as UntypedFormArray).controls;
	}

	removeConsutlantFee(consultantIndex: number, specialFeeIndex: number) {
		(this.consultants.at(consultantIndex).get('specialFees') as UntypedFormArray).removeAt(specialFeeIndex);
	}

	editOrSaveConsultantFee(consultantIndex: number, specialFeeIndex: number, isEditable: boolean) {
		if (isEditable) {
			this.consultantFeeToEdit = new PeriodConsultantSpecialRateDto();
			this.isConsultantFeeEditing = false;
		} else {
			const consultantFeeValue = (this.consultants.at(consultantIndex).get('specialFees') as UntypedFormArray).at(
				specialFeeIndex
			).value;
			this.consultantFeeToEdit = new PeriodConsultantSpecialFeeDto({
				id: consultantFeeValue.id,
				clientSpecialFeeId: consultantFeeValue.clientSpecialFeeId,
				feeName: consultantFeeValue.feeName,
				frequency: consultantFeeValue.frequency,
				prodataToProdataRate: consultantFeeValue.prodataToProdataRate,
				prodataToProdataRateCurrencyId: consultantFeeValue.prodataToProdataRateCurrency?.id,
				consultantRate: consultantFeeValue.consultantRate,
				consultantRateCurrencyId: consultantFeeValue.consultantRateCurrency?.id,
			});
			this.isConsultantFeeEditing = true;
		}
		(this.consultants.at(consultantIndex).get('specialFees') as UntypedFormArray)
			.at(specialFeeIndex)
			.get('editable')
			?.setValue(!isEditable, { emitEvent: false });
	}

	cancelEditConsultantFee(consultantIndex: number, specialFeeIndex: number) {
		const rateRow = (this.consultants.at(consultantIndex).get('specialFees') as UntypedFormArray).at(specialFeeIndex);
		rateRow.get('prodataToProdataRate')?.setValue(this.consultantFeeToEdit.prodataToProdataRate, {
			emitEvent: false,
		});
		rateRow
			.get('prodataToProdataRateCurrency')
			?.setValue(this.findItemById(this.currencies, this.consultantFeeToEdit.prodataToProdataRateCurrencyId), {
				emitEvent: false,
			});
		rateRow.get('consultantRate')?.setValue(this.consultantFeeToEdit.consultantRate, {
			emitEvent: false,
		});
		rateRow
			.get('consultantRateCurrency')
			?.setValue(this.findItemById(this.currencies, this.consultantFeeToEdit.consultantRateCurrencyId), {
				emitEvent: false,
			});
		this.isConsultantFeeEditing = false;
		(this.consultants.at(consultantIndex).get('specialFees') as UntypedFormArray)
			.at(specialFeeIndex)
			.get('editable')
			?.setValue(false, { emitEvent: false });
	}

	selectConsultantSpecialFee(
		event: any,
		consultantIndex: number,
		fee: ClientSpecialFeeDto,
		consultantFeeMenuTrigger: MatMenuTrigger
	) {
		event.stopPropagation();
		const consultantFee = new PeriodConsultantSpecialFeeDto();
		consultantFee.id = undefined;
		consultantFee.clientSpecialFeeId = fee.id;
		consultantFee.feeName = fee.internalName;
		consultantFee.frequency = fee.clientSpecialFeeFrequency;
		consultantFee.prodataToProdataRate = fee.prodataToProdataRate;
		consultantFee.prodataToProdataRateCurrencyId = fee.prodataToProdataRateCurrency?.id;
		consultantFee.consultantRate = fee.consultantRate;
		consultantFee.consultantRateCurrencyId = fee.consultantCurrency?.id;
		consultantFeeMenuTrigger.closeMenu();
		this.addConsultantSpecialFee(consultantIndex, consultantFee);
	}

	addConsultantSpecialFee(consultantIndex: number, consultantFee?: PeriodConsultantSpecialFeeDto) {
		const form = this._fb.group({
			id: new UntypedFormControl(consultantFee?.id ?? null),
			clientSpecialFeeId: new UntypedFormControl(consultantFee?.clientSpecialFeeId ?? null),
			feeName: new UntypedFormControl(consultantFee?.feeName ?? null),
			frequency: new UntypedFormControl(consultantFee?.frequency ?? null),
			prodataToProdataRate: new UntypedFormControl(consultantFee?.prodataToProdataRate ?? null),
			prodataToProdataRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, consultantFee?.prodataToProdataRateCurrencyId) ?? null
			),
			consultantRate: new UntypedFormControl(consultantFee?.consultantRate ?? null),
			consultantRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, consultantFee?.consultantRateCurrencyId) ?? null
			),
			editable: new UntypedFormControl(false),
		});
		(this.consultants.at(consultantIndex).get('specialFees') as UntypedFormArray).push(form);
	}

	manageConsultantAutocomplete(consultantIndex: number) {
		let arrayControl = this.consultants.at(consultantIndex);
		arrayControl!
			.get('consultantName')!
			.valueChanges.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
                startWith(''),
				switchMap((value: any) => {
					let toSend = {
						name: value ? value : '',
						clientId: this.clientDataForm.directClientIdValue!.value?.clientId,
						maxRecordsCount: 1000,
					};
					if (value) {
						toSend.name = value?.consultant?.id ? value.consultant.name : value;
					}
					if (toSend?.clientId) {
						return this._lookupService.consultantsWithSourcingRequest(
							toSend.clientId,
							toSend.name,
							toSend.maxRecordsCount
						);
					} else {
						return of([]);
					}
				})
			)
			.subscribe((list: ConsultantWithSourcingRequestResultDto[]) => {
				if (list.length) {
					this.filteredConsultants = list;
				} else {
					this.filteredConsultants = [
						new ConsultantWithSourcingRequestResultDto({
							consultant: new ConsultantResultDto({ name: 'No consultant found', externalId: '', id: undefined }),
						}),
					];
				}
			});

		arrayControl!
			.get('consultantNameOnly')
			?.valueChanges.pipe(takeUntil(this._unsubscribe), debounceTime(2000))
			.subscribe((value: string) => {
				this.updateConsultantStepAnchors();
			});
	}

	confirmRemoveConsultant(index: number) {
		const consultant = this.consultants.at(index).value;
		const scrollStrategy = this.overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			confirmationMessageTitle: `Delete consultant`,
			confirmationMessage: `Are you sure you want to delete consultant ${
				consultant.consultantName?.consultant?.name ?? ''
			}?\n
                When you confirm the deletion, all the info contained inside this block will disappear.`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Delete',
			isNegative: true,
		};
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe(() => {
			this.removeConsultant(index);
		});
	}

	removeConsultant(index: number) {
		this.consultantsForm.consultants.removeAt(index);
		this.updateConsultantStepAnchors();
	}

	get consultants(): UntypedFormArray {
		return this.consultantsForm.get('consultants') as UntypedFormArray;
	}

    openClientInNewTab(clientId: string) {
		const url = this.router.serializeUrl(this.router.createUrlTree([`/app/clients/${clientId}/rates-and-fees`]));
		window.open(url, '_blank');
	}

	openInHubspot(client: ClientResultDto) {
		if (this._internalLookupService.hubspotClientUrl?.length) {
			if (client.crmClientId !== null && client.crmClientId !== undefined) {
				window.open(
					this._internalLookupService.hubspotClientUrl.replace('{CrmClientId}', client.crmClientId!.toString()),
					'_blank'
				);
			}
		} else {
			this.localHttpService.getTokenPromise().then((response: AuthenticationResult) => {
				this.httpClient
					.get(`${this.apiUrl}/api/Clients/HubspotPartialUrlAsync`, {
						headers: new HttpHeaders({
							Authorization: `Bearer ${response.accessToken}`,
						}),
						responseType: 'text',
					})
					.subscribe((result: string) => {
						this._internalLookupService.hubspotClientUrl = result;
						if (client.crmClientId !== null && client.crmClientId !== undefined) {
							window.open(result.replace('{CrmClientId}', client.crmClientId!.toString()), '_blank');
						}
					});
			});
		}
	}

    changeConsultantData(index: number) {
		const consultantData = this.consultants.at(index).value;
		const scrollStrategy = this.overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			dialogType: ConsultantDiallogAction.Change,
			consultantData: {
				externalId: consultantData.consultantName.consultant.externalId,
				name: consultantData.consultantName.consultant.name,
			},
			dialogTitle: `Change consultant`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Create',
			isNegative: false,
		};
		const dialogRef = this.dialog.open(WorkflowConsultantActionsDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe((result) => {
			let input = new ChangeConsultantPeriodDto();
			input.cutoverDate = result.newCutoverDate;
			input.newLegalContractRequired = result.newLegalContractRequired;
			this._consultantPeriodSerivce
				.change(consultantData.consultantPeriodId, input)
				.pipe(finalize(() => {}))
				.subscribe(() => {
					this._workflowDataService.workflowSideSectionAdded.emit(true);
					this._workflowDataService.workflowOverviewUpdated.emit(true);
				});
		});
	}

	extendConsultant(index: number) {
		const consultantData = this.consultants.at(index).value;
		const scrollStrategy = this.overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			dialogType: ConsultantDiallogAction.Extend,
			consultantData: {
				externalId: consultantData.consultantName.consultant.externalId,
				name: consultantData.consultantName.consultant.name,
			},
			dialogTitle: `Extend consultant`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Create',
			isNegative: false,
		};
		const dialogRef = this.dialog.open(WorkflowConsultantActionsDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe((result) => {
			let input = new ExtendConsultantPeriodDto();
			input.startDate = result.startDate;
			input.endDate = result.endDate;
			input.noEndDate = result.noEndDate;
			this._consultantPeriodSerivce
				.extend(consultantData.consultantPeriodId, input)
				.pipe(finalize(() => {}))
				.subscribe(() => {
					this._workflowDataService.workflowSideSectionAdded.emit(true);
					this._workflowDataService.workflowOverviewUpdated.emit(true);
				});
		});
	}
}
