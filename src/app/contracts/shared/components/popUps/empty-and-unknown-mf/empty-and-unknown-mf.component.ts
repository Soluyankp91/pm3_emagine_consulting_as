import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-empty-and-unknown-mf',
	templateUrl: './empty-and-unknown-mf.component.html',
	styleUrls: ['./empty-and-unknown-mf.component.scss'],
})
export class EmptyAndUnknownMfComponent {
	header: string;
	description: string;
	listDescription: string;
	confirmButtonText: string;
	mergeFields: string[];

	constructor(@Inject(MAT_DIALOG_DATA) matDialogData: any) {
		this.header = matDialogData.header;
		this.description = matDialogData.description;
		this.listDescription = matDialogData.listDescription;
		this.confirmButtonText = matDialogData.confirmButtonText;
		this.mergeFields = matDialogData.mergeFields;
	}
}
