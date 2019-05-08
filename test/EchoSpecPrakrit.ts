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

describe("EchoSpecPrakrit", function () {
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


    //--------------------------------------------------------------------------------------------------------------------------------------

    //Peform query

    it ("Should reject with a 424 when performing query for Courses without dataSet added",function(){
        let query4 = {"WHERE":{"IS":{"courses_instructor":"stone, ann"}},"OPTIONS":{"COLUMNS":["courses_dept", "courses_instructor"]}};
        return ifacade.performQuery(query4).then(function(response: InsightResponse){
            expect.fail();
        }).catch(function (response:InsightResponse) {
            expect(response.code).to.equal(424);
            expect(response.body).to.deep.equal({"error": "no data found for this dataSet"});
        })
    });

    it ("Should reject with a 424 when performing query for Rooms without dataSet added",function(){
        let query2 = {"WHERE": {"IS": {"rooms_name": "DMP_*"}}, "OPTIONS": {"COLUMNS": ["rooms_name"], "ORDER": "rooms_name"}};
        return ifacade.performQuery(query2).then(function(response: InsightResponse){
            expect.fail();
        }).catch(function (response : InsightResponse) {
            expect(response.code).to.equal(424);
            expect(response.body).to.deep.equal({"error": "no data found for this dataSet"});
        })
    });

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

    //Peform query

    it ("Perform Query complex validating AND GT EQ: JADE)",function() {
        let query2 = {
            "WHERE": {"AND": [{"EQ":{"courses_year": 2016}},{"GT": {"courses_fail": 20}}]},
            "OPTIONS": {"COLUMNS": ["courses_fail", "courses_avg", "courses_year"], "ORDER": "courses_avg"}
        };

        return ifacade.performQuery(query2).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({
                "result": [{
                    "courses_fail": 21,
                    "courses_avg": 54.01,
                    "courses_year": 2016
                },
                    {"courses_fail": 38, "courses_avg": 59.59, "courses_year": 2016},
                    {
                    "courses_fail": 21,
                    "courses_avg": 60.9,
                    "courses_year": 2016
                },
                    {"courses_fail": 58, "courses_avg": 61.48, "courses_year": 2016},

                    {
                    "courses_fail": 42,
                    "courses_avg": 62.34,
                    "courses_year": 2016
                },
                    {"courses_fail": 48, "courses_avg": 63.44, "courses_year": 2016}, {
                    "courses_fail": 23,
                    "courses_avg": 64.26,
                    "courses_year": 2016
                },
                    {"courses_fail": 34, "courses_avg": 65.08, "courses_year": 2016}, {
                    "courses_fail": 35,
                    "courses_avg": 65.85,
                    "courses_year": 2016
                },
                    {"courses_fail": 28, "courses_avg": 66.53, "courses_year": 2016}, {
                    "courses_fail": 30,
                    "courses_avg": 67.26,
                    "courses_year": 2016
                },
                    {"courses_fail": 30, "courses_avg": 68.24, "courses_year": 2016}, {
                    "courses_fail": 22,
                    "courses_avg": 68.67,
                    "courses_year": 2016
                },
                    {"courses_fail": 23, "courses_avg": 68.69, "courses_year": 2016}, {
                    "courses_fail": 24,
                    "courses_avg": 70.15,
                    "courses_year": 2016
                },
                    {"courses_fail": 24, "courses_avg": 70.42, "courses_year": 2016}, {
                    "courses_fail": 22,
                    "courses_avg": 70.93,
                    "courses_year": 2016
                },
                    {"courses_fail": 26, "courses_avg": 71.21, "courses_year": 2016}]
            });
        }).catch(function (response: InsightResponse) {
            expect.fail();
        })
    });

    it ("Filter by courses_year)",function() {
        let query2 = {
            "WHERE": {"AND": [{"GT":{"courses_year": 2014}},{"GT": {"courses_fail": 50}}]},
            "OPTIONS": {"COLUMNS": ["courses_fail", "courses_avg", "courses_year"], "ORDER": "courses_year"}
        };

        return ifacade.performQuery(query2).then(function (response: InsightResponse) {
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"courses_fail":95,"courses_avg":73.7,"courses_year":2015},{"courses_fail":59,"courses_avg":63.97,"courses_year":2015},{"courses_fail":56,"courses_avg":58.6,"courses_year":2015},{"courses_fail":60,"courses_avg":56.2,"courses_year":2015},{"courses_fail":64,"courses_avg":59.8,"courses_year":2015},{"courses_fail":58,"courses_avg":61.48,"courses_year":2016}]});
        }).catch(function (response: InsightResponse) {
            expect.fail();
        })
    });



    //---------------------------Rooms Test-----------------------------------------


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


    // Add Data Set
    it ("Try Add Dataset again", function () {

        let result:string = fs.readFileSync("test/courses.zip","base64");
        return ifacade.addDataset("courses",result).then(function(response: InsightResponse){
            expect(response.code).to.equal(201);
            //expect(response.body).to.equal({"msg": "the operation was successful and the id was new (not added in this session or was previously cached)"});
        }).catch(function (err:any) {
            console.log(err);
            expect.fail(err);
        })
    });

    // Add Data Set
    it ("Try Add Dataset again for rooms", function () {

        let result:string = fs.readFileSync("test/rooms.zip","base64");
        return ifacade.addDataset("rooms",result).then(function(response: InsightResponse){
            expect(response.code).to.equal(201);
            //expect(response.body).to.equal({"msg": "the operation was successful and the id was new (not added in this session or was previously cached)"});
        }).catch(function (err:any) {
            console.log(err);
            expect.fail(err);
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
            //expect(response.body).to.equal({msg: "the operation was successful"});
        }).catch(function (response:InsightResponse) {
            expect(response.code).to.equal(404);
        })
    });

    //Remove DataSet after performing Query
    it ("Remove rooms after queries", function () {
        return ifacade.removeDataset("rooms").then(function(response: InsightResponse){
            expect(response.code).to.equal(204);
            //expect(response.body).to.equal({msg: "the operation was successful"});
        }).catch(function (err:any) {
            expect.fail(err);
        })
    });

    it ("Remove data set rooms when nothing to remove should reject with 404", function () {
        return ifacade.removeDataset("rooms").then(function(response: InsightResponse){
            expect.fail();
            //expect(response.body).to.equal({msg: "the operation was successful"});
        }).catch(function (response:InsightResponse) {
            expect(response.code).to.equal(404);
        })
    });



});
