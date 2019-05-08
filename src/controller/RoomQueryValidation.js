"use strict";
var util_1 = require("util");
var RoomQueryValidation = (function () {
    function RoomQueryValidation() {
    }
    RoomQueryValidation.validateQuery = function (query) {
        var hasValidBody = false;
        var hasValidOptions = false;
        var ApplyList = [];
        var GroupList = [];
        var hasValidTransformation = true;
        var accessTransformation;
        accessTransformation = query["TRANSFORMATIONS"];
        var hasValidKeyword;
        for (var key in query) {
            if (key == "WHERE") {
                if (query[key] == {}) {
                    hasValidBody = true;
                }
                else {
                    hasValidBody = this.checkForValidFilter(query, key);
                }
            }
            if (key == "OPTIONS") {
                if (query.hasOwnProperty("TRANSFORMATIONS")) {
                    hasValidKeyword = this.getOrderNewKeyword(query, key, ApplyList, GroupList);
                    if (hasValidKeyword) {
                        hasValidTransformation = this.checkforValidTransformation(query, ApplyList, GroupList, accessTransformation);
                    }
                    else {
                        hasValidTransformation = false;
                    }
                }
                hasValidOptions = this.checkForValidColumnsAndOrder(query, key, ApplyList, GroupList);
            }
        }
        return (hasValidBody && hasValidOptions && hasValidTransformation);
    };
    RoomQueryValidation.checkForValidFilter = function (query, key) {
        var validFilter = true;
        var body = query[key];
        for (var filter in body) {
            validFilter = this.isValidFilter(body, filter) && validFilter;
        }
        return validFilter;
    };
    RoomQueryValidation.checkForValidColumnsAndOrder = function (query, key, ApplyList, GroupList) {
        var hasValidKeys = true;
        var orderIsValid = true;
        var options = query[key];
        var columnsResult;
        var dirValid = true;
        for (var o in options) {
            if (o == "COLUMNS") {
                var columns = query[key][o];
                columnsResult = columns;
                hasValidKeys = this.checkForValidKeys(query, columns, ApplyList);
            }
            if (o == "ORDER") {
                var order = query[key][o];
                if (typeof order == "object") {
                    for (var orderObject in order) {
                        if (orderObject == "dir") {
                            dirValid = this.hasDir(order["dir"]);
                        }
                        if (orderObject == "keys") {
                            for (var _i = 0, _a = order["keys"]; _i < _a.length; _i++) {
                                var attribute = _a[_i];
                                if (columnsResult.includes(attribute)) {
                                    orderIsValid = true && orderIsValid;
                                }
                                else {
                                    orderIsValid = this.checkForOrderKeyWord(query, attribute, ApplyList, GroupList) && orderIsValid;
                                }
                            }
                        }
                    }
                }
                if (typeof order == "string") {
                    if (columnsResult.includes(order)) {
                        orderIsValid = true;
                    }
                    else {
                        orderIsValid = RoomQueryValidation.checkForValidOrder(query, order, ApplyList);
                    }
                }
            }
        }
        return (hasValidKeys && orderIsValid && dirValid);
    };
    RoomQueryValidation.checkForOrderKeyWord = function (query, order, ApplyList, GroupList) {
        var hasSkey = false;
        var hasMkey = false;
        var ApplyListChecker = false;
        var GroupListChecker = false;
        ApplyListChecker = ApplyList.includes(order);
        GroupListChecker = GroupList.includes(order);
        return (GroupListChecker || ApplyListChecker);
    };
    RoomQueryValidation.getOrderNewKeyword = function (query, key, ApplyList, GroupList) {
        var hasValidKeys = true;
        var orderIsValid = true;
        var options = query[key];
        var columnsResult;
        var newKeyword;
        var dirValid = true;
        for (var o in options) {
            if (o == "COLUMNS") {
                var columns = query[key][o];
                columnsResult = columns;
                hasValidKeys = this.checkForNewKeys(query, columns, ApplyList, GroupList);
            }
        }
        return (hasValidKeys && orderIsValid && dirValid);
    };
    RoomQueryValidation.checkforValidTransformation = function (query, ApplyList, GroupList, accessTransformation) {
        var validGroup = false;
        var validApply = false;
        for (var o in accessTransformation) {
            if (o == "GROUP") {
                var group = accessTransformation["GROUP"];
                validGroup = this.checkforValidGroup(query, group, GroupList);
            }
            if (o == "APPLY") {
                var apply = accessTransformation[o];
                validApply = this.checkforValidApply(query, apply, ApplyList);
            }
        }
        return (validGroup && validApply);
    };
    RoomQueryValidation.checkforValidGroup = function (query, group, GroupList) {
        var hasSkey = true;
        var hasMkey = true;
        var validGroupSoFar = true;
        var groupListIncludes = false;
        if (group.length == 0) {
            validGroupSoFar = false;
        }
        else {
            for (var _i = 0, group_1 = group; _i < group_1.length; _i++) {
                var key = group_1[_i];
                hasSkey = this.hasSkeys(key);
                hasMkey = this.hasMkeys(key);
                validGroupSoFar = ((hasSkey || hasMkey) && validGroupSoFar);
            }
        }
        return validGroupSoFar;
    };
    RoomQueryValidation.checkforValidApply = function (query, apply, ApplyList) {
        var hasApplyToken = true;
        var validApply = false;
        var hasStringApply = false;
        var hasNumberApply = false;
        if (apply.length == ApplyList.length) {
            validApply = true;
            for (var _i = 0, apply_1 = apply; _i < apply_1.length; _i++) {
                var applyList = apply_1[_i];
                for (var newKeyWord in applyList) {
                    if (ApplyList.includes(newKeyWord)) {
                        for (var attribute in applyList[newKeyWord]) {
                            validApply = true && validApply;
                            if (this.applyToken(attribute)) {
                                hasNumberApply = (this.hasMkeys(applyList[newKeyWord][attribute]) && hasApplyToken);
                            }
                            if (attribute == "COUNT") {
                                hasStringApply = (this.hasMkeys(applyList[newKeyWord][attribute]) || this.hasSkeys(applyList[newKeyWord][attribute]));
                            }
                            hasApplyToken = (hasNumberApply || hasStringApply) && hasApplyToken;
                        }
                    }
                    else {
                        hasApplyToken = false;
                    }
                }
            }
        }
        return validApply && hasApplyToken;
    };
    RoomQueryValidation.checkForValidKeys = function (query, columns, applyList) {
        var hasSkey = true;
        var hasMkey = true;
        var validKeySoFar = true;
        var hasApplyKey = false;
        for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
            var column = columns_1[_i];
            hasSkey = this.hasSkeys(column);
            hasMkey = this.hasMkeys(column);
            if (applyList.includes(column)) {
                hasApplyKey = true;
            }
            validKeySoFar = ((hasSkey || hasMkey || hasApplyKey) && validKeySoFar);
        }
        return validKeySoFar;
    };
    RoomQueryValidation.checkForNewKeys = function (query, columns, ApplyList, GroupList) {
        var hasSkey = true;
        var hasMkey = true;
        var validKeySoFar = true;
        var GroupListHasItem = false;
        for (var _i = 0, columns_2 = columns; _i < columns_2.length; _i++) {
            var column = columns_2[_i];
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
                validKeySoFar = false;
        }
        return validKeySoFar && GroupListHasItem;
    };
    RoomQueryValidation.checkForValidOrder = function (query, order, applyList) {
        var hasSkey = false;
        var hasMkey = false;
        var hasApplyKey = false;
        hasSkey = this.hasSkeys(order);
        hasMkey = this.hasMkeys(order);
        if (applyList.includes(order)) {
            hasApplyKey = true;
        }
        return (hasSkey || hasMkey || hasApplyKey);
    };
    RoomQueryValidation.applyToken = function (check) {
        if (check === 'MAX' || check === 'MIN' || check === 'AVG' || check === 'SUM') {
            return true;
        }
        else {
            return false;
        }
    };
    RoomQueryValidation.hasDir = function (check) {
        if (check == 'UP' || check == 'DOWN') {
            return true;
        }
        else {
            return false;
        }
    };
    RoomQueryValidation.hasMkeys = function (check) {
        if (check === 'rooms_lat' || check === "rooms_lon" || check === "rooms_seats") {
            return true;
        }
        else {
            return false;
        }
    };
    RoomQueryValidation.hasSkeys = function (check) {
        if (check === 'rooms_fullname' || check === 'rooms_shortname' || check === 'rooms_number' || check === 'rooms_name' ||
            check === 'rooms_address' || check === 'rooms_type' || check === 'rooms_furniture' || check === 'rooms_href') {
            return true;
        }
        else {
            return false;
        }
    };
    RoomQueryValidation.isValidMcComparision = function (filterObject, filter) {
        var that = this;
        var isValidPrev = true;
        var isValid = true;
        for (var prop in filterObject) {
            if ((that.hasMkeys(prop)) && util_1.isNumber(filterObject[prop])) {
                isValid = isValidPrev && true;
                isValidPrev = isValid;
            }
            else {
                isValid = isValidPrev && false;
                isValidPrev = isValid;
            }
        }
        return isValid;
    };
    RoomQueryValidation.isValidScComparision = function (filterObject, filter) {
        var isValid = true;
        var isValidPrev = true;
        for (var prop in filterObject) {
            if ((this.hasSkeys(prop)) && util_1.isString(filterObject[prop])) {
                isValid = isValidPrev && true;
                isValidPrev = isValid;
            }
            else {
                isValid = isValidPrev && false;
                isValidPrev = isValid;
            }
        }
        return isValid;
    };
    RoomQueryValidation.isValidNegation = function (filterObject, filter) {
        var isValid = true;
        for (var prop in filterObject) {
            isValid = this.isValidFilter(filterObject, prop) && isValid;
        }
        return isValid;
    };
    RoomQueryValidation.isValidLogicComparision = function (logicArray, filter) {
        var isValid = true;
        if (logicArray.length == 0) {
            isValid = false;
        }
        for (var _i = 0, logicArray_1 = logicArray; _i < logicArray_1.length; _i++) {
            var filterObject = logicArray_1[_i];
            var filter_1 = Object.keys(filterObject)[0];
            isValid = this.isValidFilter(filterObject, filter_1) && isValid;
        }
        return isValid;
    };
    RoomQueryValidation.isValidFilter = function (query, filter) {
        var isValid = false;
        var filterObject = query[filter];
        if (filter === "LT" || filter === "GT" || filter === "EQ") {
            isValid = this.isValidMcComparision(filterObject, filter);
        }
        if (filter === "IS") {
            isValid = this.isValidScComparision(filterObject, filter);
        }
        if (filter === "NOT") {
            isValid = this.isValidNegation(filterObject, filter);
        }
        if (filter === "AND" || filter === "OR") {
            isValid = this.isValidLogicComparision(filterObject, filter);
        }
        return isValid;
    };
    return RoomQueryValidation;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RoomQueryValidation;
//# sourceMappingURL=RoomQueryValidation.js.map