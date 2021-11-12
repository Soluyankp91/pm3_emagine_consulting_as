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

export interface ISelectableCountry {
    id: number;
    flag: string;
    name: string;
    selected: boolean;
}

export class SelectableCountry implements ISelectableCountry {
    id: number;
    flag: string;
    name: string;
    selected: boolean;
    constructor(data?: ISelectableCountry) {
        this.id = data?.id!;
        this.flag = data?.flag!;
        this.name = data?.name!;
        this.selected = data?.selected!;
    }
}
