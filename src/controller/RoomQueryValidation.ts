import {isNumber, isString} from "util";
import QueryValidation from "./QueryValidation";

export default class RoomQueryValidation{

    static validateQuery(query:any):boolean{

        let hasValidBody: boolean = false;
        let hasValidOptions: boolean = false;
        let ApplyList: Array<any> = [];
        let GroupList: Array<any> = [];
        let hasValidTransformation: boolean = true;
        let accessTransformation: any;
        accessTransformation = query["TRANSFORMATIONS"];
        let hasValidKeyword: boolean;

        for (let key in query) {
            //If we are in the BODY of the query validate the BODY
            if (key == "WHERE") {
                if (query[key] == {}){
                    hasValidBody = true;
                }
                else {
                    hasValidBody = this.checkForValidFilter(query, key);
                }
            }
            //If we are the OPTIONS of the query validate the OPTIONS
            if (key == "OPTIONS") {

                if(query.hasOwnProperty("TRANSFORMATIONS")){
                    hasValidKeyword = this.getOrderNewKeyword(query,key, ApplyList, GroupList);
                    if(hasValidKeyword) {
                        hasValidTransformation = this.checkforValidTransformation(query, ApplyList,GroupList, accessTransformation);
                    }
                    else{
                        hasValidTransformation = false;
                    }
                }
                hasValidOptions = this.checkForValidColumnsAndOrder(query, key,ApplyList,GroupList);
            }
        }
        return (hasValidBody && hasValidOptions && hasValidTransformation);
    }

    private static checkForValidFilter(query:any, key: any): boolean{
        //Check if query has valid filter
        let validFilter:boolean = true;
        let body = query[key];
        for (let filter in body) {// false, true
            validFilter = this.isValidFilter(body,filter) && validFilter;
        }
        return validFilter;
    }

    private static checkForValidColumnsAndOrder(query:any, key: string, ApplyList: Array<any>, GroupList: Array<any>):boolean {
        // Check to see whether query has valid COLUMNS and/or ORDER
        let hasValidKeys: boolean = true;
        let orderIsValid: boolean = true;
        let options = query[key];
        let columnsResult: Array<any>;
        let dirValid:boolean = true;

        //Check whether all key in COLUMNS are valid (property of DataSet Class)
        for (let o in options) {
            if (o == "COLUMNS") {
                let columns = query[key][o];
                columnsResult = columns;
                hasValidKeys = this.checkForValidKeys(query, columns,ApplyList);
            }
            // If there is an ORDER in query (optional) check whether it is correct
            if (o == "ORDER") {
                let order = query[key][o];
                if (typeof order == "object") {
                    //If order property is not one of the columns then it is an invalid query
                    for (let orderObject in order) {
                        if (orderObject == "dir") {
                            dirValid = this.hasDir(order["dir"]);
                        }
                        if (orderObject == "keys") {
                            for (let attribute of order["keys"]) {
                                // ORDER key is part of columns (
                                if (columnsResult.includes(attribute)) {
                                    orderIsValid = true && orderIsValid;
                                }
                                else {
                                    orderIsValid = this.checkForOrderKeyWord(query, attribute, ApplyList,GroupList) && orderIsValid;
                                }
                            }
                        }
                    }
                }
                if (typeof order == "string"){
                    if (columnsResult.includes(order)) {
                        orderIsValid = true;
                    }
                    else {
                        orderIsValid = RoomQueryValidation.checkForValidOrder(query, order,ApplyList);
                    }
                }
            }

        }
        return (hasValidKeys && orderIsValid && dirValid);
    }


    private static checkForOrderKeyWord(query:any, order:any, ApplyList: Array<any>, GroupList:Array<any>):boolean{
        //Check whether the key in Order is valid (is one of Mkey or Skey)
        let hasSkey: boolean = false;
        let hasMkey: boolean = false;
        let ApplyListChecker: boolean = false;
        let GroupListChecker: boolean = false;


        // hasSkey = this.hasSkeys(order);
        // hasMkey = this.hasMkeys(order);
        ApplyListChecker= ApplyList.includes(order);
        GroupListChecker= GroupList.includes(order);


        return (/*hasSkey||hasMkey*/ GroupListChecker || ApplyListChecker);
    }
    // returns array of new key words in columns
    private static getOrderNewKeyword(query:any, key: string, ApplyList: Array<any>, GroupList: Array<any> ):boolean{
        // Check to see whether query has valid COLUMNS and/or ORDER
        let hasValidKeys: boolean = true;
        let orderIsValid:boolean = true;
        let options = query[key];
        let columnsResult:Array<any>;
        let newKeyword:Array<any>;
        let dirValid:boolean = true;

        //Check whether all key in COLUMNS are valid (property of DataSet Class)
        for (let o in options) {
            if (o == "COLUMNS") {
                let columns = query[key][o];
                columnsResult = columns;
                hasValidKeys =this.checkForNewKeys(query, columns, ApplyList, GroupList);
            }

        }
        return (hasValidKeys && orderIsValid && dirValid);
    }
    // boolean check to see if newkeyword list from columns matches apply newkeyword list
    private static checkforValidTransformation (query:any, ApplyList: Array<any>, GroupList: Array<any>, accessTransformation: any):boolean {
        let validGroup: boolean = false;
        let validApply: boolean = false;

        //Check whether all key in Group are valid
        for (let o in accessTransformation){
            if (o == "GROUP"){
                let group = accessTransformation["GROUP"];
                validGroup = this.checkforValidGroup(query, group, GroupList);
            }
            // Check if all key in APPLY are valid
            if(o == "APPLY"){
                let apply = accessTransformation[o];
                validApply = this.checkforValidApply(query, apply, ApplyList);
            }
        }
        return (validGroup && validApply)
    }
    //helper for Group
    private static checkforValidGroup(query:any, group: any, GroupList:Array<any>): boolean{
        let hasSkey: boolean = true;
        let hasMkey: boolean = true;
        let validGroupSoFar: boolean = true;
        let groupListIncludes: boolean = false;
        if (group.length == 0){
            validGroupSoFar = false;
        }
        else {
            for (let GroupListItem of GroupList) {
                if (!(group.includes(GroupListItem))) {
                    validGroupSoFar = false;
                }
            }

            for (let key of group) {

                hasSkey = this.hasSkeys(key);
                hasMkey = this.hasMkeys(key);


                validGroupSoFar = ((hasSkey || hasMkey) && validGroupSoFar);

            }
        }
        return validGroupSoFar;


    }
    //helper for Apply
    private static checkforValidApply(query:any, apply: any, ApplyList: Array<any>): boolean{
        let hasApplyToken: boolean = true;
        let validApply:boolean = false;
        let hasStringApply:boolean = false;
        let hasNumberApply:boolean = false;

        if (apply.length == ApplyList.length) {
            validApply = true;
            for (let applyList of apply) {
                for (let newKeyWord in applyList) {

                    if (ApplyList.includes(newKeyWord)) {
                        for (let attribute in applyList[newKeyWord]) {


                            validApply = true && validApply;
                            // checks MAX/MIN key BUT not count
                            if (this.applyToken(attribute)){
                                hasNumberApply = (this.hasMkeys(applyList[newKeyWord][attribute]) && hasApplyToken);
                            }
                            // checks if attribute is COUNT
                            if (attribute == "COUNT") {

                                hasStringApply = (this.hasMkeys(applyList[newKeyWord][attribute]) || this.hasSkeys(applyList[newKeyWord][attribute]));
                            }
                            hasApplyToken= (hasNumberApply || hasStringApply) && hasApplyToken;
                        }
                    }
                    else {
                        hasApplyToken = false;
                    }
                }
            }
        }
        return validApply && hasApplyToken;
    }









    private static checkForValidKeys(query:any, columns:Array<any>,applyList:Array<any>):boolean{
        //Check whether all of the keys in columns are valid (is one of Mkey or Skey)
        let hasSkey: boolean = true;
        let hasMkey: boolean = true;
        let validKeySoFar: boolean = true;
        let hasApplyKey:boolean = false;

        for(let column of columns){
            hasSkey = this.hasSkeys(column);
            hasMkey = this.hasMkeys(column);
            if(applyList.includes(column)){
                hasApplyKey = true;
            }
            validKeySoFar = ((hasSkey || hasMkey || hasApplyKey) && validKeySoFar);
        }

        return validKeySoFar;
    }

    private static checkForNewKeys(query:any, columns:any, ApplyList:Array<any>, GroupList:Array<any> ):boolean{
        //Check whether all of the keys in columns are valid (is one of Mkey or Skey)
        let hasSkey: boolean = true;
        let hasMkey: boolean = true;
        let validKeySoFar: boolean = true;
        let GroupListHasItem:boolean = false;


        for(let column of columns) {
            hasSkey = this.hasSkeys(column);
            hasMkey = this.hasMkeys(column);

            if ((!(hasSkey || hasMkey)) && (!column.includes("_"))) {
                if (!ApplyList.includes(column)) {
                    ApplyList.push(column);
                }
                else {
                    validKeySoFar = false;
                }
            }
            if (hasMkey || hasSkey) {
                GroupListHasItem = true;
                GroupList.push(column);
            }
            if ((!(hasSkey || hasMkey)) && (column.includes("_")))
                validKeySoFar =false;
        }

        return validKeySoFar && GroupListHasItem;
    }

    private static checkForValidOrder(query:any, order:any,applyList:Array<any>):boolean{
        //Check whether the key in Order is valid (is one of Mkey or Skey)
        let hasSkey: boolean = false;
        let hasMkey: boolean = false;
        let hasApplyKey: boolean = false;


        hasSkey = this.hasSkeys(order);
        hasMkey = this.hasMkeys(order);
        if(applyList.includes(order)){
            hasApplyKey = true;
        }

        return (hasSkey||hasMkey|| hasApplyKey);
    }

    private static applyToken(check:string):boolean{
        if(check === 'MAX'||check === 'MIN' || check === 'AVG' || check === 'SUM'){
            return true;
        }
        else{
            return false;
        }
    }
    private static hasDir (check:string):boolean {
        if (check == 'UP' || check =='DOWN'){
            return true;
        }
        else{
            return false;
        }
    }

    private static hasMkeys(check:string):boolean{
        if(check === 'rooms_lat'||check === "rooms_lon"|| check === "rooms_seats"){
            return true;
        }
        else{
            return false;
        }
    }

    private static hasSkeys(check:string):boolean{
        if(check === 'rooms_fullname'|| check ==='rooms_shortname'||check === 'rooms_number'|| check === 'rooms_name'||
            check === 'rooms_address' || check === 'rooms_type' || check === 'rooms_furniture' || check === 'rooms_href'){
            return true;
        }
        else{
            return false;
        }
    }

    private static isValidMcComparision(filterObject:any, filter:any):boolean{
        let that = this;
        let isValidPrev:boolean = true;
        let isValid: boolean = true;
        for(let prop in filterObject){
            if((that.hasMkeys(prop))&& isNumber(filterObject[prop])) {
                isValid = isValidPrev && true;
                isValidPrev = isValid;
            }
            else{
                isValid = isValidPrev && false;
                isValidPrev = isValid;
            }
        }
        return isValid;
    }

    private static isValidScComparision(filterObject:any, filter:any):boolean{
        let isValid: boolean = true;
        let isValidPrev:boolean = true;
        for (let prop in filterObject) {
            if ((this.hasSkeys(prop)) && isString(filterObject[prop])) {
                isValid = isValidPrev && true;
                isValidPrev = isValid;
            }
            else{
                isValid = isValidPrev && false;
                isValidPrev = isValid;
            }
        }
        return isValid;
    }

    private static isValidNegation(filterObject:any,filter:any):boolean{
        let isValid: boolean = true;
        for (let prop in filterObject) {
            isValid = this.isValidFilter(filterObject, prop) && isValid;
        }
        return isValid;
    }

    private static isValidLogicComparision(logicArray:any[],filter:any):boolean{
        let isValid: boolean = true;

        //If AND or OR query do not have any members inside them then it is an invalid query
        if(logicArray.length == 0){
            isValid = false;
        }
        for (let filterObject of logicArray) {
            let filter = Object.keys(filterObject)[0];
            //Need to check whether each element in Logic comparision is a filter or not
            isValid = this.isValidFilter(filterObject, filter) && isValid;
        }
        return isValid;
    }

    private static isValidFilter(query:any,filter:any):boolean {
        let isValid = false;
        let filterObject = query[filter];

        // Check for MC Comparision
        if (filter === "LT" || filter === "GT" || filter === "EQ") {
            isValid = this.isValidMcComparision(filterObject, filter);
        }
        //Check for SCOMPARISION
        if (filter === "IS") {
            isValid = this.isValidScComparision(filterObject, filter);
        }
        //Check for NEGATION
        if (filter === "NOT") {
            isValid = this.isValidNegation(filterObject, filter);
        }
        //Check for Logic Comparision
        if (filter === "AND" || filter === "OR") {
            isValid = this.isValidLogicComparision(filterObject, filter);
        }
        return isValid;
    }

}