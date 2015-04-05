/**
 * Basic services that interact with the database layer to access data.
 *  Startup: C:\apps\mongodb-win32-i386-2.6.0\bin\mongod --dbpath C:\apps\mongodb-win32-i386-2.6.0\data\db
 * Created by Jamie Morris on 07/02/15
 */
var dataAccessRepository = require('../repositories/data-access-repository.js');
var dataUploadRepository = require('../repositories/data-upload-repository.js');

var assessmentMarker = require('./assessment-marking-services/assessmentMarker.js');
var authCheck = require('../authentication/check-authenticated');

var fs = require('fs');
var md5 = require('md5');
var path = require('path');
var async = require('async');
var passport = require('../authentication/local-strategies').passport;

var ObjectId = require('mongoose').Types.ObjectId;

var log4js = require("log4js");
var log4js_extend = require("log4js-extend");

log4js_extend(log4js, {
    path: __dirname,
    format: " (at @name (@file:@line:@column))"
});

var logger = log4js.getLogger();

exports.insertStudent = function(req, res) {
    logger.info("POST: inserting a student");

    if (authCheck.admin.checkAuthenticated(req.user)) {
        var studentDetails = req.body;
        studentDetails.password = md5(req.body.password);
        studentDetails.createdDate = new Date();

        dataAccessRepository.findStudentByUsername(studentDetails.username, {}, function(err, student) {
            if (err) res.status(500).json(err);
            else if (student) res.status(400).json({error: {errors:[{messages:["Student '" + req.body.username + "' already exists."]}]}});
            else {
                dataAccessRepository.findAdminByUsername(studentDetails.username, {}, function(err, student) {
                    if (err) res.status(500).json(err);
                    else if (student) res.status(400).json({error: {errors:[{messages:["Username '" + req.body.username + "' is already in use by an admin."]}]}});
                    else {
                        dataUploadRepository.insertStudent(studentDetails, function(err, uploadResponse) {
                            if (err) res.status(500).json(err);
                            else res.status(201).json(uploadResponse);
                        });
                    }
                });
            }
        })
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.editStudent = function(req, res) {
    logger.info("PUT: editing student '" + req.params.studentUsername + "'");

    if (authCheck.admin.checkAuthenticated(req.user)) {
        var username = req.body.username;
        var studentDetails = req.body;
        delete req.body.username;
        delete req.body._id;
        if (studentDetails.password!=null) {
            studentDetails.password = md5(req.body.password);
        }

        dataUploadRepository.editStudent(username, studentDetails, function(err, editResponse) {
            if (err) res.status(500).json(err);
            else res.status(201).json(editResponse);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.insertAdmin = function(req, res) {
    logger.info("POST: inserting an admin");

    if (authCheck.admin.checkAuthenticated(req.user)) {
        var adminDetails = req.body;
        adminDetails.password = md5(req.body.password);
        adminDetails.createdDate = new Date();

        dataAccessRepository.findAdminByUsername(req.body.username, {}, function(err, admin) {
            if (err) res.status(500).json(err);
            else if (admin) res.status(400).json({error: {errors:[{messages:["Admin '" + req.body.username + "' already exists."]}]}});
            else {
                dataAccessRepository.findStudentByUsername(adminDetails.username, {}, function(err, student) {
                    if (err) res.status(500).json(err);
                    else if (student) res.status(400).json({error: {errors:[{messages:["Username '" + req.body.username + "' is already in use by an student."]}]}});
                    else {
                        dataUploadRepository.insertAdmin(adminDetails, function(err, uploadResponse) {
                            if (err) res.status(500).json(err);
                            else res.status(201).json(uploadResponse);
                        });
                    }
                });

            }
        })
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.editAdmin = function(req, res) {
    logger.info("PUT: editing admin '" + req.params.adminUsername + "'");

    if (authCheck.admin.checkAuthenticatedByUserName(req.user, req.params.adminUsername)) {
        var username = req.body.username;
        var adminDetails = req.body;
        delete req.body.username;
        delete req.body._id;
        delete req.body.createdDate;

        if (adminDetails.password != null) {
            adminDetails.password = md5(req.body.password);
        }

        dataUploadRepository.editAdmin(username, adminDetails, function(err, editResponse) {
            if (err) res.status(500).json(err);
            else res.status(201).json(editResponse);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.insertAssessment = function(req, res) {
    logger.info("POST: inserting assessment");

    if (authCheck.admin.checkAuthenticated(req.user)) {
        for (var version in req.body.versions) {
            req.body.versions[version].locked = false;
        }

        dataAccessRepository.findAssessmentById(req.body._id, {}, function(err, assessment) {
            if (err || assessment) res.status(500).json(err);
            else {
                req.body.createdBy = req.user.admin.username;
                req.body.createdDate = new Date();
                dataUploadRepository.insertAssessment(req.body, function(err, uploadResponse) {
                    if (err) res.status(500).json(err);
                    else res.status(201).json(uploadResponse);
                });
            }
        })
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }

};

exports.editAssessment = function(req, res) {
    logger.info("PUT: editing assessment " + req.params.assessmentId);

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataUploadRepository.editAssessment(req.params.assessmentId, req.body, function(err, uploadResponse) {
            if (err) res.status(500).json(err);
            else res.status(201).json(uploadResponse);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.insertVersionIntoAssessment = function(req, res) {
    logger.info("POST: inserting new version into " + req.params.assessmentId);

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataUploadRepository.insertVersionIntoAssessment(req.params.assessmentId, req.body, function(err, uploadResponse) {
            if (err) res.status(500).json(err);
            else res.status(201).json(uploadResponse);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};


exports.editVersionInAssessment = function(req, res) {
    logger.info("PUT: editing assessment version [assesment: " + req.params.assessmentId + ", version: " + req.params.versionId + "]");

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataUploadRepository.editVersionInAssessment(req.params.assessmentId, req.params.versionId, req.body, function(err, uploadResponse) {
            if (err) res.status(500).json(err);
            else res.status(201).json(uploadResponse);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.insertQuestionIntoVersionOfAssessment = function(req, res) {
    logger.info("POST: inserting question [assessment: " + req.params.assessmentId + ", version: " + req.params.versionId + "]");

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataUploadRepository.insertQuestionIntoVersionOfAssessment(req.body, req.params.assessmentId, req.params.versionId, function(err, uploadResponse) {
            if (err) res.status(500).json(err);
            else res.status(201).json(uploadResponse);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.editQuestionInVersionOfAssessment = function(req, res) {
    logger.info("PUT: editing question [assessment: " + req.params.assessmentId + ", version: " + req.params.versionId + ", question: " +
        req.params.questionNo + "]");
    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataUploadRepository.editQuestionInVersionOfAssessment(req.body, req.params.assessmentId, req.params.versionId, req.params.questionNo,
            function(err, uploadResponse) {
                if (err) res.status(500).json(err);
                else res.status(201).json(uploadResponse);
            });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.insertAssessmentScheduleDate = function(req, res) {
    logger.info("POST: inserting schedule");

    if (authCheck.admin.checkAuthenticated(req.user)) {
        for (var student in req.body.students) {
            req.body.students[student].attended = false;
        }
        dataUploadRepository.insertAssessmentSchedule(req.body, function(err, uploadResponse) {
            if (err) res.status(500).json(err);
            else res.status(201).json(uploadResponse);
        })
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.insertStudentsIntoAssessmentSchedule = function(req, res) {
    logger.info("POST: inserting student(s) into schedule " + req.params.scheduleId);

    if (authCheck.admin.checkAuthenticated(req.user)) {
        //Batch insert:
        if( Object.prototype.toString.call( req.body ) === '[object Array]' ) {
            var insertions = {
                inserted: [],
                alreadyExists: []
            };
            async.each(req.body, function(student, iterationCallback) {
                dataAccessRepository.findScheduledAssessmentByScheduleIdAndStudentUserName(req.params.scheduleId, student.username, function(err, studentExists) {
                    if (err) res.status(500).json(err);
                    else if (studentExists) {
                        insertions.alreadyExists.push(student.username);
                        iterationCallback();
                    }
                    else {
                        dataUploadRepository.insertStudentIntoAssessmentSchedule(req.params.scheduleId, student, function(err, uploadResponse) {
                            if (err) res.status(500).json(err);
                            else insertions.inserted.push(student.username);
                            iterationCallback();
                        });
                    }
                })
            }, function(err) {
                if (err) res.status(500).json(err);
                else res.status(200).json(insertions);
            });
        }
        //Individual insert:
        else {
            dataAccessRepository.findScheduledAssessmentByScheduleIdAndStudentUserName(req.params.scheduleId, req.body.username, function(err, student) {
                if (err) res.status(500).json(err);
                else if (student)  res.status(202).json({"message": req.body.username + " is already on this assessment."});
                else {
                    dataUploadRepository.insertStudentIntoAssessmentSchedule(req.params.scheduleId, req.body, function(err, uploadResponse) {
                        if (err) res.status(500).json(err);
                        else res.status(201).json(uploadResponse);
                    });
                }
            })
        }
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.editDatesOnAssessmentSchedule = function(req, res) {
    logger.info("PUT: changing dates for assessment " + req.params.scheduleId);

    if (authCheck.admin.checkAuthenticated(req.user)) {
        if (req.body.startDate > req.body.endDate) {
            res.status(400).json({"message": "Start date should be before end date!"});
        }
        else {
            dataAccessRepository.findScheduledAssessmentById(req.params.scheduleId, function(err, assessmentSchedule) {
                if (err) res.status(500).json(err);
                else if (assessmentSchedule == null) res.status(404).json({"message": "Assessment " + req.params.scheduleId + " not found."});
                else {
                    dataUploadRepository.editAssessmentScheduleDates(req.params.scheduleId, req.body, function(err, uploadResponse) {
                        if (err) res.status(500).json(err);
                        else res.status(201).json(uploadResponse);
                    });
                }
            });
        }
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.editAssessmentSchedule = function(req, res) {
    logger.info("PUT: updating scheduled assessment " + req.params.scheduleId);

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataAccessRepository.findScheduledAssessmentById(req.params.scheduleId, function(err, assessmentSchedule) {
            if (err) res.status(500).json(err);
            else if (assessmentSchedule == null) res.status(404).json({"message": "Assessment " + req.params.scheduleId + " not found."});
            else {
                delete req.body._id;
                dataUploadRepository.editAssessmentSchedule(req.params.scheduleId, req.body, function(err, uploadResponse) {
                    if (err) res.status(500).json(err);
                    else res.status(201).json(uploadResponse);
                });
            }
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};


//Starts AND locks assessment version:
exports.attemptAssessmentStart = function(req, res) {
    logger.info("POST: attempting to start " + req.params.studentUsername + " on " + req.params.scheduleId);

    if (authCheck.student.checkAuthenticatedByUserName(req.user, req.params.studentUsername)) {
        dataAccessRepository.findScheduledAssessmentByScheduleIdAndStudentUserName(req.params.scheduleId, req.params.studentUsername, function(err, scheduledAssessment) {
            if (err) res.status(500).json(err);
            else if (scheduledAssessment == null) {
                res.status(401).json({startAssessment: false, message: "user " + req.params.studentUsername + " not enrolled onto " + req.params.scheduleId});
            }
            else {
                var currentTime = new Date();
                if (currentTime > scheduledAssessment.startDate && currentTime < scheduledAssessment.endDate) {
                    dataUploadRepository.setStudentAttendedInAssessmentSchedule(req.params.scheduleId, req.params.studentUsername, function(err, response) {
                        if (err) res.status(500).json(err);
                        else {
                            dataUploadRepository.lockAssessmentVersion(scheduledAssessment.assessment, scheduledAssessment.version, function(err, lockResponse) {
                                if (err) res.status(500).json(err);
                                else res.status(201).json({"startDate": currentTime, startAssessment: true, message: "User " + req.params.studentUsername + " started assessment."});
                            });
                        }
                    })
                }
                else if (currentTime > scheduledAssessment.endDate) {
                    res.status(401).json({startAssessment: false,message: "Scheduled assessment " + req.params.scheduleId + " has already been."});
                }
                else {
                    res.status(401).json({startAssessment: false,message: "Scheduled assessment " + req.params.scheduleId + " hasn't started yet."});
                }
            }
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.updateAssessmentProgress = function(req, res) {
    logger.info("Updating Student " + req.params.studentUsername + " progress on " + req.params.scheduleId);

    if (authCheck.student.checkAuthenticatedByUserName(req.user, req.params.studentUsername)) {
        dataAccessRepository.hasStudentStartedScheduledAssessment(req.params.scheduleId, req.params.studentUsername, function(err, hasStarted) {
            if (err) res.status(500).json(err);
            if (hasStarted) {
                dataUploadRepository.updateStudentProgress(req.params.scheduleId, req.params.studentUsername, req.body, function(err, response) {
                    if (err) res.status(500).json(err);
                    else {
                        res.json({"message": "Updated answers"});
                    }
                });
            }
            else {
                res.status(401).json({"message": "User " + req.params.studentUsername + " has not yet started this assessment or is not enrolled."});
            }
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

//Ends AND marks assessment:
exports.attemptAssessmentEnd = function(req, res) {
    logger.info("POST: attempting to end " + req.params.studentUsername + "'s session on " + req.params.scheduleId);

    if (authCheck.student.checkAuthenticatedByUserName(req.user, req.params.studentUsername)) {
        dataAccessRepository.findScheduledAssessmentByScheduleIdAndStudentUserName(req.params.scheduleId, req.params.studentUsername, function(err, scheduledAssessment) {
            if (err) res.status(500).json(err);
            else if (scheduledAssessment == null) {
                res.status(401).json({endAssessment: false, message: "user " + req.params.studentUsername + " not enrolled onto " + req.params.scheduleId});
            }
            else {
                dataAccessRepository.hasStudentFinishedScheduledAssessment(req.params.scheduleId, req.params.studentUsername, function(err, hasFinished) {
                    if (err) res.status(500).json(err);
                    else if (hasFinished) res.status(401).json("Student '" + req.params.studentUsername + "' has already finished assessment." );
                    else {
                        var currentTime = new Date();
                        if (currentTime > scheduledAssessment.startDate && currentTime < scheduledAssessment.endDate) {
                            dataUploadRepository.setStudentFinishedInAssessmentSchedule(req.params.scheduleId, req.params.studentUsername, function(err, response) {
                                if (err) res.status(500).json(err);
                                else {
                                    dataAccessRepository.findAssessmentVersionByAssessmentIdAndVersionId(scheduledAssessment.assessment, scheduledAssessment.version, {}, function(err, assessment) {
                                        if (err) res.status(500).json(err);
                                        else if (assessment != null) {
                                            try {
                                                var assessmentGrade = assessmentMarker.markAssessment(assessment, req.body);
                                                assessmentGrade.assessment = new ObjectId(scheduledAssessment.assessment);
                                                assessmentGrade.version = new ObjectId(scheduledAssessment.version);
                                                assessmentGrade.admin = scheduledAssessment.admin;
                                                assessmentGrade.scheduledAssessment = scheduledAssessment._id;

                                                dataUploadRepository.insertAssessmentResultIntoStudent(req.params.studentUsername, assessmentGrade, function(err, uploadResponse) {
                                                    if (err) res.status(500).json(err);
                                                    else {
                                                        //Remove correct answer before sending result back:
                                                        for (var markedAnswer=0;markedAnswer < assessmentGrade.markedAnswers.length; markedAnswer++) {
                                                            delete assessmentGrade.markedAnswers[markedAnswer].result.actual;
                                                        }
                                                        dataUploadRepository.insertGradeIntoAssessmentScheduleAndRemoveUpdatedAnswersByScheduleIdAndUsername(scheduledAssessment._id, req.params.studentUsername, assessmentGrade.percent, function(err) {
                                                            if (err) res.status(500).json(err);
                                                            else {
                                                                res.status(201).json({markedAssessment: assessmentGrade, endAssessment: true, message: "User " + req.params.studentUsername + " finished assessment."});
                                                            }
                                                        });
                                                    }
                                                })
                                            }
                                            catch(e) {
                                                //Responds any exceptions from marking:
                                                res.status(500).json({"message": e.toString()});
                                            }
                                        }
                                        else {
                                            res.status(400).json({"error": "No such assessment"});
                                        }
                                    });
                                }
                            })
                        }
                        else if (currentTime > scheduledAssessment.endDate) {
                            res.status(401).json({endAssessment: false,message: "Scheduled assessment " + req.params.scheduleId + " has already been."});
                        }
                        else {
                            res.status(401).json({endAssessment: false,message: "Scheduled assessment " + req.params.scheduleId + " hasn't started yet."});
                        }
                    }
                });
            }
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};


exports.authenticateUser = function(req, res, next) {
    logger.info("POST: authenticating user: " + req.body.username);

    passport.authenticate('local', function(err, user, info) {
        if (err) { res.json({"authenticated": false, "error": err}); }
        else if (user == false) res.json({"authenticated": false, "message": info.message});
        else {
            //Setup a session:
            req.logIn(user, function(err) {
                if (err) { res.json({"authenticated": false, "error": err}); }
                if (user.admin != null) {
                    res.json({"authType": "admin", "authenticated": true, "authenticatedUser": user});
                }
                else {
                    res.json({"authType": "student", "authenticated": true, "authenticatedUser": user});
                }

            });
        }
    })(req, res);
};
