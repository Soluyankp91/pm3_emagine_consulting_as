import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnumEntityTypeDto, EnumServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { WorkflowSideNavigation } from './primary-workflow/primary-workflow.model';
import { ExtensionSideNavigation } from './workflow-extension/workflow-extension.model';
import { TopMenuTabsDto, TopMenuTabs, WorkflowProgressStatus } from './workflow.model';

@Injectable({
    providedIn: 'root'
})
export class WorkflowDataService {
    // sideMenuTabs: TopMenuTabsDto[] = SideMenuTabs;
    topMenuTabs: TopMenuTabsDto[] = TopMenuTabs;
    extensionSideNavigation = ExtensionSideNavigation;
    workflowSideNavigation = WorkflowSideNavigation;

    workflowProgress: WorkflowProgressStatus = new WorkflowProgressStatus();

    workflowSalesSaved = new EventEmitter<boolean>();
    workflowSideSectionAdded = new EventEmitter<boolean>();

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
