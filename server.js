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
    if(req.path!=='/api/login') {

        //token authorization
        const token = req.headers['authorization']
        if (token == null) {
            //no token
            res.status(401).send('Lépj be először');
        }else{
            jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
                if (err != null) {
                    //bad token
                    res.status(401).send('Érvénytelen token');
                }else {
                    next();
                }
            });
        }
    }
    else {
        next();
    }
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
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var sql = "select * from user where name = ?"
    var params = [req.body.name]
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({"error":err.message});
        }
        if(row.password==req.body.password){
            res.json({
                "message":"success",
                "data":generateAccessToken(row.id)
            })
            next();
        }else {
            res.status(400).json({"error": "rossz jelszo"});
        }
    });
});

app.get("/api/product",(req, res, next) => {

    var sql = "select * from product"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
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
