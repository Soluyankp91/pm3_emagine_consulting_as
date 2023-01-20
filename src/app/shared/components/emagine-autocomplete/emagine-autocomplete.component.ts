import { Input } from '@angular/core';
import { ContentChild } from '@angular/core';
import { TemplateRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

@Component({
	selector: 'app-emagine-autocomplete',
	templateUrl: './emagine-autocomplete.component.html',
	styleUrls: ['./emagine-autocomplete.component.scss'],
})
export class EmagineAutocompleteComponent implements OnInit {
    @Input() displayWithFn: any;
    @Input() options: any[];
    @Input() control: UntypedFormControl;
    @Input() label: string;
    @Input() idValue: string;
    @ContentChild('optionTemplate') optionTemplate: TemplateRef<any>;
	constructor() {}

	ngOnInit(): void {}
}
