import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { AuthenticationResult } from '@azure/msal-browser';
import { forkJoin, merge, of, Subject } from 'rxjs';
import { takeUntil, debounceTime, switchMap, startWith } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import { ClientResultDto, ClientSpecialFeeDto, ClientSpecialRateDto, ClientsServiceProxy, ContactResultDto, ContractSignerDto, EnumEntityTypeDto, LegalEntityDto, LookupServiceProxy, PeriodClientSpecialFeeDto, PeriodClientSpecialRateDto, PeriodConsultantSpecialFeeDto, PeriodConsultantSpecialRateDto } from 'src/shared/service-proxies/service-proxies';
import { CustomValidators } from 'src/shared/utils/custom-validators';
import { ClientRateTypes, WorkflowSalesClientDataForm } from '../workflow-sales.model';

@Component({
	selector: 'app-client-data',
	templateUrl: './client-data.component.html',
	styleUrls: ['../workflow-sales.component.scss']
})
export class ClientDataComponent extends AppComponentBase implements OnInit, OnDestroy {
	@Input() readOnlyMode: boolean;
    @Input() clientSpecialRateList: ClientSpecialRateDto[] = [];
	@Input() clientSpecialFeeList: ClientSpecialFeeDto[] = [];
	@Output() onDirectClientSelected: EventEmitter<MatAutocompleteSelectedEvent> = new EventEmitter<MatAutocompleteSelectedEvent>();
	@Output() clientPeriodDatesChanged: EventEmitter<any> = new EventEmitter<any>();
	salesClientDataForm: WorkflowSalesClientDataForm;
	filteredDirectClients: ClientResultDto[];
	filteredEndClients: ClientResultDto[];
	filteredReferencePersons: ContactResultDto[];
	filteredClientInvoicingRecipients: ClientResultDto[];
	filteredEvaluationReferencePersons: ContactResultDto[];
	filteredContractSigners: ContactResultDto[];

	currencies: EnumEntityTypeDto[];
	signerRoles: EnumEntityTypeDto[];
	clientExtensionDurations: EnumEntityTypeDto[];
	clientExtensionDeadlines: EnumEntityTypeDto[];
	legalEntities: LegalEntityDto[];
	rateUnitTypes: EnumEntityTypeDto[];
	invoiceFrequencies: EnumEntityTypeDto[];
	invoicingTimes: EnumEntityTypeDto[];
	clientTimeReportingCap: EnumEntityTypeDto[];
	clientRateTypes = ClientRateTypes;

	clientRateToEdit: PeriodClientSpecialRateDto;
	isClientRateEditing = false;
	clientFeeToEdit: PeriodClientSpecialFeeDto;
	isClientFeeEditing = false;
	clientSpecialRateFilter = new UntypedFormControl('');
	clientSpecialFeeFilter = new UntypedFormControl('');
	private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
		private _fb: UntypedFormBuilder,
		private _lookupService: LookupServiceProxy,
		private _clientService: ClientsServiceProxy,
		private _internalLookupService: InternalLookupService,
		private httpClient: HttpClient,
		private localHttpService: LocalHttpService,
		private router: Router
	) {
		super(injector);
		this.salesClientDataForm = new WorkflowSalesClientDataForm();
	}

	ngOnInit(): void {
		this._getEnums();
        this._subscriptions$();
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	private _getEnums() {
		forkJoin({
			currencies: this._internalLookupService.getCurrencies(),
			legalEntities: this._internalLookupService.getLegalEntities(),
			signerRoles: this._internalLookupService.getSignerRoles(),
			clientExtensionDurations: this._internalLookupService.getExtensionDurations(),
			clientExtensionDeadlines: this._internalLookupService.getExtensionDeadlines(),
			rateUnitTypes: this._internalLookupService.getUnitTypes(),
			invoiceFrequencies: this._internalLookupService.getInvoiceFrequencies(),
			invoicingTimes: this._internalLookupService.getInvoicingTimes(),
			clientTimeReportingCap: this._internalLookupService.getClientTimeReportingCap(),
		}).subscribe((result) => {
			this.currencies = result.currencies;
			this.legalEntities = result.legalEntities;
			this.signerRoles = result.signerRoles;
			this.clientExtensionDurations = result.clientExtensionDurations;
			this.clientExtensionDeadlines = result.clientExtensionDeadlines;
			this.rateUnitTypes = result.rateUnitTypes;
			this.invoiceFrequencies = result.invoiceFrequencies;
			this.invoicingTimes = result.invoicingTimes;
			this.clientTimeReportingCap = result.clientTimeReportingCap;
		});
	}

    private _subscriptions$() {
        this.salesClientDataForm.directClientIdValue?.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
                startWith(''),
				switchMap((value: any) => {
					let toSend = {
						name: value ?? '',
						maxRecordsCount: 1000,
					};
					if (value?.clientId) {
						toSend.name = value.clientId ? value.clientName?.trim() : value?.trim();
					}
					return this._lookupService.clientsAll(toSend.name, toSend.maxRecordsCount);
				})
			)
			.subscribe((list: ClientResultDto[]) => {
				if (list.length) {
					this.filteredDirectClients = list;
				} else {
					this.filteredDirectClients = [
						new ClientResultDto({
							clientName: 'No records found',
							clientId: undefined,
						}),
					];
				}
			});

		this.salesClientDataForm.endClientIdValue?.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
                startWith(''),
				switchMap((value: any) => {
					let toSend = {
						name: value ?? '',
						maxRecordsCount: 1000,
					};
					if (value?.clientId) {
						toSend.name = value.clientId ? value.clientName?.trim() : value?.trim();
					}
					return this._lookupService.clientsAll(toSend.name, toSend.maxRecordsCount);
				})
			)
			.subscribe((list: ClientResultDto[]) => {
				if (list.length) {
					this.filteredEndClients = list;
				} else {
					this.filteredEndClients = [
						new ClientResultDto({
							clientName: 'No records found',
							clientId: undefined,
						}),
					];
				}
			});

		this.salesClientDataForm.invoicePaperworkContactIdValue?.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					let toSend = {
						clientId1: this.salesClientDataForm.directClientIdValue?.value?.clientId,
						clientId2: this.salesClientDataForm.endClientIdValue?.value?.clientId ?? undefined,
						name: value,
						maxRecordsCount: 1000,
					};
					if (value?.id) {
						toSend.name = value.id ? value.firstName : value;
					}
					return this._lookupService.contacts(toSend.clientId1, toSend.clientId2, toSend.name, toSend.maxRecordsCount);
				})
			)
			.subscribe((list: ContactResultDto[]) => {
				if (list.length) {
					this.filteredReferencePersons = list;
				} else {
					this.filteredReferencePersons = [
						new ContactResultDto({ firstName: 'No records found', lastName: '', id: undefined }),
					];
				}
			});

		this.salesClientDataForm.clientInvoicingRecipientIdValue?.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					let toSend = {
						name: value ?? '',
						maxRecordsCount: 1000,
					};
					if (value?.clientId) {
						toSend.name = value.clientId ? value.clientName : value;
					}
					return this._lookupService.clientsAll(toSend.name, toSend.maxRecordsCount);
				})
			)
			.subscribe((list: ClientResultDto[]) => {
				if (list.length) {
					this.filteredClientInvoicingRecipients = list;
				} else {
					this.filteredClientInvoicingRecipients = [
						new ClientResultDto({ clientName: 'No records found', clientId: undefined }),
					];
				}
			});

		this.salesClientDataForm.evaluationsReferencePersonIdValue?.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					if (value) {
						let toSend = {
							clientId1: this.salesClientDataForm.directClientIdValue?.value?.clientId,
							clientId2: this.salesClientDataForm.endClientIdValue?.value?.clientId ?? undefined,
							name: value,
							maxRecordsCount: 1000,
						};
						if (value?.id) {
							toSend.name = value.id ? value.firstName : value;
						}
						return this._lookupService.contacts(
							toSend.clientId1,
							toSend.clientId2,
							toSend.name,
							toSend.maxRecordsCount
						);
					} else {
						return of([]);
					}
				})
			)
			.subscribe((list: ContactResultDto[]) => {
				if (list.length) {
					this.filteredEvaluationReferencePersons = list;
				} else {
					this.filteredEvaluationReferencePersons = [
						new ContactResultDto({ firstName: 'No records found', lastName: '', id: undefined }),
					];
				}
			});

		merge(
			this.salesClientDataForm.startDate!.valueChanges,
			this.salesClientDataForm.endDate!.valueChanges,
			this.salesClientDataForm.noEndDate!.valueChanges
		)
			.pipe(takeUntil(this._unsubscribe), debounceTime(300))
			.subscribe(() => {
				this.clientPeriodDatesChanged.emit();
			});
    }

	clientRateTypeChange(value: EnumEntityTypeDto) {
		if (value.id) {
			this.salesClientDataForm.rateUnitTypeId?.setValue(null, { emitEvent: false });
			this.salesClientDataForm.normalRate?.setValue(null, { emitEvent: false });
			this.salesClientDataForm.clientCurrency?.setValue(null, { emitEvent: false });
		}
	}

	directClientSelected(event: MatAutocompleteSelectedEvent) {
		this.onDirectClientSelected.emit(event);
	}

	getRatesAndFees(clientId: number) {
		this._clientService.specialRatesAll(clientId, false).subscribe((result) => (this.clientSpecialRateList = result));
		this._clientService.specialFeesAll(clientId, false).subscribe((result) => (this.clientSpecialFeeList = result));
	}

	selectClientSpecialRate(event: any, rate: ClientSpecialRateDto, clientRateMenuTrigger: MatMenuTrigger) {
		event.stopPropagation();
		const formattedRate = new PeriodClientSpecialRateDto();
		formattedRate.id = undefined;
		formattedRate.clientSpecialRateId = rate.id;
		formattedRate.rateName = rate.internalName;
		formattedRate.reportingUnit = rate.specialRateReportingUnit;
		formattedRate.rateSpecifiedAs = rate.specialRateSpecifiedAs;
		if (formattedRate.rateSpecifiedAs?.id === 1) {
			formattedRate.clientRate = +((this.salesClientDataForm?.normalRate?.value * rate.clientRate!) / 100).toFixed(2);
			formattedRate.clientRateCurrencyId = this.salesClientDataForm.clientCurrency?.value?.id;
		} else {
			formattedRate.clientRate = rate.clientRate;
			formattedRate.clientRateCurrencyId = rate.clientRateCurrency?.id;
		}
		this.clientSpecialRateFilter.setValue('');
		clientRateMenuTrigger.closeMenu();
		this.addSpecialRate(formattedRate);
	}

	addSpecialRate(clientRate?: PeriodClientSpecialRateDto) {
		const form = this._fb.group({
			id: new UntypedFormControl(clientRate?.id ?? null),
			clientSpecialRateId: new UntypedFormControl(clientRate?.clientSpecialRateId ?? null),
			rateName: new UntypedFormControl(clientRate?.rateName ?? null),
			reportingUnit: new UntypedFormControl(clientRate?.reportingUnit ?? null),
			rateSpecifiedAs: new UntypedFormControl(clientRate?.rateSpecifiedAs ?? null),
			clientRate: new UntypedFormControl(clientRate?.clientRate ?? null),
			clientRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, clientRate?.clientRateCurrencyId) ?? null
			),
			editable: new UntypedFormControl(clientRate ? false : true),
		});
		this.salesClientDataForm.clientRates.push(form);
	}

	removeClientRate(index: number) {
		this.clientRates.removeAt(index);
	}

	editOrSaveSpecialRate(isEditable: boolean, rateIndex: number) {
		if (isEditable) {
			this.clientRateToEdit = new PeriodClientSpecialRateDto();
			this.isClientRateEditing = false;
		} else {
			const clientRateValue = this.clientRates.at(rateIndex).value;
			this.clientRateToEdit = new PeriodClientSpecialRateDto({
				id: clientRateValue.id,
				clientSpecialRateId: clientRateValue.clientSpecialRateId,
				rateName: clientRateValue.rateName,
				reportingUnit: clientRateValue.reportingUnit,
				clientRate: clientRateValue.clientRate,
				clientRateCurrencyId: clientRateValue.clientRateCurrency?.id,
			});
			this.isClientRateEditing = true;
		}
		this.clientRates.at(rateIndex).get('editable')?.setValue(!isEditable, { emitEvent: false });
	}

	cancelEditClientRate(rateIndex: number) {
		const rateRow = this.clientRates.at(rateIndex);
		rateRow.get('clientRate')?.setValue(this.clientRateToEdit.clientRate, { emitEvent: false });
		rateRow
			.get('clientRateCurrency')
			?.setValue(this.findItemById(this.currencies, this.clientRateToEdit.clientRateCurrencyId), { emitEvent: false });
		this.clientRateToEdit = new PeriodClientSpecialFeeDto();
		this.isClientRateEditing = false;
		this.clientRates.at(rateIndex).get('editable')?.setValue(false, { emitEvent: false });
	}

	selectClientSpecialFee(event: any, fee: ClientSpecialFeeDto, clientFeeMenuTrigger: MatMenuTrigger) {
		event.stopPropagation();
		const formattedFee = new PeriodClientSpecialFeeDto();
		formattedFee.id = undefined;
		formattedFee.clientSpecialFeeId = fee.id;
		formattedFee.feeName = fee.internalName;
		formattedFee.frequency = fee.clientSpecialFeeFrequency;
		formattedFee.clientRate = fee.clientRate;
		formattedFee.clientRateCurrencyId = fee.clientRateCurrency?.id;
		this.clientSpecialFeeFilter.setValue('');
		clientFeeMenuTrigger.closeMenu();
		this.addClientFee(formattedFee);
	}

	addClientFee(clientFee?: PeriodClientSpecialFeeDto) {
		const form = this._fb.group({
			id: new UntypedFormControl(clientFee?.id ?? null),
			clientSpecialFeeId: new UntypedFormControl(clientFee?.clientSpecialFeeId ?? null),
			feeName: new UntypedFormControl(clientFee?.feeName ?? null),
			frequency: new UntypedFormControl(clientFee?.frequency ?? null),
			clientRate: new UntypedFormControl(clientFee?.clientRate ?? null),
			clientRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, clientFee?.clientRateCurrencyId) ?? null
			),
			editable: new UntypedFormControl(clientFee ? false : true),
		});
		this.salesClientDataForm.clientFees.push(form);
	}

	removeClientFee(index: number) {
		this.clientFees.removeAt(index);
	}

	editOrSaveClientFee(isEditable: boolean, feeIndex: number) {
		if (isEditable) {
			this.clientFeeToEdit = new PeriodClientSpecialFeeDto();
			this.isClientFeeEditing = false;
		} else {
			const consultantFeeValue = this.clientFees.at(feeIndex).value;
			this.clientFeeToEdit = new PeriodClientSpecialFeeDto({
				id: consultantFeeValue.id,
				clientSpecialFeeId: consultantFeeValue.clientSpecialRateId,
				feeName: consultantFeeValue.rateName,
				frequency: consultantFeeValue.reportingUnit,
				clientRate: consultantFeeValue.proDataRateValue,
				clientRateCurrencyId: consultantFeeValue.proDataRateCurrency?.id,
			});
			this.isClientFeeEditing = true;
		}
		this.clientFees.at(feeIndex).get('editable')?.setValue(!isEditable, { emitEvent: false });
	}

	cancelEditClientFee(feeIndex: number) {
		const feeRow = this.clientFees.at(feeIndex);
		feeRow.get('clientRate')?.setValue(this.clientFeeToEdit.clientRate, { emitEvent: false });
		feeRow
			.get('clientRateCurrencyId')
			?.setValue(this.findItemById(this.currencies, this.clientFeeToEdit.clientRateCurrencyId), { emitEvent: false });
		this.clientFeeToEdit = new PeriodClientSpecialFeeDto();
		this.isClientFeeEditing = false;
		this.clientFees.at(feeIndex).get('editable')?.setValue(false, { emitEvent: false });
	}

	addSignerToForm(signer?: ContractSignerDto) {
		const form = this._fb.group({
			clientContact: new UntypedFormControl(signer?.contact ?? null, CustomValidators.autocompleteValidator(['id'])),
			clientRole: new UntypedFormControl(this.findItemById(this.signerRoles, signer?.signerRoleId) ?? null),
			clientSequence: new UntypedFormControl(signer?.signOrder ?? null),
		});
		this.salesClientDataForm.contractSigners.push(form);
		this.manageSignersContactAutocomplete(this.salesClientDataForm.contractSigners.length - 1);
	}

	manageSignersContactAutocomplete(signerIndex: number) {
		let arrayControl = this.salesClientDataForm.contractSigners.at(signerIndex);
		arrayControl!
			.get('clientContact')!
			.valueChanges.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					let toSend = {
						clientId1: this.salesClientDataForm.directClientIdValue?.value?.clientId,
						clientId2: this.salesClientDataForm.endClientIdValue?.value?.clientId ?? undefined,
						name: value,
						maxRecordsCount: 1000,
					};
					if (value?.id) {
						toSend.name = value.id ? value.firstName : value;
					}
					return this._lookupService.contacts(toSend.clientId1, toSend.clientId2, toSend.name, toSend.maxRecordsCount);
				})
			)
			.subscribe((list: ContactResultDto[]) => {
				if (list.length) {
					this.filteredContractSigners = list;
				} else {
					this.filteredContractSigners = [
						new ContactResultDto({ firstName: 'No records found', lastName: '', id: undefined }),
					];
				}
			});
	}

	removeSigner(index: number) {
		this.contractSigners.removeAt(index);
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

    get clientRates(): UntypedFormArray {
		return this.salesClientDataForm.get('clientRates') as UntypedFormArray;
	}

    get clientFees(): UntypedFormArray {
		return this.salesClientDataForm.get('clientFees') as UntypedFormArray;
	}

    get contractSigners(): UntypedFormArray {
		return this.salesClientDataForm.get('contractSigners') as UntypedFormArray;
	}

}
