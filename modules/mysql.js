let mysql = require("mysql"),
    bdd = mysql.createConnection({
        host: 'localhost',
        user: 'mike',
        password: 'mike',
        database: 'project',
        port: '8889' // A supprimer
    });

bdd.connect(); // Connection à la base de donnée MySql

bdd.convertTokenbyId = function(token) {
    return new Promise(function(resolve, reject) {
        bdd.query("SELECT id FROM token WHERE token = '" + token + "'", function(err, result) {
            let reponse = {}
            reponse.error = (err | result == null) ? true : false
            reponse.data = result;
            resolve(reponse)
        })
    })
}

exports.mysql = bdd