// Create express app
var express = require("express")
var app = express()
var db = require("./database.js")
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// get config vars
dotenv.config();

// access config var
process.env.TOKEN_SECRET;

function generateAccessToken(id) {
  return  jwt.sign({
          userid: id
      },
      process.env.TOKEN_SECRET, {
          expiresIn: "1hr",
          algorithm: 'HS256'
      });

}

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Server port
var HTTP_PORT = 8000

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// Root endpoint

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    //routing
    if(req.path.includes('/api/login')) {
        return next()
    }

    //token
    const token = req.headers['authorization']
    if (token == null) {
        //no token
        return res.status(401).json({"error":"Lépj be először"});
    }
    jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
        if (err != null) {
            //bad token
            res.status(401).json({"error":"Érvénytelen token"});
        }
        else{
            next();
        }
    });
});

// Insert here other API endpoints

//test login
app.post("/api/login",(req, res, next) => {
    var errors=[]
    if (!req.body.name){
        errors.push("Nincs név megadva");
    }
    if (!req.body.password){
        errors.push("Nincs jelszó megadva");
    }
    if (errors.length){
        return res.status(400).json({"error":errors.join(",")});
    }
    var sql = "select * from user where name = ?"
    var params = [req.body.name]
    db.get(sql, params, (err, row) => {
        if (row==null) {
            return res.status(400).json({"error":"Nincs ilyen felhasználó"});
        }
        if(row.password.localeCompare(req.body.password)==0){
            res.json({
                "message":"success",
                "data":generateAccessToken(row.id)
            })
        }else {
            res.status(400).json({"error":"rossz jelszo"});
        }
    });
});

app.get("/api/product",(req, res, next) => {

    var sql = "select * from product"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

// Default response for any other request
app.use(function(req, res){
    res.status(404);
});
