import { Component, OnInit, keyframes } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Socket } from 'ng-socket-io'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  contentToShow = 'configs'

  engines: any = {}
  engineArray: any[] = []

  enginesByConfig: any = {}

  configs: any = {}
  configArray: any[] = []

  instances: any = []

  selectedEngine = null

  selectedConfig = null
  adminUrl: string = "http://localhost:6001"

  constructor(
    private socket: Socket,
    private http: HttpClient
  ) {
    this.engines = null

    this.socket.on("serverstate", (data: any) => {
      this.processDataChange(data)  
    })

    this.socket.on("configstore", (data: any) => {
      console.log("configstore: ",data)
    })
  }

  changeCurrentResponse(ev) {
    console.log(ev)
    let commandObj = {
      command: "changeresponse",
      configId: ev.configId,
      reqpath: ev.reqpath,
      method: ev.method,
      currentResponse: ev.response
    }
    this.http.post(this.adminUrl, commandObj).subscribe( res=> {
      console.log(res)
    })
  }

  processDataChange(data: any) {
    console.log("serverstate: ",data)
    // this.selectedEngine = null
    this.configs = data.configs
    this.configArray = Object.keys(this.configs)

    if (!data.engines.hasOwnProperty(this.selectedEngine)) {
      this.selectedEngine = null
    }
    this.engines = data.engines
    this.engineArray = Object.keys(this.engines)

    for (let c in this.enginesByConfig) {
      if (this.engineArray.indexOf(c) === -1) {
        delete this.enginesByConfig[c]
      }
    }

    for (let e in this.engines) {
      if (!this.enginesByConfig.hasOwnProperty(e)) {
        this.enginesByConfig[this.engines[e].config] = e
      }
    }

    console.log("enginesByConfig: ", this.enginesByConfig)

    this.instances = data.instances
  }

  engineCommand(ev) {
    if (ev.command === "start") {
      let commandObj = {
        command: "startengine",
        engineId: ev.engineId
      }
      this.http.post(this.adminUrl, commandObj ).subscribe( res=> {
        console.log(res)
      })
    } else if (ev.command ==="stop") {
      let commandObj = {
        command: "stopengine",
        engineId: ev.engineId
      }
      this.http.post(this.adminUrl, commandObj ).subscribe( res=> {
        console.log(res)
      })
    } else {
      console.log(`unknown command: '${ev.command}'`)
    }
  }

  toggleEngineState(ev) {
    if (ev.command === "create") {
      let commandObj = {
        command: "createengine",
        configId: ev.configId,
        engineId: ev.engineId ? ev.engineId : null
      }
      this.http.post(this.adminUrl, commandObj ).subscribe( res=> {
        console.log(res)
      })
    } else if (ev.command === "delete") {
      let commandObj = {
        command: "deleteengine",
        engineId: ev.engineId
      }
      this.http.post(this.adminUrl, commandObj ).subscribe( res=> {
        console.log(res)
      })
    } else {
      console.log(`unknown command: '${ev.command}'`)
    }
  }

  getList(obj) {
    return Object.keys(obj)
  }

  ngOnInit() {
    
    this.socket.emit("initfrontend")

  }
}
