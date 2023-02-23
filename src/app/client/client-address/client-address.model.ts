export interface IClientAddress {
    isMainAddress: boolean;
    country: string;
    address: string;
    address2: string;
    city: string;
    isWorkplaceAddress: boolean;
    isInvoiceAddress: boolean;
    isHidden: boolean;
    postCode: string;
    region: string;
    debtorNumberForInvoiceAddress: string;
}
