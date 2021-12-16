import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnumEntityTypeDto, EnumServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { WorkflowSideNavigation } from './primary-workflow/primary-workflow.model';
import { ExtensionSideNavigation } from './workflow-extension/workflow-extension.model';
import { SideMenuTabsDto, TopMenuTabs, WorkflowProgressStatus } from './workflow.model';

@Injectable({
    providedIn: 'root'
})
export class WorkflowDataService {
    deliveryTypes: EnumEntityTypeDto[] = [];
    currencies: EnumEntityTypeDto[] = [];
    saleTypes: EnumEntityTypeDto[] = [];
    invoicingTimes: EnumEntityTypeDto[] = [];
    rateUnitTypes: EnumEntityTypeDto[] = [];
    invoiceFrequencies: EnumEntityTypeDto[] = [];
    signerRoles: EnumEntityTypeDto[] = [];
    margins: EnumEntityTypeDto[] = [];
    clientExtensionDeadlines: EnumEntityTypeDto[] = [];
    clientExtensionDurations: EnumEntityTypeDto[] = [];
    clientSpecialFeeFrequencies: EnumEntityTypeDto[] = [];
    clientSpecialFeeSpecifications: EnumEntityTypeDto[] = [];
    clientSpecialRateOrFeeDirections: EnumEntityTypeDto[] = [];
    clientSpecialRateReportUnits: EnumEntityTypeDto[] = [];
    clientSpecialRateSpecifications: EnumEntityTypeDto[] = [];


    // sideMenuTabs: SideMenuTabsDto[] = SideMenuTabs;
    topMenuTabs: SideMenuTabsDto[] = TopMenuTabs;
    extensionSideNavigation = ExtensionSideNavigation;
    workflowSideNavIgation = WorkflowSideNavigation;

    workflowProgress: WorkflowProgressStatus = new WorkflowProgressStatus();

    workflowSalesSaved = new EventEmitter<boolean>();


    collapseHeader = false;
    clientName = 'Test';
    constructor(
        private _enumService: EnumServiceProxy
    ) { }

    // get sideNavigationTabs() {
    //     return this.sideMenuTabs;
    // }

    // addOrUpdateConsultantTab(index: number, consultantName?: string) {
    //     const tabIndex = this.sideMenuTabs.findIndex(x => {
    //         return x.index === index && x.name === 'Consultant';
    //     });
    //     if (tabIndex > -1) {
    //         this.sideMenuTabs[tabIndex].displayName = consultantName ?? 'Consultant';
    //     } else {
    //         this.sideMenuTabs.push(
    //             {
    //                 name: 'Consultant',
    //                 displayName: consultantName ?? 'Consultant',
    //                 index: index
    //             }
    //         );
    //     }
    // }

    // removeConsultantTab(index: number) {
    //     const tabIndex = this.sideMenuTabs.findIndex(x => {
    //         return x.index === index && x.name === 'Consultant';
    //     });
    //     if (tabIndex > -1) {
    //         this.sideMenuTabs.splice(tabIndex, 1);
    //     }
    // }

    get showInfoInToolbar() {
        return this.collapseHeader;
    }

    getData() {
        this.getCurrencies();
        this.getDeliveryTypes();
        this.getInvoicingTimes();
        this.getSaleTypes();
        this.getUnitTypes();
        this.getInvoiceFrequencies();
        this.getSignerRoles();
        this.getMargins();
        this.getExtensionDeadlines();
        this.getExtensionDurations();
        this.getSpecialFeeFrequencies();
        this.getSpecialFeeSpecifications();
        this.getSpecialRateOrFeeDirections();
        this.getSpecialRateReportUnits();
        this.getSpecialRateSpecifications();
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

    getUnitTypes(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.rateUnitTypes.length) {
                observer.next(this.rateUnitTypes);
                observer.complete();
            } else {
                this._enumService.rateUnitTypes()
                    .subscribe(response => {
                        this.rateUnitTypes = response;
                        observer.next(this.rateUnitTypes);
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

    getInvoiceFrequencies(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.invoiceFrequencies.length) {
                observer.next(this.invoiceFrequencies);
                observer.complete();
            } else {
                this._enumService.invoiceFrequencies()
                    .subscribe(response => {
                        this.invoiceFrequencies = response;
                        observer.next(this.invoiceFrequencies);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getSignerRoles(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.signerRoles.length) {
                observer.next(this.signerRoles);
                observer.complete();
            } else {
                this._enumService.signerRoles()
                    .subscribe(response => {
                        this.signerRoles = response;
                        observer.next(this.signerRoles);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getMargins(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.margins.length) {
                observer.next(this.margins);
                observer.complete();
            } else {
                this._enumService.margins()
                    .subscribe(response => {
                        this.margins = response;
                        observer.next(this.margins);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getExtensionDeadlines(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.clientExtensionDeadlines.length) {
                observer.next(this.clientExtensionDeadlines);
                observer.complete();
            } else {
                this._enumService.clientExtensionDeadline()
                    .subscribe(response => {
                        this.clientExtensionDeadlines = response;
                        observer.next(this.clientExtensionDeadlines);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getExtensionDurations(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.clientExtensionDurations.length) {
                observer.next(this.clientExtensionDurations);
                observer.complete();
            } else {
                this._enumService.clientExtensionDuration()
                    .subscribe(response => {
                        this.clientExtensionDurations = response;
                        observer.next(this.clientExtensionDurations);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getSpecialFeeFrequencies(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.clientSpecialFeeFrequencies.length) {
                observer.next(this.clientSpecialFeeFrequencies);
                observer.complete();
            } else {
                this._enumService.clientSpecialFeeFrequency()
                    .subscribe(response => {
                        this.clientSpecialFeeFrequencies = response;
                        observer.next(this.clientSpecialFeeFrequencies);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getSpecialFeeSpecifications(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.clientSpecialFeeSpecifications.length) {
                observer.next(this.clientSpecialFeeSpecifications);
                observer.complete();
            } else {
                this._enumService.clientSpecialFeeSpecifiedAs()
                    .subscribe(response => {
                        this.clientSpecialFeeSpecifications = response;
                        observer.next(this.clientSpecialFeeSpecifications);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getSpecialRateOrFeeDirections(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.clientSpecialRateOrFeeDirections.length) {
                observer.next(this.clientSpecialRateOrFeeDirections);
                observer.complete();
            } else {
                this._enumService.clientSpecialRateOrFeeDirections()
                    .subscribe(response => {
                        this.clientSpecialRateOrFeeDirections = response;
                        observer.next(this.clientSpecialRateOrFeeDirections);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getSpecialRateReportUnits(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.clientSpecialRateReportUnits.length) {
                observer.next(this.clientSpecialRateReportUnits);
                observer.complete();
            } else {
                this._enumService.clientSpecialRateReportingUnits()
                    .subscribe(response => {
                        this.clientSpecialRateReportUnits = response;
                        observer.next(this.clientSpecialRateReportUnits);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getSpecialRateSpecifications(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.clientSpecialRateSpecifications.length) {
                observer.next(this.clientSpecialRateSpecifications);
                observer.complete();
            } else {
                this._enumService.clientSpecialRateSpecifiedAs()
                    .subscribe(response => {
                        this.clientSpecialRateSpecifications = response;
                        observer.next(this.clientSpecialRateSpecifications);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    updateWorkflowProgressStatus(status: Partial<WorkflowProgressStatus>) {
        for (const update in status) {
            const key = update as keyof WorkflowProgressStatus;
            if (status[key] !== null && status[key] !== undefined) {
                (this.workflowProgress[key] as any) = status[key];
            }
        }

        console.log(this.workflowProgress);

        // this.workflowProgress = {
        //     started: status.started,
        //     isExtensionAdded: status.isExtensionAdded,
        //     currentlyActiveExtensionIndex: status.currentlyActiveExtensionIndex,
        //     isExtensionCompleted: status.isExtensionCompleted,
        //     isExtensionSalesSaved: status.isExtensionSalesSaved,
        //     isExtensionContractsSaved: status.isExtensionContractsSaved,
        //     isWorkflowSalesSaved: status.isWorkflowSalesSaved,
        //     isWorkflowContractsSaved: status.isWorkflowContractsSaved,
        //     isWorkflowAccountsSaved: status.isWorkflowAccountsSaved,
        //     isPrimaryWorkflowCompleted: status.isPrimaryWorkflowCompleted,
        //     isTerminationAdded: status.isTerminationAdded,
        //     currentlyActiveSection: status.currentlyActiveSection,
        //     currentlyActiveStep: status.currentlyActiveStep
        // }
    }

    get getWorkflowProgress() {
        return this.workflowProgress;
    }
}
