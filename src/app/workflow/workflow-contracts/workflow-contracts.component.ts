import { Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { EMPTY, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
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
    PurchaseOrderQueryDto,
    PurchaseOrderServiceProxy,
} from 'src/shared/service-proxies/service-proxies';
import {} from 'src/shared/service-proxies/service-proxies';
import { DocumentsComponent } from '../shared/components/wf-documents/wf-documents.component';
import { WorkflowDataService } from '../workflow-data.service';
import { EPermissions } from '../workflow-details/workflow-details.model';
import { WorkflowProcessWithAnchorsDto } from '../workflow-period/workflow-period.model';
import { ERateType, EmploymentTypes } from '../workflow.model';
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
import { ClientRateTypes } from '../workflow-sales/workflow-sales.model';
import { MapClientAddressList, PackAddressIntoNewDto } from '../workflow-sales/workflow-sales.helpers';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MediumDialogConfig } from 'src/shared/dialog.configs';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { Overlay } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { WorkflowHttpService } from '../shared/services/workflow-http.service';

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
	purchaseOrders: PurchaseOrderQueryDto[] = [];

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
	clientRateTypes = ClientRateTypes;
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
		private _purchaseOrderService: PurchaseOrderServiceProxy,
        private _overlay: Overlay,
        private _dialog: MatDialog,
        private _workflowHttpService: WorkflowHttpService
	) {
		super(injector);
		this.contractsTerminationConsultantForm = new WorkflowContractsTerminationConsultantsDataForm();
		this.consultantLegalContractsForm = new WorkflowConsultantsLegalContractForm();
		this._workflowDataService.updatePurchaseOrders
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((result: PurchaseOrderQueryDto) =>
				this.clientDataComponent.poComponent.updatePOs(result)
			);
	}

	ngOnInit(): void {
		this._getEnums();

		this._workflowDataService.updateWorkflowProgressStatus({
			currentStepIsCompleted: this.isCompleted,
			currentStepIsForcefullyEditing: false,
		});
		if (this.permissionsForCurrentUser![EPermissions.StartEdit]) {
			this.startEditContractStep();
		} else {
			this.getContractStepData();
		}

		this._workflowDataService.contractStepSaved
			.pipe(takeUntil(this._unsubscribe))
			.subscribe((value: { isDraft: boolean; bypassLegalValidation?: boolean | undefined }) => {
				this.bypassLegalValidation = value.bypassLegalValidation!;
				if (value.isDraft && !this.editEnabledForcefuly) {
					this.saveContractStepData(value.isDraft);
				} else {
					if (this.validateContractForm()) {
						this.saveContractStepData(value.isDraft);
					} else {
						this.scrollToFirstError(value.isDraft);
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
		this.consultantDataComponent?.submitForm();
		this.submitTerminationConsultantForm();
		this.mainDataComponent?.contractsMainForm.markAllAsTouched();
		this.syncDataComponent?.contractsSyncDataForm.markAllAsTouched();
		this.consultantDataComponent?.contractsConsultantsDataForm.markAllAsTouched();
		this.contractsTerminationConsultantForm.markAllAsTouched();
		this.validationTriggered = true;
		switch (this.activeSideSection.typeId) {
			case WorkflowProcessType.StartClientPeriod:
			case WorkflowProcessType.ChangeClientPeriod:
			case WorkflowProcessType.ExtendClientPeriod:
                this.clientDataComponent?.submitForm();
		        this.clientDataComponent?.contractClientForm.markAllAsTouched();
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
            case WorkflowProcessType.StartConsultantPeriod:
            case WorkflowProcessType.ChangeConsultantPeriod:
            case WorkflowProcessType.ExtendConsultantPeriod:
                return (
					this.mainDataComponent?.contractsMainForm.valid &&
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
		this._workflowDocumentsService.overviewAll(this.workflowId, this.periodId).subscribe((result) => {
			if (this.mainDataComponent?.mainDocuments) {
				this.mainDataComponent.mainDocuments.clearDocuments();
                if (result.length) {
                    this.mainDataComponent.mainDocuments.addExistingFile(result);
                }
			}
			if (this.terminationDocuments) {
				this.terminationDocuments.clearDocuments();
                if (result.length) {
                    const terminationDocs = result.filter(doc => doc.workflowTerminationId !== null && doc.workflowTerminationId !== undefined);
                    this.terminationDocuments.addExistingFile(terminationDocs);
                }
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
		let consultantNames = this.consultantDataComponent?.contractsConsultantsDataForm.consultants.value.map((item: any) => {
			if (item.employmentTypeId === EmploymentTypes.FeeOnly || item.employmentTypeId === EmploymentTypes.Recruitment) {
				return { employmentType: item.employmentTypeId, name: item.nameOnly };
			} else {
				return { employmentType: item.employmentTypeId, name: item.consultant?.name };
			}
		});
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

	saveStartChangeOrExtendClientPeriodContracts(isDraft: boolean, skipOptionalLegalContractsValidation: boolean = false) {
		let input = this._packClientPeriodData(skipOptionalLegalContractsValidation);
		this.showMainSpinner();
		if (isDraft) {
			this._clientPeriodService
				.clientContractsPUT(this.periodId!, input)
				.pipe(
					finalize(() => {
						this._tempUpdateDocuments();
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
            this._workflowHttpService.contractStepComplete(this.periodId!, input)
				.pipe(
                    finalize(() => {
                        this.bypassLegalValidation = false;
						this._tempUpdateDocuments();
                        this.hideMainSpinner();
                    }),
					catchError((error: HttpErrorResponse) => {
						if (error.error.error?.ignoreFlag === 'skipOptionalLegalContractsValidation') {
                            this._skipLegalContracValidation(error.error.error?.message ,isDraft);
						} else {
                            this._workflowHttpService.handleError(error);
                        }
						return EMPTY;
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

	saveStartChangeOrExtendConsultantPeriodContracts(isDraft: boolean, skipOptionalLegalContractsValidation: boolean = false) {
		let input = this._packConsultantPeriodData(skipOptionalLegalContractsValidation);
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
						this._tempUpdateDocuments();
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
				.terminationContractComplete(this.workflowId!, input)
				.pipe(
					finalize(() => {
						this._tempUpdateDocuments();
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
        this._scrollToService.scrollTo({target: 'syncLegalContractAnchor'});
		this.hideMainSpinner();
	}

	fillClientPeriodForm(data: ClientPeriodContractsDataQueryDto) {
		this.resetForms();
		if (data?.mainData !== undefined) {
			this.mainDataComponent?.contractsMainForm.patchValue(data?.mainData, { emitEvent: false });
			this.mainDataComponent?.contractsMainForm.salesTypeId?.setValue(data.mainData.salesTypeId,{emitEvent: false});
			this.mainDataComponent?.contractsMainForm.deliveryTypeId?.setValue(data.mainData.deliveryTypeId,{emitEvent: false});
			this.mainDataComponent?.contractsMainForm.discountId?.setValue(data.mainData.discountId, {emitEvent: false});
			this.mainDataComponent?.contractsMainForm.projectTypeId?.setValue(data.mainData.projectTypeId, {emitEvent: false});
			this.mainDataComponent?.contractsMainForm.marginId?.setValue(data.mainData.marginId, {emitEvent: false});
			data.mainData.noRemarks
				? this.mainDataComponent?.contractsMainForm.remarks?.disable()
				: this.mainDataComponent?.contractsMainForm.remarks?.enable();
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
			this.clientDataComponent?.contractClientForm.rateUnitTypeId?.setValue(data.clientData.clientRate?.rateUnitTypeId, {emitEvent: false });
			this.clientDataComponent?.contractClientForm.currencyId?.setValue( data.clientData.clientRate?.currencyId, { emitEvent: false });
			this.clientDataComponent?.contractClientForm.normalRate?.setValue(data.clientData.clientRate?.normalRate, {
				emitEvent: false,
			});
			let clientRateType = ERateType.TimeBased; // default value is 'Time based'
			if (data.clientData?.clientRate?.isFixedRate) {
				clientRateType = ERateType.Fixed;
			} else if (data.clientData?.clientRate?.isTimeBasedRate) {
				clientRateType = ERateType.TimeBased;
			}
			this.clientDataComponent?.contractClientForm.clientRateTypeId?.setValue(clientRateType, {
				emitEVent: false,
			});
			this.clientDataComponent?.contractClientForm.invoiceCurrencyId?.setValue(
				data.clientData.clientRate.invoiceCurrencyId,
				{
					emitEVent: false,
				}
			);
			this.clientDataComponent?.contractClientForm.invoiceFrequencyId?.setValue(
				data.clientData.clientRate.invoiceFrequencyId,
				{
					emitEVent: false,
				}
			);
			this.clientDataComponent?.contractClientForm.invoicingTimeId?.setValue(data.clientData.clientRate.invoicingTimeId, {
				emitEVent: false,
			});
			this.clientDataComponent?.contractClientForm.manualDate?.setValue(data.clientData.clientRate.manualDate, {
				emitEVent: false,
			});
			this.clientDataComponent.contractClientForm?.clientInvoicingRecipientSameAsDirectClient?.setValue(
				data.clientData.clientInvoicingRecipientSameAsDirectClient,
				{ emitEvent: false }
			);
			if (data.clientData.clientInvoicingRecipient?.clientId) {
				this.clientDataComponent.filteredClientInvoicingRecipients = [data.clientData.clientInvoicingRecipient];
				this.clientDataComponent.invoicingRecipientsAddresses = MapClientAddressList(
					data.clientData.clientInvoicingRecipient.clientAddresses
				);
			}
			if (data?.clientData?.clientInvoicingRecipientAddress) {
				this.clientDataComponent.contractClientForm.clientInvoicingRecipientAddress.setValue(
					PackAddressIntoNewDto(data?.clientData?.clientInvoicingRecipientAddress),
					{ emitEvent: false }
				);
			}
			data.clientData.noSpecialContractTerms ?
				this.clientDataComponent?.contractClientForm.specialContractTerms?.disable() :
                this.clientDataComponent?.contractClientForm.specialContractTerms?.enable();
			if (data.clientData.directClientId) {
				this.getRatesAndFees(data.clientData.directClientId);
			}
			this.purchaseOrderIds = data.clientData.purchaseOrdersIds;
			this.directClientId = data.clientData.directClientId;
			if (data.clientData.purchaseOrdersIds?.length) {
				this.clientDataComponent?.poComponent?.getPurchaseOrders(
					data.clientData.purchaseOrdersIds,
					data.clientData.directClientId,
					this.periodId
				);
			}
			this.clientDataComponent?.contractClientForm?.frameAgreementId.setValue(data?.clientData.frameAgreementId, {
				emitEvent: false,
			});
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
				this.consultantDataComponent.selectedFrameAgreementList[index] = consultant.consultantFrameAgreementId ?? null;
				this.consultantDataComponent.selectedEmagineFrameAgreementList[index] = consultant.emagineToEmagineFrameAgreementId ?? null;
				this.syncDataComponent?.addConsultantLegalContract(consultant);
			});
			this.updateConsultantStepAnchors();
		}
		this.mainDataComponent.getPrimaryCategoryTree();
		if (this.isContractModuleEnabled) {
			this.clientDataComponent?.getFrameAgreements(true);
		}
	}

	private _packClientPeriodData(skipOptionalLegalContractsValidation: boolean = false): ClientPeriodContractsDataCommandDto {
		let input = new ClientPeriodContractsDataCommandDto();
        // FIXME: temporary fix as requested in https://prodatadk.atlassian.net/browse/CN-458?focusedCommentId=17473
		// input.bypassLegalValidation = this.bypassLegalValidation;
        input.bypassLegalValidation = true;
        // FIXME: temporary fix
        input.skipOptionalLegalContractsValidation = skipOptionalLegalContractsValidation;
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
				input.clientData.timeReportingCaps.push(capInput);
			}
		}
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
				clientSpecialRate.clientRateCurrencyId = specialRate.clientRateCurrencyId;
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
				clientSpecialFee.clientRateCurrencyId = specialFee.clientRateCurrencyId;
				input.clientData.periodClientSpecialFees.push(clientSpecialFee);
			}
		}
		input.clientData.noSpecialFee = this.clientDataComponent?.contractClientForm.clientFees.value?.length === 0;
		input.clientData.purchaseOrdersIds = this.clientDataComponent?.poComponent?.purchaseOrders.value.map((x) => x.id);
		input.contractLinesDoneManuallyInOldPm =
			this.syncDataComponent?.contractsSyncDataForm.contractLinesDoneManuallyInOldPm?.value ?? false;
		input.clientData.frameAgreementId = this.clientDataComponent.contractClientForm.frameAgreementId.value?.agreementId;
		input.mainData = new ContractsMainDataDto();
		input.mainData.projectDescription = this.mainDataComponent?.contractsMainForm.projectDescription?.value;
		input.mainData.projectName = this.mainDataComponent?.contractsMainForm.projectName?.value;
		input.mainData.projectTypeId = this.mainDataComponent?.contractsMainForm.projectTypeId?.value;
		input.mainData.salesTypeId = this.mainDataComponent?.contractsMainForm.salesTypeId?.value;
		input.mainData.deliveryTypeId = this.mainDataComponent?.contractsMainForm.deliveryTypeId?.value;
		input.mainData.marginId = this.mainDataComponent?.contractsMainForm.marginId?.value;
		input.mainData.discountId = this.mainDataComponent?.contractsMainForm.discountId?.value;
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
			this.mainDataComponent?.contractsMainForm.salesTypeId?.setValue(data?.mainData?.salesTypeId, { emitEvent: false });
			this.mainDataComponent?.contractsMainForm.deliveryTypeId?.setValue(data?.mainData?.deliveryTypeId, {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.projectTypeId?.setValue(data?.mainData?.projectTypeId, {
				emitEvent: false,
			});
			this.mainDataComponent?.contractsMainForm.marginId?.setValue(data?.mainData?.marginId, { emitEvent: false });
			this.mainDataComponent?.contractsMainForm.discountId?.setValue(data?.mainData?.discountId, { emitEvent: false });
			data?.noRemarks
				? this.mainDataComponent?.contractsMainForm.remarks?.disable()
				: this.mainDataComponent?.contractsMainForm.remarks?.enable();
		}
		if (data?.clientData !== undefined) {
			this.clientDataComponent?.contractClientForm.patchValue(data.clientData, { emitEvent: false });
		}
		this.syncDataComponent?.contractsSyncDataForm.patchValue(data, { emitEvent: false });
		this.consultantDataComponent?.addConsultantDataToForm(data?.consultantData!, 0);
        this.consultantDataComponent.selectedFrameAgreementList[0] = data?.consultantData!.consultantFrameAgreementId ?? null;
        this.consultantDataComponent.selectedEmagineFrameAgreementList[0] = data?.consultantData!.emagineToEmagineFrameAgreementId ?? null;
		this.syncDataComponent?.addConsultantLegalContract(data.consultantData!);
		this.updateConsultantStepAnchors();
	}

	private _packConsultantPeriodData(skipOptionalLegalContractsValidation: boolean = false): ConsultantPeriodContractsDataCommandDto {
		let input = new ConsultantPeriodContractsDataCommandDto();
		// FIXME: temporary fix as requested in https://prodatadk.atlassian.net/browse/CN-458?focusedCommentId=17473
		// input.bypassLegalValidation = this.bypassLegalValidation;
        // input.bypassLegalValidation = true;
        // FIXME: temporary fix
        input.bypassLegalValidation = false;
        input.skipOptionalLegalContractsValidation = skipOptionalLegalContractsValidation;
		input = this.mainDataComponent?.contractsMainForm.value;
		input.mainData = new ContractsMainDataDto();
		input.mainData.projectTypeId = this.mainDataComponent?.contractsMainForm.projectTypeId?.value;
		input.mainData.salesTypeId = this.mainDataComponent?.contractsMainForm.salesTypeId?.value;
		input.mainData.deliveryTypeId = this.mainDataComponent?.contractsMainForm.deliveryTypeId?.value;
		input.mainData.marginId = this.mainDataComponent?.contractsMainForm.marginId?.value;
		input.mainData.discountId = this.mainDataComponent?.contractsMainForm.discountId?.value;

		input.consultantData = new ConsultantContractsDataCommandDto();
		const consultantInput = this.consultantDataComponent?.contractsConsultantsDataForm.consultants.at(0).value;
		if (consultantInput) {
			input.consultantData = this._packConsultantFormData(consultantInput);
		}
		input.contractLinesDoneManuallyInOldPm =
			this.syncDataComponent?.contractsSyncDataForm.contractLinesDoneManuallyInOldPm?.value;
		input.newLegalContractRequired = this.syncDataComponent?.contractsSyncDataForm.newLegalContract?.value;
		return input;
	}

	fillWorkflowTerminationForm(data: WorkflowTerminationContractDataQueryDto) {
		this.resetForms();
		this.syncDataComponent?.contractsSyncDataForm.patchValue(data, { emitEvent: false });
		this.syncDataComponent?.contractsSyncDataForm.contractLinesDoneManuallyInOldPm?.setValue(
			data?.contractLinesDoneManuallyInOldPm,
			{
				emitEvent: false,
			}
		);
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
		this.syncDataComponent?.contractsSyncDataForm.contractLinesDoneManuallyInOldPm?.setValue(
			data?.contractLinesDoneManuallyInOldPm,
			{
				emitEvent: false,
			}
		);
		this.addConsultantDataToTerminationForm(data);
	}

	private _packConsultantTerminationData(): ConsultantTerminationContractDataCommandDto {
		let input = new ConsultantTerminationContractDataCommandDto();
		input.consultantId = this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.consultantId;
		input.contractLinesDoneManuallyInOldPm =
			this.syncDataComponent?.contractsSyncDataForm.contractLinesDoneManuallyInOldPm?.value;
		input.removedConsultantFromAnyManualChecklists =
			this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.removedConsultantFromAnyManualChecklists;
		input.deletedAnySensitiveDocumentsForGDPR =
			this.contractsTerminationConsultantForm.consultantTerminationContractData?.value.deletedAnySensitiveDocumentsForGDPR;
		return input;
	}

	private _packConsultantFormData(consultantInput: any): ConsultantContractsDataCommandDto {
		let consultantData = new ConsultantContractsDataCommandDto();
		consultantData.consultantPeriodId = consultantInput.consultantPeriodId;
		consultantData.employmentTypeId = consultantInput.employmentTypeId;
		consultantData.consultantId = consultantInput.consultantId;
		consultantData.nameOnly = consultantInput.nameOnly;
		consultantData.consultantTimeReportingCapId = consultantInput.consultantTimeReportingCapId;
		consultantData.timeReportingCaps = new Array<TimeReportingCapDto>();
		if (consultantInput.timeReportingCaps?.length) {
			for (let cap of consultantInput.timeReportingCaps) {
                if (!cap.isCopyFromClientPeriodToConsultant) {
                    let capInput = new TimeReportingCapDto(cap);
                    consultantData.timeReportingCaps.push(capInput);
                }
			}
		}
		consultantData.specialPaymentTerms = consultantInput.specialPaymentTerms;
		consultantData.noSpecialPaymentTerms = consultantInput.noSpecialPaymentTerms;
		consultantData.specialContractTerms = consultantInput.specialContractTerms;
		consultantData.noSpecialContractTerms = consultantInput.noSpecialContractTerms;
		consultantData.consultantFrameAgreementId = consultantInput.frameAgreementId?.agreementId;
		consultantData.emagineToEmagineFrameAgreementId = consultantInput.emagineFrameAgreementId?.agreementId;
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
				consultantFee.prodataToProdataRateCurrencyId = specialFee.proDataRateCurrencyId;
				consultantFee.consultantRateCurrencyId = specialFee.consultantRateCurrencyId;
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
				consultantRate.prodataToProdataRateCurrencyId = specialRate.proDataRateCurrencyId;
				consultantRate.consultantRateCurrencyId = specialRate.consultantRateCurrencyId;
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
					projectLineInput.invoiceRecipientAddressId = projectLine.invoiceRecipientAddressId;
					projectLineInput.invoiceRecipientAddress = projectLine.invoiceRecipientAddress;
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

    private _skipLegalContracValidation(message: string, isDraft: boolean) {
        const scrollStrategy = this._overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			confirmationMessageTitle: `Complete step`,
			confirmationMessage: `${message} \n Are you sure you want to proceed?`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Proceed anyway',
			isNegative: true,
		};
		const dialogRef = this._dialog.open(ConfirmationDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe(() => {
			this.saveStartChangeOrExtendClientPeriodContracts(isDraft, true);
		});
    }

	get canToggleEditMode() {
		return this.permissionsForCurrentUser![EPermissions.Edit] && this.isCompleted;
	}

	get readOnlyMode() {
		return this.isCompleted;
	}

	get consultantTerminationContractData(): UntypedFormArray {
		return this.contractsTerminationConsultantForm.get('consultantTerminationContractData') as UntypedFormArray;
	}
}
