import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { switchMap, tap, map, distinctUntilChanged } from 'rxjs/operators';
import {
	BaseMappedAgreementTemplatesListItemDto,
	MappedTableCells,
	SortDto,
} from 'src/app/contracts/shared/entities/contracts.interfaces';
import { ContractsService } from 'src/app/contracts/shared/services/contracts.service';
import { GetCountryCodeByLanguage } from 'src/shared/helpers/tenantHelper';
import {
	AgreementLanguage,
	AgreementTemplateAttachmentServiceProxy,
	AgreementTemplateChildAgreementDto,
	AgreementTemplateChildTemplateDto,
	AgreementTemplateDetailsDto,
	AgreementTemplateServiceProxy,
	AgreementType,
} from 'src/shared/service-proxies/service-proxies';
import { BasePreview } from 'src/app/contracts/shared/base/base-preview';

@Injectable()
export class PreviewService extends BasePreview {
	entityGet = this._agreementTemplateServiceProxy.agreementTemplateGET.bind(this._agreementTemplateServiceProxy);
	entityMetadataLog = this._agreementTemplateServiceProxy.metadataLog.bind(this._agreementTemplateServiceProxy);
	downloadAttachment = this._agreementTemplateAttachmentServiceProxy.agreementTemplateAttachment.bind(
		this._agreementTemplateAttachmentServiceProxy
	);

	protected _clientTemplateLinksSearch$ = new BehaviorSubject<string | undefined>('');
	protected _clientTemplateLinksSort$ = new BehaviorSubject<SortDto>({
		direction: '',
		active: '',
	});

	protected _agreementsLinksSearch$ = new BehaviorSubject<string | undefined>('');
	protected _agreementsLinksSort$ = new BehaviorSubject<SortDto>({
		direction: '',
		active: '',
	});

	constructor(
		private readonly _agreementTemplateAttachmentServiceProxy: AgreementTemplateAttachmentServiceProxy,
		private readonly _agreementTemplateServiceProxy: AgreementTemplateServiceProxy,
		protected readonly _contractService: ContractsService
	) {
		super(_contractService);
	}

	getClientTemplateLinksSort$() {
		return this._clientTemplateLinksSort$.asObservable();
	}

	getAgreementsLinksSort$() {
		return this._agreementsLinksSort$.asObservable();
	}

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

	mapEntityToSummary(row: AgreementTemplateDetailsDto, maps: MappedTableCells) {
		return <BaseMappedAgreementTemplatesListItemDto>{
			name: row.name,
			clientName: row.clientName,
			definition: row.definition,
			agreementType: maps.agreementType[row.agreementType as AgreementType],
			recipientTypeId: maps.recipientTypeId[row.recipientTypeId as number],
			actualRecipient$: new Observable(),

			legalEntityIds: row.legalEntityIds?.map((i) => maps.legalEntityIds[i]),
			salesTypeIds: row.salesTypeIds?.map((i) => maps.salesTypeIds[i]),
			deliveryTypeIds: row.deliveryTypeIds?.map((i) => maps.deliveryTypeIds[i]),
			contractTypeIds: row.contractTypeIds?.map((i) => maps.contractTypeIds[i]),
			language: AgreementLanguage[row.language as AgreementLanguage],
			countryCode: GetCountryCodeByLanguage(AgreementLanguage[row.language as AgreementLanguage]),
			note: row.note,
			isEnabled: row.isEnabled,

			agreementTemplateId: row.agreementTemplateId,
			createdDateUtc: row.createdDateUtc,
			createdBy: row.createdBy?.name,
			lastUpdateDateUtc: row.lastUpdateDateUtc,
			lastUpdatedBy: row.lastUpdatedBy?.name,
			duplicationSourceAgreementTemplateId: row.duplicationSourceAgreementTemplateId,
			duplicationSourceAgreementTemplateName: row.duplicationSourceAgreementTemplateName,

			parentAgreementTemplateId: row.parentAgreementTemplateId,
			parentAgreementTemplateName: row.parentAgreementTemplateName,
		};
	}
}
