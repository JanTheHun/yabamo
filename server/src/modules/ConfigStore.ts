import * as uuid4 from 'uuid/v4'

import { EngineConfig, Route, Response } from '../classes/AppTypes'

let store: {    [ key: string ]:  EngineConfig  } = {}

export function getConfigList() {
    return store
}

export function getConfigById(configId: string) {
    // console.log(configId, store[configId])
    // return new Promise( (resolve, reject) => {
    //     if (store.hasOwnProperty(configId)) {
    //         resolve(store[configId])
    //     } else {
    //         reject(`no config with ID '${configId}' found`)
    //     }
    // })
    return(store[configId])
}

export function AddConfigToStore(config: EngineConfig, configId?: string) {
    return new Promise( (resolve, reject) => {
        let newId: string
        if (config.hasOwnProperty("configName")) {
            newId = String(config.configName)
        } else {
            let newUuid = uuid4()
            while ( store.hasOwnProperty(newUuid) ) {
                console.log("UUID crash!")
                newUuid = uuid4()
            }
            newId = newUuid
        }
        store[newId] = config
        console.log(store)
        resolve(newId)
    })
    
}

export function RemoveConfigFromStore(configId: string) {
    return new Promise( (resolve, reject) => {
        if (store.hasOwnProperty(configId)) {
            delete store[configId]
            resolve(`'${configId}' removed`)
        } else {
            reject(`no config with engineName '${configId}' in store`)
        }
    })

}

export function configChecker( config:any ) {

    return new Promise( (resolve, reject) => {
        if (config.hasOwnProperty("configName")) {
            if (Object.prototype.toString.call(config.configName) !== "[object String]") {
                reject("\'configName\' is not a String")
            }
        }

        if (    !config.hasOwnProperty("port")                                              // IF 'config' has no field named 'port'
                || Object.prototype.toString.call(config.port) !== "[object Number]") {     // OR it has but it's not a number      
            reject("port not good")                                                         // ..then it isn't valid
        }

        if (    !config.hasOwnProperty("fallback")                                          // IF 'config' has no field named 'fallback'
                || Object.prototype.toString.call(config.fallback) !== "[object Object]") { // OR it has but it's not an object
            // console.log("fallback not good")
            // return null        
            reject("fallback not good")                                                              // ..then it isn't valid
        }

        if (    !config.hasOwnProperty("routes")                                            // IF 'config' has no field named 'paths'
                || Object.prototype.toString.call(config.routes) !== "[object Array]"       // OR it has but it's not a Array
                || config.routes.length <= 0) {                                             // OR it is but it's empty
            // console.log("routes not good")
            // return null     
            reject("routes not good")                                                                 // ..then it isn't valid

        } else {

            for (let route of config.routes) {                                                  // let's see every route in 'config.paths'

                if (    !route.hasOwnProperty("reqpath")                                          // IF route has no 'reqpath' field
                        || Object.prototype.toString.call(route.reqpath) !==  "[object String]"    // OR it's not a string
                        || route.reqpath.length <= 0) {                                            // OR it is but it's empty
                    // console.log("reqpath not good")
                    // return null  
                    reject("reqpath not good")                                                              // ..then it isn't valid
                }

                if (    !route.hasOwnProperty("method")                                         // IF route has no 'method' field
                        || Object.prototype.toString.call(route.method) !==  "[object String]"  // OR it's not a string
                        || route.method.length <= 0) {                                          // OR it is but it's empty
                    // console.log("method not good")
                    // return null 
                    reject("method not good")                                                               // ..then it isn't valid
                }

                if (    !route.hasOwnProperty("responses")                                              // IF route has no 'responses' field
                        || Object.prototype.toString.call(route.responses) !==  "[object Object]") {    // OR its' not an Object
                    // console.log("responses not good")
                    // return null    
                    reject("responses not good")                                                                     // ..then it isn't valid

                } else {                                                                    // it's a valid path so far!

                    for (let response in route.responses) {                                           // let's see every response in the paths's 'responses' Object
                        let thisResponse = route.responses[response]
                        if (    !thisResponse.hasOwnProperty("type")                                                    // IF the response doesn't have a 'type' field
                                || (    thisResponse.type != "json"                                                     // OR it's VALUE is neither 'json'
                                        && thisResponse.type != "string") ) {                                           // nor 'string'
                            // console.log("response type not good")
                            // return null   
                            reject("response type not good")                                                                            // ..then it isn't valid
                        }
                        if (    !thisResponse.hasOwnProperty("data")                                                    // IF the response doesn't have a 'data' field
                                || (    Object.prototype.toString.call(thisResponse.data) !== "[object String]"         // OR its' TYPE is neither string
                                        && Object.prototype.toString.call(thisResponse.data) !== "[object Object]") ) { // nor Object
                            // console.log("response data not good")
                            // return null  
                            reject("response data not good")                                                                             // ..then it isn't valid
                        }
                    }
                }

                if (    !route.hasOwnProperty("currentResponse")                                        // IF route has no 'defaultResponse' field
                        || Object.prototype.toString.call(route.currentResponse) !==  "[object String]" // OR it's not a string
                        || route.currentResponse.length <= 0                                            // OR it is but it's empty
                        || Object.keys(route["responses"]).indexOf(route.currentResponse) == -1 ) {     // OR it's NOT in 'responses'
                    // console.log("currentResponse not good")
                    // return null                   
                    reject("currentResponse not good")                                                      // ..then it isn't valid
                }

            }

        }

        resolve(new EngineConfig(config))

    })

}

export function addRoute(configId: string, route: Route) {
    return new Promise( (resolve, reject) => {

        if (!Route.check(route)) {
            reject(`wrong Route type!!`)
        } else {
            let currentRoutes = store[configId].routes
            let routeFound: boolean = false
            for (let r of currentRoutes) {
                if (r.reqpath == route.reqpath && r.method == route.method) {
                    routeFound = true
                    break
                }
            }
            if (routeFound) {
                reject(`route '${route.method}' '${route.reqpath}' already exists`)
            } else {
                currentRoutes.push(route)
                resolve(configId)
            }
        }
    })
}

export function removeRoute(configId: string, reqpath: string, method: string) {
    return new Promise( (resolve, reject) =>{
        let routeIndex = findRoute(configId, reqpath, method)
        if (routeIndex !== null) {
            let config = getConfigById(configId)
            config.routes.splice(routeIndex, 1)
            resolve({configId:configId, reqpath:reqpath, method:method})
        } else {
            reject(`route '${method}' '${reqpath}' doesn't exists`)
        }
    })
}

export function addResponse(configId: string, reqpath: string, method: string, responseName: string, response: Response ) {
    return new Promise( (resolve, reject) => {
        let routeIndex = findRoute(configId, reqpath, method)
        if (routeIndex !== null) {
            let config = getConfigById(configId)
            let thisRoute = config.routes[routeIndex]
            if (thisRoute.responses.hasOwnProperty(responseName)) {
                reject(`route '${method}' '${reqpath}' already has a response named "${responseName}'`)
            } else {
                thisRoute.responses[responseName] = response
                resolve(configId)
            }

        } else {
            reject(`route '${method}' '${reqpath}' doesn't exists`)
        }
    })
}

export function changeResponse(configId: string, reqpath: string, method: string, currentResponse: string) {
    return new Promise( (resolve, reject) => {
        let routeIndex = findRoute(configId, reqpath, method)
        if (routeIndex !== null) {
            let config = getConfigById(configId)
            let thisRoute = config.routes[routeIndex]
            let thisCurrentResponse = thisRoute.currentResponse
            // if (thisRoute.responses.hasOwnProperty(responseName)) {
            //     reject(`route '${method}' '${reqpath}' already has a response named "${responseName}'`)
            // } else {
            //     thisRoute.responses[responseName] = response
            //     resolve(configId)
            // }
            // thisCurrentResponse = currentResponse
            store[configId].routes[routeIndex].currentResponse = currentResponse
            resolve(`currentResponse on "${configId} '${method}' '${reqpath}' changed to '${currentResponse}'`)
        } else {
            reject(`route '${method}' '${reqpath}' doesn't exists`)
        }
    })
}

function findRoute(configId: string, reqpath: string, method: string) {
    let routeIndex = null
    let config = getConfigById(configId)
    for (let r in config.routes) {
        if (config.routes[r].reqpath == reqpath && config.routes[r].method == method) {
            routeIndex = Number(r)
            break
        }
    }
    return routeIndex
}