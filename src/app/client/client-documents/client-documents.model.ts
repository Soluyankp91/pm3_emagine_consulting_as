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
