// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    dev: true,
    qa: false,
    apiUrl: 'https://pm3-dev-api.prodataconsult.com',
    sourcingUrl: 'https://web-sourcing-dev.azurewebsites.net',
    blobStorageUrl: 'https://web-sourcing-dev.azurewebsites.net/server',
    sharedAssets: "https://pdcweb.z6.web.core.windows.net/shared-assets/dev"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
