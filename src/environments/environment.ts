// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false
};

export const census_api = {
  "base": "https://api.census.gov/data",
  "key": "&key=8a8f3f0065be3ac4693ef912b901af32aa9bf08a"
}

export const census_api_config = {
  "states": census_api.base + "/2018/pep/population?get=POP,GEONAME&for=state:*" + census_api.key,
}

export const buildCountyQuery = (stateId:string):string => {
  return census_api.base + "/2017/pep/population?get=POP,GEONAME&for=county:*&in=state:" + stateId + census_api.key
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
