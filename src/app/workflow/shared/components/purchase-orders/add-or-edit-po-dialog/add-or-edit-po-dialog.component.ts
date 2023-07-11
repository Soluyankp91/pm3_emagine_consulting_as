import { AfterViewInit, Component, EventEmitter, Inject, Injector, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { finalize, map, startWith, takeUntil } from 'rxjs/operators';
import { WorkflowDataService } from 'src/app/workflow/workflow-data.service';
import { EValueUnitTypes } from 'src/app/workflow/workflow-sales/workflow-sales.model';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
	EnumEntityTypeDto,
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
	private _unsubsribe = new Subject();
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
		private readonly _workflowDataService: WorkflowDataService
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
			takeUntil(this._unsubsribe),
			startWith(''),
			map((value) => {
				if (typeof value === 'string') {
					return this._filterPOsAutocomplete(value);
				}
			})
		);
	}

    ngAfterViewInit(): void {
        if (this.existingPo.purchaseOrderDocumentQueryDto) {
            this.poDocuments.addExistingPOFile(this.existingPo.purchaseOrderDocumentQueryDto);
        }
    }

	ngOnDestroy(): void {
		this._unsubsribe.next();
		this._unsubsribe.complete();
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
        }
		if (form.id !== null) {
			if (!this.existingPo.purchaseOrderCurrentContextData.isUserAllowedToEdit) {
				// NB: don't call BE if user is not allowed to edit, just add to a list
                this.existingPo.purchaseOrderDocumentQueryDto = new PurchaseOrderDocumentQueryDto();
                if (this.poDocuments?.documents.value?.length) {
                    for (let document of this.poDocuments?.documents.value) {
                        let documentInput = new PurchaseOrderDocumentQueryDto();
                        documentInput.id = document.workflowDocumentId;
                        documentInput.createdBy = document.createdBy;
                        documentInput.createdDateUtc = document.createdDateUtc;
                        documentInput.name = document.name;
                        this.existingPo.purchaseOrderDocumentQueryDto = documentInput;
                    }
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
			this.purchaseOrderForm.number.disable();
			this.purchaseOrderForm.receiveDate.disable();
		} else {
			this.purchaseOrderForm.number.enable();
			this.purchaseOrderForm.receiveDate.enable();
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
}
