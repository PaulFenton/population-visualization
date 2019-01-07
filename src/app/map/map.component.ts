import { Component, OnInit, Injectable } from '@angular/core';
import * as L from 'leaflet';
import { DataService } from '../data.service';
import { styles } from './styles';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent {

  map;

  stateJson;
  stateFeatures;
  selectedStateFeature;
  highlightedStateFeature;

  countyJson;
  countyFeatures;

  options = {
    layers: [
      L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png')
    ],
    zoom: 4,
    center: L.latLng(39.8283459,-98.5794797) //geographic center of the US
  };

  
  constructor(private dataService: DataService) {
  }

  onMapReady(map) {
    //create the map
    this.map = map;

    //get the data and initialize map
    this.dataService.getStateData().subscribe(joined => {
      this.initializeStates(joined);
    });
  };

  loadCounties(stateId:string) {
    //get the county data
    this.dataService.getCountyData(stateId).subscribe(county => {
      console.log("got county data: ", county);
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

    const highlightFeature = (e) => {
      if(thisptr.highlightedStateFeature){
        thisptr.highlightedStateFeature.setStyle(styles.state_unhighlighted);
      }
      thisptr.highlightedStateFeature = e.target;
      e.target.setStyle(styles.state_highlighted);
      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        e.target.bringToFront();
      }
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

    const onEachFeature = (feature, layer) => {
      let popupContent = feature.properties.name;
      layer.on({
        mouseover: highlightFeature,
        //mouseout: resetHighlight,
        click: selectState
      });
      layer.bindPopup(popupContent);
    }

    const style = (feature) => {
      return {
        ...styles.state_unselected,
        fillColor: thisptr.getStateColor(feature.properties.population, feature.properties.name),
      };
    };

    //hook it up to the map
    console.log("initializing with stateJson: ", stateJson);
    this.stateFeatures = L.geoJSON(stateJson, {
      style: style,
      onEachFeature: onEachFeature 
    }).addTo(this.map);

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

  getStateColor(metric, name) {
    return this.getColor(3.5e7, metric);
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