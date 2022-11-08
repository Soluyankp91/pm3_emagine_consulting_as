import { environment } from "src/environments/environment";

export class AppConsts {
    static remoteServiceBaseUrl: string = environment.apiUrl;
    static remoteServiceBaseUrlFormat: string;
    static remoteSyncServiceBaseUrl: string;
    static appBaseUrl: string;
    static appBaseHref: string; // returns angular's base-href parameter value if used during the publish
    static EmployeeProfileUrl = `${environment.sharedAssets}/EmployeePicture/`;
    static ConsultantProfileUrl = `${environment.sharedAssets}/ProfilePicture/`;

    static localeMappings: any = [];

    static readonly grid = {
        defaultPageSize: 20,
        dashboardPageSize: 7
    };
}
