import { Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { debounceTime, finalize, map, startWith, switchMap, takeUntil} from 'rxjs/operators';
import { forkJoin, merge, of, Subject } from 'rxjs';
import { InternalLookupService } from 'src/app/shared/common/internal-lookup.service';
import { AppComponentBase } from 'src/shared/app-component-base';
import { AreaRoleNodeDto, BranchRoleNodeDto, ClientPeriodServiceProxy, CommissionDto, EmployeeDto, EnumEntityTypeDto, LegalEntityDto, LookupServiceProxy, RoleNodeDto, WorkflowDocumentCommandDto, WorkflowProcessType } from 'src/shared/service-proxies/service-proxies';
import { WorkflowProcessWithAnchorsDto } from '../../workflow-period/workflow-period.model';
import { EProjectTypes, WorkflowSalesMainForm } from '../workflow-sales.model';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { CustomValidators } from 'src/shared/utils/custom-validators';
import { DeliveryTypes, SalesTypes } from '../../workflow-contracts/workflow-contracts.model';
import { DocumentsComponent } from '../../shared/components/wf-documents/wf-documents.component';
import { WorkflowDataService } from '../../workflow-data.service';

@Component({
	selector: 'app-main-data',
	templateUrl: './main-data.component.html',
	styleUrls: ['../workflow-sales.component.scss']
})
export class MainDataComponent extends AppComponentBase implements OnInit, OnDestroy {
    @ViewChild('mainDocuments', {static: false}) mainDocuments: DocumentsComponent;
	@Input() periodId: string | undefined;
    @Input() readOnlyMode: boolean;
    @Input() editEnabledForcefuly: boolean;
    @Input() isCompleted: boolean;
    @Input() canToggleEditMode: boolean;
    @Input() activeSideSection: WorkflowProcessWithAnchorsDto;
    @Input() permissionsForCurrentUser: { [key: string]: boolean } | undefined;
    @Output() editModeToggled = new EventEmitter<any>();
    @Output() onReturnToSales = new EventEmitter<any>();

    workflowSideSections = WorkflowProcessType;
	salesMainDataForm: WorkflowSalesMainForm;

    deliveryTypesEnum = DeliveryTypes;
	salesTypesEnum = SalesTypes;
    eProjectTypes = EProjectTypes;

    currencies: EnumEntityTypeDto[];
    deliveryTypes: EnumEntityTypeDto[];
    saleTypes: EnumEntityTypeDto[];
    projectTypes: EnumEntityTypeDto[];
    margins: EnumEntityTypeDto[];
    discounts: EnumEntityTypeDto[];
    projectCategories: EnumEntityTypeDto[];
    commissionTypes: EnumEntityTypeDto[];
    commissionRecipientTypeList: EnumEntityTypeDto[];
    commissionFrequencies: EnumEntityTypeDto[];
    legalEntities: LegalEntityDto[];
    contractExpirationNotificationDuration: { [key: string]: string };
    primaryCategoryAreas: BranchRoleNodeDto[] = [];
    primaryCategoryTypes: AreaRoleNodeDto[] = [];
    primaryCategoryRoles: RoleNodeDto[] = [];

    filteredSalesAccountManagers: EmployeeDto[] = [];
	filteredCommisionAccountManagers: EmployeeDto[] = [];
    filteredEmployees: EmployeeDto[] = [];

    filteredRecipients: any[] = [];
    isCommissionInitialAdd = false;
    isCommissionEditing = false;
    commissionToEdit: {
		id: number | undefined;
		commissionType: any;
		amount: any;
		currency: any;
		commissionFrequency: any;
		recipientType: any;
		recipient: any;
	};
    areaTypeRoleRequired = true;
    private _unsubscribe = new Subject();
	constructor(
        injector: Injector,
        private _fb: UntypedFormBuilder,
        private _internalLookupService: InternalLookupService,
        private _clientPeriodService: ClientPeriodServiceProxy,
        private _lookupService: LookupServiceProxy,
        private _workflowDataService: WorkflowDataService
    ) {
        super(injector);
        this.salesMainDataForm = new WorkflowSalesMainForm();
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
            deliveryTypes: this._internalLookupService.getDeliveryTypes(),
            saleTypes: this._internalLookupService.getSaleTypes(),
            projectTypes: this._internalLookupService.getProjectTypes(),
            margins: this._internalLookupService.getMargins(),
            contractExpirationNotificationDuration: this._internalLookupService.getContractExpirationNotificationInterval(),
            clientTimeReportingCap: this._internalLookupService.getClientTimeReportingCap(),
            commissionFrequencies: this._internalLookupService.getCommissionFrequency(),
            commissionTypes: this._internalLookupService.getCommissionTypes(),
            commissionRecipientTypeList: this._internalLookupService.getCommissionRecipientTypes(),
            legalEntities: this._internalLookupService.getLegalEntities(),
            projectCategories: this._internalLookupService.getProjectCategory(),
            discounts: this._internalLookupService.getDiscounts(),
        })
        .subscribe(result => {
            this.currencies = result.currencies;
            this.deliveryTypes = result.deliveryTypes;
            this.saleTypes = result.saleTypes;
            this.projectTypes = result.projectTypes;
            this.margins = result.margins;
            this.contractExpirationNotificationDuration = result.contractExpirationNotificationDuration;
            this.commissionFrequencies = result.commissionFrequencies;
            this.commissionTypes = result.commissionTypes;
            this.commissionRecipientTypeList = result.commissionRecipientTypeList;
            this.legalEntities = result.legalEntities;
            this.projectCategories = result.projectCategories;
            this.discounts = result.discounts;
        });
    }

    private _subscriptions$() {
        this.salesMainDataForm.salesAccountManagerIdValue?.valueChanges
			.pipe(
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
					this.filteredSalesAccountManagers = list;
				} else {
					this.filteredSalesAccountManagers = [
                        new EmployeeDto(
                            {
                                name: 'No managers found',
                                externalId: '',
                                id: undefined
                            }
                        )
					];
				}
			});

		this.salesMainDataForm.commissionAccountManagerIdValue?.valueChanges
			.pipe(
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
					this.filteredCommisionAccountManagers = list;
				} else {
					this.filteredCommisionAccountManagers = [
						new EmployeeDto(
                            {
                                name: 'No managers found',
                                externalId: '',
                                id: undefined
                            }
                        )
					];
				}
			});

        this.salesMainDataForm?.primaryCategoryArea?.valueChanges
            .pipe(
                takeUntil(this._unsubscribe),
                map(
                    (value) =>
                        this.primaryCategoryAreas?.find((x) => x.id === value?.id)
                            ?.areas
                )
            )
            .subscribe((list) => {
                this.primaryCategoryTypes = list!;
                    this.salesMainDataForm?.primaryCategoryType?.setValue(
                        null
                    );
                    this.salesMainDataForm?.primaryCategoryRole?.setValue(
                        null
                    );
            });

        this.salesMainDataForm?.primaryCategoryType?.valueChanges
            .pipe(
                takeUntil(this._unsubscribe),
                map(
                    (value) =>
                        this.primaryCategoryTypes?.find((x) => x.id === value?.id)
                            ?.roles
                )
            )
            .subscribe((list) => {
                this.primaryCategoryRoles = list!;
                this.salesMainDataForm?.primaryCategoryRole?.setValue(
                    null
                );
            });

        merge(this.salesMainDataForm.salesTypeId.valueChanges, this.salesMainDataForm.deliveryTypeId.valueChanges)
			.pipe(takeUntil(this._unsubscribe), debounceTime(300))
			.subscribe(() => {
				if (this.salesMainDataForm.salesTypeId.value && this.salesMainDataForm.deliveryTypeId.value) {
					this._workflowDataService.preselectFrameAgreement.emit();
				}
			});
    }

    getPrimaryCategoryTree(): void {
        this._lookupService
            .tree()
            .subscribe((result) => {
                this.primaryCategoryAreas = result.branches!;
                this.setPrimaryCategoryTypeAndRole();
            });
    }

    setPrimaryCategoryTypeAndRole(): void {
        if (this.salesMainDataForm?.primaryCategoryArea?.value?.id) {
            this.primaryCategoryTypes = this.primaryCategoryAreas?.find(
                (x) =>
                    x.id ===
                    this.salesMainDataForm?.primaryCategoryArea?.value?.id
            )?.areas!;
        }
        if (this.salesMainDataForm?.primaryCategoryType?.value?.id) {
            this.primaryCategoryRoles = this.primaryCategoryTypes?.find(
                (x) =>
                    x.id ===
                    this.salesMainDataForm?.primaryCategoryType?.value.id
            )?.roles!;
        }
    }

    toggleEditMode() {
        this.editModeToggled.emit();
	}

    returnToSales() {
        this.onReturnToSales.emit();
	}

    getDataBasedOnProjectType(event: MatSelectChange) {
		const projectTypeId = event.value;
		this.showMainSpinner();
		this._clientPeriodService
			.projectType(projectTypeId)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
				})
			)
			.subscribe((result) => {
				this.salesMainDataForm.deliveryTypeId?.setValue(result.deliveryTypeId, { emitEvent: false });
				this.salesMainDataForm.salesTypeId?.setValue(result.salesTypeId, { emitEvent: false });
				this.salesMainDataForm.marginId?.setValue(result.marginId, { emitEvent: false });
                if (
					projectTypeId === this.eProjectTypes.NearshoreVMShighMargin ||
					projectTypeId === this.eProjectTypes.NearshoreVMSlowMargin ||
					projectTypeId === this.eProjectTypes.VMShighMargin ||
					projectTypeId === this.eProjectTypes.VMSlowMargin ||
                    this.salesMainDataForm.salesTypeId?.value === SalesTypes.ThirdPartyMgmt
				) {
					this.makeAreaTypeRoleNotRequired();
				} else {
					this.makeAreaTypeRoleRequired();
				}
			});
	}

    salesTypeChange(value: number) {
		if (value === this.salesTypesEnum.ManagedService) {
			const itemToPreselct = this.deliveryTypes.find((x) => x.id === this.deliveryTypesEnum.ManagedService);
			this.salesMainDataForm.deliveryTypeId?.setValue(itemToPreselct?.id, {
				emitEvent: false,
			});
		}
        const projectTypeId = this.salesMainDataForm.projectTypeId?.value;
		if (
			projectTypeId === this.eProjectTypes.NearshoreVMShighMargin ||
			projectTypeId === this.eProjectTypes.NearshoreVMSlowMargin ||
			projectTypeId === this.eProjectTypes.VMShighMargin ||
			projectTypeId === this.eProjectTypes.VMSlowMargin ||
			value === this.salesTypesEnum.ThirdPartyMgmt
		) {
			this.makeAreaTypeRoleNotRequired();
		} else {
			this.makeAreaTypeRoleRequired();
		}
	}

    makeAreaTypeRoleRequired() {
        this.salesMainDataForm.primaryCategoryArea?.addValidators(Validators.required);
        this.salesMainDataForm.primaryCategoryType?.addValidators(Validators.required);
        this.salesMainDataForm.primaryCategoryRole?.addValidators(Validators.required);
        this.updateStateAreaTypeRole();
    }

    makeAreaTypeRoleNotRequired() {
        this.salesMainDataForm.primaryCategoryArea?.removeValidators(Validators.required);
        this.salesMainDataForm.primaryCategoryType?.removeValidators(Validators.required);
        this.salesMainDataForm.primaryCategoryRole?.removeValidators(Validators.required);
        this.updateStateAreaTypeRole();
    }

    updateStateAreaTypeRole() {
        this.salesMainDataForm.primaryCategoryArea?.updateValueAndValidity({emitEvent: false});
        this.salesMainDataForm.primaryCategoryType?.updateValueAndValidity({emitEvent: false});
        this.salesMainDataForm.primaryCategoryRole?.updateValueAndValidity({emitEvent: false});
    }

    commissionRecipientTypeChanged(event: MatSelectChange, index: number) {
		this.commissions.at(index).get('recipient')?.setValue(null, { emitEvent: false });
		this.filteredRecipients = [];
	}

	addCommission(isInitial?: boolean, commission?: CommissionDto) {
		let commissionRecipient;
		switch (commission?.recipientTypeId) {
			case 1: // Supplier
				commissionRecipient = commission.supplier;
				break;
			case 2: // Consultant
				commissionRecipient = commission.consultant;
				break;
			case 3: // Client
				commissionRecipient = commission.client;
				break;
			case 4: // PDC entity
				commissionRecipient = this.findItemById(this.legalEntities, commission.legalEntityId);
				break;
		}
		const form = this._fb.group({
			id: new UntypedFormControl(commission?.id ?? null),
			type: new UntypedFormControl(
				this.findItemById(this.commissionTypes, commission?.commissionTypeId) ?? null,
				Validators.required
			),
			amount: new UntypedFormControl(commission?.amount ?? null, Validators.required),
			currency: new UntypedFormControl(
				this.findItemById(this.currencies, commission?.currencyId) ?? null,
				Validators.required
			),
			recipientType: new UntypedFormControl(
				this.findItemById(this.commissionRecipientTypeList, commission?.recipientTypeId) ?? null,
				Validators.required
			),
			recipient: new UntypedFormControl(commissionRecipient ?? null, [
				Validators.required,
				CustomValidators.autocompleteValidator(['clientId', 'id', 'supplierId']),
			]),
			frequency: new UntypedFormControl(
				this.findItemById(this.commissionFrequencies, commission?.commissionFrequencyId) ?? null,
				Validators.required
			),
			oneTimeDate: new UntypedFormControl(commission?.oneTimeDate ?? null),
			editable: new UntypedFormControl(commission?.id ? false : true),
		});
		this.salesMainDataForm.commissions.push(form);
		if (isInitial) {
			this.isCommissionEditing = true;
			this.isCommissionInitialAdd = true;
		}
		this.manageCommissionAutocomplete(this.salesMainDataForm.commissions.length - 1);
	}

	manageCommissionAutocomplete(commissionIndex: number) {
		let arrayControl = this.salesMainDataForm.commissions.at(commissionIndex);
		arrayControl!
			.get('recipient')!
			.valueChanges.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
                startWith(''),
				switchMap((value: any) => {
					let toSend = {
						name: value,
						maxRecordsCount: 1000,
					};
					switch (arrayControl.value.recipientType.id) {
						case 3: // Client
							if (value) {
								if (value?.id) {
									toSend.name = value.id ? value.clientName : value;
								}
								return this._lookupService.clientsAll(toSend.name, toSend.maxRecordsCount);
							} else {
								return of([]);
							}
						case 2: // Consultant
							if (value) {
								if (value?.id) {
									toSend.name = value.id ? value.name : value;
								}
								return this._lookupService.consultants(toSend.name, toSend.maxRecordsCount);
							} else {
								return of([]);
							}
						case 1: // Supplier
							if (value) {
								if (value?.id) {
									toSend.name = value.id ? value.supplierName : value;
								}
								return this._lookupService.suppliers(toSend.name, toSend.maxRecordsCount);
							} else {
								return of([]);
							}
						default:
							return of([]);
					}
				})
			)
			.subscribe((list: any[]) => {
				if (list.length) {
					this.filteredRecipients = list;
				} else {
					this.filteredRecipients = [
						{
							name: 'No records found',
							supplierName: 'No supplier found',
							clientName: 'No clients found',
							id: 'no-data',
						},
					];
				}
			});
	}



	removeCommission(index: number) {
		this.isCommissionInitialAdd = false;
		this.isCommissionEditing = false;
		this.commissions.removeAt(index);
	}

	editOrSaveCommissionRow(index: number) {
		const isEditable = this.commissions.at(index).get('editable')?.value;
		if (isEditable) {
			this.commissionToEdit = {
				id: undefined,
				commissionType: undefined,
				amount: undefined,
				currency: undefined,
				commissionFrequency: undefined,
				recipientType: undefined,
				recipient: undefined,
			};
			this.isCommissionInitialAdd = false;
			this.isCommissionEditing = false;
		} else {
			const commissionValue = this.commissions.at(index).value;
			this.commissionToEdit = {
				id: commissionValue.id,
				commissionType: commissionValue.type,
				amount: commissionValue.amount,
				currency: commissionValue.currency,
				commissionFrequency: commissionValue.frequency,
				recipientType: commissionValue.recipientType,
				recipient: commissionValue.recipient,
			};

			this.isCommissionEditing = true;
		}
		this.commissions.at(index).get('editable')?.setValue(!isEditable);
	}

	cancelEditCommissionRow(index: number) {
		const commissionRow = this.commissions.at(index);
		commissionRow.get('id')?.setValue(this.commissionToEdit?.id);
		commissionRow.get('commissionType')?.setValue(this.commissionToEdit?.commissionType);
		commissionRow.get('amount')?.setValue(this.commissionToEdit?.amount);
		commissionRow.get('currency')?.setValue(this.commissionToEdit?.currency);
		commissionRow.get('commissionFrequency')?.setValue(this.commissionToEdit?.commissionFrequency);
		commissionRow.get('recipientType')?.setValue(this.commissionToEdit?.recipientType);
		commissionRow.get('recipient')?.setValue(this.commissionToEdit?.recipient);
		this.commissionToEdit = {
			id: undefined,
			commissionType: undefined,
			amount: undefined,
			currency: undefined,
			commissionFrequency: undefined,
			recipientType: undefined,
			recipient: undefined,
		};
		this.isCommissionEditing = false;
		this.isCommissionInitialAdd = false;
		this.commissions.at(index).get('editable')?.setValue(false);
	}

    addCommissionedUser(employee?: EmployeeDto) {
        const form = this._fb.group({
           commissionedUser: new UntypedFormControl(employee?.id ? employee : '', CustomValidators.autocompleteValidator(['id']))
        });
        this.salesMainDataForm.commissionedUsers.push(form);
        this.manageCommissionedUserAutocomplete(this.salesMainDataForm.commissionedUsers.length - 1);
    }

    manageCommissionedUserAutocomplete(index: number) {
        let arrayControl = this.commissionedUsers.at(index);
        arrayControl!.get('commissionedUser')!.valueChanges
            .pipe(
                takeUntil(this._unsubscribe),
                debounceTime(300),
                startWith(''),
                switchMap((value: any) => {
                    let toSend = {
                        name: value,
                        showAll: true,
                        idsToExclude: this.commissionedUsers.value.map((x: any) => x?.commissionedUser?.id).filter((item: number) => item !== null && item !== undefined)
                    };
                    if (value?.id) {
                        toSend.name = value.id
                            ? value.name
                            : value;
                    }
                    return this._lookupService.employees(toSend.name, toSend.showAll, toSend.idsToExclude);
                }),
            ).subscribe((list: EmployeeDto[]) => {
                if (list.length) {
                    this.filteredEmployees = list;
                } else {
                    this.filteredEmployees = [new EmployeeDto({ name: 'No records found', externalId: '', id: undefined })];
                }
            });
    }

    removeCommissionedUser(index: number) {
        this.commissionedUsers.removeAt(index);
    }

    packDocuments(): WorkflowDocumentCommandDto[] {
        let workflowDocumentsCommandDto = new Array<WorkflowDocumentCommandDto>();
        if (this.mainDocuments.documents.value?.length) {
            for (let document of this.mainDocuments.documents.value) {
                let documentInput = new WorkflowDocumentCommandDto();
                documentInput.name = document.name;
                documentInput.workflowDocumentId = document.workflowDocumentId;
                documentInput.temporaryFileId = document.temporaryFileId;
                workflowDocumentsCommandDto.push(documentInput);
            }
        }
        return workflowDocumentsCommandDto;
    }

    get commissionedUsers() {
        return this.salesMainDataForm.commissionedUsers as UntypedFormArray;
    }

    get commissions() {
		return this.salesMainDataForm.commissions as UntypedFormArray;
	}

}
