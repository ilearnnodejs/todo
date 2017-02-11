var express = require('express');
var bodyParser = require('body-parser');
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
	var id = req.params.id;
	for (var i = 0; i < todos.length; i++) {
		if (todos[i].id == id) {
			res.json(todos[i]);
			return;
		}
	}
	res.status(404).send();
});

// POST /todos
app.post('/todos', function(req, res) {
	var body = req.body;
	if (typeof body.description !== 'undefined') {
		body.id = index;
		index++;
		todos.push(body);
	}
	res.json(body);
});

app.listen(PORT, function() {
	console.log('Listening to port ' + PORT);
});