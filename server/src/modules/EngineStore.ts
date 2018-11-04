import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as uuid4 from 'uuid/v4'

import logger from './Logger'

import { EngineConfig, ServerInstance, Route } from '../classes/AppTypes'

import { getConfigById } from './ConfigStore'

var engines: any = {}

var instances: any = {}

export function getEngineList() {
    let enginesOut: any = {}
    for (let engine in engines) {
        enginesOut[engine] = {
            port: engines[engine].port,
            config: engines[engine].config
        }
    }
    console.log("ENGINELIST:", enginesOut)
    return enginesOut
}

export function getRunningInstances() {
    return Object.keys(instances)
}

export function createEngineFromConfig(configId: any, engineId?: string) {

    return new Promise( (resolve, reject) => {
        
        let config: EngineConfig = getConfigById(configId)
        let newId: string
        if (engineId) {
            newId = engineId
        } else if(config.hasOwnProperty("configName")) {
            newId = String(config.configName)
        } else {
            let newUuid = uuid4()
            while ( engines.hasOwnProperty(newUuid) ) {
                console.log("UUID crash!")
                newUuid = uuid4()
            }
            newId = newUuid
        }
        let app = express()
            
                                    /*      catching JSON errors in bodyParser    */
        app.use(bodyParser.json({type:"*/*"}))
        app.use( function(error: any, req: any, res: any, next: any) {
            if (error) {
                console.log("\n\nmiddleware error!\nprobably JSON parsing..\n\n\t***\tTODO!!\n\n")
                next()
            } else {
                next()
            }
        })    

                                            /*      logging     */
        // app.use(logger)

                                            /*      setting keep-alive to false     */
        app.use(function(req,res,next) {
            res.setHeader('Connection', 'close')
            next()
        })

                                            /*      handling requests     */
        app.use('/', (req,res) => {
            let reqPath = req.path
            let reqMethod = req.method
            let engineRoutes: Route[] = getConfigById(configId).routes//config.routes
            let responseFound = false
            let currentResponse
            let responseType
            let responseData
            engineRoutes.forEach( route => {
                if (route.reqpath === reqPath) {
                    if (route.method === reqMethod) {
                        responseFound = true
                        currentResponse = route.responses[route.currentResponse]
                        responseType = currentResponse.type
                        responseData = currentResponse.data
                    }
                }
            })
            if (!responseFound) {
                currentResponse = getConfigById(configId).fallback//config.fallback
                responseType = currentResponse.type
                responseData = currentResponse.data
            }
            switch (responseType) {
                case "json": 
                    res.json(responseData)
                    break
                case "string":
                    res.send(responseData)
                    break
                default:

                    break
            }
        })
    
        let newEngine = new ServerInstance(getConfigById(configId), configId, app)
        engines[newId] = newEngine

        // console.log("engines:", Object.keys(engines))

        resolve(newId)
    })

}

export function deleteEngine(engineId: string) {
    return new Promise( (resolve, reject) => {
        if (instances.hasOwnProperty(engineId)) {
            instances[engineId].close()
            delete instances[engineId]
            console.log(`stopping engine '${engineId}'`)
        } else {
            console.log(`engine '${engineId}' is not running`)
        }
        if (engines.hasOwnProperty(engineId)) {
            delete engines[engineId]
            console.log(`engine ${engineId} deleted from EngineStore`)
            resolve(engineId)
        } else {
            console.log(`no engine "${engineId}' found!`)
            reject(`no engine "${engineId}' found!`)
        }
    })
}

export function startEngineListening(engineId: string) {
    return new Promise( (resolve, reject) => {
        if (engines.hasOwnProperty(engineId)) {
            if (!instances.hasOwnProperty(engineId)) {
                let engine: ServerInstance = engines[engineId]
                instances[engineId] = engine.server.listen(engine.port)
                resolve(engineId)
            } else {
                reject(`engine "${engineId}' already running`)
            }

        } else {
            reject(`couldn't start engine '${engineId}': not found`)
        }
    })
}

export function stopEngineListening(engineId: string) {

    return new Promise( (resolve, reject) => {
        if (engines.hasOwnProperty(engineId)) {
            if (instances.hasOwnProperty(engineId)) {
                let engine = instances[engineId]
                engine.close()
                // engine = null
                delete instances[engineId]
                resolve(engineId)
            } else {
                reject(`engine "${engineId}' not running`)
            }
        } else {
            reject(`couldn't stop engine '${engineId}': not found`)
        }
    })
}
