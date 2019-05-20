// TODO : makes sure the session email match with the token...

/** START Import Module NodeJs **/
let mysql = require("mysql");
const express = require('express'),             // routing model ...handle routes
    bcryptjs = require('bcryptjs'),             // password hashing
    mongoose = require('mongoose'),
    config = require('./config'),
    jwt = require('jsonwebtoken'),
    passwordValidator = require('password-validator'),
    bodyParser = require('body-parser'),        // Middleware - helping to parse data sent by user and treat it easily.
    session = require('express-session'),
    validator = require('email-validator'),
    router = express.Router(),                  // router
    app = express(),
    bdd = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'syllabus'
    });                                         // database initialization
/** END Import Module NodeJs **/
/**
 * MongoDb connection
 */
/*
let databaseMongo = {}
*/

var schema = new passwordValidator();

// Add properties to it
schema
    .is().min(7)                                    // Minimum length 8
    .is().max(20)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().symbols()                                // Must have special chars
    .has().digits()                                 // Must have digits
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

mongoose.connect("mongodb://localhost:27017/syllabus", function(err) {   // check database name first
    console.log((err) ? err : 'Connection au mongo correct') // error if not connected
})

const analyticSchema = mongoose.Schema({
    userId: Number,
    events: {Object: {event: {type: String, enum: ['Click', 'scroll'], default: 'Click'}}},
    page: String,
    createdAt: { type: Date, default: Date.now }
});

databaseMongo = mongoose.model("analytic", analyticSchema);

app.use(session({secret: 'stefan', saveUninitialized: true, resave: true}));  // initialize session

/** START initialize variables **/
var sess;                                       // global session   Not recommanded but im using it for now ;)
var createdAT = "";
var refresh_t = "";
var update_id = "";
bdd.connect();                                   // mysql database connection

/** End of initialization **/
function isDate (value) {
    return value instanceof Date;
}
const urlencodedParser = bodyParser.urlencoded({ extended: false }) // Middleware - Il ce declache avant le lancenement de la function (Pour notre cas, avanc les fonction lier au route pour parser les data envoyer par le client)

jsonParser = bodyParser.urlencoded({ extended: false }); // Middleware sama as urlencoder

/** START Création de route sous express NodeJs **/


app.get('/', function(req, res) {               // route creation on express
    res.writeHead(200, { "content-type": "text/plain;" })
    res.sendFile(__dirname + "/index.html"); // rendering index.html page on client side
})

app.post('/', urlencodedParser, function(req, res) {
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" })
    res.end(JSON.stringify({ error: false, data: req.body }))
})

app.post('/register', urlencodedParser, function(req, res) {     // check conformity of other data before sending
    sess = req.session;
    sess.Email = req.body.Email;
    let retour = {
        error: false,
        message: []
    }

    if (req.body.firstname === undefined || req.body.firstname.trim() == "") {
        retour.error = true;
        retour.message.push("l'une ou plusieurs des données obligatoires sont manquantes")
    }
    else if (typeof req.body.firstname !== 'string' || req.body.firstname.length > 25 || req.body.firstname.length < 5) {
        retour.error = true;
        retour.message.push("l'une ou plusieurs des données obligatoires ne sont pas conformes")
    }

    if (req.body.lastname === undefined || req.body.lastname.trim() == "") {
        retour.error = true;
        retour.message.push(" l'une ou plusieurs des données obligatoires sont manquantes")
    }
    else if (typeof req.body.lastname !== 'string' || req.body.lastname.length > 25 || req.body.lastname.length < 5) {
        retour.error = true;
        retour.message.push("l'une ou plusieurs des données obligatoires ne sont pas conformes")
    }

    if (req.body.Email === undefined || req.body.Email.trim() == "") {
        retour.error = true;
        retour.message.push("l'une ou plusieurs des données obligatoires sont manquantes")
    }
    else if (validator.validate(req.body.Email) === false){
        retour.message.push("Votre email n'ai pas correct")
    }
    else if (typeof req.body.Email !== 'string' || req.body.Email.length > 25 || req.body.Email.length < 5) {
        retour.error = true;
        retour.message.push("l'une ou plusieurs des données obligatoires ne sont pas conformes")
    }

    if (req.body.date_naissance === undefined || req.body.date_naissance.trim() == "") {
        retour.error = true;
        retour.message.push("l'une ou plusieurs des données obligatoires sont manquantes")
    }
/*    else if (isDate(req.body.date_naissance) === true) {
        retour.error = true;
        retour.message.push("l'une ou plusieurs des données obligatoires ne sont pas conformes")
    }*/
    if (req.body.sexe === undefined || req.body.sexe.trim() == "") {
        retour.error = true;
        retour.message.push("l'une ou plusieurs des données obligatoires sont manquantes")
    }

    if (schema.validate(req.body.Password) === false) {
        retour.error = true;
        retour.message.push("Mot de passe incorrect")
    }

    // TODO check conformity form of token and handling REFRESH_TOKEN and the rest of routes errors cases...


    bcryptjs.genSalt(10, function(err, salt) {                                  // "salt grain" creation helping hashing password
        bcryptjs.hash(req.body.Password, salt, function (error, passwHash) {    // password hashing with salt
            req.body.Password = passwHash;
            if (retour.error == true) {
                res.writeHead(401, { "content-type": "application/json; charset=utf-8" })
                res.end(JSON.stringify(retour))
            } else {
                bdd.query("INSERT INTO `users` (`id`, `firstname`, `lastname`, `Email`, `Password`, `date_naissance`, `sexe`) VALUES (NULL, '" + req.body.firstname + "', '" + req.body.lastname + "', '" + req.body.Email + "', '" + req.body.Password + "', '" + req.body.date_naissance + "', '" + req.body.sexe + "');", function (error, result) { // Lancement de la requet SQL
                    if (error)
                        throw error;
                    })
                    bdd.query("SELECT * FROM users WHERE Email like " + JSON.stringify(req.body.Email), function (error, result) {
                        Object.values(result).forEach(function (array) {
                            update_id = array.id;
                            console.log(update_id);
                        })
                    })
                    let token = jwt.sign(req.body, config.secret, {expiresIn: config.tokenLife});
                    let refresh_token = jwt.sign(req.body, config.refreshTokenSecret, {expiresIn: config.refreshTokenLife});
                    bdd.query("INSERT INTO `tokens` (`id`, `token`, `refresh_token`) VALUES (NULL , '"+token+"', '"+refresh_token+"')", function (e, r) { // Lancement de la requet SQL
                        if (e)
                            throw e;
                    })
                    console.log(update_id)
                    bdd.query("SELECT * FROM users WHERE Email like " + JSON.stringify(req.body.Email), function (error, result) {
                        Object.values(result).forEach(function (array) {
                            bdd.query("SELECT token, refresh_token, createdAt FROM tokens where id =" + array.id, function (err, ress) {
                                Object.values(ress).forEach(function (array) {
                                    createdAT = array.createdAt;
                                    refresh_t = array.refresh_token;
                                })
                                res.writeHead(200, {"content-type": "application/json; charset=utf-8"})
                                res.end(JSON.stringify({
                                    error: "false",
                                    message: "l'utilisateur a été créé succès",
                                    tokens: {token: token, refresh_token: refresh_t, createdAT: createdAT}
                                }))
                            })
                        })
                    })
            }
        })
    })
})
app.post('/login', urlencodedParser, function(req, res) {
    sess = req.session;
    sess.Email = req.body.Email;
    var email = JSON.stringify(req.body.Email);
    console.log(req.body.Email)
    let retour = {
        error: false,
        message: []
    }
    if ((req.body.Email === undefined || req.body.Email.trim() == "")
        && (req.body.Password === undefined || req.body.Password.trim() == "")) {
        retour.error = true;
        retour.message.push("L'Email/Password est manquant")
    }

    // TODO check conformity form of token and handling refresh_token and the rest of routes errors cases...


    if (retour.error == true) {
        res.writeHead(401, { "content-type": "application/json; charset=utf-8" })
        res.end(JSON.stringify(retour))
    }else {
        bcryptjs.genSalt(10, function (err, salt) { // Creation d'une salt (grain de sel) permettant le cryptage du password.
            bcryptjs.hash(req.body.Password, salt, function (error, passwHash) { // Cryptage du password avec la salt
                req.body.Password = passwHash;
                bdd.query("SELECT * FROM users WHERE Email like " + email, function (error, result) {
                    if (error)
                        throw error;
                    if (result.length == 0) {
                        res.end("<h2>Votre email ou password est erroné</h2>")
                    } else {
                        Object.values(result).forEach(function (array) {
                            update_id = array.id;
                            console.log(update_id);
                        })
                        let token = jwt.sign(req.body, config.secret, {expiresIn: config.tokenLife});
                        let refresh_token = jwt.sign(req.body, config.refreshTokenSecret, {expiresIn: config.refreshTokenLife});
                        bdd.query('UPDATE tokens SET token =?, refresh_token =? where  id =?', [token, refresh_token,  update_id])
                        let token_v = JSON.stringify(token)
                        var sql = "SELECT token, refresh_token, createdAt FROM tokens where id =" + update_id
                        bdd.query(sql, function (er, rest) {
                            Object.values(rest).forEach(function (array) {
                                createdAT = array.createdAt;
                                refresh_t = array.refresh_token;
                            })
                            console.log(rest);
                            console.log(refresh_t);
                            console.log(createdAT);
                            res.writeHead(200, {"content-type": "application/json; charset=utf-8"})
                            res.end(JSON.stringify({
                                error: "false",
                                message: "l'utilisateur a été authentifié succès",
                                tokens: {token: token, refresh_token: refresh_t, createdAt: createdAT}
                            }))
                        })
                    }
                })
            })
        })
    }
})
app.get('/user/:token', function(req, res) {
    console.log(sess.Email)
    console.log(req.params.token)
    let retour = {
        error: false,
        message: []
    }
    let token_v = JSON.stringify(req.params.token)
    let email_v = JSON.stringify(sess.Email)
    jwt.verify(req.params.token, config.secret, function (error, decoded) {
        if(error.name === "TokenExpiredError")
        {
            retour.error = true;
            retour.message.push("votre token n'ai plus valide, veuillez le reinitialiser")
        }
        else if (error.message === "invalid token")
        {
            retour.error = true;
            retour.message.push("le token envoyez n'est pas conforme")
        }
    })
    // TODO check conformity form of token and existence ...
    if (retour.error == true) {
        res.writeHead(401, { "content-type": "application/json; charset=utf-8" })
        res.end(JSON.stringify(retour))
    }else {
        /*    last query done with join request :  bdd.query("SELECT usr.id, usr.createdAt, token, refresh_token, revoquer, tk.id, tk.createdAt, firstname, lastname, Email, date_naissance, sexe FROM tokens as tk inner join users as usr on usr.id = tk.id WHERE token like "+token_v, function(error, result) {*/
        bdd.query("SELECT createdAt, token, refresh_token, revoquer FROM tokens  WHERE token like " + token_v, function (error, result) {
            if (error)
                throw error;
            if (result.length == 0) {
                res.writeHead(401, {"content-type": "application/json; charset=utf-8"})
                res.end("<h2>le token envoyé n'existe pas</h2>")
            } else {
                bdd.query("SELECT firstname, lastname, Email, date_naissance, sexe, createdAt FROM users WHERE Email like " + email_v, function (errr, user) {
                    console.log(user);
                    res.writeHead(200, {"content-type": "application/json; charset=utf-8"})
                    res.end(JSON.stringify({error: "false", user}))
                })
            }
        })
    }
})
app.put('/user/:token', urlencodedParser, function(req, res) {
    console.log(req.body.firstname)
    console.log(req.params.token)
    console.log(sess.Email)
    let retour = {
        error: false,
        message: []
    }
    if ((req.body.firstname === undefined || req.body.firstname.trim() == "")
        && (req.body.lastname === undefined || req.body.lastname.trim() == "")
        && (req.body.sexe === undefined || req.body.sexe.trim() == "")
        && (req.body.date_naissance === undefined || req.body.date_naissance.trim() == "")) {
        retour.error = true;
        retour.message.push("aucune donnée n'a été envoyée")
    }

    if (req.body.firstname === undefined || req.body.firstname.trim() == "") {
        retour.error = true;
        retour.message.push("l'une ou plusieurs des données obligatoires sont manquantes")
    }
    else if (typeof req.body.firstname !== 'string' || req.body.firstname.length > 25 || req.body.firstname.length < 5) {
        retour.error = true;
        retour.message.push("l'une ou plusieurs des données obligatoires ne sont pas conformes")
    }

    if (req.body.lastname === undefined || req.body.lastname.trim() == "") {
        retour.error = true;
        retour.message.push(" l'une ou plusieurs des données obligatoires sont manquantes")
    }
    else if (typeof req.body.lastname !== 'string' || req.body.lastname.length > 25 || req.body.lastname.length < 5) {
        retour.error = true;
        retour.message.push("l'une ou plusieurs des données obligatoires ne sont pas conformes")
    }

    if (req.body.date_naissance === undefined || req.body.date_naissance.trim() == "") {
        retour.error = true;
        retour.message.push("l'une ou plusieurs des données obligatoires sont manquantes")
    }
    /*    else if (isDate(req.body.date_naissance) === true) {
            retour.error = true;
            retour.message.push("l'une ou plusieurs des données obligatoires ne sont pas conformes")
        }*/
    if (req.body.sexe === undefined || req.body.sexe.trim() == "") {
        retour.error = true;
        retour.message.push("l'une ou plusieurs des données obligatoires sont manquantes")
    }

    let token_v = JSON.stringify(req.params.token)
    // TODO check conformity form of token and other elements ...

    let email_v = JSON.stringify(sess.Email)
    var sql = "SELECT token FROM tokens where token like "+token_v
    if (retour.error == true) {
        res.writeHead(401, { "content-type": "application/json; charset=utf-8" })
        res.end(JSON.stringify(retour))
    }else {
        bdd.query(sql, function (error, result) {
            if (error)
                throw error;
            console.log(result);
            if (result.length == 0) {
                res.end("<h2>le token renvoyé n'existe pas</h2>")
            } else {
                bdd.query("SELECT id, firstname, lastname, Email, date_naissance, sexe, createdAt FROM users WHERE Email like "+email_v, function(errr, user) {
                    console.log(user);
                    Object.values(user).forEach(function (array) {
                        update_id = array.id;
                        console.log(update_id);
                    })
                    bdd.query('UPDATE users SET firstname =?, lastname =?, date_naissance =? , sexe =? where  id =?', [req.body.firstname, req.body.lastname, req.body.date_naissance, req.body.sexe, update_id], function (error, results, fields) {
                        if (error)
                            throw error;
                        else {
                            console.log(error);
                            res.writeHead(200, {"content-type": "application/json; charset=utf-8"})
                            res.end(JSON.stringify({error: "false", message: "user updated successfully"}))
                        }
                    })
                })
            }
        })
    }
})
app.get('/analytic/:token', function(req, res) {
    console.log(req.params.token)
    let retour = {
        error: false,
        message: []
    }
    let token_v = JSON.stringify(req.params.token)
    // TODO check conformity form of token and existence ...
    jwt.verify(req.params.token, config.secret, function (error, decoded) {
        if(error.name === "TokenExpiredError")
        {
            retour.error = true;
            retour.message.push("votre token n'ai plus valide, veuillez le reinitialiser")
        }
        else if (error.message === "invalid token")
        {
            retour.error = true;
            retour.message.push("le token envoyez n'est pas conforme")
        }
    })
    var sql = "SELECT token FROM tokens where token like "+token_v
    if (retour.error == true) {
        res.writeHead(401, { "content-type": "application/json; charset=utf-8" })
        res.end(JSON.stringify(retour))
    }else {
        bdd.query(sql, function (error, result) {
            if (error)
                throw error;
            if (result.length == 0) {
                res.writeHead(401, {"content-type": "application/json; charset=utf-8"})
                res.end("<h2>le token renvoyé n'existe pas</h2>")
            } else {
                res.writeHead(200, {"content-type": "application/json; charset=utf-8"})
                res.end(JSON.stringify({error: "false", message: "save success"}))
            }
        })
    }
})
app.post('/analytic/:token', function(req, res) {
    console.log(req.params.token)
    let page_sent = "registr"
    let event_sent = "scroll"
    let token_v = JSON.stringify(req.params.token)
    // TODO check conformity form of token and existence ...
    let retour = {
        error: false,
        message: []
    }
/*    if ((req.body.page === undefined || req.body.firstname.trim() == "")
        && (req.body.events === undefined || req.body.lastname.trim() == "")) {
        retour.error = true;
        retour.message.push("l'une ou plusieurs des données manquantes sont obligatoires")
    }*/
    var sql = "SELECT id, token FROM tokens where token like "+token_v

    if (retour.error == true) {
        res.writeHead(401, { "content-type": "application/json; charset=utf-8" })
        res.end(JSON.stringify(retour))
    }else {
        bdd.query(sql, function (error, result) {
            if (error)
                throw error;
            if (result.length == 0) {
                res.writeHead(401, {"content-type": "application/json; charset=utf-8"})
                res.end("<h2>le token renvoyé n'existe pas</h2>")
            } else {
                Object.values(result).forEach(function (array) {
                    update_id = array.id;
                    console.log(update_id);
                })
                let theAnalytic = {
                    userId: update_id,
                    page: page_sent,
                    events: {Object: {event: event_sent}},
                }
                let newAna = new databaseMongo(theAnalytic);
                newAna.save(function () { // Sauvegarde de l'analytic
                    console.log("event save")
                    res.writeHead(200, {"content-type": "application/json; charset=utf-8"})
                    res.end(JSON.stringify({error: "false", message: "save success"}))
                })
            }
        })
    }
})
app.get('/users/:token', function(req, res) {
    console.log(sess.Email)
    console.log(req.params.token)
    let retour = {
        error: false,
        message: []
    }
    let token_v = JSON.stringify(req.params.token)
    // TODO check conformity form of token and existence ...
    jwt.verify(req.params.token, config.secret, function (error, decoded) {
        if(error.name === "TokenExpiredError")
        {
            retour.error = true;
            retour.message.push("votre token n'ai plus valide, veuillez le reinitialiser")
        }
        else if (error.message === "invalid token")
        {
            retour.error = true;
            retour.message.push("le token envoyez n'est pas conforme")
        }
    })
    if (retour.error == true) {
        res.writeHead(401, { "content-type": "application/json; charset=utf-8" })
        res.end(JSON.stringify(retour))
    }else {
        /*    last query done with join request :  bdd.query("SELECT usr.id, usr.createdAt, token, refresh_token, revoquer, tk.id, tk.createdAt, firstname, lastname, Email, date_naissance, sexe FROM tokens as tk inner join users as usr on usr.id = tk.id WHERE token like "+token_v, function(error, result) {*/
        bdd.query("SELECT createdAt, token, refresh_token, revoquer FROM tokens  WHERE token like " + token_v, function (error, result) {
            if (error)
                throw error;
            if (result.length == 0) {
                res.writeHead(401, {"content-type": "application/json; charset=utf-8"})
                res.end("<h2>le token envoyé n'existe pas</h2>")
            } else {
                bdd.query("SELECT * FROM users ", function (errr, users) {
                    console.log(users);
                    res.writeHead(200, {"content-type": "application/json; charset=utf-8"})
                    res.end(JSON.stringify({error: "false", users}))
                })
            }
        })
    }
})
app.delete('/user/:token', function(req, res) {
    req.session.destroy((err) => {
        console.log(err);
        if(err) {
            return console.log(err);
        }
        else {
            res.writeHead(200, { "content-type": "application/json; charset=utf-8" })
            res.end(JSON.stringify({ error: "false", message : "l'utilisateur a été deconnecté avec succès" }))
        }
    })
})

/** END Création de route sous express NodeJs **/

app.listen(8080, function() { // Lancement du serveur sur le port 80 (dans ce cas d'espèce)
    console.log('Server running') // http://localhost:8080
})