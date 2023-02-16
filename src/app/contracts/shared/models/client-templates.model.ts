import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

export class ClientTemplatesModel extends FormGroup {
	constructor() {
		super({
			agreementType: new FormControl(null, [Validators.required]),
			recipientTypeId: new FormControl(null, [Validators.required]),
			clientId: new FormControl(null, [Validators.required]),
			name: new FormControl(null, [Validators.required]),
			agreementNameTemplate: new FormControl(null, [Validators.required]),
			definition: new FormControl(null, []),
			legalEntities: new FormControl(null, [Validators.required]),
			salesTypes: new FormControl(null, [Validators.required]),
			deliveryTypes: new FormControl(null, [Validators.required]),
			contractTypes: new FormControl(null, [Validators.required]),
			language: new FormControl(null, [Validators.required]),
			note: new FormControl(null, []),
			isSignatureRequired: new FormControl(null, []),
			isEnabled: new FormControl(null, []),
			selectedInheritedFiles: new FormControl(),
			uploadedFiles: new FormControl(),
		});
	}
	get agreementType() {
		return this.get('agreementType');
	}

	get recipientTypeId() {
		return this.get('recipientTypeId');
	}

	get clientId() {
		return this.get('clientId');
	}

	get name() {
		return this.get('name');
	}

	get agreementNameTemplate() {
		return this.get('agreementNameTemplate');
	}

	get definition() {
		return this.get('definition');
	}

	get legalEntities() {
		return this.get('legalEntities');
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

	get note() {
		return this.get('note');
	}

	get isSignatureRequired() {
		return this.get('isSignatureRequired');
	}

	get isEnabled() {
		return this.get('isEnabled');
	}
	get selectedInheritedFiles() {
		return this.get('selectedInheritedFiles');
	}
	get uploadedFiles() {
		return this.get('uploadedFiles');
	}

	get initialValue() {
		return this.INITIAL_CLIENT_TEMPLATE_FORM_VALUE$.value;
	}

	private INITIAL_CLIENT_TEMPLATE_FORM_VALUE$ = new BehaviorSubject<{ [key: string]: any }>({
		agreementType: null,
		recipientTypeId: null,
		clientId: null,
		name: null,
		agreementNameTemplate: null,
		definition: null,
		legalEntities: null,
		salesTypes: null,
		deliveryTypes: null,
		contractTypes: null,
		language: null,
		note: null,
		isSignatureRequired: null,
		isEnabled: null,
		selectedInheritedFiles: null,
		uploadedFiles: null,
	});

	addControl(
		name: string,
		control: AbstractControl,
		options?: {
			emitEvent?: boolean;
		}
	): void {
		let currentValue = this.INITIAL_CLIENT_TEMPLATE_FORM_VALUE$.value;
		let updatedValue = {
			...currentValue,
			[name]: control.value,
		};
		this.INITIAL_CLIENT_TEMPLATE_FORM_VALUE$.next(updatedValue);
		super.addControl(name, control, options);
	}

	removeControl(name: string, options?: { emitEvent?: boolean }): void {
		let updatedValue = {
			...this.INITIAL_CLIENT_TEMPLATE_FORM_VALUE$.value,
		};
		delete updatedValue[name];
		this.INITIAL_CLIENT_TEMPLATE_FORM_VALUE$.next(updatedValue);
		super.removeControl(name, options);
	}

	get initial$() {
		return this.INITIAL_CLIENT_TEMPLATE_FORM_VALUE$.asObservable();
	}
}
