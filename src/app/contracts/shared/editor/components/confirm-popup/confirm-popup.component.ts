import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditorPopupConfigs, EditorPopupWrapperComponent } from '../editor-popup-wrapper';

@Component({
	standalone: true,
	selector: 'app-confirm-popup',
	templateUrl: './confirm-popup.component.html',
	styleUrls: ['./confirm-popup.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CommonModule, EditorPopupWrapperComponent],
})
export class ConfirmPopupComponent {
	popupConfigs: EditorPopupConfigs;
	constructor(
		@Inject(MAT_DIALOG_DATA)
		public data: {
			title: string;
			body: string;
			confirmBtnText?: string;
			cancelBtnText?: string;
		},
		private _dialogRef: MatDialogRef<ConfirmPopupComponent>
	) {
		this.popupConfigs = {
			title: data.title,
			subtitle: data.body,
			confirmButtonLabel: data.confirmBtnText || 'Yes',
			rejectButtonLabel: data.cancelBtnText || 'No',
		};
	}

	submit() {
		this._dialogRef.close(true);
	}

	close(): void {
		this._dialogRef.close();
	}
}
