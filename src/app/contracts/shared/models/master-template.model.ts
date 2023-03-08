import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { DEFINITION_MAX_SIZE, NAME_TEMPLATE_MAX_SIZE, NOTES_MAX_SIZE } from '../entities/contracts.constants';

export class MasterTemplateModel extends FormGroup {
	constructor() {
		super({
			agreementType: new FormControl(null, [Validators.required]),
			recipientTypeId: new FormControl(null, [Validators.required]),
			name: new FormControl('', [Validators.required, Validators.maxLength(NAME_TEMPLATE_MAX_SIZE)]),
			agreementNameTemplate: new FormControl('', [Validators.required, Validators.maxLength(NAME_TEMPLATE_MAX_SIZE)]),
			definition: new FormControl('', [Validators.maxLength(DEFINITION_MAX_SIZE)]),
			legalEntities: new FormControl(null, [Validators.required]),
			salesTypes: new FormControl(null, [Validators.required]),
			deliveryTypes: new FormControl(null, [Validators.required]),
			contractTypes: new FormControl(null, [Validators.required]),
			language: new FormControl(null, [Validators.required]),
			note: new FormControl('', [Validators.maxLength(NOTES_MAX_SIZE)]),
			isSignatureRequired: new FormControl(false),
			isEnabled: new FormControl(false),
			isDefaultTemplate: new FormControl(false),
			attachments: new FormControl([]),
		});
	}

	addControl(name: string, control: AbstractControl, options?: { emitEvent?: boolean }): void {
		let currentValue = this.INITIAL_MASTER_TEMPLATE_FORM_VALUE$.value;
		let updatedValue = {
			...currentValue,
			[name]: control.value,
		};
		this.INITIAL_MASTER_TEMPLATE_FORM_VALUE$.next(updatedValue);
		super.addControl(name, control, options);
	}

	removeControl(name: string, options?: { emitEvent?: boolean }): void {
		let updatedValue = {
			...this.INITIAL_MASTER_TEMPLATE_FORM_VALUE$.value,
		};
		delete updatedValue[name];
		this.INITIAL_MASTER_TEMPLATE_FORM_VALUE$.next(updatedValue);
		super.removeControl(name, options);
	}

	reset(formState?: any, options?: { onlySelf?: boolean; emitEvent?: boolean }): void {
		super.reset(formState ? formState : this.INITIAL_MASTER_TEMPLATE_FORM_VALUE$.value, options);
	}

	get duplicationSourceAgreementTemplateId() {
		return this.get('duplicationSourceAgreementTemplateId');
	}

	get agreementType() {
		return this.get('agreementType');
	}

	get recipientTypeId() {
		return this.get('recipientTypeId');
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

	get isDefaultTemplate() {
		return this.get('isDefaultTemplate');
	}

	get attachments() {
		return this.get('attachments');
	}

	get initial$() {
		return this.INITIAL_MASTER_TEMPLATE_FORM_VALUE$.asObservable();
	}

	private INITIAL_MASTER_TEMPLATE_FORM_VALUE$ = new BehaviorSubject<{
		[key: string]: any;
	}>({
		agreementType: null,
		recipientTypeId: null,
		name: '',
		agreementNameTemplate: '',
		definition: '',
		legalEntities: null,
		salesTypes: null,
		deliveryTypes: null,
		contractTypes: null,
		language: null,
		note: '',
		isSignatureRequired: false,
		isDefaultTemplate: false,
		isEnabled: false,
		attachments: [],
	});
}
