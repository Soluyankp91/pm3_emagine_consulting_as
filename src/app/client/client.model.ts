export const CountryList = [
    {
        id: 1,
        flag: 'dk',
        name: 'Denmark',
        selected: false
    },
    {
        id: 2,
        flag: 'se',
        name: 'Sweden',
        selected: false
    },
    {
        id: 3,
        flag: 'no',
        name: 'Norway',
        selected: false
    },
    {
        id: 4,
        flag: 'de',
        name: 'Germany',
        selected: false
    },
    {
        id: 5,
        flag: 'pl',
        name: 'Poland',
        selected: false
    },
    {
        id: 6,
        flag: 'ne',
        name: 'Netherlands',
        selected: false
    },
    {
        id: 7,
        flag: 'en',
        name: 'International',
        selected: false
    }
];

export interface ISelectableIdNameDto {
    id: number | string;
    name: string;
    selected: boolean;
}

export class SelectableIdNameDto implements ISelectableIdNameDto {
    id: number | string;
    name: string;
    selected: boolean;
    constructor(data?: ISelectableIdNameDto) {
        this.id = data?.id!;
        this.name = data?.name!;
        this.selected = data?.selected!;
    }
}

export interface ISelectableCountry {
    id: number | string;
    flag: string;
    name: string;
    code: string;
    selected: boolean;
}

export class SelectableCountry implements ISelectableCountry {
    id: number | string;
    flag: string;
    name: string;
    code: string;
    selected: boolean;
    constructor(data?: ISelectableCountry) {
        this.id = data?.id!;
        this.flag = data?.flag!;
        this.name = data?.name!;
        this.code = data?.code!;
        this.selected = data?.selected!;
    }
}

export interface ISelectableEmployeeDto {
    id: number | string;
    name: string;
    externalId: string;
    selected: boolean;
}

export class SelectableEmployeeDto implements ISelectableEmployeeDto {
    id: number | string;
    name: string;
    externalId: string;
    selected: boolean;
    constructor(data?: ISelectableEmployeeDto) {
        this.id = data?.id!;
        this.name = data?.name!;
        this.externalId = data?.externalId!;
        this.selected = data?.selected!;
    }
}

export const StatusList = [
    {
        name: 'Active',
        id: 1,
        selected: false
    },
    {
        name: 'Non-active',
        id: 2,
        selected: false
    },
    {
        name: 'Deleted',
        id: 3,
        selected: false
    },
    {
        name: 'Wrongfully deleted',
        id: 4,
        selected: false
    }
];
