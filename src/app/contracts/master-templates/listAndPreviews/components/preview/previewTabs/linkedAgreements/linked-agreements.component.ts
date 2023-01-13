import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SortDto } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { AgreementTemplateChildAgreementDto } from 'src/shared/service-proxies/service-proxies';
import { PreviewService } from '../../../../services/preview.service';

@Component({
	selector: 'app-linked-agreements',
	templateUrl: './linked-agreements.component.html',
	styleUrls: ['./linked-agreements.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class LinkedAgreementsComponent implements OnInit {
	agreementLinks$: Observable<AgreementTemplateChildAgreementDto[]>;
	loading$: Observable<boolean>;
	sort$: Observable<SortDto>;

	searchControl = new FormControl<string>('');

	displayedColumns = ['agreementStatus', 'mode', 'agreementId', 'recipientName', 'agreementName'];
	constructor(private readonly _previewService: PreviewService) {}

	ngOnInit(): void {
		this._setAgreementLinksObservable();
		this._setLoadingObservable();
		this._setSortObservable();
		this._subscribeOnSearchChanges();
	}

	onSortChanges(sort: SortDto) {
		this._previewService.updateAgreementSort(sort);
	}

	private _setAgreementLinksObservable() {
		this.agreementLinks$ = this._previewService.agreementsLinks$;
	}

	private _setLoadingObservable() {
		this.loading$ = this._previewService.contentLoading$;
	}

	private _setSortObservable() {
		this.sort$ = this._previewService.getAgreementsLinksSort$();
	}

	private _subscribeOnSearchChanges() {
		this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe((search) => {
			this._previewService.updateAgreementsSearch(search ? search : undefined);
		});
	}
}
