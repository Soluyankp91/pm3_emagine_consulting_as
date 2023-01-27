import { Tab } from './shared/entities/contracts.interfaces';
import { ActivatedRoute } from '@angular/router';
import { Component, ViewEncapsulation } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';

const tabs: Tab[] = [
	{
		link: 'agreements',
		label: 'Agreements',
	},
	{
		link: 'client-specific-templates',
		label: 'Client specific templates',
	},
	{
		link: 'master-templates',
		label: 'Master templates',
	},
];
@Component({
	selector: 'app-contract',
	templateUrl: './contract.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
	styleUrls: ['./contract.component.scss'],
})
export class ContractComponent {
	public tabs: Tab[] = tabs;

	constructor(private readonly route: ActivatedRoute) {}
}
