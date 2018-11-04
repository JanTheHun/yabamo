type ALLOWED_METHODS = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "*all*"
const allowedMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "*all*"]

export class HeaderSettings {
    [key:string]: string | Object

    constructor(rawHeaders: any) {
        for (let header in rawHeaders) {
            this[header] = rawHeaders[header]
        }
    }

    static check(rawHeaders: any) {
        if (Object.prototype.toString.call(rawHeaders.type) === "[object Object]") {
            for (let header in rawHeaders) {
                if (    Object.prototype.toString.call(rawHeaders[header]) !== "[object Object]"
                        && Object.prototype.toString.call(rawHeaders[header]) !== "[object String]") {
                            console.log("\twrong header field")
                    return false
                }
                return true
            }
        } else {
            console.log("\twrong header")
            return false
        }
    }
}

export class Response {
    type: string
    data: string | Object
    header?: HeaderSettings

    constructor(rawResponse: any) {
        this.type = rawResponse.type
        this.data = rawResponse.data
        if (rawResponse.hasOwnProperty("header")) {
            this.header = rawResponse.header
        }
    }

    static check(rawResponse: any) {
        if (rawResponse.hasOwnProperty("type")) {
            if (Object.prototype.toString.call(rawResponse.type) !== "[object String]") {
                console.log(`wrong "type" field on Response`)
                return false
            }
        } else {
            console.log(`no "type" field on Response`)
            return false
        }
        if (rawResponse.hasOwnProperty("data")) {
            let dataType = Object.prototype.toString.call(rawResponse.data)
            if (dataType !== "[object String]" && dataType!== "[object Object]") {
                console.log(`wrong "data" field on Response`)
                return false
            }
        } else {
            console.log(`no "data" field on Response`)
            return false
        }
        if (rawResponse.hasOwnProperty("header")) {
            if (!HeaderSettings.check(rawResponse.header)) {
                console.log("wrong Header on Response: ", rawResponse)
                return false
            }
        }
        return true
    }
}

export class Route {
    reqpath: string
    method: ALLOWED_METHODS
    enabled?: boolean
    debug?: boolean
    currentResponse: string
    responses: {
        [key: string]: Response
    }

    constructor(rawRoute: any) {
        this.reqpath = rawRoute.reqpath
        this.method = rawRoute.method
        if (rawRoute.hasOwnProperty("enabled")) {
            this.enabled = rawRoute.enabled
        }
        if (rawRoute.hasOwnProperty("debug")) {
            this.debug = rawRoute.debug
        }
        this.currentResponse = rawRoute.currentResponse
        this.responses = rawRoute.responses
    }

    static check(rawRoute: any) {
        if (rawRoute.hasOwnProperty("reqpath")) {
            if (Object.prototype.toString.call(rawRoute.reqpath) !== "[object String]") {
                console.log(`wrong "reqpath" format on Route: `, rawRoute)
                return false
            }
        } else {
            console.log(`no "reqpath" on Route: `, rawRoute)
            return false
        }
        if (rawRoute.hasOwnProperty("method")) {
            if (Object.prototype.toString.call(rawRoute.method) !== "[object String]") {
                console.log(`wrong "method" format on Route: `, rawRoute)
                return false
            }
            if (allowedMethods.indexOf(rawRoute.method) === -1) {
                console.log(`wrong "method" value on Route: `, rawRoute)
                return false
            }
        } else {
            console.log(`no "method" on Route: `, rawRoute)
            return false
        }
        if (rawRoute.hasOwnProperty("enabled")) {
            if (typeof rawRoute.enabled !== typeof true) {
                console.log(`"enabled" is not boolean on Route: `, rawRoute)
                return false
            }
        }
        if (rawRoute.hasOwnProperty("debug")) {
            if (typeof rawRoute.debug !== typeof true) {
                console.log(`"debug" is not boolean on Route: `, rawRoute)
                return false
            }
        }       
        if (rawRoute.hasOwnProperty("currentResponse")) {
            if (Object.prototype.toString.call(rawRoute.currentResponse) !== "[object String]") {
                console.log(`wrong "currentResponse" format on Route: `, rawRoute)
                return false
            }
        } else {
            console.log(`no "currentResponse" on Route: `, rawRoute)
            return false
        } 
        if (rawRoute.hasOwnProperty("responses")) {
            if (Object.prototype.toString.call(rawRoute.responses) !== "[object Object]") {
                console.log(`wrong "responses" format on Route: `, rawRoute)
                return false
            }
            for (let response in rawRoute.responses) {
                if (Object.prototype.toString.call(response) !== "[object String]") {
                    console.log(`wrong response name format on Route: `, rawRoute)
                    return false
                }
                if (!Response.check(rawRoute.responses[response])) {
                    console.log(`wrong response type format on Route: `, rawRoute)
                    return false
                }
            }
        } else {
            console.log(`no "responses" on Route: `, rawRoute)
            return false
        } 
        return true     
    }
}

export class EngineConfig {
    port: number
    configName?: string
    routes: Route[]
    fallback: Response
    header?: HeaderSettings

    constructor(config: {
        port:number,
        configName: string,
        routes:Route[],
        fallback:Response
    }){
        this.port = config.port
        if (config.hasOwnProperty("configName")) {
            this.configName = config.configName
        }
        this.routes = config.routes
        this.fallback = config.fallback
    }
}

export class ServerInstance {
    port: number
    config: string
    server: any

    constructor(config: EngineConfig, configId:string, app: any) {
        this.port = config.port
        this.config = configId
        this.server = app
    }
}

export class AdminCommand {
    command: string
    constructor(
        command: string
    ) {
        this.command = command
    }

    static check(adminrequest: any) {

        let validCommands = [
            "addconfig",
            "removeconfig",
            "createengine",
            "startengine",
            "stopengine",
            "addroute",
            "removeroute",
            "changeresponse",
            "disableroute",
            "enableroute",
            "deleteengine",
            "addresponse",
            "removeresponse"
        ]

        if (!adminrequest.hasOwnProperty("command")
            || Object.prototype.toString.call(adminrequest["command"]) !== '[object String]'
            || validCommands.indexOf( adminrequest["command"].toLowerCase() ) === -1 ) {

            return false

        } else {

            return true
            
        }

    }
}