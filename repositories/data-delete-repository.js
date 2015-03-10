/**
 *  Provides application specific interactions with the database providing data delete operations.
 *
 *  All operations take a callback as their final param (that takes two params):
 *      - (err) - Any errors that may have occurred when contacting the database
 *      - (cb) - A standard callback function with error and result params respectively
 *  - Created by Jamie Morris on 06/02/15.
 */
var log4js = require("log4js");

var databaseConnection = require('./database-connection');
var ObjectId = require('mongoose').Types.ObjectId;

//Standard callback function for deletion repository functions:
function repositoryCallback(err, data, cb) {
    if (err) cb(err, null);
    else {
        var returnObj
        if (data.result)
            returnObj = {"changesMade": (data.result.n>0)};
        else
            returnObj = {"changesMade": (data.nModified>0)};

        cb(null,returnObj);
    }
};

exports.deleteAdmin = function(username, cb) {
    databaseConnection.admins.remove({"username": username}, function(err, data) {repositoryCallback(err,data,cb);});
};

exports.deleteStudent = function(username, cb) {
    databaseConnection.students.remove({"username": username}, function(err, data) {repositoryCallback(err,data,cb);});
};

exports.deleteAssessmentById = function(assessmentId, cb) {
    databaseConnection.assessments.remove({"_id": assessmentId}, function(err, data) {repositoryCallback(err,data,cb);});
};

exports.deleteAssessmentVersions = function(assessmentId, cb) {
    databaseConnection.assessments.update( { _id: ObjectId(assessmentId)},
        {"$set": {"versions": []} },
        function(err, data) {repositoryCallback(err,data,cb);}
    );
};

exports.deleteVersionInAssessmentById = function(assessmentId, versionId, cb) {
    databaseConnection.assessments.update( { _id: ObjectId(assessmentId)},
        { $pull:{
                "versions":{
                    "_id":ObjectId(versionId)
                }
            }
        },
        function(err, data) {repositoryCallback(err,data,cb);}
    );
};

exports.deleteQuestionsInVersionByAssessmentIdAndVersionId = function(assessmentId, versionId, cb) {
    databaseConnection.assessments.findOne({_id: ObjectId(assessmentId)}, function(err, data) {
        var versionNo;
        for (var versionIndex = 0; versionIndex < data.versions.length; versionIndex++) {
            if (data.versions[versionIndex]._id.equals(new ObjectId(versionId))) {
                versionNo = versionIndex;
                break;
            }
        }
        if (versionNo != null) {
            var fieldString = "versions." + versionNo + ".QAs";
            var updateObj = { $set: {} };
            updateObj["$set"][fieldString] = [];

            databaseConnection.assessments.update( { _id: ObjectId(assessmentId)},
                updateObj,
                function(err, data) {repositoryCallback(err,data,cb);}
            );
        }
        else {
            repositoryCallback({"message": "No such versionId"}, null, cb);
        }
    })

};

exports.deleteQuestionInVersionByAssessmentIdAndVersionNoAndQuestionId = function(assessmentId, versionId, questionId, cb) {
    databaseConnection.assessments.findOne({_id: ObjectId(assessmentId)}, function(err, data) {
        var versionNo;
        for (var versionIndex = 0; versionIndex < data.versions.length; versionIndex++) {
            if (data.versions[versionIndex]._id.equals(new ObjectId(versionId))) {
                versionNo = versionIndex;
                break;
            }
        }
        if (versionNo != null) {
            var fieldString = "versions." + versionNo + ".QAs";
            var updateObj = { $pull: {} };
            updateObj["$pull"][fieldString] = {"_id":  ObjectId(questionId) };

            databaseConnection.assessments.update( { _id: ObjectId(assessmentId)},
                updateObj,
                function(err, data) {repositoryCallback(err,data,cb);}
            );
        }
        else {
            repositoryCallback({"message": "No such versionId"}, null, cb);
        }
    });
};

exports.deleteScheduleByScheduleId = function(scheduleId, cb) {
    databaseConnection.assessmentSchedule.remove({"_id": scheduleId},function(err, data) {repositoryCallback(err,data,cb);});
};

exports.deleteStudentFromScheduleByScheduleIdAndUsername = function(scheduleId, username, cb) {
    databaseConnection.assessmentSchedule.update({_id: scheduleId}, { $pull: {"students": {"username": username}}},
        function(err, data) {repositoryCallback(err,data,cb);}
    );
};

