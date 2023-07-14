export interface IDivisionsAndTeamsFilterState {
	teamsIds: number[];
	divisionIds: number[];
	tenantIds: number[];
}

export interface IDivisionsAndTeamsTreeNode {
	name?: string;
	selected?: boolean;
	id?: number;
	children?: IDivisionsAndTeamsTreeNode[];
    isRoot?: boolean;
}
export enum TenantIdsValue {
    Denmark = 1,
    Sweden = 2,
    Poland = 4,
    Netherlands = 8,
    Germany = 10,
    Norway = 17,
    UnitedKingdom = 20,
    International = 25,
    France = 27,
    India = 29,
}

export const TENANTS_OPTIONS_LOOKUP: ITenant[] = [
	{
		id: TenantIdsValue.Denmark,
		name: 'Denmark',
		code: 'dk',
	},
	{
		id: TenantIdsValue.Sweden,
		name: 'Sweden',
		code: 'se',
	},
	{
		id: TenantIdsValue.Poland,
		name: 'Poland',
		code: 'pl',
	},
	{
		id: TenantIdsValue.Netherlands,
		name: 'Netherlands',
		code: 'nl',
	},
	{
		id: TenantIdsValue.Germany,
		name: 'Germany',
		code: 'de',
	},
	{
		id: TenantIdsValue.Norway,
		name: 'Norway',
		code: 'no',
	},
	{
		id: TenantIdsValue.International,
		name: 'International',
		code: 'eu',
	},
	{
		id: TenantIdsValue.France,
		name: 'France',
		code: 'fr',
	},
	{
		id: TenantIdsValue.India,
		name: 'India',
		code: 'in',
	},
	{
		id: TenantIdsValue.UnitedKingdom,
		name: 'United Kingdom',
		code: 'gb',
	},
];

export const TENANT_ID_LOOKUP: { [key: string]: number } = {
	denmark: 1,
	sweden: 2,
	poland: 4,
	netherlands: 8,
	germany: 10,
	norway: 17,
	international: 25,
	france: 27,
	india: 29,
	unitedKingdom: 20,
};

export interface ITenant {
	id: number;
	name: string;
	code: string;
}
