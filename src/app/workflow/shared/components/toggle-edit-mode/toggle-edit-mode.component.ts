import { ChangeDetectionStrategy } from '@angular/compiler';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { Input } from '@angular/core';
import { Component } from '@angular/core';

@Component({
	selector: 'toggle-edit-mode',
	templateUrl: './toggle-edit-mode.component.html',
	styleUrls: ['./toggle-edit-mode.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToggleEditModeComponent {
    @Input() canToggleEditMode: boolean;
    @Output() editModeToggled = new EventEmitter<any>();
	constructor() {}
    toggleEditMode() {
        this.editModeToggled.emit();
	}
}
