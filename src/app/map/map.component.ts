import { Component, OnInit, Injectable, ChangeDetectorRef } from '@angular/core';
import * as L from 'leaflet';
import { DataService } from '../data.service';
import { styles } from './styles';
import { MatChipsModule } from '@angular/material';
import { StateLabelComponent } from './state-label/state-label.component';
import { Observable, BehaviorSubject } from 'rxjs';
import { GeoJsonObject, Feature } from 'geojson';

export const emptyFeature:Feature = {
  type: "Feature",
  properties: {
    name: "none"
  },
  geometry: {
    type: "Polygon",
    coordinates: []
  }
};

export const USA = {
  zoom: 4,
  center: L.latLng(39.8283459,-98.5794797) //geographic center of the US
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent {

  map;
  isLegendExpanded:boolean = false;
  stateJson;
  stateFeatures;
  
  // information about highlighted state
  public highlightedStateName:string = "none";
  public $highlightedStateFeature:BehaviorSubject<Feature> = new BehaviorSubject<Feature>(emptyFeature);
  highlightedStateFeature;
  highlightedCountyName;
  highlightedCountyFeature;

  // information about selected state
  selectedStateTarget;
  //selectedStateFeature;
  //$highlightedStateName:BehaviorSubject<string> = new BehaviorSubject<string>("none");
  public selectedStateName:string = "none";
  $selectedStateFeature:BehaviorSubject<Feature> = new BehaviorSubject<Feature>(emptyFeature);
  selectedCountyName;
  selectedCountyFeature;


  countyJson;
  countyFeatures;

  options = {
    layers: [
      L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png')
    ],
    zoom: USA.zoom,
    center: USA.center
  };

   style = (feature) => {
    return {
     // ...styles.state_no_selection,
     opacity: 1,
      weight: (feature.properties.highlighted == true) ? 2 : 1,
      dasharray: (feature.properties.highlighted == true) ? '5' : '2.5',
      color: (feature.properties.highlighted == true) ? 'black' : 'white',
      fillOpacity: (feature.properties.selected == true) ? 0.0 : 0.8,
      fillColor: this.getStateColor(feature.properties.population,
                                    feature.properties.name,
                                    feature.properties.focused),
    };
  };

  
  constructor(private dataService: DataService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(){
  }


  legendToggle(){
    //if a state is currently selected, unselect it
    console.log("featurestate: ", this.$selectedStateFeature.value);
    console.log("iftest", this.$selectedStateFeature.value.properties.name);
    if(this.$selectedStateFeature.value.properties.name != "none"){
      console.log("closing legend");
      this.isLegendExpanded = false;
      this.$selectedStateFeature.next(emptyFeature);
    }
  }


  onMapReady(map) {
    //create the map
    this.map = map;

    //get the data and initialize map
    this.dataService.getStateData().subscribe(joined => {
      this.onDataLoaded(joined);
    });
  };

  onDataLoaded(data){
    this.initializeStates(data);

    this.$selectedStateFeature.subscribe(feature => {

      if(feature.properties.name == "none") {

        // unselected
        console.log("unselected");
        this.map.flyTo(USA.center, USA.zoom, {
          animate: true,
          duration: 0.2
        });
        this.removeCounties();
        this.stateFeatures.eachLayer(layer => {
          layer.feature.properties.focused = true;
          layer.feature.properties.selected = false;
        });
        this.stateFeatures.setStyle(this.style);

      } else {

        // selected
        console.log("selected");
        this.isLegendExpanded = true;
        this.removeCounties();
        this.loadCounties(String(feature.id));
        this.stateFeatures.eachLayer(layer => {
          if(feature.id == layer.feature.id){
            layer.feature.properties.selected = true;
          }
          layer.feature.properties.focused = false;
        });
        this.stateFeatures.setStyle(this.style);

      }

      //this.selectedStateName = feature.properties.name;
      //this.highlightedStateName = e.feature.properties.name;
      //this.cdr.detectChanges();
    });
    this.$highlightedStateFeature.subscribe(e => {
      this.highlightedStateName = e.properties.name;
      this.cdr.detectChanges();
    });

  }


  loadCounties(stateId:string) {

    //get the county data
    this.dataService.getCountyData(stateId).subscribe(county => {
      this.initializeCounties(county);
    });
  }

  removeCounties() {
    if(this.countyFeatures){
      this.map.removeLayer(this.countyFeatures);
    }
  }


  initializeStates(stateJson) {
    let thisptr = this; // use thisptr hack to share component functions and variables among leaflet callbacks
    this.stateJson = stateJson;
    //var info = L.control();
    stateJson = stateJson.map(el => {
      return {...el, properties: {...el.properties, focused: true, highlighted: false, selected: false}};
    });

    const highlightFeature = (e) => {
      e.target.feature.properties['highlighted'] = true;
      if(this.highlightedStateFeature){
        this.highlightedStateFeature.properties.highlighted = false;
      }
      this.highlightedStateFeature = e.target.feature;
      //this.highlightedStateFeature.properties.highlighted = true;
      // update the component state observables
      this.$highlightedStateFeature.next(this.highlightedStateFeature);

      //e.target.setStyle(styles.state_no_selection);
      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        e.target.bringToFront();
      }

      this.stateFeatures.setStyle(this.style);

    };



    const selectState = (e) => {
      //this.isStateSelected = true;
      this.map.fitBounds(e.target.getBounds());
      this.$selectedStateFeature.next(e.target.feature);
    };

    const onEachFeature = (feature, layer) => {
      //let popupContent = feature.properties.name;
      layer.on({
        mouseover: highlightFeature,
        //mouseout: resetHighlight,
        click: selectState
      });
      //layer.bindPopup(popupContent);
    }



    //hook it up to the map
    console.log("initializing with stateJson: ", stateJson);
    this.stateFeatures = L.geoJSON(stateJson, {
      style: this.style,
      onEachFeature: onEachFeature 
    }).addTo(this.map);
    console.log("statefeatures: ", this.stateFeatures);
  }

  

  initializeCounties(countyJson) {
    //define the callbacks for leaflet
    
    let thisptr = this; // use thisptr hack to share component functions and variables among leaflet callbacks

    const onEachFeature = (feature, layer) => {
      let popupContent = feature.properties.name;
      layer.on({
        //mouseover: highlightFeature,
        //mouseout: resetHighlight,
        //click: selectState
      });
      layer.bindPopup(popupContent);
    }

    const style = (feature) => {
      return {
        ...styles.state_unselected,
        fillColor: thisptr.getCountyColor(feature.properties.population),
      };
    };

    const selectState = (e) => {
      //set all state styles to unselected
      thisptr.stateFeatures.setStyle(styles.state_unselected);
      thisptr.selectedStateFeature = e.target;
      e.target.setStyle(styles.state_selected);
      thisptr.map.fitBounds(e.target.getBounds())
      thisptr.removeCounties();
      thisptr.loadCounties(e.target.feature.id);
    };




    if(countyJson != null){
      this.countyFeatures = L.geoJSON(countyJson, {
        style: style,
        onEachFeature: onEachFeature 
      }).addTo(this.map);
    }

  };

  getCountyColor(metric) {
    return this.getColor(3e6, metric);
  }

  getStateColor(metric, name, focused) {
    if(focused){
      return this.getColor(3.5e7, metric);
    } else {
      return '#666666';
    }
      
  }

  getColor(valueMax, value){

    let colors = ['#ffffb2','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#b10026'];
    let indexMax = 6;
    let index = this.getColorMapIndex(indexMax, valueMax, value);

    return colors[index];
  }

  getColorMapIndex(indexMax, valueMax, value) {

    if((indexMax <= 0) || (valueMax <= 0.0)){
      return 0;
    } else {

      let normalizedValue = (value / valueMax);

      let index = Math.round(normalizedValue*indexMax);

      if(index > indexMax){
        return indexMax;
      } else {
        return index;
      }
    }
  }
}