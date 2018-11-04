import { readFileSync } from 'fs'

interface Arguments {
    admin?: number
    engine?: string
}

const configOptions: { [index: string] : { "check": Function } } = {
    "admin":{
        check: function(val: any) {
            if (!isNaN(val)) {
                if (val < 1024) {
                    console.log("port numbers below 1024 are not valid!")
                    return false
                } else  if (val > 65535) {
                    console.log("port numbers above 65535 are not valid!")
                    return false
                } else {
                    return true
                }
            } else {
                return false
            }
        }
    },
    "engine":{
        check: function(val: any) {
            if (typeof val == "string") {
                if (val.indexOf(".json") != -1) {
                    return true
                } else {
                    return false
                }
            } else {
                return false
            }
        }
    }
}

function matchConfigOptions(args: string[]) {

    let argsBk = []
    for (let a of args) {
        argsBk.push(a)
    }

    let argsObj: Arguments
    let optionsObj: any = {}
    let validArgs = []

    console.log("\n\tParsing arguments..\n")

    for (let optCnf of Object.keys(configOptions)) {    //  iterating through configOptions
        let opt = '--'.concat(optCnf)       //  check for "--<somecommand>" format

        if (    args.indexOf(opt) != -1                                             //  option found in args,
                && args.length > args.indexOf(opt) + 1                              //  there is a next argument,
                && configOptions[optCnf]["check"](args[args.indexOf(opt) + 1])) {      //  and it's type checks out

                    optionsObj[optCnf] = args[args.indexOf(opt) + 1]                    //  place it in optionsObj
                    validArgs.push(optCnf); validArgs.push(args[args.indexOf(opt) + 1]) //  place it in validArgs
                    // console.log("removing:",opt)
                    argsBk.splice(argsBk.indexOf(opt),1)
                    // console.log("removing:",args[args.indexOf(opt) + 1])
                    argsBk.splice(argsBk.indexOf( args[args.indexOf(opt) + 1]   ),1)
        }
    }

    if (argsBk.length > 0 ) {
        console.log("left:", argsBk)
    }
    
    argsObj = optionsObj
    return argsObj
}

export function readConfigFile(filepath: string) {

    let content: {
        config: string | null,
        error: string | null
    } = {
        config: null,
        error: null
    }

    try {

        let fileContent = JSON.parse(readFileSync('./'.concat(filepath), 'utf-8'))

        content.config = fileContent

    }

    catch(err) {

        content.error = err

    }

    return content
}

export function parseArgs() {
    let [a1,a2,...restArgs] = process.argv
    return matchConfigOptions(restArgs)
}