import { Component, OnInit, Self, DoCheck, ViewEncapsulation, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
	NgControl,
	ControlValueAccessor,
	FormArray,
	FormBuilder,
	FormControl,
	Validators,
	AbstractControl,
	FormGroup,
} from '@angular/forms';
import { BehaviorSubject, forkJoin, of, Subject } from 'rxjs';
import { switchMap, startWith, takeUntil, tap, map } from 'rxjs/operators';
import { SignerOptions } from 'src/app/contracts/agreements/template-editor/settings/settings.interfaces';
import { AgreementDetailsSignerDto, LookupServiceProxy, SignerType } from 'src/shared/service-proxies/service-proxies';
import { ContractsService } from '../../services/contracts.service';

export enum SignerDropdowns {
	INTERNAL,
	CLIENT,
	SUPPLIER,
	CONSULTANT,
}
@Component({
	selector: 'app-signers-table',
	templateUrl: './signers-table.component.html',
	styleUrls: ['./signers-table.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class SignersTableComponent implements OnInit, OnDestroy, DoCheck, OnChanges, ControlValueAccessor {
	formArray: FormArray;

	options$ = this._contractService.signersEnum$$;

	signerDropdowns = SignerDropdowns;

	prefillMode = false;

	signerTableData: AbstractControl[] = [];
	signerOptionsArr$: SignerOptions[] = [];
	displayedSignerColumns = ['signerType', 'signerName', 'signingRole', 'signOrder', 'actions'];
	isOptionsLoading$ = new BehaviorSubject(false);

	onChange: any = () => {};
	onTouch: any = () => {};

	@Input() supplier: { typeId: number; id: number } = { typeId: -1, id: 0 };

	private _unSubscribe$ = new Subject<void>();

	constructor(
		@Self() private readonly ngControl: NgControl,
		private readonly _fb: FormBuilder,
		private readonly _lookupService: LookupServiceProxy,
		private readonly _contractService: ContractsService
	) {
		ngControl.valueAccessor = this;
	}

	ngOnInit(): void {}
	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
	}
	ngOnChanges(changes: SimpleChanges): void {
		// console.log(this.supplier);
	}

	ngDoCheck(): void {
		if (this.ngControl.control?.touched) {
			this.formArray.markAllAsTouched();
			this.formArray.updateValueAndValidity({ emitEvent: false });
		}
	}

	addSigner() {
		this.formArray.push(
			this._fb.group({
				signerType: new FormControl<null | SignerType>(null, [Validators.required]),
				signerId: new FormControl<null | number>(null, [Validators.required]),
				roleId: new FormControl<null | number>(null, [Validators.required]),
				signOrder: new FormControl<null | number>(null, [Validators.required]),
			})
		);
		this.signerTableData = [...this.formArray.controls];
		this.signerOptionsArr$.push(<SignerOptions>{
			options$: null,
			optionsChanged$: new BehaviorSubject<string>(''),
		});
	}

	deleteSigner(signerRowIndex: number) {
		this.formArray.removeAt(signerRowIndex);
		this.signerTableData = [...this.formArray.controls];
		this.signerOptionsArr$.splice(signerRowIndex, 1);
	}

	registerOnChange(fn: any) {
		this.onChange = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouch = fn;
	}

	writeValue(signers: AgreementDetailsSignerDto[] | null) {
		this.formArray = new FormArray([]);
		this._subscribeOnFormArray();
		this.signerTableData = [];
		this.signerOptionsArr$ = [];
		if (!signers) {
			return;
		}
		this.prefillMode = true;
		signers.forEach((signerDto, index) => {
			this.formArray.push(
				new FormGroup({
					signerType: new FormControl(signerDto.signerType as SignerType, [Validators.required]),
					signerId: new FormControl(signerDto.signerId as number, [Validators.required]),
					roleId: new FormControl(signerDto.roleId as number, [Validators.required]),
					signOrder: new FormControl(signerDto.signOrder as number, [Validators.required]),
				}),
				{ emitEvent: false }
			);
			this.signerTableData = [...this.formArray.controls];
			this.signerOptionsArr$.push(<SignerOptions>{
				options$: null,
				optionsChanged$: new BehaviorSubject<string>(String(signerDto.signerId as number)),
			});
			this.onSignerTypeChange(signerDto.signerType as SignerType, index);
		});
		this.prefillMode = false;
	}

	onSignerTypeChange(signerType: SignerType, rowIndex: number) {
		if (!this.prefillMode) {
			this.signerOptionsArr$[rowIndex].optionsChanged$.next('');
			(this.formArray.at(rowIndex) as FormGroup).controls['signerId'].reset();
		}
		switch (signerType) {
			case 1: {
				this.signerOptionsArr$[rowIndex].options$ = this.signerOptionsArr$[rowIndex].optionsChanged$.pipe(
					startWith((this.signerOptionsArr$[rowIndex].optionsChanged$ as BehaviorSubject<string>).value),
					tap(() => {
						this.isOptionsLoading$.next(true);
					}),
					switchMap((search: string) => {
						return forkJoin([
							of({
								label: 'InternalEmagine',
								labelKey: 'name',
								outputProperty: 'id',
								dropdownType: SignerDropdowns.INTERNAL,
							}),
							this._lookupService.employees(search, false).pipe(
								tap(() => {
									this.isOptionsLoading$.next(false);
								})
							),
						]);
					})
				);
				break;
			}
			case 2:
				this.signerOptionsArr$[rowIndex].options$ = this.signerOptionsArr$[rowIndex].optionsChanged$.pipe(
					startWith((this.signerOptionsArr$[rowIndex].optionsChanged$ as BehaviorSubject<string>).value),
					tap(() => {
						this.isOptionsLoading$.next(true);
					}),
					switchMap((search: string) => {
						return forkJoin([
							of({
								label: 'Clients',
								labelKey: 'firstName',
								outputProperty: 'id',
								dropdownType: SignerDropdowns.CLIENT,
							}),
							this._lookupService.signerContacts(search, 20).pipe(
								tap(() => {
									this.isOptionsLoading$.next(false);
								}),
								map((clients) =>
									clients.map((client) => {
										let mappedClient = Object.assign(
											{},
											{ ...client, firstName: client.firstName + ' ' + client.lastName }
										);
										delete mappedClient.lastName;
										return mappedClient;
									})
								)
							),
						]);
					})
				);
				break;
			case 3:
				this.signerOptionsArr$[rowIndex].options$ = this.signerOptionsArr$[rowIndex].optionsChanged$.pipe(
					startWith((this.signerOptionsArr$[rowIndex].optionsChanged$ as BehaviorSubject<string>).value),
					tap(() => {
						this.isOptionsLoading$.next(true);
					}),
					switchMap((search: string) => {
						return forkJoin([
							of({
								label: 'Consultants',
								labelKey: 'name',
								outputProperty: 'id',
								dropdownType: SignerDropdowns.CONSULTANT,
							}),
							this._lookupService.consultants(search, 20).pipe(
								tap(() => {
									this.isOptionsLoading$.next(false);
								})
							),
						]);
					})
				);
				break;
			case 4:
				this.signerOptionsArr$[rowIndex].options$ = this.signerOptionsArr$[rowIndex].optionsChanged$.pipe(
					startWith((this.signerOptionsArr$[rowIndex].optionsChanged$ as BehaviorSubject<string>).value),
					tap(() => {
						this.isOptionsLoading$.next(true);
					}),
					switchMap((search: any) => {
						return forkJoin([
							of({
								label: 'Suppliers',
								labelKey: 'name',
								outputProperty: 'id',
								dropdownType: SignerDropdowns.SUPPLIER,
							}),
							this._lookupService.signerSupplierMembers(search, this.supplier.id || undefined, 20).pipe(
								tap(() => {
									this.isOptionsLoading$.next(false);
								})
							),
						]);
					})
				);
				break;
			default:
				break;
		}
	}

	private _subscribeOnFormArray() {
		this.formArray.valueChanges.pipe(takeUntil(this._unSubscribe$)).subscribe((value) => {
			this.onChange(value);
			if (this.formArray.controls.every((control) => control.valid)) {
				this.ngControl.control.setErrors(null);
			} else {
				this.ngControl.control.setErrors({ required: true });
			}
		});
	}
}
