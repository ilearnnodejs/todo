var bcrypt = require('bcryptjs');
var _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
	var user = sequelize.define('user', {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				//isEmail: true,
				len: [1, 250]
			}
		},
		salt: {
			type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		pass: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function(value) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPass = bcrypt.hashSync(value, salt);

				this.setDataValue('pass', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPass);
			}
		}
	}, {
		hooks: {
			beforeValidate: function(user, options) {
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},
		classMethods: {
			authenticate: function(body) {
				return new Promise(function(resolve, reject) {
					if (typeof body.name !== 'string' || typeof body.pass !== 'string') {
						reject();
					}

					user.findOne({
						where: {
							name: body.name
						}
					}).then(function(user) {
						if (!user) {
							return reject();
						}

						if (!bcrypt.compareSync(body.pass, user.get('password_hash'))) {
							return reject();
						}

						resolve(user);
					}, function(e) {
						reject();
					});
				});
			}
		},
		instanceMethods: {
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.pick(json, 'id', 'name', 'createdAt', 'updatedAt');
			}
		}
	});

	return user;
};