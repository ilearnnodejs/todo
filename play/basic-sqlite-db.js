var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-db.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

var User = sequelize.define('user', {
	name: Sequelize.STRING
});

Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync().then(function() { // force to recreate tables
	console.log('everything is synced');

	User.findById(1).then(function(user) {
		user.getTodos({
			where: {
				completed: false
			}
		}).then(function(todos) {
			todos.forEach(function(todo) {
				console.log(todo.toJSON());
			});
		});
	});
	/*
	User.create({
		name: 'Harry'
	}).then(function() {
		return Todo.create({
			description: 'Clean'
		});
	}).then(function(todo) {
		User.findById(1).then(function (user) {
			user.addTodo(todo);
		});
	});
	*/
	/*
	Todo.create({
		description: 'Walk 1',
		completed: false
	}).then(function(todo) {
		return Todo.create({
			description: 'Clean'
		});
	}).then(function() {
		//return Todo.findById(1);
		return Todo.findAll({
			where: {
				completed: false,
				description: {
					$like: '%a%'
				}
			}
		});
	}).then(function(todos) {
		if (todos) {
			todos.forEach(function(todo) {
				console.log(todo.toJSON());
			});
		} else {
			console.log('no todo found');
		}
	}).catch(function(e) {
		console.log(e);
	});
	*/
});