import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { cloneDeep } from 'lodash';
import { IWidget, MarginCalculatorForm, EWidgetsIds } from './entities/emg-widget.entities';
import {
	CALCULATED_MODEL,
	CONSULTANT_PORTAL_URL_MAP,
	PUBLIC_WEBSITE_URL_MAP,
	WIDGETS,
	fadeIn,
	fadeOut,
} from './entities/emg-widget.constants';
import { EmgWidgetService } from './emg-widget.service';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'emg-widget',
	templateUrl: './emg-widget.component.html',
	styleUrls: ['./emg-widget.styles.scss'],
	encapsulation: ViewEncapsulation.None,
	animations: [fadeIn, fadeOut],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [EmgWidgetService],
})
export class EmgWidgetComponent implements OnInit, OnDestroy {
	@Input() tenantId: number;
	private _unsubscribe$ = new Subject<null>();

	isWidgetOpened$ = new BehaviorSubject<boolean>(false);
	isMarginCalculatorOpened$ = new BehaviorSubject<boolean>(false);

	widgets: IWidget[] = WIDGETS;
	publicWebsiteUrlMap = PUBLIC_WEBSITE_URL_MAP;
	consultantPortalUrlMap = CONSULTANT_PORTAL_URL_MAP;
	calculatedModel = cloneDeep(CALCULATED_MODEL);

	form = new MarginCalculatorForm();

	constructor(private _emgWidgetService: EmgWidgetService) {}

	ngOnInit(): void {
		this._subscriptions$();
	}

	ngOnDestroy(): void {
		this._unsubscribe$.next(null);
		this._unsubscribe$.complete();
	}

	navigate(widget: IWidget): void {
		switch (widget.id) {
			case EWidgetsIds.MarginCalculator:
				this.isWidgetOpened$.next(false);
				this.isMarginCalculatorOpened$.next(true);
				break;
			case EWidgetsIds.Website:
				window.open(this.publicWebsiteUrlMap.get(this.tenantId));
				break;
			case EWidgetsIds.Consultant:
				window.open(this.consultantPortalUrlMap.get(this.tenantId));
				break;
			default:
				window.open(widget.url, '_blank');
				return;
		}
	}

	resetForm(): void {
		this.form.reset({});
	}

	calculate(): void {
		this.calculatedModel = this._emgWidgetService.calculate(
			this.form.value.clientPrice,
			this.form.value.consultantPrice,
			this.form.value.margin
		);
	}

	isButtonEnabled(): boolean {
		const consultantPriceFilled = this.form.value.consultantPrice !== null && this.form.value.consultantPrice !== '';
		const clientPriceFilled = this.form.value.clientPrice !== null && this.form.value.clientPrice !== '';
		const marginFilled = this.form.value.margin !== null && this.form.value.margin !== '';

		return (
			(consultantPriceFilled && clientPriceFilled) ||
			(clientPriceFilled && marginFilled) ||
			(consultantPriceFilled && marginFilled)
		);
	}

	private _subscriptions$(): void {
		this.form.valueChanges.pipe(takeUntil(this._unsubscribe$)).subscribe(() => {
			this.calculatedModel = cloneDeep(CALCULATED_MODEL);
		});
	}
}
