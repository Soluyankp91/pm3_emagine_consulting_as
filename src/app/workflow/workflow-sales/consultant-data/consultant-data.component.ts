import { Overlay } from '@angular/cdk/overlay';
import { NumberSymbol } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { AuthenticationResult } from '@azure/msal-browser';
import { of, Subject } from 'rxjs';
import { finalize, takeUntil, debounceTime, switchMap, startWith } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { environment } from 'src/environments/environment';
import { AppComponentBase } from 'src/shared/app-component-base';
import { MediumDialogConfig } from 'src/shared/dialog.configs';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import { ClientResultDto, ClientSpecialFeeDto, ClientSpecialRateDto, ConsultantSalesDataDto, ConsultantWithSourcingRequestResultDto, ConsultantResultDto, CountryDto, EmployeeDto, EnumEntityTypeDto, LegalEntityDto, LookupServiceProxy, PeriodConsultantSpecialFeeDto, PeriodConsultantSpecialRateDto, StepType, WorkflowProcessType, ExtendConsultantPeriodDto, ChangeConsultantPeriodDto, ConsultantPeriodServiceProxy, ClientAddressDto, TimeReportingCapDto, SupplierMemberResultDto, ContractSupplierSignerDto, AgreementSimpleListItemDto, AgreementType, FrameAgreementServiceProxy, AgreementSimpleListItemDtoPaginatedList } from 'src/shared/service-proxies/service-proxies';
import { CustomValidators } from 'src/shared/utils/custom-validators';
import { WorkflowConsultantActionsDialogComponent } from '../../workflow-consultant-actions-dialog/workflow-consultant-actions-dialog.component';
import { WorkflowDataService } from '../../workflow-data.service';
import { IConsultantAnchor, WorkflowProcessWithAnchorsDto } from '../../workflow-period/workflow-period.model';
import { ERateType, EmploymentTypes } from '../../workflow.model';
import { MapClientAddressList, PackAddressIntoNewDto } from '../workflow-sales.helpers';
import { ClientRateTypes, ConsultantDiallogAction, ETimeReportingCaps, IClientAddress, WorkflowSalesClientDataForm, WorkflowSalesConsultantsForm, WorkflowSalesMainForm } from '../workflow-sales.model';
import { MarginType } from '../../shared/components/calculated-margin/calculated-margin.model';

@Component({
	selector: 'app-consultant-data',
	templateUrl: './consultant-data.component.html',
	styleUrls: ['../workflow-sales.component.scss']
})
export class ConsultantDataComponent extends AppComponentBase implements OnInit, OnDestroy {
    @ViewChild('submitFormBtn', { read: ElementRef }) submitFormBtn: ElementRef;
	@Input() readOnlyMode: boolean;
	@Input() activeSideSection: WorkflowProcessWithAnchorsDto;
    @Input() isCompleted: boolean;
    @Input() editEnabledForcefuly: boolean;

    @Input() clientDataForm: WorkflowSalesClientDataForm;
    @Input() mainDataForm: WorkflowSalesMainForm;
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
    consultantTimeReportingCap: EnumEntityTypeDto[];
    rateUnitTypes: EnumEntityTypeDto[];
    invoiceFrequencies: EnumEntityTypeDto[];
    invoicingTimes: EnumEntityTypeDto[];
    currencies: EnumEntityTypeDto[];
    eCurrencies: { [key: number]: string };
    countries: CountryDto[];
    legalEntities: LegalEntityDto[];
    valueUnitTypes: EnumEntityTypeDto[];
    periodUnitTypes: EnumEntityTypeDto[];
	filteredAccountManagers: EmployeeDto[] = [];
	filteredConsultantClientAddresses: ClientResultDto[] = [];
	filteredConsultantCountries: EnumEntityTypeDto[];
    filteredConsultants: ConsultantWithSourcingRequestResultDto[] = []
    signerRoles: EnumEntityTypeDto[];

    consultantRateToEdit: PeriodConsultantSpecialRateDto;
	isConsultantRateEditing = false;
	consultantFeeToEdit: PeriodConsultantSpecialFeeDto;
	isConsultantFeeEditing = false;
    onsiteClientAddresses = new Array<IClientAddress[]>();
    filteredSupplierMembers = new Array(new Array<SupplierMemberResultDto[]>());
    eMarginType = MarginType;
    eTimeReportingCaps = ETimeReportingCaps;
    eRateType = ERateType;
    filteredFrameAgreements = new Array<AgreementSimpleListItemDto[]>();
	filteredEmagineFrameAgreements = new Array<AgreementSimpleListItemDto[]>();
	isContractModuleEnabled = this._workflowDataService.contractModuleEnabled;
	selectedFrameAgreementList = new Array<null | number>();
	selectedEmagineFrameAgreementList = new Array<null | number>();
    private _unsubscribe = new Subject();
    private _supplierMemberUnsubscribe$ = new Subject();
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
        private _consultantPeriodSerivce: ConsultantPeriodServiceProxy,
        private _frameAgreementService: FrameAgreementServiceProxy
        ) {
		super(injector);
		this.consultantsForm = new WorkflowSalesConsultantsForm();
        this._workflowDataService.onDirectClientAddressSelected.pipe(takeUntil(this._unsubscribe)).subscribe(() => {
			this._preselectDirectClientAddress();
		});
	}

	ngOnInit(): void {
        this._getEnums();
    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
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
			this.consultants.at(consultantIndex).get('consultantWorkplaceClientAddress')?.setValue(this.clientDataForm.directClientIdValue?.value);
            this.consultants.at(consultantIndex).get('onsiteClientAddress')?.setValue(this.clientDataForm.directClientAddress?.value);
            this.getClientAddresses(consultantIndex, this.clientDataForm.directClientIdValue.value.clientAddresses);
        }
	}

    getInitialFrameAgreements(consultant: ConsultantSalesDataDto, consultantIndex: number) {
		this.getFrameAgreements(consultant, true).subscribe((result) => {
			this.filteredFrameAgreements[consultantIndex] = result.items;
			if (this.selectedFrameAgreementList[consultantIndex] !== null) {
				this.consultants
					?.at(consultantIndex)
					?.get('frameAgreementId')
					.setValue(this.selectedFrameAgreementList[consultantIndex]);
			} else if (result.totalCount === 1) {
				this._checkAndPreselectFrameAgreement(consultantIndex);
			} else if (result?.totalCount === 0) {
				this.consultants?.at(consultantIndex)?.get('frameAgreementId').setValue('');
			}
		});
	}

    getInitialEmagineFrameAgreements(consultantIndex: number) {
		this.getEmagineFrameAgreements(consultantIndex, true).subscribe((result) => {
			this.filteredEmagineFrameAgreements[consultantIndex] = result.items;
			if (this.selectedEmagineFrameAgreementList[consultantIndex] !== null) {
				this.consultants
					?.at(consultantIndex)
					?.get('emagineFrameAgreementId')
					.setValue(this.selectedEmagineFrameAgreementList[consultantIndex]);
			} else if (result.totalCount === 1) {
				this._checkAndPreselectFrameAgreement(consultantIndex);
			} else if (result?.totalCount === 0) {
				this.consultants?.at(consultantIndex)?.get('emagineFrameAgreementId').setValue('');
			}
		});
	}

	getFrameAgreements(consultant: ConsultantResultDto, isInitial = false, search: string = '') {
		let dataToSend = {
			agreementId: undefined,
			search: search,
			clientId: this.clientDataForm.directClientIdValue.value?.clientId,
			agreementType: AgreementType.Frame,
			validity: undefined,
			legalEntityId: isInitial ? this.clientDataForm.pdcInvoicingEntityId.value : undefined,
			salesTypeId: isInitial ? this.mainDataForm.salesTypeId.value : undefined,
			contractTypeId: undefined,
			deliveryTypeId: isInitial ? this.mainDataForm.deliveryTypeId.value : undefined,
			startDate: undefined,
			endDate: undefined,
			recipientClientIds: [this.clientDataForm.directClientIdValue.value?.clientId, this.clientDataForm.endClientIdValue.value?.clientId].filter(
				Boolean
			),
			recipientConsultantId: consultant?.id,
			recipientSupplierId: consultant?.supplierId,
			pageNumber: 1,
			pageSize: 1000,
			sort: '',
		};
		return this._frameAgreementService.consultantFrameAgreementList(
			dataToSend.agreementId,
			dataToSend.search,
			dataToSend.legalEntityId ?? undefined,
			dataToSend.salesTypeId ?? undefined,
			dataToSend.contractTypeId ?? undefined,
			dataToSend.deliveryTypeId ?? undefined,
			dataToSend.startDate ?? undefined,
			dataToSend.endDate ?? undefined,
			dataToSend.recipientConsultantId || undefined, //recipientConsultantId
			dataToSend.recipientSupplierId || undefined,
			dataToSend.pageNumber,
			dataToSend.pageSize,
			dataToSend.sort
		);
	}

    getEmagineFrameAgreements(consultantIndex: number, isInitial = false, search: string = '') {
        const pdcInvoicingEntityId = this.consultants.at(consultantIndex).get('pdcPaymentEntityId')?.value;
		let dataToSend = {
			agreementId: undefined,
			search: search,
			clientId: this.clientDataForm.directClientIdValue.value?.clientId,
			agreementType: AgreementType.Frame,
			validity: undefined,
			legalEntityId: this.clientDataForm.pdcInvoicingEntityId.value ?? undefined,
			salesTypeId: isInitial ? this.mainDataForm.salesTypeId.value : undefined,
			contractTypeId: undefined,
			deliveryTypeId: isInitial ? this.mainDataForm.deliveryTypeId.value : undefined,
			startDate: undefined,
			endDate: undefined,
			recipientClientIds: [this.clientDataForm.directClientIdValue.value?.clientId, this.clientDataForm.endClientIdValue.value?.clientId].filter(
				Boolean
			),
			recipientLegalEntityId: pdcInvoicingEntityId,
			pageNumber: 1,
			pageSize: 1000,
			sort: '',
		};
		return this._frameAgreementService.emagineToEmagineFrameAgreementList(
			undefined, // dataToSend.agreementId,
			dataToSend.search,
			dataToSend.legalEntityId,
			undefined, // dataToSend.salesTypeId,
			undefined, // dataToSend.contractTypeId,
			undefined, // dataToSend.deliveryTypeId,
			undefined, // dataToSend.startDate,
			undefined, // dataToSend.endDate,
			dataToSend.recipientLegalEntityId, //recipientLegalEntityId
			dataToSend.pageNumber,
			dataToSend.pageSize,
			dataToSend.sort
		);
	}

    pdcEntityChanged(consultantIndex: number) {
        this.consultants.at(consultantIndex).get('emagineFrameAgreementId').setValue('');
    }

	addConsultantForm(consultant?: ConsultantSalesDataDto) {
		let consultantRate = ERateType.TimeBased; // default value
		if (consultant?.consultantRate?.isFixedRate) {
			consultantRate = ERateType.Fixed;
		}
		let consultantDto = null;
		if (consultant?.consultantId) {
			consultantDto = new ConsultantWithSourcingRequestResultDto();
			consultantDto.consultant = consultant?.consultant;
			consultantDto.sourcingRequestConsultantId = consultant?.soldRequestConsultantId;
			consultantDto.sourcingRequestId = consultant?.requestId;
		}
		const form = this._fb.group({
			employmentTypeId: new UntypedFormControl(consultant?.employmentTypeId ?? null),
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
            onsiteClientSameAsDirectClient: new UntypedFormControl(consultant?.onsiteClientSameAsDirectClient ?? false),
            onsiteClientAddress: new UntypedFormControl(PackAddressIntoNewDto(consultant?.onsiteClientAddress) ?? null),
			emagineOfficeId: new UntypedFormControl(consultant?.emagineOfficeId ?? null),
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
			expectedWorkloadUnitId: new UntypedFormControl(consultant?.expectedWorkloadUnitId ?? null),
			consultantTimeReportingCapId: new UntypedFormControl(consultant?.consultantTimeReportingCapId ?? ETimeReportingCaps.NoCap), // default value = no cap - id:4
			pdcPaymentEntityId: new UntypedFormControl(consultant?.pdcPaymentEntityId ?? null),
			consultantRateTypeId: new UntypedFormControl(consultantRate),
			consultantRate: new UntypedFormControl(consultant?.consultantRate?.normalRate ?? null),
			rateUnitTypeId: new UntypedFormControl(consultant?.consultantRate?.rateUnitTypeId ?? null),
			consultantRateCurrencyId: new UntypedFormControl(consultant?.consultantRate?.currencyId ?? null),
			consultantPDCRate: new UntypedFormControl(consultant?.consultantRate?.prodataToProdataRate ?? null),
			consultantPDCRateUnitTypeId: new UntypedFormControl(consultant?.consultantRate?.rateUnitTypeId ?? null),
			consultantPDCRateCurrencyId: new UntypedFormControl(consultant?.consultantRate?.prodataToProdataCurrencyId ?? null),
			consultantInvoicingFrequency: new UntypedFormControl(
				this.findItemById(this.invoiceFrequencies, consultant?.consultantRate?.invoiceFrequencyId) ?? null
			),
			consultantInvoicingTime: new UntypedFormControl(
				this.findItemById(this.invoicingTimes, consultant?.consultantRate?.invoicingTimeId) ?? null
			),
			consultantInvoicingManualDate: new UntypedFormControl(consultant?.consultantRate?.manualDate ?? null),
			prodataToProdataInvoiceCurrencyId: new UntypedFormControl(consultant?.consultantRate?.prodataToProdataInvoiceCurrencyId ?? null),
            timeReportingCaps: new UntypedFormArray([]),
            contractSigners: new UntypedFormArray([]),
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
					value: consultant?.deliveryManagerSameAsAccountManager ? this.mainDataForm.salesAccountManagerIdValue?.value : consultant?.deliveryAccountManager,
					disabled: consultant?.deliveryManagerSameAsAccountManager,
				},
				CustomValidators.autocompleteValidator(['id'])
			),
            frameAgreementId: new UntypedFormControl(consultant?.consultantFrameAgreementId ?? null),
			emagineFrameAgreementId: new UntypedFormControl(consultant?.emagineToEmagineFrameAgreementId ?? null),
		});
		this.consultants.push(form);
        const consultantIndex = this.consultants.controls.length - 1;
        this.onsiteClientAddresses.push([]);
        this.filteredSupplierMembers.push([]);
        this.filteredSupplierMembers[consultantIndex].push([]);
        if (consultant?.onsiteClient?.clientId) {
            this.getClientAddresses(this.consultants.length - 1, consultant?.onsiteClient.clientAddresses);
        }
        if (consultant?.timeReportingCaps?.length) {
            for (let cap of consultant?.timeReportingCaps) {
                this.addConsultantCap(this.consultants.length - 1, cap);
            }
        }
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
        if (consultant?.contractSupplierSigners?.length) {
            for (let signer of consultant?.contractSupplierSigners) {
                this.addSignerToForm(consultantIndex, signer);
            }
        }
        this.filteredFrameAgreements.push([]);
        this.filteredEmagineFrameAgreements.push([]);
        if (consultant) {
            this._initFrameAgreements(consultant?.consultant, consultant.employmentTypeId, consultantIndex);
        }
		this.manageManagerAutocomplete(this.consultants.length - 1);
		this.manageConsultantAutocomplete(this.consultants.length - 1);
		this.manageConsultantClientAddressAutocomplete(this.consultants.length - 1);
		this.manageConsultantCountryAutocomplete(this.consultants.length - 1);
	}

    consultantSelected(event: MatAutocompleteSelectedEvent, consultantIndex) {
        const selectedConsultant = event.option.value as ConsultantWithSourcingRequestResultDto;
        this._initFrameAgreements(selectedConsultant.consultant, this.consultants.at(consultantIndex).get('employmentTypeId')?.value, consultantIndex);
        this.focusToggleMethod('auto');
    }

	updateConsultantStepAnchors() {
		let consultantNames: IConsultantAnchor[] = this.consultants.value.map((item: any) => {
            if (item.employmentTypeId === EmploymentTypes.FeeOnly || item.employmentTypeId === EmploymentTypes.Recruitment) {
                return {employmentType: item.employmentTypeId, name: item.consultantNameOnly};
            } else {
                return {employmentType: item.employmentTypeId, name: item.consultantName?.consultant?.name};
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

    manageFrameAgreementAutocomplete(consultant: ConsultantSalesDataDto, consultantIndex: number) {
		let arrayControl = this.consultants.at(consultantIndex);
		arrayControl!
			.get('frameAgreementId')!
			.valueChanges.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				startWith(''),
				switchMap((value: any) => {
					let toSend = {
						search: value,
						maxRecordsCount: 1000,
					};
					if (value?.agreementId) {
						toSend.search = value.agreementId ? value.agreementName : value;
					}
					return this.getFrameAgreements(consultant, false, toSend.search);
				})
			)
			.subscribe((list: AgreementSimpleListItemDtoPaginatedList) => {
				if (list?.items?.length) {
					this.filteredFrameAgreements[consultantIndex] = list.items;
					if (
						this.selectedFrameAgreementList[consultantIndex] &&
						this.selectedFrameAgreementList[consultantIndex] !== null
					) {
						this.consultants
							.at(consultantIndex)
							.get('frameAgreementId')
							.setValue(
								list.items.find((x) => x.agreementId === this.selectedFrameAgreementList[consultantIndex]),
								{ emitEvent: false }
							);
						this.selectedFrameAgreementList[consultantIndex] = null;
					}
				} else {
					this.filteredFrameAgreements[consultantIndex] = [
						new AgreementSimpleListItemDto({
							agreementName: 'No records found',
							agreementId: undefined,
						}),
					];
				}
			});
	}

    manageEmagineFrameAgreementAutocomplete(consultantIndex: number) {
		let arrayControl = this.consultants.at(consultantIndex);
		arrayControl!
			.get('emagineFrameAgreementId')!
			.valueChanges.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				startWith(''),
				switchMap((value: any) => {
					let toSend = {
						search: value,
						maxRecordsCount: 1000,
					};
					if (value?.agreementId) {
						toSend.search = value.agreementId ? value.agreementName : value;
					}
					return this.getEmagineFrameAgreements(consultantIndex, false, toSend.search);
				})
			)
			.subscribe((list: AgreementSimpleListItemDtoPaginatedList) => {
				if (list?.items?.length) {
					this.filteredEmagineFrameAgreements[consultantIndex] = list.items;
					if (
						this.selectedEmagineFrameAgreementList[consultantIndex] &&
						this.selectedEmagineFrameAgreementList[consultantIndex] !== null
					) {
						this.consultants
							.at(consultantIndex)
							.get('emagineFrameAgreementId')
							.setValue(
								list.items.find((x) => x.agreementId === this.selectedEmagineFrameAgreementList[consultantIndex]),
								{ emitEvent: false }
							);
						this.selectedEmagineFrameAgreementList[consultantIndex] = null;
					}
				} else {
					this.filteredEmagineFrameAgreements[consultantIndex] = [
						new AgreementSimpleListItemDto({
							agreementName: 'No records found',
							agreementId: undefined,
						}),
					];
				}
			});
	}

	private _filterConsultantCountry(value: string): CountryDto[] {
		const filterValue = value.toLowerCase();
		const result = this.countries.filter((option) => option.name!.toLowerCase().includes(filterValue));
		return result;
	}

	updateProdataUnitType(event: MatSelectChange, consultantIndex: number) {
		this.consultants.at(consultantIndex).get('consultantPDCRateUnitTypeId')?.setValue(event.value, { emitEvent: false });
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
				prodataToProdataRateCurrencyId: consultantRateValue.prodataToProdataRateCurrencyId,
				consultantRate: consultantRateValue.consultantRate,
				consultantRateCurrencyId: consultantRateValue.consultantRateCurrencyId,
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
			.get('prodataToProdataRateCurrencyId')
			?.setValue( this.consultantRateToEdit.prodataToProdataRateCurrencyId, {
				emitEvent: false,
			});
		rateRow.get('consultantRate')?.setValue(this.consultantRateToEdit.consultantRate, {
			emitEvent: false,
		});
		rateRow
			.get('consultantRateCurrencyId')
			?.setValue(this.consultantRateToEdit.consultantRateCurrencyId, {
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
				.get('consultantRateCurrencyId')!.value;
			consultantRate.consultantRate = +(
				(this.consultants.at(consultantIndex)!.get('consultantRate')!.value * rate.consultantRate!) /
				100
			).toFixed(2);
			consultantRate.consultantRateCurrencyId = this.consultants
				.at(consultantIndex)!
				.get('consultantRateCurrencyId')!.value;
		} else {
			consultantRate.prodataToProdataRate = rate.proDataToProDataRate;
			consultantRate.prodataToProdataRateCurrencyId = rate.proDataToProDataRateCurrency?.id;
			consultantRate.consultantRate = rate.consultantRate;
			consultantRate.consultantRateCurrencyId = rate.consultantCurrency?.id;
		}
		consultantRateMenuTrigger.closeMenu();
		this.addConsultantSpecialRate(consultantIndex, consultantRate);
	}

	addConsultantSpecialRate(consultantIndex: number, consultantRate?: PeriodConsultantSpecialRateDto) {
		const form = this._fb.group({
			id: new UntypedFormControl(consultantRate?.id ?? null),
			clientSpecialRateId: new UntypedFormControl(consultantRate?.clientSpecialRateId ?? null),
			rateName: new UntypedFormControl(consultantRate?.rateName ?? null),
			reportingUnit: new UntypedFormControl(consultantRate?.reportingUnit ?? null),
			prodataToProdataRate: new UntypedFormControl(consultantRate?.prodataToProdataRate ?? null),
			prodataToProdataRateCurrencyId: new UntypedFormControl( consultantRate?.prodataToProdataRateCurrencyId ?? null),
			consultantRate: new UntypedFormControl(consultantRate?.consultantRate ?? null),
			consultantRateCurrencyId: new UntypedFormControl( consultantRate?.consultantRateCurrencyId ?? null),
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
			this.consultantFeeToEdit = new PeriodConsultantSpecialFeeDto();
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
				prodataToProdataRateCurrencyId: consultantFeeValue.prodataToProdataRateCurrencyId,
				consultantRate: consultantFeeValue.consultantRate,
				consultantRateCurrencyId: consultantFeeValue.consultantRateCurrencyId,
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
			.get('prodataToProdataRateCurrencyId')
			?.setValue( this.consultantFeeToEdit.prodataToProdataRateCurrencyId, {
				emitEvent: false,
			});
		rateRow.get('consultantRate')?.setValue(this.consultantFeeToEdit.consultantRate, {
			emitEvent: false,
		});
		rateRow
			.get('consultantRateCurrencyId')
			?.setValue(this.consultantFeeToEdit.consultantRateCurrencyId, {
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
			prodataToProdataRateCurrencyId: new UntypedFormControl( consultantFee?.prodataToProdataRateCurrencyId ?? null),
			consultantRate: new UntypedFormControl(consultantFee?.consultantRate ?? null),
			consultantRateCurrencyId: new UntypedFormControl(consultantFee?.consultantRateCurrencyId ?? null),
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

    clientOfficeSelected(event: MatAutocompleteSelectedEvent, consultantIndex: number) {
        this.getClientAddresses(consultantIndex, event.option.value?.clientAddresses, true)
        this.focusToggleMethod('auto');
    }

    getClientAddresses(consultantIndex: number, clientAddresses: ClientAddressDto[], clearExistingAddress = false) {
        this.onsiteClientAddresses[consultantIndex] = MapClientAddressList(clientAddresses);
        if (clearExistingAddress) {
            this.consultants.at(consultantIndex).get('onsiteClientAddress').setValue(null);
        }
    }

    getConsultantCapControls(consultantIndex: number) {
        return (this.consultants.at(consultantIndex).get('timeReportingCaps') as UntypedFormArray).controls;
    }

    addConsultantCap(consultantIndex: number, cap?: TimeReportingCapDto) {
		const form = this._fb.group({
            id: new UntypedFormControl(cap?.id?.value ?? null),
			timeReportingCapMaxValue: new UntypedFormControl(cap?.timeReportingCapMaxValue ?? null),
			valueUnitId: new UntypedFormControl(cap?.valueUnitId ?? null),
			periodUnitId: new UntypedFormControl(cap?.periodUnitId ?? null),
		});
		(this.consultants.at(consultantIndex).get('timeReportingCaps') as UntypedFormArray).push(form);
	}

    removeTimeReportingCap(consultantIndex: number, index: number) {
		(this.consultants.at(consultantIndex).get('timeReportingCaps') as UntypedFormArray).removeAt(index);
	}

    capSelectionChange(event: MatSelectChange, consultantIndex: number) {
        if (event.value === ETimeReportingCaps.NoCap) {
            (this.consultants.at(consultantIndex).get('timeReportingCaps') as UntypedFormArray).controls = [];
        }
    }

    submitForm() {
        this.submitFormBtn.nativeElement.click();
    }

    private _getEnums() {
        this.employmentTypes = this.getStaticEnumValue('employmentTypes');
        this.emagineOffices = this.getStaticEnumValue('emagineOffices');
        this.countries = this.getStaticEnumValue('countries');
        this.expectedWorkloadUnits = this.getStaticEnumValue('expectedWorkloadUnits');
        this.consultantTimeReportingCap = this.getStaticEnumValue('consultantTimeReportingCap');
        this.legalEntities = this.getStaticEnumValue('legalEntities');
        this.rateUnitTypes = this.getStaticEnumValue('rateUnitTypes');
        this.invoiceFrequencies = this.getStaticEnumValue('invoiceFrequencies');
        this.invoicingTimes = this.getStaticEnumValue('invoicingTimes');
        this.currencies = this.getStaticEnumValue('currencies');
        this.eCurrencies = this.arrayToEnum(this.currencies);
        this.valueUnitTypes = this.getStaticEnumValue('valueUnitTypes');
        this.periodUnitTypes = this.getStaticEnumValue('periodUnitTypes');
        this.signerRoles = this.getStaticEnumValue('signerRoles');
    }

    getConsultantSignersControls(consultantIndex: number): AbstractControl[] | null {
		return (this.consultants.at(consultantIndex).get('contractSigners') as UntypedFormArray).controls;
	}

    removeConsutlantSigner(consultantIndex: number, signerIndex: number) {
        const contractSigners = (this.consultants.at(consultantIndex).get('contractSigners') as UntypedFormArray);
        contractSigners.removeAt(signerIndex);
        this._supplierMemberUnsubscribe();
        contractSigners.controls.forEach((signer, signerIndex) => {
            this.manageSupplierMemberAutocomplete(consultantIndex, signerIndex);
        })
    }

    addSignerToForm(consultantIndex: number, signer?: ContractSupplierSignerDto) {
        const form = this._fb.group({
			supplierMember: new UntypedFormControl(signer?.supplierMember ?? null, CustomValidators.autocompleteValidator(['id'])),
			signerRoleId: new UntypedFormControl(signer?.signerRoleId ?? null),
			signOrder: new UntypedFormControl(signer?.signOrder ?? null),
		});
		(this.consultants.at(consultantIndex).get('contractSigners') as UntypedFormArray).push(form);
        const signerIndex = (this.consultants.at(consultantIndex).get('contractSigners') as UntypedFormArray).controls.length - 1;
        this.manageSupplierMemberAutocomplete(consultantIndex, signerIndex);
    }

    manageSupplierMemberAutocomplete(consultantIndex: number, signerIndex: number) {
		let arrayControl = (this.consultants.at(consultantIndex).get('contractSigners') as UntypedFormArray).at(signerIndex);
		arrayControl!
			.get('supplierMember')!
			.valueChanges.pipe(
				takeUntil(this._supplierMemberUnsubscribe$),
				debounceTime(300),
                startWith(''),
				switchMap((value: any) => {
					let toSend = {
						name: value,
                        supplierId: this.consultants.at(consultantIndex).get('consultantName').value?.consultant?.supplierId,
						maxRecordsCount: 1000,
					};
                    return this._lookupService.signerSupplierMembers(toSend.name, toSend.supplierId, toSend.maxRecordsCount);
				})
			)
			.subscribe((list: SupplierMemberResultDto[]) => {
				if (list.length) {
					this.filteredSupplierMembers[consultantIndex][signerIndex] = list;
				} else {
					this.filteredSupplierMembers[consultantIndex][signerIndex] = [
						new SupplierMemberResultDto({
							name: 'No supplier member found',
							id: undefined,
						})
					];
				}
			});
	}

    private _preselectDirectClientAddress() {
        this.consultants.controls.forEach(consultant => {
            if (consultant.get('onsiteClientSameAsDirectClient').value) {
                consultant.get('consultantWorkplaceClientAddress')?.setValue(this.clientDataForm.directClientIdValue?.value, { emitEvent: false });
                consultant.get('onsiteClientAddress')?.setValue(this.clientDataForm.directClientAddress?.value, { emitEvent: false });
            }
        });
    }

    private _supplierMemberUnsubscribe() {
        this._supplierMemberUnsubscribe$.next();
        this._supplierMemberUnsubscribe$.complete();
    }

    private _checkAndPreselectFrameAgreement(consultantIndex: number, isEmagineFrameAgreement = false) {
		if (
			this.clientDataForm.directClientIdValue.value?.clientId !== null &&
			this.clientDataForm.directClientIdValue.value?.clientId !== undefined &&
			this.mainDataForm.salesTypeId.value !== null &&
			this.mainDataForm.salesTypeId.value !== undefined &&
			this.mainDataForm.deliveryTypeId.value !== null &&
			this.mainDataForm.deliveryTypeId.value !== undefined
		) {
            if (isEmagineFrameAgreement) {
                if (this.filteredEmagineFrameAgreements[consultantIndex].length === 1) {
                    this.consultants.controls.forEach((form) => {
                        form.get('emagineFrameAgreementId').setValue(this.filteredEmagineFrameAgreements[consultantIndex][0], { emitEvent: false });
                    });
                }
            } else {
                if (this.filteredFrameAgreements[consultantIndex].length === 1) {
                    this.consultants.controls.forEach((form) => {
                        form.get('frameAgreementId').setValue(this.filteredFrameAgreements[consultantIndex][0], { emitEvent: false });
                    });
                }
            }
		}
	}

    private _initFrameAgreements(consultant: ConsultantResultDto, employmentType: number, consultantIndex: number) {
        if (
            employmentType !== EmploymentTypes.FeeOnly &&
            employmentType !== EmploymentTypes.Recruitment
        ) {
            this.manageFrameAgreementAutocomplete(consultant, consultantIndex);
            this.getInitialFrameAgreements(consultant, consultantIndex);
            this.manageEmagineFrameAgreementAutocomplete(consultantIndex);
            this.getInitialEmagineFrameAgreements(consultantIndex);
        }
    }

    get timeReportingCaps(): UntypedFormArray {
		return this.consultantsForm.get('timeReportingCaps') as UntypedFormArray;
	}
}
