

import {isNullOrUndefined} from "util";
let Decimal = require('decimal.js');

export default class QueryEvaluation{

    private static course:any;


    static evaluateQueryBody(queryBody:any, roomsArray:Array<any>):boolean{
        this.course = JSON.parse(JSON.stringify(roomsArray));
        let isValid = false;

        // Perform filter on the body of the Query
        for (let filter in queryBody) {
            isValid = this.chooseFilter(queryBody, filter,this.course);
        }
        return isValid;
    }

    private static chooseFilter(queryBody:any, filter:any, course:any):boolean {

        let filterObject = queryBody[filter];
        let isValid = false;
        // Check for MC and SC Comparision
        if (filter == "LT" || filter == "GT" || filter == "EQ" || filter == "IS") {
            isValid = this.doComparision(filterObject,filter,course)
        }
        //Check for NEGATION
        if (filter == "NOT") {
            isValid = this.doNegation(filterObject,course);
        }
        //Check for AND Comparision
        if (filter == "AND") {
            isValid = this.performAndComparision(filterObject,course);
        }
        //Check for OR Comparision
        if(filter == "OR"){
            isValid = this.performOrComparision(filterObject,course);
        }
        return isValid;
    }


    static evaluateQueryOptions(queryOptions:any, array:Array<any>):Array<any>{
        // Check to see whether query has valid COLUMNS AND/OR ORDER
        let filteredColumns = false;

        //Choose the columns that are specified in the Query
        for (let option in queryOptions) {
            if (option == "COLUMNS") {
                filteredColumns = true;
                let columns = queryOptions[option];
                array = this.chooseColumns(columns,array);
            }
            // If there is an ORDER in query (optional) then sort the result according to the ORDER
            if (option == "ORDER" && filteredColumns){
                let order = queryOptions[option];
                if(typeof order == "string") {
                    //array = this.sort(order, array,"UP");
                    array = this.ascendingSort(array,order);
                }
                if(typeof order == "object") {
                    let direction:string = order["dir"];

                    //Do the primary and secondary sorting (Primary sorting is at index 0)
                        if(direction == "UP"){
                            //array = this.sort(key, array,"UP");
                            array = this.ascendingSort(array, order);
                        }
                        if(direction == "DOWN"){
                           array = this.descendingSort(array,order);
                            //array = this.sort(key, array,"DOWN");
                        }
                }
            }
        }
        return array;
    }

    private static ascendingSort(array: Array<any>, order: any) {
        array = array.sort(function (a, b) {
            if(typeof order == "string"){
                if (a[order] !== b[order]) {
                    return ((a[order] > b[order] ) ? 1 : -1);
                }
                else {
                    return 0;
                }
            }
            else {
                for (let key of order["keys"]) {
                    if (a[key] != b[key]) {
                        return ((a[key] > b[key] ) ? 1 : -1);
                    }
                    else {
                        continue;
                    }
                }
            }
        });
        return array;
    }

    private static descendingSort(array: Array<any>, order: any) {
        array = array.sort(function (a, b) {
            for (let key of order["keys"]) {
                if (a[key] !== b[key]) {
                    return ((a[key] < b[key] ) ? 1 : -1);
                }
                else {
                    continue;
                }

            }
        });
        return array;
    }

// insight facade is going to call this function for transformation -----------------------------------------
    static evaluateQueryTransformations(queryOptions:any, array:Array<any>, ):Array<any> {
        let groupResultObject:any = null;
        let groupResultArray:any = [];
        for (let transformation in queryOptions) {
            if (transformation == "GROUP") {
                let groups = queryOptions[transformation];
                groupResultObject = this.doGrouping(groups,array);

                for(let group in groupResultObject){
                    let groupArray = [];
                    groupResultArray.push(groupResultObject[group]);
                }
            }

            if (transformation == "APPLY"){
                let resultArray = [];
                let applys = queryOptions[transformation];
                if(applys.length == 0){
                    for(let result in groupResultArray){
                        resultArray.push(groupResultArray[result][0]);
                    }
                    array = resultArray;
                }
                else {
                    array = this.chooseApply(applys, groupResultArray);
                    let reducedArray = [];
                    for(let item in array){
                        let a = array[item];
                        reducedArray.push(a[a.length-1]);
                    }
                    array = reducedArray;
                }
            }
        }
        return array;
    }

    private static doGrouping(queryGroup:any,array:Array<any>):any{
        let groupedResult:any = {};
        for(let item of array){
            let key = "";
            for(let group of queryGroup){
                key += item[group];
            }
            if(groupedResult[key] == null){
                groupedResult[key]
                    groupedResult = [item];
            }
            else{
                groupedResult[key].push(item);
            }
        }
        return groupedResult;
    }

    private static chooseApply(applys:any[],groupArray:Array<any>):Array<any>{
        for (let apply of applys){
            for (let newKeyword in apply){
                for(let filter in apply[newKeyword]) {
                    let filterValue = apply[newKeyword][filter];
                    if (filter == "MAX"){
                        // max helper
                        groupArray = this.helperMAX(newKeyword,filterValue,groupArray);
                    }
                    if (filter == "MIN"){
                        // min helper
                        groupArray = this.helperMIN(newKeyword,filterValue,groupArray);
                    }
                    if (filter == "AVG"){
                        // avg helper
                        groupArray = this.helperAVG(newKeyword,filterValue,groupArray);
                    }
                    if (filter == "SUM"){
                        // sum helper
                        groupArray = this.helperSUM(newKeyword,filterValue,groupArray);
                    }
                    if (filter == "COUNT"){
                        // count helper
                        groupArray = this.helperCOUNT(newKeyword,filterValue,groupArray);
                    }
                }
            }
        }
        return groupArray;
    }

    private static helperMAX(filter: any,filterValue:string,groupArray:Array<any>) :Array<any>{
        let resultArray:Array<any> = [];
        for(let result in groupArray){
            let maxSoFar = groupArray[result][0];
            for(let item of groupArray[result]){
                if(item[filterValue] > maxSoFar[filterValue]){
                    maxSoFar = item;
                }
                item[filter] = maxSoFar[filterValue]
            }
        }
        return groupArray;
    }

    private static helperMIN(filter: string,filterValue:string,groupArray:Array<any>) :Array<any>{
        let resultArray:Array<any> = [];
        for(let result in groupArray){
            let minSoFar = groupArray[result][0];
            for(let item of groupArray[result]){
                if(item[filterValue] < minSoFar[filterValue]){
                    minSoFar = item;
                }
                item[filter] = minSoFar[filterValue];
            }
        }
        return groupArray;
    }

    private static helperAVG(filter: string,filterValue:string,groupArray:Array<any>) :Array<any>{
        for(let result in groupArray){
            let average: number = Number((groupArray[result].map((val:any) => <any>new Decimal(val[filterValue])).reduce((a:any,b:any) => a.plus(b)).toNumber() / groupArray[result].length).toFixed(2));
            for (let item of groupArray[result]){
                item[filter] = average;
            }
        }
        return groupArray;
    }

    private static helperSUM(filter: string,filterValue:string,groupArray:Array<any>) :Array<any>{
        for(let result in groupArray){
            let sum = Number(groupArray[result].map((val:any) => new Decimal(val[filterValue])).reduce((a:any,b:any) => a.plus(b)).toNumber().toFixed(2));
            for (let item of groupArray[result]){
                item[filter] = sum;
            }
        }
        return groupArray;
    }

    private static helperCOUNT(filter: string,filterValue:string,groupArray:Array<any>) :Array<any>{
        for(let result in groupArray){
            let valuesSoFar:Array<any> = [];
            let countValue = 0;
            for(let item of groupArray[result]){
                let valueToCheck = item[filterValue];
                if(item[filterValue] != null && !(valuesSoFar.includes(valueToCheck))){
                  countValue++;
                }
                valuesSoFar.push(valueToCheck);
                item[filter] = countValue;
            }
        }
        return groupArray;
    }


    private static chooseColumns(columns:any[], array:Array<any>):Array<any>{
        //Filter the columns
        for (let course in array) {
            for(let key in array[course]){
                if(!columns.includes(key)){
                    delete array[course][key];
                }
            }
        }
        return array;
    }


    private static doComparision(filterObject:any,filter:any, course:Object):boolean{
        let that = this;
        let isValid = false;
        for(let prop in filterObject){
            let value = filterObject[prop];
            isValid = this.performFilterOnCourses(filter, prop, value,course);
        }
        return isValid;
    }

    private static doNegation(filterObject:any, course:Object):boolean{
        let isValid = false;
        for (let filter in filterObject) {
            isValid = !(this.chooseFilter(filterObject,filter,course));
        }
        return isValid;
    }


    private static performAndComparision(logicArray:any[], course:any):boolean{
        let result = true;
        let finalResult = null;

        for(let filterObject of logicArray){
            let filter = Object.keys(filterObject)[0];
            result = this.chooseFilter(filterObject,filter,course);

            if(finalResult == null) {
                finalResult = result;
            }
            finalResult = finalResult && result;
        }
        return finalResult;
    }


    private static performOrComparision(logicArray:any[], course:any):boolean {
        let result = true;
        let finalResult = false;

        for(let filterObject of logicArray){
            let filter = Object.keys(filterObject)[0];
            result = this.chooseFilter(filterObject,filter,course);

            if(finalResult == null) {
                finalResult = result;
            }
            finalResult = result || finalResult;
        }
        return finalResult;
    }

    private static performFilterOnCourses(filter: any, prop: string, value: any, course:any):boolean {
        let isValid = false;
        switch (filter) {
            case "GT":
                if (course[prop] > value) {
                    isValid = true;
                }
                break;
            case "LT":
                if (course[prop] < value) {
                    isValid = true;
                }
                break;
            case "EQ":
                if (course[prop] == value) {
                    isValid = true;
                }
                break;
            case "IS":
                let queryString:string = value;
                let dataString:string = course[prop];
                let isPartialString:boolean = false;

                isPartialString = QueryEvaluation.checkForPartialString(queryString,dataString);

                if (dataString == queryString || isPartialString) {
                    isValid = true;
                }
                break;
        }
        return isValid;
    }


    private static checkForPartialString(queryString:string,dataSetString:string):boolean{

        if(queryString.includes("*")){

            //Case 1
            if((queryString.startsWith("*")) && queryString.endsWith("*")) {
                queryString = queryString.replace("*",'');
                queryString = queryString.replace("*",'');
                if (dataSetString.includes(queryString)) {
                    return true;
                }
            }
            //Case 2
            if(queryString.endsWith("*")) {
                queryString = queryString.replace("*",'');
                if (dataSetString.startsWith(queryString)) {
                    return true;
                }
            }
            //Case 3
            if(queryString.startsWith("*")) {
                queryString = queryString.replace("*",'');
                if (dataSetString.endsWith(queryString)) {
                    return true;
                }
            }
        }
        return false;
    }


}