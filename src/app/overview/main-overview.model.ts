export enum OverviewFlag {
    // Extension = 1,
    // ExtensionExpected = 2,
    // Terminated = 3,
    // TerminationExpected = 4,
    // Negotiation = 5,
    // AtterntionRequired = 6
    ExtensionExpected = 1,
    ExtensionInNegotiation = 2,
    ExpectedToTerminate = 3,
    Started = 10,
    Extended = 11,
    Terminated = 12,
    RequiresAttention = 20,
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
}

export class SelectableStatusesDto implements ISelectableStatusesDto {
    id: number;
    name: string;
    canBeSetByUser: boolean;
    canBeSetAutomatically: boolean;
    selected: boolean;
    flag: string;

    constructor(data?: ISelectableStatusesDto) {
        this.id = data?.id!;
        this.name = data?.name!;
        this.canBeSetByUser = data?.canBeSetByUser!;
        this.canBeSetAutomatically = data?.canBeSetAutomatically!;
        this.selected = data?.selected!;
        this.flag = data?.flag!;
    }
}
