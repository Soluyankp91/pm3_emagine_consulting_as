import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EditorPopupConfigs } from './editor-popup-types';

const DEFAULT_CONFIGS: EditorPopupConfigs = {
	title: '',
	subtitle: '',
	confirmButtonLabel: 'Confirm',
	rejectButtonLabel: 'Cancel',
};

@Component({
	selector: 'app-editor-popup-wrapper',
	standalone: true,
	imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
	templateUrl: './editor-popup-wrapper.component.html',
	styleUrls: ['./editor-popup-wrapper.component.scss'],
})
export class EditorPopupWrapperComponent implements OnInit {
	private _configs: EditorPopupConfigs;
	@Output() onConfirmed: EventEmitter<any> = new EventEmitter<any>();
	@Output() onRejected: EventEmitter<any> = new EventEmitter<any>();

	@Input() confirmButtonDisabled: boolean = false;

	@Input()
	set configs(value: EditorPopupConfigs) {
		this._configs = value && typeof value === 'object' ? { ...DEFAULT_CONFIGS, ...value } : DEFAULT_CONFIGS;
	}
	get configs(): EditorPopupConfigs {
		return this._configs;
	}

	constructor() {}

	ngOnInit(): void {}

	reject() {
		this.onRejected.emit();
	}

	confirm() {
		this.onConfirmed.emit();
	}
}
