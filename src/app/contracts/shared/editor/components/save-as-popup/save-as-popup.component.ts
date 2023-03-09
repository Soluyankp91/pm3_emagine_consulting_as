import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	Inject,
	OnInit,
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { IDocumentVersion } from '../../entities';
import { EditorCoreService } from '../../services';


@Component({
	standalone: true,
	selector: 'app-save-as-popup',
	templateUrl: './save-as-popup.component.html',
	styleUrls: ['./save-as-popup.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule, MatFormFieldModule, ReactiveFormsModule, TextFieldModule, MatInputModule, MatCheckboxModule, FormsModule],
})
export class SaveAsPopupComponent implements OnInit {
	constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
			document: IDocumentVersion,
			isAgreement: boolean,
			versions: IDocumentVersion[],
			base64: string
		},
        private _dialogRef: MatDialogRef<SaveAsPopupComponent>
    ) {
	}
	
	config = {
		title: 'Save updates',
		subtitle: 'You are overriding the current template version.',
		warning: 'Any significant changes should be promoted to a new version via Draft mode.'
	}

	form: FormGroup = new FormGroup({
		versionDescription: new FormControl(this.data.document.isCurrent ? this.data.document.description : ''),
		propagateChangesToDerivedTemplates: new FormControl(false),
		markActiveAgreementsAsOutdated: new FormControl(false),
		fileContent: new FormControl(this.data.base64)
	});

	ngOnInit(): void {
		if (!this.data.document.isCurrent) {
			this.config.title = 'Save as a new version';
			this.config.subtitle = '';
			this.config.warning = '';

			if (this.data.isAgreement) {
				this.config.subtitle = 'You are promoting agreement draft to a new agreement version';
			}
		}

		if (this.data.isAgreement) {
			this.form.removeControl('propagateChangesToDerivedTemplates');
			this.form.removeControl('markActiveAgreementsAsOutdated');
		}

		// if (this.data.versions.length === 1) {
		// 	this.config.warning = '';
		// 	this.form.removeControl('versionDescription');
		// }
	}

	submit() {
		this._dialogRef.close({...this.form.value})
	}

    close(): void {
        this._dialogRef.close();
    }
}
