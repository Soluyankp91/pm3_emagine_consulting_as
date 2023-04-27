import { Overlay } from '@angular/cdk/overlay';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationResult } from '@azure/msal-browser';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { of, Subject } from 'rxjs';
import { debounceTime, finalize, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { environment } from 'src/environments/environment';
import { AppComponentBase, NotifySeverity } from 'src/shared/app-component-base';
import { MediumDialogConfig } from 'src/shared/dialog.configs';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import {
	ClientPeriodSalesDataCommandDto,
	ClientPeriodServiceProxy,
	ClientRateDto,
	CommissionDto,
	ConsultantRateDto,
	ConsultantSalesDataDto,
	ContractSignerDto,
	EnumEntityTypeDto,
	LookupServiceProxy,
	PeriodClientSpecialFeeDto,
	PeriodClientSpecialRateDto,
	SalesClientDataDto,
	SalesMainDataDto,
	WorkflowProcessType,
	WorkflowServiceProxy,
	ConsultantResultDto,
	ClientResultDto,
	ContactResultDto,
	ConsultantTerminationSalesDataCommandDto,
	WorkflowTerminationSalesDataCommandDto,
	PeriodConsultantSpecialFeeDto,
	PeriodConsultantSpecialRateDto,
	ClientSpecialRateDto,
	ClientsServiceProxy,
	ClientSpecialFeeDto,
	ConsultantPeriodServiceProxy,
	ConsultantPeriodSalesDataDto,
	EmployeeDto,
    WorkflowDocumentCommandDto,
    WorkflowDocumentServiceProxy,
    TimeReportingCapDto,
    TimeReportingCapId,
} from 'src/shared/service-proxies/service-proxies';
import { DocumentsComponent } from '../shared/components/wf-documents/wf-documents.component';
import { SalesTypes } from '../workflow-contracts/workflow-contracts.model';
import { WorkflowDataService } from '../workflow-data.service';
import { EPermissions } from '../workflow-details/workflow-details.model';
import { WorkflowProcessWithAnchorsDto } from '../workflow-period/workflow-period.model';
import { ERateType, EmploymentTypes } from '../workflow.model';
import { ClientDataComponent } from './client-data/client-data.component';
import { ConsultantDataComponent } from './consultant-data/consultant-data.component';
import { MainDataComponent } from './main-data/main-data.component';
import { FindClientAddress, PackAddressIntoNewDto } from './workflow-sales.helpers';
import { ClientRateTypes, EClientSelectionType, EProjectTypes, SalesTerminateConsultantForm } from './workflow-sales.model';

@Component({
	selector: 'app-workflow-sales',
	templateUrl: './workflow-sales.component.html',
	styleUrls: ['./workflow-sales.component.scss'],
})
export class WorkflowSalesComponent extends AppComponentBase implements OnInit, OnDestroy {
	@ViewChild('mainDataComponent', { static: false }) mainDataComponent: MainDataComponent;
	@ViewChild('clientDataComponent', { static: false }) clientDataComponent: ClientDataComponent;
	@ViewChild('consutlantDataComponent', { static: false }) consutlantDataComponent: ConsultantDataComponent;
	@ViewChild('terminationDocuments', { static: false }) terminationDocuments: DocumentsComponent;
	@ViewChild('submitFormBtn', { static: false, read: ElementRef }) submitFormBtn: ElementRef;

	@Input() workflowId: string;
	@Input() periodId: string | undefined;
	@Input() consultant: ConsultantResultDto;
	@Input() activeSideSection: WorkflowProcessWithAnchorsDto;
	@Input() isCompleted: boolean;
	@Input() permissionsForCurrentUser: { [key: string]: boolean } | undefined;

	editEnabledForcefuly = false;
	workflowSideSections = WorkflowProcessType;
	salesTerminateConsultantForm: SalesTerminateConsultantForm;

	currencies: EnumEntityTypeDto[] = [];
	invoicingTimes: EnumEntityTypeDto[] = [];
	invoiceFrequencies: EnumEntityTypeDto[] = [];
	terminationTimes: { [key: string]: string };
	terminationReasons: { [key: string]: string };

	clientRateTypes = ClientRateTypes;
	filteredFinalEvaluationReferencePersons: any[] = [];
	clientSpecialRateList: ClientSpecialRateDto[] = [];
	clientSpecialFeeList: ClientSpecialFeeDto[] = [];

	individualConsultantActionsAvailable: boolean;
	appEnv = environment;
    isContractModuleEnabled = this._workflowDataService.contractModuleEnabled;
    eStepPermission = EPermissions;

	private _unsubscribe = new Subject();

	constructor(
		injector: Injector,
		private _workflowDataService: WorkflowDataService,
		private activatedRoute: ActivatedRoute,
		private overlay: Overlay,
		private dialog: MatDialog,
		private router: Router,
		private _internalLookupService: InternalLookupService,
		private _lookupService: LookupServiceProxy,
		private _clientPeriodService: ClientPeriodServiceProxy,
		private _workflowServiceProxy: WorkflowServiceProxy,
		private _clientService: ClientsServiceProxy,
		private _consultantPeriodSerivce: ConsultantPeriodServiceProxy,
		private httpClient: HttpClient,
		private localHttpService: LocalHttpService,
		private _scrollToService: ScrollToService,
		private _workflowDocumentsService: WorkflowDocumentServiceProxy
	) {
		super(injector);
		this.salesTerminateConsultantForm = new SalesTerminateConsultantForm();

		this.salesTerminateConsultantForm.finalEvaluationReferencePerson?.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				startWith(''),
				switchMap((value: any) => {
					let toSend = {
						clientIds: [
							this.salesTerminateConsultantForm.directClientId?.value,
							this.salesTerminateConsultantForm.endClientId?.value,
						].filter(Boolean),
						name: value ?? '',
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
					this.filteredFinalEvaluationReferencePersons = list;
				} else {
					this.filteredFinalEvaluationReferencePersons = [
						{ firstName: 'No records found', lastName: '', id: 'no-data' },
					];
				}
			});
	}

	ngOnInit(): void {
		this.activatedRoute.parent.paramMap.pipe(takeUntil(this._unsubscribe)).subscribe((params) => {
			this.workflowId = params.get('id')!;
		});
		this._workflowDataService.updateWorkflowProgressStatus({
			currentStepIsCompleted: this.isCompleted,
			currentStepIsForcefullyEditing: this.editEnabledForcefuly,
		});
		this._getEnums();
		this.getSalesStepData();

        this._workflowDataService.salesStepSaved
            .pipe(takeUntil(this._unsubscribe)).subscribe((isDraft: boolean) => {
                if (isDraft && !this.editEnabledForcefuly) {
                    this.saveSalesStep(isDraft);
                } else {
                    if (this.validateSalesForm()) {
                        this.saveSalesStep(isDraft);
                    } else {
                        this.scrollToFirstError(isDraft);
                    }
                }
            });

		this._workflowDataService.workflowSideSectionChanged
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((value: { consultant?: ConsultantResultDto | undefined; consultantPeriodId?: string | undefined }) => {
				this.editEnabledForcefuly = false;
				this.getSalesStepData(value?.consultant, value?.consultantPeriodId);
			});

		this._workflowDataService.cancelForceEdit.pipe(takeUntil(this._unsubscribe)).subscribe(() => {
			this.isCompleted = true;
			this.editEnabledForcefuly = false;
			this._workflowDataService.updateWorkflowProgressStatus({
				currentStepIsCompleted: this.isCompleted,
				currentStepIsForcefullyEditing: this.editEnabledForcefuly,
			});
			this.getSalesStepData();
		});

		this._workflowDataService.resetStepState
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((value: { isCompleted: boolean; editEnabledForcefuly: boolean; fetchData: boolean }) => {
				this.isCompleted = value.isCompleted;
				this.editEnabledForcefuly = value.editEnabledForcefuly;
				this._workflowDataService.updateWorkflowProgressStatus({
					currentStepIsCompleted: this.isCompleted,
					currentStepIsForcefullyEditing: this.editEnabledForcefuly,
				});
				if (value.fetchData) {
					this.getSalesStepData();
				}
			});

		this.individualConsultantActionsAvailable = environment.dev;
	}

	validateSalesForm() {
		this.clientDataComponent?.submitForm();
		this.clientDataComponent?.salesClientDataForm.markAllAsTouched();
		this.mainDataComponent?.submitForm();
		this.mainDataComponent?.salesMainDataForm.markAllAsTouched();
		this.consutlantDataComponent?.submitForm();
		this.consutlantDataComponent?.consultantsForm.markAllAsTouched();
		this.submitSalesTerminationForm();
		this.salesTerminateConsultantForm.markAllAsTouched();
		switch (this.activeSideSection.typeId) {
			case WorkflowProcessType.StartClientPeriod:
			case WorkflowProcessType.ChangeClientPeriod:
			case WorkflowProcessType.ExtendClientPeriod:
			case WorkflowProcessType.StartConsultantPeriod:
			case WorkflowProcessType.ChangeConsultantPeriod:
			case WorkflowProcessType.ExtendConsultantPeriod:
				return (
					this.clientDataComponent?.salesClientDataForm.valid &&
					this.mainDataComponent?.salesMainDataForm.valid &&
					this.consutlantDataComponent?.consultantsForm.valid
				);
			case WorkflowProcessType.TerminateWorkflow:
			case WorkflowProcessType.TerminateConsultant:
				return this.salesTerminateConsultantForm.valid;
		}
	}

	scrollToFirstError(isDraft: boolean) {
		setTimeout(() => {
			let firstError = document.getElementsByClassName('mat-form-field-invalid')[0] as HTMLElement;
			if (firstError) {
				let config: ScrollToConfigOptions = {
					target: firstError,
					offset: -115,
				};
				this._scrollToService.scrollTo(config);
			} else {
				this.saveSalesStep(isDraft);
			}
		}, 0);
	}

	saveSalesStep(isDraft: boolean) {
		switch (this._workflowDataService.workflowProgress.currentlyActiveSideSection) {
			case WorkflowProcessType.StartClientPeriod:
			case WorkflowProcessType.ChangeClientPeriod:
			case WorkflowProcessType.ExtendClientPeriod:
				this.saveStartChangeOrExtendClientPeriodSales(isDraft);
				break;
			case WorkflowProcessType.TerminateWorkflow:
				this.saveWorkflowTerminationSalesStep(isDraft);
				break;
			case WorkflowProcessType.TerminateConsultant:
				this.saveTerminationConsultantSalesStep(isDraft);
				break;
			case WorkflowProcessType.StartConsultantPeriod:
			case WorkflowProcessType.ChangeConsultantPeriod:
			case WorkflowProcessType.ExtendConsultantPeriod:
				this.saveStartChangeOrExtendConsultantPeriodSales(isDraft);
				break;
		}
	}

	toggleEditMode() {
		this.isCompleted = !this.isCompleted;
		this.editEnabledForcefuly = !this.editEnabledForcefuly;
		this._workflowDataService.updateWorkflowProgressStatus({
			currentStepIsCompleted: this.isCompleted,
			currentStepIsForcefullyEditing: this.editEnabledForcefuly,
		});
		this.getSalesStepData();
	}

	clientPeriodDatesChanged() {
		for (let consultant of this.consutlantDataComponent?.consultants.controls) {
			if (consultant.get('consultantProjectDurationSameAsClient')!.value) {
				consultant
					.get('consultantProjectStartDate')
					?.setValue(this.clientDataComponent?.salesClientDataForm.startDate?.value, { emitEvent: false });
				consultant
					.get('consultantProjectEndDate')
					?.setValue(this.clientDataComponent?.salesClientDataForm.endDate?.value, { emitEvent: false });
				consultant
					.get('consultantProjectNoEndDate')
					?.setValue(this.clientDataComponent?.salesClientDataForm.noEndDate?.value, { emitEvent: false });
				if (this.clientDataComponent?.salesClientDataForm.noEndDate?.value) {
					consultant.get('consultantProjectEndDate')?.disable();
				} else {
					consultant.get('consultantProjectEndDate')?.enable();
				}
			}
		}
	}

	directClientSelected(event: MatAutocompleteSelectedEvent) {
		this.clientDataComponent?.salesClientDataForm.clientInvoicingRecipientIdValue?.setValue(event.option.value, {
			emitEvent: false,
		});
		this.clientDataComponent.getClientAddresses(event.option.value?.clientAddresses, EClientSelectionType.InvoicingRecipient);
		this._tryPreselectFrameAgreement();
		this.getRatesAndFees(event.option.value?.clientId);
		this.focusToggleMethod('auto');
	}

	getRatesAndFees(clientId: number) {
		this._clientService.specialRatesAll(clientId, false).subscribe((result) => (this.clientSpecialRateList = result));
		this._clientService.specialFeesAll(clientId, false).subscribe((result) => (this.clientSpecialFeeList = result));
	}

	private _tryPreselectFrameAgreement() {
		if (
			this.clientDataComponent?.salesClientDataForm.startDate.value &&
			(this.clientDataComponent?.salesClientDataForm.endDate.value ||
				this.clientDataComponent?.salesClientDataForm.noEndDate.value) &&
			this.clientDataComponent?.salesClientDataForm.directClientIdValue.value &&
			this.mainDataComponent.salesMainDataForm.salesTypeId.value &&
			this.mainDataComponent.salesMainDataForm.deliveryTypeId.value
		) {
			this._workflowDataService.preselectFrameAgreement.emit();
		}
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	saveStartChangeOrExtendClientPeriodSales(isDraft: boolean) {
		let input = this._packClientPeriodData();
		this.showMainSpinner();
		if (isDraft) {
			this._clientPeriodService
				.clientSalesPUT(this.periodId!, input)
				.pipe(
					finalize(() => {
						this._tempUpdateDocuments();
						this.hideMainSpinner();
					})
				)
				.subscribe(() => {
					this.showNotify(NotifySeverity.Success, 'Saved sales step', 'Ok');
					this._workflowDataService.workflowTopSectionUpdated.emit();
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					if (this.editEnabledForcefuly) {
						this.toggleEditMode();
					}
				});
		} else {
			this._clientPeriodService
				.editFinish(this.periodId!, input)
				.pipe(
					finalize(() => {
						this._tempUpdateDocuments();
						this.hideMainSpinner();
					})
				)
				.subscribe(() => {
					this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					this.getSalesStepData();
				});
		}
	}

	getStartChangeOrExtendClientPeriodSales() {
		this.showMainSpinner();
		this._clientPeriodService
			.clientSalesGET(this.periodId!)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this.resetForms();
				this.mainDataComponent?.salesMainDataForm.patchValue(result?.salesMainData!, { emitEvent: false });
				result.salesMainData?.commissions?.forEach((commission: CommissionDto) => {
					this.mainDataComponent?.addCommission(false, commission);
				});
				this.mainDataComponent?.salesMainDataForm.discountId?.setValue(result?.salesMainData?.discountId ?? 1, {
					emitEvent: false,
				}); // 1 - default value 'None'
				this.mainDataComponent?.salesMainDataForm.salesAccountManagerIdValue?.setValue(
					result?.salesMainData?.salesAccountManagerData,
					{
						emitEvent: false,
					}
				);
				this.mainDataComponent?.salesMainDataForm.commissionAccountManagerIdValue?.setValue(
					result?.salesMainData?.commissionAccountManagerData,
					{ emitEvent: false }
				);
                this.mainDataComponent?.salesMainDataForm.primarySourcer?.setValue(
					result?.salesMainData?.primarySourcer,
					{ emitEvent: false }
				);
				let expirationNotificationIntervals = new Array<number>(...result.salesMainData?.contractExpirationNotificationIntervalIds);
				if (
					result?.salesMainData?.customContractExpirationNotificationDate !== null &&
					result?.salesMainData?.customContractExpirationNotificationDate !== undefined
				) {
					expirationNotificationIntervals!.push(999);
				}
				this.mainDataComponent?.salesMainDataForm.contractExpirationNotification?.setValue(
					expirationNotificationIntervals,
					{
						emitEvent: false,
					}
				);
				if (result?.salesMainData?.noRemarks) {
					this.mainDataComponent?.salesMainDataForm.remarks?.disable({
						emitEvent: false,
					});
				}
				if (result?.workflowDocuments?.length) {
					this.mainDataComponent.mainDocuments?.addExistingFile(result.workflowDocuments);
				}
				this.clientDataComponent?.salesClientDataForm.patchValue(result, { emitEvent: false });
				this.clientDataComponent?.salesClientDataForm.patchValue(result.salesClientData!, { emitEvent: false });
				this.clientDataComponent?.salesClientDataForm.differentEndClient?.setValue(
					result.salesClientData?.differentEndClient ?? false,
					{
						emitEvent: false,
					}
				); // default value if false
				this.clientDataComponent?.salesClientDataForm.directClientIdValue?.setValue(
					result?.salesClientData?.directClient,
					{
						emitEvent: false,
					}
				);
				if (result?.salesClientData?.timeReportingCaps?.length) {
					for (let cap of result?.salesClientData?.timeReportingCaps) {
						this.clientDataComponent.addTimeReportingCap(cap);
					}
				}
				if (result?.salesClientData?.directClient?.clientId) {
					this.getRatesAndFees(result?.salesClientData?.directClient?.clientId);
					this.clientDataComponent.initContactSubs();
					this.clientDataComponent.getClientAddresses(
						result?.salesClientData?.directClient?.clientAddresses,
						EClientSelectionType.DirectClient
					);
				}
				if (result?.salesClientData?.directClientAddressId) {
					this.clientDataComponent.salesClientDataForm.directClientAddress.setValue(
						PackAddressIntoNewDto(result?.salesClientData?.directClientAddress),
						{ emitEvent: false }
					);
				}
				this.clientDataComponent?.salesClientDataForm.endClientIdValue?.setValue(result?.salesClientData?.endClient, {
					emitEvent: false,
				});
				if (result?.salesClientData?.endClient?.clientId) {
					this.clientDataComponent.getClientAddresses(
						result?.salesClientData?.endClient?.clientAddresses,
						EClientSelectionType.EndClient
					);
				}
				if (result?.salesClientData?.endClientAddressId) {
					this.clientDataComponent.salesClientDataForm.endClientAddress.setValue(
						PackAddressIntoNewDto(result?.salesClientData?.endClientAddress),
						{ emitEvent: false }
					);
				}
				if (result?.salesClientData?.clientInvoicingRecipient?.clientId) {
					this.clientDataComponent.getClientAddresses(
						result?.salesClientData?.clientInvoicingRecipient?.clientAddresses,
						EClientSelectionType.InvoicingRecipient
					);
				}
				if (result?.salesClientData?.clientInvoicingRecipientAddressId) {
					this.clientDataComponent.salesClientDataForm.clientInvoicingRecipientAddress.setValue(
						PackAddressIntoNewDto(result?.salesClientData?.clientInvoicingRecipientAddress),
						{ emitEvent: false }
					);
				}
				this.clientDataComponent?.salesClientDataForm.clientContactProjectManager.setValue(
					result.salesClientData.clientContactProjectManager
				);
				if (result?.noEndDate) {
					this.clientDataComponent?.salesClientDataForm.endDate?.disable({
						emitEvent: false,
					});
				}
				this.clientDataComponent?.salesClientDataForm.noClientExtensionOption?.setValue(
					result?.salesClientData?.noClientExtensionOption ?? true,
					{ emitEvent: false }
				); // no topion - default value
				this.clientDataComponent?.salesClientDataForm.clientTimeReportingCapId?.setValue(
					result?.salesClientData?.clientTimeReportingCapId ?? 1,
					{ emitEvent: false }
				); // default idValue = 1
				let clientRateType = ERateType.TimeBased; // default value
				if (result.salesClientData?.clientRate?.isFixedRate) {
					clientRateType = ERateType.Fixed;
				} else if (result.salesClientData?.clientRate?.isTimeBasedRate) {
					clientRateType = ERateType.TimeBased;
				}
				this.clientDataComponent?.salesClientDataForm.clientRateTypeId?.setValue(clientRateType, {
					emitEVent: false,
				});
				this.clientDataComponent?.salesClientDataForm.normalRate?.setValue(
					result.salesClientData?.clientRate?.normalRate,
					{
						emitEVent: false,
					}
				);
				this.clientDataComponent?.salesClientDataForm.rateUnitTypeId?.setValue(
					result.salesClientData?.clientRate?.rateUnitTypeId,
					{
						emitEVent: false,
					}
				);
				this.clientDataComponent?.salesClientDataForm.clientCurrencyId?.setValue(result.salesClientData?.clientRate?.currencyId, { emitEVent: false });
				this.clientDataComponent?.salesClientDataForm.manualDate?.setValue(
					result.salesClientData?.clientRate?.manualDate,
					{
						emitEVent: false,
					}
				);
				this.clientDataComponent?.salesClientDataForm.invoiceCurrencyId?.setValue(
					result.salesClientData?.clientRate?.invoiceCurrencyId,
					{
						emitEVent: false,
					}
				);
				if (this.clientDataComponent?.salesClientDataForm.clientRateTypeId?.value === ERateType.TimeBased) {
					this.clientDataComponent?.salesClientDataForm.clientInvoiceFrequency?.setValue(
						this.findItemById(this.invoiceFrequencies, result.salesClientData?.clientRate?.invoiceFrequencyId),
						{ emitEVent: false }
					);
				}
				if (this.clientDataComponent?.salesClientDataForm.clientRateTypeId?.value === ERateType.Fixed) {
					this.clientDataComponent?.salesClientDataForm.clientInvoiceTime?.setValue(
						this.findItemById(this.invoicingTimes, result.salesClientData?.clientRate?.invoicingTimeId),
						{ emitEVent: false }
					);
				}
				this.clientDataComponent?.salesClientDataForm.clientInvoicingRecipientIdValue?.setValue(
					result.salesClientData?.clientInvoicingRecipient,
					{ emitEVent: false }
				);
				if (result?.salesClientData?.clientInvoicingRecipientSameAsDirectClient) {
					this.clientDataComponent?.salesClientDataForm.clientInvoicingRecipientIdValue?.disable({ emitEvent: false });
					this.clientDataComponent?.salesClientDataForm.clientInvoicingRecipientIdValue.setValue(
						result.salesClientData?.directClient
					);
					this.clientDataComponent?.salesClientDataForm.clientInvoicingRecipientAddress?.disable({ emitEvent: false });
					this.clientDataComponent?.salesClientDataForm.clientInvoicingRecipientAddress.setValue(
						PackAddressIntoNewDto(result?.salesClientData?.directClientAddress),
						{ emitEvent: false }
					);
				}
				this.clientDataComponent?.salesClientDataForm.invoicePaperworkContactIdValue?.setValue(
					result?.salesClientData?.invoicingReferencePerson,
					{ emitEvent: false }
				);
				this.clientDataComponent?.salesClientDataForm.evaluationsReferencePersonIdValue?.setValue(
					result?.salesClientData?.evaluationsReferencePerson,
					{ emitEvent: false }
				);
				this.clientDataComponent?.salesClientDataForm.evaluationsDisabled?.setValue(
					result?.salesClientData?.evaluationsDisabled ?? false,
					{
						emitEvent: false,
					}
				); // enabled - defalut value
				if (result?.salesClientData?.noSpecialContractTerms) {
					this.clientDataComponent?.salesClientDataForm.specialContractTerms?.disable();
				}
				result.salesClientData?.periodClientSpecialRates?.forEach((specialRate: PeriodClientSpecialRateDto) => {
					this.clientDataComponent?.addSpecialRate(specialRate);
				});
				result.salesClientData?.periodClientSpecialFees?.forEach((specialFee: PeriodClientSpecialFeeDto) => {
					this.clientDataComponent?.addClientFee(specialFee);
				});
				result?.salesClientData?.contractSigners?.forEach((signer: ContractSignerDto) => {
					this.clientDataComponent?.addSignerToForm(signer);
				});
				this.clientDataComponent.selectedFrameAgreementId = result.salesClientData.frameAgreementId ?? null;
				if (result.consultantSalesData?.length) {
					result.consultantSalesData?.forEach((consultant) => {
						this.consutlantDataComponent?.addConsultantForm(consultant);
					});
					this.consutlantDataComponent?.updateConsultantStepAnchors();
				}
				const projectTypeId = result?.salesMainData?.projectTypeId;
				if (
					projectTypeId === EProjectTypes.NearshoreVMShighMargin ||
					projectTypeId === EProjectTypes.NearshoreVMSlowMargin ||
					projectTypeId === EProjectTypes.VMShighMargin ||
					projectTypeId === EProjectTypes.VMSlowMargin ||
					result?.salesMainData?.salesTypeId === SalesTypes.ThirdPartyMgmt
				) {
					this.mainDataComponent?.makeAreaTypeRoleNotRequired(false);
				} else {
					this.mainDataComponent?.makeAreaTypeRoleRequired(false);
				}
				this.mainDataComponent?.getPrimaryCategoryTree();
				if (this.isContractModuleEnabled) {
					this.clientDataComponent?.getPrimaryFrameAgreements();
				}
				if (result.salesClientData.purchaseOrdersIds?.length) {
					this.clientDataComponent?.poComponent?.getPurchaseOrders(
						result.salesClientData.purchaseOrdersIds,
						result.salesClientData.directClientIdValue
					);
				}
			});
	}

	//#region termination
	getWorkflowSalesStepConsultantTermination(consultant: ConsultantResultDto) {
		this.showMainSpinner();
		this._workflowServiceProxy
			.terminationConsultantSalesGET(this.workflowId!, consultant.id!)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this.resetForms();
				this.salesTerminateConsultantForm.patchValue(result, { emitEvent: false });
			});
	}

	saveTerminationConsultantSalesStep(isDraft: boolean) {
		let input = this._packTerminateConsultantData();
		this.showMainSpinner();
		if (isDraft) {
			this._workflowServiceProxy
				.terminationConsultantSalesPUT(this.workflowId!, this.consultant.id, input)
				.pipe(finalize(() => this.hideMainSpinner()))
				.subscribe(() => {
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					if (this.editEnabledForcefuly) {
						this.toggleEditMode();
					}
				});
		} else {
			this._workflowServiceProxy
				.terminationConsultantSalesComplete(this.workflowId!, this.consultant.id, input)
				.pipe(finalize(() => this.hideMainSpinner()))
				.subscribe(() => {
					this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					this.getSalesStepData();
				});
		}
	}

	getWorkflowSalesStepTermination() {
		this.showMainSpinner();
		this._workflowServiceProxy
			.terminationSalesGET(this.workflowId!)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this.resetForms();
				this.salesTerminateConsultantForm.patchValue(result, { emitEvent: false });
				if (result.noEvaluation) {
					this.salesTerminateConsultantForm.finalEvaluationReferencePerson.disable();
				}
				if (
					result.finalEvaluationReferencePerson?.id === null ||
					result.finalEvaluationReferencePerson?.id === undefined
				) {
					this.salesTerminateConsultantForm.finalEvaluationReferencePerson.setValue('');
				}
				if (result?.workflowDocuments?.length) {
					this.terminationDocuments?.addExistingFile(result.workflowDocuments);
				}
			});
	}

	saveWorkflowTerminationSalesStep(isDraft: boolean) {
		let input = this._packTerminateWorkflowData();
		this.showMainSpinner();
		if (isDraft) {
			this._workflowServiceProxy
				.terminationSalesPUT(this.workflowId!, input)
				.pipe(
					finalize(() => {
						this._tempUpdateDocuments();
						this.hideMainSpinner();
					})
				)
				.subscribe(() => {
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					if (this.editEnabledForcefuly) {
						this.toggleEditMode();
					}
				});
		} else {
			this._workflowServiceProxy
				.terminationSalesComplete(this.workflowId!, input)
				.pipe(
					finalize(() => {
						this._tempUpdateDocuments();
						this.hideMainSpinner();
					})
				)
				.subscribe(() => {
					this._workflowDataService.workflowSideSectionUpdated.emit({
						isStatusUpdate: true,
					});
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					this.getSalesStepData();
				});
		}
	}

	terminateConsultant(index: number) {
		let consultantInformation = this.consutlantDataComponent?.consultants.at(index).value.consultantName;
		const scrollStrategy = this.overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			confirmationMessageTitle: `Terminate consultant`,
			confirmationMessage: `Are you sure you want to terminate consultant ${
				consultantInformation?.consultant?.name ?? ''
			}?`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Terminate',
			isNegative: true,
		};
		const dialogRef = this.dialog.open(ConfirmationDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe(() => {
			this.terminateConsultantStart(consultantInformation?.consultant?.id!);
		});
	}

	terminateConsultantStart(index: number) {
		this._workflowServiceProxy
			.terminationConsultantStart(this.workflowId!, index)
			.pipe(finalize(() => {}))
			.subscribe(() => {
				this._workflowDataService.workflowSideSectionAdded.emit(true);
				this._workflowDataService.workflowOverviewUpdated.emit(true);
			});
	}
	//#endregion termination

	private _tempUpdateDocuments() {
		this._workflowDocumentsService.overviewAll(this.workflowId, this.periodId).subscribe((result) => {
			if (this.mainDataComponent.mainDocuments) {
				this.mainDataComponent.mainDocuments.clearDocuments();
			}
			if (this.terminationDocuments) {
				this.terminationDocuments.clearDocuments();
			}
			if (result.length) {
				this.mainDataComponent.mainDocuments.addExistingFile(result);
			}
		});
	}

	getSalesStepData(consultant?: ConsultantResultDto, consultantPeriodId?: string) {
		switch (this._workflowDataService.getWorkflowProgress.currentlyActiveSideSection) {
			case WorkflowProcessType.StartClientPeriod:
			case WorkflowProcessType.ExtendClientPeriod:
			case WorkflowProcessType.ChangeClientPeriod:
				this.getStartChangeOrExtendClientPeriodSales();
				break;
			case WorkflowProcessType.TerminateWorkflow:
				this.getWorkflowSalesStepTermination();
				break;
			case WorkflowProcessType.StartConsultantPeriod:
			case WorkflowProcessType.ExtendConsultantPeriod:
			case WorkflowProcessType.ChangeConsultantPeriod:
				let consultantPeriodIdParameter = consultantPeriodId ?? this.activeSideSection.consultantPeriodId;
				this.getStartChangeOrExtendConsutlantPeriodSales(consultantPeriodIdParameter!);
				break;
			case WorkflowProcessType.TerminateConsultant:
				let consultantParameter = consultant ?? this.consultant;
				this.getWorkflowSalesStepConsultantTermination(consultantParameter!);
				break;
		}
	}

	getStartChangeOrExtendConsutlantPeriodSales(consultantPeriodId: string) {
		this._consultantPeriodSerivce
			.consultantSalesGET(consultantPeriodId)
			.pipe(finalize(() => {}))
			.subscribe((result) => {
				this.resetForms();
				let clientDto = new ClientResultDto();
				clientDto.clientId = result.directClientIdValue;
				this.clientDataComponent?.salesClientDataForm.directClientIdValue?.setValue(clientDto, { emitEvent: false });
				let clientRateType = ERateType.TimeBased; // default value is 'Time based'
				if (result.clientRate?.isFixedRate) {
					clientRateType = ERateType.Fixed;
				} else if (result.clientRate?.isTimeBasedRate) {
					clientRateType = ERateType.TimeBased; // 1: 'Time based'
				}
				this.clientDataComponent?.salesClientDataForm.clientRateTypeId?.setValue(clientRateType, {
					emitEVent: false,
				});
				this.clientDataComponent?.salesClientDataForm.pdcInvoicingEntityId?.setValue(
					result?.clientPeriodPdcInvoicingEntityId,
					{
						emitEvent: false,
					}
				);
				this.clientDataComponent?.salesClientDataForm.normalRate?.setValue(result.clientRate?.normalRate, {
					emitEVent: false,
				});
				this.clientDataComponent?.salesClientDataForm.rateUnitTypeId?.setValue(result.clientRate?.rateUnitTypeId, {
					emitEVent: false,
				});
				this.clientDataComponent?.salesClientDataForm.clientCurrencyId?.setValue(result.clientRate?.currencyId, { emitEVent: false });
				this.clientDataComponent?.salesClientDataForm.invoiceCurrencyId?.setValue(result.clientRate?.invoiceCurrencyId, {
					emitEVent: false,
				});
				if (this.clientDataComponent?.salesClientDataForm.clientRateTypeId?.value === ERateType.TimeBased) {
					this.clientDataComponent?.salesClientDataForm.clientInvoiceFrequency?.setValue(
						this.findItemById(this.invoiceFrequencies, result.clientRate?.invoiceFrequencyId),
						{ emitEVent: false }
					);
				}
				if (this.clientDataComponent?.salesClientDataForm.clientRateTypeId?.value === ERateType.Fixed) {
					this.clientDataComponent?.salesClientDataForm.clientInvoiceFrequency?.setValue(
						this.findItemById(this.invoicingTimes, result.clientRate?.invoicingTimeId),
						{ emitEVent: false }
					);
				}
				this.clientDataComponent?.salesClientDataForm.manualDate?.setValue(result.clientRate?.manualDate, {
					emitEVent: false,
				});

				this.mainDataComponent?.salesMainDataForm.remarks?.setValue(result?.remarks, {
					emitEvent: false,
				});
				this.mainDataComponent?.salesMainDataForm.noRemarks?.setValue(result?.noRemarks, {
					emitEvent: false,
				});
				if (result?.noRemarks) {
					this.mainDataComponent?.salesMainDataForm.remarks?.disable();
				}
				this.mainDataComponent?.salesMainDataForm.projectDescription?.setValue(result?.projectDescription, {
					emitEvent: false,
				});
				this.mainDataComponent?.salesMainDataForm.projectName?.setValue(result?.projectName, { emitEvent: false });
				this.consutlantDataComponent?.addConsultantForm(result?.consultantSalesData);
				this.consutlantDataComponent?.updateConsultantStepAnchors();
			});
	}

	saveStartChangeOrExtendConsultantPeriodSales(isDraft: boolean) {
		let input = new ConsultantPeriodSalesDataDto();
		input = this.mainDataComponent?.salesMainDataForm.value;
		const consultant = this.consutlantDataComponent?.consultants.at(0).value;
		let consultantInput = this._packConsultantFormData(consultant);
		input.consultantSalesData = consultantInput;
		this.showMainSpinner();
		if (isDraft) {
			this._consultantPeriodSerivce
				.consultantSalesPUT(this.activeSideSection.consultantPeriodId!, input)
				.pipe(finalize(() => this.hideMainSpinner()))
				.subscribe(() => {
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					if (this.editEnabledForcefuly) {
						this.toggleEditMode();
					}
				});
		} else {
			this._consultantPeriodSerivce
				.editFinish4(this.activeSideSection.consultantPeriodId!, input)
				.pipe(finalize(() => this.hideMainSpinner()))
				.subscribe(() => {
					this._workflowDataService.workflowSideSectionUpdated.emit({
						isStatusUpdate: true,
					});
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					this.getSalesStepData();
				});
		}
	}

	resetForms() {
		this.mainDataComponent?.salesMainDataForm.reset('', { emitEvent: false });
		if (this.clientDataComponent) {
			this.clientDataComponent.salesClientDataForm.clientRates.controls = [];
			this.clientDataComponent.salesClientDataForm.clientFees.controls = [];
			this.clientDataComponent.salesClientDataForm.contractSigners.controls = [];
			this.clientDataComponent.salesClientDataForm.timeReportingCaps.controls = [];
			if (this.clientDataComponent.poComponent) {
				this.clientDataComponent.poComponent.purchaseOrders.controls = [];
			}
		}
		if (this.mainDataComponent) {
			this.mainDataComponent.salesMainDataForm.commissions.controls = [];
			this.mainDataComponent.salesMainDataForm.commissionedUsers.controls = [];
		}
		if (this.consutlantDataComponent) {
			this.consutlantDataComponent.consultantsForm.consultants.controls = [];
		}
		if (this.mainDataComponent?.mainDocuments) {
			this.mainDataComponent.mainDocuments.clearDocuments();
		}
		if (this.terminationDocuments) {
			this.terminationDocuments.clearDocuments();
		}
		this.salesTerminateConsultantForm.reset('', { emitEvent: false });
		this.clientDataComponent?.salesClientDataForm.reset('', { emitEvent: false });
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

	private _packClientPeriodData(): ClientPeriodSalesDataCommandDto {
		let input = new ClientPeriodSalesDataCommandDto();
		input.workflowDocumentsCommandDto = new Array<WorkflowDocumentCommandDto>();
		if (this.mainDataComponent.mainDocuments.documents.value?.length) {
			for (let document of this.mainDataComponent.mainDocuments.documents.value) {
				let documentInput = new WorkflowDocumentCommandDto();
				documentInput.name = document.name;
				documentInput.workflowDocumentId = document.workflowDocumentId;
				documentInput.temporaryFileId = document.temporaryFileId;
				input.workflowDocumentsCommandDto.push(documentInput);
			}
		}
		input.salesMainData = new SalesMainDataDto(this.mainDataComponent?.salesMainDataForm.value);
		input.salesMainData.salesAccountManagerIdValue =
			this.mainDataComponent?.salesMainDataForm.salesAccountManagerIdValue?.value?.id;
		input.salesMainData.commissionAccountManagerIdValue =
			this.mainDataComponent?.salesMainDataForm.commissionAccountManagerIdValue?.value?.id;
		input.salesMainData.primarySourcerId = this.mainDataComponent?.salesMainDataForm.primarySourcer?.value?.id;
		input.salesMainData.primarySourcer = this.mainDataComponent?.salesMainDataForm.primarySourcer?.value;
		input.salesMainData.customContractExpirationNotificationDate =
			this.mainDataComponent?.salesMainDataForm.contractExpirationNotification?.value?.includes(999)
				? this.mainDataComponent?.salesMainDataForm.customContractExpirationNotificationDate?.value
				: null;
		input.salesMainData.contractExpirationNotificationIntervalIds =
			this.mainDataComponent?.salesMainDataForm.contractExpirationNotification?.value?.filter((x: number) => x !== 999);
		input.salesMainData.commissions = new Array<CommissionDto>();
		if (this.mainDataComponent?.salesMainDataForm.commissions.value?.length) {
			this.mainDataComponent?.salesMainDataForm.commissions.value.forEach((commission: any) => {
				let commissionInput = new CommissionDto();
				commissionInput.id = commission.id;
				commissionInput.amount = commission.amount;
				commissionInput.commissionTypeId = commission.type?.id;
				commissionInput.currencyId = commission.currency?.id;
				commissionInput.commissionFrequencyId = commission.frequency?.id;
				commissionInput.recipientTypeId = commission.recipientType?.id;
				switch (commission.recipientType?.id) {
					case 1: // Supplier
						commissionInput.supplierId = commission.recipient?.supplierId;
						break;
					case 2: //Consultant
						commissionInput.consultantId = commission.recipient?.id;
						break;
					case 3: // client
						commissionInput.clientId = commission.recipient?.clientId;
						break;
					case 4: // PDC entity
						commissionInput.legalEntityId = commission.recipient?.id;
						break;
				}
				if (commission.frequency?.id === 2) {
					// id = 2 == 'One time'
					commissionInput.oneTimeDate = commission.oneTimeDate;
				}
				input.salesMainData!.commissions?.push(commissionInput);
			});
		}
		input.salesMainData!.commissionedEmployeesIdValues = [];
		input.salesMainData!.commissionedEmployeesData = new Array<EmployeeDto>();
		if (this.mainDataComponent?.salesMainDataForm.commissionedUsers.value?.length) {
			this.mainDataComponent?.salesMainDataForm.commissionedUsers.value.forEach((form: any) => {
				const user: EmployeeDto = form.commissionedUser;
				if (user?.id) {
					input.salesMainData!.commissionedEmployeesIdValues?.push(user?.id);
					input.salesMainData!.commissionedEmployeesData?.push(user);
				}
			});
		}
		input.salesClientData = new SalesClientDataDto(this.clientDataComponent?.salesClientDataForm.value);
		input.startDate = this.clientDataComponent?.salesClientDataForm.startDate?.value;
		input.noEndDate = this.clientDataComponent?.salesClientDataForm.noEndDate?.value;
		input.endDate = this.clientDataComponent?.salesClientDataForm.endDate?.value;
		input.salesClientData.clientContactProjectManager =
			this.clientDataComponent?.salesClientDataForm.clientContactProjectManager.value;
		input.salesClientData.directClientIdValue =
			this.clientDataComponent?.salesClientDataForm.directClientIdValue?.value?.clientId;
		input.salesClientData.directClientAddressId = this.clientDataComponent?.salesClientDataForm.directClientAddress.value?.id;
		input.salesClientData.directClientAddress = FindClientAddress(
			this.clientDataComponent?.salesClientDataForm.directClientIdValue?.value?.clientAddresses,
			this.clientDataComponent?.salesClientDataForm.directClientAddress.value?.id
		);
		input.salesClientData.endClientIdValue = this.clientDataComponent?.salesClientDataForm.endClientIdValue?.value?.clientId;
		input.salesClientData.endClientAddressId = this.clientDataComponent?.salesClientDataForm.endClientAddress.value?.id;
		input.salesClientData.endClientAddress = FindClientAddress(
			this.clientDataComponent?.salesClientDataForm.endClientIdValue?.value?.clientAddresses,
			this.clientDataComponent?.salesClientDataForm.endClientAddress.value?.id
		);
		input.salesClientData.clientRate = new ClientRateDto(this.clientDataComponent?.salesClientDataForm.value);
		input.salesClientData.clientRate!.isTimeBasedRate =
			this.clientDataComponent?.salesClientDataForm.clientRateTypeId?.value === ERateType.TimeBased;
		input.salesClientData.clientRate!.isFixedRate =
			this.clientDataComponent?.salesClientDataForm.clientRateTypeId?.value === ERateType.Fixed;
		input.salesClientData.clientRate!.currencyId = this.clientDataComponent?.salesClientDataForm.clientCurrencyId?.value;
		input.salesClientData.clientRate!.invoiceFrequencyId =
			this.clientDataComponent?.salesClientDataForm.clientInvoiceFrequency?.value?.id;
		input.salesClientData.clientRate!.invoicingTimeId =
			this.clientDataComponent?.salesClientDataForm.clientInvoiceTime?.value?.id;
		input.salesClientData.clientInvoicingRecipientIdValue =
			this.clientDataComponent?.salesClientDataForm.clientInvoicingRecipientIdValue?.value?.clientId;
		input.salesClientData.clientInvoicingRecipientAddressId =
			this.clientDataComponent?.salesClientDataForm.clientInvoicingRecipientAddress.value?.id;
		input.salesClientData.clientInvoicingRecipientAddress = FindClientAddress(
			this.clientDataComponent?.salesClientDataForm.clientInvoicingRecipientIdValue?.value?.clientAddresses,
			this.clientDataComponent?.salesClientDataForm.clientInvoicingRecipientAddress.value?.id
		);
		input.salesClientData.invoicingReferencePersonIdValue =
			this.clientDataComponent?.salesClientDataForm.invoicePaperworkContactIdValue?.value?.id;

		input.salesClientData.timeReportingCaps = new Array<TimeReportingCapDto>();
		if (this.clientDataComponent.salesClientDataForm.timeReportingCaps?.value.length) {
			for (let cap of this.clientDataComponent.salesClientDataForm.timeReportingCaps?.value) {
				let capInput = new TimeReportingCapDto(cap);
				capInput.id = new TimeReportingCapId(cap.id);
				input.salesClientData.timeReportingCaps.push(capInput);
			}
		}
		if (this.clientDataComponent?.salesClientDataForm.clientRates.value.length) {
			input.salesClientData!.periodClientSpecialRates = new Array<PeriodClientSpecialRateDto>();
			this.clientDataComponent?.salesClientDataForm.clientRates.value.forEach((rate: any) => {
				let clientRate = new PeriodClientSpecialRateDto(rate);
				clientRate.clientRateCurrencyId = rate.clientRateCurrencyId;
				input.salesClientData!.periodClientSpecialRates?.push(clientRate);
			});
		} else {
			input.salesClientData!.noSpecialRate = true;
		}
		if (this.clientDataComponent?.salesClientDataForm.clientFees.value.length) {
			input.salesClientData!.periodClientSpecialFees = new Array<PeriodClientSpecialFeeDto>();
			this.clientDataComponent?.salesClientDataForm.clientFees.value.forEach((fee: any) => {
				let clientFee = new PeriodClientSpecialFeeDto(fee);
				clientFee.clientRateCurrencyId = fee.clientRateCurrencyId;
				input.salesClientData!.periodClientSpecialFees?.push(clientFee);
			});
		} else {
			input.salesClientData!.noSpecialFee = true;
		}
		input.salesClientData!.evaluationsReferencePersonIdValue =
			this.clientDataComponent?.salesClientDataForm.evaluationsReferencePersonIdValue?.value?.id;
		input.salesClientData!.contractSigners = new Array<ContractSignerDto>();
		if (this.clientDataComponent?.salesClientDataForm.contractSigners.value?.length) {
			this.clientDataComponent?.salesClientDataForm.contractSigners.value.forEach((signer: any) => {
				let signerInput = new ContractSignerDto();
				signerInput.signOrder = signer.clientSequence;
				signerInput.contactId = signer.clientContact?.id;
				signerInput.contact = signer.clientContact;
				signerInput.signerRoleId = signer.signerRoleId;
				input.salesClientData!.contractSigners?.push(signerInput);
			});
		}
		input.salesClientData.purchaseOrdersIds = [];
		if (this.clientDataComponent.poComponent.purchaseOrders.value) {
			input.salesClientData.purchaseOrdersIds = this.clientDataComponent.poComponent.purchaseOrders.value?.map((x) => x.id);
		}
		input.salesClientData.frameAgreementId = this.clientDataComponent.salesClientDataForm.frameAgreementId.value?.agreementId;
		input.consultantSalesData = new Array<ConsultantSalesDataDto>();
		if (this.consutlantDataComponent?.consultants.value?.length) {
			this.consutlantDataComponent?.consultants.value.forEach((consultant: any) => {
				let consultantInput = this._packConsultantFormData(consultant);
				input.consultantSalesData!.push(consultantInput);
			});
		}
		return input;
	}

	private _packConsultantFormData(consultant: any): ConsultantSalesDataDto {
		let consultantInput = new ConsultantSalesDataDto();
		consultantInput.employmentTypeId = consultant.employmentTypeId;
		if (
			consultant.employmentTypeId === EmploymentTypes.FeeOnly ||
			consultant.employmentTypeId === EmploymentTypes.Recruitment
		) {
			consultantInput.nameOnly = consultant.consultantNameOnly;
			consultantInput.consultantPeriodId = consultant.consultantPeriodId;
		} else {
			consultantInput.consultantId = consultant.consultantName?.consultant?.id;
			consultantInput.soldRequestConsultantId = consultant.consultantName?.sourcingRequestConsultantId;
			consultantInput.consultantPeriodId = consultant.consultantPeriodId;
			consultantInput.consultant = new ConsultantResultDto();
			consultantInput.consultant = consultant.consultantName?.consultant;
			consultantInput.requestId = consultant.consultantName?.consultant?.sourcingRequestId;

			consultantInput.durationSameAsClientPeriod = consultant.consultantProjectDurationSameAsClient;
			consultantInput.startDate = consultant.consultantProjectStartDate;
			consultantInput.noEndDate = consultant.consultantProjectNoEndDate;
			consultantInput.endDate = consultant.consultantProjectEndDate;
			consultantInput.isOnsiteWorkplace = consultant.consultantIsOnsiteWorkplace;
			consultantInput.percentageOnSite = consultant.consultantWorkplacePercentageOnSite;
			consultantInput.isEmagineOfficeWorkplace = consultant.consultantIsEmagineOfficeWorkplace;
			consultantInput.isRemoteWorkplace = consultant.consultantIsRemoteWorkplace;
			consultantInput.noExpectedWorkload = consultant.noExpectedWorkload;
			consultantInput.expectedWorkloadHours = consultant.expectedWorkloadHours;
			consultantInput.timeReportingCaps = new Array<TimeReportingCapDto>();
			if (consultant.timeReportingCaps?.length) {
				for (let cap of consultant.timeReportingCaps) {
					let capInput = new TimeReportingCapDto(cap);
					capInput.id = new TimeReportingCapId(cap.id);
					consultantInput.timeReportingCaps.push(capInput);
				}
			}
            consultantInput.onsiteClientSameAsDirectClient = consultant.onsiteClientSameAsDirectClient;
			consultantInput.onsiteClientId = consultant.consultantWorkplaceClientAddress?.clientId;
			consultantInput.onsiteClientAddressId = consultant.onsiteClientAddress?.id;
			consultantInput.onsiteClientAddress = FindClientAddress(
				consultant.consultantWorkplaceClientAddress?.clientAddresses,
				consultant.onsiteClientAddress?.id
			);
			consultantInput.emagineOfficeId = consultant.emagineOfficeId;
			consultantInput.remoteAddressCountryId = consultant.consultantWorkplaceRemote?.id;
			consultantInput.expectedWorkloadUnitId = consultant.expectedWorkloadUnitId;
			consultantInput.consultantTimeReportingCapId = consultant.consultantTimeReportingCapId;
			consultantInput.pdcPaymentEntityId = consultant.pdcPaymentEntityId;

			consultantInput.consultantRate = new ConsultantRateDto();
			consultantInput.consultantRate.isTimeBasedRate = consultant.consultantRateTypeId === ERateType.TimeBased;
			consultantInput.consultantRate.isFixedRate = consultant.consultantRateTypeId === ERateType.Fixed;
			consultantInput.consultantRate.normalRate = consultant.consultantRate;
			consultantInput.consultantRate.currencyId = consultant.consultantRateCurrencyId;
			consultantInput.consultantRate.rateUnitTypeId = consultant.rateUnitTypeId;
			consultantInput.consultantRate.prodataToProdataRate = consultant.consultantPDCRate;
			consultantInput.consultantRate.prodataToProdataCurrencyId = consultant.consultantPDCRateCurrencyId;
			consultantInput.consultantRate.prodataToProdataInvoiceCurrencyId = consultant.prodataToProdataInvoiceCurrencyId;
			if (consultantInput.consultantRate.isTimeBasedRate) {
				consultantInput.consultantRate.invoiceFrequencyId = consultant.consultantInvoicingFrequency?.id;
			}
			if (consultantInput.consultantRate.isFixedRate) {
				consultantInput.consultantRate.invoicingTimeId = consultant.consultantInvoicingTime?.id;
			}
			if (consultant.consultantInvoicingTime?.name === 'Manual date') {
				consultantInput.consultantRate.manualDate = consultant.consultantInvoicingManualDate;
			}
			consultantInput.periodConsultantSpecialRates = new Array<PeriodConsultantSpecialRateDto>();
			if (consultant.specialRates.length) {
				for (let rate of consultant.specialRates) {
					let consultantSpecialRate = new PeriodConsultantSpecialRateDto(rate);
					consultantSpecialRate.prodataToProdataRateCurrencyId = rate.prodataToProdataRateCurrency?.id;
					consultantInput.periodConsultantSpecialRates.push(consultantSpecialRate);
				}
			} else {
				consultantInput.noSpecialRate = true;
			}
			consultantInput.periodConsultantSpecialFees = new Array<PeriodConsultantSpecialFeeDto>();
			if (consultant.specialFees.length) {
				for (let fee of consultant.specialFees) {
					let consultantSpecialFee = new PeriodConsultantSpecialFeeDto(fee);
					consultantSpecialFee.prodataToProdataRateCurrencyId = fee.prodataToProdataRateCurrency?.id;
					consultantInput.periodConsultantSpecialFees.push(consultantSpecialFee);
				}
			} else {
				consultantInput.noSpecialFee = true;
			}
			consultantInput.specialPaymentTerms = consultant.specialPaymentTerms;
			consultantInput.noSpecialPaymentTerms = consultant.noSpecialPaymentTerms;
			consultantInput.noSpecialContractTerms = consultant.consultantSpecialContractTermsNone;
			consultantInput.specialContractTerms = consultant.consultantSpecialContractTerms;
			consultantInput.deliveryManagerSameAsAccountManager = consultant.deliveryManagerSameAsAccountManager;
			consultantInput.deliveryAccountManagerIdValue = consultant.deliveryAccountManager?.id;
		}
		return consultantInput;
	}

	private _packTerminateWorkflowData(): WorkflowTerminationSalesDataCommandDto {
		let input = new WorkflowTerminationSalesDataCommandDto(this.salesTerminateConsultantForm.value);
		input.terminationReason = +this.salesTerminateConsultantForm?.terminationReason?.value;
		input.finalEvaluationReferencePersonId =
			this.salesTerminateConsultantForm?.finalEvaluationReferencePerson?.value?.id ?? null;
		input.workflowDocumentsCommandDto = new Array<WorkflowDocumentCommandDto>();
		if (this.terminationDocuments?.documents.value?.length) {
			for (let document of this.terminationDocuments?.documents.value) {
				let documentInput = new WorkflowDocumentCommandDto();
				documentInput.name = document.name;
				documentInput.workflowDocumentId = document.workflowDocumentId;
				documentInput.temporaryFileId = document.temporaryFileId;
				input.workflowDocumentsCommandDto.push(documentInput);
			}
		}
		return input;
	}

	private _packTerminateConsultantData(): ConsultantTerminationSalesDataCommandDto {
		let input = new ConsultantTerminationSalesDataCommandDto(this.salesTerminateConsultantForm.value);
		input.terminationReason = +this.salesTerminateConsultantForm?.terminationReason?.value;
		input.finalEvaluationReferencePersonId = !this.salesTerminateConsultantForm?.noEvaluation?.value
			? this.salesTerminateConsultantForm?.finalEvaluationReferencePerson?.value?.id
			: null;
		return input;
	}

	returnToSales() {
		switch (this._workflowDataService.workflowProgress.currentlyActiveSideSection) {
			case WorkflowProcessType.StartClientPeriod:
			case WorkflowProcessType.ChangeClientPeriod:
			case WorkflowProcessType.ExtendClientPeriod:
				this.showMainSpinner();
				this._clientPeriodService
					.reopen(this.periodId!)
					.pipe(
						finalize(() => {
							this.hideMainSpinner();
						})
					)
					.subscribe(() => this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true }));
				break;

			case WorkflowProcessType.TerminateWorkflow:
				this.showMainSpinner();
				this._workflowServiceProxy
					.terminationSalesReopen(this.periodId!)
					.pipe(
						finalize(() => {
							this.hideMainSpinner();
						})
					)
					.subscribe(() => this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true }));
				break;

			case WorkflowProcessType.TerminateConsultant:
				this.showMainSpinner();
				this._workflowServiceProxy
					.terminationConsultantSalesReopen(this.periodId!)
					.pipe(
						finalize(() => {
							this.hideMainSpinner();
						})
					)
					.subscribe(() => this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true }));
				break;

			case WorkflowProcessType.StartConsultantPeriod:
			case WorkflowProcessType.ChangeConsultantPeriod:
			case WorkflowProcessType.ExtendConsultantPeriod:
				this.showMainSpinner();
				this._consultantPeriodSerivce
					.reopen2(this.periodId!)
					.pipe(
						finalize(() => {
							this.hideMainSpinner();
						})
					)
					.subscribe(() => this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true }));
				break;
		}
	}

    submitSalesTerminationForm() {
        if (this.submitFormBtn) {
            this.submitFormBtn.nativeElement.click();
        }
    }

    private _getEnums() {
        this.currencies = this.getStaticEnumValue('currencies');
        this.invoicingTimes = this.getStaticEnumValue('invoicingTimes');
        this.invoiceFrequencies = this.getStaticEnumValue('invoiceFrequencies');
        this.terminationTimes = this.getStaticEnumValue('terminationTimes');
        this.terminationReasons = this.getStaticEnumValue('terminationReasons');
	}

    get canToggleEditMode() {
		return this.permissionsForCurrentUser![EPermissions.Edit] && this.isCompleted;
	}

	get readOnlyMode() {
		return (
			this.isCompleted ||
			(!this.permissionsForCurrentUser![EPermissions.StartEdit] &&
				!this.permissionsForCurrentUser![EPermissions.Edit] &&
				!this.permissionsForCurrentUser![EPermissions.Completion])
		);
	}
}
