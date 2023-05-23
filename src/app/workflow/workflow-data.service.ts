import { EventEmitter, Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { API_BASE_URL, ClientResultDto, ConfigurationServiceProxy, ConsultantResultDto } from 'src/shared/service-proxies/service-proxies';
import { IConsultantAnchor } from './workflow-period/workflow-period.model';
import { MultiSortList, WorkflowProgressStatus } from './workflow.model';
import { AuthenticationResult } from '@azure/msal-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InternalLookupService } from '../shared/common/internal-lookup.service';
import { LocalHttpService } from 'src/shared/service-proxies/local-http.service';
import { MatSelectChange } from '@angular/material/select';

@Injectable({
    providedIn: 'root'
})
export class WorkflowDataService {
    workflowProgress: WorkflowProgressStatus = new WorkflowProgressStatus();

    workflowSideSectionAdded = new EventEmitter<boolean>();
    // Start Clinet period
    startClientPeriodSalesSaved = new EventEmitter<boolean>();
    contractStepSaved = new EventEmitter<{isDraft: boolean, bypassLegalValidation?: boolean}>();
    salesStepSaved = new EventEmitter<boolean>();
    financeStepSaved = new EventEmitter<boolean>();
    sourcingStepSaved = new EventEmitter<boolean>();
    startClientPeriodContractsSaved = new EventEmitter<{isDraft: boolean, bypassLegalValidation?: boolean}>();
    startClientPeriodFinanceSaved = new EventEmitter<boolean>();

    // Consultant start, extend and change periods
    consultantStartChangeOrExtendSalesSaved = new EventEmitter<boolean>();
    consultantStartChangeOrExtendContractsSaved = new EventEmitter<{isDraft: boolean, bypassLegalValidation?: boolean}>();
    consultantStartChangeOrExtendFinanceSaved = new EventEmitter<boolean>();

    // Change consultant period

    //Termination
    consultantTerminationSalesSaved = new EventEmitter<boolean>();
    workflowTerminationSalesSaved = new EventEmitter<boolean>();
    workflowConsultantTerminationContractsSaved = new EventEmitter<boolean>();
    workflowTerminationContractsSaved = new EventEmitter<boolean>();
    workflowConsultantTerminationSourcingSaved = new EventEmitter<boolean>();
    workflowTerminationSourcingSaved = new EventEmitter<boolean>();

    workflowSideSectionChanged = new EventEmitter<{consultant?: ConsultantResultDto | undefined,  consultantPeriodId?: string | undefined}>();
    workflowSideSectionUpdated = new EventEmitter<{isStatusUpdate: boolean, autoUpdate?: boolean}>();
    workflowTopSectionUpdated = new EventEmitter<any>();

    workflowOverviewUpdated = new EventEmitter<boolean>();

    consultantsAddedToStep = new EventEmitter<{stepType: number, processTypeId: number, consultantNames: IConsultantAnchor[]}>();

    preselectFrameAgreement = new EventEmitter();

    cancelForceEdit =  new EventEmitter<any>();
    resetStepState = new EventEmitter<{isCompleted: boolean, editEnabledForcefuly: boolean, fetchData: boolean}>();
    updatePurchaseOrders = new EventEmitter();
    onDirectClientAddressSelected = new EventEmitter();
    isContractModuleEnabled: boolean;

    constructor(
        private readonly _internalLookupService: InternalLookupService,
        private _localHttpService: LocalHttpService,
        private _httpClient: HttpClient
    ) {}

    updateWorkflowProgressStatus(status: Partial<WorkflowProgressStatus>) {
        for (const update in status) {
            const key = update as keyof WorkflowProgressStatus;
            if (status[key] !== null && status[key] !== undefined) {
                (this.workflowProgress[key] as any) = status[key];
            }
        }
    }

    sortMultiColumnSorting(sortingValuesArray: MultiSortList[]): MultiSortList[] {
        return sortingValuesArray.sort((a, b) => {
			if (a.order === null) {
				return 1;
			}
			if (b.order === null) {
				return -1;
			}
			if (a.order === b.order) {
				return 0;
			}
			return a.order < b.order ? -1 : 1;
		});
    }

    openInHubspot(client: ClientResultDto) {
        this._localHttpService.getTokenPromise().then((response: AuthenticationResult) => {
            this._httpClient
                .get(`${API_BASE_URL}/api/Clients/HubspotPartialUrlAsync`, {
                    headers: new HttpHeaders({
                        Authorization: `Bearer ${response.accessToken}`,
                    }),
                    responseType: 'text',
                })
                .subscribe((result: string) => {
                    this._internalLookupService.hubspotClientUrl = result;
                    if (client.crmClientId !== null && client.crmClientId !== undefined) {
                        window.open(result.replace('{CrmClientId}', client.crmClientId!.toString()), '_blank');
                    }
                });
        });
	}

    get contractModuleEnabled() {
        return true;
    }

    get getWorkflowProgress() {
        return this.workflowProgress;
    }
}
