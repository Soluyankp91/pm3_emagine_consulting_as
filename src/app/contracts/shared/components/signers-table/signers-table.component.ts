import { Component, OnInit, Self, DoCheck, ViewEncapsulation } from '@angular/core';
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
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { switchMap, startWith} from 'rxjs/operators';
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
export class SignersTableComponent implements OnInit, DoCheck, ControlValueAccessor {
	formArray: FormArray;

	options$ = this._contractService.signersEnum$$;

    signerDropdowns = SignerDropdowns;

    prefillMode = false;

	signerTableData: AbstractControl[] = [];
	signerOptionsArr$: SignerOptions[] = [];
	displayedSignerColumns = ['signerType', 'signerName', 'signingRole', 'signOrder', 'actions'];

	onChange: any = () => {};
	onTouch: any = () => {};

	constructor(
		@Self() private readonly ngControl: NgControl,
		private readonly _fb: FormBuilder,
		private readonly _lookupService: LookupServiceProxy,
		private readonly _contractService: ContractsService
	) {
		ngControl.valueAccessor = this;
	}

	ngOnInit(): void {
		this._subscribeOnFormArray();
	}

	ngDoCheck(): void {
		if (this.ngControl.control?.touched) {
			this.formArray.markAllAsTouched();
			this.formArray.updateValueAndValidity();
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
        if(!this.prefillMode) {
            this.signerOptionsArr$[rowIndex].optionsChanged$.next('');
        }
		switch (signerType) {
			case 1: {
				this.signerOptionsArr$[rowIndex].options$ = this.signerOptionsArr$[rowIndex].optionsChanged$.pipe(
                    startWith((this.signerOptionsArr$[rowIndex].optionsChanged$ as BehaviorSubject<string>).value),
					switchMap((search: string) => {
						return forkJoin([
							of({
								label: 'InternalEmagine',
								labelKey: 'name',
								outputProperty: 'id',
								dropdownType: SignerDropdowns.INTERNAL,
							}),
							this._lookupService.employees(search, false),
						]);
					})
				);
				break;
			}
			case 2:
				this.signerOptionsArr$[rowIndex].options$ = this.signerOptionsArr$[rowIndex].optionsChanged$.pipe(
                    startWith((this.signerOptionsArr$[rowIndex].optionsChanged$ as BehaviorSubject<string>).value),
					switchMap((search: string) => {
						return forkJoin([
							of({
								label: 'Clients',
								labelKey: 'firstName',
								outputProperty: 'clientId',
								dropdownType: SignerDropdowns.CLIENT,
							}),
							this._lookupService.signerContacts(search, 20),
						]);
					})
				);
				break;
			case 3:
				this.signerOptionsArr$[rowIndex].options$ = this.signerOptionsArr$[rowIndex].optionsChanged$.pipe(
                    startWith((this.signerOptionsArr$[rowIndex].optionsChanged$ as BehaviorSubject<string>).value),
					switchMap((search: string) => {
						return forkJoin([
							of({
								label: 'Consultants',
								labelKey: 'name',
								outputProperty: 'id',
								dropdownType: SignerDropdowns.CONSULTANT,
							}),
							this._lookupService.consultants(search, 20),
						]);
					})
				);
				break;
			case 4:
				this.signerOptionsArr$[rowIndex].options$ = this.signerOptionsArr$[rowIndex].optionsChanged$.pipe(
                    startWith((this.signerOptionsArr$[rowIndex].optionsChanged$ as BehaviorSubject<string>).value),
					switchMap((search: string) => {
						return forkJoin([
							of({
								label: 'Suppliers',
								labelKey: 'supplierName',
								outputProperty: 'supplierId',
								dropdownType: SignerDropdowns.SUPPLIER,
							}),
							this._lookupService.suppliers(search, 20),
						]);
					})
				);
				break;
			default:
				break;
		}
	}

	_subscribeOnFormArray() {
		this.formArray.valueChanges.subscribe((value) => {
			this.onChange(value);
			if (this.formArray.controls.every((control) => control.valid)) {
				this.ngControl.control.setErrors(null);
			} else {
				this.ngControl.control.setErrors({ required: true });
			}
		});
	}
}
