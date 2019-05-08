/**
 * Created by rtholmes on 2016-10-31.
 */

import Server from "../src/rest/Server";
import {expect} from 'chai';
const chai = require('chai');
import Log from "../src/Util";
import {InsightResponse} from "../src/controller/IInsightFacade";
import * as fs from "fs";
import chaiHttp = require("chai-http");
import Response = ChaiHttp.Response;

describe("Server Test", function () {
    this.timeout(10000);


    function sanityCheck(response: InsightResponse) {
        expect(response).to.have.property('code');
        expect(response).to.have.property('body');
        expect(response.code).to.be.a('number');
    }

    let server:Server = null;
    let URL = 'http://127.0.0.1:4321';

    before(function () {
        Log.test('Before: ' + (<any>this).test.parent.title);
        server= new Server(4321);
        return server.start();

    });

    beforeEach(function () {
        Log.test('BeforeTest: ' + (<any>this).currentTest.title);

    });

    after(function () {
        Log.test('After: ' + (<any>this).test.parent.title);
        return server.stop();
    });

    afterEach(function () {
        Log.test('AfterTest: ' + (<any>this).currentTest.title);
    });

    it("PUT: AddDataSetRooms Test 204", function () {
        chai.use(chaiHttp);
        return chai.request(URL)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("test/rooms.zip"),"rooms.zip")
            .then(function (res: Response) {
                expect(res.status).to.be.equal(204);
            })
            .catch(function (err: any) {
                // some assertions
                expect.fail();
            });
    });

    it("PUT: AddDataSetRooms Test 201", function () {
        chai.use(chaiHttp);
        return chai.request(URL)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("test/rooms.zip"),"rooms.zip")
            .then(function (res: Response) {
                expect(res.status).to.be.equal(201);
            })
            .catch(function (err: any) {
                // some assertions
                expect.fail();
            });
    });

    it("PUT: AddDataSetCourses Test 204", function () {
        chai.use(chaiHttp);
        return chai.request(URL)
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("test/courses.zip"),"courses.zip")
            .then(function (res: Response) {
                expect(res.status).to.be.equal(204);
            })
            .catch(function (err: any) {
                // some assertions
                expect.fail();

            });
    });

    it("PUT: AddDataSetCourses Test 201", function () {
        chai.use(chaiHttp);
        return chai.request(URL)
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("test/courses.zip"),"courses.zip")
            .then(function (res: Response) {
                expect(res.status).to.be.equal(201);
            })
            .catch(function (err: any) {
                // some assertions
                expect.fail();

            });
    });

    it("POST: PerformQueryRooms Code:200", function () {
        let query = {"WHERE": {"IS": {"rooms_name": "DMP_*"}}, "OPTIONS": {"COLUMNS": ["rooms_name"], "ORDER": "rooms_name"}};
        return chai.request(URL)
            .post('/query')
            .send(query)
            .then(function (res: Response) {
                expect(res.status).to.be.equal(200);
                expect(res.body).to.deep.equal({
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
            })
            .catch(function (err:any) {
                expect.fail(err);
            });
    });

    it("POST: PerformQueryCourses Code: 200", function () {
        let query = {"WHERE":{"GT":{"courses_avg":97}},"OPTIONS":{"COLUMNS":["courses_dept","courses_avg"]}};
        return chai.request(URL)
            .post('/query')
            .send(query)
            .then(function (res: Response) {
                expect(res.status).to.be.equal(200);
                expect(res.body).to.deep.equal({"result":[{"courses_dept":"cnps","courses_avg":99.19},{"courses_dept":"cnps","courses_avg":97.47},{"courses_dept":"cnps","courses_avg":97.47},{"courses_dept":"crwr","courses_avg":98},{"courses_dept":"crwr","courses_avg":98},{"courses_dept":"educ","courses_avg":97.5},{"courses_dept":"eece","courses_avg":98.75},{"courses_dept":"eece","courses_avg":98.75},{"courses_dept":"epse","courses_avg":98.08},{"courses_dept":"epse","courses_avg":98.7},{"courses_dept":"epse","courses_avg":98.36},{"courses_dept":"epse","courses_avg":97.29},{"courses_dept":"epse","courses_avg":97.29},{"courses_dept":"epse","courses_avg":98.8},{"courses_dept":"epse","courses_avg":97.41},{"courses_dept":"epse","courses_avg":98.58},{"courses_dept":"epse","courses_avg":98.58},{"courses_dept":"epse","courses_avg":98.76},{"courses_dept":"epse","courses_avg":98.76},{"courses_dept":"epse","courses_avg":98.45},{"courses_dept":"epse","courses_avg":98.45},{"courses_dept":"epse","courses_avg":97.78},{"courses_dept":"epse","courses_avg":97.41},{"courses_dept":"epse","courses_avg":97.69},{"courses_dept":"epse","courses_avg":97.09},{"courses_dept":"epse","courses_avg":97.09},{"courses_dept":"epse","courses_avg":97.67},{"courses_dept":"math","courses_avg":97.25},{"courses_dept":"math","courses_avg":97.25},{"courses_dept":"math","courses_avg":99.78},{"courses_dept":"math","courses_avg":99.78},{"courses_dept":"math","courses_avg":97.48},{"courses_dept":"math","courses_avg":97.48},{"courses_dept":"math","courses_avg":97.09},{"courses_dept":"math","courses_avg":97.09},{"courses_dept":"nurs","courses_avg":98.71},{"courses_dept":"nurs","courses_avg":98.71},{"courses_dept":"nurs","courses_avg":98.21},{"courses_dept":"nurs","courses_avg":98.21},{"courses_dept":"nurs","courses_avg":97.53},{"courses_dept":"nurs","courses_avg":97.53},{"courses_dept":"nurs","courses_avg":98.5},{"courses_dept":"nurs","courses_avg":98.5},{"courses_dept":"nurs","courses_avg":98.58},{"courses_dept":"nurs","courses_avg":98.58},{"courses_dept":"nurs","courses_avg":97.33},{"courses_dept":"nurs","courses_avg":97.33},{"courses_dept":"spph","courses_avg":98.98},{"courses_dept":"spph","courses_avg":98.98}]});
            })
            .catch(function (err:any) {
                expect.fail(err);
            });
    });

    it("POST: PerformQueryCourses Code: 400", function () {
        let query = {"WHERE": {"AND": [{"IS": {"courses_dept": "bio*"}},{"GT": {"courses_avg": 92}}]},"OPTIONS": {"COLUMNS": ["courses_dept","courses_avg" ], "ORDER":"courses_id"}};
        return chai.request(URL)
            .post('/query')
            .send(query)
            .then(function (res: Response) {
                expect.fail();
            })
            .catch(function (res:Response) {
                expect(res.status).to.be.equal(400);

            });
    });

    it("DELETE: RemoveDataSetRooms Test 204", function () {
        chai.use(chaiHttp);
        return chai.request(URL)
            .del('/dataset/rooms')
            .then(function (res: Response) {
                expect(res.status).to.be.equal(204);
            })
            .catch(function (err: any) {
                // some assertions
                expect.fail();
            });
    });

    it("DELETE: RemoveDataSetRooms Test 404", function () {
        chai.use(chaiHttp);
        return chai.request(URL)
            .del('/dataset/rooms')
            .then(function (res: Response) {
                expect.fail();
            })
            .catch(function (res: Response) {
                expect(res.status).to.be.equal(404);
            });
    });

    it("DELETE: RemoveDataSetCourses Test 204", function () {
        chai.use(chaiHttp);
        return chai.request(URL)
            .del('/dataset/courses')
            .then(function (res: Response) {
                expect(res.status).to.be.equal(204);
            })
            .catch(function (err: any) {
                // some assertions
                expect.fail();
            });
    });

    it("DELETE: RemoveDataSetCourses Test 404", function () {
        chai.use(chaiHttp);
        return chai.request(URL)
            .del('/dataset/courses')
            .then(function (res: Response) {
                expect.fail();
            })
            .catch(function (res: Response) {
                expect(res.status).to.be.equal(404);
            });
    });






});