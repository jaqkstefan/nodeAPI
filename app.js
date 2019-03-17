/** START Import Module NodeJs **/
const express = require('express'),
    bcryptjs = require('bcryptjs'),
    mysql = require('./modules/mysql.js').mysql,
    bodyParser = require('body-parser'),
    app = express(),
    jsonParser = bodyParser.urlencoded({ extended: false });
/** END Import Module NodeJs **/

app.get('/test/:token', function(req, res) {
    mysql.convertTokenbyId(req.params.token).then(function(data) {
        console.log(data)
        res.end(JSON.stringify(data))
    })
})

app.listen(8080)