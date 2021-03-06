/**
 *  Provides application specific interactions with the database providing data upload operations.
 *
 *  All operations take a callback as their final param (that takes two params):
 *      - (err) - Any errors that may have occurred when contacting the database
 *      - (cb) - A standard callback function with error and result params respectively
 *  - Created by Jamie Morris on 06/02/15.
 */

var log4js = require("log4js");

var databaseConnection = require('./database-connection');
var ObjectId = require('mongoose').Types.ObjectId;

//Standard callback function for all repository functions:
function repositoryCallback(err, data, cb) {
    if (err) cb(err, null);
    else cb(null, data);
}

exports.insertStudent = function(student, cb) {
    databaseConnection.students(student).save(function(err, data) {repositoryCallback(err,data,cb);});
};

exports.editStudent = function(username, student, cb) {
    databaseConnection.students.update({ "username": username }, student, function(err, data) {repositoryCallback(err,data,cb);});
};

exports.insertAssessmentResultIntoStudent = function(username, assessmentResults, cb) {
    databaseConnection.students.update({ "username": username },
        { $push: { "assessmentResults": assessmentResults } },
        function(err, data) {
            repositoryCallback(err,data,cb);
        });
};

//Drops the updated 'assessmentAnswers' field and adds a grade to the same Student:
exports.insertGradeIntoAssessmentScheduleAndRemoveUpdatedAnswersByScheduleIdAndUsername = function(scheduleId, username, grade, cb) {
  databaseConnection.assessmentSchedule.update({ "_id": scheduleId.toString(), "students.username": username},
      { $unset: { "students.$.assessmentAnswers": ""}, $set: {"students.$.grade": grade}},
      function(err, data) {
          repositoryCallback(err,data,cb);
      });
};

exports.insertAdmin = function(admin, cb) {
    databaseConnection.admins(admin).save(function(err, data) {repositoryCallback(err,data,cb);});
};

exports.editAdmin = function(username, admin, cb) {
    databaseConnection.admins.update({ "username": username}, admin, function(err, data) {repositoryCallback(err,data,cb);} );
};

exports.insertAssessment = function(assessment, cb) {
    databaseConnection.assessments(assessment).save(function(err, data) {repositoryCallback(err,data,cb);});
};

exports.editAssessment = function(assessmentId, assessment, cb) {
    //An assessment with ANY locked versions cannot be edited:
    databaseConnection.assessments.update({ "_id": ObjectId(assessmentId), "versions.locked": {$ne: true} },
        {$set: assessment},
        function(err, data) {repositoryCallback(err,data,cb);}
    );
};

exports.insertVersionIntoAssessment = function(assessmentId, version, cb) {
    databaseConnection.assessments.update({ "_id": ObjectId(assessmentId) },
        {$push:{versions:version } },
        function(err, data) {repositoryCallback(err,data,cb);}
    )
};

exports.editVersionInAssessment = function(assessmentId, versionId, version, cb) {
    databaseConnection.assessments.update({ "_id": ObjectId(assessmentId),
            //Only matches assessments with the given version ID AND where that version is NOT locked:
            "versions": {
                "$elemMatch": {
                    "_id": ObjectId(versionId),
                    "locked": {$ne: true}
                }
            }
        },
        {$set: {"versions.$": version}},
        function(err, data) {repositoryCallback(err,data,cb);
    });
};

exports.insertQuestionIntoVersionOfAssessment = function(question, assessmentId, versionId, cb) {
    databaseConnection.assessments.update({ "_id": ObjectId(assessmentId),
            //Only matches assessments with the given version ID AND where that version is NOT locked:
            "versions": {
                "$elemMatch": {
                    "_id": ObjectId(versionId),
                    "locked": {$ne: true}
                }
            }
        },
        {$push: {"versions.$.QAs": question}},
        function(err, data) {repositoryCallback(err,data,cb);
    });
};

exports.editQuestionInVersionOfAssessment = function(question, assessmentId, versionId, questionNo, cb) {
    var fieldString = "versions.$.QAs." + questionNo;
    var updateObj = { $set: {}};
    updateObj["$set"][fieldString] = question;


    databaseConnection.assessments.update({ "_id": ObjectId(assessmentId),
            //Only matches assessments with the given version ID AND where that version is NOT locked:
            "versions": {
                "$elemMatch": {
                    "_id": ObjectId(versionId),
                    "locked": {$ne: true}
                }
            }
        },
        updateObj,
        function(err, data) {repositoryCallback(err,data,cb);
        });
};

exports.insertAssessmentSchedule = function(assessmentDateObject, cb) {
    databaseConnection.assessmentSchedule(assessmentDateObject).save(function(err, data) {repositoryCallback(err,data,cb);});
};

exports.insertStudentIntoAssessmentSchedule = function(scheduledAssessmentId, student, cb) {
    student.attended = false;
    databaseConnection.assessmentSchedule.update({ "_id": ObjectId(scheduledAssessmentId),
            //CANT edit any schedules in the past:
            startDate: {$gt : new Date() }
        },
        { $push: { students: student } },
        function(err, data) {repositoryCallback(err,data,cb);});
};

exports.editAssessmentScheduleDates = function(scheduledAssessmentId, dates, cb) {
    databaseConnection.assessmentSchedule.update({ "_id": ObjectId(scheduledAssessmentId),
            //CANT edit any schedules in the past:
            startDate: {$gt : new Date() }
        },
        dates,
        function(err, data) {repositoryCallback(err,data,cb);});
};

exports.editAssessmentSchedule = function(scheduledAssessmentId, schedule, cb) {
    databaseConnection.assessmentSchedule.update({ "_id": ObjectId(scheduledAssessmentId),
            //CANT edit any schedules in the past:
            startDate: {$gt : new Date() }
        },
        schedule,
        function(err, data) {repositoryCallback(err,data,cb);});
};

exports.updateStudentProgress = function(scheduledAssessmentId, studentUsername, answers, cb) {
    databaseConnection.assessmentSchedule.update({_id: ObjectId(scheduledAssessmentId), "students.username": studentUsername},
        { $set: { "students.$.assessmentAnswers": answers }},
        function(err, data) {repositoryCallback(err,data,cb);});
};

exports.lockAssessmentVersion = function(assessmentId, versionId, cb) {
    databaseConnection.assessments.update({ "_id": ObjectId(assessmentId), "versions._id": ObjectId(versionId) },
        { $set: { "versions.$.locked": true}},
        function(err, data) {repositoryCallback(err,data,cb);});
};

exports.setStudentAttendedInAssessmentSchedule = function(scheduledAssessmentId, studentUsername, cb) {
    databaseConnection.assessmentSchedule.update({_id: ObjectId(scheduledAssessmentId), "students.username": studentUsername},
        { $set: { "students.$.dates.startDate": new Date() }},
        function(err, data) {repositoryCallback(err,data,cb);});
};

exports.setStudentFinishedInAssessmentSchedule = function(scheduledAssessmentId, studentUsername, cb) {
    databaseConnection.assessmentSchedule.update({_id: ObjectId(scheduledAssessmentId), "students.username": studentUsername},
        { $set: { "students.$.dates.endDate": new Date() }},
        function(err, data) {repositoryCallback(err,data,cb);});
};
