import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-confirm-dialog',
	templateUrl: './confirm-dialog.component.html',
	styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
	label: string;
	message: string;

	constructor(@Inject(MAT_DIALOG_DATA) data: any) {
		this.label = data.label;
		this.message = data.message;
	}
}
