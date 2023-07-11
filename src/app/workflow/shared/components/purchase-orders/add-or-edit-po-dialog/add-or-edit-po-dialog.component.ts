import { AfterViewInit, Component, EventEmitter, Inject, Injector, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, finalize, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { WorkflowDataService } from 'src/app/workflow/workflow-data.service';
import { EValueUnitTypes } from 'src/app/workflow/workflow-sales/workflow-sales.model';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
    ContactResultDto,
	EnumEntityTypeDto,
	LookupServiceProxy,
	PurchaseOrderCapDto,
	PurchaseOrderCapType,
	PurchaseOrderCommandDto,
	PurchaseOrderDocumentCommandDto,
	PurchaseOrderDocumentQueryDto,
	PurchaseOrderQueryDto,
	PurchaseOrderServiceProxy,
} from 'src/shared/service-proxies/service-proxies';
import { EPOSource, POSources, PurchaseOrderForm } from './add-or-edit-po-dialog.model';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DocumentsComponent } from '../../wf-documents/wf-documents.component';
import { PO_CHASING_STATUSES } from 'src/app/po-list/po-list.constants';

@Component({
	selector: 'app-add-or-edit-po-dialog',
	templateUrl: './add-or-edit-po-dialog.component.html',
	styleUrls: ['./add-or-edit-po-dialog.component.scss'],
})
export class AddOrEditPoDialogComponent extends AppComponentBase implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('poDocuments', {static: false}) poDocuments: DocumentsComponent;
	@Output() onConfirmed: EventEmitter<PurchaseOrderQueryDto> = new EventEmitter<PurchaseOrderQueryDto>();
	@Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
	purchaseOrderForm: PurchaseOrderForm;
	purchaseOrderCapTypes: { [key: string]: string };
	currencies: EnumEntityTypeDto[];
	eCurrencies: { [key: number]: string };
	valueUnitTypes: EnumEntityTypeDto[];
	poSources = POSources;
	ePOSource = EPOSource;
	ePOCaps = PurchaseOrderCapType;
	purchaseOrders: PurchaseOrderQueryDto[];
	availablePurchaseOrders: PurchaseOrderQueryDto[] = [];
	filteredPurchaseOrders: Observable<PurchaseOrderQueryDto[]>;
	existingPo: PurchaseOrderQueryDto;
	eValueUnitType = EValueUnitTypes;
    chasingStatuses = PO_CHASING_STATUSES;
    filteredClientContacts$: Observable<ContactResultDto[]>;
	private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			purchaseOrder: PurchaseOrderQueryDto;
			isEdit: boolean;
			clientPeriodId: string;
			directClientId?: number;
			addedPoIds: number[];
		},
		private _dialogRef: MatDialogRef<AddOrEditPoDialogComponent>,
		private readonly _purchaseOrderService: PurchaseOrderServiceProxy,
		private readonly _workflowDataService: WorkflowDataService,
        private readonly _lookupService: LookupServiceProxy
	) {
		super(injector);
		this.purchaseOrderForm = new PurchaseOrderForm(this.data?.purchaseOrder);
		this.existingPo = new PurchaseOrderQueryDto(this.data?.purchaseOrder);
	}

	ngOnInit(): void {
        if (!this.data.isEdit) {
            this._getPurchaseOrders();
        }
		this._getEnums();
		this.filteredPurchaseOrders = this.purchaseOrderForm.existingPo.valueChanges.pipe(
			takeUntil(this._unsubscribe),
			startWith(''),
			map((value) => {
				if (typeof value === 'string') {
					return this._filterPOsAutocomplete(value);
				}
			})
		);
        if (this.data.directClientId) {
            this._subClientResponsible$();
        }
	}

    ngAfterViewInit(): void {
        if (this.existingPo.purchaseOrderDocumentQueryDto) {
            this.poDocuments.addExistingPOFile(this.existingPo.purchaseOrderDocumentQueryDto);
        }
    }

	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	reject() {
		this.onRejected.emit();
		this._closeInternal();
	}

	confirm() {
		this.showMainSpinner();
		const form = this.purchaseOrderForm.value;
		let input = new PurchaseOrderCommandDto(form);
		if (input.numberMissingButRequired) {
			input.number = undefined;
		}
        input.clientContactResponsibleId = this.purchaseOrderForm.clientContactResponsible.value?.id ?? undefined;
		input.capForInvoicing = new PurchaseOrderCapDto(form.capForInvoicing);
        input.purchaseOrderDocumentCommandDto = new PurchaseOrderDocumentCommandDto();
        if (this.poDocuments?.documents.value?.length) {
            for (let document of this.poDocuments?.documents.value) {
                let documentInput = new PurchaseOrderDocumentCommandDto();
                documentInput.name = document.name;
                documentInput.purchaseOrderDocumentId = document.purchaseOrderDocumentId;
                documentInput.temporaryFileId = document.temporaryFileId;
                input.purchaseOrderDocumentCommandDto = documentInput;
            }
        } else {
            input.purchaseOrderDocumentCommandDto = undefined;
        }
		if (form.id !== null) {
			if (!this.existingPo.purchaseOrderCurrentContextData.isUserAllowedToEdit) {
				// NB: don't call BE if user is not allowed to edit, just add to a list
                this.existingPo.purchaseOrderDocumentQueryDto = new PurchaseOrderDocumentQueryDto();
                if (this.poDocuments?.documents.value?.length) {
                    for (let document of this.poDocuments?.documents.value) {
                        let documentInput = new PurchaseOrderDocumentQueryDto();
                        documentInput.id = document.purchaseOrderDocumentId;
                        documentInput.createdBy = document.createdBy;
                        documentInput.createdDateUtc = document.createdDateUtc;
                        documentInput.name = document.name;
                        this.existingPo.purchaseOrderDocumentQueryDto = documentInput;
                    }
                } else {
                    this.existingPo.purchaseOrderDocumentQueryDto = undefined;
                }
				this.onConfirmed.emit(this.existingPo);
				this._closeInternal();
				this.hideMainSpinner();
				return;
			} else {
				this._purchaseOrderService
					.purchaseOrderPUT(input)
					.pipe(finalize(() => this.hideMainSpinner()))
					.subscribe((result) => {
						this._workflowDataService.updatePurchaseOrders.emit(result);
						this.onConfirmed.emit(result);
						this._closeInternal();
					});
			}
		} else {
			this._purchaseOrderService
				.purchaseOrderPOST(this.data?.clientPeriodId, input)
				.pipe(finalize(() => this.hideMainSpinner()))
				.subscribe((result) => {
					this.onConfirmed.emit(result);
					this._closeInternal();
				});
		}
	}

	disableInputs(value: boolean) {
		if (value) {
			this.purchaseOrderForm.number.setValue(null, { emitEvent: false });
			this.purchaseOrderForm.receiveDate.setValue(null, { emitEvent: false });
			this.purchaseOrderForm.startDate.setValue(null, { emitEvent: false });
			this.purchaseOrderForm.endDate.setValue(null, { emitEvent: false });
			this.purchaseOrderForm.number.disable();
			this.purchaseOrderForm.receiveDate.disable();
			this.purchaseOrderForm.startDate.disable();
			this.purchaseOrderForm.endDate.disable();
            this.purchaseOrderForm.isCompleted.disable();
		} else {
			this.purchaseOrderForm.number.enable();
			this.purchaseOrderForm.receiveDate.enable();
            this.purchaseOrderForm.startDate.enable();
			this.purchaseOrderForm.endDate.enable();
            this.purchaseOrderForm.isCompleted.enable();
		}
	}

	poSelected(event: MatAutocompleteSelectedEvent) {
		this.existingPo = event.option.value;
		this.purchaseOrderForm.patchValue(event.option.value, { emitEvent: false });
		if (!this.existingPo.purchaseOrderCurrentContextData.isUserAllowedToEdit) {
			this._disableAllEditableInputs();
		}
	}

	poSourceChange(poSource: number) {
		this._clearData();
		if (poSource === EPOSource.DifferentWF || poSource === EPOSource.ExistingPO) {
			this.availablePurchaseOrders = this._filterOutPOs(poSource as EPOSource);
			this.purchaseOrderForm.existingPo.reset('');
		} else {
			this.purchaseOrderForm.enable();
		}
	}

	sharedCapTypeChange(capType: number) {
		switch (capType) {
			case PurchaseOrderCapType.CapOnUnits:
				this.purchaseOrderForm.capForInvoicing.maxAmount.reset(null);
				this.purchaseOrderForm.capForInvoicing.currencyId.reset(null);
				break;
			case PurchaseOrderCapType.CapOnValue:
				this.purchaseOrderForm.capForInvoicing.maxAmount.reset(null);
				this.purchaseOrderForm.capForInvoicing.valueUnitTypeId.reset(null);
				break;
			case PurchaseOrderCapType.NoCap:
				this.purchaseOrderForm.capForInvoicing.maxAmount.reset(null);
				this.purchaseOrderForm.capForInvoicing.valueUnitTypeId.reset(null);
				this.purchaseOrderForm.capForInvoicing.currencyId.reset(null);
				break;
		}
	}

	private _disableAllEditableInputs() {
		this.purchaseOrderForm.number.disable({ emitEvent: false });
		this.purchaseOrderForm.receiveDate.disable({ emitEvent: false });
		this.purchaseOrderForm.startDate.disable({ emitEvent: false });
		this.purchaseOrderForm.endDate.disable({ emitEvent: false });
		this.purchaseOrderForm.isCompleted.disable({ emitEvent: false });
        this.purchaseOrderForm.notes.disable({ emitEvent: false });
		this.purchaseOrderForm.capForInvoicing.type.disable({ emitEvent: false });
		this.purchaseOrderForm.capForInvoicing.maxAmount.disable({ emitEvent: false });
		this.purchaseOrderForm.capForInvoicing.valueUnitTypeId.disable({ emitEvent: false });
		this.purchaseOrderForm.capForInvoicing.currencyId.disable({ emitEvent: false });
	}

	private _closeInternal(): void {
		this._dialogRef.close();
	}

	private _getPurchaseOrders() {
		this._purchaseOrderService
			.getPurchaseOrdersAvailableForClientPeriod(this.data?.clientPeriodId, this.data?.directClientId ?? undefined)
			.pipe(
				map((pos: PurchaseOrderQueryDto[]) => {
					return (
						pos.map((po) => {
							if (po.numberMissingButRequired) {
								po.number = 'Missing but required';
							}
						}),
						pos.filter((po) => !this.data?.addedPoIds.includes(po.id))
					);
				})
			)
			.subscribe((filteredPos) => {
				this.purchaseOrders = filteredPos;
			});
	}

	private _getEnums() {
        this.purchaseOrderCapTypes = this.getStaticEnumValue('purchaseOrderCapTypes');
        this.currencies = this.getStaticEnumValue('currencies');
        this.valueUnitTypes = this.getStaticEnumValue('valueUnitTypes');
        this.eCurrencies = this.arrayToEnum(this.currencies);
	}

	private _filterOutPOs(poSource: EPOSource) {
		const poExistsOnThisWf = poSource === EPOSource.ExistingPO;
		return this.purchaseOrders.filter((x) => x.purchaseOrderCurrentContextData.existsInThisWorkflow === poExistsOnThisWf);
	}

	private _clearData() {
		this.existingPo = new PurchaseOrderQueryDto();
		this.purchaseOrderForm.id.setValue(null);
		this.purchaseOrderForm.number.setValue(null);
		this.purchaseOrderForm.existingPo.setValue(null);
		this.purchaseOrderForm.receiveDate.setValue(null);
		this.purchaseOrderForm.numberMissingButRequired.setValue(false);
		this.purchaseOrderForm.capForInvoicing.maxAmount.setValue(null);
		this.purchaseOrderForm.capForInvoicing.valueUnitTypeId.setValue(null);
		this.purchaseOrderForm.capForInvoicing.currencyId.setValue(null);
	}

	private _filterPOsAutocomplete(filter: string): PurchaseOrderQueryDto[] {
		const filterValue = filter.toLowerCase().trim();
		const result = this.availablePurchaseOrders.filter((x) => x.number.toLowerCase().includes(filterValue));
		if (filter === '') {
			return this.availablePurchaseOrders;
		} else {
			return result;
		}
	}

    private _subClientResponsible$() {
		this.filteredClientContacts$ = this.purchaseOrderForm.clientContactResponsible.valueChanges.pipe(
			takeUntil(this._unsubscribe),
			debounceTime(300),
			switchMap((value: any) => {
				const clientIds = [this.data.directClientId];
				let toSend = {
					clientIds: clientIds,
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
		);
	}
}
