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
        dashboardPageSize: 7
    };
    static momentFormatType = 'DD.MM.YYYY';
    static PM3_TITLE = 'PM3';
}
