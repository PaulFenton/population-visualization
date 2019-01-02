import { BrowserModule } from '@angular/platform-browser';
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


@NgModule({
  declarations: [
    AppComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LeafletModule.forRoot(),
    HttpClientModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
