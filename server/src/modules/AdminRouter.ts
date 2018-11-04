import { Router as router } from 'express'
import * as socketIo from 'socket.io'
import * as express from 'express'
import * as http from 'http'
import * as bodyParser from 'body-parser'

import { AdminCommand, Route, Response } from '../classes/AppTypes'
import { getConfigList, addRoute, removeRoute, addResponse, changeResponse } from './ConfigStore'
import { getEngineList, getRunningInstances, createEngineFromConfig, startEngineListening, stopEngineListening, deleteEngine } from './EngineStore'

var io: SocketIO.Server

var offlineConfigStore: any[] = []

export function startAdminInstance(port: number) {
    let app = express()
    app.use(bodyParser.json({type:"*/*"}))

        /*      catching JSON errors in bodyParser    */

    app.use(function(error:any , req: any, res: any, next:any) {
        if (error) {

            console.log("\n\nmiddleware error!\nprobably JSON parsing..\n\n\t***\tTODO!!\n\n")

            next()
            
        } else {

            next()

        }
    })

    let server = http.createServer(app)
    io = socketIo(server) 
    server.listen(port)
    io.on("connect", (socket: any) => {
        console.log("SOCKET connected:", socket.id)
        socket.emit("serverstate", {
            configs: getConfigList(),
            engines: getEngineList(),
            instances: getRunningInstances()
        })

        
        socket.on("initfrontend", () => {
            console.log("startup", socket.id)
            socket.emit("serverstate", {
                configs: getConfigList(),
                engines: getEngineList(),
                instances: getRunningInstances()
            })
        })
    })
    
    app.use('/', createAdminRouterMiddleware())

}

function createAdminRouterMiddleware() {

    let routes = router()

    routes.get( '/', (req, res) => {
        console.log(`serving file: "${req.originalUrl}"`)
        res.sendFile('/html/index.html', { root: 'dist/' })
    })

    routes.get( /.*/, (req, res) => {
        console.log(`serving file: "${req.originalUrl}"`)
        res.sendFile(`/html${req.originalUrl}`, { root: 'dist/' })
    })

    routes.post("/", (req,res) => {
        
        let {
                command,
                // config,
                // port,
                // engine,
                route,
                // responses,
                method,
                // currentResponse,
                // fallback,
                // response,
                // index,
                responseName,
                response,
                engineId,
                configId,
                reqpath,
                currentResponse,
                ...rest
            } = req.body

        let validCommand = AdminCommand.check(req.body)

        if (validCommand === false) {
            res.send({
                message:"not cool.."
            })
        } else {
            switch(command) {
                case 'stopengine': {
                    // _stopEngine(port, engine, res)
                    _stopEngine(engineId, res)
                    break
                }
                case 'startengine': {
                    // _startEngine(config, res)
                    _startEngine(engineId, res)
                    break
                }
                case 'createengine': {
                    _createEngine(configId, res, engineId)
                    break
                }
                case 'deleteengine': {
                    _deleteEngine(engineId, res)
                    break
                }
                case 'addroute': {
                    _addRoute(configId, res, route)
                    break
                }
                case 'removeroute': {
                    _removeRoute(configId, res, reqpath, method)
                    break
                }
                case 'addresponse': {
                    _addResponse(configId, route, method, responseName, response, res)
                    break
                }
                case 'changeresponse': {
                    _changeResponse(configId, reqpath, method, currentResponse, res)
                    break
                }

                /*
                case 'disableroute': {
                    _disableRoute(engine, route, method, res)
                    break
                }
                case 'enableroute': {
                    _enableRoute(engine, route, method, res)
                    break
                }
                case 'addconfig': {
                    _addConfig(config, res)
                    break
                }
                case 'removeconfig': {
                    _removeConfig(engine, res)
                    break
                }
*/
                default: {
                    
                    console.log(`\n\t\tWTF? "${command}"?`)

                    res.send(`WTF? "${command}"?`)

                    break
                }
            }
        }

    })

    return routes

}

function _startEngine(engineId: string, res: express.Response ) {
    startEngineListening(engineId)
        .then( (engineId) => {
            console.log(`Engine '${engineId}' started`)
            res.send({
                command: "start",
                success: true,
                engineId: engineId
            })
            io.emit("serverstate", {
                configs: getConfigList(),
                engines: getEngineList(),
                instances: getRunningInstances()
            })
        })
        .catch( (error) => {
            console.log(`couldn't start engine '${engineId}', error: "${error}"`)
            res.send({
                command: "start",
                success: false,
                error: error
            })
        })
}


function _stopEngine(engineId: string, res: express.Response  ) {
    
    stopEngineListening(engineId)
    .then( (engineId) => {
        console.log(`Engine '${engineId}' stopped`)
            res.send({
                command: "stop",
                success: true,
                engineId: engineId
            })
            io.emit("serverstate", {
                configs: getConfigList(),
                engines: getEngineList(),
                instances: getRunningInstances()
            })
        })
        .catch( (error) => {
            console.log(`Error stopping '${engineId}': `, error)
            res.send({
                command: "stop",
                success: false,
                error: error
            })
        })
    }
    
    function _createEngine(configId: string, res: express.Response, engineId?: string) {
        createEngineFromConfig(configId, engineId)
            .then( engineId => {
                console.log(`Engine '${engineId}' created`)
                res.send({
                    command: "create",
                    success: true,
                    engineId: engineId
                })
                let engineList = getEngineList()
                // console.log("SENDING:", engineList)
                io.emit("serverstate", {
                    configs: getConfigList(),
                    engines: engineList,
                    instances: getRunningInstances()
                })
            })
            .catch( (error) => {
                res.send({
                    command: "create",
                    success: false,
                    error: error
                })
            })
    }

    
    function _deleteEngine(engineId: string, res: express.Response) {
        deleteEngine(engineId)
            .then( engineId => {
                console.log(`Engine '${engineId}' deleted`)
                res.send({
                    command: "delete",
                    success: true,
                    engineId: engineId
                })
                io.emit("serverstate", {
                    configs: getConfigList(),
                    engines: getEngineList(),
                    instances: getRunningInstances()
                })
            })
            .catch( (error) => {
                res.send({
                    command: "delete",
                    success: false,
                    error: error
                })
            })
    }


    function _addRoute(configId: string, res: express.Response, route: Route) {
        addRoute(configId, route)
        .then( (result) => {
            res.send({
                command: "addroute",
                success: true,
                config: result,
                path: route.reqpath,
                method: route.method
            })
            io.emit("serverstate", {
                configs: getConfigList(),
                engines: getEngineList(),
                instances: getRunningInstances()
            })
        })
        .catch( (error) => {
            res.send({
                command: "addroute",
                success: false,
                error: error
            })
        })
}


function _removeRoute(configId: string, res: express.Response, reqpath: string, method: string) {
    removeRoute(configId, reqpath, method)
        .then( (result) => {
            res.send({
                command: "removeroute",
                success: true,
                config: result,
                path: reqpath,
                method: method
            })
            io.emit("serverstate", {
                configs: getConfigList(),
                engines: getEngineList(),
                instances: getRunningInstances()
            })
        })
        .catch( (error) => {
            res.send({
                command: "removeroute",
                success: false,
                error: error
            })
        })
}

function _addResponse(configId: string, reqpath: string, method: string, responseName: string, response: Response, res:express.Response) {

    addResponse(configId, reqpath, method, responseName, response)
        .then( (result: any) => {
            res.send({
                command: "addresponse",
                success: true,
                config: result,
                path: reqpath,
                method: method,
                responseName: responseName
            })
            io.emit("serverstate", {
                configs: getConfigList(),
                engines: getEngineList(),
                instances: getRunningInstances()
            })
        })
        .catch( (error) => {
            res.send({
                command: "addresponse",
                success: false,
                error: error
            })
        })

}

function _changeResponse(configId: string, reqpath: string, method: string, currentResponse: string, res:express.Response) {

    changeResponse(configId, reqpath, method, currentResponse)
        .then( (result: any) => {
            res.send({
                command: "changeResponse",
                success: true,
                config: result,
                path: reqpath,
                method: method,
                currentResponse: currentResponse
            })
            io.emit("serverstate", {
                configs: getConfigList(),
                engines: getEngineList(),
                instances: getRunningInstances()
            })
        })
        .catch( (error) => {
            res.send({
                command: "changeResponse",
                success: false,
                error: error
            })
        })

}