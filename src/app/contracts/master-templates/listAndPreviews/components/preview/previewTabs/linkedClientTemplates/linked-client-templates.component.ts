import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PreviewService } from '../../../../services/preview.service';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AgreementTemplateChildTemplateDto } from 'src/shared/service-proxies/service-proxies';
import { FormControl } from '@angular/forms';
import { SortDto } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { tapOnce } from 'src/app/contracts/shared/operators/tapOnceOperator';

@Component({
	selector: 'app-linked-client-templates',
	templateUrl: './linked-client-templates.component.html',
	styleUrls: ['./linked-client-templates.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class LinkedClientTemplatesComponent implements OnInit {
	clientTemplateLinks$: Observable<AgreementTemplateChildTemplateDto[]>;
	loading$: Observable<boolean>;
	sort$: Observable<SortDto>;
	isItemsExist: boolean;

	searchControl = new FormControl<string>('');

	displayedColumns = ['isEnabled', 'linkState', 'agreementTemplateId', 'clientName', 'name'];
	constructor(private readonly _previewService: PreviewService) {}

	ngOnInit(): void {
		this._setClientTemplateLinksObservable();
		this._setLoadingObservable();
		this._subscribeOnSearchChanges();
		this._setSort();
	}

	onSortChanges(sort: SortDto) {
		this._previewService.updateClientTemplatesSort(sort);
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
		this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe((search) => {
			this._previewService.updateClientTemplatesSearch(search ? search : undefined);
		});
	}
}
