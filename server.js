var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var index = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('TODO root');
});

// GET /todos
app.get('/todos', function(req, res) {
	res.json(todos);
});

// GET /todo/:id
app.get('/todo/:id', function(req, res) {
	var id = parseInt(req.params.id);
	var matched = _.findWhere(todos, id);
	
	if (matched) {
		res.json(matched);
	} else {
		res.status(404).send();
	}
});

// POST /todos
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, "description", "completed");

	if (!_.isBoolean(body.completed) || (!_.isString(body.description)) || body.description.trim().length === 0) {
		return res.status(400).send();
	}

	body.description = body.description.trim();
	body.id = index++;
	todos.push(body);

	res.json(body);
});

app.listen(PORT, function() {
	console.log('Listening to port ' + PORT);
});