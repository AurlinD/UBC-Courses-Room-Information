/**
 * This is the REST entry point for the project.
 * Restify is configured here.
 */

import restify = require('restify');

import Log from "../Util";
import {InsightResponse} from "../controller/IInsightFacade";
import InsightFacade from "../controller/InsightFacade";

/**
 * This configures the REST endpoints for the server.
 */
export default class Server {

    private port: number;
    private rest: restify.Server;
    private static insightFacade:InsightFacade;

    constructor(port: number) {
        Log.info("Server::<init>( " + port + " )");
        this.port = port;
    }

    /**
     * Stops the server. Again returns a promise so we know when the connections have
     * actually been fully closed and the port has been released.
     *
     * @returns {Promise<boolean>}
     */
    public stop(): Promise<boolean> {
        Log.info('Server::close()');
        let that = this;
        return new Promise(function (fulfill) {
            that.rest.close(function () {
                fulfill(true);
            });
        });
    }

    /**
     * Starts the server. Returns a promise with a boolean value. Promises are used
     * here because starting the server takes some time and we want to know when it
     * is done (and if it worked).
     *
     * @returns {Promise<boolean>}
     */
    public start(): Promise<boolean> {
        let that = this;
        return new Promise(function (fulfill, reject) {
            try {
                Log.info('Server::start() - start');

                that.rest = restify.createServer({
                    name: 'insightUBC'
                });

                Server.insightFacade = new InsightFacade();

                //support request params body
                that.rest.use(restify.bodyParser({mapParams: true, mapFiles: true}));


                // support CORS
                that.rest.use(function crossOrigin(req, res, next) {
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    return next();
                });

                that.rest.get('/', function (req: restify.Request, res: restify.Response, next: restify.Next) {
                    res.send(200);
                    return next();
                });

                //Call Rest.put using dataset/:id which has a callBack function called addDataSetServer
                that.rest.put('/dataset/:id', that.addDataSetServer);

                //Call Rest.post using /query which has a callBack function called performQueryServer
                that.rest.post('/query',that.performQueryServer);

                //Call Rest.delete using dataset/:id which has a callBack function called removeDataServer
                that.rest.del('/dataset/:id',that.removeDataSetServer);

                // provides the echo service
                // curl -is  http://localhost:4321/echo/myMessage
                that.rest.get('/echo/:msg', Server.echo);

                // Other endpoints will go here
                that.rest.listen(that.port, function () {
                    Log.info('Server::start() - restify listening: ' + that.rest.url);
                    fulfill(true);
                });

                that.rest.on('error', function (err: string) {
                    // catches errors in restify start; unusual syntax due to internal node not using normal exceptions here
                    Log.info('Server::start() - restify ERROR: ' + err);
                    reject(err);
                });
            } catch (err) {
                Log.error('Server::start() - ERROR: ' + err);
                reject(err);
            }
        });
    }

    // Takes the id and Zip file contents from the REST request and calls addDataSet on the DataSet with that id
    public addDataSetServer(req: restify.Request, res: restify.Response, next: restify.Next){

        let dataContent = new Buffer(req.params.body).toString('base64');

        Server.insightFacade.addDataset(req.params.id,dataContent).then(function(response: InsightResponse){
            res.status(response.code);
            res.json(response.code,response.body);
        }).catch(function (response:InsightResponse) {
            res.status(response.code);
            res.json(response.code,response.body);
        });
        return next();
    }

    // Takes the query from the REST request and calls performs query returning the JSON response with the result of the query
    public performQueryServer(req: restify.Request, res: restify.Response, next: restify.Next){

        Server.insightFacade.performQuery(req.body).then(function(response: InsightResponse){
            res.status(response.code);
            res.json(response.code,response.body);
        }).catch(function (response:InsightResponse) {
            res.status(response.code);
            res.json(response.code,response.body);
        });
        return next();
    }

    // Takes the id the REST request and calls removeDataSet on the DataSet with that id
    public removeDataSetServer(req: restify.Request, res: restify.Response, next: restify.Next){

        Server.insightFacade.removeDataset(req.params.id).then(function(response: InsightResponse){
            res.status(response.code);
            res.json(response.code,response.body);
        }).catch(function (response:InsightResponse) {
            res.status(response.code);
            res.json(response.code,response.body);
        });
        return next();
    }

    // The next two methods handle the echo service.
    // These are almost certainly not the best place to put these, but are here for your reference.
    // By updating the Server.echo function pointer above, these methods can be easily moved.

    public static echo(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace('Server::echo(..) - params: ' + JSON.stringify(req.params));
        try {
            let result = Server.performEcho(req.params.msg);
            //Log.info('Server::echo(..) - responding ' + result.code);
            res.json(result.code, result.body);
        } catch (err) {
            //Log.error('Server::echo(..) - responding 400');
            res.json(400, {error: err.message});
        }
        return next();
    }

    public static performEcho(msg: string): InsightResponse {
        if (typeof msg !== 'undefined' && msg !== null) {
            return {code: 200, body: {message: msg + '...' + msg}};
        } else {
            return {code: 400, body: {error: 'Message not provided'}};
        }
    }

}