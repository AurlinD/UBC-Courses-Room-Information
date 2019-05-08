

export default class Room {

    rooms_fullname:string; // Full building name
    rooms_shortname:string; // Short building name
    rooms_number:string; // The room number
    rooms_name:string;
    rooms_address:string; // The room id; should be rooms shortname + rooms_number
    rooms_lat:number; // The latitude of the building
    rooms_lon:number; // the longitude of the building
    rooms_seats:number; //The number of seats in the room
    rooms_type: string;
    rooms_furniture:string; // The room type
    rooms_href:string;


    constructor(rooms_fullname:string, rooms_shortname:string,
    rooms_number:string, rooms_name:string, rooms_address:string,
    rooms_lat:number, rooms_lon:number,
    rooms_seats:number, rooms_type:string, rooms_furniture:string,
    rooms_href:string) {
        this.rooms_fullname = rooms_fullname;
        this.rooms_shortname = rooms_shortname;
        this.rooms_number = rooms_number;
        this.rooms_name = rooms_name;
        this.rooms_address = rooms_address;
        this.rooms_lat = rooms_lat;
        this.rooms_lon = rooms_lon;
        this.rooms_seats = rooms_seats;
        this.rooms_type = rooms_type;
        this.rooms_furniture = rooms_furniture;
        this.rooms_href = rooms_href;
    }

}