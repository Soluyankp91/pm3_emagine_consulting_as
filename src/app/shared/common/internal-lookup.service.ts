import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CountryDto, EnumEntityTypeDto, EnumServiceProxy, LegalEntityDto, LookupServiceProxy, TeamsAndDivisionsNodeDto, WorkflowStatusDto } from 'src/shared/service-proxies/service-proxies';

@Injectable()
export class InternalLookupService {
    deliveryTypes: EnumEntityTypeDto[] = [];
    currencies: EnumEntityTypeDto[] = [];
    saleTypes: EnumEntityTypeDto[] = [];
    projectTypes: EnumEntityTypeDto[] = [];
    invoicingTimes: EnumEntityTypeDto[] = [];
    rateUnitTypes: EnumEntityTypeDto[] = [];
    invoiceFrequencies: EnumEntityTypeDto[] = [];
    signerRoles: EnumEntityTypeDto[] = [];
    margins: EnumEntityTypeDto[] = [];
    clientExtensionDeadlines: EnumEntityTypeDto[] = [];
    clientExtensionDurations: EnumEntityTypeDto[] = [];
    clientSpecialFeeFrequencies: EnumEntityTypeDto[] = [];
    clientSpecialFeeSpecifications: EnumEntityTypeDto[] = [];
    clientSpecialRateReportUnits: EnumEntityTypeDto[] = [];
    clientSpecialRateSpecifications: EnumEntityTypeDto[] = [];
    clientTimeReportingCap: EnumEntityTypeDto[] = [];
    emagineOffices: EnumEntityTypeDto[] = [];
    commissionFrequencies: EnumEntityTypeDto[] = [];
    commissionTypes: EnumEntityTypeDto[] = [];
    commissionRecipientTypeList: EnumEntityTypeDto[] = [];
    tenants: EnumEntityTypeDto[] = [];
    projectCategories: EnumEntityTypeDto[] = [];
    discounts: EnumEntityTypeDto[] = [];
    workflowClientPeriodTypes: EnumEntityTypeDto[] = [];
    workflowConsultantPeriodTypes: EnumEntityTypeDto[] = [];
    expectedWorkloadUnits: EnumEntityTypeDto[] = [];
    workflowPeriodStepTypes: { [key: string]: string };
    nonStandartTerminationTimes: { [key: string]: string };
    terminationReasons: { [key: string]: string; };
    employmentTypes: EnumEntityTypeDto[] = [];
    countries: CountryDto[] = [];
    consultantTimeReportingCapList: EnumEntityTypeDto[] = [];
    workflowStatuses: WorkflowStatusDto[] = [];
    consultantInsuranceOptions: { [key: string]: string };
    contractExpirationNotificationDuration: { [key: string]: string };
    legalContractStatuses: { [key: string]: string };
    hubspotClientUrl: string;
    legalEntities: LegalEntityDto[] = [];
    syncStateStatuses: { [key: string]: string };
    valueUnitTypes: EnumEntityTypeDto[] = [];
    periodUnitTypes: EnumEntityTypeDto[] = [];
    purchaseOrderCapTypes: { [key: string]: string };
    envelopeProcessingPaths: { [key: string]: string };
    consultantShownOnClientInvoiceAs: { [key: string]: string };
    teamsAndDivisionsLevels: { [key: string]: string };
    teamsAndDivisionsNodes: TeamsAndDivisionsNodeDto[];
    staticEnums: { [key: string]: any };
    constructor(private _enumService: EnumServiceProxy, private _lookupService: LookupServiceProxy) {
    }


    getData(): Observable<any> {
        const enumsApi = {
            currencies: this.getCurrencies(),
            deliveryTypes: this.getDeliveryTypes(),
            invoicingTimes: this.getInvoicingTimes(),
            saleTypes: this.getSaleTypes(),
            projectTypes: this.getProjectTypes(),
            rateUnitTypes: this.getRateUnitTypes(),
            invoiceFrequencies: this.getInvoiceFrequencies(),
            signerRoles: this.getSignerRoles(),
            margins: this.getMargins(),
            extensionDeadlines: this.getExtensionDeadlines(),
            extensionDurations: this.getExtensionDurations(),
            specialFeeFrequencies: this.getSpecialFeeFrequencies(),
            specialFeeSpecifications: this.getSpecialFeeSpecifications(),
            specialRateReportUnits: this.getSpecialRateReportUnits(),
            specialRateSpecifications: this.getSpecialRateSpecifications(),
            workflowClientPeriodTypes: this.getWorkflowClientPeriodTypes(),
            workflowConsultantPeriodTypes: this.getWorkflowConsultantPeriodTypes(),
            workflowPeriodStepTypes: this.getWorkflowPeriodStepTypes(),
            legalEntities: this.getLegalEntities(),
            syncStateStatuses: this.getSyncStateStatuses(),
            contractExpirationNotificationInterval: this.getContractExpirationNotificationInterval(),
            legalContractStatuses: this.getLegalContractStatuses(),
            clientTimeReportingCap: this.getClientTimeReportingCap(),
            emagineOffices: this.getEmagineOfficeList(),
            commissionFrequencies: this.getCommissionFrequency(),
            commissionTypes: this.getCommissionTypes(),
            commissionRecipientTypes: this.getCommissionRecipientTypes(),
            tenants: this.getTenants(),
            projectCategories: this.getProjectCategory(),
            discounts: this.getDiscounts(),
            terminationTimes: this.getTerminationTimes(),
            terminationReasons: this.getTerminationReasons(),
            employmentTypes: this.getEmploymentTypes(),
            expectedWorkloadUnits: this.getExpectedWorkloadUnit(),
            countries: this.getCountries(),
            consultantTimeReportingCap: this.getConsultantTimeReportingCap(),
            workflowStatuses: this.getWorkflowStatuses(),
            consultantInsuranceOptions: this.getConsultantInsuranceOptions(),
            valueUnitTypes: this.getValueUnitTypes(),
            periodUnitTypes: this.getPeriodUnitTypes(),
            purchaseOrderCapTypes: this.getPurchaseOrderCapTypes(),
            consultantShownOnClientInvoiceAs: this.getConsultantShownOnClientInvoiceAs(),
            teamsAndDivisionsLevels: this.getTeamsAndDivisionsLevels(),
            teamsAndDivisionsNodes: this.getTeamsAndDivisionsNodes()
        };
        return forkJoin(enumsApi).pipe(
            switchMap((result: any) => {
                this.staticEnums = result;
                localStorage.setItem('staticEnums', JSON.stringify(this.staticEnums));
                return of(result);
            })
        );
    }

    getEnumValue(value: string) {
        if (!this.staticEnums) {
            this.staticEnums = JSON.parse(localStorage.getItem('staticEnums'));
        }
        return this.staticEnums[value];
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

    getRateUnitTypes(): Observable<EnumEntityTypeDto[]> {
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

    getProjectTypes(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.projectTypes.length) {
                observer.next(this.projectTypes);
                observer.complete();
            } else {
                this._enumService.projectTypeAll()
                    .subscribe(response => {
                        this.projectTypes = response;
                        observer.next(this.projectTypes);
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

    getWorkflowClientPeriodTypes(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.workflowClientPeriodTypes.length) {
                observer.next(this.workflowClientPeriodTypes);
                observer.complete();
            } else {
                this._enumService.clientPeriodType()
                    .subscribe(response => {
                        this.workflowClientPeriodTypes = response;
                        observer.next(this.workflowClientPeriodTypes);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getWorkflowConsultantPeriodTypes(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.workflowConsultantPeriodTypes.length) {
                observer.next(this.workflowConsultantPeriodTypes);
                observer.complete();
            } else {
                this._enumService.consultantPeriodType()
                    .subscribe(response => {
                        this.workflowConsultantPeriodTypes = response;
                        observer.next(this.workflowConsultantPeriodTypes);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getWorkflowPeriodStepTypes(): Observable<{ [key: string]: string; }> {
        return new Observable<{ [key: string]: string; }>((observer) => {
            if (this.workflowPeriodStepTypes !== undefined && this.workflowPeriodStepTypes !== null) {
                observer.next(this.workflowPeriodStepTypes);
                observer.complete();
            } else {
                this._enumService.stepTypes()
                    .subscribe(response => {
                        this.workflowPeriodStepTypes = response;
                        observer.next(this.workflowPeriodStepTypes);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getContractExpirationNotificationInterval(): Observable<{ [key: string]: string; }> {
        return new Observable<{ [key: string]: string; }>((observer) => {
            if (this.contractExpirationNotificationDuration !== undefined && this.contractExpirationNotificationDuration !== null) {
                observer.next(this.contractExpirationNotificationDuration);
                observer.complete();
            } else {
                this._enumService.contractExpirationNotificationInterval()
                    .subscribe(response => {
                        this.contractExpirationNotificationDuration = response;
                        observer.next(this.contractExpirationNotificationDuration);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getLegalContractStatuses(): Observable<{ [key: string]: string; }> {
        return new Observable<{ [key: string]: string; }>((observer) => {
            if (this.legalContractStatuses !== undefined && this.legalContractStatuses !== null) {
                observer.next(this.legalContractStatuses);
                observer.complete();
            } else {
                this._enumService.legalContractStatuses()
                    .subscribe(response => {
                        this.legalContractStatuses = response;
                        observer.next(this.legalContractStatuses);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }


    getClientTimeReportingCap(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.clientTimeReportingCap.length) {
                observer.next(this.clientTimeReportingCap);
                observer.complete();
            } else {
                this._enumService.clientTimeReportingCap()
                    .subscribe(response => {
                        this.clientTimeReportingCap = response;
                        observer.next(this.clientTimeReportingCap);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getEmagineOfficeList(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.emagineOffices.length) {
                observer.next(this.emagineOffices);
                observer.complete();
            } else {
                this._enumService.emagineOffice()
                    .subscribe(response => {
                        this.emagineOffices = response;
                        observer.next(this.emagineOffices);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getCommissionFrequency(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.emagineOffices.length) {
                observer.next(this.commissionFrequencies);
                observer.complete();
            } else {
                this._enumService.commissionFrequency()
                    .subscribe(response => {
                        this.commissionFrequencies = response;
                        observer.next(this.commissionFrequencies);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getCommissionTypes(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.commissionTypes.length) {
                observer.next(this.commissionTypes);
                observer.complete();
            } else {
                this._enumService.commissionTypes()
                    .subscribe(response => {
                        this.commissionTypes = response;
                        observer.next(this.commissionTypes);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getCommissionRecipientTypes(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.commissionRecipientTypeList.length) {
                observer.next(this.commissionRecipientTypeList);
                observer.complete();
            } else {
                this._enumService.recipientTypes()
                    .subscribe(response => {
                        this.commissionRecipientTypeList = response;
                        observer.next(this.commissionRecipientTypeList);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getTenants(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.tenants.length) {
                observer.next(this.tenants);
                observer.complete();
            } else {
                this._enumService.tenants()
                    .subscribe(response => {
                        this.tenants = response;
                        observer.next(this.tenants);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getProjectCategory(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.projectCategories.length) {
                observer.next(this.projectCategories);
                observer.complete();
            } else {
                this._enumService.projectCategory()
                    .subscribe(response => {
                        this.projectCategories = response;
                        observer.next(this.projectCategories);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getDiscounts(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.discounts.length) {
                observer.next(this.discounts);
                observer.complete();
            } else {
                this._enumService.discount()
                    .subscribe(response => {
                        this.discounts = response;
                        observer.next(this.discounts);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getTerminationTimes(): Observable<{ [key: string]: string; }> {
        return new Observable<{ [key: string]: string; }>((observer) => {
            if (this.nonStandartTerminationTimes !== undefined && this.nonStandartTerminationTimes !== null) {
                observer.next(this.nonStandartTerminationTimes);
                observer.complete();
            } else {
                this._enumService.terminationTimes()
                    .subscribe(response => {
                        this.nonStandartTerminationTimes = response;
                        observer.next(this.nonStandartTerminationTimes);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getTerminationReasons(): Observable<{ [key: string]: string; }> {
        return new Observable<{ [key: string]: string; }>((observer) => {
            if (this.terminationReasons !== undefined && this.terminationReasons !== null) {
                observer.next(this.terminationReasons);
                observer.complete();
            } else {
                this._enumService.terminationReasons()
                    .subscribe(response => {
                        this.terminationReasons = response;
                        observer.next(this.terminationReasons);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getEmploymentTypes(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.employmentTypes.length) {
                observer.next(this.employmentTypes);
                observer.complete();
            } else {
                this._enumService.employmentType()
                    .subscribe(response => {
                        this.employmentTypes = response;
                        observer.next(this.employmentTypes);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getExpectedWorkloadUnit(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.expectedWorkloadUnits.length) {
                observer.next(this.expectedWorkloadUnits);
                observer.complete();
            } else {
                this._enumService.expectedWorkloadUnit()
                    .subscribe(response => {
                        this.expectedWorkloadUnits = response;
                        observer.next(this.expectedWorkloadUnits);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getCountries(): Observable<CountryDto[]> {
        return new Observable<CountryDto[]>((observer) => {
            if (this.countries.length) {
                observer.next(this.countries);
                observer.complete();
            } else {
                this._enumService.countries()
                    .subscribe(response => {
                        this.countries = response;
                        observer.next(this.countries);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getConsultantTimeReportingCap(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.consultantTimeReportingCapList.length) {
                observer.next(this.consultantTimeReportingCapList);
                observer.complete();
            } else {
                this._enumService.consultantTimeReportingCap()
                    .subscribe(response => {
                        this.consultantTimeReportingCapList = response;
                        observer.next(this.consultantTimeReportingCapList);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getWorkflowStatuses(): Observable<WorkflowStatusDto[]> {
        return new Observable<WorkflowStatusDto[]>((observer) => {
            if (this.workflowStatuses.length) {
                observer.next(this.workflowStatuses);
                observer.complete();
            } else {
                this._enumService.workflowStatuses()
                    .subscribe(response => {
                        this.workflowStatuses = response;
                        observer.next(this.workflowStatuses);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }
    getConsultantInsuranceOptions(): Observable<{ [key: string]: string; }> {
        return new Observable<{ [key: string]: string; }>((observer) => {
            if (this.consultantInsuranceOptions !== undefined && this.consultantInsuranceOptions !== null) {
                observer.next(this.consultantInsuranceOptions);
                observer.complete();
            } else {
                this._enumService.consultantInsuranceOption()
                    .subscribe(response => {
                        this.consultantInsuranceOptions = response;
                        observer.next(this.consultantInsuranceOptions);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getLegalEntities(): Observable<LegalEntityDto[]> {
        return new Observable<LegalEntityDto[]>((observer) => {
            if (this.legalEntities.length) {
                observer.next(this.legalEntities);
                observer.complete();
            } else {
                this._enumService.legalEntities()
                    .subscribe(response => {
                        this.legalEntities = response;
                        observer.next(this.legalEntities);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }
    getSyncStateStatuses(): Observable<{ [key: string]: string }> {
        return new Observable<{ [key: string]: string }>((observer) => {
            if (this.syncStateStatuses !== undefined && this.syncStateStatuses !== null) {
                observer.next(this.syncStateStatuses);
                observer.complete();
            } else {
                this._enumService.syncStateStatuses()
                    .subscribe(response => {
                        this.syncStateStatuses = response;
                        observer.next(this.syncStateStatuses);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }
//
    getValueUnitTypes(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.valueUnitTypes.length) {
                observer.next(this.valueUnitTypes);
                observer.complete();
            } else {
                this._enumService.valueUnitTypes()
                    .subscribe(response => {
                        this.valueUnitTypes = response;
                        observer.next(this.valueUnitTypes);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getPeriodUnitTypes(): Observable<EnumEntityTypeDto[]> {
        return new Observable<EnumEntityTypeDto[]>((observer) => {
            if (this.periodUnitTypes.length) {
                observer.next(this.periodUnitTypes);
                observer.complete();
            } else {
                this._enumService.periodUnitTypes()
                    .subscribe(response => {
                        this.periodUnitTypes = response;
                        observer.next(this.periodUnitTypes);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }
    getPurchaseOrderCapTypes(): Observable<{ [key: string]: string }> {
        return new Observable<{ [key: string]: string }>((observer) => {
            if (this.purchaseOrderCapTypes !== undefined && this.purchaseOrderCapTypes !== null) {
                observer.next(this.purchaseOrderCapTypes);
                observer.complete();
            } else {
                this._enumService.purchaseOrderCapType()
                    .subscribe(response => {
                        this.purchaseOrderCapTypes = response;
                        observer.next(this.purchaseOrderCapTypes);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getEnvelopeProcessingPaths(): Observable<{ [key: string]: string }> {
        return new Observable<{ [key: string]: string }>((observer) => {
            if (this.envelopeProcessingPaths !== undefined && this.envelopeProcessingPaths !== null) {
                observer.next(this.envelopeProcessingPaths);
                observer.complete();
            } else {
                this._enumService.envelopeProcessingPaths()
                    .subscribe(response => {
                        this.envelopeProcessingPaths = response;
                        observer.next(this.envelopeProcessingPaths);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getConsultantShownOnClientInvoiceAs(): Observable<{ [key: string]: string }> {
        return new Observable<{ [key: string]: string }>((observer) => {
            if (this.consultantShownOnClientInvoiceAs !== undefined && this.consultantShownOnClientInvoiceAs !== null) {
                observer.next(this.consultantShownOnClientInvoiceAs);
                observer.complete();
            } else {
                this._enumService.consultantShownOnClientInvoiceAs()
                    .subscribe(response => {
                        this.consultantShownOnClientInvoiceAs = response;
                        observer.next(this.consultantShownOnClientInvoiceAs);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getTeamsAndDivisionsLevels(): Observable<{ [key: string]: string }> {
        return new Observable<{ [key: string]: string }>((observer) => {
            if (this.teamsAndDivisionsLevels !== undefined && this.teamsAndDivisionsLevels !== null) {
                observer.next(this.teamsAndDivisionsLevels);
                observer.complete();
            } else {
                this._enumService.teamsAndDivisionsLevels()
                    .subscribe(response => {
                        this.teamsAndDivisionsLevels = response;
                        observer.next(this.teamsAndDivisionsLevels);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }

    getTeamsAndDivisionsNodes(): Observable<TeamsAndDivisionsNodeDto[]> {
        return new Observable<TeamsAndDivisionsNodeDto[]>((observer) => {
            if (this.teamsAndDivisionsNodes?.length) {
                observer.next(this.teamsAndDivisionsNodes);
                observer.complete();
            } else {
                this._lookupService.teamsAndDivisionsNodes()
                    .subscribe(response => {
                        this.teamsAndDivisionsNodes = response;
                        observer.next(this.teamsAndDivisionsNodes);
                        observer.complete();
                    }, error => {
                        observer.error(error);
                    });
            }
        });
    }
}
