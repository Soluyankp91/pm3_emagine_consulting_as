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