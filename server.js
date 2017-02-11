var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'Lunch',
	completed: false
}, {
	id: 2,
	description: 'Shopping',
	completed: false
}, {
	id: 3,
	description: 'Feed',
	completed: true
}];

app.get('/', function(req, res) {
	res.send('TODO root');
});

app.get('/todos', function(req, res) {
	res.json(todos);
});

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


app.listen(PORT, function() {
	console.log('Listening to port ' + PORT);
});