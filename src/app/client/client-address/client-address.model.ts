import { CountryDto } from "src/shared/service-proxies/service-proxies";

export interface IClientAddress {
    id: number | null,
    isMainAddress: boolean;
    country: CountryDto;
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
