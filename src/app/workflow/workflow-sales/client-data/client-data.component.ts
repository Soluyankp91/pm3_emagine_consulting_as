import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { AuthenticationResult } from '@azure/msal-browser';
import { forkJoin, merge, of, Subject } from 'rxjs';
import { takeUntil, debounceTime, switchMap, startWith } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import { MapClientAddressList } from '../workflow-sales.helpers';
import {
	AgreementServiceProxy,
	AgreementSimpleListItemDto,
	AgreementType,
	ClientAddressDto,
	ClientResultDto,
	ClientSpecialFeeDto,
	ClientSpecialRateDto,
	ClientsServiceProxy,
	ContactResultDto,
	ContractSignerDto,
	EnumEntityTypeDto,
	LegalEntityDto,
	LookupServiceProxy,
	PeriodClientSpecialFeeDto,
	PeriodClientSpecialRateDto,
	PurchaseOrderCapType,
	PurchaseOrderDto,
	TimeReportingCapDto,
} from 'src/shared/service-proxies/service-proxies';
import { CustomValidators } from 'src/shared/utils/custom-validators';
import { WorkflowDataService } from '../../workflow-data.service';
import {
	ClientRateTypes,
	EClientSelectionType,
	ETimeReportingCaps,
	IClientAddress,
	WorkflowSalesClientDataForm,
	WorkflowSalesMainForm,
} from '../workflow-sales.model';
import { PurchaseOrdersComponent } from '../../shared/components/purchase-orders/purchase-orders.component';
import { EPurchaseOrderMode } from '../../shared/components/purchase-orders/purchase-orders.model';

@Component({
	selector: 'app-client-data',
	templateUrl: './client-data.component.html',
	styleUrls: ['../workflow-sales.component.scss'],
})
export class ClientDataComponent extends AppComponentBase implements OnInit, OnDestroy {
	@ViewChild('submitFormBtn', { read: ElementRef }) submitFormBtn: ElementRef;
	@ViewChild('poComponent') poComponent: PurchaseOrdersComponent;
	@Input() periodId: string;
	@Input() readOnlyMode: boolean;
	@Input() mainDataForm: WorkflowSalesMainForm;
	@Input() clientSpecialRateList: ClientSpecialRateDto[] = [];
	@Input() clientSpecialFeeList: ClientSpecialFeeDto[] = [];
	@Output() onDirectClientSelected: EventEmitter<MatAutocompleteSelectedEvent> =
		new EventEmitter<MatAutocompleteSelectedEvent>();
	@Output() clientPeriodDatesChanged: EventEmitter<any> = new EventEmitter<any>();
	@Input() isContractModuleEnabled: boolean;
	salesClientDataForm: WorkflowSalesClientDataForm;
	filteredDirectClients: ClientResultDto[];
	filteredEndClients: ClientResultDto[];
	filteredReferencePersons: ContactResultDto[];
	filteredProjectManagers: ContactResultDto[];
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
	frameAgreements: AgreementSimpleListItemDto[];

	directClientAddresses: IClientAddress[];
	endClientAddresses: IClientAddress[];
	invoicingRecipientsAddresses: IClientAddress[];
	eClientSelectionType = EClientSelectionType;
	valueUnitTypes: EnumEntityTypeDto[];
	periodUnitTypes: EnumEntityTypeDto[];

	clientRateToEdit: PeriodClientSpecialRateDto;
	isClientRateEditing = false;
	clientFeeToEdit: PeriodClientSpecialFeeDto;
	isClientFeeEditing = false;
	clientSpecialRateFilter = new UntypedFormControl('');
	clientSpecialFeeFilter = new UntypedFormControl('');
	eTimeReportingCaps = ETimeReportingCaps;
	ePurchaseOrderMode = EPurchaseOrderMode;
	private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
		private _fb: UntypedFormBuilder,
		private _lookupService: LookupServiceProxy,
		private _clientService: ClientsServiceProxy,
		private _internalLookupService: InternalLookupService,
		private _httpClient: HttpClient,
		private _localHttpService: LocalHttpService,
		private _router: Router,
		private _agreementService: AgreementServiceProxy,
		private _workflowDataService: WorkflowDataService
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
			valueUnitTypes: this._internalLookupService.getValueUnitTypes(),
			periodUnitTypes: this._internalLookupService.getPeriodUnitTypes(),
			// capTypes: this._internalLookupService.getPurchaseOrderCapTypes(),
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
			this.valueUnitTypes = result.valueUnitTypes;
			this.periodUnitTypes = result.periodUnitTypes;
			// this.capTypes = result.capTypes;
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
				startWith(''),
				switchMap((value: any) => {
					let toSend = {
						clientIds: [
							this.salesClientDataForm.directClientIdValue?.value?.clientId,
							this.salesClientDataForm.endClientIdValue?.value?.clientId,
						].filter(Boolean),
						name: value,
						maxRecordsCount: 1000,
					};
					if (value?.id) {
						toSend.name = value.id ? value.firstName : value;
					}
					if (toSend.clientIds?.length) {
						return this._lookupService.contacts(toSend.clientIds, toSend.name, toSend.maxRecordsCount);
					} else {
						return of([]);
					}
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

		this.salesClientDataForm.clientContactProjectManager?.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				startWith(''),
				switchMap((value: any) => {
					let toSend = {
						clientIds: [
							this.salesClientDataForm.directClientIdValue?.value?.clientId,
							this.salesClientDataForm.endClientIdValue?.value?.clientId,
						].filter(Boolean),
						name: value,
						maxRecordsCount: 1000,
					};
					if (value?.id) {
						toSend.name = value.id ? value.firstName : value;
					}
					if (toSend.clientIds?.length) {
						return this._lookupService.contacts(toSend.clientIds, toSend.name, toSend.maxRecordsCount);
					} else {
						return of([]);
					}
				})
			)
			.subscribe((list: ContactResultDto[]) => {
				if (list.length) {
					this.filteredProjectManagers = list;
				} else {
					this.filteredProjectManagers = [
						new ContactResultDto({ firstName: 'No records found', lastName: '', id: undefined }),
					];
				}
			});

		this.salesClientDataForm.clientInvoicingRecipientIdValue?.valueChanges
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
				startWith(''),
				switchMap((value: any) => {
					let toSend = {
						clientIds: [
							this.salesClientDataForm.directClientIdValue?.value?.clientId,
							this.salesClientDataForm.endClientIdValue?.value?.clientId,
						].filter(Boolean),
						name: value,
						maxRecordsCount: 1000,
					};
					if (value?.id) {
						toSend.name = value.id ? value.firstName : value;
					}
					if (toSend.clientIds?.length) {
						return this._lookupService.contacts(toSend.clientIds, toSend.name, toSend.maxRecordsCount);
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
				this._checkAndPreselectFrameAgreement();
			});

		this._workflowDataService.preselectFrameAgreement.pipe(takeUntil(this._unsubscribe)).subscribe(() => {
			this._checkAndPreselectFrameAgreement();
		});
	}

	getFrameAgreements(agreementId: number | undefined = undefined, search: string = '') {
		let dataToSend = {
			agreementId: agreementId,
			search: search,
			clientId: this.salesClientDataForm.directClientIdValue.value?.clientId,
			agreementType: AgreementType.Frame,
			validity: undefined,
			legalEntityId: this.salesClientDataForm.pdcInvoicingEntityId.value ?? undefined,
			salesTypeId: this.mainDataForm.salesTypeId.value ?? undefined,
			contractTypeId: undefined,
			deliveryTypeId: this.mainDataForm.deliveryTypeId.value ?? undefined,
			startDate: this.salesClientDataForm.startDate.value ?? undefined,
			endDate: this.salesClientDataForm.endDate.value ? this.salesClientDataForm.endDate.value : undefined,
			pageNumber: 1,
			pageSize: 1000,
			sort: '',
		};
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
			});
	}

	private _checkAndPreselectFrameAgreement() {
		if (
			this.salesClientDataForm.startDate.value &&
			(this.salesClientDataForm.endDate.value || this.salesClientDataForm.noEndDate.value) &&
			this.salesClientDataForm.directClientIdValue.value &&
			this.mainDataForm.salesTypeId.value &&
			this.mainDataForm.deliveryTypeId.value
		) {
			if (this.frameAgreements?.length === 1) {
				this.salesClientDataForm.frameAgreementId.setValue(this.frameAgreements[0].agreementId, { emitEvent: false });
			}
		}
	}

	clientRateTypeChange(value: EnumEntityTypeDto) {
		if (value.id) {
			this.salesClientDataForm.rateUnitTypeId?.setValue(null, { emitEvent: false });
			this.salesClientDataForm.normalRate?.setValue(null, { emitEvent: false });
			this.salesClientDataForm.clientCurrency?.setValue(null, { emitEvent: false });
		}
	}

	directClientSelected(event: MatAutocompleteSelectedEvent) {
		this.initContactSubs();
		this.getClientAddresses(event.option.value?.clientAddresses, EClientSelectionType.DirectClient);
		this.onDirectClientSelected.emit(event);
	}

	clientSelected(event: MatAutocompleteSelectedEvent, clientType: EClientSelectionType) {
		this.getClientAddresses(event.option.value?.clientAddresses, clientType);
		this.focusToggleMethod('auto');
	}

	getClientAddresses(clientAddresses: ClientAddressDto[], clientType: EClientSelectionType) {
		switch (clientType) {
			case EClientSelectionType.DirectClient:
				this.directClientAddresses = MapClientAddressList(clientAddresses);
				break;
			case EClientSelectionType.EndClient:
				this.endClientAddresses = MapClientAddressList(clientAddresses);
				break;
			case EClientSelectionType.InvoicingRecipient:
				this.invoicingRecipientsAddresses = MapClientAddressList(clientAddresses);
				break;
		}
	}

	initContactSubs() {
		this.salesClientDataForm.clientContactProjectManager.setValue('');
		this.salesClientDataForm.invoicePaperworkContactIdValue.setValue('');
		this.salesClientDataForm.evaluationsReferencePersonIdValue.setValue('');
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
		const form = this._fb.group(
			{
				clientContact: new UntypedFormControl(signer?.contact ?? null, CustomValidators.autocompleteValidator(['id'])),
				signerRoleId: new UntypedFormControl(signer?.signerRoleId ?? null),
				clientSequence: new UntypedFormControl(signer?.signOrder ?? null),
			},
			{ updateOn: 'submit' }
		);
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
				startWith(''),
				switchMap((value: any) => {
					let toSend = {
						clientIds: [
							this.salesClientDataForm.directClientIdValue?.value?.clientId,
							this.salesClientDataForm.endClientIdValue?.value?.clientId,
						].filter(Boolean),
						name: value,
						maxRecordsCount: 1000,
					};
					if (value?.id) {
						toSend.name = value.id ? value.firstName : value;
					}
					if (toSend.clientIds?.length) {
						return this._lookupService.contacts(toSend.clientIds, toSend.name, toSend.maxRecordsCount);
					} else {
						return of([]);
					}
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
		const url = this._router.serializeUrl(this._router.createUrlTree([`/app/clients/${clientId}/rates-and-fees`]));
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
			this._localHttpService.getTokenPromise().then((response: AuthenticationResult) => {
				this._httpClient
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

	addTimeReportingCap(cap?: TimeReportingCapDto) {
		const form = this._fb.group({
			id: new UntypedFormControl(cap?.id?.value ?? null),
			timeReportingCapMaxValue: new UntypedFormControl(cap?.timeReportingCapMaxValue ?? null),
			valueUnitId: new UntypedFormControl(cap?.valueUnitId ?? null),
			periodUnitId: new UntypedFormControl(cap?.periodUnitId ?? null),
		});
		this.salesClientDataForm.timeReportingCaps.push(form);
	}

	removeTimeReportingCap(index: number) {
		this.timeReportingCaps.removeAt(index);
	}

	capSelectionChange(event: MatSelectChange) {
		if (event.value === ETimeReportingCaps.NoCap || event.value === ETimeReportingCaps.IndividualCap) {
			this.timeReportingCaps.controls = [];
		}
	}

	submitForm() {
		this.submitFormBtn.nativeElement.click();
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

	get timeReportingCaps(): UntypedFormArray {
		return this.salesClientDataForm.get('timeReportingCaps') as UntypedFormArray;
	}
}
