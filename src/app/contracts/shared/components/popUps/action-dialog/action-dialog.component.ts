import { Component, Inject, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

@Component({
	selector: 'app-action-dialog',
	templateUrl: './action-dialog.component.html',
	styleUrls: ['./action-dialog.component.scss'],
})
export class ActionDialogComponent {
	label: string;
	message: string;

	cancelButtonLabel: string;
	acceptButtonLabel: string;

	template: TemplateRef<any>;

	acceptButtonClass: 'discard-button' | 'confirm-button' = 'discard-button';
	acceptButtonDisabled$: BehaviorSubject<boolean>;

	constructor(@Inject(MAT_DIALOG_DATA) data: any) {
		this.label = data.label;
		this.message = data.message;

		this.cancelButtonLabel = data.cancelButtonLabel;
		this.acceptButtonLabel = data.acceptButtonLabel;

		this.acceptButtonDisabled$ = data.acceptButtonDisabled$;
		this.template = data.template;

		if (data.acceptButtonClass) {
			this.acceptButtonClass = data.acceptButtonClass;
		}
	}
}
