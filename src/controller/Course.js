"use strict";
var Course = (function () {
    function Course(courses_dept, courses_id, courses_avg, courses_instructor, courses_title, courses_pass, courses_fail, courses_audit, courses_uuid, courses_year) {
        this.courses_dept = courses_dept;
        this.courses_id = courses_id;
        this.courses_avg = courses_avg;
        this.courses_instructor = courses_instructor;
        this.courses_title = courses_title;
        this.courses_pass = courses_pass;
        this.courses_fail = courses_fail;
        this.courses_audit = courses_audit;
        this.courses_uuid = courses_uuid;
        this.courses_year = courses_year;
    }
    return Course;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Course;
//# sourceMappingURL=Course.js.map