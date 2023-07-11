import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EPONoteStatusIcon, EPONoteStatusTooltip } from './po-note-status.model';

@Component({
	selector: 'po-note-status-icon',
	template: `
		<ng-container *ngIf="statusId; then iconView; else noData"></ng-container>
		<ng-template #iconView>
			<mat-icon
				[matTooltip]="note?.length ? note : ePONoteStatusTooltip[statusId]"
                matTooltipClass="white-tooltip"
				class="h-16px w-16px"
                [svgIcon]="ePONoteStatusIcon[statusId]"
			>
			</mat-icon>
		</ng-template>
		<ng-template #noData>-</ng-template>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoNoteStatusIconComponent {
    @Input() statusId: number;
    @Input() note: string;
    ePONoteStatusIcon = EPONoteStatusIcon;
    ePONoteStatusTooltip = EPONoteStatusTooltip;
	constructor() {}
}
