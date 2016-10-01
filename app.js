let express = require('express');
let bodyParser = require('body-parser');
let zlib = require('zlib');

let fs = require('fs');
let path = require('path');
let busboy = require('connect-busboy');

// New express application
let app = express();
app.set('view engine', 'ejs');

let port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// Tell express where to find static assets
app.use(express.static(path.join(__dirname, 'public')));

app.use(busboy());

app.use(function (req, res, next) {
    req.getUrl = function () {
        return req.protocol + '://' + req.get('host') + req.originalUrl;
    };
    return next();
});

// Routes
let routes = require('./routes');
app.get('/', routes.home);
app.post('/upload', routes.upload);
app.get('/download/:image?', routes.download);
app.get('*', routes.not_found);

app.listen(port, () => {
    console.log('Application running on localhost:' + port);
});