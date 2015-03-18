/**
 * Provides a connection to the database and only exposes the collections we have models set up for.
 * Created by Jamie Morris on 06/02/15.
 */
var mongoose = require('mongoose');

var databaseConfig = require('./database-config');

var log4js = require("log4js");
var log4js_extend = require("log4js-extend");

log4js_extend(log4js, {
    path: __dirname,
    format: " (at @name (@file:@line:@column))"
});

var logger = log4js.getLogger();

var databaseUri = databaseConfig.uri + ":" + databaseConfig.port + "/" + databaseConfig.dbName;
var connected = false;

//Connect to database:
mongoose.connect(databaseUri, databaseConfig);

//Verify successful connection:
var db = mongoose.connection;

var Schema = mongoose.Schema;

//Log successful/unccessful connection:
db.on('error', function(errorMessage) {
    logger.error("Connection error: ", errorMessage);
    connected = false;
});
db.on('connected', function () {
    logger.info("Successful connection to " + databaseUri);
    connected = true;
});

/*********************
 *                   *
 *      Schemas     *
 *                   *
 /*********************/


var QASchema = new Schema({
    "type": String,
    "question": String,
    "answers": {},
    "answer": {},
    "additionalInfo": {}
}, { versionKey: false });

var versionsSchema = new Schema({
    "QAs": [QASchema],
    "locked": Boolean
}, { versionKey: false });

var assessmentSchema = new Schema({
    "title": String,
    "versions": [versionsSchema],
    "createdBy": String,
    "createdDate": Date
}, { versionKey: false });

var resultSchema = new Schema({
    "date": Date,
    "score": Number,
    "markedAnswers": Array,
    "percent": Number,
    "assessment": Schema.Types.ObjectId,
    "version": Schema.Types.ObjectId
}, { versionKey: false });

var studentSchema = new Schema({
    "username": String,
    "password": String,
    "firstName": String,
    "lastName": String,
    "assessmentResults": [resultSchema]
}, { versionKey: false });

var adminSchema = new Schema({
    "username": String,
    "password": String
}, { versionKey: false });

var assessmentSchedule = new Schema({
    startDate: Date,
    endDate: Date,
    assessment: Schema.Types.ObjectId,
    version: Schema.Types.ObjectId,
    students: [ {username: String, dates: {startDate: Date, endDate: Date} }],
    admin: String
}, { versionKey: false });

/*********************
 *                   *
 *      Exports      *
 *                   *
/*********************/

/*
    Collection models:
 */
exports.assessments = mongoose.model('assessments', assessmentSchema, "assessments");
exports.assessmentSchedule = mongoose.model('assessmentSchedule', assessmentSchedule, "assessmentSchedule");
exports.students = mongoose.model('students', studentSchema, "students");
exports.admins = mongoose.model('admins', adminSchema, "admins");

/*
    Other features:
 */

exports.isConnected = function() {
    return connected;
};
