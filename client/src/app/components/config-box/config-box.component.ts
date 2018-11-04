import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-config-box',
  templateUrl: './config-box.component.html',
  styleUrls: ['./config-box.component.css']
})
export class ConfigBoxComponent implements OnInit {

  _config: any = null
  _configName: string = null
  _engineCreated: string = null
  routeVisibility: boolean[] = []

  routesVisible: boolean = false

  newEngineName: string = null

  @Input()
  set engineCreated(data:any) {
    console.log("engine created:", data)
    this._engineCreated = data
  }

  @Input()
  set config(data: any) {

    if (this._config) {

        let oldRoutes = this._config.routes
        this._config = data
        if (!this.compareRouteArrays(oldRoutes, this._config.routes)) {
          
          this.routeVisibility = []
          for (let r of this._config.routes) {
            this.routeVisibility.push(false)
          }
        } 
        

    } else {
      
      this._config = data
      this.routeVisibility = []
      for (let r of this._config.routes) {
        this.routeVisibility.push(false)
      }
      
    }
      
      
  }

  @Input()
  set configName(data: string) {
    this._configName = data
  }

  @Output() currentResponseChanged = new EventEmitter()

  @Output() toggleEngine = new EventEmitter()

  constructor() { }

  getList(obj) {
    return Object.keys(obj)
  }

  changeCurrentResponse(index,response) {
    this.currentResponseChanged.emit({
      configId: this._configName,
      reqpath:this._config.routes[index].reqpath,
      method:this._config.routes[index].method,
      response:response
    })
  }

  createEngine() {
    if (this._engineCreated != null) {
      this.toggleEngine.emit({
        command: "delete",
        engineId: this._engineCreated
      })
    } else {

      console.log(this.newEngineName)
      if(this.newEngineName == null || this.newEngineName == "") {
        this.toggleEngine.emit({
          command: "create",
          configId: this._configName
        })
      } else {
        console.log("HERE")
        this.toggleEngine.emit({
          command: "create",
          configId: this._configName,
          engineId: this.newEngineName
        })
      }
    }
  }

  compareRouteArrays(oldArray,newArray) {

    if (oldArray.length !== newArray.length) {
      return false
    }

    return true

  }

  ngOnInit() {
  }

}
