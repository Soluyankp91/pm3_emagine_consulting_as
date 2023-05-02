export enum EDataShownOnInvoce {
    ConsultantName = 1,
    ConsultantId = 2
}

export const DataShowOnInvoceOptions = [
    {
        value: EDataShownOnInvoce.ConsultantName,
        label: 'Consultant name'
    },
    {
        value: EDataShownOnInvoce.ConsultantId,
        label: 'Consultant ID'
    },
];
