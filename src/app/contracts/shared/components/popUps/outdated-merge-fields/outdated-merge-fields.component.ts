import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface OutDatedMergeFieldError {
	key: string;
	currentValue: string;
	previousValue: string;
}
@Component({
	selector: 'outdated-merge-fields',
	templateUrl: './outdated-merge-fields.component.html',
	styleUrls: ['./outdated-merge-fields.component.scss'],
})
export class OutdatedMergeFieldsComponent {
	errorData: OutDatedMergeFieldError[] = [];

	displayedColumns: string[] = ['mergeField', 'previousValue', 'currentValue'];

	constructor(@Inject(MAT_DIALOG_DATA) matDialogData: OutDatedMergeFieldError[]) {
		this.errorData = matDialogData;
	}

	ngOnInit(): void {}
}
