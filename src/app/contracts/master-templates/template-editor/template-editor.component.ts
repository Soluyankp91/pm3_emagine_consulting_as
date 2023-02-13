import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Tab } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { getAllRouteParams } from '../../shared/utils/allRouteParams';
import { Subject, Observable } from 'rxjs';
import { CreationTitleService } from '../../shared/services/creation-title.service';
import { LegalEntityDto } from 'src/shared/service-proxies/service-proxies';

@Component({
	selector: 'app-master-template-creation',
	styleUrls: ['./template-editor.component.scss'],
	templateUrl: './template-editor.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MasterTemplateCreationComponent implements OnInit {
	isEdit: boolean;
	tabs: Tab[];
	defaultName: string;

	templateName$: Observable<string>;
	tenants$: Observable<(LegalEntityDto & { code: string })[] | null>;

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
				link: '',
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
