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

// GET /todos?completed=true
app.get('/todos', function(req, res) {
	var queryParams = req.query;
	var filtedTodos = todos;

	if (queryParams.hasOwnProperty('completed')) {
		if (queryParams.completed === 'true') {
			filtedTodos = _.where(filtedTodos, {completed: true});
		} else {
			filtedTodos = _.where(filtedTodos, {completed: false});
		}
	}

	res.json(filtedTodos);
});

// GET /todo/:id
app.get('/todo/:id', function(req, res) {
	var id = parseInt(req.params.id);
	var matched = _.findWhere(todos, {"id": id});
	
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

// DELETE /todo/:id
app.delete('/todo/:id', function(req, res) {
	var id = parseInt(req.params.id);
	var matched = _.findWhere(todos, {"id": id});
	
	if (!matched) {
		res.status(404).json({"error": "not found"});
	} else {
		todos = _.without(todos, matched);
		res.json(matched);
	}
});

// PUT /todo/:id
app.put('/todo/:id', function(req, res) {
	var body = _.pick(req.body, "description", "completed");
	var validAttr = {};

	if (body.hasOwnProperty("completed")) {
		if (_.isBoolean(body.completed)) {
			validAttr.completed = body.completed;
		} else {
			return res.status(400).send();
		}
	}

	if (body.hasOwnProperty("description")) {
		if ((_.isString(body.description)) && (body.description.trim().length > 0)) {
			validAttr.description = body.description;
		} else {
			return res.status(400).send();
		}
	}

	var id = parseInt(req.params.id);
	var matched = _.findWhere(todos, {"id": id});

	if (!matched) {
		return res.status(404).send();
	}

	_.extend(matched, validAttr);

	res.json(matched);
});

app.listen(PORT, function() {
	console.log('Listening to port ' + PORT);
});