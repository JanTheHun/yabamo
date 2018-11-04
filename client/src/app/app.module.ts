import { BrowserModule } from '@angular/platform-browser'
import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'


import { AppComponent } from './app.component'

import { SocketIoModule, SocketIoConfig } from 'ng-socket-io'
import { EngineBoxComponent } from './components/engine-box/engine-box.component'
import { ConfigBoxComponent } from './components/config-box/config-box.component'

import { AngularFontAwesomeModule } from 'angular-font-awesome'

const config: SocketIoConfig = {
  url: 'http://localhost:6001',
  options: {}
}

@NgModule({
  declarations: [
    AppComponent,
    EngineBoxComponent,
    ConfigBoxComponent
  ],
  imports: [
    BrowserModule,
    AngularFontAwesomeModule,
    HttpClientModule,
    FormsModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
