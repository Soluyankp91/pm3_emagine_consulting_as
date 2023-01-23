import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AgreementCreationMode } from 'src/shared/service-proxies/service-proxies';

export type SignerFormGroup = FormGroup<{
	signerType: FormControl<null>;
	signerId: FormControl<null>;
	roleId: FormControl<null>;
	signOrder: FormControl<null>;
}>;
export class AgreementModel extends FormGroup {
	constructor() {
		super({
			parentTemplate: new FormControl(null),
			creationMode: new FormControl({
				value: AgreementCreationMode.FromScratch,
				disabled: true,
			}),
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
			startDate: new FormControl(null),
			endDate: new FormControl(null),
			note: new FormControl(null),
			isSignatureRequired: new FormControl(null),
			signers: new FormArray<SignerFormGroup>([]),
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
		let currentValue = this.INITIAL_AGREEMENT_FORM_VALUE$;
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

	get creationMode() {
		return this.get('creationMode');
	}

	get agreementType() {
		return this.get('agreementType');
	}

	get recipientTypeId() {
		return this.get('recipientTypeId');
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

	get date() {
		return this.get('date') as FormGroup;
	}

	get isSignatureRequired() {
		return this.get('isSignatureRequired');
	}

	get signers() {
		return this.get('signers') as FormArray<SignerFormGroup>;
	}

	get initial$() {
		return this.INITIAL_AGREEMENT_FORM_VALUE$.asObservable();
	}

	get initialValue() {
		return this.INITIAL_AGREEMENT_FORM_VALUE$.value;
	}

	private INITIAL_AGREEMENT_FORM_VALUE$ = new BehaviorSubject<{ [key: string]: any }>({
		parentTemplate: null,
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
