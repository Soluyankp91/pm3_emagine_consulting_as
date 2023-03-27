import { ClientAddressDto } from "src/shared/service-proxies/service-proxies";
import { IClientAddress } from "./workflow-sales.model";

export function MapClientAddressList(addresses: ClientAddressDto[]): IClientAddress[] {
    let mappedData: IClientAddress[] = addresses.map(x => {
        return PackAddressIntoNewDto(x);
    });
    return mappedData;
}

export function PackAddressIntoNewDto(address: ClientAddressDto): IClientAddress {
    if (address === null || address === undefined) {
        return null;
    }
    let displayAddress = '';
    if (address.address) {
        displayAddress += address.address;
    }
    if (address.city) {
        if (address.address) {
            displayAddress += ', '
        }
        displayAddress += address.city;
    }
    if (address.countryCode) {
        if (address.address || address.city) {
            displayAddress += ' | ';
        }
        displayAddress += address.countryCode;
    }
    return {
        id: address.id,
        displayValue: displayAddress,
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

export function FindClientAddress(clientAddresses: ClientAddressDto[], addressId: number) {
    if (addressId && clientAddresses?.length) {
        return clientAddresses.find(x => x.id === addressId);
    } else {
        return undefined;
    }
}
