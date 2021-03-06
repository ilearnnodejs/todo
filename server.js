var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcryptjs');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var index = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {res.send('TODO root');});

// GET /todos?completed=true&q=work
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var queryParams = req.query;
	var where = {
		userId: req.user.get('id')
	};

	if (queryParams.hasOwnProperty('completed')) {
		if (queryParams.completed === 'true') {
			where.completed = true;
		} else {
			where.completed = false;
		}
	}

	if (queryParams.hasOwnProperty('q')) {
		if (_.isString(queryParams.q) && queryParams.q.trim().length > 0) {
			where.description = {
				$like: '%' + queryParams.q.trim().toLowerCase() + '%'
			}
		}
	}

	db.todo.findAll({where: where}).then(function(todos) {
		res.json(todos);
	}).catch(function(e) {
		res.status(500).send();
	});


	/*
	var filtedTodos = todos;

	if (queryParams.hasOwnProperty('completed')) {
		if (queryParams.completed === 'true') {
			filtedTodos = _.where(filtedTodos, {completed: true});
		} else {
			filtedTodos = _.where(filtedTodos, {completed: false});
		}
	}

	if (queryParams.hasOwnProperty('q')) {
		if (_.isString(queryParams.q) && queryParams.q.trim().length > 0) {
			filtedTodos = _.filter(filtedTodos, function(todo) {
				return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
			});
		}
	}

	res.json(filtedTodos);
	*/
});

// GET /todo/:id
app.get('/todo/:id', middleware.requireAuthentication, function(req, res) {
	var id = parseInt(req.params.id);
	
	db.todo.findOne({
		where: {
			id: id,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}).catch(function(e) {
		res.status(500).send();
	});
	/*
	var matched = _.findWhere(todos, {"id": id});
	
	if (matched) {
		res.json(matched);
	} else {
		res.status(404).send();
	}
	*/
});

// POST /todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, "description", "completed");

	db.todo.create(body).then(function(todo) {
		req.user.addTodo(todo).then(function() {
			return todo.reload();
		}).then(function(todo) {
			res.json(todo.toJSON());
		});
	}).catch(function(e) {
		res.status(400).json(e);
	});
	/*
	if (!_.isBoolean(body.completed) || (!_.isString(body.description)) || body.description.trim().length === 0) {
		return res.status(400).send();
	}

	body.description = body.description.trim();
	body.id = index++;
	todos.push(body);

	res.json(body);
	*/
});

// DELETE /todo/:id
app.delete('/todo/:id', middleware.requireAuthentication, function(req, res) {
	var id = parseInt(req.params.id);

	db.todo.destroy({
		where: {
			id: id,
			userId: req.user.get('id')
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				error: 'No todo with id: ' + id
			});
		} else {
			res.status(204).send();
		}
	}).catch(function(e) {
		res.status(500).send();
	});
	/*
	var matched = _.findWhere(todos, {"id": id});
	
	if (!matched) {
		res.status(404).json({"error": "not found"});
	} else {
		todos = _.without(todos, matched);
		res.json(matched);
	}
	*/
});

// PUT /todo/:id
app.put('/todo/:id', middleware.requireAuthentication, function(req, res) {
	var id = parseInt(req.params.id);
	var body = _.pick(req.body, "description", "completed");
	var validAttr = {};

	if (body.hasOwnProperty("completed")) {
		validAttr.completed = body.completed;
	}

	if (body.hasOwnProperty("description")) {
		validAttr.description = body.description;
	}

	db.todo.findOne({
		where: {
			id: id,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		if (todo) {
			todo.update(validAttr).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

// POST /users
app.post('/users', function(req, res) {
	var body = _.pick(req.body, "name", "pass");

	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}).catch(function(e) {
		res.status(400).json(e);
	});
});

// POST /users/login
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, "name", "pass");
	var userInstance;

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		userInstance = user;

		return db.token.create({
			token: token
		});

		/*
		if (token) {
			res.header('Auth', token).json(user.toPublicJSON());
		} else {
			res.status(401).send();
		}
		*/
	}).then(function(token) {
		res.header('Auth', token.get('token')).json(userInstance.toPublicJSON());
	}).catch(function(e) {
		res.status(401).send();
	});
	/*
	if (typeof body.name !== 'string' || typeof body.pass !== 'string') {
		res.status(400).send();
	}

	db.user.findOne({
		where: {
			name: body.name
		}
	}).then(function(user) {
		if (!user) {
			return res.status(401).send();
		}

		if (!bcrypt.compareSync(body.pass, user.get('password_hash'))) {
			return res.status(401).send();
		}

		res.json(user.toPublicJSON());
	}, function(e) {
		res.status(500).send();
	});
	*/
});

// DELETE /users/login
app.delete('/users/login', middleware.requireAuthentication, function(req, res) {
	req.token.destroy().then(function() {
		res.status(204).send();
	}, function(e) {
		res.status(500).send();
	});
});

db.sequelize.sync({force: true}).then(function() {
	app.listen(PORT, function() {
		console.log('Listening to port ' + PORT);
	});
});
