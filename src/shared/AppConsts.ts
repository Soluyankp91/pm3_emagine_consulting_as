import { environment } from "src/environments/environment";

export class AppConsts {
    static remoteServiceBaseUrl: string = environment.apiUrl;
    static remoteServiceBaseUrlFormat: string;
    static remoteSyncServiceBaseUrl: string;
    static appBaseUrl: string;
    static appBaseHref: string; // returns angular's base-href parameter value if used during the publish

    static consultantPhotoUrl = `/ProfilePicture/`;
    static employeePhotoUrl = `/EmployeePicture/`;

    static localeMappings: any = [];

    static readonly grid = {
        defaultPageSize: 20,
        dashboardPageSize: 7,
        pageSizeOptions: [5, 10, 20, 50, 100]
    };
    static momentFormatType = 'DD.MM.YYYY';
    static PM3_TITLE = 'PM3';
    static readonly COUNTRY_CODE_TO_TENANT_NAME_MAP = new Map<string, string>([
		['dk', 'Denmark'],
		['se', 'Sweden'],
		['pl', 'Poland'],
		['nl', 'Netherlands'],
		['de', 'Germany'],
		['no', 'Norway'],
		['eu', 'International'],
		['fr', 'France'],
		['in', 'India'],
		['gb', 'United Kingdom'],
	]);
    static readonly TENANT_ID_TO_COUNTRY_CODE_MAP = new Map<number, string>([
		[1, 'dk'],
		[2, 'se'],
		[4, 'pl'],
		[8, 'nl'],
		[10, 'de'],
		[17, 'no'],
		[25, 'eu'],
		[27, 'fr'],
		[29, 'in'],
		[20, 'gb'],
	]);
    static readonly TENANT_LIST = [
        'Denmark',
        'Sweden',
        'Poland',
        'Netherlands',
        'Germany',
        'Norway',
        'International',
        'France',
        'India',
        'UnitedKingdom',
    ]
}
