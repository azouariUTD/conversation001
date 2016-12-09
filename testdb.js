var a = "";
var fs = require("fs");
var file = "neighborhoods.db";

var exists = fs.existsSync(file);

if (!exists) {
    console.log("Creating DB file.");
    fs.openSync(file, "w");
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

db.serialize(function () {
    if (!exists) {

    }
    db.each("select * from neighborhoods where neighborhood in (select neighborhood from neighborhoods  where neighborhood in (select neighborhood from neighborhoods  where neighborhood in (select  neighborhood from neighborhoods ORDER BY safety LIMIT 10) order by price desc limit 5) order by overall desc limit 2)order by education  desc limit 1;", function (err, row) {
        console.log(row.neighborhood);
        console.log(row.Home_Link);
        console.log(row.Safety_Link);
        console.log(row.Education_Link);



    });
});
db.serialize(function () {
    if (!exists) {

    }
});
db.close();

var map = [];

var m1234 = [];
m1234.push("Northwest Dallas");
m1234.push("http://www.zillow.com/homes/Northwest-Dallas-Dallas-TX_rb/");
m1234.push("https://www.neighborhoodscout.com/zipcode/tx/dallas/75235/");
m1234.push("http://www.zillow.com/northwest-dallas-dallas-tx/schools/");

map.push(m1234);

var m2134 = [];
m2134.push("Bluffview");
m2134.push("http://www.zillow.com/homes/Bluffview-Dallas-TX_rb/");
m2134.push("https://www.neighborhoodscout.com/zipcode/tx/dallas/75209/");
m2134.push("http://www.zillow.com/bluffview-dallas-tx/schools/");

map.push(m2134);

var m3124 = [];
m3124.push("Oak Lawn");
m3124.push("http://www.zillow.com/homes/Oak-Lawn-Dallas-TX_rb/");
m3124.push("https://www.neighborhoodscout.com/zipcode/tx/dallas/75205/");
m3124.push("http://www.zillow.com/oak-lawn-dallas-tx/schools/");

map.push(m3124);

var m3142 = [];
m3142.push("City Center District");
m3142.push("http://www.zillow.com/homes/City-Center-District-Dallas-TX_rb/");
m3142.push("https://www.neighborhoodscout.com/zipcode/tx/dallas/75201/");
m3142.push("http://www.zillow.com/city-center-district-dallas-tx/schools/");

map.push(m3142);





