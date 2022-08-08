// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    dev: false,
    qa: true,
    apiUrl: 'https://pm3-qa-api.prodataconsult.com',
    sourcingUrl: 'https://web-sourcing-qa.prodataconsult.com',
    sharedAssets: "https://web-sourcing-qa.prodataconsult.com/api/shared-assets/qa",
    msalClientId: '6651cfbb-f282-4700-a1cf-f924304b0871',
    msalAuthorityUrl: 'https://login.microsoftonline.com/f5df7d60-53fa-47bc-b519-6f2681e92dfd/',
    msalInterceptorConfigUrl: 'api://9b7c3538-67bf-4e21-88ef-cb512296be90/access_as_user'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
