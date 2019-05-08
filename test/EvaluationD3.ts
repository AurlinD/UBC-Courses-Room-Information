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

describe("Evaluation Test", function () {
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
        }).catch(function (err:any) {
            console.log(err);
            expect.fail(err);
        })
    });

    it("Group with two keys and Apply MAX", function(){
        let query3 = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 100
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "rooms_type",
                    "maxSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats","rooms_shortname"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname","rooms_type"],
                "APPLY": [{
                    "maxSeats": {
                        "MAX": "rooms_seats"
                    }
                }]
            }
        };
        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"rooms_shortname":"OSBO","rooms_type":"Open Design General Purpose","maxSeats":442},{"rooms_shortname":"HEBB","rooms_type":"Tiered Large Group","maxSeats":375},{"rooms_shortname":"LSC","rooms_type":"Tiered Large Group","maxSeats":350},{"rooms_shortname":"SRC","rooms_type":"TBD","maxSeats":299},{"rooms_shortname":"ANGU","rooms_type":"Tiered Large Group","maxSeats":260},{"rooms_shortname":"PHRM","rooms_type":"Tiered Large Group","maxSeats":236},{"rooms_shortname":"LSK","rooms_type":"Tiered Large Group","maxSeats":205},{"rooms_shortname":"CHBE","rooms_type":"Tiered Large Group","maxSeats":200},{"rooms_shortname":"SWNG","rooms_type":"Tiered Large Group","maxSeats":190},{"rooms_shortname":"FRDM","rooms_type":"Tiered Large Group","maxSeats":160},{"rooms_shortname":"DMP","rooms_type":"Tiered Large Group","maxSeats":160},{"rooms_shortname":"IBLC","rooms_type":"Tiered Large Group","maxSeats":154},{"rooms_shortname":"MCLD","rooms_type":"Tiered Large Group","maxSeats":136},{"rooms_shortname":"WOOD","rooms_type":"Tiered Large Group","maxSeats":120},{"rooms_shortname":"IBLC","rooms_type":"Open Design General Purpose","maxSeats":112},{"rooms_shortname":"BUCH","rooms_type":"Case Style","maxSeats":108}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it("Two APPLY keys MAX and AVG", function(){
        let query3 = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 100
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "rooms_type",
                    "maxSeats",
                    "avgSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats","rooms_shortname"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname","rooms_type"],
                "APPLY": [
                    {
                        "maxSeats": {
                            "MAX": "rooms_seats"
                        }
                    },
                    {
                        "avgSeats": {
                            "AVG": "rooms_seats"
                        }
                    }
                ]
            }
        };
        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"rooms_shortname":"OSBO","rooms_type":"Open Design General Purpose","maxSeats":442,"avgSeats":442},{"rooms_shortname":"HEBB","rooms_type":"Tiered Large Group","maxSeats":375,"avgSeats":375},{"rooms_shortname":"LSC","rooms_type":"Tiered Large Group","maxSeats":350,"avgSeats":275},{"rooms_shortname":"SRC","rooms_type":"TBD","maxSeats":299,"avgSeats":299},{"rooms_shortname":"ANGU","rooms_type":"Tiered Large Group","maxSeats":260,"avgSeats":260},{"rooms_shortname":"PHRM","rooms_type":"Tiered Large Group","maxSeats":236,"avgSeats":201.5},{"rooms_shortname":"LSK","rooms_type":"Tiered Large Group","maxSeats":205,"avgSeats":194},{"rooms_shortname":"CHBE","rooms_type":"Tiered Large Group","maxSeats":200,"avgSeats":200},{"rooms_shortname":"SWNG","rooms_type":"Tiered Large Group","maxSeats":190,"avgSeats":188.75},{"rooms_shortname":"FRDM","rooms_type":"Tiered Large Group","maxSeats":160,"avgSeats":160},{"rooms_shortname":"DMP","rooms_type":"Tiered Large Group","maxSeats":160,"avgSeats":140},{"rooms_shortname":"IBLC","rooms_type":"Tiered Large Group","maxSeats":154,"avgSeats":154},{"rooms_shortname":"MCLD","rooms_type":"Tiered Large Group","maxSeats":136,"avgSeats":129.5},{"rooms_shortname":"WOOD","rooms_type":"Tiered Large Group","maxSeats":120,"avgSeats":120},{"rooms_shortname":"IBLC","rooms_type":"Open Design General Purpose","maxSeats":112,"avgSeats":112},{"rooms_shortname":"BUCH","rooms_type":"Case Style","maxSeats":108,"avgSeats":108}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });


    it("FIVE APPLY keys MAX, AVG, MIN, SUM, COUNT", function(){
        let query3 = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 100
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "rooms_type",
                    "maxSeats",
                    "avgSeats",
                    "minSeats",
                    "sumSeats",
                    "countSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats","rooms_shortname"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname","rooms_type"],
                "APPLY": [
                    {
                        "maxSeats": {
                            "MAX": "rooms_seats"
                        }
                    },
                    {
                        "avgSeats": {
                            "AVG": "rooms_seats"
                        }
                    },
                    {
                        "minSeats": {
                            "MIN": "rooms_seats"
                        }
                    },
                    {
                        "sumSeats": {
                            "SUM": "rooms_seats"
                        }
                    },
                    {
                        "countSeats": {
                            "COUNT": "rooms_seats"
                        }
                    }
                ]
            }
        };

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"rooms_shortname":"OSBO","rooms_type":"Open Design General Purpose","maxSeats":442,"avgSeats":442,"minSeats":442,"sumSeats":442,"countSeats":1},{"rooms_shortname":"HEBB","rooms_type":"Tiered Large Group","maxSeats":375,"avgSeats":375,"minSeats":375,"sumSeats":375,"countSeats":1},{"rooms_shortname":"LSC","rooms_type":"Tiered Large Group","maxSeats":350,"avgSeats":275,"minSeats":125,"sumSeats":825,"countSeats":2},{"rooms_shortname":"SRC","rooms_type":"TBD","maxSeats":299,"avgSeats":299,"minSeats":299,"sumSeats":897,"countSeats":1},{"rooms_shortname":"ANGU","rooms_type":"Tiered Large Group","maxSeats":260,"avgSeats":260,"minSeats":260,"sumSeats":260,"countSeats":1},{"rooms_shortname":"PHRM","rooms_type":"Tiered Large Group","maxSeats":236,"avgSeats":201.5,"minSeats":167,"sumSeats":403,"countSeats":2},{"rooms_shortname":"LSK","rooms_type":"Tiered Large Group","maxSeats":205,"avgSeats":194,"minSeats":183,"sumSeats":388,"countSeats":2},{"rooms_shortname":"CHBE","rooms_type":"Tiered Large Group","maxSeats":200,"avgSeats":200,"minSeats":200,"sumSeats":200,"countSeats":1},{"rooms_shortname":"SWNG","rooms_type":"Tiered Large Group","maxSeats":190,"avgSeats":188.75,"minSeats":187,"sumSeats":755,"countSeats":3},{"rooms_shortname":"FRDM","rooms_type":"Tiered Large Group","maxSeats":160,"avgSeats":160,"minSeats":160,"sumSeats":160,"countSeats":1},{"rooms_shortname":"DMP","rooms_type":"Tiered Large Group","maxSeats":160,"avgSeats":140,"minSeats":120,"sumSeats":280,"countSeats":2},{"rooms_shortname":"IBLC","rooms_type":"Tiered Large Group","maxSeats":154,"avgSeats":154,"minSeats":154,"sumSeats":154,"countSeats":1},{"rooms_shortname":"MCLD","rooms_type":"Tiered Large Group","maxSeats":136,"avgSeats":129.5,"minSeats":123,"sumSeats":259,"countSeats":2},{"rooms_shortname":"WOOD","rooms_type":"Tiered Large Group","maxSeats":120,"avgSeats":120,"minSeats":120,"sumSeats":360,"countSeats":1},{"rooms_shortname":"IBLC","rooms_type":"Open Design General Purpose","maxSeats":112,"avgSeats":112,"minSeats":112,"sumSeats":112,"countSeats":1},{"rooms_shortname":"BUCH","rooms_type":"Case Style","maxSeats":108,"avgSeats":108,"minSeats":108,"sumSeats":216,"countSeats":1}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it("FIVE APPLY keys MAX, AVG, MIN, SUM, COUNT sort by all APPLY keys", function(){
        let query3 = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 100
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "rooms_type",
                    "maxSeats",
                    "avgSeats",
                    "minSeats",
                    "sumSeats",
                    "countSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["maxSeats","sumSeats","avgSeats"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname","rooms_type"],
                "APPLY": [
                    {
                        "maxSeats": {
                            "MAX": "rooms_seats"
                        }
                    },
                    {
                        "avgSeats": {
                            "AVG": "rooms_seats"
                        }
                    },
                    {
                        "minSeats": {
                            "MIN": "rooms_seats"
                        }
                    },
                    {
                        "sumSeats": {
                            "SUM": "rooms_seats"
                        }
                    },
                    {
                        "countSeats": {
                            "COUNT": "rooms_seats"
                        }
                    }
                ]
            }
        };

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"rooms_shortname":"OSBO","rooms_type":"Open Design General Purpose","maxSeats":442,"avgSeats":442,"minSeats":442,"sumSeats":442,"countSeats":1},{"rooms_shortname":"HEBB","rooms_type":"Tiered Large Group","maxSeats":375,"avgSeats":375,"minSeats":375,"sumSeats":375,"countSeats":1},{"rooms_shortname":"LSC","rooms_type":"Tiered Large Group","maxSeats":350,"avgSeats":275,"minSeats":125,"sumSeats":825,"countSeats":2},{"rooms_shortname":"SRC","rooms_type":"TBD","maxSeats":299,"avgSeats":299,"minSeats":299,"sumSeats":897,"countSeats":1},{"rooms_shortname":"ANGU","rooms_type":"Tiered Large Group","maxSeats":260,"avgSeats":260,"minSeats":260,"sumSeats":260,"countSeats":1},{"rooms_shortname":"PHRM","rooms_type":"Tiered Large Group","maxSeats":236,"avgSeats":201.5,"minSeats":167,"sumSeats":403,"countSeats":2},{"rooms_shortname":"LSK","rooms_type":"Tiered Large Group","maxSeats":205,"avgSeats":194,"minSeats":183,"sumSeats":388,"countSeats":2},{"rooms_shortname":"CHBE","rooms_type":"Tiered Large Group","maxSeats":200,"avgSeats":200,"minSeats":200,"sumSeats":200,"countSeats":1},{"rooms_shortname":"SWNG","rooms_type":"Tiered Large Group","maxSeats":190,"avgSeats":188.75,"minSeats":187,"sumSeats":755,"countSeats":3},{"rooms_shortname":"DMP","rooms_type":"Tiered Large Group","maxSeats":160,"avgSeats":140,"minSeats":120,"sumSeats":280,"countSeats":2},{"rooms_shortname":"FRDM","rooms_type":"Tiered Large Group","maxSeats":160,"avgSeats":160,"minSeats":160,"sumSeats":160,"countSeats":1},{"rooms_shortname":"IBLC","rooms_type":"Tiered Large Group","maxSeats":154,"avgSeats":154,"minSeats":154,"sumSeats":154,"countSeats":1},{"rooms_shortname":"MCLD","rooms_type":"Tiered Large Group","maxSeats":136,"avgSeats":129.5,"minSeats":123,"sumSeats":259,"countSeats":2},{"rooms_shortname":"WOOD","rooms_type":"Tiered Large Group","maxSeats":120,"avgSeats":120,"minSeats":120,"sumSeats":360,"countSeats":1},{"rooms_shortname":"IBLC","rooms_type":"Open Design General Purpose","maxSeats":112,"avgSeats":112,"minSeats":112,"sumSeats":112,"countSeats":1},{"rooms_shortname":"BUCH","rooms_type":"Case Style","maxSeats":108,"avgSeats":108,"minSeats":108,"sumSeats":216,"countSeats":1}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it("Group with two keys and Apply MIN", function(){
        let query3 = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 150
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "rooms_type",
                    "minSeats"
                ],
                "ORDER": {
                    "dir": "DOWN",
                    "keys": ["minSeats","rooms_shortname"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname","rooms_type"],
                "APPLY": [{
                    "minSeats": {
                        "MIN": "rooms_seats"
                    }
                }]
            }
        };

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"rooms_shortname":"OSBO","rooms_type":"Open Design General Purpose","minSeats":442},{"rooms_shortname":"HEBB","rooms_type":"Tiered Large Group","minSeats":375},{"rooms_shortname":"LSC","rooms_type":"Tiered Large Group","minSeats":350},{"rooms_shortname":"SRC","rooms_type":"TBD","minSeats":299},{"rooms_shortname":"ANGU","rooms_type":"Tiered Large Group","minSeats":260},{"rooms_shortname":"CHBE","rooms_type":"Tiered Large Group","minSeats":200},{"rooms_shortname":"SWNG","rooms_type":"Tiered Large Group","minSeats":187},{"rooms_shortname":"LSK","rooms_type":"Tiered Large Group","minSeats":183},{"rooms_shortname":"PHRM","rooms_type":"Tiered Large Group","minSeats":167},{"rooms_shortname":"FRDM","rooms_type":"Tiered Large Group","minSeats":160},{"rooms_shortname":"DMP","rooms_type":"Tiered Large Group","minSeats":160},{"rooms_shortname":"IBLC","rooms_type":"Tiered Large Group","minSeats":154}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it("Group with two keys and Apply SUM ---- OLD ordering", function(){
        let query3 = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 100
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "rooms_type",
                    "sumSeats"
                ],
                "ORDER": "sumSeats"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname","rooms_type"],
                "APPLY": [{
                    "sumSeats": {
                        "SUM": "rooms_seats"
                    }
                }]
            }
        };

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"rooms_shortname":"IBLC","rooms_type":"Open Design General Purpose","sumSeats":112},{"rooms_shortname":"IBLC","rooms_type":"Tiered Large Group","sumSeats":154},{"rooms_shortname":"FRDM","rooms_type":"Tiered Large Group","sumSeats":160},{"rooms_shortname":"CHBE","rooms_type":"Tiered Large Group","sumSeats":200},{"rooms_shortname":"BUCH","rooms_type":"Case Style","sumSeats":216},{"rooms_shortname":"MCLD","rooms_type":"Tiered Large Group","sumSeats":259},{"rooms_shortname":"ANGU","rooms_type":"Tiered Large Group","sumSeats":260},{"rooms_shortname":"DMP","rooms_type":"Tiered Large Group","sumSeats":280},{"rooms_shortname":"WOOD","rooms_type":"Tiered Large Group","sumSeats":360},{"rooms_shortname":"HEBB","rooms_type":"Tiered Large Group","sumSeats":375},{"rooms_shortname":"LSK","rooms_type":"Tiered Large Group","sumSeats":388},{"rooms_shortname":"PHRM","rooms_type":"Tiered Large Group","sumSeats":403},{"rooms_shortname":"OSBO","rooms_type":"Open Design General Purpose","sumSeats":442},{"rooms_shortname":"SWNG","rooms_type":"Tiered Large Group","sumSeats":755},{"rooms_shortname":"LSC","rooms_type":"Tiered Large Group","sumSeats":825},{"rooms_shortname":"SRC","rooms_type":"TBD","sumSeats":897}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it("Group with two keys and Apply COUNT", function(){
        let query3 = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 150
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "rooms_type",
                    "countSeats"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["countSeats","rooms_shortname"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname","rooms_type"],
                "APPLY": [{
                    "countSeats": {
                        "COUNT": "rooms_seats"
                    }
                }]
            }
        };

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"rooms_shortname":"ANGU","rooms_type":"Tiered Large Group","countSeats":1},{"rooms_shortname":"CHBE","rooms_type":"Tiered Large Group","countSeats":1},{"rooms_shortname":"DMP","rooms_type":"Tiered Large Group","countSeats":1},{"rooms_shortname":"FRDM","rooms_type":"Tiered Large Group","countSeats":1},{"rooms_shortname":"HEBB","rooms_type":"Tiered Large Group","countSeats":1},{"rooms_shortname":"IBLC","rooms_type":"Tiered Large Group","countSeats":1},{"rooms_shortname":"LSC","rooms_type":"Tiered Large Group","countSeats":1},{"rooms_shortname":"OSBO","rooms_type":"Open Design General Purpose","countSeats":1},{"rooms_shortname":"SRC","rooms_type":"TBD","countSeats":1},{"rooms_shortname":"LSK","rooms_type":"Tiered Large Group","countSeats":2},{"rooms_shortname":"PHRM","rooms_type":"Tiered Large Group","countSeats":2},{"rooms_shortname":"SWNG","rooms_type":"Tiered Large Group","countSeats":3}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it("Group with two keys and Apply AVG", function(){
        let query3 = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 150
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "rooms_type",
                    "avgSeats"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["avgSeats"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname","rooms_type"],
                "APPLY": [{
                    "avgSeats": {
                        "AVG": "rooms_seats"
                    }
                }]
            }
        };

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"rooms_shortname":"IBLC","rooms_type":"Tiered Large Group","avgSeats":154},{"rooms_shortname":"FRDM","rooms_type":"Tiered Large Group","avgSeats":160},{"rooms_shortname":"DMP","rooms_type":"Tiered Large Group","avgSeats":160},{"rooms_shortname":"SWNG","rooms_type":"Tiered Large Group","avgSeats":188.75},{"rooms_shortname":"LSK","rooms_type":"Tiered Large Group","avgSeats":194},{"rooms_shortname":"CHBE","rooms_type":"Tiered Large Group","avgSeats":200},{"rooms_shortname":"PHRM","rooms_type":"Tiered Large Group","avgSeats":201.5},{"rooms_shortname":"ANGU","rooms_type":"Tiered Large Group","avgSeats":260},{"rooms_shortname":"SRC","rooms_type":"TBD","avgSeats":299},{"rooms_shortname":"LSC","rooms_type":"Tiered Large Group","avgSeats":350},{"rooms_shortname":"HEBB","rooms_type":"Tiered Large Group","avgSeats":375},{"rooms_shortname":"OSBO","rooms_type":"Open Design General Purpose","avgSeats":442}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it("Group with two keys and order by two keys", function(){
        let query3 = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 150
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "rooms_type",
                    "avgSeats"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["avgSeats","rooms_shortname"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname","rooms_type"],
                "APPLY": [{
                    "avgSeats": {
                        "AVG": "rooms_seats"
                    }
                }]
            }
        };

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"rooms_shortname":"IBLC","rooms_type":"Tiered Large Group","avgSeats":154},{"rooms_shortname":"DMP","rooms_type":"Tiered Large Group","avgSeats":160},{"rooms_shortname":"FRDM","rooms_type":"Tiered Large Group","avgSeats":160},{"rooms_shortname":"SWNG","rooms_type":"Tiered Large Group","avgSeats":188.75},{"rooms_shortname":"LSK","rooms_type":"Tiered Large Group","avgSeats":194},{"rooms_shortname":"CHBE","rooms_type":"Tiered Large Group","avgSeats":200},{"rooms_shortname":"PHRM","rooms_type":"Tiered Large Group","avgSeats":201.5},{"rooms_shortname":"ANGU","rooms_type":"Tiered Large Group","avgSeats":260},{"rooms_shortname":"SRC","rooms_type":"TBD","avgSeats":299},{"rooms_shortname":"LSC","rooms_type":"Tiered Large Group","avgSeats":350},{"rooms_shortname":"HEBB","rooms_type":"Tiered Large Group","avgSeats":375},{"rooms_shortname":"OSBO","rooms_type":"Open Design General Purpose","avgSeats":442}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });


    it ("Group with two keys without Apply", function(){
        let query3:any = {
            "WHERE": {
                "AND": [{
                    "IS": {
                        "rooms_furniture": "*Tables*"
                    }
                }, {
                    "GT": {
                        "rooms_seats": 100
                    }
                }]
            },
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_shortname",
                    "rooms_type"
                ],
                "ORDER": {
                    "dir": "UP",
                    "keys": ["rooms_shortname","rooms_type"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname","rooms_type"],
                "APPLY": []
            }
        };

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            expect(response.body).to.deep.equal({"result":[{"rooms_shortname":"ANGU","rooms_type":"Tiered Large Group"},{"rooms_shortname":"BUCH","rooms_type":"Case Style"},{"rooms_shortname":"CHBE","rooms_type":"Tiered Large Group"},{"rooms_shortname":"DMP","rooms_type":"Tiered Large Group"},{"rooms_shortname":"FRDM","rooms_type":"Tiered Large Group"},{"rooms_shortname":"HEBB","rooms_type":"Tiered Large Group"},{"rooms_shortname":"IBLC","rooms_type":"Open Design General Purpose"},{"rooms_shortname":"IBLC","rooms_type":"Tiered Large Group"},{"rooms_shortname":"LSC","rooms_type":"Tiered Large Group"},{"rooms_shortname":"LSK","rooms_type":"Tiered Large Group"},{"rooms_shortname":"MCLD","rooms_type":"Tiered Large Group"},{"rooms_shortname":"OSBO","rooms_type":"Open Design General Purpose"},{"rooms_shortname":"PHRM","rooms_type":"Tiered Large Group"},{"rooms_shortname":"SRC","rooms_type":"TBD"},{"rooms_shortname":"SWNG","rooms_type":"Tiered Large Group"},{"rooms_shortname":"WOOD","rooms_type":"Tiered Large Group"}]});
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it ("Empty WHERE GET all Courses", function() {
        var query4: any = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "courses_title"
                ],
                "ORDER": "courses_title"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["courses_title"],
                "APPLY": []
            }
        };
        return ifacade.performQuery(query4).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            /*         expect(response.body).to.deep.equal({
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
                     */
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });

    it ("Empty WHERE GET all Rooms", function() {
        var query4: any = {
            "WHERE": {},
            "OPTIONS": {
                "COLUMNS": [
                    "rooms_name"
                ],
                "ORDER": "rooms_name"
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_name"],
                "APPLY": []
            }
        };
        return ifacade.performQuery(query4).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            /*         expect(response.body).to.deep.equal({
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
                     */
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

    //Remove DataSet after performing Query
    it ("Remove rooms after queries", function () {
        return ifacade.removeDataset("rooms").then(function(response: InsightResponse){
            expect(response.code).to.equal(204);
            //expect(response.body).to.equal({msg: "the operation was successful"});
        }).catch(function (err:any) {
            expect.fail(err);
        })
    });


});
