import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { LegalEntityDto } from 'src/shared/service-proxies/service-proxies';
import { Tab } from '../../shared/entities/contracts.interfaces';
import { CreationTitleService } from '../../shared/services/creation-title.service';
import { getAllRouteParams } from '../../shared/utils/allRouteParams';

@Component({
	selector: 'app-agreement-editor',
	templateUrl: './template-editor.component.html',
	styleUrls: ['./template-editor.component.scss'],
})
export class AgreementEditorComponent implements OnInit {
	tabs: Tab[];

	templateName$: Observable<string>;
	tenants$: Observable<(LegalEntityDto & { code: string })[] | null>;

	private _unSubscribe$ = new Subject<void>();

	constructor(private readonly _router: Router, private readonly _creationTitleService: CreationTitleService) {}

	ngOnInit(): void {
		this._setTabs();
		this._subscribeOnRouteChanges();
		this.templateName$ = this._creationTitleService.templateName$;
		this.tenants$ = this._creationTitleService.tenants$;
	}

	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
	}

	private _subscribeOnRouteChanges() {
		this._router.events
			.pipe(
				takeUntil(this._unSubscribe$),
				filter((event) => event instanceof NavigationEnd)
			)
			.subscribe(() => {
				this._setTabs();
			});
	}

	private _setTabs() {
		let routeParamsArr = getAllRouteParams(this._router.routerState.snapshot.root);
		if (routeParamsArr[7] && routeParamsArr[7].id) {
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
			return;
		}
		this.tabs = [
			{
				link: 'create',
				label: 'Settings',
				icon: 'cog-icon',
			},
			{
				link: '',
				label: 'Editor',
				disabled: true,
				icon: 'editor-icon',
			},
		];
	}
}
