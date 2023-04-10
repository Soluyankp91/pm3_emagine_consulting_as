import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { EnvelopeRelatedAgreementDto } from '../../../../../../shared/service-proxies/service-proxies';

@Component({
	selector: 'app-void-envelope-popup',
	standalone: true,
	templateUrl: './void-envelope-popup.component.html',
	styleUrls: ['./void-envelope-popup.component.scss'],
	imports: [
		CommonModule,
		MatDialogModule,
		MatIconModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
	],
})
export class VoidEnvelopePopupComponent implements OnInit {
	agreements: EnvelopeRelatedAgreementDto[] = [];
	freeTextLimit = 255;

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
