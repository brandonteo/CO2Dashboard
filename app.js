var express = require('express');
var app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Route to dashboard homepage
app.get('/', function(req, res) {
    res.render('dashboard');
});

// Anything else gets re-routed to the root route
app.get('*', function(req, res) {
    res.redirect('/');
});

app.listen(process.env.PORT, process.env.IP, function(req, res) {
    console.log("Server has started...");
});
