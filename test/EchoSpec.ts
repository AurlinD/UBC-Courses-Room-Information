/**
 * Created by rtholmes on 2016-10-31.
 */

import Server from "../src/rest/Server";
import {expect} from 'chai';
import Log from "../src/Util";
import chai = require('chai');
import chaiHttp = require('chai-http');
import Response = ChaiHttp.Response;
import restify = require('restify');
import {InsightResponse} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
var fs = require('fs');
let ifacade = new InsightFacade();

describe("EchoSpec", function () {
    this.timeout(10000);


    function sanityCheck(response: InsightResponse) {
        expect(response).to.have.property('code');
        expect(response).to.have.property('body');
        expect(response.code).to.be.a('number');
    }

    before(function () {
        Log.test('Before: ' + (<any>this).test.parent.title);

    });

    beforeEach(function () {
        Log.test('BeforeTest: ' + (<any>this).currentTest.title);
    });

    after(function () {
        Log.test('After: ' + (<any>this).test.parent.title);
    });

    afterEach(function () {
        Log.test('AfterTest: ' + (<any>this).currentTest.title);
    });

    //Provided Server Test
    it("Test Server", function() {
        // Init
        chai.use(chaiHttp);
        let server = new Server(4321);
        let URL = "http://127.0.0.1:4321";

        // Test
        expect(server).to.not.equal(undefined);
        try{
            Server.echo((<restify.Request>{}), null, null);
            expect.fail()
        } catch(err) {
            expect(err.message).to.equal("Cannot read property 'json' of null");
        }
        return server.start().then(function(success: boolean) {
            return chai.request(URL)
                .get("/")
        }).catch(function(err) {
            expect.fail()
        }).then(function(res: Response) {
            expect(res.status).to.be.equal(200);
            return chai.request(URL)
                .get("/echo/Hello")
        }).catch(function(err) {
            expect.fail()
        }).then(function(res: Response) {
            expect(res.status).to.be.equal(200);
            return server.start()
        }).then(function(success: boolean) {
            expect.fail();
        }).catch(function(err) {
            expect(err.code).to.equal('EADDRINUSE');
            return server.stop();
        }).catch(function(err) {
            expect.fail();
        });
    });

    it("Should be able to echo", function () {
        let out = Server.performEcho('echo');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({message: 'echo...echo'});
    });

    it("Should be able to echo silence", function () {
        let out = Server.performEcho('');
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(200);
        expect(out.body).to.deep.equal({message: '...'});
    });

    it("Should be able to handle a missing echo message sensibly", function () {
        let out = Server.performEcho(undefined);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.deep.equal({error: 'Message not provided'});
    });

    it("Should be able to handle a null echo message sensibly", function () {
        let out = Server.performEcho(null);
        Log.test(JSON.stringify(out));
        sanityCheck(out);
        expect(out.code).to.equal(400);
        expect(out.body).to.have.property('error');
        expect(out.body).to.deep.equal({error: 'Message not provided'});
    });
    //--------------------------------------------------------------------------------------------------------------------------------------

    // Add Data Set for Rooms

    it ("Add Dataset Rooms", function () {

        let result:string = fs.readFileSync("test/rooms.zip","base64");
        return ifacade.addDataset("rooms",result).then(function(response: InsightResponse){
            expect(response.code).to.equal(204);
            //expect(response.body).to.equal({"msg": "the operation was successful and the id was new (not added in this session or was previously cached)"});
        }).catch(function (err:any) {
            console.log(err);
            expect.fail(err);
        })
    });

    // Add Data Set
    it ("Try Add Dataset again for Rooms", function () {

        let result:string = fs.readFileSync("test/rooms.zip","base64");
        return ifacade.addDataset("rooms",result).then(function(response: InsightResponse){
            expect(response.code).to.equal(201);
            //expect(response.body).to.equal({"msg": "the operation was successful and the id was new (not added in this session or was previously cached)"});
        }).catch(function (err:any) {
            console.log(err);
            expect.fail(err);
        })
    });

    it ("RoomQueryValidation test)",function(){
        let query2 = {"WHERE": {"IS": {"rooms_name": "DMP_*"}}, "OPTIONS": {"COLUMNS": ["rooms_name"], "ORDER": "rooms_name"}};
        return ifacade.performQuery(query2).then(function(response: InsightResponse){
            expect(response.body).to.deep.equal({
                "result": [{
                    "rooms_name": "DMP_101"
                }, {
                    "rooms_name": "DMP_110"
                }, {
                    "rooms_name": "DMP_201"
                }, {
                    "rooms_name": "DMP_301"
                }, {
                    "rooms_name": "DMP_310"
                }]
            });
        }).catch(function (err : any) {
            console.log(err);
            expect.fail(err);
        })
    });

    // Add Data Set for Courses

    it ("Add Dataset Courses", function () {

        let result:string = fs.readFileSync("test/courses.zip","base64");
        return ifacade.addDataset("courses",result).then(function(response: InsightResponse){
            expect(response.code).to.equal(204);
            //expect(response.body).to.equal({"msg": "the operation was successful and the id was new (not added in this session or was previously cached)"});
        }).catch(function (err:any) {
            console.log(err);
            expect.fail(err);
        })
    });

    // Add Data Set
    it ("Try Add Dataset again for Courses", function () {

        let result:string = fs.readFileSync("test/courses.zip","base64");
        return ifacade.addDataset("courses",result).then(function(response: InsightResponse){
            expect(response.code).to.equal(201);
            //expect(response.body).to.equal({"msg": "the operation was successful and the id was new (not added in this session or was previously cached)"});
        }).catch(function (err:any) {
            console.log(err);
            expect.fail(err);
        })
    });

    //Peform query

    it ("Should be able to find sections taught by a specific person. --- Astro",function(){
        let query4 = {"WHERE":{"IS":{"courses_instructor":"stone, ann"}},"OPTIONS":{"COLUMNS":["courses_dept", "courses_instructor"]}};
        return ifacade.performQuery(query4).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            //expect(response.body).to.deep.equal({"result":[{"courses_dept":"bama","courses_instructor":"stone, ann"},{"courses_dept":"bama","courses_instructor":"stone, ann"},{"courses_dept":"bama","courses_instructor":"stone, ann"},{"courses_dept":"bama","courses_instructor":"stone, ann"},{"courses_dept":"bama","courses_instructor":"stone, ann"},{"courses_dept":"bama","courses_instructor":"stone, ann"},{"courses_dept":"bama","courses_instructor":"stone, ann"},{"courses_dept":"bama","courses_instructor":"stone, ann"},{"courses_dept":"bama","courses_instructor":"stone, ann"},{"courses_dept":"bama","courses_instructor":"stone, ann"},{"courses_dept":"bama","courses_instructor":"stone, ann"},{"courses_dept":"bama","courses_instructor":"stone, ann"},{"courses_dept":"bama","courses_instructor":"stone, ann"},{"courses_dept":"bama","courses_instructor":"stone, ann"},{"courses_dept":"busi","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"},{"courses_dept":"comm","courses_instructor":"stone, ann"}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    // Perform query
    it ("Should be able to find sections with lots of auditors and EQ --- Bongo and Hades",function(){
        let query5 = {"WHERE":{"EQ":{"courses_audit":20}},"OPTIONS":{"COLUMNS":["courses_dept", "courses_instructor"]}};
        return ifacade.performQuery(query5).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"courses_dept":"rhsc","courses_instructor":""}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    // Perform query
    it ("Colusa: Should be able to find sections with high averages",function(){
        let query6 = {"WHERE":{"GT":{"courses_avg":97}},"OPTIONS":{"COLUMNS":["courses_dept", "courses_title", "courses_avg"],"ORDER":"courses_avg"}};
        return ifacade.performQuery(query6).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            //expect(response.body).to.deep.equal({"result":[{"courses_dept":"epse","courses_title":"cor des ed res","courses_avg":97.09},{"courses_dept":"math","courses_title":"harmonic anal i","courses_avg":97.09},{"courses_dept":"math","courses_title":"harmonic anal i","courses_avg":97.09},{"courses_dept":"epse","courses_title":"cor des ed res","courses_avg":97.09},{"courses_dept":"math","courses_title":"diff geometry i","courses_avg":97.25},{"courses_dept":"math","courses_title":"diff geometry i","courses_avg":97.25},{"courses_dept":"epse","courses_title":"assess lrn diffi","courses_avg":97.29},{"courses_dept":"epse","courses_title":"assess lrn diffi","courses_avg":97.29},{"courses_dept":"nurs","courses_title":"eth&profl issues","courses_avg":97.33},{"courses_dept":"nurs","courses_title":"eth&profl issues","courses_avg":97.33},{"courses_dept":"epse","courses_title":"educ stds autism","courses_avg":97.41},{"courses_dept":"epse","courses_title":"acad assess schl","courses_avg":97.41},{"courses_dept":"cnps","courses_title":"career planning","courses_avg":97.47},{"courses_dept":"cnps","courses_title":"career planning","courses_avg":97.47},{"courses_dept":"math","courses_title":"algb geometry i","courses_avg":97.48},{"courses_dept":"math","courses_title":"algb geometry i","courses_avg":97.48},{"courses_dept":"educ","courses_title":"res mthd in educ","courses_avg":97.5},{"courses_dept":"nurs","courses_title":"fam nrs pract","courses_avg":97.53},{"courses_dept":"nurs","courses_title":"fam nrs pract","courses_avg":97.53},{"courses_dept":"epse","courses_title":"coll&uni teachng","courses_avg":97.67},{"courses_dept":"epse","courses_title":"sem in autism","courses_avg":97.69},{"courses_dept":"epse","courses_title":"acad assess schl","courses_avg":97.78},{"courses_dept":"crwr","courses_title":"thesis","courses_avg":98},{"courses_dept":"crwr","courses_title":"thesis","courses_avg":98},{"courses_dept":"epse","courses_title":"assess lrn diffi","courses_avg":98.08},{"courses_dept":"nurs","courses_title":"cl pro prim care","courses_avg":98.21},{"courses_dept":"nurs","courses_title":"cl pro prim care","courses_avg":98.21},{"courses_dept":"epse","courses_title":"assess lrn diffi","courses_avg":98.36},{"courses_dept":"epse","courses_title":"dev el sk df&hrd","courses_avg":98.45},{"courses_dept":"epse","courses_title":"dev el sk df&hrd","courses_avg":98.45},{"courses_dept":"nurs","courses_title":"fam nrs pract","courses_avg":98.5},{"courses_dept":"nurs","courses_title":"fam nrs pract","courses_avg":98.5},{"courses_dept":"epse","courses_title":"educ stds autism","courses_avg":98.58},{"courses_dept":"nurs","courses_title":"fam nrs pract","courses_avg":98.58},{"courses_dept":"nurs","courses_title":"fam nrs pract","courses_avg":98.58},{"courses_dept":"epse","courses_title":"educ stds autism","courses_avg":98.58},{"courses_dept":"epse","courses_title":"assess lrn diffi","courses_avg":98.7},{"courses_dept":"nurs","courses_title":"cl pro prim care","courses_avg":98.71},{"courses_dept":"nurs","courses_title":"cl pro prim care","courses_avg":98.71},{"courses_dept":"eece","courses_title":"multimedia sys","courses_avg":98.75},{"courses_dept":"eece","courses_title":"multimedia sys","courses_avg":98.75},{"courses_dept":"epse","courses_title":"educ stds autism","courses_avg":98.76},{"courses_dept":"epse","courses_title":"educ stds autism","courses_avg":98.76},{"courses_dept":"epse","courses_title":"educ stds autism","courses_avg":98.8},{"courses_dept":"spph","courses_title":"work int health","courses_avg":98.98},{"courses_dept":"spph","courses_title":"work int health","courses_avg":98.98},{"courses_dept":"cnps","courses_title":"career planning","courses_avg":99.19},{"courses_dept":"math","courses_title":"algb topology i","courses_avg":99.78},{"courses_dept":"math","courses_title":"algb topology i","courses_avg":99.78}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    // Perform query
    it("Should be able to find course average for a course. --- Camelot)",function(){
        let queryA = {"WHERE":{"IS":{"courses_title":"comp eng design"}},"OPTIONS":{"COLUMNS":["courses_avg"],"ORDER":"courses_avg"}};
        return ifacade.performQuery(queryA).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"courses_avg":66.45},{"courses_avg":66.45},{"courses_avg":67.69},{"courses_avg":68.32},{"courses_avg":68.6},{"courses_avg":68.86},{"courses_avg":70.04},{"courses_avg":70.56},{"courses_avg":71.85},{"courses_avg":72.03},{"courses_avg":72.08},{"courses_avg":72.14},{"courses_avg":72.29},{"courses_avg":72.58},{"courses_avg":72.6},{"courses_avg":72.82},{"courses_avg":72.87},{"courses_avg":72.99},{"courses_avg":73.2},{"courses_avg":73.25},{"courses_avg":73.39},{"courses_avg":73.5},{"courses_avg":73.59},{"courses_avg":73.7},{"courses_avg":73.83},{"courses_avg":74.02},{"courses_avg":74.05},{"courses_avg":74.32},{"courses_avg":74.36},{"courses_avg":74.38},{"courses_avg":74.65},{"courses_avg":74.68},{"courses_avg":74.96},{"courses_avg":74.96},{"courses_avg":75.43},{"courses_avg":75.46},{"courses_avg":75.51},{"courses_avg":75.63},{"courses_avg":75.95},{"courses_avg":76.08},{"courses_avg":76.08},{"courses_avg":76.25},{"courses_avg":76.31},{"courses_avg":76.34},{"courses_avg":76.34},{"courses_avg":76.52},{"courses_avg":76.89},{"courses_avg":77.2},{"courses_avg":77.39},{"courses_avg":77.39},{"courses_avg":77.55},{"courses_avg":78.13},{"courses_avg":78.49},{"courses_avg":78.52},{"courses_avg":78.52},{"courses_avg":79.43},{"courses_avg":80.42},{"courses_avg":80.42},{"courses_avg":80.86},{"courses_avg":80.86}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    //Perform query
    it ("should be able to validate GT with number and Order: IronGate)",function(){
        let queryB = {"WHERE":{"GT":{"courses_avg":97}},"OPTIONS":{"COLUMNS":["courses_dept","courses_avg"],"ORDER":"courses_avg"}};
        return ifacade.performQuery(queryB).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{ courses_dept: 'math', courses_avg: 97.09 },
                { courses_dept: 'math', courses_avg: 97.09 },
                { courses_dept: 'epse', courses_avg: 97.09 },
                { courses_dept: 'epse', courses_avg: 97.09 },
                { courses_dept: 'math', courses_avg: 97.25 },
                { courses_dept: 'math', courses_avg: 97.25 },
                { courses_dept: 'epse', courses_avg: 97.29 },
                { courses_dept: 'epse', courses_avg: 97.29 },
                { courses_dept: 'nurs', courses_avg: 97.33 },
                { courses_dept: 'nurs', courses_avg: 97.33 },
                { courses_dept: 'epse', courses_avg: 97.41 },
                { courses_dept: 'epse', courses_avg: 97.41 },
                { courses_dept: 'cnps', courses_avg: 97.47 },
                { courses_dept: 'cnps', courses_avg: 97.47 },
                { courses_dept: 'math', courses_avg: 97.48 },
                { courses_dept: 'math', courses_avg: 97.48 },
                { courses_dept: 'educ', courses_avg: 97.5 },
                { courses_dept: 'nurs', courses_avg: 97.53 },
                { courses_dept: 'nurs', courses_avg: 97.53 },
                { courses_dept: 'epse', courses_avg: 97.67 },
                { courses_dept: 'epse', courses_avg: 97.69 },
                { courses_dept: 'epse', courses_avg: 97.78 },
                { courses_dept: 'crwr', courses_avg: 98 },
                { courses_dept: 'crwr', courses_avg: 98 },
                { courses_dept: 'epse', courses_avg: 98.08 },
                { courses_dept: 'nurs', courses_avg: 98.21 },
                { courses_dept: 'nurs', courses_avg: 98.21 },
                { courses_dept: 'epse', courses_avg: 98.36 },
                { courses_dept: 'epse', courses_avg: 98.45 },
                { courses_dept: 'epse', courses_avg: 98.45 },
                { courses_dept: 'nurs', courses_avg: 98.5 },
                { courses_dept: 'nurs', courses_avg: 98.5 },
                { courses_dept: 'epse', courses_avg: 98.58 },
                { courses_dept: 'epse', courses_avg: 98.58 },
                { courses_dept: 'nurs', courses_avg: 98.58 },
                { courses_dept: 'nurs', courses_avg: 98.58 },
                { courses_dept: 'epse', courses_avg: 98.7 },
                { courses_dept: 'nurs', courses_avg: 98.71 },
                { courses_dept: 'nurs', courses_avg: 98.71 },
                { courses_dept: 'eece', courses_avg: 98.75 },
                { courses_dept: 'eece', courses_avg: 98.75 },
                { courses_dept: 'epse', courses_avg: 98.76 },
                { courses_dept: 'epse', courses_avg: 98.76 },
                { courses_dept: 'epse', courses_avg: 98.8 },
                { courses_dept: 'spph', courses_avg: 98.98 },
                { courses_dept: 'spph', courses_avg: 98.98 },
                { courses_dept: 'cnps', courses_avg: 99.19 },
                { courses_dept: 'math', courses_avg: 99.78 },
                { courses_dept: 'math', courses_avg: 99.78 } ]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    //Perform query

    it ("Perform Query should be able to validate a valid Query when given one GT",function(){
        let queryC = {"WHERE":{"GT":{"courses_avg":97}},"OPTIONS":{"COLUMNS":["courses_dept","courses_avg"]}};
        return ifacade.performQuery(queryC).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"courses_dept":"cnps","courses_avg":99.19},{"courses_dept":"cnps","courses_avg":97.47},{"courses_dept":"cnps","courses_avg":97.47},{"courses_dept":"crwr","courses_avg":98},{"courses_dept":"crwr","courses_avg":98},{"courses_dept":"educ","courses_avg":97.5},{"courses_dept":"eece","courses_avg":98.75},{"courses_dept":"eece","courses_avg":98.75},{"courses_dept":"epse","courses_avg":98.08},{"courses_dept":"epse","courses_avg":98.7},{"courses_dept":"epse","courses_avg":98.36},{"courses_dept":"epse","courses_avg":97.29},{"courses_dept":"epse","courses_avg":97.29},{"courses_dept":"epse","courses_avg":98.8},{"courses_dept":"epse","courses_avg":97.41},{"courses_dept":"epse","courses_avg":98.58},{"courses_dept":"epse","courses_avg":98.58},{"courses_dept":"epse","courses_avg":98.76},{"courses_dept":"epse","courses_avg":98.76},{"courses_dept":"epse","courses_avg":98.45},{"courses_dept":"epse","courses_avg":98.45},{"courses_dept":"epse","courses_avg":97.78},{"courses_dept":"epse","courses_avg":97.41},{"courses_dept":"epse","courses_avg":97.69},{"courses_dept":"epse","courses_avg":97.09},{"courses_dept":"epse","courses_avg":97.09},{"courses_dept":"epse","courses_avg":97.67},{"courses_dept":"math","courses_avg":97.25},{"courses_dept":"math","courses_avg":97.25},{"courses_dept":"math","courses_avg":99.78},{"courses_dept":"math","courses_avg":99.78},{"courses_dept":"math","courses_avg":97.48},{"courses_dept":"math","courses_avg":97.48},{"courses_dept":"math","courses_avg":97.09},{"courses_dept":"math","courses_avg":97.09},{"courses_dept":"nurs","courses_avg":98.71},{"courses_dept":"nurs","courses_avg":98.71},{"courses_dept":"nurs","courses_avg":98.21},{"courses_dept":"nurs","courses_avg":98.21},{"courses_dept":"nurs","courses_avg":97.53},{"courses_dept":"nurs","courses_avg":97.53},{"courses_dept":"nurs","courses_avg":98.5},{"courses_dept":"nurs","courses_avg":98.5},{"courses_dept":"nurs","courses_avg":98.58},{"courses_dept":"nurs","courses_avg":98.58},{"courses_dept":"nurs","courses_avg":97.33},{"courses_dept":"nurs","courses_avg":97.33},{"courses_dept":"spph","courses_avg":98.98},{"courses_dept":"spph","courses_avg":98.98}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    // Perform query

    it("Simple OR with LogicComparision GT GT: IVORY)",function(){
        let query3 = {"WHERE":{"OR":[{"GT":{"courses_avg":99.19}},{"GT":{"courses_fail":210}}]},"OPTIONS":{"COLUMNS":["courses_fail","courses_avg"],"ORDER":"courses_fail"}};

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"courses_fail":0,"courses_avg":99.78},{"courses_fail":0,"courses_avg":99.78},{"courses_fail":213,"courses_avg":63.33},{"courses_fail":221,"courses_avg":67.24},{"courses_fail":222,"courses_avg":65.38},{"courses_fail":226,"courses_avg":64.94},{"courses_fail":230,"courses_avg":68.77},{"courses_fail":235,"courses_avg":70.22},{"courses_fail":250,"courses_avg":69.3},{"courses_fail":251,"courses_avg":69.41},{"courses_fail":260,"courses_avg":68.77},{"courses_fail":264,"courses_avg":68.72},{"courses_fail":266,"courses_avg":67.42},{"courses_fail":287,"courses_avg":68.2}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });


    // Perform query

    it ("Complicated query with LogicComparision OR GT IS)",function(){
        let query3 = {"WHERE":{"OR":[{"GT":{"courses_avg":97}},{"IS":{"courses_uuid":"4217"}}]},"OPTIONS":{"COLUMNS":["courses_dept","courses_avg"],"ORDER":"courses_dept"}};

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"courses_dept":"apsc","courses_avg":75.43},{"courses_dept":"cnps","courses_avg":97.47},{"courses_dept":"cnps","courses_avg":97.47},{"courses_dept":"cnps","courses_avg":99.19},{"courses_dept":"crwr","courses_avg":98},{"courses_dept":"crwr","courses_avg":98},{"courses_dept":"educ","courses_avg":97.5},{"courses_dept":"eece","courses_avg":98.75},{"courses_dept":"eece","courses_avg":98.75},{"courses_dept":"epse","courses_avg":98.08},{"courses_dept":"epse","courses_avg":98.7},{"courses_dept":"epse","courses_avg":98.36},{"courses_dept":"epse","courses_avg":97.29},{"courses_dept":"epse","courses_avg":97.29},{"courses_dept":"epse","courses_avg":98.8},{"courses_dept":"epse","courses_avg":97.41},{"courses_dept":"epse","courses_avg":98.58},{"courses_dept":"epse","courses_avg":98.58},{"courses_dept":"epse","courses_avg":98.76},{"courses_dept":"epse","courses_avg":98.76},{"courses_dept":"epse","courses_avg":98.45},{"courses_dept":"epse","courses_avg":98.45},{"courses_dept":"epse","courses_avg":97.78},{"courses_dept":"epse","courses_avg":97.41},{"courses_dept":"epse","courses_avg":97.69},{"courses_dept":"epse","courses_avg":97.09},{"courses_dept":"epse","courses_avg":97.09},{"courses_dept":"epse","courses_avg":97.67},{"courses_dept":"math","courses_avg":97.25},{"courses_dept":"math","courses_avg":99.78},{"courses_dept":"math","courses_avg":99.78},{"courses_dept":"math","courses_avg":97.48},{"courses_dept":"math","courses_avg":97.48},{"courses_dept":"math","courses_avg":97.09},{"courses_dept":"math","courses_avg":97.09},{"courses_dept":"math","courses_avg":97.25},{"courses_dept":"nurs","courses_avg":98.71},{"courses_dept":"nurs","courses_avg":98.71},{"courses_dept":"nurs","courses_avg":98.21},{"courses_dept":"nurs","courses_avg":98.21},{"courses_dept":"nurs","courses_avg":97.53},{"courses_dept":"nurs","courses_avg":97.53},{"courses_dept":"nurs","courses_avg":98.5},{"courses_dept":"nurs","courses_avg":98.5},{"courses_dept":"nurs","courses_avg":98.58},{"courses_dept":"nurs","courses_avg":98.58},{"courses_dept":"nurs","courses_avg":97.33},{"courses_dept":"nurs","courses_avg":97.33},{"courses_dept":"spph","courses_avg":98.98},{"courses_dept":"spph","courses_avg":98.98}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    //Perform query

    it ("Perform Query complex validating AND GT EQ: JADE)",function(){
        let query2 = {"WHERE":{"AND":[{"EQ":{"courses_avg":76}},{"GT":{"courses_fail":4}}]},"OPTIONS":{"COLUMNS":["courses_fail","courses_avg"],"ORDER":"courses_fail"}};

        return ifacade.performQuery(query2).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"courses_fail":5,"courses_avg":76},{"courses_fail":6,"courses_avg":76},{"courses_fail":16,"courses_avg":76}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    //Perform query

    it ("Perform Query complex validating partial strings: Fireball)",function(){
        let query2 = {"WHERE": {"AND": [{"IS": {"courses_dept": "bio*"}},{"GT": {"courses_avg": 92}}]},"OPTIONS": {"COLUMNS": ["courses_dept","courses_avg" ], "ORDER":"courses_avg"}};

        return ifacade.performQuery(query2).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"courses_dept":"biol","courses_avg":92.1},{"courses_dept":"biol","courses_avg":92.1},{"courses_dept":"biol","courses_avg":92.19},{"courses_dept":"biol","courses_avg":92.19},{"courses_dept":"biof","courses_avg":92.33},{"courses_dept":"biof","courses_avg":92.33},{"courses_dept":"biol","courses_avg":92.36},{"courses_dept":"biol","courses_avg":92.36},{"courses_dept":"biof","courses_avg":93.45},{"courses_dept":"biof","courses_avg":93.45},{"courses_dept":"biol","courses_avg":94.33},{"courses_dept":"biol","courses_avg":94.33}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it ("Perform Query for invalid order)",function(){
        let query2 = {"WHERE": {"AND": [{"IS": {"courses_dept": "bio*"}},{"GT": {"courses_avg": 92}}]},"OPTIONS": {"COLUMNS": ["courses_dept","courses_avg" ], "ORDER":"courses_id"}};

        return ifacade.performQuery(query2).then(function(response: InsightResponse){
            expect.fail();
        }).catch(function (response:InsightResponse) {
            expect(response.code).to.equal(400);
        })
    });

    it ("Perform Query complex validating partial strings: Firefly)",function(){
        let query2 = {"WHERE": {"AND": [{"IS": {"courses_dept": "*ol"}},{"GT": {"courses_avg": 92}}]},"OPTIONS": {"COLUMNS": ["courses_dept","courses_avg" ], "ORDER":"courses_avg"}};

        return ifacade.performQuery(query2).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"courses_dept":"biol","courses_avg":92.1},{"courses_dept":"biol","courses_avg":92.1},{"courses_dept":"zool","courses_avg":92.1},{"courses_dept":"zool","courses_avg":92.1},{"courses_dept":"biol","courses_avg":92.19},{"courses_dept":"biol","courses_avg":92.19},{"courses_dept":"biol","courses_avg":92.36},{"courses_dept":"biol","courses_avg":92.36},{"courses_dept":"zool","courses_avg":92.71},{"courses_dept":"zool","courses_avg":92.71},{"courses_dept":"biol","courses_avg":94.33},{"courses_dept":"biol","courses_avg":94.33}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it ("Perform Query complex validating partial strings: Fester)",function(){
        let query2 = {"WHERE": {"AND": [{"IS": {"courses_dept": "*oo*"}},{"GT": {"courses_avg": 92}}]},"OPTIONS": {"COLUMNS": ["courses_dept","courses_avg" ], "ORDER":"courses_avg"}};

        return ifacade.performQuery(query2).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"courses_dept":"zool","courses_avg":92.1},{"courses_dept":"zool","courses_avg":92.1},{"courses_dept":"zool","courses_avg":92.71},{"courses_dept":"zool","courses_avg":92.71}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    //Perform query

    it ("Perform Query complex validating NOT NOT EQ: INDIGO)",function(){
        let query2 = { "WHERE":{"NOT": {"NOT":{"EQ": {"courses_avg":60}}}},"OPTIONS":{"COLUMNS":["courses_dept","courses_avg","courses_id"],"ORDER":"courses_avg"}};

        return ifacade.performQuery(query2).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"courses_dept":"dhyg","courses_avg":60,"courses_id":"405"},{"courses_dept":"busi","courses_avg":60,"courses_id":"441"},{"courses_dept":"chem","courses_avg":60,"courses_id":"417"},{"courses_dept":"chem","courses_avg":60,"courses_id":"417"},{"courses_dept":"dhyg","courses_avg":60,"courses_id":"110"},{"courses_dept":"dhyg","courses_avg":60,"courses_id":"401"},{"courses_dept":"busi","courses_avg":60,"courses_id":"444"},{"courses_dept":"dhyg","courses_avg":60,"courses_id":"405"},{"courses_dept":"hist","courses_avg":60,"courses_id":"432"},{"courses_dept":"phar","courses_avg":60,"courses_id":"303"},{"courses_dept":"phil","courses_avg":60,"courses_id":"120"},{"courses_dept":"test","courses_avg":60,"courses_id":"100"}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    //Perform query

    it ("Should be able to find all sections in a dept not taught by a specific person: Fire STORM)",function(){
        let query2 = {"WHERE":{"AND":[{"IS":{"courses_dept":"math"}},{"NOT":{"IS":{"courses_instructor": ""}}},{"GT":{"courses_avg": 95}}]},"OPTIONS":{"COLUMNS":["courses_dept","courses_instructor"],"ORDER":"courses_instructor"}};

        return ifacade.performQuery(query2).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"courses_dept":"math","courses_instructor":"fraser, ailana"},{"courses_dept":"math","courses_instructor":"gomez, jose"},{"courses_dept":"math","courses_instructor":"gordon, julia yulia"},{"courses_dept":"math","courses_instructor":"karu, kalle"},{"courses_dept":"math","courses_instructor":"karu, kalle"},{"courses_dept":"math","courses_instructor":"laba, izabella"},{"courses_dept":"math","courses_instructor":"murugan, mathav"},{"courses_dept":"math","courses_instructor":"nachmias, asaf"},{"courses_dept":"math","courses_instructor":"wei, juncheng"}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });


    //Perform query

    it ("Perform Query should reject empty AND: Lorax)",function(){
        let query2:any = {"WHERE":{"AND":[]},"OPTIONS":{"COLUMNS":["courses_dept","courses_avg"]}};

        return ifacade.performQuery(query2).then(function(response: InsightResponse){
            expect.fail();
        }).catch(function (response:InsightResponse) {
            expect(response.code).to.equal(400);
        })
    });

    //Perform query

    it ("Perform Query should reject empty OR: Lorax)",function(){
        let query2:any = {"WHERE":{"OR":[]},"OPTIONS":{"COLUMNS":["courses_dept","courses_avg"]}};

        return ifacade.performQuery(query2).then(function(response: InsightResponse){
            expect.fail();
        }).catch(function (response:InsightResponse) {
            expect(response.code).to.equal(400);
        })
    });

    //---------------------------Rooms Test-----------------------------------------

    it ("Generic Query Test A",function(){
        let query2 = {"WHERE": {"IS": {"rooms_name": "DMP_*"}}, "OPTIONS": {"COLUMNS": ["rooms_name"], "ORDER": "rooms_name"}};

        return ifacade.performQuery(query2).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result": [{"rooms_name": "DMP_101"}, {"rooms_name": "DMP_110"}, {"rooms_name": "DMP_201"}, {"rooms_name": "DMP_301"}, {"rooms_name": "DMP_310"}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it ("Generic Query Test B",function(){
        let query2 = {"WHERE": {"IS": {"rooms_address": "*Agrono*"}}, "OPTIONS": {"COLUMNS": ["rooms_address", "rooms_name"]}};

        return ifacade.performQuery(query2).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({
                "result": [{
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_4074"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_4068"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_4058"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_4018"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_4004"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_3074"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_3068"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_3058"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_3018"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_3004"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_1001"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_4072"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_4062"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_4052"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_4016"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_4002"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_3072"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_3062"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_3052"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_3016"
                }, {
                    "rooms_address": "6363 Agronomy Road",
                    "rooms_name": "ORCH_3002"
                }, {
                    "rooms_address": "6245 Agronomy Road V6T 1Z4",
                    "rooms_name": "DMP_310"
                }, {
                    "rooms_address": "6245 Agronomy Road V6T 1Z4",
                    "rooms_name": "DMP_201"
                }, {
                    "rooms_address": "6245 Agronomy Road V6T 1Z4",
                    "rooms_name": "DMP_101"
                }, {
                    "rooms_address": "6245 Agronomy Road V6T 1Z4",
                    "rooms_name": "DMP_301"
                }, {
                    "rooms_address": "6245 Agronomy Road V6T 1Z4",
                    "rooms_name": "DMP_110"
                }]
            });
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it ("Canary: Should be able to query with AND",function(){
        let query2 = {"WHERE": {"AND": [{"IS": {"rooms_name": "DMP_*"}},{"GT": {"rooms_seats": 150}}]}, "OPTIONS": {"COLUMNS": ["rooms_name"], "ORDER": "rooms_name"}};

        return ifacade.performQuery(query2).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result": [{"rooms_name": "DMP_310"}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it ("Canary: Should be able to query with OR",function(){
        let query2 = {"WHERE": {"OR": [{"IS": {"rooms_name": "DMP_*"}},{"rooms_name": "CHBE_*"}]}, "OPTIONS": {"COLUMNS": ["rooms_name"], "ORDER": "rooms_name"}};

        return ifacade.performQuery(query2).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result": [{"rooms_name": "CHBE_101"},{"rooms_name": "CHBE_102"},{"rooms_name": "CHBE_103"},{"rooms_name": "DMP_101"}, {"rooms_name": "DMP_110"}, {"rooms_name": "DMP_201"}, {"rooms_name": "DMP_301"}, {"rooms_name": "DMP_310"}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it ("Argon: Should be able to find rooms in a specific building",function(){
        let query3 = {"WHERE": {"IS": {"rooms_fullname": "Hugh Dempster Pavilion"}}, "OPTIONS": {"COLUMNS": ["rooms_name"], "ORDER" : "rooms_name"}};

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result": [{"rooms_name": "DMP_101"}, {"rooms_name": "DMP_110"}, {"rooms_name": "DMP_201"}, {"rooms_name": "DMP_301"}, {"rooms_name": "DMP_310"}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });



    it ("Boron: Should be able to find rooms with plenty of seats in a building.",function(){
        let query3 = {"WHERE": {"AND": [{"IS": {"rooms_shortname": "DMP"}},{"GT": {"rooms_seats": 60}}]}, "OPTIONS": {"COLUMNS": ["rooms_name"], "ORDER": "rooms_name"}};

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result": [{"rooms_name": "DMP_110"}, {"rooms_name": "DMP_301"}, {"rooms_name": "DMP_310"}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it ("Moonshine: Should be able to find some small rooms on campus.",function(){
        let query3 = {"WHERE": {"IS": {"rooms_type": "Small Group"}}, "OPTIONS": {"COLUMNS": ["rooms_name"], "ORDER" : "rooms_name"}};

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"rooms_name":"ANGU_232"},{"rooms_name":"ANGU_292"},{"rooms_name":"ANGU_332"},{"rooms_name":"ANGU_339"},{"rooms_name":"ANSO_202"},{"rooms_name":"ANSO_203"},{"rooms_name":"ANSO_205"},{"rooms_name":"AUDX_142"},{"rooms_name":"AUDX_157"},{"rooms_name":"BIOL_1503"},{"rooms_name":"BIOL_2519"},{"rooms_name":"BUCH_B216"},{"rooms_name":"BUCH_B302"},{"rooms_name":"BUCH_B304"},{"rooms_name":"BUCH_B306"},{"rooms_name":"BUCH_B307"},{"rooms_name":"BUCH_B308"},{"rooms_name":"BUCH_B310"},{"rooms_name":"BUCH_B312"},{"rooms_name":"BUCH_B316"},{"rooms_name":"BUCH_B319"},{"rooms_name":"BUCH_D205"},{"rooms_name":"BUCH_D207"},{"rooms_name":"BUCH_D209"},{"rooms_name":"BUCH_D213"},{"rooms_name":"BUCH_D214"},{"rooms_name":"BUCH_D216"},{"rooms_name":"BUCH_D221"},{"rooms_name":"BUCH_D228"},{"rooms_name":"BUCH_D229"},{"rooms_name":"BUCH_D304"},{"rooms_name":"BUCH_D306"},{"rooms_name":"BUCH_D307"},{"rooms_name":"BUCH_D313"},{"rooms_name":"BUCH_D315"},{"rooms_name":"BUCH_D319"},{"rooms_name":"BUCH_D323"},{"rooms_name":"BUCH_D325"},{"rooms_name":"CEME_1206"},{"rooms_name":"CEME_1210"},{"rooms_name":"DMP_101"},{"rooms_name":"DMP_201"},{"rooms_name":"FNH_20"},{"rooms_name":"FNH_30"},{"rooms_name":"FNH_320"},{"rooms_name":"FORW_317"},{"rooms_name":"FORW_519"},{"rooms_name":"FSC_1002"},{"rooms_name":"FSC_1402"},{"rooms_name":"FSC_1611"},{"rooms_name":"FSC_1613"},{"rooms_name":"FSC_1615"},{"rooms_name":"FSC_1617"},{"rooms_name":"GEOG_214"},{"rooms_name":"GEOG_242"},{"rooms_name":"HENN_301"},{"rooms_name":"HENN_302"},{"rooms_name":"HENN_304"},{"rooms_name":"IBLC_156"},{"rooms_name":"IBLC_157"},{"rooms_name":"IBLC_158"},{"rooms_name":"IBLC_185"},{"rooms_name":"IBLC_191"},{"rooms_name":"IBLC_192"},{"rooms_name":"IBLC_193"},{"rooms_name":"IBLC_194"},{"rooms_name":"IBLC_195"},{"rooms_name":"IBLC_263"},{"rooms_name":"IBLC_264"},{"rooms_name":"IBLC_265"},{"rooms_name":"IBLC_266"},{"rooms_name":"IBLC_460"},{"rooms_name":"IBLC_461"},{"rooms_name":"LASR_211"},{"rooms_name":"LASR_5C"},{"rooms_name":"MATH_102"},{"rooms_name":"MATH_202"},{"rooms_name":"MATH_225"},{"rooms_name":"MCLD_220"},{"rooms_name":"MCML_256"},{"rooms_name":"MCML_260"},{"rooms_name":"MCML_358"},{"rooms_name":"MCML_360A"},{"rooms_name":"MCML_360B"},{"rooms_name":"MCML_360C"},{"rooms_name":"MCML_360D"},{"rooms_name":"MCML_360E"},{"rooms_name":"MCML_360F"},{"rooms_name":"MCML_360G"},{"rooms_name":"MCML_360H"},{"rooms_name":"MCML_360J"},{"rooms_name":"MCML_360K"},{"rooms_name":"MCML_360L"},{"rooms_name":"MCML_360M"},{"rooms_name":"OSBO_203A"},{"rooms_name":"OSBO_203B"},{"rooms_name":"PCOH_1008"},{"rooms_name":"PCOH_1009"},{"rooms_name":"PCOH_1011"},{"rooms_name":"PCOH_1215"},{"rooms_name":"PCOH_1302"},{"rooms_name":"PHRM_3112"},{"rooms_name":"PHRM_3114"},{"rooms_name":"PHRM_3115"},{"rooms_name":"PHRM_3116"},{"rooms_name":"PHRM_3118"},{"rooms_name":"PHRM_3120"},{"rooms_name":"PHRM_3122"},{"rooms_name":"PHRM_3124"},{"rooms_name":"SCRF_1003"},{"rooms_name":"SCRF_1004"},{"rooms_name":"SCRF_1005"},{"rooms_name":"SCRF_1020"},{"rooms_name":"SCRF_1021"},{"rooms_name":"SCRF_1022"},{"rooms_name":"SCRF_1023"},{"rooms_name":"SCRF_1024"},{"rooms_name":"SCRF_1328"},{"rooms_name":"SCRF_200"},{"rooms_name":"SCRF_201"},{"rooms_name":"SCRF_202"},{"rooms_name":"SCRF_203"},{"rooms_name":"SCRF_204"},{"rooms_name":"SCRF_204A"},{"rooms_name":"SCRF_205"},{"rooms_name":"SCRF_206"},{"rooms_name":"SCRF_207"},{"rooms_name":"SCRF_208"},{"rooms_name":"SCRF_209"},{"rooms_name":"SCRF_210"},{"rooms_name":"SOWK_122"},{"rooms_name":"SOWK_324"},{"rooms_name":"SOWK_326"},{"rooms_name":"SPPH_143"},{"rooms_name":"SPPH_B108"},{"rooms_name":"SPPH_B112"},{"rooms_name":"SPPH_B136"},{"rooms_name":"SPPH_B138"},{"rooms_name":"SWNG_106"},{"rooms_name":"SWNG_108"},{"rooms_name":"SWNG_110"},{"rooms_name":"SWNG_306"},{"rooms_name":"SWNG_308"},{"rooms_name":"SWNG_310"},{"rooms_name":"SWNG_406"},{"rooms_name":"SWNG_408"},{"rooms_name":"SWNG_410"},{"rooms_name":"UCLL_101"},{"rooms_name":"WOOD_B75"},{"rooms_name":"WOOD_B79"},{"rooms_name":"WOOD_G41"},{"rooms_name":"WOOD_G44"},{"rooms_name":"WOOD_G53"},{"rooms_name":"WOOD_G55"},{"rooms_name":"WOOD_G57"},{"rooms_name":"WOOD_G59"},{"rooms_name":"WOOD_G65"},{"rooms_name":"WOOD_G66"}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it ("Nautilus: Should be able to find all rooms of a certain type.",function(){
        let query3 = {"WHERE": {"IS": {"rooms_type": "Tiered Large Group"}}, "OPTIONS": {"COLUMNS": ["rooms_name"], "ORDER" : "rooms_name"}};

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"rooms_name":"AERL_120"},{"rooms_name":"ANGU_098"},{"rooms_name":"ANGU_241"},{"rooms_name":"ANGU_243"},{"rooms_name":"ANGU_343"},{"rooms_name":"ANGU_345"},{"rooms_name":"ANGU_347"},{"rooms_name":"ANGU_350"},{"rooms_name":"ANGU_354"},{"rooms_name":"BIOL_2000"},{"rooms_name":"BIOL_2200"},{"rooms_name":"BRKX_2365"},{"rooms_name":"BUCH_A101"},{"rooms_name":"BUCH_A102"},{"rooms_name":"BUCH_A103"},{"rooms_name":"BUCH_A104"},{"rooms_name":"BUCH_A201"},{"rooms_name":"BUCH_B313"},{"rooms_name":"BUCH_B315"},{"rooms_name":"BUCH_D217"},{"rooms_name":"BUCH_D218"},{"rooms_name":"BUCH_D219"},{"rooms_name":"CEME_1202"},{"rooms_name":"CHBE_101"},{"rooms_name":"CHBE_102"},{"rooms_name":"CHEM_B150"},{"rooms_name":"CHEM_B250"},{"rooms_name":"CHEM_C124"},{"rooms_name":"CHEM_C126"},{"rooms_name":"CHEM_D200"},{"rooms_name":"CHEM_D300"},{"rooms_name":"CIRS_1250"},{"rooms_name":"DMP_110"},{"rooms_name":"DMP_301"},{"rooms_name":"DMP_310"},{"rooms_name":"ESB_1012"},{"rooms_name":"ESB_1013"},{"rooms_name":"ESB_2012"},{"rooms_name":"FNH_60"},{"rooms_name":"FRDM_153"},{"rooms_name":"FSC_1005"},{"rooms_name":"FSC_1221"},{"rooms_name":"GEOG_100"},{"rooms_name":"HEBB_100"},{"rooms_name":"HENN_200"},{"rooms_name":"HENN_201"},{"rooms_name":"HENN_202"},{"rooms_name":"IBLC_182"},{"rooms_name":"LASR_102"},{"rooms_name":"LASR_104"},{"rooms_name":"LSC_1001"},{"rooms_name":"LSC_1002"},{"rooms_name":"LSC_1003"},{"rooms_name":"LSK_200"},{"rooms_name":"LSK_201"},{"rooms_name":"MATH_100"},{"rooms_name":"MATX_1100"},{"rooms_name":"MCLD_202"},{"rooms_name":"MCLD_228"},{"rooms_name":"MCML_158"},{"rooms_name":"MCML_166"},{"rooms_name":"PHRM_1101"},{"rooms_name":"PHRM_1201"},{"rooms_name":"SCRF_100"},{"rooms_name":"SWNG_121"},{"rooms_name":"SWNG_122"},{"rooms_name":"SWNG_221"},{"rooms_name":"SWNG_222"},{"rooms_name":"WESB_100"},{"rooms_name":"WESB_201"},{"rooms_name":"WOOD_1"},{"rooms_name":"WOOD_2"},{"rooms_name":"WOOD_3"},{"rooms_name":"WOOD_4"},{"rooms_name":"WOOD_5"},{"rooms_name":"WOOD_6"}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it ("Nitro: Should be able to find all rooms with a certain type of furniture.",function(){
        let query3 = {"WHERE": {"IS": {"rooms_type": "Tiered Large Group"}}, "OPTIONS": {"COLUMNS": ["rooms_name"], "ORDER" : "rooms_name"}};

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"rooms_name":"BUCH_B209"},{"rooms_name":"BUCH_B210"},{"rooms_name":"BUCH_B211"},{"rooms_name":"BUCH_B218"},{"rooms_name":"BUCH_B302"},{"rooms_name":"BUCH_B303"},{"rooms_name":"BUCH_B304"},{"rooms_name":"BUCH_B306"},{"rooms_name":"BUCH_B307"},{"rooms_name":"BUCH_B308"},{"rooms_name":"BUCH_B309"},{"rooms_name":"BUCH_B310"},{"rooms_name":"BUCH_D213"},{"rooms_name":"BUCH_D301"},{"rooms_name":"BUCH_D304"},{"rooms_name":"BUCH_D307"},{"rooms_name":"BUCH_D312"},{"rooms_name":"BUCH_D313"},{"rooms_name":"BUCH_D314"},{"rooms_name":"BUCH_D316"},{"rooms_name":"BUCH_D317"},{"rooms_name":"BUCH_D322"},{"rooms_name":"FNH_20"},{"rooms_name":"FNH_320"},{"rooms_name":"FNH_40"},{"rooms_name":"FNH_50"},{"rooms_name":"IBLC_461"},{"rooms_name":"LASR_107"},{"rooms_name":"MATH_105"},{"rooms_name":"MATH_202"},{"rooms_name":"MATH_204"},{"rooms_name":"MATH_225"},{"rooms_name":"MGYM_206"},{"rooms_name":"MGYM_208"},{"rooms_name":"ORCH_3062"},{"rooms_name":"ORCH_3068"},{"rooms_name":"ORCH_3072"},{"rooms_name":"OSBO_203B"},{"rooms_name":"PCOH_1008"},{"rooms_name":"SOWK_124"},{"rooms_name":"SOWK_222"},{"rooms_name":"SOWK_223"},{"rooms_name":"SOWK_224"},{"rooms_name":"WOOD_B79"}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it ("Generic D3 test.", function(){
        let query3 = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 300
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        };

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({
                "result": [{
                    "rooms_shortname": "OSBO",
                    "maxSeats": 442
                }, {
                    "rooms_shortname": "HEBB",
                    "maxSeats": 375
                }, {
                    "rooms_shortname": "LSC",
                    "maxSeats": 350
                }]
            });
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });




    //Remove DataSet after performing Query
    it ("Remove after queries", function () {
        return ifacade.removeDataset("courses").then(function(response: InsightResponse){
            expect(response.code).to.equal(204);
            //expect(response.body).to.equal({msg: "the operation was successful"});
        }).catch(function (err:any) {
            expect.fail(err);
        })
    });

    it ("Remove data set when nothing to remove should reject with 404", function () {
        return ifacade.removeDataset("courses").then(function(response: InsightResponse){
            expect.fail();
        }).catch(function (response:InsightResponse) {
            expect(response.code).to.equal(404);
        })
    });

    //Remove DataSet after performing Query
    it ("Remove rooms after queries", function () {
        return ifacade.removeDataset("rooms").then(function(response: InsightResponse){
            expect(response.code).to.equal(204);
        }).catch(function (err:any) {
            expect.fail(err);
        })
    });

    it ("Remove data set rooms when nothing to remove should reject with 404", function () {
        return ifacade.removeDataset("rooms").then(function(response: InsightResponse){
            expect.fail();
        }).catch(function (response:InsightResponse) {
            expect(response.code).to.equal(404);
        })
    });



});
