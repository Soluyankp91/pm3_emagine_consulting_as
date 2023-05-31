import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IDocumentVersion } from '../../entities';
import { EditorPopupConfigs, EditorPopupWrapperComponent } from '../editor-popup-wrapper';

@Component({
	standalone: true,
	selector: 'app-save-as-popup',
	templateUrl: './save-as-popup.component.html',
	styleUrls: ['./save-as-popup.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		CommonModule,
		MatFormFieldModule,
		ReactiveFormsModule,
		TextFieldModule,
		MatInputModule,
		MatCheckboxModule,
		FormsModule,
		EditorPopupWrapperComponent,
	],
})
export class SaveAsPopupComponent implements OnInit {
	popupConfig: EditorPopupConfigs = {
		confirmButtonLabel: 'Save',
		rejectButtonLabel: 'Cancel',
		title: 'Save as a new version',
		subtitle: 'You are promoting template draft to a current template version.',
		warning: 'Any significant changes should be promoted to a new version via Draft mode.',
	};

	constructor(
		@Inject(MAT_DIALOG_DATA)
		public data: {
			document: IDocumentVersion;
			isAgreement: boolean;
			isClientSpecific?: boolean;
			versions: IDocumentVersion[];
			base64: string;
		},
		private _dialogRef: MatDialogRef<SaveAsPopupComponent>
	) {}

	descriptionLimit = 255;

	form: FormGroup = new FormGroup({
		versionDescription: new FormControl(
			this.data.document.isCurrent ? this.data.document.description : '',
			Validators.maxLength(this.descriptionLimit)
		),
		propagateChangesToDerivedTemplates: new FormControl(false),
		markActiveAgreementsAsOutdated: new FormControl(false),
		fileContent: new FormControl(this.data.base64),
	});

	ngOnInit(): void {
		if (!this.data.document.isCurrent) {
			this.popupConfig = {
				...this.popupConfig,
				title: 'Save as a new version',
				subtitle: '',
				warning: '',
			};

			if (this.data.isAgreement) {
				this.popupConfig = {
					...this.popupConfig,
					subtitle: 'You are promoting agreement draft to a new agreement version',
				};
			}
		}

		if (this.data.isAgreement) {
			this.form.removeControl('propagateChangesToDerivedTemplates');
			this.form.removeControl('markActiveAgreementsAsOutdated');
		}

		if (this.data.isClientSpecific) {
			this.form.removeControl('propagateChangesToDerivedTemplates');
		}

		if (this.data.versions.length === 1) {
			// this.config.title = 'Save as a new template';
			// this.config.subtitle = 'You are promoting template draft to a current template version.';
			// this.config.warning = '';
			// this.form.removeControl('versionDescription');
			// this.form.removeControl('propagateChangesToDerivedTemplates');
			// this.form.removeControl('markActiveAgreementsAsOutdated');
		}
	}

	submit() {
		this._dialogRef.close({ ...this.form.value });
	}

	close(): void {
		this._dialogRef.close();
	}
}
