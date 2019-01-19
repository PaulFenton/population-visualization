import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

//map components
import { LeafletModule } from '@asymmetrik/ngx-leaflet';


//talk to cencus bureau API
import { HttpClientModule } from '@angular/common/http';

//custom components
import { MapComponent } from './map/map.component';
import { DataService } from './data.service';

//material UI components
import { MatExpansionModule, MatIconModule } from '@angular/material';
import { StateLabelComponent } from './map/state-label/state-label.component';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    StateLabelComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    LeafletModule.forRoot(),
    HttpClientModule,
    MatExpansionModule,
    MatIconModule
  ],
  entryComponents: [MapComponent, StateLabelComponent],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
