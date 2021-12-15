// Create express app
var express = require("express")
var app = express()
var db = require("./database.js")
var md5 = require("md5")
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
var router = express.Router()

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
    if(req.path!='/api/login') {
        console.log("hmmm1")

        //token authorization
        const token = req.headers['authorization']
        if (token == null) {
            res.status(401).send('Lépj be először');
            console.log("hmmm2");
            return;

        }
        console.log("hmmm3")

        jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
            if (err == null) {
                //console.log("hmmm4")
            }else{
                console.log("hmmm6")
                res.status(401).send('Érvénytelen token');
                return;
                console.log("hmmm7")
            }
        });
        console.log("hmmm5")
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
            return;
        }
        if(row.password==req.body.password){
            res.json({
                "message":"success",
                "data":generateAccessToken(row.id)
            })
            next();
        }else {
            res.status(400).json({"error": "rossz jelszo"});
            return;
        }
    });
});

app.get("/api/product",(req, res, next) => {

    console.log("hmmm7")
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
