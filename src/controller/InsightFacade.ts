/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import Course from "./Course";
import Log from "../Util";
import QueryValidation from "./QueryValidation";
import QueryEvaluation from "./QueryEvaluation";
import Room from "./Room";
import QueryChooser from "./QueryChooser";
import RoomQueryValidation from "./RoomQueryValidation";
import RoomQueryEvaluation from "./QueryEvaluation";
let fs = require('fs');
let JSZip = require('jszip');
let parse5 = require('parse5');
let http = require('http');
let Decimal = require('decimal.js');


interface GeoResponse {
    lat?: number;
    lon?: number;
    error?: string;
}

export default class InsightFacade implements IInsightFacade {
    private courseArray:Array<any> = [];
    private roomArray:Array<any> = [];
    private buildingsByAddress:any = {};
    private buildingsByCode:any = {};

    constructor() {
        Log.trace('InsightFacadeImpl::init()');
    }

    addDataset(id: string, content: string): Promise<InsightResponse> {
        let that = this;
        let courseDataExisted = false;
        let roomDataExisted = false;

        return new Promise(function (fulfill, reject) {
            let promiseArray: Array<Promise<any>> = [];
            let indexPromise:any;

            if(id != "courses" && id!= "rooms"){
                return reject({code:400, body:{"error":'Invalid id no Dataset for this id'}});
            }

            //reads an existing zip. Returns a promise with the updated zip object
            JSZip.loadAsync(content,{base64:true}).then(function(zip: JSZip) {

                //Add DataSet if the given DataSet is a Courses dataSet
                if (id === "courses") {
                    if(that.courseArray.length != 0){
                        that.courseArray = [];
                        courseDataExisted = true;
                    }

                    zip.forEach(function (relativePath: String, file: JSZipObject) {
                        // returns promise string containing content of string of each course
                        if (!file.dir) {
                            let promise = file.async("string");
                            promiseArray.push(promise);
                        }
                    });

                    Promise.all(promiseArray).then(function (resultarray: Array<string>) {
                        let dataCourse: any;
                        let tables: any[] = [];

                        for (let a = 0; a < resultarray.length; a++) {

                            if (id == "courses") {
                                try {
                                    dataCourse = JSON.parse(resultarray[a]);
                                }
                                catch (e) {
                                    continue;
                                }
                                // Creating a single Course class for every course section from the dataSet
                                let result = dataCourse["result"];
                                for (let section of result) {
                                    let courses_year = 1900;
                                    let courses_dept = section["Subject"];
                                    let courses_id = section["Course"].toString();
                                    let courses_avg = section["Avg"];
                                    let courses_instructor = section["Professor"];
                                    let courses_title = section["Title"];
                                    let courses_pass = section["Pass"];
                                    let courses_fail = section["Fail"];
                                    let courses_audit = section["Audit"];
                                    let courses_uuid = section["id"].toString();

                                    if (section["Section"] == "overall") {
                                        courses_year = 1900;
                                    } else {
                                        let string:string = section["Year"];
                                        courses_year = parseInt(string);
                                    }
                                    //Create a new course with all the values from the dataSet
                                    let course = new Course(courses_dept, courses_id, courses_avg, courses_instructor, courses_title, courses_pass, courses_fail, courses_audit, courses_uuid, courses_year);
                                    that.courseArray.push(course);
                                }
                            }
                        }
                        // If there are no valid Courses in dataSet then reject with code 400
                        if (that.courseArray.length == 0 && id == "courses") {
                            return reject({code: 400, body: {"error": "No valid Courses in data set"}});
                        }

                        //After retrieving all courses save it into disk
                        let data = JSON.stringify(that.courseArray);
                        let file = fs.writeFile(id, data, function (err: any) {
                            if (err) {
                                return reject({code: 400, body: {"error": err}});
                            }
                        });
                        if(courseDataExisted){
                            return fulfill({code: 201, body: {"msg": "the operation was successful and the id already existed (was added in this session or was previously cached)"}});
                        }
                        return fulfill({code: 204, body: {"msg": "the operation was successful and the id was new (not added in this session or was previously cached)"}});

                    })
                    // Catch for Promise.all Courses
                        .catch(function (err:any) {
                            reject({code:400, body: {"error": "Courses promise.all failed"}});
                            return;
                        });
                }


                //Add DataSet if the given DataSet is a Rooms dataSet
                if (id === "rooms") {
                    if(that.roomArray.length != 0){
                        that.roomArray = [];
                        roomDataExisted = true;
                    }
                    //Parse the index file
                    zip.forEach(function (relativePath: String, file: JSZipObject) {
                        if (file.name.endsWith("index.htm")) {
                            indexPromise = file.async("string");
                        }
                    });
                    indexPromise.then(function (result: string) {
                        let bodyIndex = null;
                        let table = null;
                        let indexData = parse5.parse(result);
                        bodyIndex = that.findTag(indexData, "body");
                        if (bodyIndex != null) {
                            table = that.findTag(bodyIndex, "table");
                        }
                        if (table != null) {
                            let tableBody = that.findTag(table, "tbody");

                            //For each Table row in the table body find all the values corresponding to the headers and set value in Buildings dictionary
                            that.getBuildingsInfo(tableBody);
                        }

                        //Parse the individual building files
                        zip.forEach(function (relativePath: String, file: JSZipObject) {
                            let fileName = "";

                            if(file.name.lastIndexOf("/") + 1 < file.name.length) {
                                fileName = file.name.substring(file.name.lastIndexOf("/") + 1, file.name.length);
                            }else{
                                fileName = file.name;
                            }
                            //If building code is present in Index then process that building file
                            if (that.buildingsByCode[fileName] != null) {
                                let promise = file.async("string");
                                promiseArray.push(promise);
                            }

                        });

                        Promise.all(promiseArray).then(function (resultarray: Array<string>) {
                            let dataRooms: any;
                            for (let a = 0; a < resultarray.length; a++) {
                                dataRooms = parse5.parse(resultarray[a]);
                                for (let i = 0; i < dataRooms.childNodes.length; i++) {
                                    if (dataRooms.childNodes[i].childNodes != null) {
                                        let body = that.findTag(dataRooms.childNodes[i], "body");
                                        let buildingField = that.findClass(body,"building-field");
                                        let roomAddressObject = that.findClass(buildingField,"field-content");
                                        let roomsTable = that.findTag(body, "table");
                                        if (roomsTable != null) {
                                            let roomsTableBody = that.findTag(roomsTable, "tbody");
                                            that.getRoomsInfo(roomsTableBody,roomAddressObject);
                                        }
                                    }
                                }
                            }

                            //loop through all the addresses and create promises
                            let latLonPromiseArray: Array<Promise<any>> = [];
                            for(let address in that.buildingsByAddress){
                                let uri = encodeURI(address);
                                let url = 'http://skaha.cs.ubc.ca:11316/api/v1/team73/' + uri;
                                let latLonPromise = that.getBuildingLocation(url);
                                console.log(latLonPromise);
                                latLonPromiseArray.push(latLonPromise);
                            }

                            Promise.all(latLonPromiseArray).then(function (resultArray: Array<GeoResponse>) {
                                that.setLatLons(resultArray);

                                //Make rooms now
                                for(let address in that.buildingsByAddress){
                                    for(let r in that.buildingsByAddress[address].rooms){
                                        let room = that.buildingsByAddress[address].rooms[r];
                                        let shortName:string = (room.roomCode) + "_" + room.roomNumber;
                                        let newRoom = new Room(room.buildingName,room.roomCode,room.roomNumber,shortName,room.roomAddress,room.lat,room.lon,room.roomCapacity,room.roomType,room.roomFurniture,room.roomInfo);
                                        that.roomArray.push(newRoom);
                                    }
                                }

                                //-------------------------------- Wrap with .then of Promise.all ----------------------------------------------------------

                                // If there are no valid Courses in dataSet then reject with code 400
                                if (that.roomArray.length == 0 && id == "rooms") {
                                    return reject({code: 400, body: {"error": "No valid Courses in data set"}});
                                }

                                //After retrieving all courses save it into disk
                                let data = JSON.stringify(that.roomArray);
                                let file = fs.writeFile(id, data, function (err: any) {
                                    if (err) {
                                        return reject({code: 400, body: {"error": err}});
                                    }
                                });
                                if(roomDataExisted){
                                    return fulfill({code: 201, body: {"msg": "the operation was successful and the id already existed (was added in this session or was previously cached)"}});
                                }
                                return fulfill({code: 204, body: {"msg": "the operation was successful and the id was new (not added in this session or was previously cached)"}});

                                //-----------------------------------------------------------------------------------------------------------------------

                            })
                            // Catch for Promise.all Latlon
                                .catch(function (err:any) {
                                    reject({code:400, body: {"error": err}});
                                    return;
                                })

                        })
                        // Catch for Promise.all Courses
                            .catch(function (err:any) {
                                reject({code:400, body: {"error": "Promise.all Rooms failed"}});
                                return;
                            });
                    })
                    // Catch for index.then
                        .catch(function (err:any) {
                            reject({code:400, body: {"error": "Index.then failed"}});
                            return;
                        });
                }
            })
            //Catch for JSZip.loadAsync
                .catch(function (err:any) {
                    reject({code:400, body: {"error": "JSZip failed"}});
                    return;
                });
        })
    }

    private setLatLons(resultArray: Array<GeoResponse>) {
        let that = this;
        let arrayKey = Object.keys(that.buildingsByAddress);
        for (let i = 0; i < resultArray.length; i++) {
            console.log(resultArray[i]);
            let latLonObject = resultArray[i];
            let address = arrayKey[i];
            for (let room in that.buildingsByAddress[address].rooms) {
                let lat:number = latLonObject.lat;
                let lon:number = latLonObject.lon;
                that.buildingsByAddress[address].rooms[room].lat = lat;
                that.buildingsByAddress[address].rooms[room].lon = lon;
            }
        }
    }

    removeDataset(id: string): Promise<InsightResponse> {
        let that = this;
        return new Promise(function (fulfill, reject) {

            if(fs.existsSync(id)){
                //delete the file and clear the cache
                fs.unlinkSync(id);

                if(id === 'courses'){
                    that.courseArray = [];
                }
                if(id == 'rooms'){
                    that.roomArray = [];
                }
                fulfill({code: 204, body:{"msg": "the operation was successful"}});
            }
            else {
                //If the file is not found reject with a 404 insight response
                reject({code:404, body: {"error": "the operation was unsuccessful because the delete was for a resource that was not previously added."}});
            }
        })
    }


    performQuery(query: any): Promise<InsightResponse> {
        let that = this;
        let isValidQuery = true;
        let resultData:Array<any> = [];
        let courses = JSON.parse(JSON.stringify(that.courseArray));
        let rooms = JSON.parse(JSON.stringify(that.roomArray));

        return new Promise(function (fulfill, reject) {

            // Validate and evaluate Courses
            if(QueryChooser.queryChooser(query)) {

                isValidQuery = QueryValidation.validateQuery(query);
                //isValidQuery = true;
                if(isValidQuery){

                    if(that.courseArray.length == 0){
                        reject({code:424, body: {"error": "no data found for this dataSet"}});
                    }

                    let queryBody = query["WHERE"];
                    let queryOptions = query["OPTIONS"];
                    let queryTransformations = query["TRANSFORMATIONS"];

                    for(let i = 0; i < that.courseArray.length; i++){
                        //If course is valid according to the filter put it in the result
                        if(Object.keys(queryBody).length == 0){
                            resultData.push(courses[i]);
                        }
                        else {
                            if (QueryEvaluation.evaluateQueryBody(queryBody, courses[i])) {
                                resultData.push(courses[i]);
                            }
                        }
                    }
                    if(queryTransformations != null) {
                        resultData = QueryEvaluation.evaluateQueryTransformations(queryTransformations,resultData);
                    }
                    //Filter the COLUMNS and perform sorting by ORDER on the result
                    resultData = QueryEvaluation.evaluateQueryOptions(queryOptions,resultData);
                    fulfill({code:200, body:{"result":resultData}});
                }
                else{
                    reject({code:400, body: {"error": "the query failed"}});
                }
            }
            //Validate and evaluate Roooms
            else{
                isValidQuery = RoomQueryValidation.validateQuery(query);
                //isValidQuery = true;
                if(isValidQuery){

                    if(that.roomArray.length == 0){
                        reject({code:424, body: {"error": "no data found for this dataSet"}});
                    }

                    let queryBody = query["WHERE"];
                    let queryOptions = query["OPTIONS"];
                    let queryTransformations = query["TRANSFORMATIONS"];

                    for(let i = 0; i < that.roomArray.length; i++){
                        //If course is valid according to the filter put it in the result
                        if(Object.keys(queryBody).length == 0){
                            resultData.push(rooms[i]);
                        }
                        else {
                            if (QueryEvaluation.evaluateQueryBody(queryBody, rooms[i])) {
                                resultData.push(rooms[i]);
                            }
                        }
                    }
                    if(queryTransformations != null) {
                        resultData = QueryEvaluation.evaluateQueryTransformations(queryTransformations,resultData);
                    }
                    //Filter the COLUMNS and perform sorting by ORDER on the result
                    resultData = QueryEvaluation.evaluateQueryOptions(queryOptions,resultData);
                    fulfill({code:200, body:{"result":resultData}});
                }
                else{
                    reject({code:400, body: {"error": "the query failed"}});
                }
            }


        });
    }


    findTag (documentObject: any, tag: string):any{
        let that = this;
        let rv:any = null;
        if(documentObject.nodeName == tag){
            return documentObject;
        }
        else{
            if(documentObject.childNodes != null) {
                for (let i = 0; i < documentObject.childNodes.length; i++) {
                    rv = that.findTag(documentObject.childNodes[i], tag);
                    if (rv != null ) {
                        return rv;
                    }
                }
            }
        }
    }

    findClass (tableRow: any, className: string):any{
        let that = this;
        let rv:any = null;
        if((tableRow.attrs!= null) && (tableRow.attrs.length) != 0 && (tableRow.attrs[0].value) == className){
            return tableRow;
        }
        else{
            if(tableRow.childNodes != null) {
                for (let i = 0; i < tableRow.childNodes.length; i++) {
                    rv = that.findClass(tableRow.childNodes[i], className);
                    if (rv != null ) {
                        return rv;
                    }
                }
            }
        }
    }

    private getBuildingsInfo(tableBody: any) {
        let that = this;
        for (let x = 0; x < tableBody.childNodes.length; x++) {
            if (tableBody.childNodes[x].childNodes != null) {
                let trBody = that.findTag(tableBody.childNodes[x], "tr");
                let buildingAdressObject = that.findClass(trBody, "views-field views-field-field-building-address");
                let buildingCodeObject = that.findClass(trBody, "views-field views-field-field-building-code");
                let buildingNameLink = that.findClass(trBody, "views-field views-field-title");
                let buildingNameObject = that.findTag(buildingNameLink, "a");

                if ((buildingCodeObject != null) && (buildingCodeObject != null) && (buildingCodeObject != null) ) {
                    let buildingCode = that.getPropertyValue(buildingCodeObject,"#text");
                    let buildingName= that.getPropertyValue(buildingNameObject,"#text");
                    let buildingAddress = that.getPropertyValue(buildingAdressObject,"#text");
                    that.buildingsByAddress[buildingAddress] = {code:buildingCode,name:buildingName,rooms:[]};
                    that.buildingsByCode[buildingCode] = {address:buildingAddress,name:buildingName,rooms:[]};
                }
            }
        }
    }

    private getRoomsInfo(tableBody:any,roomAddressObject:any){
        let that = this;
        for (let x = 0; x < tableBody.childNodes.length; x++) {
            if (tableBody.childNodes[x].childNodes != null) {
                let trBody = that.findTag(tableBody.childNodes[x], "tr");
                let roomNumberLink = that.findClass(trBody, "views-field views-field-field-room-number");
                let roomNumberObject = that.findTag(roomNumberLink, "a");
                let roomCapacityObject = that.findClass(trBody, "views-field views-field-field-room-capacity");
                let roomFurnitureObject = that.findClass(trBody, "views-field views-field-field-room-furniture");
                let roomTypeObject = that.findClass(trBody, "views-field views-field-field-room-type");
                let roomInfoLink = that.findClass(trBody, "views-field views-field-nothing");
                let roomInfoObject = that.findTag(roomInfoLink, "a");

                if ((roomNumberObject != null)&&(roomCapacityObject != null)&&(roomFurnitureObject != null)&&(roomTypeObject != null)&&(roomInfoObject != null)) {
                    let roomAddress = that.getPropertyValue(roomAddressObject,"#text");
                    let roomNumber = that.getPropertyValue(roomNumberObject,"#text");
                    let roomCapacityString:string = that.getPropertyValue(roomCapacityObject,"#text");
                    let roomCapacity = parseInt(roomCapacityString);
                    let roomFurniture = that.getPropertyValue(roomFurnitureObject,"#text");
                    let roomType = that.getPropertyValue(roomTypeObject,"#text");
                    let roomInfo = roomInfoObject.attrs[0].value;
                    let buildingCode = that.buildingsByAddress[roomAddress].code;
                    let buildingName = that.buildingsByAddress[roomAddress].name;
                    let room = {roomNumber:roomNumber,buildingName:buildingName,roomAddress:roomAddress,roomCode:buildingCode,roomCapacity:roomCapacity,roomFurniture:roomFurniture,roomType:roomType,roomInfo:roomInfo,lat:0, lon:0};
                    that.buildingsByAddress[roomAddress].rooms.push(room);
                }
            }
        }
    }

    private getPropertyValue(buildingObject:any,tag:string):string{
        let that = this;
        let valueObject = that.findTag(buildingObject,tag);
        let value:string = valueObject.value.replace("\n", "").trim();
        return value;
    }

    private getBuildingLocation(AddressURL:string):Promise<GeoResponse>{

        return new Promise((fulfill, reject)=>{
            http.get(AddressURL, (response:any) => {
                const { statusCode } = response;
                const contentType = response.headers['content-type'];

                let error;
                if (statusCode !== 200) {
                    error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
                } else if (!/^application\/json/.test(contentType)) {
                    error = new Error('Invalid content-type.\n' +
                        `Expected application/json but received ${contentType}`);
                }
                if (error) {
                    reject(error);
                    // consume response data to free up memory
                    response.resume();
                    return;
                }

                response.setEncoding('utf8');
                let rawData = '';
                response.on('data', (chunk:any) => { rawData += chunk; });
                response.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        fulfill(parsedData);
                    } catch (e) {
                        reject(e)
                    }
                });
            }).on('error', (e:any) => {
                reject({error:e});
            });
        })
    }




}