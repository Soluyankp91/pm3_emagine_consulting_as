// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    dev: false,
    qa: true,
    apiUrl: 'https://pm3be',
    sourcingUrl: 'https://sourcingbe',
    sharedAssets: "https://sourcingdevst.z6.web.core.windows.net/shared-assets",
    msalClientId: '0bde1cff-481e-4b7e-aefa-0c0a22ca9f1c',
    msalAuthorityUrl: 'https://login.microsoftonline.com/b4cc3fac-1ad5-41ed-a4f7-294ef841ab86/',
    msalInterceptorConfigUrl: 'api://461b033f-4039-4716-a579-8fc88186f8ff/access_as_user',
    isSignalRLoggingEnabled: true,
};
