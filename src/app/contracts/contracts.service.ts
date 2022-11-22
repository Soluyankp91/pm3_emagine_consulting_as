import {
    EnumEntityTypeDto,
    LegalEntityDto,
    EmployeeDto,
    EnumServiceProxy,
    LookupServiceProxy,
} from './../../shared/service-proxies/service-proxies';
import { Injectable } from '@angular/core';
import { ReplaySubject, forkJoin } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CountryDto } from 'src/shared/service-proxies/service-proxies';
import { BaseEnumDto } from './shared/entities/contracts.interfaces';

@Injectable({
    providedIn: 'root',
})
export class ContractsService {
    private countries$$ = new ReplaySubject<CountryDto[]>(1);

    private agreementLanguages$$ = new ReplaySubject<BaseEnumDto[]>(1);
    private agreementLanguages$ = this.enumServiceProxy
        .agreementLanguages()
        .pipe(map((languages) => this.transformToBaseTco(languages)));

    private agreementTypes$$ = new ReplaySubject<BaseEnumDto[]>(1);
    private agreementTypes$ = this.enumServiceProxy
        .agreementTypes()
        .pipe(map((types) => this.transformToBaseTco(types)));

    private recipientTypes$$ = new ReplaySubject<EnumEntityTypeDto[]>(1);

    private legalEntities$$ = new ReplaySubject<LegalEntityDto[]>(1);

    private salesTypes$$ = new ReplaySubject<EnumEntityTypeDto[]>(1);

    private deliveryTypes$$ = new ReplaySubject<EnumEntityTypeDto[]>(1);

    private employmentTypes$$ = new ReplaySubject<EnumEntityTypeDto[]>(1);

    private employees$$ = new ReplaySubject<EmployeeDto[]>(1);

    constructor(
        private readonly enumServiceProxy: EnumServiceProxy,
        private readonly lookupServiceProxy: LookupServiceProxy
    ) {
        this.initBaseEnums$().subscribe();
    }

    getCountries$() {
        return this.countries$$;
    }

    getAgreementLanguages$() {
        return this.agreementLanguages$$;
    }

    getAgreementTypes$() {
        return this.agreementTypes$$;
    }

    getDeliveryTypes$() {
        return this.deliveryTypes$$;
    }

    getEmploymentTypes$() {
        return this.employmentTypes$$;
    }

    getLegalEntities$() {
        return this.legalEntities$$;
    }

    getRecipientTypes$() {
        return this.recipientTypes$$;
    }

    getSalesTypes$() {
        return this.salesTypes$$;
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
            tap((result) => {
                this.countries$$.next(result.countries);
                this.agreementLanguages$$.next(result.agreementLanguages);
                this.agreementTypes$$.next(result.agreementTypes);
                this.recipientTypes$$.next(result.recipientTypes);
                this.legalEntities$$.next(result.legalEntities);
                this.salesTypes$$.next(result.salesTypes);
                this.deliveryTypes$$.next(result.deliveryTypes);
                this.employmentTypes$$.next(result.employmentTypes);
                this.employees$$.next(result.employees);
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
}
