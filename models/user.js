module.exports = function(sequelize, DataTypes) {
	return sequelize.define('user', {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				//isEmail: true,
				len: [1, 250]
			}
		},
		pass: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [7, 100]
			}
		}
	}, {
		hooks: {
			beforeValidate: function(user, options) {
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		}
	});
};