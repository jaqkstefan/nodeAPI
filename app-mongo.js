// TODO:  Everything need to be check back in this file ... no touched for long time


/** START Import Module NodeJs **/
const express = require('express'), // routing Model
    mongoose = require('mongoose'), // connection to mongoDb as PDO in php
    bcryptjs = require('bcryptjs'), // hash password
    bodyParser = require('body-parser'), // Middleware help to parse body
    app = express(),
    jsonParser = bodyParser.urlencoded({ extended: false }); // Middleware sama as urlencoder

/** END Import Module NodeJs **/
const urlencodedParser = bodyParser.urlencoded({ extended: false })
/** 
 * MongoDb connection
 */
mongoose.connect("mongodb://localhost:27017/StefanPrince", function(err) {
    console.log((err) ? err : 'Connection au mongo correct') // error if not connected
})

/**
 * schema are data structure that help to draw the table
 */
const date = new Date();


var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

console.log(date.toLocaleDateString('fr-FR', options));
const timestamp = date.getTime();
const userSchema = mongoose.Schema({
        firstname: { type: String, length: 25 },
        lastname: { type: String, length: 25 },
        Email: { type: String, length: 150 },
        Password: { type: String, length: 20 },
        date_naissance: Date,
        sexe: String,
        createdAt: { type: Date, default: timestamp }

    });
const tokenSchema = mongoose.Schema({
        token: String,
        refresh_token: Date,
        revoquer: { type: Number, default: 0 },
        createdAt: { type: Date, default: timestamp }

    });
    userModel = mongoose.model('users', userSchema); // Le model permet la relation entre les collection et les schemas.
    tokenModel = mongoose.model('tokens', tokenSchema);
let theUser = {
        firstname: "stefan",
        lastname: "prince",
        Email: "jack@kmash.com",
        Password: "a",
        sexe: "M",
        date_naissance: "1994-02-07"
    } // Element test
let theToken = {
        token: "ty",
        refresh_token: "2019-04-19",
        revoquer: 0,
        createdAt: timestamp
    }

app.get('/', function(req, res) {
    res.writeHead(200, { "content-type": "text/plain;" })
    res.sendFile(__dirname + "../front/loginscreen.js"); // Afficher la page loginscreen cote front
})

app.post('/', urlencodedParser, function(req, res) {
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" })
    res.end(JSON.stringify({ error: false, data: req.body }))
})

app.post('/login', urlencodedParser, function(req, res) {
    userModel.findOne({ Email: req.body.Email }, function(err, user) {   // find the user with that mail
        if (err || user == null)
            res.end("Error")
        else {
            bcryptjs.compare(req.body.Password, user.Password, function (err, resp) {
                if (resp) {
                    tokenModel.findOne({ createdAt: user.createdAt }, function(err, tok) {
                        if (err || tok == null)
                            res.end("token unMatched")
                        else {
                            res.writeHead(200, {"content-type": "application/json; charset=utf-8"})
                            res.end(JSON.stringify({
                                firstname: user.firstname,
                                lastname: user.lastname,
                                Email: user.Email,
                                /*
                                     token: user.token,
                                */
                                sexe: user.sexe,
                                date_naissance: user.date_naissance,
                                token: tok.token,

                                /*
                                    Password: user.Password
                                */
                            }))
                        }
                    })
                } else
                    res.end("Error password")
            })
        }
    })
})

app.post('/register', urlencodedParser, function(req, res) {
    bcryptjs.genSalt(10, function(err, salt) {
        bcryptjs.hash(req.body.Password, salt, function(error, passwHash) {
            req.body.Password = passwHash;
            let newUser = new userModel(req.body); // Nouvelle instance de model avec en param. dans le constructeur, un object permmettant la création d'un nouvelle entiter avec les caract. de l'object inserer
            newUser.save(function() { // Savegarde de l'instance
                console.log("User registered")
                res.end("OK");
            })
            theToken.token = Math.random().toString(36).substr(2);
            let newToken = new tokenModel(theToken);
            newToken.save(function () {
                console.log("token inserted")
                res.end("OK");
            })
        })
    })
})

app.put('/user/:token', urlencodedParser, function(req, res) {
    console.log(req.body)
    bcryptjs.genSalt(10, function(err, salt) { // Creation d'une salt (grain de sel) permettant le cryptage du password.
        bcryptjs.hash(req.body.password, salt, function(error, passwHash) { // Cryptage du password avec la salt
            req.body.password = (req.body.password == "") ? undefined : passwHash
            userModel.updateOne({ token: req.params.token }, req.body, function(err) {
                if (err)
                    res.end("Error update")
                else
                    res.end("Good update")

            })
        })
    })
})

app.delete('/users', function(req, res) {
    userModel.deleteMany({})
    res.end("ok")
})

app.delete('/user/:token', function(req, res) {
    userModel.findOneAndDelete({ token: req.params.token }, (err, data) => {
        console.log(err)
        console.log(data)
        res.end("ok")
    })
})

app.get('/user/:token', function(req, res) {
    console.log(req.params.token)
    userModel.findOne({ token: req.params.token }, function(err, user) {
        if (err || user == null)
            res.end("Error")
        else {
            res.writeHead(200, { "content-type": "application/json; charset=utf-8" })
            res.end(JSON.stringify({
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                token: user.token,
                sexe: user.sexe,
                dateNaiss: user.dateNaiss
            }))
        }
    })
})

app.get('/users', function(req, res) {})

app.get('/error', function(req, res) {
    res.writeHead(501, { "content-type": "application/json; charset=utf-8" })
    res.end(JSON.stringify({ error: "route error" }))
})

app.listen(8080, function() {
    console.log('Serv run')
})