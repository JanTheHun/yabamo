import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-engine-box',
  templateUrl: './engine-box.component.html',
  styleUrls: ['./engine-box.component.css']
})
export class EngineBoxComponent implements OnInit {

  _engine: any = null
  _config: any = null
  _engineName: string = null
  _running: boolean = false

  routes: any = null
  
  @Input()
  set engine(data: any) {
    this._engine = data
    this.routes = this._engine.routes
    console.log(this._engine)
  }

  @Input()
  set engineName(data: string) {
    this._engineName = data
    console.log(this._engineName)
  }

  @Input()
  set config(data: any) {
    this._config = data
    this.routes = this._config.routes
    console.log(this._config)
  }

  @Input()
  set listening(data: boolean) {
    this._running = data
  }

  @Output() engineCommand = new EventEmitter()

  constructor() { }


  engineComm(command) {
    this.engineCommand.emit({
      command: command,
      engineId: this._engineName
    })
  }

  ngOnInit() {  }

}
