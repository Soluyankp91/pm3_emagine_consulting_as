import { Injectable } from '@angular/core';
import { ReplaySubject, forkJoin, combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
	CountryDto,
	EmployeeDto,
	EnumEntityTypeDto,
	EnumServiceProxy,
	LegalEntityDto,
	LookupServiceProxy,
} from 'src/shared/service-proxies/service-proxies';
import { KeyType } from '../../master-templates/template-editor/settings/settings.component';
import { BaseEnumDto } from '../entities/contracts.interfaces';
import { GetCountryCodeByTenantName } from '../utils/GetCountryCodeByTenantName';

@Injectable()
export class ContractsService {
	private countries$$ = new ReplaySubject<CountryDto[]>(1);

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

	private mappedValues$$ = new ReplaySubject<{ [key: string]: any }>(1);

	constructor(private readonly enumServiceProxy: EnumServiceProxy, private readonly lookupServiceProxy: LookupServiceProxy) {
		this.initBaseEnums$().subscribe();
	}

	getCountries$() {
		return this.countries$$.asObservable();
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

	getMappedValues$() {
		return this.mappedValues$$.asObservable();
	}

	initBaseEnums$() {
		return forkJoin({
			countries: this.enumServiceProxy.countries(),
			agreementLanguages: this.agreementLanguages$,
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
					countries,
					agreementLanguages,
					agreementTypes,
					recipientTypes,
					legalEntities,
					salesTypes,
					deliveryTypes,
					employmentTypes,
					employees,
				}) => {
					this.countries$$.next(countries);
					this.agreementLanguages$$.next(agreementLanguages);
					this.agreementTypes$$.next(agreementTypes);
					this.recipientTypes$$.next(recipientTypes);
					this.legalEntities$$.next(legalEntities);
					this.salesTypes$$.next(salesTypes);
					this.deliveryTypes$$.next(deliveryTypes);
					this.employmentTypes$$.next(employmentTypes);
					this.employees$$.next(employees);

					let mappedValues = {
						language: this._mapItems(agreementLanguages),
						agreementType: this._mapItems(agreementTypes),
						recipientTypeId: this._mapItems(recipientTypes),
						legalEntityIds: this._mapLegalEntities(legalEntities),
						salesTypeIds: this._mapItems(salesTypes),
						deliveryTypeIds: this._mapItems(deliveryTypes),
						contractTypeIds: this._mapItems(employmentTypes),
					};
					this.mappedValues$$.next(mappedValues);
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
				return {
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

	private _mapLegalEntities(legalEntities: LegalEntityDto[]) {
		return legalEntities.map((item) => `${GetCountryCodeByTenantName(item.tenantName as string)}·${item.name}`);
	}
}
