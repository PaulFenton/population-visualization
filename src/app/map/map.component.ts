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
    zoom: 1,
    center: L.latLng(51.7520, 1.2577)
  };

  constructor() { }

  onMapReady(map) {

    this.map = map;
  }

  ngOnInit() {
  }

}
