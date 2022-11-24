import { FormArray, FormGroup } from "@angular/forms";
import * as moment from "moment";

export class GeneralDocumentForm extends FormGroup {
    constructor() {
        super({
            documents: new FormArray([])
        })

    }
    get documents() {
        return this.get('documents') as FormArray;
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
