import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  constructor() { }


  // get color for a county
  public getCountyColor(metric) {
    return this.getColor(1e6, metric);
  }

  // get color for a state
  public getStateColor(metric, name, focused) {
    if(focused){
      return this.getColor(3.5e7, metric);
    } else {
      return '#666666';
    }
      
  }

  // gets color based on continuous value
  getColor(valueMax, value){

    let colors = ['#ffffb2','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#b10026']; // colors from http://colorbrewer.org
    let indexMax = 6;
    let index = this.getColorMapIndex(indexMax, valueMax, value);

    return colors[index];
  }

  // convert a continuous value to an index into a colormap
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
