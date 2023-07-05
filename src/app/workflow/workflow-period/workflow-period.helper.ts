import { StepDto, StepType, WorkflowProcessType } from "src/shared/service-proxies/service-proxies";
import { EmploymentTypes } from "../workflow.model";
import { StepWithAnchorsDto, IConsultantAnchor, StepAnchorDto, SubItemDto, SalesMainDataSections, SalesClientDataSections, SalesTerminationSections, SalesPlaceholderConsultantAnchors, SalesConsultantDataSections, ContractMainDataSections, ContractClientDataSections, ContractSyncSections, ContractPlaceholderConsultantAnchors, ContractConsultantDataSections, ContractTerminationSections, FinanceSections, ConsultantFinanceSections } from "./workflow-period.model";

export function GenerateStepAnchors(
    step: StepDto | StepWithAnchorsDto,
    processTypeId: number,
    consultantNames?: IConsultantAnchor[]
) {
    switch (step.typeId) {
        case StepType.Sales:
            let SalesAnchors: StepAnchorDto[] = [];
            switch (processTypeId) {
                case WorkflowProcessType.StartClientPeriod:
                case WorkflowProcessType.ChangeClientPeriod:
                case WorkflowProcessType.ExtendClientPeriod:
                    SalesAnchors = [
                        {
                            name: 'Main Data',
                            anchor: 'salesMainDataAnchor',
                            subItems: new Array<SubItemDto>(...SalesMainDataSections),
                        },
                        {
                            name: 'Client Data',
                            anchor: 'salesClientDataAnchor',
                            subItems: new Array<SubItemDto>(...SalesClientDataSections),
                        },
                    ];
                    break;
                case WorkflowProcessType.StartConsultantPeriod:
                case WorkflowProcessType.ChangeConsultantPeriod:
                case WorkflowProcessType.ExtendConsultantPeriod:
                    SalesAnchors = [
                        {
                            name: 'Main Data',
                            anchor: 'salesMainDataAnchor',
                        },
                    ];
                    break;
                case WorkflowProcessType.TerminateWorkflow:
                case WorkflowProcessType.TerminateConsultant:
                    SalesAnchors = [
                        {
                            name: 'Termination Data',
                            anchor: 'salesTerminationData',
                            subItems: new Array<SubItemDto>(...SalesTerminationSections),
                        },
                    ];
                    break;
            }

            if (consultantNames?.length) {
                consultantNames.forEach((item, index) => {
                    SalesAnchors.push({
                        name: 'Consultant Data',
                        anchor: `salesConsultantDataAnchor${index}`,
                        consultantName: item.name,
                        subItems:
                            item.employmentType === EmploymentTypes.FeeOnly ||
                            item.employmentType === EmploymentTypes.Recruitment
                                ? MapConsultantAnchors(SalesPlaceholderConsultantAnchors, index)
                                : MapConsultantAnchors(SalesConsultantDataSections, index),
                        anchorsOpened: false,
                    });
                });
            }
            return new Array<StepAnchorDto>(...SalesAnchors);
        case StepType.Contract:
            let ContractAnchors: StepAnchorDto[] = [];
            switch (processTypeId) {
                case WorkflowProcessType.StartClientPeriod:
                case WorkflowProcessType.ChangeClientPeriod:
                case WorkflowProcessType.ExtendClientPeriod:
                    ContractAnchors = [
                        {
                            name: 'Main Data',
                            anchor: 'mainDataAnchor',
                            subItems: new Array<SubItemDto>(...ContractMainDataSections),
                            anchorsOpened: false,
                        },
                        {
                            name: 'Client Data',
                            anchor: 'clientDataAnchor',
                            subItems: new Array<SubItemDto>(...ContractClientDataSections),
                            anchorsOpened: false,
                        },
                        {
                            name: 'Sync & Legal',
                            anchor: 'syncLegalContractAnchor',
                            subItems: new Array<SubItemDto>(...ContractSyncSections),
                            anchorsOpened: false,
                        },
                    ];
                    if (consultantNames?.length) {
                        let consultantAnchors: StepAnchorDto[] = consultantNames.map((item, index) => {
                            return {
                                name: 'Consultant Data',
                                anchor: `consultantDataAnchor${index}`,
                                consultantName: item.name,
                                subItems:
                                    item.employmentType === EmploymentTypes.FeeOnly ||
                                    item.employmentType === EmploymentTypes.Recruitment
                                        ? MapConsultantAnchors(ContractPlaceholderConsultantAnchors, index)
                                        : MapConsultantAnchors(ContractConsultantDataSections, index),
                                anchorsOpened: false,
                            };
                        });
                        ContractAnchors.splice(2, 0, ...consultantAnchors);
                    }
                    break;
                case WorkflowProcessType.StartConsultantPeriod:
                case WorkflowProcessType.ChangeConsultantPeriod:
                case WorkflowProcessType.ExtendConsultantPeriod:
                    ContractAnchors = [
                        {
                            name: 'Main Data',
                            anchor: 'mainDataAnchor',
                        },
                        {
                            name: 'Sync & Legal',
                            anchor: 'syncLegalContractAnchor',
                        },
                    ];
                    if (consultantNames?.length) {
                        let consultantAnchors: StepAnchorDto[] = consultantNames.map((item, index) => {
                            return {
                                name: 'Consultant Data',
                                anchor: `consultantDataAnchor${index}`,
                                consultantName: item.name,
                                anchorsOpened: false,
                            };
                        });
                        ContractAnchors.splice(1, 0, ...consultantAnchors);
                    }
                    break;
                case WorkflowProcessType.TerminateWorkflow:
                case WorkflowProcessType.TerminateConsultant:
                    ContractAnchors = [
                        {
                            name: 'Termination Data',
                            anchor: 'contractTerminationData',
                            subItems: new Array<SubItemDto>(...ContractTerminationSections),
                        },
                    ];
                    break;
            }
            return new Array<StepAnchorDto>(...ContractAnchors);
        case StepType.Finance:
            let FinanceAnchors: StepAnchorDto[] = [];
            switch (processTypeId) {
                case WorkflowProcessType.StartClientPeriod:
                case WorkflowProcessType.ChangeClientPeriod:
                case WorkflowProcessType.ExtendClientPeriod:
                    FinanceAnchors = [
                        {
                            name: 'Finance Data',
                            anchor: 'financeDataAnchor',
                            subItems: new Array<SubItemDto>(...FinanceSections),
                            anchorsOpened: false,
                        },
                    ];
                    break;
                case WorkflowProcessType.StartConsultantPeriod:
                case WorkflowProcessType.ChangeConsultantPeriod:
                case WorkflowProcessType.ExtendConsultantPeriod:
                    FinanceAnchors = [
                        {
                            name: 'Finance Data',
                            anchor: 'financeDataAnchor',
                            subItems: new Array<SubItemDto>(...ConsultantFinanceSections),
                            anchorsOpened: false,
                        },
                    ];
                    break;
            }
            return new Array<StepAnchorDto>(...FinanceAnchors);
        case StepType.Sourcing:
            return [];
    }
}

export function MapConsultantAnchors(anchors: SubItemDto[], index: number) {
    return anchors.map(item => {
        return new SubItemDto({
            name: item.name,
            anchor: `${item.anchor}${index}`
        });
    });
}
