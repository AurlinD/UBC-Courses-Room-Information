import {isNumber, isString} from "util";

export default class QueryChooser {


    static queryChooser(query: any): boolean {

        let hasValidOptions: boolean = false;

        for (let key in query) {
            //If we are the OPTIONS of the query validate the OPTIONS
            if (key == "OPTIONS") {
                hasValidOptions = this.checkForValidColumnsAndOrder(query, key);
            }
        }
        return (hasValidOptions);
    }

    private static checkForValidColumnsAndOrder(query: any, key: string): boolean {
        // Check to see whether query has valid COLUMNS and/or ORDER
        let hasValidKeys: boolean = true;
        let options = query[key];
        let columnsResult: Array<any>;

        //Check whether all key in COLUMNS are valid (property of DataSet Class)
        for (let o in options) {

            if (o == "COLUMNS") {
                let columns = query[key][o];
                columnsResult = columns;
                hasValidKeys = this.checkForValidKeys(query, columns);
            }

        }
        return (hasValidKeys);
    }

    private static checkForValidKeys(query: any, columns: Array<any>): boolean {
        //Check whether all of the keys in columns are valid (is one of Mkey or Skey)
        let hasSkey: boolean = true;
        let hasMkey: boolean = true;
        let validKeySoFar: boolean = true;

        for (let column of columns) {
            if (column.includes("_")) {
                hasSkey = this.hasSkeys(column);
                hasMkey = this.hasMkeys(column);
            }

            validKeySoFar = ((hasSkey || hasMkey) && validKeySoFar)

        }
        return validKeySoFar;

    }

    private static hasMkeys(check: string): boolean {
        if (check === 'courses_avg' || check === "courses_pass" || check === "courses_fail" || check === "courses_audit" || check === "courses_year") {
            return true;
        }
        else {
            return false;
        }
    }

    private static hasSkeys(check: string): boolean {
        if (check === 'courses_dept' || check === 'courses_id' || check === 'courses_instructor' || check === 'courses_title' || check === 'courses_uuid') {
            return true;
        }
        else {
            return false;
        }
    }
}