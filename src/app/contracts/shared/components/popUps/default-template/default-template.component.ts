import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-default-template',
	templateUrl: './default-template.component.html',
	styleUrls: ['./default-template.component.scss'],
})
export class DefaultTemplateComponent implements OnInit {
	constructor(@Inject(MAT_DIALOG_DATA) matDialogData: any) {
		console.log(matDialogData);
	}

	ngOnInit(): void {}
}
