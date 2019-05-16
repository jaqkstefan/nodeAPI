// TODO : check REFRESH_TOKEN , rest of routes errors cases, uses express router for FRONT-END...

/** START Import Module NodeJs **/
let mysql = require("mysql");
const express = require('express'),             // routing model ...handle routes
    bcryptjs = require('bcryptjs'),             // password hashing
    bodyParser = require('body-parser'),        // Middleware - helping to parse data sent by user and treat it easily.
    session = require('express-session'),
    validator = require('email-validator'),
    router = express.Router(),                  // router
    app = express(),
    bdd = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'cpcsi2'
    });                                         // database initialization
/** END Import Module NodeJs **/

app.use(session({secret: 'stefan', saveUninitialized: true, resave: true}));  // initialize session

/** START initialize variables **/
var sess;                                       // global session   Not recommanded but im using it for now ;)
var createdAT = "";
var refresh_t = "";
var update_id = "";
bdd.connect();                                   // mysql database connection

/** End of initialization **/

const urlencodedParser = bodyParser.urlencoded({ extended: false }) // Middleware - Il ce declache avant le lancenement de la function (Pour notre cas, avanc les fonction lier au route pour parser les data envoyer par le client)

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

    if (req.body.lastname === undefined || req.body.lastname.trim() == "") {
        retour.error = true;
        retour.message.push(" l'une ou plusieurs des données obligatoires sont manquantes")
    }

    if (req.body.Email === undefined || req.body.Email.trim() == "") {
        retour.error = true;
        retour.message.push("l'une ou plusieurs des données obligatoires sont manquantes")
    }
    else if (validator.validate(req.body.Email) === false){
        retour.message.push("Votre email n'ai pas correct")
    }

    if (req.body.date_naissance === undefined || req.body.date_naissance.trim() == "") {
        retour.error = true;
        retour.message.push("l'une ou plusieurs des données obligatoires sont manquantes")
    }

    if (req.body.sexe === undefined || req.body.sexe.trim() == "") {
        retour.error = true;
        retour.message.push("l'une ou plusieurs des données obligatoires sont manquantes")
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
                let token = Math.random().toString(36).substr(2);
                bdd.query("INSERT INTO `tokens` (`id`, `token`) VALUES (NULL, '" + token +"');", function(error, result) { // Lancement de la requet SQL
                    if (error)
                        throw error;
                })
                let token_v = JSON.stringify(token)
                var sql = "SELECT token, refresh_token, createdAt FROM tokens where token like "+token_v
                bdd.query(sql, function(er, rest) {
                    Object.values(rest).forEach(function (array) {
                        createdAT = array.createdAt;
                        refresh_t = array.refresh_token;
                    })
                    console.log(rest);
                    console.log(refresh_t);
                    console.log(createdAT);
                    res.writeHead(200, {"content-type": "application/json; charset=utf-8"})
                    res.end(JSON.stringify({ error: "false", message : "l'utilisateur a été créé succès", tokens:{ token: token, refresh_token: refresh_t, createdAT: createdAT} }))
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
                        let token = Math.random().toString(36).substr(2);
                        bdd.query("INSERT INTO `tokens` (`id`, `token`) VALUES (NULL, '" + token + "');", function (error, result) { // Lancement de la requet SQL
                            if (error)
                                throw error;
                        })
                        let token_v = JSON.stringify(token)
                        var sql = "SELECT token, refresh_token, createdAt FROM tokens where token like " + token_v
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

    let token_v = JSON.stringify(req.params.token)
    let email_v = JSON.stringify(sess.Email)
    // TODO check conformity form of token and existence ...

/*    last query done with join request :  bdd.query("SELECT usr.id, usr.createdAt, token, refresh_token, revoquer, tk.id, tk.createdAt, firstname, lastname, Email, date_naissance, sexe FROM tokens as tk inner join users as usr on usr.id = tk.id WHERE token like "+token_v, function(error, result) {*/
    bdd.query("SELECT createdAt, token, refresh_token, revoquer FROM tokens  WHERE token like "+token_v, function(error, result) {
        if (error)
            throw error;
        if (result.length == 0) {
            res.writeHead(401, { "content-type": "application/json; charset=utf-8" })
            res.end("<h2>le token envoyé n'existe pas</h2>")
        } else {
            bdd.query("SELECT firstname, lastname, Email, date_naissance, sexe, createdAt FROM users WHERE Email like "+email_v, function(errr, user) {
                console.log(user);
                res.writeHead(200, { "content-type": "application/json; charset=utf-8" })
                res.end(JSON.stringify({ error: "false", user}))
            })

        }
    })
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
    let token_v = JSON.stringify(req.params.token)
    // TODO check conformity form of token and existence ...

    var sql = "SELECT token FROM tokens where token like "+token_v
    bdd.query(sql, function(error, result) {
        if (error)
            throw error;
        if (result.length == 0) {
            res.writeHead(401, { "content-type": "application/json; charset=utf-8" })
            res.end("<h2>le token renvoyé n'existe pas</h2>")
        }else {
            res.writeHead(200, { "content-type": "application/json; charset=utf-8" })
            res.end(JSON.stringify({ error: "false", message : "save success" }))
        }
    })
})
app.get('/users/:token', function(req, res) {
    console.log(sess.Email)
    console.log(req.params.token)

    let token_v = JSON.stringify(req.params.token)
    // TODO check conformity form of token and existence ...

    /*    last query done with join request :  bdd.query("SELECT usr.id, usr.createdAt, token, refresh_token, revoquer, tk.id, tk.createdAt, firstname, lastname, Email, date_naissance, sexe FROM tokens as tk inner join users as usr on usr.id = tk.id WHERE token like "+token_v, function(error, result) {*/
    bdd.query("SELECT createdAt, token, refresh_token, revoquer FROM tokens  WHERE token like "+token_v, function(error, result) {
        if (error)
            throw error;
        if (result.length == 0) {
            res.writeHead(401, { "content-type": "application/json; charset=utf-8" })
            res.end("<h2>le token envoyé n'existe pas</h2>")
        } else {
            bdd.query("SELECT * FROM users ", function(errr, users) {
                console.log(users);
                res.writeHead(200, { "content-type": "application/json; charset=utf-8" })
                res.end(JSON.stringify({ error: "false", users}))
            })
        }
    })
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