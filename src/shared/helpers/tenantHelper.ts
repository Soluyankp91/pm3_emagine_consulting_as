export function MapFlagFromTenantId(tenantId: number) {
    switch (tenantId) {
        case 1:
            return 'DK';
        case 2:
            return 'SE';
        case 4:
            return 'PL';
        case 8:
            return 'NL';
        case 10:
            return 'DE';
        case 17:
            return 'NO';
        case 20:
            return 'GB';
        case 25:
            return 'EU';
        case 27:
            return 'FR';
        case 29:
            return 'IN';
        default:
            return '';
    }
}

export function MapTenantNameFromId(tenantId: number) {
    switch (tenantId) {
        case 1:
            return 'Denmark';
        case 2:
            return 'Sweden';
        case 4:
            return 'Poland';
        case 8:
            return 'Netherlands';
        case 10:
            return 'Germany';
        case 17:
            return 'Norway';
        case 20:
            return 'United Kingdom';
        case 25:
            return 'International';
        case 27:
            return 'France';
        case 29:
            return 'India';
        default:
            return '';
    }
}

export function MapTenantCountryCode(name: string) {
    switch (name) {
        case 'Denmark':
            return 'DK';
        case 'Sweden':
            return 'SE';
        case 'Poland':
            return 'PL';
        case 'Netherlands':
            return 'NL';
        case 'Germany':
            return 'DE';
        case 'Norway':
            return 'NO';
        case 'France':
            return 'FR';
        case 'India':
            return 'IN';
        case 'International':
            return 'EU';
        case 'United Kingdom':
            return 'GB';
        default:
            break;
    }
}
export function MapCountryCodeTenant(name: string) {
    switch (name) {
        case 'DK':
            return 'Denmark';
        case 'SE':
            return 'Sweden';
        case 'PL':
            return 'Poland';
        case 'NL':
            return 'Netherlands';
        case 'DE':
            return 'Germany';
        case 'NO':
            return 'Norway';
        case 'FR':
            return 'France';
        case 'IN':
            return 'India';
        case 'EU':
            return 'International';
        case 'GB':
            return 'United Kingdom';
        default:
            break;
    }
}

export function GetCountryCodeByLanguage(name: string) {
    switch (name) {
        case 'Danish':
            return 'DK';
        case 'Dutch':
            return 'NL';
        case 'English':
            return 'GB';
        case 'French':
            return 'FR';
        case 'German':
            return 'DE';
        case 'Hindi':
            return 'IN';
        case 'Norwegian':
            return 'NO';
        case 'Polish':
            return 'PL';            
        case 'Swedish':
            return 'SE';
        default:
            break;
    }
}
