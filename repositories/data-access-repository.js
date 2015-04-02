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
var async = require('async');
//Standard callback function for all access repository functions:
function repositoryCallback(err, data, cb) {
    if (err) cb(err, null);
    else cb(null, data);
}

exports.findStudents = function(query, cb) {
    databaseConnection.students.find(query, {password: 0}).lean().exec(function(err, students) {
        //Mongoose populate doesn't work, doing it ourselves populating version AND assessment:
        async.each(students, function (student, studentsAsyncCallback) {
            async.each(student.assessmentResults, function (assessmentResult, assessmentResultCallback) {
                databaseConnection.assessments.findOne({_id: assessmentResult.assessment.toString()}, {"versions.QAs.answer": 0}).lean().exec(function (err, assessment) {
                    if (assessment != null) {
                        assessmentResult.assessment = assessment;
                        for (var  version = 0; version < assessment.versions.length; version++) {
                            if (assessment.versions[version]._id.equals(assessmentResult.version)) {
                                assessmentResult.version = (version+1);
                                break;
                            }
                        }
                    }
                    else {
                        assessmentResult.assessment = null; //An assessment that doesn't exist - i.e. removed!!
                    }
                    assessmentResultCallback();
                });
            }, function (err) {
                if (err) repositoryCallback(err, null, null);
                studentsAsyncCallback();
            });
        }, function (err) {
            repositoryCallback(err, students, cb);
        });
    });
};

exports.findStudentByUsername = function(username, projection, cb) {
    databaseConnection.students.findOne({"username": username}, projection).lean().exec(function(err, student) {
        if (err) repositoryCallback(err, null, cb);
        else if (student == null) repositoryCallback(err, null, cb);
        else {
            //Mongoose populate doesn't work, doing it ourselves populating version AND assessment:
            async.each(student.assessmentResults, function (assessmentResult, assessmentResultCallback) {
                databaseConnection.assessments.findOne({_id: assessmentResult.assessment.toString()}, {"versions.QAs.answer": 0}).lean().exec(function (err, assessment) {
                    if (assessment != null) {
                        assessmentResult.assessment = assessment;
                        for (var  version = 0; version < assessment.versions.length; version++) {
                            if (assessment.versions[version]._id.equals(assessmentResult.version)) {
                                assessmentResult.version = (version+1);
                                break;
                            }
                        }
                    }
                    else {
                        assessmentResult.assessment = null; //An assessment that doesn't exist - i.e. removed!!
                    }
                    assessmentResultCallback();
                });
            }, function (err) {
                if (err) repositoryCallback(err, null, null);
                repositoryCallback(err, student, cb);
            });
        }
    });
};

exports.findStudentByUsernameAndAssessmentScheduleId = function(username, scheduleId, cb) {
    databaseConnection.students.findOne({"username": username, "assessmentResults.scheduledAssessment": scheduleId},
        {"assessmentResults.markedAnswers.result.actual": 0}).lean().exec(function(err, data) {
            if (data != null) {
                for (var result = 0; result < data.assessmentResults.length; result++) {
                    if (data.assessmentResults[result].scheduledAssessment == scheduleId) {
                        data = data.assessmentResults[result];
                        //Mongoose populate doesn't work, doing it ourselves populating version AND assessment:
                        databaseConnection.assessments.findOne({_id: data.assessment}, {"versions.QAs.answer": 0}).lean().exec(function(err, assessment) {
                            if (assessment != null) data.assessment = {"title": assessment.title};
                            for (var version in assessment.versions) {
                                if (assessment.versions[version]._id.equals(data.version)) {
                                    data.version = {
                                        "no": (parseInt(version)+1)
                                    };
                                    break;
                                }
                            }

                            repositoryCallback(err, data, cb);
                        })
                        break;
                    }
                }
            }
            else {
                repositoryCallback(err, null, cb);
            }

    });
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

exports.findAllScheduledAssessments = function(query, cb) {
    databaseConnection.assessmentSchedule.find(query, function(err, data) {
        //Mongoose populate doesn't work, doing it ourselves populating version AND assessment:
        async.each(data, function(d, asyncCallback) {
            databaseConnection.assessments.findOne({_id: d.assessment}, {"versions.QAs.answer": 0},  function(err, assessment) {
                assessment = assessment.toObject();
                if (assessment != null) d["_doc"].assessment = assessment;
                for (var version in assessment.versions) {
                    if (assessment.versions[version]._id.equals(d["_doc"].version)) {
                        d["_doc"].version = {
                            "no": (parseInt(version)+1),
                            "object": assessment.versions[version]
                        };
                        break;
                    }
                }
                asyncCallback();
            })
        }, function(err) {
            if (err) repositoryCallback(err,null,null);
            else {
                repositoryCallback(err,data,cb);
            }
        });

    });
};

exports.findScheduledAssessmentById = function(scheduleId, cb) {
    databaseConnection.assessmentSchedule.findOne({"_id": scheduleId}).lean().exec( function(err, data) {
            if (data == null) {
                cb({"message": "Scheduled assessment " + scheduleId + " couldn't be found."});
            }
            else {
                //Mongoose populate doesn't work, doing it ourselves populating version AND assessment:
                databaseConnection.assessments.findOne({_id: data.assessment}, {"versions.QAs.answer": 0}).lean().exec(function(err, assessment) {
                    if (assessment != null) data.assessment = assessment;
                    for (var version in assessment.versions) {
                        if (assessment.versions[version]._id.equals(data.version)) {
                            data.version = {
                                "no": (parseInt(version)+1),
                                "object": assessment.versions[version]
                            };
                            break;
                        }
                    }
                    repositoryCallback(err,data,cb);
                });
            }
        });
};

exports.findScheduledAssessmentByScheduleIdAndStudentUserName = function (scheduleId, studentUsername, cb) {
    databaseConnection.assessmentSchedule.findOne({"_id": scheduleId, "students.username": studentUsername},
        function(err, data) {repositoryCallback(err,data,cb);
    });
};

exports.hasStudentStartedScheduledAssessment = function(scheduledAssessmentId, studentUsername, cb) {
    databaseConnection.assessmentSchedule.findOne({_id: ObjectId(scheduledAssessmentId), "students.username": studentUsername, "students": { "$elemMatch": {"dates.startDate": {$exists: true}}}},
        function(err,data) {
            if (err) {
                repositoryCallback(err, null,cb);
            }
            else if (data == null) {
                repositoryCallback(err,false,cb);
            }
            else {
                repositoryCallback(err,true,cb);
            }
        });
};

exports.hasStudentFinishedScheduledAssessment = function(scheduledAssessmentId, studentUsername, cb) {
    databaseConnection.assessmentSchedule.aggregate([
            {$unwind : "$students" },
            {
                $match: {
                    _id: scheduledAssessmentId,
                    "students.username":  studentUsername,
                    "students.dates.endDate": {"$exists": true}
                }
            }
        ],
        function(err,data) {
            if (err) {
                repositoryCallback(err, null,cb);
            }
            else if (data.length == 0) {
                repositoryCallback(err,false,cb);
            }
            else {
                repositoryCallback(err,true,cb);
            }
        });
};