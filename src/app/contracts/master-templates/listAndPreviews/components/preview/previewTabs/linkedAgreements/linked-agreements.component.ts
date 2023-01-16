import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { SortDto } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { AgreementTemplateChildAgreementDto } from 'src/shared/service-proxies/service-proxies';
import { PreviewService } from '../../../../services/preview.service';

@Component({
	selector: 'app-linked-agreements',
	templateUrl: './linked-agreements.component.html',
	styleUrls: ['./linked-agreements.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class LinkedAgreementsComponent implements OnInit, OnDestroy {
	agreementLinks$: Observable<AgreementTemplateChildAgreementDto[]>;
	loading$: Observable<boolean>;
	sort$: Observable<SortDto>;

	searchControl = new FormControl<string>('');

	displayedColumns = ['agreementStatus', 'mode', 'agreementId', 'recipientName', 'agreementName'];

	private _unSubscribe$ = new Subject<void>();

	constructor(private readonly _previewService: PreviewService) {}

	ngOnInit(): void {
		this._setAgreementLinksObservable();
		this._setLoadingObservable();
		this._setSortObservable();
		this._subscribeOnSearchChanges();
	}

	ngOnDestroy(): void {
		this._unSubscribe$.next();
		this._unSubscribe$.complete();
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
		this.searchControl.valueChanges.pipe(takeUntil(this._unSubscribe$), debounceTime(300)).subscribe((search) => {
			this._previewService.updateAgreementsSearch(search ? search : undefined);
		});
	}
}
