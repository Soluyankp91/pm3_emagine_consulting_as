// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    dev: true,
    qa: false,
    apiUrl: 'https://pm3-qa-api.prodataconsult.com',
    sourcingUrl: 'https://web-sourcing-dev.azurewebsites.net',
    sharedAssets: "https://web-sourcing-qa-env.prodataconsult.com/api/shared-assets/qa",
    msalClientId: '54e44fbe-ca87-45be-9344-9a3bb6dd0dca',
    msalAuthorityUrl: 'https://login.microsoftonline.com/0749517d-d788-4fc5-b761-0cb1a1112694/',
    msalInterceptorConfigUrl: 'api://5f63a91e-8bfd-40ea-b562-3dad54244ff7/access_as_user'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
