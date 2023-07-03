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


export interface IClientGridPayload {
	search?: string | undefined;
	countryFilter?: number[] | undefined;
	ownerFilter?: number[] | undefined;
	ownerNodes?: number[] | undefined;
	ownerTenants?: number[] | undefined;
	isActive?: boolean | undefined;
	excludeDeleted?: boolean | undefined;
	onlyWrongfullyDeletedInHubspot?: boolean | undefined;
	pageNumber?: number | undefined;
	pageSize?: number | undefined;
	sort?: string | undefined;
}
