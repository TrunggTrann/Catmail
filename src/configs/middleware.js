const express = require('express')
const morgan = require('morgan')
const dotenv = require('dotenv')
const path = require('path')
const cors = require('cors')
const hbs = require('express-handlebars')
const _handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');


// const passport = require('passport')
dotenv.config()

const middleware = (app) => {

	app.engine('handlebars', hbs.engine({
		defaultLayout: 'main',
		handlebars: allowInsecurePrototypeAccess(_handlebars),
		helpers: {
			ifeq: function(val1, val2) {
				return (val1 == val2);
			},
			truncateString:  function(str, len) {
				if (str.length > len) {
				  var newStr = str.substr(0, len);
				  return newStr + '...';
				}
				return str;
			}
		}
	}))
	app.set('view engine', 'handlebars')
	app.use(session({
		secret: process.env.SECRET_KEY_JWT,
		resave: false,
		saveUninitialized: false,
		store: MongoStore.create({
		  mongoUrl: process.env.MONGODB_CONNECTION
		})
	}));

	app.use(morgan('short'))
	app.use(cors())
	app.use(cookieParser());
	app.use(express.json())
	// app.use(passport.initialize());
	// app.use(passport.session());
	app.use(express.urlencoded({ extended: true }))
	app.use(express.static(path.join(__dirname, '../../public')))
	app.use(express.static(path.join(__dirname, '../uploads')))

	app.use(flash());
	app.use(function(req, res, next) {
		res.locals.success = req.flash('success');
		res.locals.failure = req.flash('failure');
		next();
	});

}

module.exports = middleware