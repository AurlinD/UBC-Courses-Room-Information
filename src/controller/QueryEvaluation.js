"use strict";
var Decimal = require('decimal.js');
var QueryEvaluation = (function () {
    function QueryEvaluation() {
    }
    QueryEvaluation.evaluateQueryBody = function (queryBody, roomsArray) {
        this.course = JSON.parse(JSON.stringify(roomsArray));
        var isValid = false;
        for (var filter in queryBody) {
            isValid = this.chooseFilter(queryBody, filter, this.course);
        }
        return isValid;
    };
    QueryEvaluation.chooseFilter = function (queryBody, filter, course) {
        var filterObject = queryBody[filter];
        var isValid = false;
        if (filter == "LT" || filter == "GT" || filter == "EQ" || filter == "IS") {
            isValid = this.doComparision(filterObject, filter, course);
        }
        if (filter == "NOT") {
            isValid = this.doNegation(filterObject, course);
        }
        if (filter == "AND") {
            isValid = this.performAndComparision(filterObject, course);
        }
        if (filter == "OR") {
            isValid = this.performOrComparision(filterObject, course);
        }
        return isValid;
    };
    QueryEvaluation.evaluateQueryOptions = function (queryOptions, array) {
        var filteredColumns = false;
        for (var option in queryOptions) {
            if (option == "COLUMNS") {
                filteredColumns = true;
                var columns = queryOptions[option];
                array = this.chooseColumns(columns, array);
            }
            if (option == "ORDER" && filteredColumns) {
                var order = queryOptions[option];
                if (typeof order == "string") {
                    array = this.ascendingSort(array, order);
                }
                if (typeof order == "object") {
                    var direction = order["dir"];
                    if (direction == "UP") {
                        array = this.ascendingSort(array, order);
                    }
                    if (direction == "DOWN") {
                        array = this.descendingSort(array, order);
                    }
                }
            }
        }
        return array;
    };
    QueryEvaluation.ascendingSort = function (array, order) {
        array = array.sort(function (a, b) {
            if (typeof order == "string") {
                if (a[order] !== b[order]) {
                    return ((a[order] > b[order]) ? 1 : -1);
                }
                else {
                    return 0;
                }
            }
            else {
                for (var _i = 0, _a = order["keys"]; _i < _a.length; _i++) {
                    var key = _a[_i];
                    if (a[key] != b[key]) {
                        return ((a[key] > b[key]) ? 1 : -1);
                    }
                    else {
                        continue;
                    }
                }
            }
        });
        return array;
    };
    QueryEvaluation.descendingSort = function (array, order) {
        array = array.sort(function (a, b) {
            for (var _i = 0, _a = order["keys"]; _i < _a.length; _i++) {
                var key = _a[_i];
                if (a[key] !== b[key]) {
                    return ((a[key] < b[key]) ? 1 : -1);
                }
                else {
                    continue;
                }
            }
        });
        return array;
    };
    QueryEvaluation.evaluateQueryTransformations = function (queryOptions, array) {
        var groupResultObject = null;
        var groupResultArray = [];
        for (var transformation in queryOptions) {
            if (transformation == "GROUP") {
                var groups = queryOptions[transformation];
                groupResultObject = this.doGrouping(groups, array);
                for (var group in groupResultObject) {
                    var groupArray = [];
                    groupResultArray.push(groupResultObject[group]);
                }
            }
            if (transformation == "APPLY") {
                var resultArray = [];
                var applys = queryOptions[transformation];
                if (applys.length == 0) {
                    for (var result in groupResultArray) {
                        resultArray.push(groupResultArray[result][0]);
                    }
                    array = resultArray;
                }
                else {
                    array = this.chooseApply(applys, groupResultArray);
                    var reducedArray = [];
                    for (var item in array) {
                        var a = array[item];
                        reducedArray.push(a[a.length - 1]);
                    }
                    array = reducedArray;
                }
            }
        }
        return array;
    };
    QueryEvaluation.doGrouping = function (queryGroup, array) {
        var groupedResult = {};
        for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
            var item = array_1[_i];
            var key = "";
            for (var _a = 0, queryGroup_1 = queryGroup; _a < queryGroup_1.length; _a++) {
                var group = queryGroup_1[_a];
                key += item[group];
            }
            if (groupedResult[key] == null) {
                groupedResult[key] = [item];
            }
            else {
                groupedResult[key].push(item);
            }
        }
        return groupedResult;
    };
    QueryEvaluation.chooseApply = function (applys, groupArray) {
        for (var _i = 0, applys_1 = applys; _i < applys_1.length; _i++) {
            var apply = applys_1[_i];
            for (var newKeyword in apply) {
                for (var filter in apply[newKeyword]) {
                    var filterValue = apply[newKeyword][filter];
                    if (filter == "MAX") {
                        groupArray = this.helperMAX(newKeyword, filterValue, groupArray);
                    }
                    if (filter == "MIN") {
                        groupArray = this.helperMIN(newKeyword, filterValue, groupArray);
                    }
                    if (filter == "AVG") {
                        groupArray = this.helperAVG(newKeyword, filterValue, groupArray);
                    }
                    if (filter == "SUM") {
                        groupArray = this.helperSUM(newKeyword, filterValue, groupArray);
                    }
                    if (filter == "COUNT") {
                        groupArray = this.helperCOUNT(newKeyword, filterValue, groupArray);
                    }
                }
            }
        }
        return groupArray;
    };
    QueryEvaluation.helperMAX = function (filter, filterValue, groupArray) {
        var resultArray = [];
        for (var result in groupArray) {
            var maxSoFar = groupArray[result][0];
            for (var _i = 0, _a = groupArray[result]; _i < _a.length; _i++) {
                var item = _a[_i];
                if (item[filterValue] > maxSoFar[filterValue]) {
                    maxSoFar = item;
                }
                item[filter] = maxSoFar[filterValue];
            }
        }
        return groupArray;
    };
    QueryEvaluation.helperMIN = function (filter, filterValue, groupArray) {
        var resultArray = [];
        for (var result in groupArray) {
            var minSoFar = groupArray[result][0];
            for (var _i = 0, _a = groupArray[result]; _i < _a.length; _i++) {
                var item = _a[_i];
                if (item[filterValue] < minSoFar[filterValue]) {
                    minSoFar = item;
                }
                item[filter] = minSoFar[filterValue];
            }
        }
        return groupArray;
    };
    QueryEvaluation.helperAVG = function (filter, filterValue, groupArray) {
        var resultArray = [];
        for (var result in groupArray) {
            var sum = 0;
            for (var _i = 0, _a = groupArray[result]; _i < _a.length; _i++) {
                var item = _a[_i];
                var itemToAdd = item[filterValue];
                sum += Number(new Decimal(itemToAdd).toFixed(2));
                var avg = Number(new Decimal(sum / groupArray[result].length).toFixed(2));
                item[filter] = avg;
            }
        }
        return groupArray;
    };
    QueryEvaluation.helperSUM = function (filter, filterValue, groupArray) {
        var resultArray = [];
        for (var result in groupArray) {
            var sum = 0;
            for (var _i = 0, _a = groupArray[result]; _i < _a.length; _i++) {
                var item = _a[_i];
                sum += item[filterValue];
                var sumDecimal = Number(new Decimal(sum).toFixed(2));
                item[filter] = sumDecimal;
            }
        }
        return groupArray;
    };
    QueryEvaluation.helperCOUNT = function (filter, filterValue, groupArray) {
        var resultArray = [];
        for (var result in groupArray) {
            var valuesSoFar = [];
            var countValue = 0;
            for (var _i = 0, _a = groupArray[result]; _i < _a.length; _i++) {
                var item = _a[_i];
                var valueToCheck = item[filterValue];
                if (item[filterValue] != null && !(valuesSoFar.includes(valueToCheck))) {
                    countValue++;
                }
                valuesSoFar.push(valueToCheck);
                item[filter] = countValue;
            }
        }
        return groupArray;
    };
    QueryEvaluation.chooseColumns = function (columns, array) {
        for (var course in array) {
            for (var key in array[course]) {
                if (!columns.includes(key)) {
                    delete array[course][key];
                }
            }
        }
        return array;
    };
    QueryEvaluation.sort = function (order, array, direction) {
        array = this.quickSort(array, order, 0, array.length - 1, direction);
        return array;
    };
    QueryEvaluation.doComparision = function (filterObject, filter, course) {
        var that = this;
        var isValid = false;
        for (var prop in filterObject) {
            var value = filterObject[prop];
            isValid = this.performFilterOnCourses(filter, prop, value, course);
        }
        return isValid;
    };
    QueryEvaluation.doNegation = function (filterObject, course) {
        var isValid = false;
        for (var filter in filterObject) {
            isValid = !(this.chooseFilter(filterObject, filter, course));
        }
        return isValid;
    };
    QueryEvaluation.performAndComparision = function (logicArray, course) {
        var result = true;
        var finalResult = null;
        for (var _i = 0, logicArray_1 = logicArray; _i < logicArray_1.length; _i++) {
            var filterObject = logicArray_1[_i];
            var filter = Object.keys(filterObject)[0];
            result = this.chooseFilter(filterObject, filter, course);
            if (finalResult == null) {
                finalResult = result;
            }
            finalResult = finalResult && result;
        }
        return finalResult;
    };
    QueryEvaluation.performOrComparision = function (logicArray, course) {
        var result = true;
        var finalResult = false;
        for (var _i = 0, logicArray_2 = logicArray; _i < logicArray_2.length; _i++) {
            var filterObject = logicArray_2[_i];
            var filter = Object.keys(filterObject)[0];
            result = this.chooseFilter(filterObject, filter, course);
            if (finalResult == null) {
                finalResult = result;
            }
            finalResult = result || finalResult;
        }
        return finalResult;
    };
    QueryEvaluation.performFilterOnCourses = function (filter, prop, value, course) {
        var isValid = false;
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
                var queryString = value;
                var dataString = course[prop];
                var isPartialString = false;
                isPartialString = QueryEvaluation.checkForPartialString(queryString, dataString);
                if (dataString == queryString || isPartialString) {
                    isValid = true;
                }
                break;
        }
        return isValid;
    };
    QueryEvaluation.checkForPartialString = function (queryString, dataSetString) {
        if (queryString.includes("*")) {
            if ((queryString.startsWith("*")) && queryString.endsWith("*")) {
                queryString = queryString.replace("*", '');
                queryString = queryString.replace("*", '');
                if (dataSetString.includes(queryString)) {
                    return true;
                }
            }
            if (queryString.endsWith("*")) {
                queryString = queryString.replace("*", '');
                if (dataSetString.startsWith(queryString)) {
                    return true;
                }
            }
            if (queryString.startsWith("*")) {
                queryString = queryString.replace("*", '');
                if (dataSetString.endsWith(queryString)) {
                    return true;
                }
            }
        }
        return false;
    };
    QueryEvaluation.quickSort = function (array, order, left, right, direction) {
        var pivot = array.length;
        var partitionIndex = array.length;
        if (left < right) {
            pivot = right;
            if (direction == "UP") {
                partitionIndex = this.partitionUp(array, order, pivot, left, right);
            }
            if (direction == "DOWN") {
                partitionIndex = this.partitionDown(array, order, pivot, left, right);
            }
            this.quickSort(array, order, left, partitionIndex - 1, direction);
            this.quickSort(array, order, partitionIndex + 1, right, direction);
        }
        return array;
    };
    QueryEvaluation.partitionUp = function (array, order, pivot, left, right) {
        var pivotValue = array[pivot][order];
        var partitionIndex = left;
        for (var i = left; i < right; i++) {
            if (array[i][order] < pivotValue) {
                this.swap(array, i, partitionIndex);
                partitionIndex++;
            }
        }
        this.swap(array, right, partitionIndex);
        return partitionIndex;
    };
    QueryEvaluation.partitionDown = function (array, order, pivot, left, right) {
        var pivotValue = array[pivot][order];
        var partitionIndex = left;
        for (var i = left; i < right; i++) {
            if (array[i][order] > pivotValue) {
                this.swap(array, i, partitionIndex);
                partitionIndex++;
            }
        }
        this.swap(array, right, partitionIndex);
        return partitionIndex;
    };
    QueryEvaluation.swap = function (array, i, j) {
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    };
    return QueryEvaluation;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QueryEvaluation;
//# sourceMappingURL=QueryEvaluation.js.map