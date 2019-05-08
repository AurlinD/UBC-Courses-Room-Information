"use strict";
var QueryChooser = (function () {
    function QueryChooser() {
    }
    QueryChooser.queryChooser = function (query) {
        var hasValidOptions = false;
        for (var key in query) {
            if (key == "OPTIONS") {
                hasValidOptions = this.checkForValidColumnsAndOrder(query, key);
            }
        }
        return (hasValidOptions);
    };
    QueryChooser.checkForValidColumnsAndOrder = function (query, key) {
        var hasValidKeys = true;
        var options = query[key];
        var columnsResult;
        for (var o in options) {
            if (o == "COLUMNS") {
                var columns = query[key][o];
                columnsResult = columns;
                hasValidKeys = this.checkForValidKeys(query, columns);
            }
        }
        return (hasValidKeys);
    };
    QueryChooser.checkForValidKeys = function (query, columns) {
        var hasSkey = true;
        var hasMkey = true;
        var validKeySoFar = true;
        for (var _i = 0, columns_1 = columns; _i < columns_1.length; _i++) {
            var column = columns_1[_i];
            if (column.includes("_")) {
                hasSkey = this.hasSkeys(column);
                hasMkey = this.hasMkeys(column);
            }
            validKeySoFar = ((hasSkey || hasMkey) && validKeySoFar);
        }
        return validKeySoFar;
    };
    QueryChooser.hasMkeys = function (check) {
        if (check === 'courses_avg' || check === "courses_pass" || check === "courses_fail" || check === "courses_audit" || check === "courses_year") {
            return true;
        }
        else {
            return false;
        }
    };
    QueryChooser.hasSkeys = function (check) {
        if (check === 'courses_dept' || check === 'courses_id' || check === 'courses_instructor' || check === 'courses_title' || check === 'courses_uuid') {
            return true;
        }
        else {
            return false;
        }
    };
    return QueryChooser;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QueryChooser;
//# sourceMappingURL=QueryChooser.js.map