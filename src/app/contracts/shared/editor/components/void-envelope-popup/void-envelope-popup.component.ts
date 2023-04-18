import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { EnvelopeRelatedAgreementDto } from '../../../../../../shared/service-proxies/service-proxies';
import { EditorPopupConfigs, EditorPopupWrapperComponent } from '../editor-popup-wrapper';

@Component({
	selector: 'app-void-envelope-popup',
	standalone: true,
	templateUrl: './void-envelope-popup.component.html',
	styleUrls: ['./void-envelope-popup.component.scss'],
	imports: [
		CommonModule,
		MatIconModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		EditorPopupWrapperComponent,
	],
})
export class VoidEnvelopePopupComponent implements OnInit {
	popupConfigs: EditorPopupConfigs = {
		title: 'Void previous version',
		subtitle:
			'Promoting draft to a new version of the agreement, will result in voiding entire envelope that has already been sent for all the parties.',
		rejectButtonLabel: 'Cancel',
		confirmButtonLabel: 'Proceed',
	};

	freeTextLimit = 255;
	agreements: EnvelopeRelatedAgreementDto[] = [];

	form: FormGroup = new FormGroup({
		voidingReason: new FormControl('', Validators.required),
		versionDescription: new FormControl('', Validators.required),
	});

	constructor(
		@Inject(MAT_DIALOG_DATA) private data: { agreements: EnvelopeRelatedAgreementDto[] },
		private _dialogRef: MatDialogRef<VoidEnvelopePopupComponent>
	) {
		this.agreements = data.agreements;
	}

	ngOnInit(): void {}

	submit() {
		let { voidingReason: reason, versionDescription: description } = this.form.value;
		this._dialogRef.close({ reason, description });
	}

	close(): void {
		this._dialogRef.close();
	}
}
