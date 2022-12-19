import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LegalEntityDto } from 'src/shared/service-proxies/service-proxies';

@Injectable()
export class CreationTitleService {
    private _tenants$$ = new Subject<LegalEntityDto[]>();
    private _templateName$$ = new Subject();

    private _tenants$: Observable<(LegalEntityDto & { code: string })[] | null>;

    get templateName$() {
        return this._templateName$$.asObservable() as Observable<string>;
    }

    get tenants$() {
        return this._tenants$;
    }

    constructor() {
        this._tenants$ = this._tenants$$.pipe(
            map((tenants) => {
                let result = tenants.map((tenant) => ({
                    ...tenant,
                    code: this._getTenantCountryCode(
                        tenant.tenantName as string
                    ),
                })) as (LegalEntityDto & { code: string })[];
                if (result.length) {
                    return result;
                }
                return null;
            })
        );
    }

    updateTemplateName(name: string) {
        this._templateName$$.next(name);
    }

    updateTenants(tenants: any[]) {
        this._tenants$$.next(tenants);
    }

    private _getTenantCountryCode(name: string) {
        switch (name) {
            case 'Denmark':
                return 'DK';
            case 'Sweden':
                return 'SE';
            case 'Poland':
                return 'PL';
            case 'Netherlands':
                return 'NL';
            case 'Germany':
                return 'DE';
            case 'Norway':
                return 'NO';
            case 'France':
                return 'FR';
            case 'India':
                return 'IN';
            case 'International':
                return 'EU';
            case 'United Kingdom':
                return 'GB';
            default:
                break;
        }
    }
}
