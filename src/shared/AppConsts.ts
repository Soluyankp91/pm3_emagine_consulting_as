export class AppConsts {
    static remoteServiceBaseUrl: string = 'https://pm3-dev-app.azurewebsites.net/';
    static remoteServiceBaseUrlFormat: string;
    static remoteSyncServiceBaseUrl: string;
    static appBaseUrl: string;
    static appBaseHref: string; // returns angular's base-href parameter value if used during the publish

    static localeMappings: any = [];

    static readonly grid = {
        defaultPageSize: 20,
        dashboardPageSize: 7
    };
}
