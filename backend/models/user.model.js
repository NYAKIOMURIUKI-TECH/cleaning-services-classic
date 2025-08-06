const db = require('../config/db.config');
const { DataTypes } = require('sequelize');

const User = db.define('User', {
  fullName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM('client', 'cleaner', 'admin'),
    defaultValue: 'client',
  },
});

module.exports = User;
