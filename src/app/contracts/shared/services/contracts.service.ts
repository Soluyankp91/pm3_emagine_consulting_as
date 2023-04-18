import { Injectable } from '@angular/core';
import { ReplaySubject, forkJoin, combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MapFlagFromTenantId, GetCountryCodeByLanguage } from 'src/shared/helpers/tenantHelper';
import {
	EmployeeDto,
	EnumEntityTypeDto,
	EnumServiceProxy,
	LegalEntityDto,
	LookupServiceProxy,
} from 'src/shared/service-proxies/service-proxies';
import { BaseEnumDto, KeyType, MappedTableCells, SettingsPageOptions } from '../entities/contracts.interfaces';

@Injectable()
export class ContractsService {
	private tenants$$ = new ReplaySubject<(EnumEntityTypeDto & { code: string })[]>(1);

	private agreementLanguages$$ = new ReplaySubject<BaseEnumDto[]>(1);
	private agreementLanguages$ = this.enumServiceProxy
		.agreementLanguages()
		.pipe(map((languages) => this.transformToBaseTco(languages)));

	private agreementTypes$$ = new ReplaySubject<BaseEnumDto[]>(1);
	private agreementTypes$ = this.enumServiceProxy.agreementTypes().pipe(map((types) => this.transformToBaseTco(types)));

	private recipientTypes$$ = new ReplaySubject<EnumEntityTypeDto[]>(1);

	private legalEntities$$ = new ReplaySubject<LegalEntityDto[]>(1);

	private salesTypes$$ = new ReplaySubject<EnumEntityTypeDto[]>(1);

	private deliveryTypes$$ = new ReplaySubject<EnumEntityTypeDto[]>(1);

	private employmentTypes$$ = new ReplaySubject<EnumEntityTypeDto[]>(1);

	private employees$$ = new ReplaySubject<EmployeeDto[]>(1);

	private mappedEnums$$ = new ReplaySubject<MappedTableCells>(1);

	signersEnum$$: Observable<[BaseEnumDto[], EnumEntityTypeDto[]]>;

	constructor(private readonly enumServiceProxy: EnumServiceProxy, private readonly lookupServiceProxy: LookupServiceProxy) {
		this.initBaseEnums$().subscribe();
		this._setSignersEnum();
	}

	getTenants$() {
		return this.tenants$$.asObservable();
	}

	getAgreementLanguages$() {
		return this.agreementLanguages$$.asObservable();
	}

	getAgreementTypes$() {
		return this.agreementTypes$$.asObservable();
	}

	getDeliveryTypes$() {
		return this.deliveryTypes$$.asObservable();
	}

	getEmploymentTypes$() {
		return this.employmentTypes$$.asObservable();
	}

	getLegalEntities$() {
		return this.legalEntities$$.asObservable();
	}

	getRecipientTypes$() {
		return this.recipientTypes$$.asObservable();
	}

	getSalesTypes$() {
		return this.salesTypes$$.asObservable();
	}

	getEnumMap$() {
		return this.mappedEnums$$.asObservable();
	}

	initBaseEnums$() {
		return forkJoin({
			tenants: this.enumServiceProxy.tenants().pipe(
				map((tenants) => {
					return tenants.map((tenant) => {
						return <EnumEntityTypeDto & { code: string }>{
							...tenant,
							code: MapFlagFromTenantId(tenant.id as number),
						};
					});
				})
			),
			agreementLanguages: this.agreementLanguages$.pipe(
				map((agreementLanguages) => {
					return agreementLanguages.map((agreementLanguage) => {
						return <BaseEnumDto & { code: string }>{
							...agreementLanguage,
							code: GetCountryCodeByLanguage(agreementLanguage.name),
						};
					});
				})
			),
			agreementTypes: this.agreementTypes$,
			recipientTypes: this.enumServiceProxy.recipientTypes(),
			legalEntities: this.enumServiceProxy.legalEntities(),
			salesTypes: this.enumServiceProxy.salesTypes(),
			deliveryTypes: this.enumServiceProxy.deliveryTypes(),
			employmentTypes: this.enumServiceProxy.employmentType(),
			employees: this.lookupServiceProxy.employees(),
		}).pipe(
			tap(
				({
					tenants,
					agreementLanguages,
					agreementTypes,
					recipientTypes,
					legalEntities,
					salesTypes,
					deliveryTypes,
					employmentTypes,
					employees,
				}) => {
					this.tenants$$.next(tenants);
					this.agreementLanguages$$.next(agreementLanguages);
					this.agreementTypes$$.next(agreementTypes);
					this.recipientTypes$$.next(recipientTypes);
					this.legalEntities$$.next(legalEntities);
					this.salesTypes$$.next(salesTypes);
					this.deliveryTypes$$.next(deliveryTypes);
					this.employmentTypes$$.next(employmentTypes);
					this.employees$$.next(employees);
					let mappedEnums: MappedTableCells = {
						language: this._mapItems(agreementLanguages),
						agreementType: this._mapItems(agreementTypes),
						recipientTypeId: this._mapItems(recipientTypes),
						legalEntityIds: this._mapLegalEntities(legalEntities),
						salesTypeIds: this._mapItems(salesTypes),
						deliveryTypeIds: this._mapItems(deliveryTypes),
						contractTypeIds: this._mapItems(employmentTypes),
					};
					this.mappedEnums$$.next(mappedEnums);
				}
			)
		);
	}
	settingsPageOptions$() {
		return combineLatest([
			this.agreementTypes$$,
			this.recipientTypes$$,
			this.legalEntities$$,
			this.salesTypes$$,
			this.deliveryTypes$$,
			this.employmentTypes$$,
			this.agreementLanguages$$,
		]).pipe(
			map((combined) => {
				return <SettingsPageOptions>{
					agreementTypes: combined[0] as BaseEnumDto[],
					recipientTypes: combined[1] as EnumEntityTypeDto[],
					legalEntities: combined[2] as LegalEntityDto[],
					salesTypes: combined[3] as EnumEntityTypeDto[],
					deliveryTypes: combined[4] as EnumEntityTypeDto[],
					contractTypes: combined[5] as EnumEntityTypeDto[],
					languages: combined[6] as BaseEnumDto[],
				};
			})
		);
	}

	private _setSignersEnum() {
		this.signersEnum$$ = combineLatest([
			this.enumServiceProxy.signerTypes().pipe(map((signerTypes) => this.transformToBaseTco(signerTypes))),
			this.enumServiceProxy.signerRoles(),
		]);
	}

	private transformToBaseTco(arrayLikeObject: { [key: string]: string }) {
		return Object.keys(arrayLikeObject).map((id) => {
			return {
				id: parseInt(id),
				name: arrayLikeObject[id],
			} as BaseEnumDto;
		});
	}

	private _mapItems(
		items: { id?: string | number } & { [key: string]: any }[],
		valueProp: string = 'name'
	): Record<KeyType, string> {
		return items.reduce((acc, currentItem) => {
			if (currentItem.id && currentItem[valueProp]) {
				acc[currentItem.id] = currentItem[valueProp];
			}
			return acc;
		}, {} as Record<KeyType, string>);
	}

	private _mapLegalEntities(legalEntities: LegalEntityDto[]): Record<KeyType, string> {
		return legalEntities.reduce((acc, item) => {
			acc[item.id as number] = `${MapFlagFromTenantId(item.id as number)}·${item.name}`;
			return acc;
		}, {} as Record<KeyType, string>);
	}
}
