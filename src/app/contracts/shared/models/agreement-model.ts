import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { SignerType } from 'src/shared/service-proxies/service-proxies';

export type SignerFormGroup = FormGroup<{
	signerType: FormControl<null | SignerType>;
	signerId: FormControl<null | number>;
	roleId: FormControl<null | number>;
	signOrder: FormControl<null | number>;
}>;
export class AgreementModel extends FormGroup {
	constructor() {
		super({
			agreementType: new FormControl(null, [Validators.required]),
			recipientTypeId: new FormControl(null, [Validators.required]),
			recipientId: new FormControl(null, [Validators.required]),
			nameTemplate: new FormControl(null, [Validators.required]),
			definition: new FormControl(null),
			legalEntityId: new FormControl(null, [Validators.required]),
			salesTypes: new FormControl(null, [Validators.required]),
			deliveryTypes: new FormControl(null, [Validators.required]),
			contractTypes: new FormControl(null, [Validators.required]),
			language: new FormControl(null, [Validators.required]),
			startDate: new FormControl(null, [Validators.required]),
			endDate: new FormControl(null, [Validators.required]),
			note: new FormControl(null),
			isSignatureRequired: new FormControl(null),
			signers: new FormControl([]),
			selectedInheritedFiles: new FormControl(null),
			uploadedFiles: new FormControl(null),
		});
	}

	addControl(
		name: string,
		control: AbstractControl,
		options?: {
			emitEvent?: boolean;
		}
	): void {
		let currentValue = this.INITIAL_AGREEMENT_FORM_VALUE$.value;
		let updatedValue = {
			...currentValue,
			[name]: control.value,
		};
		this.INITIAL_AGREEMENT_FORM_VALUE$.next(updatedValue);
		super.addControl(name, control, options);
	}

	removeControl(name: string, options?: { emitEvent?: boolean }): void {
		let updatedValue = {
			...this.INITIAL_AGREEMENT_FORM_VALUE$.value,
		};
		delete updatedValue[name];
		this.INITIAL_AGREEMENT_FORM_VALUE$.next(updatedValue);
		super.removeControl(name, options);
	}

	get agreementType() {
		return this.get('agreementType');
	}

	get recipientTypeId() {
		return this.get('recipientTypeId');
	}

	get recipientId() {
		return this.get('recipientId');
	}

	get nameTemplate() {
		return this.get('nameTemplate');
	}

	get legalEntityId() {
		return this.get('legalEntityId');
	}

	get salesTypes() {
		return this.get('salesTypes');
	}

	get deliveryTypes() {
		return this.get('deliveryTypes');
	}

	get contractTypes() {
		return this.get('contractTypes');
	}

	get language() {
		return this.get('language');
	}

    get startDate() {
		return this.get('startDate');
	}
    
    get endDate() {
		return this.get('endDate');
	}

	get date() {
		return this.get('date') as FormGroup;
	}

	get isSignatureRequired() {
		return this.get('isSignatureRequired');
	}

	get signers() {
		return this.get('signers');
	}

	get initial$() {
		return this.INITIAL_AGREEMENT_FORM_VALUE$.asObservable();
	}

	get initialValue() {
		return this.INITIAL_AGREEMENT_FORM_VALUE$.value;
	}

	private INITIAL_AGREEMENT_FORM_VALUE$ = new BehaviorSubject<{ [key: string]: any }>({
		agreementType: null,
		recipientId: null,
		recipientTypeId: null,
		nameTemplate: null,
		definition: null,
		legalEntityId: null,
		salesTypes: null,
		deliveryTypes: null,
		contractTypes: null,
		language: null,
		note: null,
		startDate: null,
		endDate: null,
		isSignatureRequired: null,
		signers: [],
		selectedInheritedFiles: null,
		uploadedFiles: null,
	});
}