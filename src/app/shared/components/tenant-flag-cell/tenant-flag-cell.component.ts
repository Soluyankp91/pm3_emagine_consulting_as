import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AppConsts } from 'src/shared/AppConsts';


@Component({
	selector: 'tenant-flag-cell',
	template: `
		<ng-container *ngIf="countryCode; then flagView; else defaultView"></ng-container>
		<ng-template #flagView>
			<span
				[id]="testingId"
				[matTooltip]="tooltip"
                matTooltipClass="white-tooltip"
				class="h-6 w-6 bg-cover border-rounded-50 border-solid border-emagineBg-gray fi
                    fi-{{ countryCode | lowercase }} fis"
			>
			</span>
		</ng-template>
		<ng-template #defaultView> <span class="h-6 w-6 bg-cover fi fi-eu fis border-rounded-50"> </span></ng-template>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantFlagCellComponent implements OnInit, OnChanges {
	@Input() tenantId: number;
	@Input() testingId: string;
	@Input() countryCode: string;

	tooltip: string;

	constructor() {}

	ngOnInit(): void {
		if (this.tenantId) {
			this.countryCode = this.mapCountryCodeByTenant(this.tenantId);
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.hasOwnProperty('tenantId')) {
			this.countryCode = this.mapCountryCodeByTenant(changes.tenantId.currentValue);
			this.tooltip = AppConsts.COUNTRY_CODE_TO_TENANT_NAME_MAP.get(this.countryCode);
		}
	}

	mapCountryCodeByTenant(tenantId: number) {
		const id = tenantId * 1;

		return AppConsts.TENANT_ID_TO_COUNTRY_CODE_MAP.get(id);
	}
}
