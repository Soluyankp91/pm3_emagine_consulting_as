import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { distinctUntilChanged, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { AgreementTemplateDetailsDto } from 'src/shared/service-proxies/service-proxies';
import { SortDto, MappedTableCells } from '../entities/contracts.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';

export abstract class BasePreview {
	constructor(protected _contractService: ContractsService) {}
	contentLoading$ = new BehaviorSubject<boolean>(false);

	protected _rowId$ = new BehaviorSubject<number | null>(null);
	protected _newestFirst$ = new BehaviorSubject<boolean>(false);

	protected _clientTemplateLinksSearch$?: BehaviorSubject<string | undefined>;
	protected _clientTemplateLinksSort$?: BehaviorSubject<SortDto>;

	protected _agreementsLinksSearch$?: BehaviorSubject<string | undefined>;
	protected _agreementsLinksSort$?: BehaviorSubject<SortDto>;

	summary$ = this.currentRowId$.pipe(
		distinctUntilChanged(),
		tap(() => {
			this.contentLoading$.next(true);
		}),
		switchMap((rowId) => {
			return this.entityGet(rowId);
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
			return this.entityGet(rowId);
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
					return this.entityMetadataLog(rowId, newestFirst);
				})
			);
		}),
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

	protected get currentRowId$() {
		return this._rowId$.asObservable();
	}

	protected get newestFirst$() {
		return this._newestFirst$.asObservable();
	}

	abstract _mapEntityToSummary(row: AgreementTemplateDetailsDto, maps: MappedTableCells): any;

	abstract entityGet: (rowId: number) => Observable<any>;
	abstract entityMetadataLog: (rowId: number, newestFirst: boolean) => Observable<any>;
	abstract downloadAttachment: (attachmentId: number) => Observable<void>;

	getClientTemplateLinksSort$?() {
		return this._clientTemplateLinksSort$.asObservable();
	}

	getAgreementsLinksSort$?() {
		return this._agreementsLinksSort$.asObservable();
	}
}
