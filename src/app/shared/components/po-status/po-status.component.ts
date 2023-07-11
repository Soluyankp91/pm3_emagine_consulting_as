import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EPOStatusIcon, EPOStatusTooltip } from './po-status.model';

@Component({
	selector: 'po-status-icon',
	template: `
		<ng-container *ngIf="statusId; then iconView; else noData"></ng-container>
		<ng-template #iconView>
			<mat-icon
				[matTooltip]="ePOStatusTooltip[statusId]"
                [matTooltipDisabled]="disableTooltip"
                matTooltipClass="white-tooltip"
				class="h-16px w-16px u-mg--0"
                [svgIcon]="ePOStatusIcon[statusId]"
			>
			</mat-icon>
		</ng-template>
		<ng-template #noData>-</ng-template>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoStatusIconComponent {
    @Input() statusId: number;
    @Input() disableTooltip: boolean = false;
    ePOStatusIcon = EPOStatusIcon;
    ePOStatusTooltip = EPOStatusTooltip;
	constructor() {}
}
