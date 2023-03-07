import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { SignerType } from 'src/shared/service-proxies/service-proxies';
import { DEFINITION_MAX_SIZE, NAME_TEMPLATE_MAX_SIZE, NOTES_MAX_SIZE } from '../entities/contracts.constants';

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
			nameTemplate: new FormControl('', [Validators.required, Validators.maxLength(NAME_TEMPLATE_MAX_SIZE)]),
			definition: new FormControl('', [Validators.maxLength(DEFINITION_MAX_SIZE)]),
			legalEntityId: new FormControl(null, [Validators.required]),
			salesTypes: new FormControl(null, [Validators.required]),
			deliveryTypes: new FormControl(null, [Validators.required]),
			contractTypes: new FormControl(null, [Validators.required]),
			language: new FormControl(null, [Validators.required]),
			startDate: new FormControl(null, [Validators.required]),
			endDate: new FormControl(null, [Validators.required]),
			note: new FormControl('', [Validators.maxLength(NOTES_MAX_SIZE)]),
            receiveAgreementsFromOtherParty: new FormControl(false),
			isSignatureRequired: new FormControl(false),
			signers: new FormControl([]),
			attachments: new FormControl([]),
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

	reset(value?: any, options?: { onlySelf?: boolean; emitEvent?: boolean }): void {
		super.reset(this.initialValue, options);
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

	get definition() {
		return this.get('definition');
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

    get note() {
        return this.get('note');
    }

	get signers() {
		return this.get('signers');
	}

	get parentSelectedAttachmentIds() {
		return this.get('parentSelectedAttachmentIds');
	}

	get attachments() {
		return this.get('attachments');
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
		nameTemplate: '',
		definition: '',
		legalEntityId: null,
		salesTypes: null,
		deliveryTypes: null,
		contractTypes: null,
		language: null,
        receiveAgreementsFromOtherParty: false,
		note: '',
		startDate: null,
		endDate: null,
		isSignatureRequired: false,
		signers: [],
		attachments: [],
	});
}
