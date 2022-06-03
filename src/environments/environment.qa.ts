// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  dev: false,
  qa: true,
  apiUrl: 'https://pm3-qa-api.prodataconsult.com/',
  sourcingUrl: 'https://web-sourcing-qa-env.prodataconsult.com',
  blobStorageUrl: 'https://web-sourcing-qa-env.prodataconsult.com/api/sourcing',
  sharedAssets: "https://web-sourcing-qa.azurewebsites.net/api/shared-assets"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.