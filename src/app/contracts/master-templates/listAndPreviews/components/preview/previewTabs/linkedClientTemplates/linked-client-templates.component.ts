import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { PreviewService } from '../../../../services/preview.service';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { AgreementTemplateChildTemplateDto } from 'src/shared/service-proxies/service-proxies';
import { FormControl } from '@angular/forms';
import { SortDto } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { Router } from '@angular/router';

@Component({
	selector: 'app-linked-client-templates',
	templateUrl: './linked-client-templates.component.html',
	styleUrls: ['./linked-client-templates.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class LinkedClientTemplatesComponent implements OnInit, OnDestroy {
	clientTemplateLinks$: Observable<AgreementTemplateChildTemplateDto[]>;
	loading$: Observable<boolean>;
	sort$: Observable<SortDto>;

	searchControl = new FormControl<string>('');

	displayedColumns = ['isEnabled', 'linkState', 'linkStateAccepted', 'agreementTemplateId', 'clientName', 'name', 'agreementTemplateLink'];

	private _unSubscribe$ = new Subject<void>();

	constructor(private readonly _previewService: PreviewService, private readonly _router: Router) {}

	ngOnInit(): void {
		this._setClientTemplateLinksObservable();
		this._setLoadingObservable();
		this._subscribeOnSearchChanges();
		this._setSort();
	}

	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
	}

	onSortChanges(sort: SortDto) {
		this._previewService.updateClientTemplatesSort(sort);
	}
	navigateToTemplate(agreementTemplateId: number) {
		const url = this._router.serializeUrl(
			this._router.createUrlTree(['/app/contracts/client-specific-templates'], {
				queryParams: { templateId: agreementTemplateId },
			})
		);
		window.open(url, '_blank');
	}

	private _setClientTemplateLinksObservable() {
		this.clientTemplateLinks$ = this._previewService.clientTemplateLinks$;
	}

	private _setLoadingObservable() {
		this.loading$ = this._previewService.contentLoading$;
	}

	private _setSort() {
		this.sort$ = this._previewService.getClientTemplateLinksSort$();
	}

	private _subscribeOnSearchChanges() {
		this.searchControl.valueChanges.pipe(takeUntil(this._unSubscribe$), debounceTime(300)).subscribe((search) => {
			this._previewService.updateClientTemplatesSearch(search ? search : undefined);
		});
	}
}
