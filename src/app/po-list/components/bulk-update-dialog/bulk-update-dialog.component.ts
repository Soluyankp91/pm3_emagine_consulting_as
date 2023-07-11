import { Component, EventEmitter, Inject, Injector, OnDestroy, OnInit, Output } from '@angular/core';
import { EBulkUpdateDiallogTypes } from './bulk-update.dialog.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject, of } from 'rxjs';
import { AppComponentBase } from 'src/shared/app-component-base';
import { UntypedFormControl } from '@angular/forms';
import { debounceTime, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import {
	ContactResultDto,
	EmployeeDto,
	LookupServiceProxy,
	PurchaseOrderSetEmagineResponsiblesCommand,
	PurchaseOrdersSetClientContactResponsibleCommand,
} from 'src/shared/service-proxies/service-proxies';
import { Store } from '@ngrx/store';
import { getEmployees } from 'src/app/store/selectors';

@Component({
	selector: 'app-bulk-update-dialog',
	templateUrl: './bulk-update-dialog.component.html',
	styleUrls: ['./bulk-update-dialog.component.scss'],
})
export class BulkUpdateDialogComponent extends AppComponentBase implements OnInit, OnDestroy {
	@Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
	@Output() onRejected: EventEmitter<any> = new EventEmitter<any>();

	employees$: Observable<EmployeeDto[]>;
	dialogTypes = EBulkUpdateDiallogTypes;
	contractManagerFilter = new UntypedFormControl('');
	salesManagerFilter = new UntypedFormControl('');
	filteredAccountManagers$: Observable<EmployeeDto[]>;
	filteredContractManagers$: Observable<EmployeeDto[]>;
	clientContactFilter = new UntypedFormControl('');
	filteredClientContacts$: Observable<ContactResultDto[]>;
	private _unsubscribe = new Subject();
	constructor(
		injector: Injector,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			dialogType: EBulkUpdateDiallogTypes;
			dialogTitle: string;
			dialogText: string;
			clientIds?: number[] | undefined;
			purchaseOrderIds?: number[];
			rejectButtonText: string;
			confirmButtonText: string;
			isNegative: boolean;
		},
		private dialogRef: MatDialogRef<BulkUpdateDialogComponent>,
		private readonly _lookupService: LookupServiceProxy,
		private _store: Store
	) {
		super(injector);
	}
	ngOnInit(): void {
		switch (this.data.dialogType) {
			case EBulkUpdateDiallogTypes.UpdateClientResponsible:
				this._subClientResponsible$();
				break;
			case EBulkUpdateDiallogTypes.UpdateEmagineResponsible:
				this.employees$ = this._store.select(getEmployees);
				this._subEmagineResponsible$();
				break;
		}
	}
	ngOnDestroy(): void {
		this._unsubscribe.next();
		this._unsubscribe.complete();
	}

	close(): void {
		this.onRejected.emit();
		this.closeInternal();
	}

	confirm(): void {
		switch (this.data.dialogType) {
			case EBulkUpdateDiallogTypes.UpdateEmagineResponsible:
				let outputEmagineData = new PurchaseOrderSetEmagineResponsiblesCommand();
				outputEmagineData.purchaseOrdersIds = this.data.purchaseOrderIds;
				outputEmagineData.contractResponsibleId = this.contractManagerFilter.value.id;
				outputEmagineData.salesResponsibleId = this.salesManagerFilter.value.id;
				this.confirmAndClose(outputEmagineData);
				break;
			case EBulkUpdateDiallogTypes.UpdateClientResponsible:
				let outputClientData = new PurchaseOrdersSetClientContactResponsibleCommand();
				outputClientData.purchaseOrdersIds = this.data.purchaseOrderIds;
				outputClientData.clientContactResponsibleId = this.clientContactFilter.value.id;
				this.confirmAndClose(outputClientData);
				break;
		}
	}

	confirmAndClose(outputData: PurchaseOrdersSetClientContactResponsibleCommand | PurchaseOrderSetEmagineResponsiblesCommand) {
		this.onConfirmed.emit(outputData);
		this.closeInternal();
	}

	reject(): void {
		this.onRejected.emit();
		this.closeInternal();
	}

	private closeInternal(): void {
		this.dialogRef.close();
	}

	private _subClientResponsible$() {
		this.filteredClientContacts$ = this.clientContactFilter.valueChanges.pipe(
			takeUntil(this._unsubscribe),
			debounceTime(300),
			switchMap((value: any) => {
				const clientIds = this.data.clientIds.filter(Boolean);
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
					return of([new ContactResultDto()]);
				}
			})
		);
	}

	private _subEmagineResponsible$() {
		this.contractManagerFilter.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(500),
				startWith(''),
				map((value) => {
					return this._filterEmployees(value ?? '');
				})
			)
			.subscribe((result) => {
				this.filteredContractManagers$ = result;
			});

		this.salesManagerFilter.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(500),
				startWith(''),
				map((value) => {
					return this._filterEmployees(value ?? '');
				})
			)
			.subscribe((result) => {
				this.filteredAccountManagers$ = result;
			});
	}

	private _filterEmployees(value: string): Observable<EmployeeDto[]> {
		const filterValue = value.toLowerCase();
		const result = this.employees$.pipe(
			map((response) => response.filter((option) => option.name.toLowerCase().includes(filterValue)).slice(0, 100))
		);
		if (value === '') {
			return this.employees$.pipe(map((employees) => employees.slice(0, 100)));
		} else {
			return result;
		}
	}
}
