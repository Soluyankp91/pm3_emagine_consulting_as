import { EventEmitter, Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ConfigurationServiceProxy, ConsultantResultDto } from 'src/shared/service-proxies/service-proxies';
import { IConsultantAnchor } from './workflow-period/workflow-period.model';
import { MultiSortList, WorkflowProgressStatus } from './workflow.model';

@Injectable({
    providedIn: 'root'
})
export class WorkflowDataService {
    workflowProgress: WorkflowProgressStatus = new WorkflowProgressStatus();

    workflowSideSectionAdded = new EventEmitter<boolean>();
    // Start Clinet period
    startClientPeriodSalesSaved = new EventEmitter<boolean>();
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
    isContractModuleEnabled: boolean;
    isContractModuleEnabled2 = this._configurationService.contractsEnabled().subscribe(result => result);

    constructor(private _configurationService: ConfigurationServiceProxy) {
        // console.log(this.isContractModuleEnabled2);
        this._getContractModuleConfig();
    }

    updateWorkflowProgressStatus(status: Partial<WorkflowProgressStatus>) {
        for (const update in status) {
            const key = update as keyof WorkflowProgressStatus;
            if (status[key] !== null && status[key] !== undefined) {
                (this.workflowProgress[key] as any) = status[key];
            }
        }
    }

    private _getContractModuleConfig() {
        this._configurationService.contractsEnabled().subscribe(result => this.isContractModuleEnabled = result);
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

    get contractModuleEnabled() {
        return this.isContractModuleEnabled;
    }

    get getWorkflowProgress() {
        return this.workflowProgress;
    }
}
