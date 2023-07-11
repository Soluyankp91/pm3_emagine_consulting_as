import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EPOChasingStatusColor } from './po-chasing-status.model';

@Component({
	selector: 'po-chasing-status',
	template: `
		<ng-container *ngIf="statusId; then iconView; else noData"></ng-container>
		<ng-template #iconView>
            <svg
                width="8"
                height="8"
                viewBox="0 0 8 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <rect width="8" height="8" rx="4" [attr.fill]="ePOChasingStatusColor[statusId]" />
            </svg>
		</ng-template>
		<ng-template #noData>-</ng-template>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoChasingStatusIconComponent {
    @Input() statusId: number;
    ePOChasingStatusColor = EPOChasingStatusColor;
	constructor() {}
}
