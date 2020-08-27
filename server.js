const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const apiRouter = require('./api/api')

const app = express();

const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(errorHandler());

app.use('/api', apiRouter);

app.use(express.static('public'));

app.listen(PORT, () => console.log('listening'));
