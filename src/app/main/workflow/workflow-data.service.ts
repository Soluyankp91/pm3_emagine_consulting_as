import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { EnumEntityTypeDto, EnumServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { SideMenuTabs, SideMenuTabsDto } from './workflow.model';

@Injectable({
    providedIn: 'root'
})
export class WorkflowDataService {
    deliveryTypes: EnumEntityTypeDto[] = [];
    currencies: EnumEntityTypeDto[] = [];
    saleTypes: EnumEntityTypeDto[] = [];
    invoicingTimes: EnumEntityTypeDto[] = [];

    sideMenuTabs: SideMenuTabsDto[] = SideMenuTabs;
    constructor(
        private _enumService: EnumServiceProxy
    ) { }

    get sideNavigationTabs() {
        return this.sideMenuTabs;
    }

    addOrUpdateConsultantTab(index: number, consultantName?: string) {
        const tabIndex = this.sideMenuTabs.findIndex(x => {
            return x.index === index && x.name === 'Consultant';
        });
        if (tabIndex > -1) {
            this.sideMenuTabs[tabIndex].displayName = consultantName ?? 'Consultant';
        } else {
            this.sideMenuTabs.push(
                {
                    name: 'Consultant',
                    displayName: consultantName ?? 'Consultant',
                    index: index
                }
            );
        }
    }

    removeConsultantTab(index: number) {
        const tabIndex = this.sideMenuTabs.findIndex(x => {
            return x.index === index && x.name === 'Consultant';
        });
        if (tabIndex > -1) {
            this.sideMenuTabs.splice(tabIndex, 1);
        }
    }

    getData() {
        this.getCurrencies();
        this.getDeliveryTypes();
        this.getInvoicingTimes();
        this.getSaleTypes();
    }

    getCurrencies(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.currencies.length) {
                observer.next(this.currencies);
                observer.complete();
            } else {
                this._enumService.currencies()
                    .subscribe(response => {
                        this.currencies = response;
                        observer.next(this.currencies);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getDeliveryTypes(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.deliveryTypes.length) {
                observer.next(this.deliveryTypes);
                observer.complete();
            } else {
                this._enumService.deliveryTypes()
                    .subscribe(response => {
                        this.deliveryTypes = response;
                        observer.next(this.deliveryTypes);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getSaleTypes(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.saleTypes.length) {
                observer.next(this.saleTypes);
                observer.complete();
            } else {
                this._enumService.salesTypes()
                    .subscribe(response => {
                        this.saleTypes = response;
                        observer.next(this.saleTypes);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getInvoicingTimes(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.invoicingTimes.length) {
                observer.next(this.invoicingTimes);
                observer.complete();
            } else {
                this._enumService.invoicingTimes()
                    .subscribe(response => {
                        this.invoicingTimes = response;
                        observer.next(this.invoicingTimes);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }
}
