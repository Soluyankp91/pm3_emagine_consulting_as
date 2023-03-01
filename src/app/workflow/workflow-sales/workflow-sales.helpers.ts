import { ClientAddressDto } from "src/shared/service-proxies/service-proxies";
import { IClientAddress } from "./workflow-sales.model";

export function MapClientAddressList(addresses: ClientAddressDto[]): IClientAddress[] {
    let mappedData: IClientAddress[] = addresses.map(x => {
        return PackAddressIntoNewDto(x);
    });
    return mappedData;
}

export function PackAddressIntoNewDto(address: ClientAddressDto): IClientAddress {
    return {
        id: address.id,
        displayValue: address.address,
        addressType: MapAddressType(address.isInvoiceAddress, address.isWorkplaceAddress, address.isMainAddress)
    }
}

export function MapAddressType(isInvoiceAddress: boolean, isWorkplaceAddress: boolean, isMainAddress: boolean) {
    if (!isInvoiceAddress && !isWorkplaceAddress && !isMainAddress) {
        return '-';
    } else {
        let addressTypeArray = new Array<string>();
        if (isInvoiceAddress) {
            addressTypeArray.push('Invoicing');
        }
        if (isWorkplaceAddress) {
            addressTypeArray.push('Workplace');
        }
        if (isMainAddress) {
            addressTypeArray.push('Main');
        }
        return addressTypeArray.join(' • ') + ' address';
    }
}
