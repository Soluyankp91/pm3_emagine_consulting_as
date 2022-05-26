import { FormArray, FormGroup } from "@angular/forms";
import * as moment from "moment";
import { ClientContractViewRootDto } from "src/shared/service-proxies/service-proxies";

export class FolderNode {
    name: string | undefined;
    files?: string[] | undefined;
    children?: FolderNode[] | undefined;
    level: number;
}

export class FolderFlatNode {
    constructor(
        public expandable: boolean,
        public name: string | undefined,
        public level: number,
        public files?: string[] | undefined,
        public children?: FolderNode[] | undefined
    ) {}
}

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

export const ContractsData = {
    frameAgreements: [
      {
        id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        name: "string",
        startDate: moment(),
        endDate: "string",
        statusColorEnum: 0,
        documents: [
          {
            documentStorageGuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            name: "string",
            type: 0
          }
        ]
      }
    ],
    workflows: [
      {
        id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        name: "string",
        startDate: moment(),
        endDate: "string",
        statusColorEnum: 0,
        clientContracts: [
          {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            name: "string",
            startDate: moment(),
            endDate: "string",
            statusColorEnum: 0,
            documents: [
              {
                documentStorageGuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                name: "string",
                type: 0
              }
            ]
          }
        ],
        consultantContracts: [
          {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            name: "string",
            startDate: moment(),
            endDate: "string",
            statusColorEnum: 0,
            documents: [
              {
                documentStorageGuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                name: "string",
                type: 0
              }
            ]
          }
        ],
        internalContracts: [
          {
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            name: "string",
            startDate: moment(),
            endDate: "string",
            statusColorEnum: 0,
            documents: [
              {
                documentStorageGuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                name: "string",
                type: 0
              }
            ]
          }
        ]
      }
    ]
};