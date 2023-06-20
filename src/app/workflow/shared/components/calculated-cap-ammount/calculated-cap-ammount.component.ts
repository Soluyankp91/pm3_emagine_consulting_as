import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
	selector: 'calculated-cap-ammount',
	templateUrl: './calculated-cap-ammount.component.html',
	styleUrls: ['./calculated-cap-ammount.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatedCapAmmountComponent {
	@Input() isClient: boolean;
	@Input() isConsultant: boolean;
	@Input() clientRate: number;
	@Input() clientCurrency: string;
	@Input() clientCalculatedAmount: number;
	@Input() consultantRate: number;
	@Input() consultantCurrency: string;
	@Input() consultantCalculatedAmount: number;
}
