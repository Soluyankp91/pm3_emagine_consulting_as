import { Overlay } from '@angular/cdk/overlay';
import { Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { EValueUnitTypes } from '../../workflow-sales/workflow-sales.model';
import { Subject } from 'rxjs';
import { debounceTime, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
	AgreementSimpleListItemDto,
	AgreementSimpleListItemDtoPaginatedList,
	AgreementType,
	ClientSpecialFeeDto,
	ClientSpecialRateDto,
	ConsultantContractsDataQueryDto,
	ConsultantResultDto,
	EnumEntityTypeDto,
	FrameAgreementServiceProxy,
	PeriodConsultantSpecialFeeDto,
	PeriodConsultantSpecialRateDto,
	ProjectLineDto,
    PurchaseOrderCapType,
    PurchaseOrderDto,
    PurchaseOrderServiceProxy,
    TimeReportingCapDto,
} from 'src/shared/service-proxies/service-proxies';
import { WorkflowDataService } from '../../workflow-data.service';
import { EmploymentTypes, ProjectLineDiallogMode } from '../../workflow.model';
import { AddOrEditProjectLineDialogComponent } from '../add-or-edit-project-line-dialog/add-or-edit-project-line-dialog.component';
import { ClientTimeReportingCaps, WorkflowContractsConsultantsDataForm } from '../workflow-contracts.model';

@Component({
	selector: 'app-contracts-consultant-data',
	templateUrl: './contracts-consultant-data.component.html',
	styleUrls: ['../workflow-contracts.component.scss'],
})
export class ContractsConsultantDataComponent extends AppComponentBase implements OnInit, OnDestroy {
	@ViewChild('submitFormBtn', { read: ElementRef }) submitFormBtn: ElementRef;
	@Input() readOnlyMode: boolean;
	@Input() periodId: string;
	@Input() contractsMainForm: any;
	@Input() contractClientForm: any;
	@Input() clientSpecialRateList: ClientSpecialRateDto[];
	@Input() clientSpecialFeeList: ClientSpecialFeeDto[];
	purchaseOrders: PurchaseOrderDto[] = [];
	contractsConsultantsDataForm: WorkflowContractsConsultantsDataForm;
	clientTimeReportingCaps = ClientTimeReportingCaps;
	employmentTypes: EnumEntityTypeDto[];
	consultantTimeReportingCap: EnumEntityTypeDto[];
	currencies: EnumEntityTypeDto[];
	consultantInsuranceOptions: { [key: string]: string };
	filteredConsultants: ConsultantResultDto[] = [];
	valueUnitTypes: EnumEntityTypeDto[];
	periodUnitTypes: EnumEntityTypeDto[];

	consultantRateToEdit: PeriodConsultantSpecialRateDto;
	isConsultantRateEditing = false;
	consultantFeeToEdit: PeriodConsultantSpecialFeeDto;
	isConsultantFeeEditing = false;
	eValueUnitType = EValueUnitTypes;
	ePOCaps = PurchaseOrderCapType;
	purchaseOrderCapTypes: { [key: string]: string };
	eCurrencies: { [key: number]: string };
	directClientId: number;
	filteredFrameAgreements = new Array<AgreementSimpleListItemDto[]>();
	isContractModuleEnabled = this._workflowDataService.contractModuleEnabled;
	selectedFrameAgreementList = new Array<null | number>();
	private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
		private overlay: Overlay,
		private dialog: MatDialog,
		private _fb: UntypedFormBuilder,
		private _purchaseOrderService: PurchaseOrderServiceProxy,
		private _workflowDataService: WorkflowDataService,
		private _frameAgreementServiceProxy: FrameAgreementServiceProxy
	) {
		super(injector);
		this.contractsConsultantsDataForm = new WorkflowContractsConsultantsDataForm();
		this._workflowDataService.updatePurchaseOrders
			.pipe(takeUntil(this._unsubscribe))
			.subscribe(() => this.getPOsToUpdateValues(this.directClientId));
	}

	ngOnInit(): void {
		this._getEnums();
	}

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	getPOsToUpdateValues(directClientId: number) {
		this._purchaseOrderService
			.getPurchaseOrdersAvailableForClientPeriod(this.periodId, directClientId)
			.subscribe((result) => {
				this.purchaseOrders = result;
				this._updateProjectLinePOs();
			});
	}

	getInitialFrameAgreements(consultant: ConsultantContractsDataQueryDto, consultantIndex: number) {
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

	getFrameAgreements(consultant: ConsultantContractsDataQueryDto, isInitial = false, search: string = '') {
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
			recipientClientIds: [this.contractClientForm.directClientId.value, this.contractClientForm.endClientId.value].filter(
				Boolean
			),
			recipientConsultantId: consultant.consultantId,
			recipientSupplierId: consultant.consultant.supplierId,
			pageNumber: 1,
			pageSize: 1000,
			sort: '',
		};
		return this._frameAgreementServiceProxy.consultantFrameAgreementList(
			dataToSend.agreementId,
			dataToSend.search,
			dataToSend.legalEntityId,
			dataToSend.salesTypeId,
			dataToSend.contractTypeId,
			dataToSend.deliveryTypeId,
			dataToSend.startDate,
			dataToSend.endDate,
			dataToSend.recipientConsultantId || undefined, //recipientConsultantId
			dataToSend.recipientSupplierId || undefined,
			dataToSend.pageNumber,
			dataToSend.pageSize,
			dataToSend.sort
		);
	}

	private _checkAndPreselectFrameAgreement(consultantIndex: number) {
		if (
			this.contractClientForm.directClientId.value !== null &&
			this.contractClientForm.directClientId.value !== undefined &&
			this.contractsMainForm.salesType.value?.id !== null &&
			this.contractsMainForm.salesType.value?.id !== undefined &&
			this.contractsMainForm.deliveryType.value?.id !== null &&
			this.contractsMainForm.deliveryType.value?.id !== undefined
		) {
			if (this.filteredFrameAgreements[consultantIndex].length === 1) {
				this.contractsConsultantsDataForm.consultants.controls.forEach((form) => {
					form.get('frameAgreementId').setValue(this.filteredFrameAgreements[consultantIndex][0], { emitEvent: false });
				});
			}
		}
	}

	addConsultantDataToForm(consultant: ConsultantContractsDataQueryDto, consultantIndex: number, directClientId?: number) {
		this.directClientId = directClientId;
		const form = this._fb.group({
			consultantPeriodId: new UntypedFormControl(consultant?.consultantPeriodId),
			consultantId: new UntypedFormControl(consultant?.consultantId),
			consultant: new UntypedFormControl(consultant?.consultant),
			nameOnly: new UntypedFormControl(consultant?.nameOnly),
			startDate: new UntypedFormControl(consultant?.startDate),
			endDate: new UntypedFormControl(consultant?.endDate),
			noEndDate: new UntypedFormControl(consultant?.noEndDate),
			consultantType: new UntypedFormControl(this.findItemById(this.employmentTypes, consultant?.employmentTypeId)),
			consultantTimeReportingCapId: new UntypedFormControl(consultant?.consultantTimeReportingCapId),
			consultantRateUnitType: new UntypedFormControl(
				this.findItemById(this.currencies, consultant?.consultantRate?.rateUnitTypeId)
			),
			consultantRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, consultant?.consultantRate?.currencyId)
			),
			consultantRate: new UntypedFormControl(consultant.consultantRate),
			noSpecialContractTerms: new UntypedFormControl(consultant?.noSpecialContractTerms),
			specialContractTerms: new UntypedFormControl(
				{
					value: consultant?.specialContractTerms,
					disabled: consultant?.noSpecialContractTerms,
				},
				Validators.required
			),
			pdcPaymentEntityId: new UntypedFormControl(consultant?.pdcPaymentEntityId),
			specialPaymentTerms: new UntypedFormControl(
				{
					value: consultant?.specialPaymentTerms,
					disabled: consultant?.noSpecialPaymentTerms,
				},
				Validators.required
			),
			noSpecialPaymentTerms: new UntypedFormControl(consultant?.noSpecialPaymentTerms ?? false),
			frameAgreementId: new UntypedFormControl(consultant?.frameAgreementId ?? null),
			specialRates: new UntypedFormArray([]),
			consultantSpecialRateFilter: new UntypedFormControl(''),
			clientFees: new UntypedFormArray([]),
			consultantSpecialFeeFilter: new UntypedFormControl(''),
			projectLines: new UntypedFormArray([], Validators.minLength(1)),
		});
		this.contractsConsultantsDataForm.consultants.push(form);
		consultant.projectLines?.forEach((project: any) => {
			this.addProjectLinesToConsultantData(consultantIndex, project);
		});
		consultant.timeReportingCaps?.forEach((cap) => {
			this.addConsultantCap(consultantIndex, cap);
		});
		consultant.periodConsultantSpecialFees?.forEach((fee: any) => {
			this.addClientFeesToConsultantData(consultantIndex, fee);
		});
		consultant.periodConsultantSpecialRates?.forEach((rate: any) => {
			this.addSpecialRateToConsultantData(consultantIndex, rate);
		});
		if (this.isContractModuleEnabled) {
			this.filteredFrameAgreements.push([]);
			if (
				consultant.employmentTypeId !== EmploymentTypes.FeeOnly &&
				consultant.employmentTypeId !== EmploymentTypes.Recruitment
			) {
				// this.manageFrameAgreementAutocomplete(consultant.consultantId, consultantIndex);
				this.manageFrameAgreementAutocomplete(consultant, consultantIndex);

				this.getInitialFrameAgreements(consultant, consultantIndex);
			}
		}

		this.filteredConsultants.push(consultant.consultant!);
		if (directClientId) {
			this.getPOsToUpdateValues(directClientId);
		}
	}

	manageFrameAgreementAutocomplete(consultant: ConsultantContractsDataQueryDto, consultantIndex: number) {
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

	selectConsultantSpecialRate(consultantIndex: number, rate: ClientSpecialRateDto, consultantRateMenuTrigger: MatMenuTrigger) {
		const consultantRate = new PeriodConsultantSpecialRateDto();
		consultantRate.id = undefined;
		consultantRate.clientSpecialRateId = rate.id;
		consultantRate.rateName = rate.internalName;
		consultantRate.reportingUnit = rate.specialRateReportingUnit;
		consultantRate.prodataToProdataRate = rate.proDataToProDataRate;
		consultantRate.prodataToProdataRateCurrencyId = rate.proDataToProDataRateCurrency?.id;
		consultantRate.consultantRate = rate.consultantRate;
		consultantRate.consultantRateCurrencyId = rate.consultantCurrency?.id;
		consultantRate.rateSpecifiedAs = rate.specialRateSpecifiedAs;
		if (consultantRate.rateSpecifiedAs?.id === 1) {
			consultantRate.prodataToProdataRate = +(
				(this.contractsConsultantsDataForm.consultants.at(consultantIndex)!.get('consultantRate')!.value?.normalRate *
					rate.proDataToProDataRate!) /
				100
			).toFixed(2);
			consultantRate.prodataToProdataRateCurrencyId = this.contractsConsultantsDataForm.consultants
				.at(consultantIndex)!
				.get('consultantRateCurrency')!.value?.id;
			consultantRate.consultantRate = +(
				(this.contractsConsultantsDataForm.consultants.at(consultantIndex)!.get('consultantRate')!.value?.normalRate *
					rate.consultantRate!) /
				100
			).toFixed(2);
			consultantRate.consultantRateCurrencyId = this.contractsConsultantsDataForm.consultants
				.at(consultantIndex)!
				.get('consultantRateCurrency')!.value?.id;
		} else {
			consultantRate.prodataToProdataRate = rate.proDataToProDataRate;
			consultantRate.prodataToProdataRateCurrencyId = rate.proDataToProDataRateCurrency?.id;
			consultantRate.consultantRate = rate.consultantRate;
			consultantRate.consultantRateCurrencyId = rate.consultantCurrency?.id;
		}
		consultantRateMenuTrigger.closeMenu();
		this.addSpecialRateToConsultantData(consultantIndex, consultantRate);
	}

	addSpecialRateToConsultantData(index: number, clientRate?: PeriodConsultantSpecialRateDto) {
		const form = this._fb.group({
			id: new UntypedFormControl(clientRate?.id ?? null),
			clientSpecialRateId: new UntypedFormControl(clientRate?.clientSpecialRateId ?? null),
			rateName: new UntypedFormControl(clientRate?.rateName ?? null),
			reportingUnit: new UntypedFormControl(clientRate?.reportingUnit ?? null),
			proDataRateValue: new UntypedFormControl(clientRate?.prodataToProdataRate ?? null),
			proDataRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, clientRate?.prodataToProdataRateCurrencyId) ?? null
			),
			consultantRateValue: new UntypedFormControl(clientRate?.consultantRate ?? null),
			consultantRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, clientRate?.consultantRateCurrencyId) ?? null
			),
			editable: new UntypedFormControl(clientRate ? false : true),
		});

		(this.contractsConsultantsDataForm.consultants.at(index).get('specialRates') as UntypedFormArray).push(form);
	}

	removeConsultantDataSpecialRate(consultantIndex: number, rateIndex: number) {
		(this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray).removeAt(
			rateIndex
		);
	}

	editOrSaveConsultantSpecialRate(isEditable: boolean, consultantIndex: number, rateIndex: number) {
		if (isEditable) {
			this.consultantRateToEdit = new PeriodConsultantSpecialRateDto();
			this.isConsultantRateEditing = false;
		} else {
			const consultantRateValue = (this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray).at(
				rateIndex
			).value;
			this.consultantRateToEdit = new PeriodConsultantSpecialRateDto({
				id: consultantRateValue.id,
				clientSpecialRateId: consultantRateValue.clientSpecialRateId,
				rateName: consultantRateValue.rateName,
				reportingUnit: consultantRateValue.reportingUnit,
				prodataToProdataRate: consultantRateValue.proDataRateValue,
				prodataToProdataRateCurrencyId: consultantRateValue.proDataRateCurrency?.id,
				consultantRate: consultantRateValue.consultantRateValue,
				consultantRateCurrencyId: consultantRateValue.consultantRateCurrency?.id,
			});
			this.isConsultantRateEditing = true;
		}
		(this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray)
			.at(rateIndex)
			.get('editable')
			?.setValue(!isEditable, { emitEvent: false });
	}

	cancelEditConsultantRate(consultantIndex: number, specialRateIndex: number) {
		const rateRow = (this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray).at(specialRateIndex);
		rateRow?.get('proDataRateValue')?.setValue(this.consultantRateToEdit.prodataToProdataRate, { emitEvent: false });
		rateRow
			?.get('proDataRateCurrency')
			?.setValue(this.findItemById(this.currencies, this.consultantRateToEdit.prodataToProdataRateCurrencyId), {
				emitEvent: false,
			});
		rateRow?.get('consultantRateValue')?.setValue(this.consultantRateToEdit.consultantRate, { emitEvent: false });
		rateRow
			?.get('consultantRateCurrency')
			?.setValue(this.findItemById(this.currencies, this.consultantRateToEdit.consultantRateCurrencyId), {
				emitEvent: false,
			});
		this.consultantRateToEdit = new PeriodConsultantSpecialRateDto();
		this.isConsultantRateEditing = false;
		(this.consultants.at(consultantIndex).get('specialRates') as UntypedFormArray)
			.at(specialRateIndex)
			.get('editable')
			?.setValue(false, { emitEvent: false });
	}

	getConsultantSpecialRateControls(index: number): AbstractControl[] | null {
		return (this.contractsConsultantsDataForm.consultants.at(index).get('specialRates') as UntypedFormArray).controls;
	}

	selectConsultantSpecialFee(consultantIndex: number, fee: ClientSpecialFeeDto, consultantFeeMenuTrigger: MatMenuTrigger) {
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
		this.addClientFeesToConsultantData(consultantIndex, consultantFee);
	}

	addClientFeesToConsultantData(index: number, clientFee?: PeriodConsultantSpecialFeeDto) {
		const form = this._fb.group({
			id: new UntypedFormControl(clientFee?.id ?? null),
			clientSpecialFeeId: new UntypedFormControl(clientFee?.clientSpecialFeeId ?? null),
			feeName: new UntypedFormControl(clientFee?.feeName ?? null),
			feeFrequency: new UntypedFormControl(clientFee?.frequency ?? null),
			proDataRateValue: new UntypedFormControl(clientFee?.prodataToProdataRate ?? null),
			proDataRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, clientFee?.prodataToProdataRateCurrencyId) ?? null
			),
			consultantRateValue: new UntypedFormControl(clientFee?.consultantRate ?? null),
			consultantRateCurrency: new UntypedFormControl(
				this.findItemById(this.currencies, clientFee?.consultantRateCurrencyId) ?? null
			),
			editable: new UntypedFormControl(false),
		});
		(this.contractsConsultantsDataForm.consultants.at(index).get('clientFees') as UntypedFormArray).push(form);
	}

	removeConsultantDataClientFees(consultantIndex: number, feeIndex: number) {
		(this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('clientFees') as UntypedFormArray).removeAt(
			feeIndex
		);
	}

	editOrSaveConsultantSpecialFee(isEditable: boolean, consultantIndex: number, feeIndex: number) {
		if (isEditable) {
			this.consultantFeeToEdit = new PeriodConsultantSpecialFeeDto();
			this.isConsultantFeeEditing = false;
		} else {
			const consultantFeeValue = (this.consultants.at(consultantIndex).get('clientFees') as UntypedFormArray).at(
				feeIndex
			).value;
			this.consultantFeeToEdit = new PeriodConsultantSpecialFeeDto({
				id: consultantFeeValue.id,
				clientSpecialFeeId: consultantFeeValue.clientSpecialFeeId,
				feeName: consultantFeeValue.feeName,
				frequency: consultantFeeValue.feeFrequency,
				prodataToProdataRate: consultantFeeValue.proDataRateValue,
				prodataToProdataRateCurrencyId: consultantFeeValue.proDataRateCurrency?.id,
				consultantRate: consultantFeeValue.consultantRateValue,
				consultantRateCurrencyId: consultantFeeValue.consultantRateCurrency?.id,
			});
			this.isConsultantFeeEditing = true;
		}
		(this.consultants.at(consultantIndex).get('clientFees') as UntypedFormArray)
			.at(feeIndex)
			.get('editable')
			?.setValue(!isEditable, { emitEvent: false });
	}

	cancelEditConsultantFee(consultantIndex: number, specialFeeIndex: number) {
		const feeRow = (this.consultants.at(consultantIndex).get('clientFees') as UntypedFormArray).at(specialFeeIndex);
		feeRow?.get('proDataRateValue')?.setValue(this.consultantFeeToEdit?.prodataToProdataRate, { emitEvent: false });
		feeRow
			?.get('proDataRateCurrency')
			?.setValue(this.findItemById(this.currencies, this.consultantFeeToEdit?.prodataToProdataRateCurrencyId), {
				emitEvent: false,
			});
		feeRow?.get('consultantRateValue')?.setValue(this.consultantFeeToEdit?.consultantRate, { emitEvent: false });
		feeRow
			?.get('consultantRateCurrency')
			?.setValue(this.findItemById(this.currencies, this.consultantFeeToEdit?.consultantRateCurrencyId), {
				emitEvent: false,
			});
		this.consultantFeeToEdit = new PeriodConsultantSpecialFeeDto();
		this.isConsultantFeeEditing = false;
		(this.consultants.at(consultantIndex).get('clientFees') as UntypedFormArray)
			.at(specialFeeIndex)
			.get('editable')
			?.setValue(false, { emitEvent: false });
	}

	getConsultantClientFeesControls(index: number): AbstractControl[] | null {
		return (this.contractsConsultantsDataForm.consultants.at(index).get('clientFees') as UntypedFormArray).controls;
	}

	createOrEditProjectLine(index: number, projectLinesMenuTrigger?: MatMenuTrigger, projectLinesIndex?: number) {
		if (projectLinesMenuTrigger) {
			projectLinesMenuTrigger.closeMenu();
		}
		const scrollStrategy = this.overlay.scrollStrategies.reposition();
		let projectLine = {
			projectName: this.contractsMainForm.projectName!.value,
			startDate: this.contractsConsultantsDataForm.consultants.at(index).get('startDate')?.value,
			endDate: this.contractsConsultantsDataForm.consultants.at(index).get('endDate')?.value,
			noEndDate: this.contractsConsultantsDataForm.consultants.at(index).get('noEndDate')?.value,
			debtorNumber: this.contractsMainForm!.customDebtorNumber?.value,
			invoicingReferenceNumber: this.contractClientForm.invoicingReferenceNumber?.value,
			invoiceRecipient: this.contractClientForm.clientInvoicingRecipient?.value,
			invoicingReferencePerson: this.contractClientForm.invoicingReferencePersonDontShowOnInvoice?.value
				? null
				: this.contractClientForm.invoicingReferencePerson?.value,
			purchaseOrderId: null,
			purchaseOrder: new PurchaseOrderDto(),
		};
		if (projectLinesIndex !== null && projectLinesIndex !== undefined) {
			projectLine = (this.contractsConsultantsDataForm.consultants.at(index).get('projectLines') as UntypedFormArray).at(
				projectLinesIndex!
			).value;
			projectLine.purchaseOrderId = (this.consultants.at(index).get('projectLines') as UntypedFormArray)
				.at(projectLinesIndex)
				.get('purchaseOrderId').value;
			projectLine.purchaseOrder = (this.consultants.at(index).get('projectLines') as UntypedFormArray)
				.at(projectLinesIndex)
				.get('purchaseOrder').value;
		}
		const dialogRef = this.dialog.open(AddOrEditProjectLineDialogComponent, {
			width: '800px',
			minHeight: '180px',
			height: 'auto',
			scrollStrategy,
			backdropClass: 'backdrop-modal--wrapper',
			autoFocus: false,
			panelClass: 'confirmation-modal',
			data: {
				dialogType:
					projectLinesIndex !== null && projectLinesIndex !== undefined
						? ProjectLineDiallogMode.Edit
						: ProjectLineDiallogMode.Create,
				projectLineData: projectLine,
				directClientId: this.contractClientForm.directClientId?.value,
				endClientId: this.contractClientForm.endClientId?.value,
				periodId: this.periodId,
			},
		});

		dialogRef.componentInstance.onConfirmed.subscribe((projectLine, purchaseOrders) => {
			if (projectLinesIndex !== null && projectLinesIndex !== undefined) {
				this.editProjectLineValue(index, projectLinesIndex, projectLine, purchaseOrders);
			} else {
				this.addProjectLinesToConsultantData(index, projectLine, purchaseOrders);
			}
		});
	}

	addProjectLinesToConsultantData(index: number, projectLine?: ProjectLineDto, purchaseOrders?: PurchaseOrderDto[]) {
		if (projectLine) {
			if (!projectLine?.differentDebtorNumber) {
				projectLine!.debtorNumber = this.contractsMainForm.customDebtorNumber?.value;
			}
			if (!projectLine?.differentInvoiceRecipient) {
				projectLine!.invoiceRecipient = this.contractClientForm.clientInvoicingRecipient?.value;
			}
			if (!projectLine?.differentInvoicingReferenceNumber) {
				projectLine!.invoicingReferenceNumber = this.contractClientForm.invoicingReferenceNumber?.value;
			}
			if (!projectLine?.differentInvoicingReferencePerson) {
				projectLine!.invoicingReferencePerson = this.contractClientForm.invoicingReferencePerson?.value;
			}
		}
		const form = this._fb.group({
			id: new UntypedFormControl(projectLine?.id ?? null),
			projectName: new UntypedFormControl(projectLine?.projectName ?? null),
			startDate: new UntypedFormControl(projectLine?.startDate ?? null),
			endDate: new UntypedFormControl(projectLine?.endDate ?? null),
			noEndDate: new UntypedFormControl(projectLine?.noEndDate ?? false),
			invoicingReferenceNumber: new UntypedFormControl(projectLine?.invoicingReferenceNumber ?? null),
			differentInvoicingReferenceNumber: new UntypedFormControl(projectLine?.differentInvoicingReferenceNumber ?? null),
			invoicingReferencePersonId: new UntypedFormControl(
				projectLine?.invoicingReferencePersonId ?? projectLine?.invoicingReferenceString
			),
			invoicingReferencePerson: new UntypedFormControl(
				projectLine?.invoicingReferencePerson?.id
					? projectLine?.invoicingReferencePerson
					: projectLine?.invoicingReferenceString
			),
			differentInvoicingReferencePerson: new UntypedFormControl(projectLine?.differentInvoicingReferencePerson ?? false),
			optionalInvoicingInfo: new UntypedFormControl(projectLine?.optionalInvoicingInfo ?? null),
			differentDebtorNumber: new UntypedFormControl(projectLine?.differentDebtorNumber ?? false),
			debtorNumber: new UntypedFormControl(projectLine?.debtorNumber ?? null),
			differentInvoiceRecipient: new UntypedFormControl(projectLine?.differentInvoiceRecipient ?? false),
			invoiceRecipientId: new UntypedFormControl(projectLine?.invoiceRecipientId ?? null),
			invoiceRecipient: new UntypedFormControl(projectLine?.invoiceRecipient ?? null),
			modifiedById: new UntypedFormControl(projectLine?.modifiedById ?? null),
			modifiedBy: new UntypedFormControl(projectLine?.modifiedBy ?? null),
			modificationDate: new UntypedFormControl(projectLine?.modificationDate ?? null),
			consultantInsuranceOptionId: new UntypedFormControl(projectLine?.consultantInsuranceOptionId),
			markedForLegacyDeletion: new UntypedFormControl(projectLine?.markedForLegacyDeletion),
			wasSynced: new UntypedFormControl(projectLine?.wasSynced),
			isLineForFees: new UntypedFormControl(projectLine?.isLineForFees),
			purchaseOrderId: new UntypedFormControl(projectLine?.purchaseOrderId),
			purchaseOrder: new UntypedFormControl(null),
		});
		(this.contractsConsultantsDataForm.consultants.at(index).get('projectLines') as UntypedFormArray).push(form);
		if (this.directClientId) {
			this.getPOsToUpdateValues(this.directClientId);
		}
	}

	editProjectLineValue(
		consultantIndex: number,
		projectLinesIndex: number,
		projectLineData: any,
		purchaseOrders?: PurchaseOrderDto[]
	) {
		const projectLineRow = (
			this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('projectLines') as UntypedFormArray
		).at(projectLinesIndex);
		projectLineRow.get('id')?.setValue(projectLineData.id, { emitEvent: false });
		projectLineRow.get('projectName')?.setValue(projectLineData.projectName, { emitEvent: false });
		projectLineRow.get('startDate')?.setValue(projectLineData.startDate, { emitEvent: false });
		projectLineRow.get('endDate')?.setValue(projectLineData.endDate, { emitEvent: false });
		projectLineRow.get('noEndDate')?.setValue(projectLineData.noEndDate, { emitEvent: false });
		projectLineRow.get('invoicingReferenceNumber')?.setValue(projectLineData.invoicingReferenceNumber, {
			emitEvent: false,
		});
		projectLineRow.get('differentInvoicingReferenceNumber')?.setValue(projectLineData.differentInvoicingReferenceNumber, {
			emitEvent: false,
		});
		projectLineRow
			.get('invoicingReferencePersonId')
			?.setValue(projectLineData.invoicingReferencePersonId ?? projectLineData.invoicingReferenceString, {
				emitEvent: false,
			});
		projectLineRow
			.get('invoicingReferencePerson')
			?.setValue(
				projectLineData.invoicingReferencePerson?.id
					? projectLineData.invoicingReferencePerson
					: projectLineData.invoicingReferenceString,
				{ emitEvent: false }
			);
		projectLineRow.get('differentInvoicingReferencePerson')?.setValue(projectLineData.differentInvoicingReferencePerson, {
			emitEvent: false,
		});
		projectLineRow.get('optionalInvoicingInfo')?.setValue(projectLineData.optionalInvoicingInfo, {
			emitEvent: false,
		});
		projectLineRow.get('differentDebtorNumber')?.setValue(projectLineData.differentDebtorNumber, {
			emitEvent: false,
		});
		projectLineRow.get('debtorNumber')?.setValue(projectLineData.debtorNumber, { emitEvent: false });
		projectLineRow.get('differentInvoiceRecipient')?.setValue(projectLineData.differentInvoiceRecipient, {
			emitEvent: false,
		});
		projectLineRow.get('invoiceRecipientId')?.setValue(projectLineData.invoiceRecipientId, {
			emitEvent: false,
		});
		projectLineRow.get('invoiceRecipient')?.setValue(projectLineData.invoiceRecipient, { emitEvent: false });
		projectLineRow.get('modifiedById')?.setValue(projectLineData.modifiedById, { emitEvent: false });
		projectLineRow.get('modifiedBy')?.setValue(projectLineData.modifiedBy, { emitEvent: false });
		projectLineRow.get('modificationDate')?.setValue(projectLineData.modificationDate, { emitEvent: false });
		projectLineRow.get('consultantInsuranceOptionId')?.setValue(projectLineData.consultantInsuranceOptionId, {
			emitEvent: false,
		});
		projectLineRow.get('markedForLegacyDeletion')?.setValue(projectLineData.markedForLegacyDeletion, {
			emitEvent: false,
		});
		projectLineRow.get('wasSynced')?.setValue(projectLineData.wasSynced, { emitEvent: false });
		projectLineRow.get('isLineForFees')?.setValue(projectLineData.isLineForFees, { emitEvent: false });
		projectLineRow.get('purchaseOrderId')?.setValue(projectLineData.purchaseOrderId, { emitEvent: false });
		projectLineRow.get('purchaseOrder')?.setValue(null, { emitEvent: false });
		this.getPOsToUpdateValues(this.directClientId);
	}

	duplicateProjectLine(consultantIndex: number, projectLinesIndex: number) {
		const projectLineRowValue: ProjectLineDto = new ProjectLineDto(
			(this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('projectLines') as UntypedFormArray).at(
				projectLinesIndex
			).value
		);
		projectLineRowValue.id = undefined; // to create a new instance of project line
		projectLineRowValue.wasSynced = false;
		projectLineRowValue.isLineForFees = false;
		this.addProjectLinesToConsultantData(consultantIndex, projectLineRowValue);
	}

	removeConsultantDataProjectLines(consultantIndex: number, projectLineIndex: number) {
		(this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('projectLines') as UntypedFormArray).removeAt(
			projectLineIndex
		);
	}

	editOrSaveConsultantProjectLine(isEditMode: boolean, consultantIndex: number, projectLineIndex: number) {
		(this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('projectLines') as UntypedFormArray)
			.at(projectLineIndex)
			.get('editable')
			?.setValue(!isEditMode, { emitEvent: false });
	}

	getConsultantProjectLinesControls(index: number): AbstractControl[] | null {
		return (this.contractsConsultantsDataForm.consultants.at(index).get('projectLines') as UntypedFormArray).controls;
	}

	toggleMarkProjectLineForDeletion(previousValue: boolean, consultantIndex: number, projectLineIndex: number) {
		(this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('projectLines') as UntypedFormArray)
			.at(projectLineIndex)
			.get('markedForLegacyDeletion')
			?.setValue(!previousValue, { emitEvent: false });
	}

	getConsultantCapControls(consultantIndex: number): AbstractControl[] | null {
		return (this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('timeReportingCaps') as UntypedFormArray)
			?.controls;
	}

	addConsultantCap(consultantIndex: number, cap?: TimeReportingCapDto) {
		const form = this._fb.group({
			id: new UntypedFormControl(cap?.id?.value ?? null),
			timeReportingCapMaxValue: new UntypedFormControl(cap?.timeReportingCapMaxValue ?? null),
			valueUnitId: new UntypedFormControl(cap?.valueUnitId ?? null),
			periodUnitId: new UntypedFormControl(cap?.periodUnitId ?? null),
		});
		(this.contractsConsultantsDataForm.consultants.at(consultantIndex).get('timeReportingCaps') as UntypedFormArray).push(
			form
		);
	}

	removeTimeReportingCap(consultantIndex: number, index: number) {
		(this.consultants.at(consultantIndex).get('timeReportingCaps') as UntypedFormArray).removeAt(index);
	}

	submitForm() {
		this.submitFormBtn.nativeElement.click();
	}

	private _updateProjectLinePOs() {
		this.consultants.controls.forEach((consutlant) => {
			const projectLines = consutlant.get('projectLines') as UntypedFormArray;
			projectLines.controls.forEach((projectLine) => {
				projectLine
					.get('purchaseOrder')
					.setValue(this.purchaseOrders?.find((x) => x.id === projectLine.get('purchaseOrderId').value));
			});
		});
	}

    private _getEnums() {
        this.employmentTypes = this.getStaticEnumValue('employmentTypes');
        this.consultantTimeReportingCap = this.getStaticEnumValue('consultantTimeReportingCap');
        this.currencies = this.getStaticEnumValue('currencies');
        this.consultantInsuranceOptions = this.getStaticEnumValue('consultantInsuranceOptions');
        this.valueUnitTypes = this.getStaticEnumValue('valueUnitTypes');
        this.periodUnitTypes = this.getStaticEnumValue('periodUnitTypes');
        this.purchaseOrderCapTypes = this.getStaticEnumValue('purchaseOrderCapTypes');
    }

    get timeReportingCaps(): UntypedFormArray {
		return this.contractsConsultantsDataForm.get('timeReportingCaps') as UntypedFormArray;
	}

	get consultants(): UntypedFormArray {
		return this.contractsConsultantsDataForm.get('consultants') as UntypedFormArray;
	}
}
