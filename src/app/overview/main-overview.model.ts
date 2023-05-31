export enum OverviewFlag {
    ExtensionExpected = 1,
    ExtensionInNegotiation = 2,
    ExpectedToTerminate = 3,
    Started = 10,
    Extended = 11,
    Terminated = 12,
    RequiresAttention = 20,
}

export enum OverviewFlagNames {
  "Extension expected" = 1,
  "Extension in negotiation" = 2,
  "Expected to terminate" = 3,
  "Started" = 10,
  "Extended" = 11,
  "Terminated" = 12,
  "Requires attention" = 20,
}

export const OverviewProcessColors: {[key: number]: string} = {
  1: 'overview-extensions-icon',
  10: 'overview-extensions-icon',
  11: 'overview-extensions-icon',
  3: 'overview-termination-icon',
  12: 'overview-termination-icon',
  2: 'overview-negotiation-icon',
  20: 'overview-attention-icon'
}

export const OverviewProcessIcons: {[key: number]: string} = {
  1: 'extension-expected-icon',
  11: 'extended-or-started-icon',
  10: 'extended-or-started-icon',
  3: 'expected-to-terminate-icon',
  12: 'terminated-icon',
  2: 'negotiation-icon',
  20: 'attention-required-icon'
}

export const OverviewFilterColors: {[key: number]: string} = {
    1: 'selected-status green',
    11: 'selected-status green',
    10: 'selected-status green',
    3: 'selected-status red',
    12: 'selected-status red',
    2: 'selected-status blue',
    20: 'selected-status yellow'
}

export class OverviewData {
    firstName: string;
    lastName: string;
    process: OverviewFlag;
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


export const MainOverviewStatuses = [
    {
      id: 1,
      name: "Extension expected",
      canBeSetByUser: true,
      canBeSetAutomatically: false
    },
    {
      id: 2,
      name: "Extension in negotiation",
      canBeSetByUser: true,
      canBeSetAutomatically: false
    },
    {
      id: 3,
      name: "Expected to terminate",
      canBeSetByUser: true,
      canBeSetAutomatically: false
    },
    {
      id: 10,
      name: "Started",
      canBeSetByUser: false,
      canBeSetAutomatically: true
    },
    {
      id: 11,
      name: "Extended",
      canBeSetByUser: false,
      canBeSetAutomatically: true
    },
    {
      id: 12,
      name: "Terminated",
      canBeSetByUser: false,
      canBeSetAutomatically: true
    },
    {
      id: 20,
      name: "Requires attention",
      canBeSetByUser: true,
      canBeSetAutomatically: true
    }
];

  export interface ISelectableStatusesDto {
    id: number;
    name: string;
    canBeSetByUser: boolean;
    canBeSetAutomatically: boolean;
    selected: boolean;
    flag: string;
    color: string;
}

export class SelectableStatusesDto implements ISelectableStatusesDto {
    id: number;
    name: string;
    canBeSetByUser: boolean;
    canBeSetAutomatically: boolean;
    selected: boolean;
    flag: string;
    color: string;

    constructor(data?: ISelectableStatusesDto) {
        this.id = data?.id!;
        this.name = data?.name!;
        this.canBeSetByUser = data?.canBeSetByUser!;
        this.canBeSetAutomatically = data?.canBeSetAutomatically!;
        this.selected = data?.selected!;
        this.flag = data?.flag!;
        this.color = data?.color!;
    }
}

export interface ISelectableCountry {
    id: number | string;
    flag: string;
    name: string;
    tenantName: string;
    code: string;
    selected: boolean;
}

export class SelectableCountry implements ISelectableCountry {
    id: number | string;
    flag: string;
    name: string;
    tenantName: string;
    code: string;
    selected: boolean;
    constructor(data?: ISelectableCountry) {
        this.id = data?.id!;
        this.flag = data?.flag!;
        this.name = data?.name!;
        this.tenantName = data?.tenantName!;
        this.code = data?.code!;
        this.selected = data?.selected!;
    }
}
