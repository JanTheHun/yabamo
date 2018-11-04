export default (req: any, res: any, next: Function) => {
    console.log(`\n***\ttime: ${new Date().toLocaleTimeString()}\n\t${req.method} -> "${req.path}" : ${req.connection.localPort}`)
    console.log(`\tdata: ${JSON.stringify(req.body)}`)
    next()
}