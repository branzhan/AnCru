const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const path = require("path");
const app = express();

//Using Handlebars for templating and displaying server response
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//Using Bodyparser to pass info in to functions
app.use(bodyParser.urlencoded({
    extended: true
}));

//Routes
app.get('/', function (req, res) {
    res.render('index');
});

//Set a static folder
app.use(express.static(path.join(__dirname, 'public')));

//If in production, use production port, else use localhost:5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

