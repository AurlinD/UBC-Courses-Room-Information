"use strict";
var restify = require("restify");
var Util_1 = require("../Util");
var InsightFacade_1 = require("../controller/InsightFacade");
var Server = (function () {
    function Server(port) {
        Util_1.default.info("Server::<init>( " + port + " )");
        this.port = port;
    }
    Server.prototype.stop = function () {
        Util_1.default.info('Server::close()');
        var that = this;
        return new Promise(function (fulfill) {
            that.rest.close(function () {
                fulfill(true);
            });
        });
    };
    Server.prototype.start = function () {
        var that = this;
        return new Promise(function (fulfill, reject) {
            try {
                Util_1.default.info('Server::start() - start');
                that.rest = restify.createServer({
                    name: 'insightUBC'
                });
                Server.insightFacade = new InsightFacade_1.default();
                that.rest.use(restify.bodyParser({ mapParams: true, mapFiles: true }));
                that.rest.use(function crossOrigin(req, res, next) {
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    return next();
                });
                that.rest.get('/', function (req, res, next) {
                    res.send(200);
                    return next();
                });
                that.rest.put('/dataset/:id', that.addDataSetServer);
                that.rest.post('/query', that.performQueryServer);
                that.rest.del('/dataset/:id', that.removeDataSetServer);
                that.rest.get('/echo/:msg', Server.echo);
                that.rest.listen(that.port, function () {
                    Util_1.default.info('Server::start() - restify listening: ' + that.rest.url);
                    fulfill(true);
                });
                that.rest.on('error', function (err) {
                    Util_1.default.info('Server::start() - restify ERROR: ' + err);
                    reject(err);
                });
            }
            catch (err) {
                Util_1.default.error('Server::start() - ERROR: ' + err);
                reject(err);
            }
        });
    };
    Server.prototype.addDataSetServer = function (req, res, next) {
        var dataContent = new Buffer(req.params.body).toString('base64');
        Server.insightFacade.addDataset(req.params.id, dataContent).then(function (response) {
            res.status(response.code);
            res.json(response.code, response.body);
        }).catch(function (response) {
            res.status(response.code);
            res.json(response.code, response.body);
        });
        return next();
    };
    Server.prototype.performQueryServer = function (req, res, next) {
        Server.insightFacade.performQuery(req.body).then(function (response) {
            res.status(response.code);
            res.json(response.code, response.body);
        }).catch(function (response) {
            res.status(response.code);
            res.json(response.code, response.body);
        });
        return next();
    };
    Server.prototype.removeDataSetServer = function (req, res, next) {
        Server.insightFacade.removeDataset(req.params.id).then(function (response) {
            res.status(response.code);
            res.json(response.code, response.body);
        }).catch(function (response) {
            res.status(response.code);
            res.json(response.code, response.body);
        });
        return next();
    };
    Server.echo = function (req, res, next) {
        Util_1.default.trace('Server::echo(..) - params: ' + JSON.stringify(req.params));
        try {
            var result = Server.performEcho(req.params.msg);
            res.json(result.code, result.body);
        }
        catch (err) {
            res.json(400, { error: err.message });
        }
        return next();
    };
    Server.performEcho = function (msg) {
        if (typeof msg !== 'undefined' && msg !== null) {
            return { code: 200, body: { message: msg + '...' + msg } };
        }
        else {
            return { code: 400, body: { error: 'Message not provided' } };
        }
    };
    return Server;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Server;
//# sourceMappingURL=Server.js.map