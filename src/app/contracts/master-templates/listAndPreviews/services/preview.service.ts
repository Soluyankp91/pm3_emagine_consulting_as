import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, of, ReplaySubject } from 'rxjs';
import { switchMap, tap, map, withLatestFrom, distinctUntilChanged } from 'rxjs/operators';
import {
	BaseMappedAgreementTemplatesListItemDto,
	MappedTableCells,
	SortDto,
} from 'src/app/contracts/shared/entities/contracts.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { GetCountryCodeByLanguage } from 'src/shared/helpers/tenantHelper';
import {
	AgreementLanguage,
	AgreementTemplateChildAgreementDto,
	AgreementTemplateChildTemplateDto,
	AgreementTemplateDetailsDto,
	AgreementTemplateServiceProxy,
	AgreementType,
} from 'src/shared/service-proxies/service-proxies';
import * as moment from 'moment';

@Injectable()
export class PreviewService {
	contentLoading$ = new BehaviorSubject<boolean>(false);

	private _rowId$ = new BehaviorSubject<number | null>(null);
	private _newestFirst$ = new BehaviorSubject<boolean>(false);
	private _clientTemplateLinksSearch$ = new BehaviorSubject<string | undefined>('');
	private _clientTemplateLinksSort$ = new BehaviorSubject<SortDto>({
		direction: '',
		active: '',
	});

	private _agreementsLinksSearch$ = new BehaviorSubject<string | undefined>('');
	private _agreementsLinksSort$ = new BehaviorSubject<SortDto>({
		direction: '',
		active: '',
	});

	get currentRowId$() {
		return this._rowId$.asObservable();
	}

	get newestFirst$() {
		return this._newestFirst$.asObservable();
	}

	getClientTemplateLinksSort$() {
		return this._clientTemplateLinksSort$.asObservable();
	}

	getAgreementsLinksSort$() {
		return this._agreementsLinksSort$.asObservable();
	}

	summary$ = this.currentRowId$.pipe(
		distinctUntilChanged(),
		tap(() => {
			this.contentLoading$.next(true);
		}),
		switchMap((rowId) => {
			return this._agreementTemplateServiceProxy.agreementTemplateGET(rowId as number);
		}),
		withLatestFrom(this._contractService.getEnumMap$()),
		map(([row, maps]) => {
			return this._mapEntityToSummary(row, maps);
		}),
		tap(() => {
			this.contentLoading$.next(false);
		})
	);

	attachments$ = this.currentRowId$.pipe(
		distinctUntilChanged(),
		tap(() => {
			this.contentLoading$.next(true);
		}),
		switchMap((rowId) => {
			return this._agreementTemplateServiceProxy.agreementTemplateGET(rowId as number);
		}),
		map((template) => {
			return template.attachments;
		}),
		tap(() => {
			this.contentLoading$.next(false);
		})
	);

	logs$ = this.currentRowId$.pipe(
		tap(() => {
			this.contentLoading$.next(true);
		}),
		distinctUntilChanged(),
		switchMap((rowId) => {
			return combineLatest([of(rowId), this._newestFirst$]).pipe(
				switchMap(([rowId, newestFirst]) => {
					return this._agreementTemplateServiceProxy.metadataLog(rowId as number, newestFirst);
				})
			);
		}),
		tap(() => {
			this.contentLoading$.next(false);
		})
	);

	clientTemplateLinks$ = this.currentRowId$.pipe(
		distinctUntilChanged(),
		switchMap((rowId) => {
			return combineLatest([
				of(rowId),
				this._clientTemplateLinksSearch$.pipe(
					distinctUntilChanged(),
					tap(() => {
						this.contentLoading$.next(true);
					})
				),
				this._clientTemplateLinksSort$,
			]).pipe(
				switchMap(([rowId, search, sort]) => {
					return this._agreementTemplateServiceProxy.childTemplates(
						rowId as number,
						search,
						undefined,
						undefined,
						sort.direction.length ? sort.active + ' ' + sort.direction : ''
					);
				}),
				map((childTemplatesList) => childTemplatesList.items as AgreementTemplateChildTemplateDto[]),
				tap(() => {
					this.contentLoading$.next(false);
				})
			);
		})
	);

	agreementsLinks$ = combineLatest([
		this.currentRowId$.pipe(
			distinctUntilChanged(),
			tap(() => {
				this.contentLoading$.next(true);
			})
		),
		this._agreementsLinksSearch$.pipe(
			distinctUntilChanged(),
			tap(() => {
				this.contentLoading$.next(true);
			})
		),
		this._agreementsLinksSort$,
	]).pipe(
		switchMap(([rowId, search, sort]) => {
			return this._agreementTemplateServiceProxy.childAgreements(
				rowId as number,
				search,
				undefined,
				undefined,
				sort.direction.length ? sort.active + ' ' + sort.direction : ''
			);
		}),
		map((childAgreementsList) => childAgreementsList.items as AgreementTemplateChildAgreementDto[]),
		tap(() => {
			this.contentLoading$.next(false);
		})
	);

	updateCurrentRowId(id: number | null) {
		this._rowId$.next(id);
	}

	updateNewestFirst(newest: boolean) {
		this._newestFirst$.next(newest);
	}

	updateClientTemplatesSearch(search: string | undefined) {
		this._clientTemplateLinksSearch$.next(search);
	}

	updateAgreementsSearch(search: string | undefined) {
		this._agreementsLinksSearch$.next(search);
	}

	updateClientTemplatesSort(sort: SortDto) {
		this._clientTemplateLinksSort$.next(sort);
	}

	updateAgreementSort(sort: SortDto) {
		this._agreementsLinksSort$.next(sort);
	}

	private _mapEntityToSummary(row: AgreementTemplateDetailsDto, maps: MappedTableCells) {
		return <BaseMappedAgreementTemplatesListItemDto>{
			name: row.name,
			definition: row.definition,
			agreementType: maps.agreementType[row.agreementType as AgreementType],
			recipientTypeId: maps.recipientTypeId[row.recipientTypeId as number],

			legalEntityIds: row.legalEntityIds?.map((i) => maps.legalEntityIds[i]),
			salesTypeIds: row.salesTypeIds?.map((i) => maps.salesTypeIds[i]),
			deliveryTypeIds: row.deliveryTypeIds?.map((i) => maps.deliveryTypeIds[i]),
			contractTypeIds: row.contractTypeIds?.map((i) => maps.contractTypeIds[i]),
			language: AgreementLanguage[row.language as AgreementLanguage],
			countryCode: GetCountryCodeByLanguage(AgreementLanguage[row.language as AgreementLanguage]),
			note: row.note,
			isEnabled: row.isEnabled,

			agreementTemplateId: row.agreementTemplateId,
			createdDateUtc: moment(row.createdDateUtc).format('DD.MM.YYYY'),
			createdBy: row.createdBy?.name,
			lastUpdateDateUtc: moment(row.lastUpdateDateUtc).format('DD.MM.YYYY'),
			lastUpdatedBy: row.lastUpdatedBy?.name,
			duplicationSourceAgreementTemplateId: row.duplicationSourceAgreementTemplateId,
			duplicationSourceAgreementTemplateName: row.duplicationSourceAgreementTemplateName,
		};
	}

	constructor(
		private readonly _agreementTemplateServiceProxy: AgreementTemplateServiceProxy,
		private readonly _contractService: ContractsService
	) {}
}
