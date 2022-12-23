export function GetCountryCodeByTenantName(name: string) {
	switch (name) {
		case 'Denmark':
			return 'DK';
		case 'Netherlands':
			return 'NL';
		case 'United Kingdom':
			return 'GB';
		case 'France':
			return 'FR';
		case 'Germany':
			return 'DE';
		case 'India':
			return 'IN';
		case 'Norway':
			return 'NO';
		case 'Poland':
			return 'PL';
		case 'Sweden':
			return 'SE';
		default:
			return;
	}
}
