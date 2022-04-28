export enum OverviewFlag {
    Extension = 1,
    ExtensionExpected = 2,
    Terminated = 3,
    TerminationExpected = 4,
    Negotiation = 5,
    AtterntionRequired = 6
}

export class OverviewData {
    firstName: string;
    lastName: string;
    process: OverviewFlag;
}
