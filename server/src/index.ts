import { readConfigFile, parseArgs } from './modules/AppInit'
import { configChecker, AddConfigToStore, RemoveConfigFromStore } from './modules/ConfigStore'
import { EngineConfig } from './classes/AppTypes';
import { createEngineFromConfig, startEngineListening, stopEngineListening } from './modules/EngineStore'
import { startAdminInstance } from './modules/AdminRouter'

/*  parsing arguments       */

var config = parseArgs()
var adminRunning: boolean = false

/*      starting admin if port provided     */

if (config.admin) {

    startAdminInstance(config.admin)

    // console.log(`\n\t TODO: Running admin instance on: ${config.admin}\n`)

    adminRunning = true

} else {

    console.log("\n\tNo admin interface\n")

}

/*  starting engine if config file provided     */

if (config.engine) {

    let fileContent = readConfigFile(config.engine)

    if ( !fileContent.error ) {

        configChecker(fileContent.config)
            .then( (engine: any)=> {
                
                let newConfig: EngineConfig = engine
                AddConfigToStore(newConfig)
                    .then( configId => {
                        console.log(`Config '${configId}' added`)
                        if (!adminRunning) {
                            createEngineFromConfig(configId)
                                .then( (newEngineId:any) => {
                                    console.log(`Engine '${newEngineId}' created`)
                                    startEngineListening(newEngineId)
                                        .then( (engineId) => {
                                            console.log(`Engine '${engineId}' started`)
                                        })
                                        .catch( (error) => {
                                            console.log(`couldn't start engine '${newEngineId}', error: "${error}"`)
                                        })

                                })
                                .catch( (error) => {
                                    console.log(`couldn't create engine from '${configId}', error: "${error}"`)
                                })
                        }

                    }).catch( err => {
                        console.log("error adding config to configStore:", err)
                    })

            }).catch( err=> {
                console.log(`\t Invalid engine config: ${err}`)
            })
    } else {
        console.log(`\n\tCouldn't read config file, reason: "${fileContent.error}"`)
    }


} else {
    console.log("\n\n\tNo config provided\n\n")
}