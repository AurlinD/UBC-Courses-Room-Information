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
//test

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
            //expect(response.body).to.equal({"msg": "the operation was successful and the id was new (not added in this session or was previously cached)"});
        }).catch(function (err:any) {
            console.log(err);
            expect.fail(err);
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
          /*  expect(response.body).to.deep.equal({
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

    it ("Generic D3 B test.", function(){
        var query4: any = {
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


    it ("empty group and empty apply. FAIL", function(){
        var query4: any = {
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

        return ifacade.performQuery(query4).then(function(response: InsightResponse){
            expect.fail();

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
            expect(response.code).to.equal(400);
        })
    });


    it ("newKey is not defined. fail", function(){
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

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect.fail();
            /*  expect(response.body).to.deep.equal({
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

            expect(response.code).to.equal(400);
        })
    });



    it ("substitute group name item into order", function(){
        let query3 = {
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

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            /*  expect(response.body).to.deep.equal({
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


    it ("have extra valid group items", function(){
        let query3 = {
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

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
            /*  expect(response.body).to.deep.equal({
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

    it ("invalid order keyword doesnt exist in column. fail", function(){
        let query3 = {
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

        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect.fail();
        }).catch(function (response:InsightResponse) {
            expect(response.code).to.equal(400);
        })
    });

    it("Group with two keys and Apply MAX: Courses", function(){
        let query3 = {
            "WHERE": {"AND": [{"GT": {"courses_pass": 300}}]},
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
        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect(response.code).to.equal(200);
        }).catch(function (response:InsightResponse) {
            expect.fail();
        })
    });
    it("Group with two keys and Apply MAX: Courses 400", function(){
        let query3 = {
            "WHERE": {"AND": [{"GT": {"courses_pass": 300}}]},
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
                "GROUP": ["courses_pass"],
                "APPLY": [{
                    "maxPass": {
                        "MAX": "courses_pass"
                    }
                }]
            }
        };
        return ifacade.performQuery(query3).then(function(response: InsightResponse){
            expect.fail();
        }).catch(function (response:InsightResponse) {
            expect(response.code).to.equal(400);
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
