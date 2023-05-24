import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Tab } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { getAllRouteParams } from '../../utils/allRouteParams';
import { Observable, Subject } from 'rxjs';
import { CreationTitleService } from '../../services/creation-title.service';
import { LegalEntityDto } from 'src/shared/service-proxies/service-proxies';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-master-template-creation',
	styleUrls: ['./settings-tab.component.scss'],
	templateUrl: './settings-tab.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsTabComponent implements OnInit {
	isEdit: boolean;
	tabs: Tab[];
	defaultName: string;

	templateName$: Observable<string>;
	tenants$: Observable<(LegalEntityDto & { code: string })[]>;

	private _unSubscribe$ = new Subject<void>();

	constructor(
		private readonly _router: Router,
		private _route: ActivatedRoute,
		private readonly _creationTitleService: CreationTitleService,
		private readonly _cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.isEdit = this._route.snapshot.data.isEdit;
		this.defaultName = this._route.snapshot.data.defaultName;
		this.templateName$ = this._creationTitleService.templateName$;
		this.tenants$ = this._creationTitleService.tenants$;
		this._setTabs();
		this._subscribeOnReceiveAgreementsFromOtherParty();
	}

	private _setTabs() {
		let routeParamsArr = getAllRouteParams(this._router.routerState.snapshot.root);
		const isAgreement = this._router.url.includes('agreements');
		if (this.isEdit) {
			let templateId = routeParamsArr[7].id;
			this.tabs = [
				{
					link: `${templateId}/settings`,
					label: 'Settings',
					icon: 'cog-icon',
				},
				{
					link: `${templateId}/editor`,
					label: 'Editor',
					icon: 'editor-icon',
				},
			];
			if (isAgreement) {
				this.tabs.push({
					link: `${templateId}/archive`,
					label: 'Archive',
					icon: 'archive-icon',
				});
			}
			return;
		}
		this.tabs = [
			{
				link: '../create',
				label: 'Settings',
				icon: 'cog-icon',
			},
			{
				link: undefined,
				label: 'Editor',
				disabled: true,
				icon: 'editor-icon',
			},
		];
		if (isAgreement) {
			this.tabs.push({
				link: undefined,
				label: 'Archive',
				disabled: true,
				icon: 'archive-icon',
			});
		}
	}

	private _subscribeOnReceiveAgreementsFromOtherParty() {
		this._creationTitleService.alwaysReceiveFromOtherParty$
			.pipe(takeUntil(this._unSubscribe$))
			.subscribe((alwaysReceiveFromOtherParty) => {
				if (alwaysReceiveFromOtherParty) {
					this.tabs[1].disabled = true;
				} else {
					this.tabs[1].disabled = false;
				}
				this._cdr.detectChanges();
			});
	}
}
