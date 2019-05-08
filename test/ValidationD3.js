"use strict";
var chai_1 = require("chai");
var Util_1 = require("../src/Util");
var InsightFacade_1 = require("../src/controller/InsightFacade");
var fs = require('fs');
var ifacade = new InsightFacade_1.default();
describe("EchoSpec", function () {
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
    it("Generic D3 test.", function () {
        var query3 = {
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
        return ifacade.performQuery(query3).then(function (response) {
            chai_1.expect(response.code).to.equal(200);
        }).catch(function (response) {
            chai_1.expect.fail();
        });
    });
    it("Generic D3 B test.", function () {
        var query4 = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture"
                ],
                "ORDER": "rooms_furniture"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_furniture"],
                "APPLY": []
            }
        };
        return ifacade.performQuery(query4).then(function (response) {
            chai_1.expect(response.code).to.equal(200);
        }).catch(function (response) {
            chai_1.expect.fail();
        });
    });
    it("empty group and empty apply. FAIL", function () {
        var query4 = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_furniture"
                ],
                "ORDER": "rooms_furniture"
            },
            "TRANSFORMATIONS": {
                "GROUP": [],
                "APPLY": []
            }
        };
        return ifacade.performQuery(query4).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.equal(400);
        });
    });
    it("newKey is not defined. fail", function () {
        var query3 = {
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
                    "rooms_shortname"
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
        return ifacade.performQuery(query3).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.equal(400);
        });
    });
    it("substitute group name item into order", function () {
        var query3 = {
            "WHERE": {
                "AND": [{
                        "IS": {
                            "rooms_furniture": "*Tables*"
                        }
                    }, {
                        "IS": {
                            "rooms_furniture": "*Tables*"
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
                    "keys": ["rooms_shortname"]
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
        return ifacade.performQuery(query3).then(function (response) {
            chai_1.expect(response.code).to.equal(200);
        }).catch(function (response) {
            chai_1.expect.fail();
        });
    });
    it("have extra valid group items", function () {
        var query3 = {
            "WHERE": {
                "AND": [{
                        "IS": {
                            "rooms_furniture": "*Tables*"
                        }
                    }, {
                        "IS": {
                            "rooms_furniture": "*Tables*"
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
                    "keys": ["rooms_shortname"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_fullname", "rooms_number"],
                "APPLY": [{
                        "maxSeats": {
                            "MAX": "rooms_seats"
                        }
                    }]
            }
        };
        return ifacade.performQuery(query3).then(function (response) {
            chai_1.expect(response.code).to.equal(200);
        }).catch(function (response) {
            chai_1.expect.fail();
        });
    });
    it("invalid order keyword doesnt exist in column. fail", function () {
        var query3 = {
            "WHERE": {
                "AND": [{
                        "IS": {
                            "rooms_furniture": "*Tables*"
                        }
                    }, {
                        "IS": {
                            "rooms_furniture": "*Tables*"
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
                    "keys": ["rooms_fullname"]
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
        return ifacade.performQuery(query3).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response.code).to.equal(400);
        });
    });
    it("Group with two keys and Apply MAX: Courses", function () {
        var query3 = {
            "WHERE": { "AND": [{ "GT": { "courses_pass": 300 } }] },
            "OPTIONS": {
                "COLUMNS": [
                    "maxPass",
                    "courses_title"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["maxPass"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_title"],
                "APPLY": [{
                        "maxPass": {
                            "MAX": "courses_pass"
                        }
                    }]
            }
        };
        return ifacade.performQuery(query3).then(function (response) {
            chai_1.expect(response.code).to.equal(200);
        }).catch(function (response) {
            chai_1.expect.fail();
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
//# sourceMappingURL=ValidationD3.js.map