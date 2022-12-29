import { UntypedFormArray, UntypedFormGroup } from "@angular/forms";

export class GeneralDocumentForm extends UntypedFormGroup {
    constructor() {
        super({
            documents: new UntypedFormArray([])
        })

    }
    get documents() {
        return this.get('documents') as UntypedFormArray;
    }
}


export enum DocumentSideNavItem {
    General = 1,
    Contracts = 2,
    Evaluations = 3
}

export class DocumentSideNavDto {
    name: string;
    selected: boolean;
    enumValue: number;
}

export const DocumentSideNavigation: DocumentSideNavDto[] = [
    {
        name: 'General',
        selected: true,
        enumValue: DocumentSideNavItem.General
    },
    {
        name: 'Contracts',
        selected: false,
        enumValue: DocumentSideNavItem.Contracts
    },
    {
        name: 'Evaluations',
        selected: false,
        enumValue: DocumentSideNavItem.Evaluations
    }
];

export enum EvaluationFromDateOption {
    LastMonth = 1,
    Last6Months = 2,
    Last12Months = 3,
    AllPeriods = 4
}

export const EvaluationFromDateList = [
    {
        id: EvaluationFromDateOption.LastMonth,
        name: 'Last month'
    },
    {
        id: EvaluationFromDateOption.Last6Months,
        name: 'Last 6 months'
    },
    {
        id: EvaluationFromDateOption.Last12Months,
        name: 'Last 12 months'
    },
    {
        id: EvaluationFromDateOption.AllPeriods,
        name: 'All periods'
    }
]
