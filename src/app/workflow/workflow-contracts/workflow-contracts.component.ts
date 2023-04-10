import { Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
	ClientPeriodContractsDataCommandDto,
	WorkflowProcessType,
	WorkflowServiceProxy,
	ClientPeriodServiceProxy,
	ConsultantContractsDataCommandDto,
	ContractsClientDataDto,
	ContractsMainDataDto,
	EnumEntityTypeDto,
	PeriodClientSpecialFeeDto,
	PeriodClientSpecialRateDto,
	PeriodConsultantSpecialFeeDto,
	PeriodConsultantSpecialRateDto,
	ProjectLineDto,
	ConsultantTerminationContractDataCommandDto,
	WorkflowTerminationContractDataCommandDto,
	ConsultantTerminationContractDataQueryDto,
	ConsultantPeriodServiceProxy,
	ConsultantPeriodContractsDataCommandDto,
	ClientsServiceProxy,
	ClientSpecialRateDto,
	ClientSpecialFeeDto,
	ConsultantResultDto,
	ContractSyncServiceProxy,
	StepType,
	ConsultantContractsDataQueryDto,
	ContractSyncResultDto,
	ClientPeriodContractsDataQueryDto,
	ConsultantPeriodContractsDataQueryDto,
	WorkflowTerminationContractDataQueryDto,
    WorkflowDocumentCommandDto,
    WorkflowDocumentServiceProxy,
    TimeReportingCapDto,
    TimeReportingCapId,
    PurchaseOrderDto,
    PurchaseOrderServiceProxy,
} from 'src/shared/service-proxies/service-proxies';
import {} from 'src/shared/service-proxies/service-proxies';
import { DocumentsComponent } from '../shared/components/wf-documents/wf-documents.component';
import { WorkflowDataService } from '../workflow-data.service';
import { WorkflowProcessWithAnchorsDto } from '../workflow-period/workflow-period.model';
import { EmploymentTypes } from '../workflow.model';
import { ContractsClientDataComponent } from './contracts-client-data/contracts-client-data.component';
import { ContractsConsultantDataComponent } from './contracts-consultant-data/contracts-consultant-data.component';
import { ContractsMainDataComponent } from './contracts-main-data/contracts-main-data.component';
import { ContractsSyncDataComponent } from './contracts-sync-data/contracts-sync-data.component';
import {
	ClientTimeReportingCaps,
	DeliveryTypes,
	SalesTypes,
	WorkflowConsultantsLegalContractForm,
	WorkflowContractsTerminationConsultantsDataForm,
} from './workflow-contracts.model';

@Component({
	selector: 'app-workflow-contracts',
	templateUrl: './workflow-contracts.component.html',
	styleUrls: ['./workflow-contracts.component.scss'],
})

export class WorkflowContractsComponent extends AppComponentBase implements OnInit, OnDestroy {
	@Input() workflowId: string;
	@Input() periodId: string | undefined;
	@Input() consultant: ConsultantResultDto;
	@Input() activeSideSection: WorkflowProcessWithAnchorsDto;
	@Input() isCompleted: boolean;
	@Input() permissionsForCurrentUser: { [key: string]: boolean } | undefined;

    @ViewChild('mainDataComponent', { static: false }) mainDataComponent: ContractsMainDataComponent;
    @ViewChild('clientDataComponent', { static: false }) clientDataComponent: ContractsClientDataComponent;
    @ViewChild('consultantDataComponent', { static: false }) consultantDataComponent: ContractsConsultantDataComponent;
    @ViewChild('syncDataComponent', { static: false }) syncDataComponent: ContractsSyncDataComponent;
    @ViewChild('terminationDocuments', { static: false }) terminationDocuments: DocumentsComponent;
    @ViewChild('submitFormBtn', { static: false, read: ElementRef }) submitFormBtn: ElementRef;

	workflowSideSections = WorkflowProcessType;
	consultantLegalContractsForm: WorkflowConsultantsLegalContractForm;

	currencies: EnumEntityTypeDto[] = [];
	discounts: EnumEntityTypeDto[] = [];
	deliveryTypes: EnumEntityTypeDto[] = [];
	saleTypes: EnumEntityTypeDto[] = [];
	projectTypes: EnumEntityTypeDto[] = [];
	margins: EnumEntityTypeDto[] = [];
	clientTimeReportingCap: EnumEntityTypeDto[] = [];
	specialRateReportUnits: EnumEntityTypeDto[] = [];
	specialFeeFrequencies: EnumEntityTypeDto[] = [];
	employmentTypes: EnumEntityTypeDto[] = [];
	consultantTimeReportingCap: EnumEntityTypeDto[] = [];
	rateUnitTypes: EnumEntityTypeDto[] = [];
	legalContractStatuses: { [key: string]: string };
	consultantInsuranceOptions: { [key: string]: string };
	projectCategories: EnumEntityTypeDto[] = [];
	filteredConsultants: ConsultantResultDto[] = [];
    purchaseOrders: PurchaseOrderDto[] = [];

	contractsTerminationConsultantForm: WorkflowContractsTerminationConsultantsDataForm;
	clientSpecialRateList: ClientSpecialRateDto[];
	clientSpecialFeeList: ClientSpecialFeeDto[];
	editEnabledForcefuly = false;
	bypassLegalValidation = false;
	validationTriggered = false;

	employmentTypesEnum = EmploymentTypes;
	clientTimeReportingCaps = ClientTimeReportingCaps;
	deliveryTypesEnum = DeliveryTypes;
	salesTypesEnum = SalesTypes;

    isContractModuleEnabled = this._workflowDataService.contractModuleEnabled;
    purchaseOrderIds: number[];
    directClientId: number;
	private _unsubscribe = new Subject();

	constructor(
		injector: Injector,
		private _fb: UntypedFormBuilder,
		private _clientPeriodService: ClientPeriodServiceProxy,
		private _workflowDataService: WorkflowDataService,
		private _workflowServiceProxy: WorkflowServiceProxy,
		private _consultantPeriodService: ConsultantPeriodServiceProxy,
		private _clientService: ClientsServiceProxy,
		private _contractSyncService: ContractSyncServiceProxy,
		private _scrollToService: ScrollToService,
        private _workflowDocumentsService: WorkflowDocumentServiceProxy,
        private _purchaseOrderService: PurchaseOrderServiceProxy
	) {
		super(injector);
		this.contractsTerminationConsultantForm = new WorkflowContractsTerminationConsultantsDataForm();
		this.consultantLegalContractsForm = new WorkflowConsultantsLegalContractForm();
        this._workflowDataService.updatePurchaseOrders
            .pipe(takeUntil(this._unsubscribe))
            .subscribe(() => this.clientDataComponent.poComponent.getPurchaseOrders(this.purchaseOrderIds, this.directClientId, this.periodId));
	}

	ngOnInit(): void {
		this._getEnums();

		this._workflowDataService.updateWorkflowProgressStatus({
			currentStepIsCompleted: this.isCompleted,
			currentStepIsForcefullyEditing: false,
		});
		if (this.permissionsForCurrentUser!['StartEdit']) {
			this.startEditContractStep();
		} else {
			this.getContractStepData();
		}

		// Client start, extend and change periods
		this._workflowDataService.startClientPeriodContractsSaved
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((value: { isDraft: boolean; bypassLegalValidation?: boolean | undefined }) => {
				this.bypassLegalValidation = value.bypassLegalValidation!;
				if (value.isDraft && !this.editEnabledForcefuly) {
					this.saveStartChangeOrExtendClientPeriodContracts(value.isDraft);
				} else {
					if (this.validateContractForm()) {
						this.saveStartChangeOrExtendClientPeriodContracts(value.isDraft);
					} else {
						this.scrollToFirstError(value.isDraft);
					}
				}
			});

		// Consultant start, extend and change periods
		this._workflowDataService.consultantStartChangeOrExtendContractsSaved
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((value: { isDraft: boolean; bypassLegalValidation?: boolean | undefined }) => {
				this.bypassLegalValidation = value.bypassLegalValidation!;
				if (value.isDraft && !this.editEnabledForcefuly) {
					this.saveStartChangeOrExtendConsultantPeriodContracts(value.isDraft);
				} else {
					if (this.validateContractForm()) {
						this.saveStartChangeOrExtendConsultantPeriodContracts(value.isDraft);
					} else {
						this.scrollToFirstError(value.isDraft);
					}
				}
			});

		// Terminations
		this._workflowDataService.workflowConsultantTerminationContractsSaved
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((isDraft: boolean) => {
				if (isDraft && !this.editEnabledForcefuly) {
					this.saveTerminationConsultantContractStep(isDraft);
				} else {
					if (this.validateContractForm()) {
						this.saveTerminationConsultantContractStep(isDraft);
					} else {
						this.scrollToFirstError(isDraft);
					}
				}
			});

		this._workflowDataService.workflowTerminationContractsSaved
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((isDraft: boolean) => {
				if (isDraft && !this.editEnabledForcefuly) {
					this.saveWorkflowTerminationContractStep(isDraft);
				} else {
					if (this.validateContractForm()) {
						this.saveWorkflowTerminationContractStep(isDraft);
					} else {
						this.scrollToFirstError(isDraft);
					}
				}
			});

		this._workflowDataService.cancelForceEdit.pipe(takeUntil(this._unsubscribe)).subscribe(() => {
			this.isCompleted = true;
			this.editEnabledForcefuly = false;
			this._workflowDataService.updateWorkflowProgressStatus({
				currentStepIsCompleted: this.isCompleted,
				currentStepIsForcefullyEditing: this.editEnabledForcefuly,
			});
			this.getContractStepData();
		});
	}

	validateContractForm() {
        this.mainDataComponent?.submitForm();
        this.clientDataComponent?.submitForm();
        this.consultantDataComponent?.submitForm();
        this.submitTerminationConsultantForm();
		this.mainDataComponent?.contractsMainForm.markAllAsTouched();
		this.clientDataComponent?.contractClientForm.markAllAsTouched();
		this.syncDataComponent?.contractsSyncDataForm.markAllAsTouched();
		this.consultantDataComponent?.contractsConsultantsDataForm.markAllAsTouched();
		this.contractsTerminationConsultantForm.markAllAsTouched();
		this.validationTriggered = true;
		switch (this.activeSideSection.typeId) {
			case WorkflowProcessType.StartClientPeriod:
			case WorkflowProcessType.ChangeClientPeriod:
			case WorkflowProcessType.ExtendClientPeriod:
			case WorkflowProcessType.StartConsultantPeriod:
			case WorkflowProcessType.ChangeConsultantPeriod:
			case WorkflowProcessType.ExtendConsultantPeriod:
				return (
					this.mainDataComponent?.contractsMainForm.valid &&
					this.clientDataComponent?.contractClientForm.valid &&
					this.syncDataComponent?.contractsSyncDataForm.valid &&
					this.consultantDataComponent?.contractsConsultantsDataForm.valid &&
					(this.syncDataComponent?.statusAfterSync ||
						(this.syncDataComponent?.contractsSyncDataForm.showManualOption?.value &&
							this.syncDataComponent?.contractsSyncDataForm.contractLinesDoneManuallyInOldPm?.value) ||
						(!this.syncDataComponent?.contractsSyncDataForm.value.isNewSyncNeeded &&
							this.syncDataComponent?.contractsSyncDataForm.value.lastSyncedDate !== null &&
							this.syncDataComponent?.contractsSyncDataForm.value.lastSyncedDate !== undefined))
				);
			case WorkflowProcessType.TerminateWorkflow:
			case WorkflowProcessType.TerminateConsultant:
				return this.contractsTerminationConsultantForm.valid;
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
				this.saveContractStepData(isDraft);
			}
		}, 0);
	}

	getContractStepData() {
		switch (this.activeSideSection.typeId) {
			case this.workflowSideSections.StartClientPeriod:
			case this.workflowSideSections.ChangeClientPeriod:
			case this.workflowSideSections.ExtendClientPeriod:
				this.getStartChangeOrExtendClientPeriodContracts();
				break;
			case this.workflowSideSections.TerminateWorkflow:
				this.getWorkflowContractStepTermination();
				break;
			case this.workflowSideSections.StartConsultantPeriod:
			case this.workflowSideSections.ChangeConsultantPeriod:
			case this.workflowSideSections.ExtendConsultantPeriod:
				this.getStartChangeOrExtendConsultantPeriodContracts();
				break;
			case this.workflowSideSections.TerminateConsultant:
				this.getWorkflowContractsStepConsultantTermination();
				break;
		}
	}

	saveContractStepData(isDraft: boolean) {
		switch (this.activeSideSection.typeId) {
			case this.workflowSideSections.StartClientPeriod:
			case this.workflowSideSections.ChangeClientPeriod:
			case this.workflowSideSections.ExtendClientPeriod:
				this.saveStartChangeOrExtendClientPeriodContracts(isDraft);
				break;
			case this.workflowSideSections.TerminateWorkflow:
				this.saveWorkflowTerminationContractStep(isDraft);
				break;
			case this.workflowSideSections.StartConsultantPeriod:
			case this.workflowSideSections.ChangeConsultantPeriod:
			case this.workflowSideSections.ExtendConsultantPeriod:
				this.saveStartChangeOrExtendConsultantPeriodContracts(isDraft);
				break;
			case this.workflowSideSections.TerminateConsultant:
				this.saveTerminationConsultantContractStep(isDraft);
				break;
		}
	}

	startEditContractStep() {
		switch (this.activeSideSection.typeId) {
			case this.workflowSideSections.StartClientPeriod:
			case this.workflowSideSections.ChangeClientPeriod:
			case this.workflowSideSections.ExtendClientPeriod:
				this.startEditClientPeriod();
				break;
			case this.workflowSideSections.TerminateWorkflow:
				this.startEditTerminateWorkflow();
				break;
			case this.workflowSideSections.StartConsultantPeriod:
			case this.workflowSideSections.ChangeConsultantPeriod:
			case this.workflowSideSections.ExtendConsultantPeriod:
				this.startEditConsultantPeriod();
				break;
			case this.workflowSideSections.TerminateConsultant:
				this.startEditTerminateConsultant();
				break;
		}
	}

    private _tempUpdateDocuments() {
        this._workflowDocumentsService
			.overviewAll(this.workflowId, this.periodId)
			.subscribe((result) => {
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

	startEditClientPeriod() {
		this.showMainSpinner();
		this._clientPeriodService
			.editStart(this.periodId!)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
				this.getContractStepData();
			});
	}

	startEditTerminateWorkflow() {
		this.showMainSpinner();
		this._workflowServiceProxy
			.terminationContractStartEdit(this.workflowId!)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
				this.getContractStepData();
			});
	}

	startEditConsultantPeriod() {
		this.showMainSpinner();
		this._consultantPeriodService
			.editStart3(this.activeSideSection.consultantPeriodId!)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
				this.getContractStepData();
			});
	}

	startEditTerminateConsultant() {
		this.showMainSpinner();
		this._workflowServiceProxy
			.terminationConsultantContractStartEdit(this.workflowId!)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => {
				this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
				this.getContractStepData();
			});
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

    private _getEnums() {
        this.currencies = this.getStaticEnumValue('currencies');
        this.specialRateReportUnits = this.getStaticEnumValue('specialRateReportUnits');
        this.specialFeeFrequencies = this.getStaticEnumValue('specialFeeFrequencies');
        this.discounts = this.getStaticEnumValue('discounts');
        this.deliveryTypes = this.getStaticEnumValue('deliveryTypes');
        this.saleTypes = this.getStaticEnumValue('saleTypes');
        this.projectTypes = this.getStaticEnumValue('projectTypes');
        this.margins = this.getStaticEnumValue('margins');
        this.clientTimeReportingCap = this.getStaticEnumValue('clientTimeReportingCap');
        this.employmentTypes = this.getStaticEnumValue('employmentTypes');
        this.consultantTimeReportingCap = this.getStaticEnumValue('consultantTimeReportingCap');
        this.rateUnitTypes = this.getStaticEnumValue('rateUnitTypes');
        this.legalContractStatuses = this.getStaticEnumValue('legalContractStatuses');
        this.consultantInsuranceOptions = this.getStaticEnumValue('consultantInsuranceOptions');
        this.projectCategories = this.getStaticEnumValue('projectCategories');
    }

	toggleEditMode(isToggledFromUi?: boolean) {
		this.isCompleted = !this.isCompleted;
		this.editEnabledForcefuly = !this.editEnabledForcefuly;
		this._workflowDataService.updateWorkflowProgressStatus({
			currentStepIsCompleted: this.isCompleted,
			currentStepIsForcefullyEditing: this.editEnabledForcefuly,
		});
		if (isToggledFromUi) {
			this.getContractStepData();
		}
	}

	updateConsultantStepAnchors() {
		let consultantNames = this.consultantDataComponent?.contractsConsultantsDataForm.consultants.value.map(
            (item: any) => {
                if (
                    item.consultantType?.id === EmploymentTypes.FeeOnly ||
                    item.consultantType?.id === EmploymentTypes.Recruitment
                ) {
                    return {employmentType: item.employmentType?.id, name: item.nameOnly};
                } else {
                    return {employmentType: item.employmentType?.id, name: item.consultant?.name};
                }
            }
        );
		this._workflowDataService.consultantsAddedToStep.emit({
			stepType: StepType.Contract,
			processTypeId: this.activeSideSection.typeId!,
			consultantNames: consultantNames,
		});
	}

	getRatesAndFees(clientId: number) {
		this._clientService
			.specialRatesAll(clientId, true)
			.pipe(finalize(() => {}))
			.subscribe((result) => {
				this.clientSpecialRateList = result.filter((x) => !x.isHidden);
			});
		this._clientService
			.specialFeesAll(clientId, true)
			.pipe(finalize(() => {}))
			.subscribe((result) => {
				this.clientSpecialFeeList = result.filter((x) => !x.isHidden);
			});
	}

	compareWithFn(listOfItems: any, selectedItem: any) {
		return listOfItems && selectedItem && listOfItems?.id === selectedItem?.id;
	}

	displayNameFn(option: any) {
		return option?.name;
	}

	resetForms() {
        if (this.syncDataComponent) {
            this.syncDataComponent.statusAfterSync = false;
            this.syncDataComponent.contractsSyncDataForm.consultants.controls = [];
        }
        if (this.clientDataComponent) {
            this.clientDataComponent.contractClientForm.clientRates.controls = [];
            this.clientDataComponent.contractClientForm.clientFees.controls = [];
            this.clientDataComponent.contractClientForm.timeReportingCaps.controls = [];
            if (this.clientDataComponent.poComponent) {
                this.clientDataComponent.poComponent.purchaseOrders.controls = [];
            }
        }
        if (this.consultantDataComponent) {
            this.consultantDataComponent.contractsConsultantsDataForm.consultants.controls = [];
        }
        if (this.mainDataComponent?.mainDocuments) {
            this.mainDataComponent.mainDocuments.clearDocuments();
        }
        if (this.terminationDocuments) {
            this.terminationDocuments.clearDocuments();
        }
		this.contractsTerminationConsultantForm.consultantTerminationContractData.controls = [];
		this.mainDataComponent?.contractsMainForm.reset('', { emitEvent: false });
		this.clientDataComponent?.contractClientForm.reset('', { emitEvent: false });
		this.filteredConsultants = [];
	}

	//#region Start client period
	getStartChangeOrExtendClientPeriodContracts() {
		this.resetForms();
		this.showMainSpinner();
		this._clientPeriodService
			.clientContractsGET(this.periodId!)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this.fillClientPeriodForm(result);
			});
	}


	saveStartChangeOrExtendClientPeriodContracts(isDraft: boolean) {
		let input = this._packClientPeriodData();
		this.showMainSpinner();
		if (isDraft) {
			this._clientPeriodService
				.clientContractsPUT(this.periodId!, input)
				.pipe(
					finalize(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe({
                    next: () => {
                        this.validationTriggered = false;
                        this._workflowDataService.workflowOverviewUpdated.emit(true);
                        if (this.editEnabledForcefuly) {
                            this.toggleEditMode();
                        }
                        this.getContractStepData();
                    },
                    error: () => {
                        this._tempUpdateDocuments();
                    }
				});
		} else {
			this._clientPeriodService
				.editFinish2(this.periodId!, input)
				.pipe(
					finalize(() => {
						this.bypassLegalValidation = false;
						this.hideMainSpinner();
					})
				)
				.subscribe({
                    next: () => {
                        this.validationTriggered = false;
                        this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
                        this._workflowDataService.workflowOverviewUpdated.emit(true);
                        this.getContractStepData();
                    },
                    error: () => {
                        this._tempUpdateDocuments();
                    }
				});
		}
	}
	//#endregion Start client period

	//#region Start consultant period
	getStartChangeOrExtendConsultantPeriodContracts() {
		this.resetForms();
		this.showMainSpinner();
		this._consultantPeriodService
			.consultantContractsGET(this.activeSideSection.consultantPeriodId!)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this.fillConsultantPeriodForm(result);
			});
	}

	saveStartChangeOrExtendConsultantPeriodContracts(isDraft: boolean) {
		let input = this._packConsultantPeriodData();
		this.showMainSpinner();
		if (isDraft) {
			this._consultantPeriodService
				.consultantContractsPUT(this.activeSideSection.consultantPeriodId!, input)
				.pipe(
					finalize(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe(() => {
					this.validationTriggered = false;
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					if (this.editEnabledForcefuly) {
						this.toggleEditMode();
					}
					this.getContractStepData();
				});
		} else {
			this._consultantPeriodService
				.editFinish5(this.activeSideSection.consultantPeriodId!, input)
				.pipe(
					finalize(() => {
						this.bypassLegalValidation = false;
						this.hideMainSpinner();
					})
				)
				.subscribe(() => {
					this.validationTriggered = false;
					this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					this.getContractStepData();
				});
		}
	}
	//#endregion Start consultant period

	// Termination

	addConsultantDataToTerminationForm(consultant: ConsultantTerminationContractDataQueryDto) {
		const form = this._fb.group({
			consultantId: new UntypedFormControl(consultant?.consultant?.id),
			consultantData: new UntypedFormControl(consultant?.consultant),
			removedConsultantFromAnyManualChecklists: new UntypedFormControl(
				consultant.removedConsultantFromAnyManualChecklists,
				Validators.required
			),
			deletedAnySensitiveDocumentsForGDPR: new UntypedFormControl(
				consultant.deletedAnySensitiveDocumentsForGDPR,
				Validators.required
			),
		});
		this.contractsTerminationConsultantForm.consultantTerminationContractData.push(form);
	}

	getWorkflowContractsStepConsultantTermination() {
		this.resetForms();
		this.showMainSpinner();
		this._workflowServiceProxy
			.terminationConsultantContractGET(this.workflowId!, this.consultant.id!)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this.fillConsultantTerminationForm(result);
			});
	}

	saveTerminationConsultantContractStep(isDraft: boolean) {
		let input = this._packConsultantTerminationData();
		this.showMainSpinner();
		if (isDraft) {
			this._workflowServiceProxy
				.terminationConsultantContractPUT(this.workflowId!, input)
				.pipe(
					finalize(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe(() => {
					this.validationTriggered = false;
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					if (this.editEnabledForcefuly) {
						this.toggleEditMode();
					}
					this.getContractStepData();
				});
		} else {
			this._workflowServiceProxy
				.terminationConsultantContractComplete(this.workflowId!, input)
				.pipe(
					finalize(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe(() => {
					this.validationTriggered = false;
					this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
					this._workflowDataService.workflowOverviewUpdated.emit(true);
					this.getContractStepData();
				});
		}
	}

	getWorkflowContractStepTermination() {
		this.resetForms();
		this.showMainSpinner();
		this._workflowServiceProxy
			.terminationContractGET(this.workflowId!)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this.fillWorkflowTerminationForm(result);
			});
	}

	saveWorkflowTerminationContractStep(isDraft: boolean) {
		let input = this._packWorkflowTerminationData();
		this.showMainSpinner();
		if (isDraft) {
			this._workflowServiceProxy
				.terminationContractPUT(this.workflowId!, input)
				.pipe(
					finalize(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe({
					next: () => {
						this.validationTriggered = false;
						this._workflowDataService.workflowOverviewUpdated.emit(true);
						if (this.editEnabledForcefuly) {
							this.toggleEditMode();
						}
						this.getContractStepData();
					},
					error: () => {
                        this.hideMainSpinner();
                        this._tempUpdateDocuments();
                    }
                });
		} else {
			this._workflowServiceProxy
				.terminationContractComplete(this.workflowId!, input)
				.pipe(
					finalize(() => {
						this.hideMainSpinner();
					})
				)
				.subscribe({
                    next: () => {
                        this.validationTriggered = false;
                        this._workflowDataService.workflowSideSectionUpdated.emit({ isStatusUpdate: true });
                        this._workflowDataService.workflowOverviewUpdated.emit(true);
                        this.getContractStepData();
                    },
                    error: () => {
                        this._tempUpdateDocuments();
                    }
				});
		}
	}

	processSyncToLegacySystem() {
		switch (this._workflowDataService.workflowProgress.currentlyActiveSideSection) {
			case WorkflowProcessType.StartClientPeriod:
			case WorkflowProcessType.ChangeClientPeriod:
			case WorkflowProcessType.ExtendClientPeriod:
				this.syncClientPeriodToLegacySystem();
				break;
			case WorkflowProcessType.TerminateWorkflow:
				this.syncWorkflowTerminationToLegacySystem();
				break;
			case WorkflowProcessType.TerminateConsultant:
				this.syncConsultantTerminationToLegacySystem();
				break;
			case WorkflowProcessType.StartConsultantPeriod:
			case WorkflowProcessType.ChangeConsultantPeriod:
			case WorkflowProcessType.ExtendConsultantPeriod:
				this.syncConsultantPeriodToLegacySystem();
				break;
		}
	}

	syncClientPeriodToLegacySystem() {
		this.showMainSpinner();
		let input = this._packClientPeriodData();
		this._contractSyncService
			.clientPeriodSync(this.periodId!, input)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(
				(result) => {
					this.fillClientPeriodForm(result?.clientPeriodContractsData!);
					this.processAfterSync(result.contractSyncResult);
				},
				() => {
					this.hideMainSpinner();
				}
			);
	}

	syncConsultantPeriodToLegacySystem() {
		this.showMainSpinner();
		let input = this._packConsultantPeriodData();
		this._contractSyncService
			.consultantPeriodSync(this.activeSideSection.consultantPeriodId!, input)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(
				(result) => {
					this.fillConsultantPeriodForm(result?.consultantPeriodContractsData!);
					this.processAfterSync(result.contractSyncResult);
				},
				() => {
					this.hideMainSpinner();
				}
			);
	}

	syncWorkflowTerminationToLegacySystem() {
		this.showMainSpinner();
		let input = this._packWorkflowTerminationData();
		this._contractSyncService
			.workflowTerminationSync(this.workflowId!, input)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(
				(result) => {
					this.fillWorkflowTerminationForm(result.workflowTerminationContractData!);
					this.processAfterSync(result.contractSyncResult);
				},
				() => {
					this.hideMainSpinner();
				}
			);
	}

	syncConsultantTerminationToLegacySystem() {
		this.showMainSpinner();
		let input = this._packConsultantTerminationData();
		this._contractSyncService
			.consultantTerminationSync(this.activeSideSection.consultantPeriodId!, input)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(
				(result) => {
					this.fillConsultantTerminationForm(result.consultantTerminationContractData!);
					this.processAfterSync(result.contractSyncResult);
				},
				() => {
					this.hideMainSpinner();
				}
			);
	}

	processAfterSync(result: ContractSyncResultDto | undefined) {
		if (!result) {
			return;
		}
		this.showMainSpinner();
		this.syncDataComponent.statusAfterSync = true;
		this.syncDataComponent.syncNotPossible = !result.success!;
		this.syncDataComponent.contractsSyncDataForm.enableLegalContractsButtons?.setValue(result.enableLegalContractsButtons!);
		this.syncDataComponent.contractsSyncDataForm.showManualOption?.setValue(result?.showManualOption, { emitEvent: false });
		this.syncDataComponent.syncMessage = result.success ? 'Sync successfull' : result.message!;
		if (result.success) {
			this.consultantDataComponent?.contractsConsultantsDataForm.consultants.controls.forEach((consultant: any) => {
				consultant.controls.projectLines.controls.forEach((x: any) => {
					x.controls.wasSynced.setValue(true, { emitEvent: false });
				});
			});
		}
		this.hideMainSpinner();
	}

	fillClientPeriodForm(data: ClientPeriodContractsDataQueryDto) {
		this.resetForms();
		if (data?.mainData !== undefined) {
			this.mainDataComponent?.contractsMainForm.patchValue(data?.mainData, { emitEvent: false });
			this.mainDataComponent?.contractsMainForm.salesType?.setValue(this.findItemById(this.saleTypes, data.mainData.salesTypeId), {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.deliveryType?.setValue(this.findItemById(this.deliveryTypes, data.mainData.deliveryTypeId), {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.discounts?.setValue(this.findItemById(this.discounts, data.mainData.discountId), {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.projectType?.setValue(this.findItemById(this.projectTypes, data.mainData.projectTypeId), {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.margin?.setValue(this.findItemById(this.margins, data.mainData.marginId), {
				emitEvent: false,
			});
			if (data.mainData.noRemarks) {
				this.mainDataComponent?.contractsMainForm.remarks?.disable();
			}
            if (data?.workflowDocuments?.length) {
                this.mainDataComponent.mainDocuments?.addExistingFile(data.workflowDocuments);
            }
		}
		if (data?.clientData !== undefined) {
			this.clientDataComponent?.contractClientForm.patchValue(data.clientData, { emitEvent: false });
            if (data?.clientData?.timeReportingCaps?.length) {
                for (let cap of data?.clientData?.timeReportingCaps) {
                    this.clientDataComponent.addTimeReportingCap(cap);
                }
            }
			this.clientDataComponent?.contractClientForm.rateUnitType?.setValue(
				this.findItemById(this.rateUnitTypes, data.clientData.clientRate?.rateUnitTypeId),
				{ emitEvent: false }
			);
			this.clientDataComponent?.contractClientForm.currency?.setValue(
				this.findItemById(this.currencies, data.clientData.clientRate?.currencyId),
				{ emitEvent: false }
			);
			if (data.clientData.noSpecialContractTerms) {
				this.clientDataComponent?.contractClientForm.specialContractTerms?.disable();
			}
			if (data.clientData.directClientId) {
				this.getRatesAndFees(data.clientData.directClientId);
			}
            this.purchaseOrderIds = data.clientData.purchaseOrdersIds;
            this.directClientId = data.clientData.directClientId;
            if (data.clientData.purchaseOrdersIds?.length) {
                this.clientDataComponent?.poComponent?.getPurchaseOrders(data.clientData.purchaseOrdersIds, data.clientData.directClientId, this.periodId);
            }
            this.clientDataComponent?.contractClientForm?.frameAgreementId.setValue(data?.clientData.frameAgreementId, {emitEvent: false});
            this.clientDataComponent.selectedFrameAgreementId = data?.clientData.frameAgreementId ?? null;
            this.clientDataComponent?.getInitialFrameAgreements();
		}
		this.syncDataComponent?.contractsSyncDataForm.patchValue(data, { emitEvent: false });
		if (data?.clientData?.periodClientSpecialRates?.length) {
			data.clientData.periodClientSpecialRates.forEach((rate: PeriodClientSpecialRateDto) => {
				this.clientDataComponent?.addSpecialRate(rate);
			});
		}
		if (data?.clientData?.periodClientSpecialFees?.length) {
			data.clientData.periodClientSpecialFees.forEach((fee: PeriodClientSpecialFeeDto) => {
				this.clientDataComponent?.addClientFee(fee);
			});
		}
		if (data?.consultantData?.length) {
			data.consultantData.forEach((consultant: ConsultantContractsDataQueryDto, index) => {
				this.consultantDataComponent?.addConsultantDataToForm(consultant, index, data?.clientData?.directClientId);
				this.consultantDataComponent?.addConsultantDataToForm(consultant, index);
                this.consultantDataComponent.selectedFrameAgreementList.push(consultant.frameAgreementId ?? null);
				this.syncDataComponent?.addConsultantLegalContract(consultant);
			});
			this.updateConsultantStepAnchors();
		}
        this.mainDataComponent.getPrimaryCategoryTree();
        if (this.isContractModuleEnabled) {
            this.clientDataComponent?.getFrameAgreements(true);
        }
	}

	private _packClientPeriodData(): ClientPeriodContractsDataCommandDto {
		let input = new ClientPeriodContractsDataCommandDto();
		input.bypassLegalValidation = this.bypassLegalValidation;
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
		input.clientData = new ContractsClientDataDto();
		input.clientData.specialContractTerms = this.clientDataComponent?.contractClientForm.specialContractTerms?.value;
		input.clientData.noSpecialContractTerms = this.clientDataComponent?.contractClientForm.noSpecialContractTerms?.value;
		input.clientData.clientTimeReportingCapId = this.clientDataComponent?.contractClientForm.clientTimeReportingCapId?.value;
        input.clientData.timeReportingCaps = new Array<TimeReportingCapDto>();
        if (this.clientDataComponent.contractClientForm.timeReportingCaps?.value.length) {
            for (let cap of this.clientDataComponent.contractClientForm.timeReportingCaps?.value) {
                let capInput = new TimeReportingCapDto(cap);
                capInput.id = new TimeReportingCapId(cap.id);
                input.clientData.timeReportingCaps.push(capInput);
            }
        }
		input.clientData.clientRate = this.clientDataComponent?.contractClientForm.clientRate?.value;
		input.clientData.pdcInvoicingEntityId = this.clientDataComponent?.contractClientForm.pdcInvoicingEntityId?.value;
		input.clientData.periodClientSpecialRates = new Array<PeriodClientSpecialRateDto>();
		if (this.clientDataComponent?.contractClientForm.clientRates.value?.length) {
			for (let specialRate of this.clientDataComponent?.contractClientForm.clientRates.value) {
				const clientSpecialRate = new PeriodClientSpecialRateDto();
				clientSpecialRate.id = specialRate.id;
				clientSpecialRate.clientSpecialRateId = specialRate.clientSpecialRateId;
				clientSpecialRate.rateName = specialRate.rateName;
				clientSpecialRate.reportingUnit = specialRate.reportingUnit;
				clientSpecialRate.clientRate = specialRate.clientRateValue;
				clientSpecialRate.clientRateCurrencyId = specialRate.clientRateCurrency?.id;
				input.clientData.periodClientSpecialRates.push(clientSpecialRate);
			}
		}
		input.clientData.noSpecialRate = this.clientDataComponent?.contractClientForm.clientRates.value?.length === 0;
		input.clientData.periodClientSpecialFees = new Array<PeriodClientSpecialFeeDto>();
		if (this.clientDataComponent?.contractClientForm.clientFees.value?.length) {
			for (let specialFee of this.clientDataComponent?.contractClientForm.clientFees.value) {
				const clientSpecialFee = new PeriodClientSpecialFeeDto();
				clientSpecialFee.id = specialFee.id;
				clientSpecialFee.clientSpecialFeeId = specialFee.clientSpecialFeeId;
				clientSpecialFee.feeName = specialFee.feeName;
				clientSpecialFee.frequency = specialFee.feeFrequency;
				clientSpecialFee.clientRate = specialFee.clientRateValue;
				clientSpecialFee.clientRateCurrencyId = specialFee.clientRateCurrency?.id;
				input.clientData.periodClientSpecialFees.push(clientSpecialFee);
			}
		}
		input.clientData.noSpecialFee = this.clientDataComponent?.contractClientForm.clientFees.value?.length === 0;
        input.clientData.purchaseOrdersIds = this.clientDataComponent?.poComponent?.purchaseOrders.value.map(x => x.id);
		input.contractLinesDoneManuallyInOldPm = this.syncDataComponent?.contractsSyncDataForm.contractLinesDoneManuallyInOldPm?.value ?? false;
        input.clientData.frameAgreementId = this.clientDataComponent.contractClientForm.frameAgreementId.value?.agreementId;
		input.mainData = new ContractsMainDataDto();
		input.mainData.projectDescription = this.mainDataComponent?.contractsMainForm.projectDescription?.value;
		input.mainData.projectName = this.mainDataComponent?.contractsMainForm.projectName?.value;
		input.mainData.projectTypeId = this.mainDataComponent?.contractsMainForm.projectType?.value?.id;
		input.mainData.salesTypeId = this.mainDataComponent?.contractsMainForm.salesType?.value?.id;
		input.mainData.deliveryTypeId = this.mainDataComponent?.contractsMainForm.deliveryType?.value?.id;
		input.mainData.marginId = this.mainDataComponent?.contractsMainForm.margin?.value?.id;
		input.mainData.discountId = this.mainDataComponent?.contractsMainForm.discounts?.value?.id;
		input.mainData.remarks = this.mainDataComponent?.contractsMainForm.remarks?.value;
		input.mainData.noRemarks = this.mainDataComponent?.contractsMainForm.noRemarks?.value;

		input.consultantData = new Array<ConsultantContractsDataCommandDto>();
		if (this.consultantDataComponent?.contractsConsultantsDataForm?.consultants?.value?.length) {
			for (let consultantInput of this.consultantDataComponent?.contractsConsultantsDataForm.consultants.value) {
				input.consultantData.push(this._packConsultantFormData(consultantInput));
			}
		}
		return input;
	}

	fillConsultantPeriodForm(data: ConsultantPeriodContractsDataQueryDto) {
		this.resetForms();
		if (data?.mainData !== undefined) {
			this.mainDataComponent?.contractsMainForm.patchValue(data, { emitEvent: false });
			this.mainDataComponent?.contractsMainForm.salesType?.setValue(this.findItemById(this.saleTypes, data?.mainData?.salesTypeId), {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.deliveryType?.setValue(this.findItemById(this.deliveryTypes, data?.mainData?.deliveryTypeId), {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.projectType?.setValue(this.findItemById(this.projectTypes, data?.mainData?.projectTypeId), {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.margin?.setValue(this.findItemById(this.margins, data?.mainData?.marginId), {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.discounts?.setValue(this.findItemById(this.discounts, data?.mainData?.discountId), {
				emitEvent: false,
			});
			if (data?.noRemarks) {
				this.mainDataComponent?.contractsMainForm.remarks?.disable();
			}
		}
		if (data?.clientData !== undefined) {
			this.clientDataComponent?.contractClientForm.patchValue(data.clientData, { emitEvent: false });
		}
		this.syncDataComponent?.contractsSyncDataForm.patchValue(data, { emitEvent: false });
		this.consultantDataComponent?.addConsultantDataToForm(data?.consultantData!, 0);
		this.syncDataComponent?.addConsultantLegalContract(data.consultantData!);
		this.updateConsultantStepAnchors();
	}

	private _packConsultantPeriodData(): ConsultantPeriodContractsDataCommandDto {
		let input = new ConsultantPeriodContractsDataCommandDto();
		input.bypassLegalValidation = this.bypassLegalValidation;
		input = this.mainDataComponent?.contractsMainForm.value;
		input.mainData = new ContractsMainDataDto();
		input.mainData.projectTypeId = this.mainDataComponent?.contractsMainForm.projectType?.value?.id;
		input.mainData.salesTypeId = this.mainDataComponent?.contractsMainForm.salesType?.value?.id;
		input.mainData.deliveryTypeId = this.mainDataComponent?.contractsMainForm.deliveryType?.value?.id;
		input.mainData.marginId = this.mainDataComponent?.contractsMainForm.margin?.value?.id;
		input.mainData.discountId = this.mainDataComponent?.contractsMainForm.discounts?.value?.id;

		input.consultantData = new ConsultantContractsDataCommandDto();
		const consultantInput = this.consultantDataComponent?.contractsConsultantsDataForm.consultants.at(0).value;
		if (consultantInput) {
			input.consultantData = this._packConsultantFormData(consultantInput);
		}
		input.contractLinesDoneManuallyInOldPm = this.syncDataComponent?.contractsSyncDataForm.contractLinesDoneManuallyInOldPm?.value;
		input.newLegalContractRequired = this.syncDataComponent?.contractsSyncDataForm.newLegalContract?.value;
		return input;
	}

	fillWorkflowTerminationForm(data: WorkflowTerminationContractDataQueryDto) {
		this.resetForms();
		this.syncDataComponent?.contractsSyncDataForm.patchValue(data, { emitEvent: false });
        this.syncDataComponent?.contractsSyncDataForm.contractLinesDoneManuallyInOldPm?.setValue(data?.contractLinesDoneManuallyInOldPm, {
			emitEvent: false,
		});
		data.consultantTerminationContractData?.forEach((consultant) => {
			this.addConsultantDataToTerminationForm(consultant);
		});
        if (data?.workflowDocuments?.length) {
            this.terminationDocuments?.addExistingFile(data.workflowDocuments);
        }
	}

	private _packWorkflowTerminationData(): WorkflowTerminationContractDataCommandDto {
		let input = new WorkflowTerminationContractDataCommandDto();
		input = this.syncDataComponent?.contractsSyncDataForm.value;
		input.consultantTerminationContractData = new Array<ConsultantTerminationContractDataCommandDto>();
		if (this.contractsTerminationConsultantForm.consultantTerminationContractData.value?.length) {
			this.contractsTerminationConsultantForm.consultantTerminationContractData.value.forEach((consultant: any) => {
				let consultantInput = new ConsultantTerminationContractDataCommandDto();
				consultantInput = consultant;
				input.consultantTerminationContractData!.push(consultantInput);
			});
		}
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

	fillConsultantTerminationForm(data: ConsultantTerminationContractDataQueryDto) {
		this.resetForms();
		this.syncDataComponent?.contractsSyncDataForm.contractLinesDoneManuallyInOldPm?.setValue(data?.contractLinesDoneManuallyInOldPm, {
			emitEvent: false,
		});
		this.addConsultantDataToTerminationForm(data);
	}

	private _packConsultantTerminationData(): ConsultantTerminationContractDataCommandDto {
		let input = new ConsultantTerminationContractDataCommandDto();
		input.consultantId = this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.consultantId;
		input.contractLinesDoneManuallyInOldPm = this.syncDataComponent?.contractsSyncDataForm.contractLinesDoneManuallyInOldPm?.value;
		input.removedConsultantFromAnyManualChecklists =
			this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.removedConsultantFromAnyManualChecklists;
		input.deletedAnySensitiveDocumentsForGDPR =
			this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.deletedAnySensitiveDocumentsForGDPR;
		return input;
	}

	private _packConsultantFormData(consultantInput: any): ConsultantContractsDataCommandDto {
		let consultantData = new ConsultantContractsDataCommandDto();
		consultantData.consultantPeriodId = consultantInput.consultantPeriodId;
		consultantData.employmentTypeId = consultantInput.consultantType?.id;
		consultantData.consultantId = consultantInput.consultantId;
		consultantData.nameOnly = consultantInput.nameOnly;
		consultantData.consultantTimeReportingCapId = consultantInput.consultantTimeReportingCapId;
		consultantData.timeReportingCaps = new Array<TimeReportingCapDto>();
        if (consultantInput.timeReportingCaps?.length) {
            for (let cap of consultantInput.timeReportingCaps) {
                let capInput = new TimeReportingCapDto(cap);
                capInput.id = new TimeReportingCapId(cap.id);
                consultantData.timeReportingCaps.push(capInput);
            }
        }
		consultantData.specialPaymentTerms = consultantInput.specialPaymentTerms;
		consultantData.noSpecialPaymentTerms = consultantInput.noSpecialPaymentTerms;
		consultantData.specialContractTerms = consultantInput.specialContractTerms;
		consultantData.noSpecialContractTerms = consultantInput.noSpecialContractTerms;
        consultantData.frameAgreementId = consultantInput.frameAgreementId?.agreementId;
		consultantData.periodConsultantSpecialFees = new Array<PeriodConsultantSpecialFeeDto>();
		if (consultantInput.clientFees?.length) {
			for (let specialFee of consultantInput.clientFees) {
				let consultantFee = new PeriodConsultantSpecialFeeDto();
				consultantFee.id = specialFee.id;
				consultantFee.clientSpecialFeeId = specialFee.clientSpecialFeeId;
				consultantFee.feeName = specialFee.feeName;
				consultantFee.frequency = specialFee.feeFrequency;
				consultantFee.prodataToProdataRate = specialFee.proDataRateValue;
				consultantFee.consultantRate = specialFee.consultantRateValue;
				consultantFee.prodataToProdataRateCurrencyId = specialFee.proDataRateCurrency?.id;
				consultantFee.consultantRateCurrencyId = specialFee.consultantRateCurrency?.id;
				consultantData.periodConsultantSpecialFees.push(consultantFee);
			}
		}
		consultantData.noSpecialFee = consultantInput.clientFees?.length === 0;
		consultantData.periodConsultantSpecialRates = new Array<PeriodConsultantSpecialRateDto>();
		if (consultantInput.specialRates?.length) {
			for (let specialRate of consultantInput.specialRates) {
				let consultantRate = new PeriodConsultantSpecialRateDto();
				consultantRate.id = specialRate.id;
				consultantRate.clientSpecialRateId = specialRate.clientSpecialRateId;
				consultantRate.rateName = specialRate.rateName;
				consultantRate.reportingUnit = specialRate.reportingUnit;
				consultantRate.prodataToProdataRate = specialRate.proDataRateValue;
				consultantRate.consultantRate = specialRate.consultantRateValue;
				consultantRate.prodataToProdataRateCurrencyId = specialRate.proDataRateCurrency?.id;
				consultantRate.consultantRateCurrencyId = specialRate.consultantRateCurrency?.id;
				consultantData.periodConsultantSpecialRates.push(consultantRate);
			}
		}
		consultantData.noSpecialRate = consultantInput.clientSpecialRates?.length === 0;
		consultantData.projectLines = new Array<ProjectLineDto>();
		if (consultantInput.projectLines?.length) {
			for (let projectLine of consultantInput.projectLines) {
				let projectLineInput = new ProjectLineDto();
				projectLineInput.id = projectLine.id;
				projectLineInput.projectName = projectLine.projectName;
				projectLineInput.startDate = projectLine.startDate;
				projectLineInput.endDate = projectLine.endDate;
				projectLineInput.noEndDate = projectLine.noEndDate;
				projectLineInput.differentInvoicingReferenceNumber = projectLine.differentInvoicingReferenceNumber;
				if (projectLineInput.differentInvoicingReferenceNumber) {
					projectLineInput.invoicingReferenceNumber = projectLine.invoicingReferenceNumber;
				}
				projectLineInput.differentInvoicingReferencePerson = projectLine.differentInvoicingReferencePerson;
				if (projectLineInput.differentInvoicingReferencePerson) {
					if (projectLine.invoicingReferencePerson?.id) {
						projectLineInput.invoicingReferencePersonId = projectLine.invoicingReferencePersonId;
						projectLineInput.invoicingReferencePerson = projectLine.invoicingReferencePerson;
					} else {
						projectLineInput.invoicingReferenceString = projectLine.invoicingReferencePersonId;
					}
				}
				projectLineInput.optionalInvoicingInfo = projectLine.optionalInvoicingInfo;
				projectLineInput.differentDebtorNumber = projectLine.differentDebtorNumber;
				if (projectLineInput.differentDebtorNumber) {
					projectLineInput.debtorNumber = projectLine.debtorNumber;
				}
				projectLineInput.differentInvoiceRecipient = projectLine.differentInvoiceRecipient;
				if (projectLineInput.differentInvoiceRecipient) {
					projectLineInput.invoiceRecipientId = projectLine.invoiceRecipientId;
					projectLineInput.invoiceRecipient = projectLine.invoiceRecipient;
				}
				projectLineInput.modifiedById = projectLine.modifiedById;
				projectLineInput.modifiedBy = projectLine.modifiedBy;
				projectLineInput.modificationDate = projectLine.modificationDate;
				projectLineInput.consultantInsuranceOptionId = projectLine.consultantInsuranceOptionId;
				projectLineInput.markedForLegacyDeletion = projectLine.markedForLegacyDeletion;
				projectLineInput.wasSynced = projectLine.wasSynced;
				projectLineInput.isLineForFees = projectLine.isLineForFees;
                projectLineInput.purchaseOrderId = projectLine.purchaseOrderId;

				consultantData.projectLines.push(projectLineInput);
			}
		}
		return consultantData;
	}

    submitTerminationConsultantForm() {
        if (this.submitFormBtn) {
            this.submitFormBtn.nativeElement.click();
        }
    }

    getAvailablePOs(directClientId: number) {
        this._purchaseOrderService
			.getPurchaseOrdersAvailableForClientPeriod(this.periodId, directClientId)
			.subscribe((result) => {
				this.purchaseOrders = result;
			});
    }

    get canToggleEditMode() {
		return this.permissionsForCurrentUser!['Edit'] && this.isCompleted;
	}

	get readOnlyMode() {
		return this.isCompleted;
	}

    get consultantTerminationContractData(): UntypedFormArray {
		return this.contractsTerminationConsultantForm.get('consultantTerminationContractData') as UntypedFormArray;
	}
}
