"use strict";
var Course_1 = require("./Course");
var Util_1 = require("../Util");
var QueryValidation_1 = require("./QueryValidation");
var QueryEvaluation_1 = require("./QueryEvaluation");
var Room_1 = require("./Room");
var QueryChooser_1 = require("./QueryChooser");
var RoomQueryValidation_1 = require("./RoomQueryValidation");
var fs = require('fs');
var JSZip = require('jszip');
var parse5 = require('parse5');
var http = require('http');
var InsightFacade = (function () {
    function InsightFacade() {
        this.courseArray = [];
        this.roomArray = [];
        this.buildingsByAddress = {};
        this.buildingsByCode = {};
        Util_1.default.trace('InsightFacadeImpl::init()');
    }
    InsightFacade.prototype.addDataset = function (id, content) {
        var that = this;
        var courseDataExisted = false;
        var roomDataExisted = false;
        return new Promise(function (fulfill, reject) {
            var promiseArray = [];
            var indexPromise;
            if (id != "courses" && id != "rooms") {
                return reject({ code: 400, body: { "error": 'Invalid id no Dataset for this id' } });
            }
            JSZip.loadAsync(content, { base64: true }).then(function (zip) {
                if (id === "courses") {
                    if (that.courseArray.length != 0) {
                        that.courseArray = [];
                        courseDataExisted = true;
                    }
                    zip.forEach(function (relativePath, file) {
                        if (!file.dir) {
                            var promise = file.async("string");
                            promiseArray.push(promise);
                        }
                    });
                    Promise.all(promiseArray).then(function (resultarray) {
                        var dataCourse;
                        var tables = [];
                        for (var a = 0; a < resultarray.length; a++) {
                            if (id == "courses") {
                                try {
                                    dataCourse = JSON.parse(resultarray[a]);
                                }
                                catch (e) {
                                    continue;
                                }
                                var result = dataCourse["result"];
                                for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
                                    var section = result_1[_i];
                                    var courses_year = 1900;
                                    var courses_dept = section["Subject"];
                                    var courses_id = section["Course"];
                                    var courses_avg = section["Avg"];
                                    var courses_instructor = section["Professor"];
                                    var courses_title = section["Title"];
                                    var courses_pass = section["Pass"];
                                    var courses_fail = section["Fail"];
                                    var courses_audit = section["Audit"];
                                    var courses_uuid = section["id"];
                                    if (section["Section"] == "overall") {
                                        courses_year = 1900;
                                    }
                                    else {
                                        var string = section["Year"];
                                        courses_year = parseInt(string);
                                    }
                                    var course = new Course_1.default(courses_dept, courses_id, courses_avg, courses_instructor, courses_title, courses_pass, courses_fail, courses_audit, courses_uuid, courses_year);
                                    that.courseArray.push(course);
                                }
                            }
                        }
                        if (that.courseArray.length == 0 && id == "courses") {
                            return reject({ code: 400, body: { "error": "No valid Courses in data set" } });
                        }
                        var data = JSON.stringify(that.courseArray);
                        var file = fs.writeFile(id, data, function (err) {
                            if (err) {
                                return reject({ code: 400, body: { "error": err } });
                            }
                        });
                        if (courseDataExisted) {
                            return fulfill({ code: 201, body: { "msg": "the operation was successful and the id already existed (was added in this session or was previously cached)" } });
                        }
                        return fulfill({ code: 204, body: { "msg": "the operation was successful and the id was new (not added in this session or was previously cached)" } });
                    })
                        .catch(function (err) {
                        reject({ code: 400, body: { "error": "Courses promise.all failed" } });
                        return;
                    });
                }
                if (id === "rooms") {
                    if (that.roomArray.length != 0) {
                        that.roomArray = [];
                        roomDataExisted = true;
                    }
                    zip.forEach(function (relativePath, file) {
                        if (file.name.endsWith("index.htm")) {
                            indexPromise = file.async("string");
                        }
                    });
                    indexPromise.then(function (result) {
                        var bodyIndex = null;
                        var table = null;
                        var indexData = parse5.parse(result);
                        bodyIndex = that.findTag(indexData, "body");
                        if (bodyIndex != null) {
                            table = that.findTag(bodyIndex, "table");
                        }
                        if (table != null) {
                            var tableBody = that.findTag(table, "tbody");
                            that.getBuildingsInfo(tableBody);
                        }
                        zip.forEach(function (relativePath, file) {
                            var fileName = "";
                            if (file.name.lastIndexOf("/") + 1 < file.name.length) {
                                fileName = file.name.substring(file.name.lastIndexOf("/") + 1, file.name.length);
                            }
                            else {
                                fileName = file.name;
                            }
                            if (that.buildingsByCode[fileName] != null) {
                                var promise = file.async("string");
                                promiseArray.push(promise);
                            }
                        });
                        Promise.all(promiseArray).then(function (resultarray) {
                            var dataRooms;
                            for (var a = 0; a < resultarray.length; a++) {
                                dataRooms = parse5.parse(resultarray[a]);
                                for (var i = 0; i < dataRooms.childNodes.length; i++) {
                                    if (dataRooms.childNodes[i].childNodes != null) {
                                        var body = that.findTag(dataRooms.childNodes[i], "body");
                                        var buildingField = that.findClass(body, "building-field");
                                        var roomAddressObject = that.findClass(buildingField, "field-content");
                                        var roomsTable = that.findTag(body, "table");
                                        if (roomsTable != null) {
                                            var roomsTableBody = that.findTag(roomsTable, "tbody");
                                            that.getRoomsInfo(roomsTableBody, roomAddressObject);
                                        }
                                    }
                                }
                            }
                            var latLonPromiseArray = [];
                            for (var address in that.buildingsByAddress) {
                                var uri = encodeURI(address);
                                var url = 'http://skaha.cs.ubc.ca:11316/api/v1/team73/' + uri;
                                var latLonPromise = that.getBuildingLocation(url);
                                console.log(latLonPromise);
                                latLonPromiseArray.push(latLonPromise);
                            }
                            Promise.all(latLonPromiseArray).then(function (resultArray) {
                                that.setLatLons(resultArray);
                                for (var address in that.buildingsByAddress) {
                                    for (var r in that.buildingsByAddress[address].rooms) {
                                        var room = that.buildingsByAddress[address].rooms[r];
                                        var shortName = (room.roomCode) + "_" + room.roomNumber;
                                        var newRoom = new Room_1.default(room.buildingName, room.roomCode, room.roomNumber, shortName, room.roomAddress, room.lat, room.lon, room.roomCapacity, room.roomType, room.roomFurniture, room.roomInfo);
                                        that.roomArray.push(newRoom);
                                    }
                                }
                                if (that.roomArray.length == 0 && id == "rooms") {
                                    return reject({ code: 400, body: { "error": "No valid Courses in data set" } });
                                }
                                var data = JSON.stringify(that.roomArray);
                                var file = fs.writeFile(id, data, function (err) {
                                    if (err) {
                                        return reject({ code: 400, body: { "error": err } });
                                    }
                                });
                                if (roomDataExisted) {
                                    return fulfill({ code: 201, body: { "msg": "the operation was successful and the id already existed (was added in this session or was previously cached)" } });
                                }
                                return fulfill({ code: 204, body: { "msg": "the operation was successful and the id was new (not added in this session or was previously cached)" } });
                            })
                                .catch(function (err) {
                                reject({ code: 400, body: { "error": err } });
                                return;
                            });
                        })
                            .catch(function (err) {
                            reject({ code: 400, body: { "error": "Promise.all Rooms failed" } });
                            return;
                        });
                    })
                        .catch(function (err) {
                        reject({ code: 400, body: { "error": "Index.then failed" } });
                        return;
                    });
                }
            })
                .catch(function (err) {
                reject({ code: 400, body: { "error": "JSZip failed" } });
                return;
            });
        });
    };
    InsightFacade.prototype.setLatLons = function (resultArray) {
        var that = this;
        var arrayKey = Object.keys(that.buildingsByAddress);
        for (var i = 0; i < resultArray.length; i++) {
            console.log(resultArray[i]);
            var latLonObject = resultArray[i];
            var address = arrayKey[i];
            for (var room in that.buildingsByAddress[address].rooms) {
                that.buildingsByAddress[address].rooms[room].lat = latLonObject.lat;
                that.buildingsByAddress[address].rooms[room].lon = latLonObject.lon;
            }
        }
    };
    InsightFacade.prototype.removeDataset = function (id) {
        var that = this;
        return new Promise(function (fulfill, reject) {
            if (fs.existsSync(id)) {
                fs.unlinkSync(id);
                if (id === 'courses') {
                    that.courseArray = [];
                }
                if (id == 'rooms') {
                    that.roomArray = [];
                }
                fulfill({ code: 204, body: { "msg": "the operation was successful" } });
            }
            else {
                reject({ code: 404, body: { "error": "the operation was unsuccessful because the delete was for a resource that was not previously added." } });
            }
        });
    };
    InsightFacade.prototype.performQuery = function (query) {
        var that = this;
        var isValidQuery = true;
        var resultData = [];
        var courses = JSON.parse(JSON.stringify(that.courseArray));
        var rooms = JSON.parse(JSON.stringify(that.roomArray));
        return new Promise(function (fulfill, reject) {
            if (QueryChooser_1.default.queryChooser(query)) {
                isValidQuery = QueryValidation_1.default.validateQuery(query);
                if (isValidQuery) {
                    if (that.courseArray.length == 0) {
                        reject({ code: 424, body: { "error": "no data found for this dataSet" } });
                    }
                    var queryBody = query["WHERE"];
                    var queryOptions = query["OPTIONS"];
                    var queryTransformations = query["TRANSFORMATIONS"];
                    for (var i = 0; i < that.courseArray.length; i++) {
                        if (Object.keys(queryBody) == null) {
                            resultData.push(courses[i]);
                        }
                        else {
                            if (QueryEvaluation_1.default.evaluateQueryBody(queryBody, courses[i])) {
                                resultData.push(courses[i]);
                            }
                        }
                    }
                    if (queryTransformations != null) {
                        resultData = QueryEvaluation_1.default.evaluateQueryTransformations(queryTransformations, resultData);
                    }
                    resultData = QueryEvaluation_1.default.evaluateQueryOptions(queryOptions, resultData);
                    fulfill({ code: 200, body: { "result": resultData } });
                }
                else {
                    reject({ code: 400, body: { "error": "the query failed" } });
                }
            }
            else {
                isValidQuery = RoomQueryValidation_1.default.validateQuery(query);
                if (isValidQuery) {
                    if (that.roomArray.length == 0) {
                        reject({ code: 424, body: { "error": "no data found for this dataSet" } });
                    }
                    var queryBody = query["WHERE"];
                    var queryOptions = query["OPTIONS"];
                    var queryTransformations = query["TRANSFORMATIONS"];
                    for (var i = 0; i < that.roomArray.length; i++) {
                        if (Object.keys(queryBody) == null) {
                            resultData.push(rooms[i]);
                        }
                        else {
                            if (QueryEvaluation_1.default.evaluateQueryBody(queryBody, rooms[i])) {
                                resultData.push(rooms[i]);
                            }
                        }
                    }
                    if (queryTransformations != null) {
                        resultData = QueryEvaluation_1.default.evaluateQueryTransformations(queryTransformations, resultData);
                    }
                    resultData = QueryEvaluation_1.default.evaluateQueryOptions(queryOptions, resultData);
                    fulfill({ code: 200, body: { "result": resultData } });
                }
                else {
                    reject({ code: 400, body: { "error": "the query failed" } });
                }
            }
        });
    };
    InsightFacade.prototype.findTag = function (documentObject, tag) {
        var that = this;
        var rv = null;
        if (documentObject.nodeName == tag) {
            return documentObject;
        }
        else {
            if (documentObject.childNodes != null) {
                for (var i = 0; i < documentObject.childNodes.length; i++) {
                    rv = that.findTag(documentObject.childNodes[i], tag);
                    if (rv != null) {
                        return rv;
                    }
                }
            }
        }
    };
    InsightFacade.prototype.findClass = function (tableRow, className) {
        var that = this;
        var rv = null;
        if ((tableRow.attrs != null) && (tableRow.attrs.length) != 0 && (tableRow.attrs[0].value) == className) {
            return tableRow;
        }
        else {
            if (tableRow.childNodes != null) {
                for (var i = 0; i < tableRow.childNodes.length; i++) {
                    rv = that.findClass(tableRow.childNodes[i], className);
                    if (rv != null) {
                        return rv;
                    }
                }
            }
        }
    };
    InsightFacade.prototype.getBuildingsInfo = function (tableBody) {
        var that = this;
        for (var x = 0; x < tableBody.childNodes.length; x++) {
            if (tableBody.childNodes[x].childNodes != null) {
                var trBody = that.findTag(tableBody.childNodes[x], "tr");
                var buildingAdressObject = that.findClass(trBody, "views-field views-field-field-building-address");
                var buildingCodeObject = that.findClass(trBody, "views-field views-field-field-building-code");
                var buildingNameLink = that.findClass(trBody, "views-field views-field-title");
                var buildingNameObject = that.findTag(buildingNameLink, "a");
                if ((buildingCodeObject != null) && (buildingCodeObject != null) && (buildingCodeObject != null)) {
                    var buildingCode = that.getPropertyValue(buildingCodeObject, "#text");
                    var buildingName = that.getPropertyValue(buildingNameObject, "#text");
                    var buildingAddress = that.getPropertyValue(buildingAdressObject, "#text");
                    that.buildingsByAddress[buildingAddress] = { code: buildingCode, name: buildingName, rooms: [] };
                    that.buildingsByCode[buildingCode] = { address: buildingAddress, name: buildingName, rooms: [] };
                }
            }
        }
    };
    InsightFacade.prototype.getRoomsInfo = function (tableBody, roomAddressObject) {
        var that = this;
        for (var x = 0; x < tableBody.childNodes.length; x++) {
            if (tableBody.childNodes[x].childNodes != null) {
                var trBody = that.findTag(tableBody.childNodes[x], "tr");
                var roomNumberLink = that.findClass(trBody, "views-field views-field-field-room-number");
                var roomNumberObject = that.findTag(roomNumberLink, "a");
                var roomCapacityObject = that.findClass(trBody, "views-field views-field-field-room-capacity");
                var roomFurnitureObject = that.findClass(trBody, "views-field views-field-field-room-furniture");
                var roomTypeObject = that.findClass(trBody, "views-field views-field-field-room-type");
                var roomInfoLink = that.findClass(trBody, "views-field views-field-nothing");
                var roomInfoObject = that.findTag(roomInfoLink, "a");
                if ((roomNumberObject != null) && (roomCapacityObject != null) && (roomFurnitureObject != null) && (roomTypeObject != null) && (roomInfoObject != null)) {
                    var roomAddress = that.getPropertyValue(roomAddressObject, "#text");
                    var roomNumber = that.getPropertyValue(roomNumberObject, "#text");
                    var roomCapacityString = that.getPropertyValue(roomCapacityObject, "#text");
                    var roomCapacity = parseInt(roomCapacityString);
                    var roomFurniture = that.getPropertyValue(roomFurnitureObject, "#text");
                    var roomType = that.getPropertyValue(roomTypeObject, "#text");
                    var roomInfo = roomInfoObject.attrs[0].value;
                    var buildingCode = that.buildingsByAddress[roomAddress].code;
                    var buildingName = that.buildingsByAddress[roomAddress].name;
                    var room = { roomNumber: roomNumber, buildingName: buildingName, roomAddress: roomAddress, roomCode: buildingCode, roomCapacity: roomCapacity, roomFurniture: roomFurniture, roomType: roomType, roomInfo: roomInfo, lat: 0, lon: 0 };
                    that.buildingsByAddress[roomAddress].rooms.push(room);
                }
            }
        }
    };
    InsightFacade.prototype.getPropertyValue = function (buildingObject, tag) {
        var that = this;
        var valueObject = that.findTag(buildingObject, tag);
        var value = valueObject.value.replace("\n", "").trim();
        return value;
    };
    InsightFacade.prototype.getBuildingLocation = function (AddressURL) {
        return new Promise(function (fulfill, reject) {
            http.get(AddressURL, function (response) {
                var statusCode = response.statusCode;
                var contentType = response.headers['content-type'];
                var error;
                if (statusCode !== 200) {
                    error = new Error('Request Failed.\n' +
                        ("Status Code: " + statusCode));
                }
                else if (!/^application\/json/.test(contentType)) {
                    error = new Error('Invalid content-type.\n' +
                        ("Expected application/json but received " + contentType));
                }
                if (error) {
                    reject(error);
                    response.resume();
                    return;
                }
                response.setEncoding('utf8');
                var rawData = '';
                response.on('data', function (chunk) { rawData += chunk; });
                response.on('end', function () {
                    try {
                        var parsedData = JSON.parse(rawData);
                        fulfill(parsedData);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }).on('error', function (e) {
                reject({ error: e });
            });
        });
    };
    return InsightFacade;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map