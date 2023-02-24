import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Inject,
	Input,
	OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';


@Component({
	standalone: true,
	selector: 'app-save-us-popup',
	templateUrl: './save-us-popup.component.html',
	styleUrls: ['./save-us-popup.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule, MatFormFieldModule, ReactiveFormsModule, TextFieldModule, MatInputModule, MatCheckboxModule],
})
export class SaveUsPopupComponent implements OnInit {
	constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            isNew: boolean
        },
        private _dialogRef: MatDialogRef<SaveUsPopupComponent>,
		private _fb: FormBuilder
    ) {}
	
	config = {
		title: 'Save as a new version',
		subtitle: 'You are overriding the current template version.',
		warning: 'Any significant changes should be promoted to a new version via Draft mode.'
	}

	form: FormGroup = this._fb.group({
		description: [''],
		propogate: [''],
		markActive: ['']
	});

    ngOnInit(): void {
    }

	generateViewData(isNew: boolean) {
		if (isNew) {

		} else {

		}
	}

    close(): void {
        this._dialogRef.close();
    }
}
