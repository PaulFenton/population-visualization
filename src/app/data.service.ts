import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { census_api_config, buildCountyQuery } from '../environments/environment';
import { Observable, zip } from 'rxjs';
import { resolveDefinition } from '@angular/core/src/view/util';
import { map } from "rxjs/operators";
import { FeatureCollection } from 'geojson';
//import { states } from './data';
//import { counties } from './county.data';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private census:Array<any>;
  private states:Array<any>;
  constructor(private http: HttpClient) { }


  getStateData(): Observable<Object> {
    return zip(
        this.http.get(census_api_config.states),
        this.http.get('http://localhost:3000/states')
      ).pipe(
        map((results:[Array<any>, FeatureCollection]) => {
          // splitting up the results object
          let census:Array<any> = results[0];
          let states:FeatureCollection = results[1];

          // remove first record (headers)
          census.shift();

          //build up the string to number map
          let popMap : Map<String, Number> = new Map();
          census.map(el => {
            popMap.set(el[1], parseInt(el[0]));
          });
          
          let features:Array<any> = states.features;
          let joined = features.map(el => {
            let joinedElement = el;
            joinedElement.properties['population'] = popMap.get(el.properties.name);
            return joinedElement;
          });
    
          return joined;
        })
      );
  };

  getCountyData(stateId:string): Observable<Object> {

    return zip(
      this.http.get(buildCountyQuery(stateId)),
      this.http.get('http://localhost:3000/counties/' + stateId)
    ).pipe(
      map((results:[Array<any>, FeatureCollection]) => {
          // splitting up the results object
          let census:Array<any> = results[0];
          let states:FeatureCollection = results[1];

          // remove first record (headers)
          census.shift();

          //build up the string to number map
          let popMap : Map<String, Number> = new Map();
          census.map(el => {
            popMap.set(el[3], parseInt(el[0]));
          });
          
          let features:Array<any> = states.features;
          let joined = features.map(el => {
            let joinedElement = el;
            joinedElement.properties['population'] = popMap.get(el.properties.COUNTYFP);
            return joinedElement;
          });
    
          return joined;
      })

    );



    /*console.log("getting county data...");
    let query = buildCountyQuery(stateId);
    console.log("sending query: ", query);
    return this.http.get(buildCountyQuery(stateId)).pipe(map((res:Array<any>) => {
      // remove first record (headers)
      res.shift();

      //build up the string to number map
      let popMap : Map<String, Number> = new Map();
      res.map(el => {
        popMap.set(el[2], parseInt(el[0]));
      });

      //use the map to join the census data to the geojson features (states)
      let features:Array<any> = counties.features;
      let joined = features.filter(el => stateId == el.properties.STATEFP).map(el => {
        let joinedElement = el;
        joinedElement.properties['population'] = popMap.get(el.properties.STATEFP);
        return joinedElement;
      });

      return joined;
    }));*/
  }
}
