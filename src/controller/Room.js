"use strict";
var Room = (function () {
    function Room(rooms_fullname, rooms_shortname, rooms_number, rooms_name, rooms_address, rooms_lat, rooms_lon, rooms_seats, rooms_type, rooms_furniture, rooms_href) {
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
    return Room;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Room;
//# sourceMappingURL=Room.js.map