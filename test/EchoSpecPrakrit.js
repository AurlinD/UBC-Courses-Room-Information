"use strict";
var chai_1 = require("chai");
var Util_1 = require("../src/Util");
var InsightFacade_1 = require("../src/controller/InsightFacade");
var fs = require('fs');
var ifacade = new InsightFacade_1.default();
describe("EchoSpecPrakrit", function () {
    this.timeout(10000);
    function sanityCheck(response) {
        chai_1.expect(response).to.have.property('code');
        chai_1.expect(response).to.have.property('body');
        chai_1.expect(response.code).to.be.a('number');
    }
    before(function () {
        Util_1.default.test('Before: ' + this.test.parent.title);
    });
    beforeEach(function () {
        Util_1.default.test('BeforeTest: ' + this.currentTest.title);
    });
    after(function () {
        Util_1.default.test('After: ' + this.test.parent.title);
    });
    afterEach(function () {
        Util_1.default.test('AfterTest: ' + this.currentTest.title);
    });
    it("Should reject with a 424 when performing query for Courses without dataSet added", function () {
        var query4 = { "WHERE": { "IS": { "courses_instructor": "stone, ann" } }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_instructor"] } };
        return ifacade.performQuery(query4).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.equal(424);
            chai_1.expect(response.body).to.deep.equal({ "error": "no data found for this dataSet" });
        });
    });
    it("Should reject with a 424 when performing query for Rooms without dataSet added", function () {
        var query2 = { "WHERE": { "IS": { "rooms_name": "DMP_*" } }, "OPTIONS": { "COLUMNS": ["rooms_name"], "ORDER": "rooms_name" } };
        return ifacade.performQuery(query2).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.equal(424);
            chai_1.expect(response.body).to.deep.equal({ "error": "no data found for this dataSet" });
        });
    });
    it("Add Dataset Rooms", function () {
        var result = fs.readFileSync("test/rooms.zip", "base64");
        return ifacade.addDataset("rooms", result).then(function (response) {
            chai_1.expect(response.code).to.equal(204);
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail(err);
        });
    });
    it("Add Dataset Courses", function () {
        var result = fs.readFileSync("test/courses.zip", "base64");
        return ifacade.addDataset("courses", result).then(function (response) {
            chai_1.expect(response.code).to.equal(204);
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail(err);
        });
    });
    it("Perform Query complex validating AND GT EQ: JADE)", function () {
        var query2 = {
            "WHERE": { "AND": [{ "EQ": { "courses_year": 2016 } }, { "GT": { "courses_fail": 20 } }] },
            "OPTIONS": { "COLUMNS": ["courses_fail", "courses_avg", "courses_year"], "ORDER": "courses_avg" }
        };
        return ifacade.performQuery(query2).then(function (response) {
            chai_1.expect(response.code).to.equal(200);
            chai_1.expect(response.body).to.deep.equal({
                "result": [{
                        "courses_fail": 21,
                        "courses_avg": 54.01,
                        "courses_year": 2016
                    },
                    { "courses_fail": 38, "courses_avg": 59.59, "courses_year": 2016 },
                    {
                        "courses_fail": 21,
                        "courses_avg": 60.9,
                        "courses_year": 2016
                    },
                    { "courses_fail": 58, "courses_avg": 61.48, "courses_year": 2016 },
                    {
                        "courses_fail": 42,
                        "courses_avg": 62.34,
                        "courses_year": 2016
                    },
                    { "courses_fail": 48, "courses_avg": 63.44, "courses_year": 2016 }, {
                        "courses_fail": 23,
                        "courses_avg": 64.26,
                        "courses_year": 2016
                    },
                    { "courses_fail": 34, "courses_avg": 65.08, "courses_year": 2016 }, {
                        "courses_fail": 35,
                        "courses_avg": 65.85,
                        "courses_year": 2016
                    },
                    { "courses_fail": 28, "courses_avg": 66.53, "courses_year": 2016 }, {
                        "courses_fail": 30,
                        "courses_avg": 67.26,
                        "courses_year": 2016
                    },
                    { "courses_fail": 30, "courses_avg": 68.24, "courses_year": 2016 }, {
                        "courses_fail": 22,
                        "courses_avg": 68.67,
                        "courses_year": 2016
                    },
                    { "courses_fail": 23, "courses_avg": 68.69, "courses_year": 2016 }, {
                        "courses_fail": 24,
                        "courses_avg": 70.15,
                        "courses_year": 2016
                    },
                    { "courses_fail": 24, "courses_avg": 70.42, "courses_year": 2016 }, {
                        "courses_fail": 22,
                        "courses_avg": 70.93,
                        "courses_year": 2016
                    },
                    { "courses_fail": 26, "courses_avg": 71.21, "courses_year": 2016 }]
            });
        }).catch(function (response) {
            chai_1.expect.fail();
        });
    });
    it("Filter by courses_year)", function () {
        var query2 = {
            "WHERE": { "AND": [{ "GT": { "courses_year": 2014 } }, { "GT": { "courses_fail": 50 } }] },
            "OPTIONS": { "COLUMNS": ["courses_fail", "courses_avg", "courses_year"], "ORDER": "courses_year" }
        };
        return ifacade.performQuery(query2).then(function (response) {
            chai_1.expect(response.code).to.equal(200);
            chai_1.expect(response.body).to.deep.equal({ "result": [{ "courses_fail": 95, "courses_avg": 73.7, "courses_year": 2015 }, { "courses_fail": 59, "courses_avg": 63.97, "courses_year": 2015 }, { "courses_fail": 56, "courses_avg": 58.6, "courses_year": 2015 }, { "courses_fail": 60, "courses_avg": 56.2, "courses_year": 2015 }, { "courses_fail": 64, "courses_avg": 59.8, "courses_year": 2015 }, { "courses_fail": 58, "courses_avg": 61.48, "courses_year": 2016 }] });
        }).catch(function (response) {
            chai_1.expect.fail();
        });
    });
    it("RoomQueryValidation test)", function () {
        var query2 = { "WHERE": { "IS": { "rooms_name": "DMP_*" } }, "OPTIONS": { "COLUMNS": ["rooms_name"], "ORDER": "rooms_name" } };
        return ifacade.performQuery(query2).then(function (response) {
            chai_1.expect(response.body).to.deep.equal({
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
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail(err);
        });
    });
    it("Try Add Dataset again", function () {
        var result = fs.readFileSync("test/courses.zip", "base64");
        return ifacade.addDataset("courses", result).then(function (response) {
            chai_1.expect(response.code).to.equal(201);
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail(err);
        });
    });
    it("Try Add Dataset again for rooms", function () {
        var result = fs.readFileSync("test/rooms.zip", "base64");
        return ifacade.addDataset("rooms", result).then(function (response) {
            chai_1.expect(response.code).to.equal(201);
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail(err);
        });
    });
    it("Remove after queries", function () {
        return ifacade.removeDataset("courses").then(function (response) {
            chai_1.expect(response.code).to.equal(204);
        }).catch(function (err) {
            chai_1.expect.fail(err);
        });
    });
    it("Remove data set when nothing to remove should reject with 404", function () {
        return ifacade.removeDataset("courses").then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.equal(404);
        });
    });
    it("Remove rooms after queries", function () {
        return ifacade.removeDataset("rooms").then(function (response) {
            chai_1.expect(response.code).to.equal(204);
        }).catch(function (err) {
            chai_1.expect.fail(err);
        });
    });
    it("Remove data set rooms when nothing to remove should reject with 404", function () {
        return ifacade.removeDataset("rooms").then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.equal(404);
        });
    });
});
//# sourceMappingURL=EchoSpecPrakrit.js.map