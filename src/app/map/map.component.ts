import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  map;
  options = {
    layers: [
      L.tileLayer('https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png')
    ],
    zoom: 4,
    center: L.latLng(39.8283459,-98.5794797) //geographic center of the US
  };

  constructor() { }

  onMapReady(map) {
    this.map = map;
  }

  ngOnInit() {
  }

}
