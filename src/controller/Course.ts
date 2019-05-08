
export default class Course {

    courses_dept: string; //The department that offered the course.
    courses_id: string;//The course number (will be treated as a string, e.g., 499b).
    courses_avg: number; //The average of the course offering.
    courses_instructor: string; //The instructor teaching the course offering.
    courses_title: string; //The name of the course.
    courses_pass: number; //The number of students that passed the course offering.
    courses_fail: number; //The number of students that failed the course offering.
    courses_audit: number; //The number of students that audited the course offering.
    courses_uuid: string; //The unique id of a course offering.
    courses_year: number;


    constructor(courses_dept: string,courses_id:string,courses_avg:number,courses_instructor:string,
                courses_title :string, courses_pass :number, courses_fail:number,courses_audit:number
        ,courses_uuid:string, courses_year:number) {

        this.courses_dept = courses_dept ;
        this.courses_id = courses_id;
        this.courses_avg= courses_avg;
        this.courses_instructor = courses_instructor;
        this.courses_title= courses_title;
        this.courses_pass = courses_pass;
        this.courses_fail= courses_fail;
        this.courses_audit= courses_audit;
        this.courses_uuid = courses_uuid;
        this.courses_year = courses_year;
    }


}
