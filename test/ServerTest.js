"use strict";
var Server_1 = require("../src/rest/Server");
var chai_1 = require("chai");
var chai = require('chai');
var Util_1 = require("../src/Util");
var fs = require("fs");
var chaiHttp = require("chai-http");
describe("Server Test", function () {
    this.timeout(10000);
    function sanityCheck(response) {
        chai_1.expect(response).to.have.property('code');
        chai_1.expect(response).to.have.property('body');
        chai_1.expect(response.code).to.be.a('number');
    }
    var server = null;
    var URL = 'http://127.0.0.1:4321';
    before(function () {
        Util_1.default.test('Before: ' + this.test.parent.title);
        server = new Server_1.default(4321);
        return server.start();
    });
    beforeEach(function () {
        Util_1.default.test('BeforeTest: ' + this.currentTest.title);
    });
    after(function () {
        Util_1.default.test('After: ' + this.test.parent.title);
        return server.stop();
    });
    afterEach(function () {
        Util_1.default.test('AfterTest: ' + this.currentTest.title);
    });
    it("PUT: AddDataSetRooms Test 204", function () {
        chai.use(chaiHttp);
        return chai.request(URL)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("test/rooms.zip"), "rooms.zip")
            .then(function (res) {
            chai_1.expect(res.status).to.be.equal(204);
        })
            .catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("PUT: AddDataSetRooms Test 201", function () {
        chai.use(chaiHttp);
        return chai.request(URL)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync("test/rooms.zip"), "rooms.zip")
            .then(function (res) {
            chai_1.expect(res.status).to.be.equal(201);
        })
            .catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("PUT: AddDataSetCourses Test 204", function () {
        chai.use(chaiHttp);
        return chai.request(URL)
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("test/courses.zip"), "courses.zip")
            .then(function (res) {
            chai_1.expect(res.status).to.be.equal(204);
        })
            .catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("PUT: AddDataSetCourses Test 201", function () {
        chai.use(chaiHttp);
        return chai.request(URL)
            .put('/dataset/courses')
            .attach("body", fs.readFileSync("test/courses.zip"), "courses.zip")
            .then(function (res) {
            chai_1.expect(res.status).to.be.equal(201);
        })
            .catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("POST: PerformQueryRooms Code:200", function () {
        var query = { "WHERE": { "IS": { "rooms_name": "DMP_*" } }, "OPTIONS": { "COLUMNS": ["rooms_name"], "ORDER": "rooms_name" } };
        return chai.request(URL)
            .post('/query')
            .send(query)
            .then(function (res) {
            chai_1.expect(res.status).to.be.equal(200);
            chai_1.expect(res.body).to.deep.equal({
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
            .catch(function (err) {
            chai_1.expect.fail(err);
        });
    });
    it("POST: PerformQueryCourses Code: 200", function () {
        var query = { "WHERE": { "GT": { "courses_avg": 97 } }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_avg"] } };
        return chai.request(URL)
            .post('/query')
            .send(query)
            .then(function (res) {
            chai_1.expect(res.status).to.be.equal(200);
            chai_1.expect(res.body).to.deep.equal({ "result": [{ "courses_dept": "cnps", "courses_avg": 99.19 }, { "courses_dept": "cnps", "courses_avg": 97.47 }, { "courses_dept": "cnps", "courses_avg": 97.47 }, { "courses_dept": "crwr", "courses_avg": 98 }, { "courses_dept": "crwr", "courses_avg": 98 }, { "courses_dept": "educ", "courses_avg": 97.5 }, { "courses_dept": "eece", "courses_avg": 98.75 }, { "courses_dept": "eece", "courses_avg": 98.75 }, { "courses_dept": "epse", "courses_avg": 98.08 }, { "courses_dept": "epse", "courses_avg": 98.7 }, { "courses_dept": "epse", "courses_avg": 98.36 }, { "courses_dept": "epse", "courses_avg": 97.29 }, { "courses_dept": "epse", "courses_avg": 97.29 }, { "courses_dept": "epse", "courses_avg": 98.8 }, { "courses_dept": "epse", "courses_avg": 97.41 }, { "courses_dept": "epse", "courses_avg": 98.58 }, { "courses_dept": "epse", "courses_avg": 98.58 }, { "courses_dept": "epse", "courses_avg": 98.76 }, { "courses_dept": "epse", "courses_avg": 98.76 }, { "courses_dept": "epse", "courses_avg": 98.45 }, { "courses_dept": "epse", "courses_avg": 98.45 }, { "courses_dept": "epse", "courses_avg": 97.78 }, { "courses_dept": "epse", "courses_avg": 97.41 }, { "courses_dept": "epse", "courses_avg": 97.69 }, { "courses_dept": "epse", "courses_avg": 97.09 }, { "courses_dept": "epse", "courses_avg": 97.09 }, { "courses_dept": "epse", "courses_avg": 97.67 }, { "courses_dept": "math", "courses_avg": 97.25 }, { "courses_dept": "math", "courses_avg": 97.25 }, { "courses_dept": "math", "courses_avg": 99.78 }, { "courses_dept": "math", "courses_avg": 99.78 }, { "courses_dept": "math", "courses_avg": 97.48 }, { "courses_dept": "math", "courses_avg": 97.48 }, { "courses_dept": "math", "courses_avg": 97.09 }, { "courses_dept": "math", "courses_avg": 97.09 }, { "courses_dept": "nurs", "courses_avg": 98.71 }, { "courses_dept": "nurs", "courses_avg": 98.71 }, { "courses_dept": "nurs", "courses_avg": 98.21 }, { "courses_dept": "nurs", "courses_avg": 98.21 }, { "courses_dept": "nurs", "courses_avg": 97.53 }, { "courses_dept": "nurs", "courses_avg": 97.53 }, { "courses_dept": "nurs", "courses_avg": 98.5 }, { "courses_dept": "nurs", "courses_avg": 98.5 }, { "courses_dept": "nurs", "courses_avg": 98.58 }, { "courses_dept": "nurs", "courses_avg": 98.58 }, { "courses_dept": "nurs", "courses_avg": 97.33 }, { "courses_dept": "nurs", "courses_avg": 97.33 }, { "courses_dept": "spph", "courses_avg": 98.98 }, { "courses_dept": "spph", "courses_avg": 98.98 }] });
        })
            .catch(function (err) {
            chai_1.expect.fail(err);
        });
    });
    it("POST: PerformQueryCourses Code: 400", function () {
        var query = { "WHERE": { "AND": [{ "IS": { "courses_dept": "bio*" } }, { "GT": { "courses_avg": 92 } }] }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_avg"], "ORDER": "courses_id" } };
        return chai.request(URL)
            .post('/query')
            .send(query)
            .then(function (res) {
            chai_1.expect.fail();
        })
            .catch(function (res) {
            chai_1.expect(res.status).to.be.equal(400);
        });
    });
    it("DELETE: RemoveDataSetRooms Test 204", function () {
        chai.use(chaiHttp);
        return chai.request(URL)
            .del('/dataset/rooms')
            .then(function (res) {
            chai_1.expect(res.status).to.be.equal(204);
        })
            .catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("DELETE: RemoveDataSetRooms Test 404", function () {
        chai.use(chaiHttp);
        return chai.request(URL)
            .del('/dataset/rooms')
            .then(function (res) {
            chai_1.expect.fail();
        })
            .catch(function (res) {
            chai_1.expect(res.status).to.be.equal(404);
        });
    });
    it("DELETE: RemoveDataSetCourses Test 204", function () {
        chai.use(chaiHttp);
        return chai.request(URL)
            .del('/dataset/courses')
            .then(function (res) {
            chai_1.expect(res.status).to.be.equal(204);
        })
            .catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("DELETE: RemoveDataSetCourses Test 404", function () {
        chai.use(chaiHttp);
        return chai.request(URL)
            .del('/dataset/courses')
            .then(function (res) {
            chai_1.expect.fail();
        })
            .catch(function (res) {
            chai_1.expect(res.status).to.be.equal(404);
        });
    });
});
//# sourceMappingURL=ServerTest.js.map