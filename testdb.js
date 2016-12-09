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


    db.each("select neighborhood, safety, Safety_Link from neighborhoods ORDER BY safety DESC  limit 10", function (err, row) {
        console.log("Neighborhood: " + row.neighborhood + " with a safety score of: " + row.safety + " safety link:" + row.Safety_Link);
    });


    db.each("select  neighborhood, price , Home_Link   from neighborhoods ORDER BY price LIMIT 10", function (err, row) {
        console.log("Neighborhood: " + row.neighborhood + " with a price of: $" + row.price + " home link:" + row.Home_Link);
    });


    db.each("select neighborhood, education , Education_Link from neighborhoods ORDER BY education DESC  limit 10", function (err, row) {
        console.log("Neighborhood: " + row.neighborhood + " has an education score of: " + row.education + " education link:" + row.Education_Link);
    });

    db.each("select neighborhood, overall from neighborhoods ORDER BY overall DESC  limit 10", function (err, row) {
        console.log("Neighborhood: " + row.neighborhood + " has an overall score of: " + row.overall);
    });


});


db.serialize(function () {
    if (!exists) {

    }


});

db.close();