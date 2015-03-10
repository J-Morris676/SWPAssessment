/**
 *  Provides application specific interactions with the database providing data access operations.
 *
 *  All operations take a callback as their final param (that takes two params):
 *      - (err) - Any errors that may have occurred when contacting the database
 *      - (cb) - A standard callback function with error and result params respectively
 *  - Created by Jamie Morris on 06/02/15.
 */
var log4js = require("log4js");

var databaseConnection = require('./database-connection');
var ObjectId = require('mongoose').Types.ObjectId;

//Standard callback function for all access repository functions:
function repositoryCallback(err, data, cb) {
    if (err) cb(err, null);
    else cb(null, data);
}

exports.findStudents = function(query, cb) {
    databaseConnection.students.find(query, {password: 0}, function(err, data) {repositoryCallback(err,data,cb);});
};

exports.findStudentByUsername = function(username, projection, cb) {
    databaseConnection.students.findOne({"username": username}, projection, function(err, data) {repositoryCallback(err,data,cb);});
};

exports.findStudentById = function(id, cb) {
    databaseConnection.students.findOne({"_id": id}, {password: 0}, function(err, data) {repositoryCallback(err,data,cb);});
};

exports.findAssessments = function(query, projection, cb) {
    databaseConnection.assessments.find(query, projection,  function(err, data) {repositoryCallback(err,data,cb);});
};

exports.findAssessmentById = function(_id, projection, cb) {
    databaseConnection.assessments.findOne({'_id': _id}, projection,  function(err, data) {repositoryCallback(err,data,cb);});
};

exports.findAssessmentVersionByAssessmentIdAndVersionId = function(assessmentId, versionId, projection, cb) {
    databaseConnection.assessments.findOne({'_id': assessmentId}, projection, function(err, assessment) {
        var version;
        for (var versionNo = 0; versionNo < assessment["_doc"]["versions"].length; versionNo++) {
            if (this.versionId.equals(assessment["_doc"]["versions"][versionNo]._id)) {
                version = assessment["_doc"]["versions"][versionNo];
                break;
            }
      }

      repositoryCallback(err,version,cb);
    }.bind( {  versionId: new ObjectId(versionId)} ));
};

exports.findQuestionByAssessmentIdAndVersionNoAndQuestionNo = function(assessmentId, versionId, questionId, projection, cb) {
    databaseConnection.assessments.findOne({'_id': assessmentId}, projection, function(err, assessment) {
        var version;

        for (var versionNo = 0; versionNo < assessment["_doc"]["versions"].length; versionNo++) {
            if (this.versionId.equals(assessment["_doc"]["versions"][versionNo]._id)) {
                version = assessment["_doc"]["versions"][versionNo];
                break;
            }
        }
        var question;
        for (var questionNo = 0; questionNo < version["QAs"].length; questionNo++) {
            if (this.questionId.equals(version["QAs"][questionNo]._id)) {
                question = version["QAs"][questionNo];
                break;
            }
        }

        repositoryCallback(err,question,cb);
    }.bind( {  versionId: new ObjectId(versionId), questionId: new ObjectId(questionId)} ));
};

exports.findAdmins = function(query, projection, cb) {
    databaseConnection.admins.find(query, projection,  function(err, data) {repositoryCallback(err,data,cb);});
};

exports.findAdminByUsername = function(username, projection, cb) {
    databaseConnection.admins.findOne({"username": username}, projection, function(err, data) {repositoryCallback(err,data,cb);});
};

exports.findAdminById = function(id, cb) {
    databaseConnection.admins.findOne({"_id": id}, function(err, data) {repositoryCallback(err,data,cb);});
};

exports.findAssessmentWithoutAnswers = function(assessmentVersion, cb) {
    databaseConnection.assessments.find({"version": assessmentVersion}, { "QAs.question" : 1, "QAs.answers": 1,
            "_id": 1, "version": 1, "title": 1}, function(err, data) {repositoryCallback(err,data,cb);});
};

exports.findAllScheduledAssessments = function(cb) {
    databaseConnection.assessmentSchedule.find({}, function(err, data) {repositoryCallback(err,data,cb)});
};

exports.findScheduledAssessmentById = function(scheduleId, cb) {
    databaseConnection.assessmentSchedule.findOne({"_id": scheduleId},
        function(err, data) {repositoryCallback(err,data,cb);
        });
};

exports.findScheduledAssessmentsByStudentUserName = function (studentUsername, cb) {
    databaseConnection.assessmentSchedule.find({"students.username": studentUsername},
        function(err, data) {repositoryCallback(err,data,cb);
    });
};

exports.findScheduledAssessmentByScheduleIdAndStudentUserName = function (scheduleId, studentUsername, cb) {
    databaseConnection.assessmentSchedule.findOne({"_id": scheduleId, "students.username": studentUsername},
        function(err, data) {repositoryCallback(err,data,cb);
    });
};