import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { LegalEntityDto } from 'src/shared/service-proxies/service-proxies';
import { Tab } from '../../shared/entities/contracts.interfaces';
import { CreationTitleService } from '../../shared/services/creation-title.service';
import { getAllRouteParams } from '../../shared/utils/allRouteParams';

@Component({
	selector: 'app-agreement-editor',
	templateUrl: './template-editor.component.html',
	styleUrls: ['./template-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgreementEditorComponent implements OnInit {
    isEdit: boolean;
	tabs: Tab[];

	templateName$: Observable<string>;
	tenants$: Observable<(LegalEntityDto & { code: string })[] | null>;

	private _unSubscribe$ = new Subject<void>();

	constructor(
		private readonly _router: Router,
		private _route: ActivatedRoute,
		private readonly _creationTitleService: CreationTitleService
	) {}

	ngOnInit(): void {
		this.isEdit = this._route.snapshot.data.isEdit;
		this._setTabs();
		this.templateName$ = this._creationTitleService.templateName$;
		this.tenants$ = this._creationTitleService.tenants$;
	}

	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
	}

	private _setTabs() {
		let routeParamsArr = getAllRouteParams(this._router.routerState.snapshot.root);
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
