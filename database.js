var sqlite3 = require('sqlite3').verbose()
var base64 = require('base-64');
var utf8 = require('utf8');

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text, 
            email text UNIQUE, 
            password text, 
            CONSTRAINT email_unique UNIQUE (email)
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO user (name, email, password) VALUES (?,?,?)'
                db.run(insert, ["admin","admin@example.com",base64.encode(utf8.encode("admin123456"))])
                db.run(insert, ["user","user@example.com",base64.encode(utf8.encode("user123456"))])
				//{[{"id":1,"name":"admin","email":"admin@example.com","password":"YWRtaW4xMjM0NTY="},{"id":2,"name":"user","email":"user@example.com","password":"dXNlcjEyMzQ1Ng=="}]}
            }
        });  
		db.run(`CREATE TABLE product (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text, 
            price number, 
            description text
            )`,
        (err) => {
            if (err) {
                // Table already created
            }else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO product (name, price, description) VALUES (?,?,?)'
                db.run(insert, ["sör",300,"Soproni óvatos duhaj"])
                db.run(insert, ["bor",500,"Lafiesta édesélméy"])
            }
        });  
    }
});


module.exports = db