"use strict";
var chai_1 = require("chai");
var Util_1 = require("../src/Util");
var InsightFacade_1 = require("../src/controller/InsightFacade");
var fs = require('fs');
var ifacade = new InsightFacade_1.default();
describe("Evaluation Test", function () {
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
            chai_1.expect(response.body).to.deep.equal({ "result": [{ "courses_title": "exprmnt phys lab", "maxPass": 302 }, { "courses_title": "analytical chem", "maxPass": 302 }, { "courses_title": "psyc of gender", "maxPass": 303 }, { "courses_title": "intro acad writ", "maxPass": 304 }, { "courses_title": "diff calculus", "maxPass": 304 }, { "courses_title": "empirical econ", "maxPass": 305 }, { "courses_title": "signals & system", "maxPass": 307 }, { "courses_title": "relation develop", "maxPass": 308 }, { "courses_title": "intr rel databse", "maxPass": 310 }, { "courses_title": "intro wine scie", "maxPass": 310 }, { "courses_title": "vert struct&func", "maxPass": 310 }, { "courses_title": "envir & sust", "maxPass": 312 }, { "courses_title": "cost accounting", "maxPass": 313 }, { "courses_title": "invest theory", "maxPass": 313 }, { "courses_title": "earth&solar sys", "maxPass": 314 }, { "courses_title": "intro philosophy", "maxPass": 314 }, { "courses_title": "econ of envirnmt", "maxPass": 315 }, { "courses_title": "beginnr fren iv", "maxPass": 315 }, { "courses_title": "intr writ comdic", "maxPass": 315 }, { "courses_title": "scientifc reason", "maxPass": 317 }, { "courses_title": "brn dys&recovery", "maxPass": 319 }, { "courses_title": "geog mod glob ii", "maxPass": 320 }, { "courses_title": "intm fnc acct i", "maxPass": 321 }, { "courses_title": "erth&life th tme", "maxPass": 324 }, { "courses_title": "intr comp poltcs", "maxPass": 325 }, { "courses_title": "comp hard&os", "maxPass": 326 }, { "courses_title": "in land food com", "maxPass": 327 }, { "courses_title": "forensic psych", "maxPass": 330 }, { "courses_title": "beginner span ii", "maxPass": 330 }, { "courses_title": "read, write lit", "maxPass": 333 }, { "courses_title": "elem diff eq i", "maxPass": 335 }, { "courses_title": "intr philsphy ii", "maxPass": 336 }, { "courses_title": "intro to physio", "maxPass": 336 }, { "courses_title": "glbl climat chng", "maxPass": 337 }, { "courses_title": "geog mod glob i", "maxPass": 340 }, { "courses_title": "intr med bioc", "maxPass": 341 }, { "courses_title": "eng mtls lab", "maxPass": 342 }, { "courses_title": "phys sns nrv msc", "maxPass": 343 }, { "courses_title": "human sexuality", "maxPass": 345 }, { "courses_title": "child & yng adlt", "maxPass": 346 }, { "courses_title": "intr sftwr eng", "maxPass": 347 }, { "courses_title": "memory i", "maxPass": 351 }, { "courses_title": "intr alg dsgn&an", "maxPass": 351 }, { "courses_title": "hist post 1900", "maxPass": 353 }, { "courses_title": "lnd,fod&comm i", "maxPass": 360 }, { "courses_title": "intro anml mech", "maxPass": 362 }, { "courses_title": "intrm macro anly", "maxPass": 364 }, { "courses_title": "geog mod glob", "maxPass": 367 }, { "courses_title": "marketing mgmt", "maxPass": 369 }, { "courses_title": "intermed fren 2", "maxPass": 369 }, { "courses_title": "beginnr fren iii", "maxPass": 370 }, { "courses_title": "chinese cinema", "maxPass": 374 }, { "courses_title": "organiztl bhvr", "maxPass": 374 }, { "courses_title": "prose", "maxPass": 374 }, { "courses_title": "explring univ ii", "maxPass": 379 }, { "courses_title": "investigat polit", "maxPass": 380 }, { "courses_title": "grek & romn myth", "maxPass": 380 }, { "courses_title": "intr modern bio", "maxPass": 381 }, { "courses_title": "intrm micro anly", "maxPass": 382 }, { "courses_title": "cell & orgsml bio", "maxPass": 384 }, { "courses_title": "intro to phil", "maxPass": 385 }, { "courses_title": "nutr conc & cont", "maxPass": 387 }, { "courses_title": "intr writ nw med", "maxPass": 387 }, { "courses_title": "int env micrbiol", "maxPass": 390 }, { "courses_title": "int stra think", "maxPass": 394 }, { "courses_title": "fndtls fin acct", "maxPass": 395 }, { "courses_title": "molecular gen", "maxPass": 396 }, { "courses_title": "dif calc phys ap", "maxPass": 401 }, { "courses_title": "cur poli thought", "maxPass": 402 }, { "courses_title": "mod chin lit 1", "maxPass": 403 }, { "courses_title": "strategic mangmt", "maxPass": 404 }, { "courses_title": "diff equations", "maxPass": 406 }, { "courses_title": "business finance", "maxPass": 407 }, { "courses_title": "wor prob in nut", "maxPass": 407 }, { "courses_title": "biol & cog psych", "maxPass": 407 }, { "courses_title": "hist chin cinema", "maxPass": 409 }, { "courses_title": "intro comp sys", "maxPass": 411 }, { "courses_title": "beginner fren i", "maxPass": 412 }, { "courses_title": "fnd comp vis art", "maxPass": 414 }, { "courses_title": "int phy geog:w&l", "maxPass": 418 }, { "courses_title": "eng materials", "maxPass": 433 }, { "courses_title": "intermed fren 1", "maxPass": 435 }, { "courses_title": "mod chin lit 2", "maxPass": 436 }, { "courses_title": "biometrics", "maxPass": 437 }, { "courses_title": "ord diff equtns", "maxPass": 442 }, { "courses_title": "intr writ fictin", "maxPass": 442 }, { "courses_title": "dig media studio", "maxPass": 442 }, { "courses_title": "internat'l nutri", "maxPass": 443 }, { "courses_title": "soci of family", "maxPass": 450 }, { "courses_title": "mesozoic earth", "maxPass": 451 }, { "courses_title": "brain & behviour", "maxPass": 455 }, { "courses_title": "explring univ i", "maxPass": 462 }, { "courses_title": "elem statistics", "maxPass": 466 }, { "courses_title": "intr grs hum ant", "maxPass": 469 }, { "courses_title": "scie seminar", "maxPass": 472 }, { "courses_title": "geog enviro glob", "maxPass": 472 }, { "courses_title": "fund of biostats", "maxPass": 477 }, { "courses_title": "math proof", "maxPass": 481 }, { "courses_title": "money & banking", "maxPass": 492 }, { "courses_title": "basic alg&data", "maxPass": 497 }, { "courses_title": "intro int fin", "maxPass": 499 }, { "courses_title": "begin japn i", "maxPass": 500 }, { "courses_title": "fund physiology", "maxPass": 500 }, { "courses_title": "int phy geog:a&w", "maxPass": 501 }, { "courses_title": "the solid earth", "maxPass": 502 }, { "courses_title": "evolutionary bio", "maxPass": 508 }, { "courses_title": "lit engl 18c", "maxPass": 511 }, { "courses_title": "explor our food", "maxPass": 518 }, { "courses_title": "corp finance", "maxPass": 521 }, { "courses_title": "soc, dev, clin", "maxPass": 527 }, { "courses_title": "lang of world", "maxPass": 533 }, { "courses_title": "beginner span i", "maxPass": 534 }, { "courses_title": "fund ecology", "maxPass": 535 }, { "courses_title": "general biochem", "maxPass": 542 }, { "courses_title": "lit canada", "maxPass": 550 }, { "courses_title": "fluid earth", "maxPass": 554 }, { "courses_title": "intro nonfiction", "maxPass": 554 }, { "courses_title": "chng env: wt&lnd", "maxPass": 561 }, { "courses_title": "human physiology", "maxPass": 565 }, { "courses_title": "changing envr", "maxPass": 565 }, { "courses_title": "fmly human dvlpm", "maxPass": 566 }, { "courses_title": "rsrch mthds", "maxPass": 573 }, { "courses_title": "intr mcr hum ant", "maxPass": 583 }, { "courses_title": "lit brit 18c+", "maxPass": 584 }, { "courses_title": "begin germ i", "maxPass": 597 }, { "courses_title": "analys beh data", "maxPass": 598 }, { "courses_title": "intro int trade", "maxPass": 600 }, { "courses_title": "calc socsci comm", "maxPass": 608 }, { "courses_title": "infancy", "maxPass": 641 }, { "courses_title": "intr lang&ling", "maxPass": 641 }, { "courses_title": "elec light & rad", "maxPass": 649 }, { "courses_title": "government can", "maxPass": 664 }, { "courses_title": "intr phys eng ii", "maxPass": 668 }, { "courses_title": "chem for engr", "maxPass": 668 }, { "courses_title": "critical thinkng", "maxPass": 682 }, { "courses_title": "fund genetics", "maxPass": 684 }, { "courses_title": "sftwr constructn", "maxPass": 696 }, { "courses_title": "financial acctng", "maxPass": 698 }, { "courses_title": "model comptn", "maxPass": 701 }, { "courses_title": "busn fundamental", "maxPass": 705 }, { "courses_title": "linear systems", "maxPass": 717 }, { "courses_title": "prof eng practce", "maxPass": 718 }, { "courses_title": "intro to eng ii", "maxPass": 719 }, { "courses_title": "intro global pol", "maxPass": 721 }, { "courses_title": "commercial law", "maxPass": 723 }, { "courses_title": "tech terms medic", "maxPass": 730 }, { "courses_title": "childhood & adol", "maxPass": 733 }, { "courses_title": "multivrbl calc", "maxPass": 736 }, { "courses_title": "int calc ap lf s", "maxPass": 739 }, { "courses_title": "med micb & immun", "maxPass": 740 }, { "courses_title": "df calc app lf s", "maxPass": 756 }, { "courses_title": "technical commun", "maxPass": 757 }, { "courses_title": "intro physics", "maxPass": 757 }, { "courses_title": "managerial econ", "maxPass": 764 }, { "courses_title": "govt & business", "maxPass": 771 }, { "courses_title": "managerial acctg", "maxPass": 774 }, { "courses_title": "intro phys lab", "maxPass": 777 }, { "courses_title": "employment relat", "maxPass": 778 }, { "courses_title": "intr phys eng i", "maxPass": 780 }, { "courses_title": "cultural psych", "maxPass": 804 }, { "courses_title": "comp eng design", "maxPass": 808 }, { "courses_title": "intro to eng i", "maxPass": 810 }, { "courses_title": "think clr psych", "maxPass": 811 }, { "courses_title": "business writing", "maxPass": 816 }, { "courses_title": "busn communicati", "maxPass": 823 }, { "courses_title": "elem stat applic", "maxPass": 827 }, { "courses_title": "intro marketing", "maxPass": 832 }, { "courses_title": "matrix algebra", "maxPass": 835 }, { "courses_title": "cell biology 2", "maxPass": 854 }, { "courses_title": "mngmt&orgnz bhvr", "maxPass": 869 }, { "courses_title": "mechanics i", "maxPass": 872 }, { "courses_title": "int mgmt info sy", "maxPass": 874 }, { "courses_title": "dff calc ap c&ss", "maxPass": 874 }, { "courses_title": "intro biochem", "maxPass": 884 }, { "courses_title": "health psycholgy", "maxPass": 892 }, { "courses_title": "intro to finance", "maxPass": 911 }, { "courses_title": "intro to politic", "maxPass": 917 }, { "courses_title": "calculus 3", "maxPass": 944 }, { "courses_title": "career fundmtls", "maxPass": 948 }, { "courses_title": "comptn, progrmng", "maxPass": 966 }, { "courses_title": "gold & gems", "maxPass": 1059 }, { "courses_title": "int calc ap c&ss", "maxPass": 1065 }, { "courses_title": "org chem biol sc", "maxPass": 1073 }, { "courses_title": "cell biology 1", "maxPass": 1091 }, { "courses_title": "intr cr writing", "maxPass": 1111 }, { "courses_title": "org chem lab", "maxPass": 1156 }, { "courses_title": "physical chem", "maxPass": 1159 }, { "courses_title": "df calc ap ph sc", "maxPass": 1171 }, { "courses_title": "log & crit think", "maxPass": 1245 }, { "courses_title": "fund cell bio", "maxPass": 1257 }, { "courses_title": "int quan dec mak", "maxPass": 1288 }, { "courses_title": "biol bact cell", "maxPass": 1307 }, { "courses_title": "appl stat in bus", "maxPass": 1309 }, { "courses_title": "log&ops managmnt", "maxPass": 1367 }, { "courses_title": "int calc ap ph s", "maxPass": 1390 }, { "courses_title": "phys & org chem", "maxPass": 1530 }, { "courses_title": "thm kin org chem", "maxPass": 1545 }, { "courses_title": "unicellular life", "maxPass": 1546 }, { "courses_title": "energy & waves", "maxPass": 1558 }, { "courses_title": "lab inv life sc", "maxPass": 1571 }, { "courses_title": "eco gen evol", "maxPass": 1648 }, { "courses_title": "structural chem", "maxPass": 1674 }, { "courses_title": "biology of cell", "maxPass": 1710 }, { "courses_title": "strctr bond chem", "maxPass": 1762 }, { "courses_title": "gentcs ecol&evol", "maxPass": 1817 }, { "courses_title": "rsrch&writ human", "maxPass": 1856 }, { "courses_title": "intro literature", "maxPass": 1990 }, { "courses_title": "catastroph earth", "maxPass": 2016 }, { "courses_title": "princpl macrecon", "maxPass": 2169 }, { "courses_title": "bio cog psych", "maxPass": 2201 }, { "courses_title": "dev soc cli psy", "maxPass": 2289 }, { "courses_title": "prncpls micrecon", "maxPass": 2438 }, { "courses_title": "univrsty writing", "maxPass": 2502 }, { "courses_title": "strat univ writ", "maxPass": 2994 }] });
        }).catch(function (response) {
            chai_1.expect.fail();
        });
    });
    it("Group with two keys and Apply MAX", function () {
        var query3 = {
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
                    "keys": ["maxSeats", "rooms_shortname"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_type"],
                "APPLY": [{
                        "maxSeats": {
                            "MAX": "rooms_seats"
                        }
                    }]
            }
        };
        return ifacade.performQuery(query3).then(function (response) {
            chai_1.expect(response.code).to.equal(200);
            chai_1.expect(response.body).to.deep.equal({ "result": [{ "rooms_shortname": "OSBO", "rooms_type": "Open Design General Purpose", "maxSeats": 442 }, { "rooms_shortname": "HEBB", "rooms_type": "Tiered Large Group", "maxSeats": 375 }, { "rooms_shortname": "LSC", "rooms_type": "Tiered Large Group", "maxSeats": 350 }, { "rooms_shortname": "SRC", "rooms_type": "TBD", "maxSeats": 299 }, { "rooms_shortname": "ANGU", "rooms_type": "Tiered Large Group", "maxSeats": 260 }, { "rooms_shortname": "PHRM", "rooms_type": "Tiered Large Group", "maxSeats": 236 }, { "rooms_shortname": "LSK", "rooms_type": "Tiered Large Group", "maxSeats": 205 }, { "rooms_shortname": "CHBE", "rooms_type": "Tiered Large Group", "maxSeats": 200 }, { "rooms_shortname": "SWNG", "rooms_type": "Tiered Large Group", "maxSeats": 190 }, { "rooms_shortname": "FRDM", "rooms_type": "Tiered Large Group", "maxSeats": 160 }, { "rooms_shortname": "DMP", "rooms_type": "Tiered Large Group", "maxSeats": 160 }, { "rooms_shortname": "IBLC", "rooms_type": "Tiered Large Group", "maxSeats": 154 }, { "rooms_shortname": "MCLD", "rooms_type": "Tiered Large Group", "maxSeats": 136 }, { "rooms_shortname": "WOOD", "rooms_type": "Tiered Large Group", "maxSeats": 120 }, { "rooms_shortname": "IBLC", "rooms_type": "Open Design General Purpose", "maxSeats": 112 }, { "rooms_shortname": "BUCH", "rooms_type": "Case Style", "maxSeats": 108 }] });
        }).catch(function (response) {
            chai_1.expect.fail();
        });
    });
    it("Two APPLY keys MAX and AVG", function () {
        var query3 = {
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
                    "keys": ["maxSeats", "rooms_shortname"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_type"],
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
        var result = fs.readFileSync("test/rooms.zip", "base64");
        return ifacade.addDataset("rooms", result).then(function (response) {
            return ifacade.performQuery(query3).then(function (response) {
                chai_1.expect(response.code).to.equal(200);
                chai_1.expect(response.body).to.deep.equal({ "result": [{ "rooms_shortname": "OSBO", "rooms_type": "Open Design General Purpose", "maxSeats": 442, "avgSeats": 442 }, { "rooms_shortname": "HEBB", "rooms_type": "Tiered Large Group", "maxSeats": 375, "avgSeats": 375 }, { "rooms_shortname": "LSC", "rooms_type": "Tiered Large Group", "maxSeats": 350, "avgSeats": 275 }, { "rooms_shortname": "SRC", "rooms_type": "TBD", "maxSeats": 299, "avgSeats": 299 }, { "rooms_shortname": "ANGU", "rooms_type": "Tiered Large Group", "maxSeats": 260, "avgSeats": 260 }, { "rooms_shortname": "PHRM", "rooms_type": "Tiered Large Group", "maxSeats": 236, "avgSeats": 201.5 }, { "rooms_shortname": "LSK", "rooms_type": "Tiered Large Group", "maxSeats": 205, "avgSeats": 194 }, { "rooms_shortname": "CHBE", "rooms_type": "Tiered Large Group", "maxSeats": 200, "avgSeats": 200 }, { "rooms_shortname": "SWNG", "rooms_type": "Tiered Large Group", "maxSeats": 190, "avgSeats": 188.75 }, { "rooms_shortname": "FRDM", "rooms_type": "Tiered Large Group", "maxSeats": 160, "avgSeats": 160 }, { "rooms_shortname": "DMP", "rooms_type": "Tiered Large Group", "maxSeats": 160, "avgSeats": 140 }, { "rooms_shortname": "IBLC", "rooms_type": "Tiered Large Group", "maxSeats": 154, "avgSeats": 154 }, { "rooms_shortname": "MCLD", "rooms_type": "Tiered Large Group", "maxSeats": 136, "avgSeats": 129.5 }, { "rooms_shortname": "WOOD", "rooms_type": "Tiered Large Group", "maxSeats": 120, "avgSeats": 120 }, { "rooms_shortname": "IBLC", "rooms_type": "Open Design General Purpose", "maxSeats": 112, "avgSeats": 112 }, { "rooms_shortname": "BUCH", "rooms_type": "Case Style", "maxSeats": 108, "avgSeats": 108 }] });
            }).catch(function (response) {
                chai_1.expect.fail();
            });
        }).catch(function (err) {
            console.log(err);
            chai_1.expect.fail(err);
        });
    });
    it("FIVE APPLY keys MAX, AVG, MIN, SUM, COUNT", function () {
        var query3 = {
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
                    "keys": ["maxSeats", "rooms_shortname"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_type"],
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
        return ifacade.performQuery(query3).then(function (response) {
            chai_1.expect(response.code).to.equal(200);
            chai_1.expect(response.body).to.deep.equal({ "result": [{ "rooms_shortname": "OSBO", "rooms_type": "Open Design General Purpose", "maxSeats": 442, "avgSeats": 442, "minSeats": 442, "sumSeats": 442, "countSeats": 1 }, { "rooms_shortname": "HEBB", "rooms_type": "Tiered Large Group", "maxSeats": 375, "avgSeats": 375, "minSeats": 375, "sumSeats": 375, "countSeats": 1 }, { "rooms_shortname": "LSC", "rooms_type": "Tiered Large Group", "maxSeats": 350, "avgSeats": 275, "minSeats": 125, "sumSeats": 825, "countSeats": 2 }, { "rooms_shortname": "SRC", "rooms_type": "TBD", "maxSeats": 299, "avgSeats": 299, "minSeats": 299, "sumSeats": 897, "countSeats": 1 }, { "rooms_shortname": "ANGU", "rooms_type": "Tiered Large Group", "maxSeats": 260, "avgSeats": 260, "minSeats": 260, "sumSeats": 260, "countSeats": 1 }, { "rooms_shortname": "PHRM", "rooms_type": "Tiered Large Group", "maxSeats": 236, "avgSeats": 201.5, "minSeats": 167, "sumSeats": 403, "countSeats": 2 }, { "rooms_shortname": "LSK", "rooms_type": "Tiered Large Group", "maxSeats": 205, "avgSeats": 194, "minSeats": 183, "sumSeats": 388, "countSeats": 2 }, { "rooms_shortname": "CHBE", "rooms_type": "Tiered Large Group", "maxSeats": 200, "avgSeats": 200, "minSeats": 200, "sumSeats": 200, "countSeats": 1 }, { "rooms_shortname": "SWNG", "rooms_type": "Tiered Large Group", "maxSeats": 190, "avgSeats": 188.75, "minSeats": 187, "sumSeats": 755, "countSeats": 3 }, { "rooms_shortname": "FRDM", "rooms_type": "Tiered Large Group", "maxSeats": 160, "avgSeats": 160, "minSeats": 160, "sumSeats": 160, "countSeats": 1 }, { "rooms_shortname": "DMP", "rooms_type": "Tiered Large Group", "maxSeats": 160, "avgSeats": 140, "minSeats": 120, "sumSeats": 280, "countSeats": 2 }, { "rooms_shortname": "IBLC", "rooms_type": "Tiered Large Group", "maxSeats": 154, "avgSeats": 154, "minSeats": 154, "sumSeats": 154, "countSeats": 1 }, { "rooms_shortname": "MCLD", "rooms_type": "Tiered Large Group", "maxSeats": 136, "avgSeats": 129.5, "minSeats": 123, "sumSeats": 259, "countSeats": 2 }, { "rooms_shortname": "WOOD", "rooms_type": "Tiered Large Group", "maxSeats": 120, "avgSeats": 120, "minSeats": 120, "sumSeats": 360, "countSeats": 1 }, { "rooms_shortname": "IBLC", "rooms_type": "Open Design General Purpose", "maxSeats": 112, "avgSeats": 112, "minSeats": 112, "sumSeats": 112, "countSeats": 1 }, { "rooms_shortname": "BUCH", "rooms_type": "Case Style", "maxSeats": 108, "avgSeats": 108, "minSeats": 108, "sumSeats": 216, "countSeats": 1 }] });
        }).catch(function (response) {
            chai_1.expect.fail();
        });
    });
    it("Group with two keys and Apply MIN", function () {
        var query3 = {
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
                    "keys": ["minSeats", "rooms_shortname"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_type"],
                "APPLY": [{
                        "minSeats": {
                            "MIN": "rooms_seats"
                        }
                    }]
            }
        };
        return ifacade.performQuery(query3).then(function (response) {
            chai_1.expect(response.code).to.equal(200);
            chai_1.expect(response.body).to.deep.equal({ "result": [{ "rooms_shortname": "OSBO", "rooms_type": "Open Design General Purpose", "minSeats": 442 }, { "rooms_shortname": "HEBB", "rooms_type": "Tiered Large Group", "minSeats": 375 }, { "rooms_shortname": "LSC", "rooms_type": "Tiered Large Group", "minSeats": 350 }, { "rooms_shortname": "SRC", "rooms_type": "TBD", "minSeats": 299 }, { "rooms_shortname": "ANGU", "rooms_type": "Tiered Large Group", "minSeats": 260 }, { "rooms_shortname": "CHBE", "rooms_type": "Tiered Large Group", "minSeats": 200 }, { "rooms_shortname": "SWNG", "rooms_type": "Tiered Large Group", "minSeats": 187 }, { "rooms_shortname": "LSK", "rooms_type": "Tiered Large Group", "minSeats": 183 }, { "rooms_shortname": "PHRM", "rooms_type": "Tiered Large Group", "minSeats": 167 }, { "rooms_shortname": "FRDM", "rooms_type": "Tiered Large Group", "minSeats": 160 }, { "rooms_shortname": "DMP", "rooms_type": "Tiered Large Group", "minSeats": 160 }, { "rooms_shortname": "IBLC", "rooms_type": "Tiered Large Group", "minSeats": 154 }] });
        }).catch(function (response) {
            chai_1.expect.fail();
        });
    });
    it("Group with two keys and Apply SUM ---- OLD ordering", function () {
        var query3 = {
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
                "GROUP": ["rooms_shortname", "rooms_type"],
                "APPLY": [{
                        "sumSeats": {
                            "SUM": "rooms_seats"
                        }
                    }]
            }
        };
        return ifacade.performQuery(query3).then(function (response) {
            chai_1.expect(response.code).to.equal(200);
            chai_1.expect(response.body).to.deep.equal({ "result": [{ "rooms_shortname": "IBLC", "rooms_type": "Open Design General Purpose", "sumSeats": 112 }, { "rooms_shortname": "IBLC", "rooms_type": "Tiered Large Group", "sumSeats": 154 }, { "rooms_shortname": "FRDM", "rooms_type": "Tiered Large Group", "sumSeats": 160 }, { "rooms_shortname": "CHBE", "rooms_type": "Tiered Large Group", "sumSeats": 200 }, { "rooms_shortname": "BUCH", "rooms_type": "Case Style", "sumSeats": 216 }, { "rooms_shortname": "MCLD", "rooms_type": "Tiered Large Group", "sumSeats": 259 }, { "rooms_shortname": "ANGU", "rooms_type": "Tiered Large Group", "sumSeats": 260 }, { "rooms_shortname": "DMP", "rooms_type": "Tiered Large Group", "sumSeats": 280 }, { "rooms_shortname": "WOOD", "rooms_type": "Tiered Large Group", "sumSeats": 360 }, { "rooms_shortname": "HEBB", "rooms_type": "Tiered Large Group", "sumSeats": 375 }, { "rooms_shortname": "LSK", "rooms_type": "Tiered Large Group", "sumSeats": 388 }, { "rooms_shortname": "PHRM", "rooms_type": "Tiered Large Group", "sumSeats": 403 }, { "rooms_shortname": "OSBO", "rooms_type": "Open Design General Purpose", "sumSeats": 442 }, { "rooms_shortname": "SWNG", "rooms_type": "Tiered Large Group", "sumSeats": 755 }, { "rooms_shortname": "LSC", "rooms_type": "Tiered Large Group", "sumSeats": 825 }, { "rooms_shortname": "SRC", "rooms_type": "TBD", "sumSeats": 897 }] });
        }).catch(function (response) {
            chai_1.expect.fail();
        });
    });
    it("Group with two keys and Apply COUNT", function () {
        var query3 = {
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
                    "keys": ["countSeats", "rooms_shortname"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_type"],
                "APPLY": [{
                        "countSeats": {
                            "COUNT": "rooms_seats"
                        }
                    }]
            }
        };
        return ifacade.performQuery(query3).then(function (response) {
            chai_1.expect(response.code).to.equal(200);
            chai_1.expect(response.body).to.deep.equal({ "result": [{ "rooms_shortname": "ANGU", "rooms_type": "Tiered Large Group", "countSeats": 1 }, { "rooms_shortname": "CHBE", "rooms_type": "Tiered Large Group", "countSeats": 1 }, { "rooms_shortname": "DMP", "rooms_type": "Tiered Large Group", "countSeats": 1 }, { "rooms_shortname": "FRDM", "rooms_type": "Tiered Large Group", "countSeats": 1 }, { "rooms_shortname": "HEBB", "rooms_type": "Tiered Large Group", "countSeats": 1 }, { "rooms_shortname": "IBLC", "rooms_type": "Tiered Large Group", "countSeats": 1 }, { "rooms_shortname": "LSC", "rooms_type": "Tiered Large Group", "countSeats": 1 }, { "rooms_shortname": "OSBO", "rooms_type": "Open Design General Purpose", "countSeats": 1 }, { "rooms_shortname": "SRC", "rooms_type": "TBD", "countSeats": 1 }, { "rooms_shortname": "LSK", "rooms_type": "Tiered Large Group", "countSeats": 2 }, { "rooms_shortname": "PHRM", "rooms_type": "Tiered Large Group", "countSeats": 2 }, { "rooms_shortname": "SWNG", "rooms_type": "Tiered Large Group", "countSeats": 3 }] });
        }).catch(function (response) {
            chai_1.expect.fail();
        });
    });
    it("Group with two keys and Apply AVG", function () {
        var query3 = {
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
                "GROUP": ["rooms_shortname", "rooms_type"],
                "APPLY": [{
                        "avgSeats": {
                            "AVG": "rooms_seats"
                        }
                    }]
            }
        };
        return ifacade.performQuery(query3).then(function (response) {
            chai_1.expect(response.code).to.equal(200);
            chai_1.expect(response.body).to.deep.equal({ "result": [{ "rooms_shortname": "IBLC", "rooms_type": "Tiered Large Group", "avgSeats": 154 }, { "rooms_shortname": "FRDM", "rooms_type": "Tiered Large Group", "avgSeats": 160 }, { "rooms_shortname": "DMP", "rooms_type": "Tiered Large Group", "avgSeats": 160 }, { "rooms_shortname": "SWNG", "rooms_type": "Tiered Large Group", "avgSeats": 188.75 }, { "rooms_shortname": "LSK", "rooms_type": "Tiered Large Group", "avgSeats": 194 }, { "rooms_shortname": "CHBE", "rooms_type": "Tiered Large Group", "avgSeats": 200 }, { "rooms_shortname": "PHRM", "rooms_type": "Tiered Large Group", "avgSeats": 201.5 }, { "rooms_shortname": "ANGU", "rooms_type": "Tiered Large Group", "avgSeats": 260 }, { "rooms_shortname": "SRC", "rooms_type": "TBD", "avgSeats": 299 }, { "rooms_shortname": "LSC", "rooms_type": "Tiered Large Group", "avgSeats": 350 }, { "rooms_shortname": "HEBB", "rooms_type": "Tiered Large Group", "avgSeats": 375 }, { "rooms_shortname": "OSBO", "rooms_type": "Open Design General Purpose", "avgSeats": 442 }] });
        }).catch(function (response) {
            chai_1.expect.fail();
        });
    });
    it("Group with two keys and order by two keys", function () {
        var query3 = {
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
                    "keys": ["avgSeats", "rooms_shortname"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_type"],
                "APPLY": [{
                        "avgSeats": {
                            "AVG": "rooms_seats"
                        }
                    }]
            }
        };
        return ifacade.performQuery(query3).then(function (response) {
            chai_1.expect(response.code).to.equal(200);
            chai_1.expect(response.body).to.deep.equal({ "result": [{ "rooms_shortname": "IBLC", "rooms_type": "Tiered Large Group", "avgSeats": 154 }, { "rooms_shortname": "DMP", "rooms_type": "Tiered Large Group", "avgSeats": 160 }, { "rooms_shortname": "FRDM", "rooms_type": "Tiered Large Group", "avgSeats": 160 }, { "rooms_shortname": "SWNG", "rooms_type": "Tiered Large Group", "avgSeats": 188.75 }, { "rooms_shortname": "LSK", "rooms_type": "Tiered Large Group", "avgSeats": 194 }, { "rooms_shortname": "CHBE", "rooms_type": "Tiered Large Group", "avgSeats": 200 }, { "rooms_shortname": "PHRM", "rooms_type": "Tiered Large Group", "avgSeats": 201.5 }, { "rooms_shortname": "ANGU", "rooms_type": "Tiered Large Group", "avgSeats": 260 }, { "rooms_shortname": "SRC", "rooms_type": "TBD", "avgSeats": 299 }, { "rooms_shortname": "LSC", "rooms_type": "Tiered Large Group", "avgSeats": 350 }, { "rooms_shortname": "HEBB", "rooms_type": "Tiered Large Group", "avgSeats": 375 }, { "rooms_shortname": "OSBO", "rooms_type": "Open Design General Purpose", "avgSeats": 442 }] });
        }).catch(function (response) {
            chai_1.expect.fail();
        });
    });
    it("Group with two keys without Apply", function () {
        var query3 = {
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
                    "keys": ["rooms_shortname", "rooms_type"]
                }
            },
            "TRANSFORMATIONS": {
                "GROUP": ["rooms_shortname", "rooms_type"],
                "APPLY": []
            }
        };
        return ifacade.performQuery(query3).then(function (response) {
            chai_1.expect(response.code).to.equal(200);
            chai_1.expect(response.body).to.deep.equal({ "result": [{ "rooms_shortname": "ANGU", "rooms_type": "Tiered Large Group" }, { "rooms_shortname": "BUCH", "rooms_type": "Case Style" }, { "rooms_shortname": "CHBE", "rooms_type": "Tiered Large Group" }, { "rooms_shortname": "DMP", "rooms_type": "Tiered Large Group" }, { "rooms_shortname": "FRDM", "rooms_type": "Tiered Large Group" }, { "rooms_shortname": "HEBB", "rooms_type": "Tiered Large Group" }, { "rooms_shortname": "IBLC", "rooms_type": "Open Design General Purpose" }, { "rooms_shortname": "IBLC", "rooms_type": "Tiered Large Group" }, { "rooms_shortname": "LSC", "rooms_type": "Tiered Large Group" }, { "rooms_shortname": "LSK", "rooms_type": "Tiered Large Group" }, { "rooms_shortname": "MCLD", "rooms_type": "Tiered Large Group" }, { "rooms_shortname": "OSBO", "rooms_type": "Open Design General Purpose" }, { "rooms_shortname": "PHRM", "rooms_type": "Tiered Large Group" }, { "rooms_shortname": "SRC", "rooms_type": "TBD" }, { "rooms_shortname": "SWNG", "rooms_type": "Tiered Large Group" }, { "rooms_shortname": "WOOD", "rooms_type": "Tiered Large Group" }] });
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
    it("Remove rooms after queries", function () {
        return ifacade.removeDataset("rooms").then(function (response) {
            chai_1.expect(response.code).to.equal(204);
        }).catch(function (err) {
            chai_1.expect.fail(err);
        });
    });
});
//# sourceMappingURL=EvaluationD3.js.map