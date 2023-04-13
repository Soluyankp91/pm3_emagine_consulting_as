export enum MarginType {
    PDCFixed = 1,
    PlainFixed = 2,
    PDCTimeBased = 3,
    PlainTimeBased = 4,
    TotalFixedMargin = 5,
    TotalTimeBasedMargin = 6
}

export interface IMarginConfig {
    clientRate: number | any;
    clientCurrencyId: number | any;
    clientUnitTypeId: number | any;
    clientPaymentType: number | any;
    clientPdcEntity: number | any;
    consultantRate: number | any;
    consultantCurrencyId: number | any;
    consultantUnitTypeId: number | any;
    consultantPDCRate: number | any;
    consultantPDCCurrencyId: number | any;
    consultantPDCUnitTypeId: number | any;
    consultantPaymentType: number | any;
    consultantPdcEntity: number | any;
}
