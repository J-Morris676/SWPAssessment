/**
 * Basic services that interact with the database layer to access data.
 *  -- Requires authenticated sessions and will work accordingly
 *  Startup: C:\apps\mongodb-win32-i386-2.6.0\bin\mongod --dbpath C:\apps\mongodb-win32-i386-2.6.0\data\db
 * Created by Jamie Morris on 07/02/15..
 */
var dataRepository = require('../repositories/data-access-repository.js');
var databaseConnection = require('../repositories/database-connection');
var authCheck = require('../authentication/check-authenticated');

var fs = require('fs');
var md5 = require('md5');
var path = require('path');

var log4js = require("log4js");
var log4js_extend = require("log4js-extend");

log4js_extend(log4js, {
    path: __dirname,
    format: " (at @name (@file:@line:@column))"
});

var logger = log4js.getLogger();

exports.isConnectedToDatabase = function(req, res) {
    logger.info("GET: database connectivity");
    if (!databaseConnection.isConnected())
        res.status(500).json({"errorMessage": "Failed to connect to database, please contact database administrator."});
    else
         res.json({"connected": dataRepository.isConnected() });
};

exports.getUserByUserName = function(req, res) {
    logger.info("GET: user by username '" + req.params.username + "''");

    if (authCheck.admin.checkAuthenticated(req.user) || authCheck.student.checkAuthenticatedByUserName(req.user, req.params.username)) {
        dataRepository.findStudentByUsername(req.params.username, {password:0}, function(err, student) {
            if (err) res.status(500).json(err);
            if (student != null) {
                res.json({userType: "Student", user: student});
            }
            else {
                dataRepository.findAdminByUsername(req.params.username, {password:0}, function(err, admin) {
                    if (err) res.status(500).json(err);
                    if (admin != null) {
                        res.json({userType: "Admin", user: admin});
                    }
                    else {
                        res.json({});
                    }
                });
            }
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.getAllAdmins = function(req, res) {
    (req.query.like == null ? logger.info("GET: all admins") : logger.info("GET: admins LIKE '" + req.query.like + "'"));

    if (authCheck.admin.checkAuthenticated(req.user)) {
        var query = {};
        if (req.query.like != null) {
            query.username = new RegExp('.*'+req.query.like+'.*', "i");
        }
        dataRepository.findAdmins(query, function(err, admins) {
            if (err) res.status(500).json(err);
            else res.json(admins);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.getAdminByUsername = function(req, res) {
    logger.info("GET: admin: " + req.params.username);

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataRepository.findAdminByUsername(req.params.username, {password:0}, function(err, admin) {
            if (err) res.status(500).json(err);
            if (admin) {
                res.json(admin)
            }
            else res.status(404).json(admin);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.getAllStudents = function(req, res) {
    (req.query.like == null ? logger.info("GET: all students") : logger.info("GET: students LIKE '" + req.query.like + "'"));

    if (authCheck.admin.checkAuthenticated(req.user)) {
        var query = {};
        if (req.query.like != null) {
            query.username = new RegExp('.*'+req.query.like+'.*', "i");
        }
        dataRepository.findStudents(query, function(err, students) {
            if (err) res.status(500).json(err);
            else res.json(students);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};



exports.getStudentByUserName = function(req, res) {
    logger.info("GET: student " + req.params.username);
    if (authCheck.admin.checkAuthenticated(req.user) || authCheck.student.checkAuthenticatedByUserName(req.user, req.params.username)) {
        dataRepository.findStudentByUsername(req.params.username, {password:0}, function(err, students) {
            if (err) res.status(500).json(err);
            else res.json(students);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

//Unfinished:
exports.getStudentResultsByUsernameAndScheduleId = function(req, res) {
    logger.info("GET: Results for student " + req.params.username + " in assessment " + req.params.assessmentScheduleId);
    if (authCheck.admin.checkAuthenticated(req.user) || authCheck.student.checkAuthenticatedByUserName(req.user, req.params.username)) {
        dataRepository.findStudentByUsernameAndAssessmentScheduleId(req.params.username, req.params.assessmentScheduleId, function(err, result) {
            if (err) res.status(500).json(err);
            else if (result == null) res.status(400).json(result);
            else res.json(result);
        })
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.getAllAssessments = function(req, res) {
    logger.info("GET: all assessments");
    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataRepository.findAssessments({}, {}, function(err, assessments) {
            if (err) res.status(500).json(err);
            else res.json(assessments);
        });
    }
    else if (authCheck.student.checkAuthenticated(req.user)) {
        dataRepository.findAssessments({}, {"versions.QAs.answer": 0}, function(err, assessments) {
            if (err) res.status(500).json(err);
            else res.json(assessments);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.getAssessmentById = function(req, res) {
    logger.info("GET: assessment - " + req.params.assessmentId);
    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataRepository.findAssessmentById(req.params.assessmentId, {}, function(err, assessment) {
            if (err) res.status(500).json(err);
            else if (assessment != null) res.json(assessment["_doc"]);
            else res.json([]);
        });
    }
    else if (authCheck.student.checkAuthenticated(req.user)) {
            dataRepository.findAssessmentById(req.params.assessmentId, {"versions.QAs.answer": 0}, function(err, assessment) {
                if (err) res.status(500).json(err);
                else if (assessment != null) res.json(assessment["_doc"]);
                else res.json([]);
            });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.getAssessmentVersions = function(req, res) {
    logger.info("GET: all versions in assessment " + req.params.assessmentId);

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataRepository.findAssessmentById(req.params.assessmentId, {}, function(err, assessment) {
            if (err) res.status(500).json(err);
            else if (assessment != null) res.json(assessment["_doc"]["versions"]);
            else res.json({});
        });
    }
    else if (authCheck.student.checkAuthenticated(req.user)) {
        dataRepository.findAssessmentById(req.params.assessmentId, {"versions.QAs.answer": 0}, function(err, assessment) {
            if (err) res.status(500).json(err);
            else if (assessment != null) res.json(assessment["_doc"]["versions"]);
            else res.json({});
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.getAssessmentVersionById = function(req, res) {
    logger.info("GET: version " + req.params.versionId + " in assessment " + req.params.assessmentId);
    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataRepository.findAssessmentVersionByAssessmentIdAndVersionId(req.params.assessmentId, req.params.versionId, {},
            function(err, assessment) {
                if (err) res.status(500).json(err);
                else if (assessment != null) res.json(assessment);
                else res.json({});
        });
    }
    else if (authCheck.student.checkAuthenticated(req.user)) {
        dataRepository.findAssessmentVersionByAssessmentIdAndVersionId(req.params.assessmentId, req.params.versionId,
            {"versions.QAs.answer": 0},
            function(err, assessment) {
                if (err) res.status(500).json(err);
                else if (assessment != null) res.json(assessment);
                else res.json({});
            });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.getQuestionsByAssessmentIdAndVersionId = function(req, res) {
    logger.info("GET: all questions in [assessment: " + req.params.assessmentId + ", version: " + req.params.versionId + "]");

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataRepository.findAssessmentVersionByAssessmentIdAndVersionId(req.params.assessmentId, req.params.versionId, {},
            function(err, assessment) {
            if (err) res.status(500).json(err);
            else if (assessment != null) res.json(assessment["_doc"]["QAs"]);
            else res.json({});
        });
    }
    else if (authCheck.student.checkAuthenticated(req.user)) {
        dataRepository.findAssessmentVersionByAssessmentIdAndVersionId(req.params.assessmentId, req.params.versionId, {"versions.QAs.answer": 0},
            function(err, assessment) {
            if (err) res.status(500).json(err);
            else if (assessment != null) res.json(assessment["_doc"]["QAs"]);
            else res.json({});
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.getQuestionByAssessmentIdAndVersionIdAndQuestionId = function(req, res) {
    logger.info("GET: question " + req.params.questionId + " in [assessment: " + req.params.assessmentId + ", version: " + req.params.versionId + "]");
    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataRepository.findQuestionByAssessmentIdAndVersionNoAndQuestionNo(req.params.assessmentId, req.params.versionId, req.params.questionId, {},
            function(err, question) {
            if (err) res.status(500).json(err);
            else if (question != null) res.json(question);
            else res.json({});
        });
    }
    else if (authCheck.student.checkAuthenticated(req.user)) {
        dataRepository.findQuestionByAssessmentIdAndVersionNoAndQuestionNo(req.params.assessmentId, req.params.versionId, req.params.questionId,
            {"versions.QAs.answer": 0},
            function(err, question) {
                if (err) res.status(500).json(err);
                else if (question != null) res.json(question);
                else res.json({});
            });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.getScheduledAssessments = function(req, res) {
    logger.info("GET: scheduled assessments");

    if (authCheck.admin.checkAuthenticated(req.user)) {
        if (req.query.when == null) {
            dataRepository.findAllScheduledAssessments({}, function(err, scheduledAssessments) {
                if (err) res.status(500).json(err);
                else res.json(scheduledAssessments);
            });
        }
        else if (req.query.when.toLowerCase() == "ongoing") {
            dataRepository.findAllScheduledAssessments({"startDate": {"$lt": new Date()}, "endDate": { "$gt": new Date()}}, function(err, scheduledAssessments) {
                if (err) res.status(500).json(err);
                else res.json(scheduledAssessments);
            });
        }
        else if (req.query.when.toLowerCase() == "past") {
            dataRepository.findAllScheduledAssessments({"endDate": { "$lt": new Date()}}, function(err, scheduledAssessments) {
                if (err) res.status(500).json(err);
                else res.json(scheduledAssessments);
            });
        }
        else if (req.query.when.toLowerCase() == "future") {
            dataRepository.findAllScheduledAssessments({"startDate": { "$gt": new Date()}}, function(err, scheduledAssessments) {
                if (err) res.status(500).json(err);
                else res.json(scheduledAssessments);
            });
        }
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.getScheduledAssessmentsById = function(req, res) {
    logger.info("GET: scheduled assessment: " + req.params.scheduledAssessmentId);

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataRepository.findScheduledAssessmentById(req.params.scheduledAssessmentId, function(err, scheduledAssessment) {
            if (err) res.status(500).json(err);
            else res.json(scheduledAssessment);
        });
    }
    //Student can only GET schedules he/she's enrolled on:
    else if (authCheck.student.checkAuthenticated(req.user)) {
        dataRepository.findScheduledAssessmentById(req.params.scheduledAssessmentId, function (err, scheduledAssessment) {
            if (err) res.status(500).json(err);
            else if (scheduledAssessment == null) res.json({});
            else {
                for (var student in scheduledAssessment.students) {
                    if (scheduledAssessment.students[student].username == req.user.student.username) {
                        res.json(scheduledAssessment);
                        return;
                    }
                }
                res.status(401).json({"message": "Not authenticated"});
            }
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.getScheduledAssessmentsByStudentUsername = function(req, res) {
    logger.info("GET: scheduled assessments for user: " + req.params.username);

    if (authCheck.admin.checkAuthenticated(req.user) || authCheck.student.checkAuthenticatedByUserName(req.user, req.params.username)) {
        var query = {"students.username": req.params.username};
        if (req.query.when) {
            if (req.query.when.toLowerCase() == "ongoing") {
                query.startDate = {"$lt": new Date()};
                query.endDate = { "$gt": new Date()};
            }
            else if (req.query.when.toLowerCase() == "past") {
                query.endDate = { "$lt": new Date()};
            }
            else if (req.query.when.toLowerCase() == "future") {
                query.startDate = { "$gt": new Date()};
            }
        }


        dataRepository.findAllScheduledAssessments(query, function(err, scheduledAssessments) {
            if (err) res.status(500).json(err);
            else res.json(scheduledAssessments);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

//Auth:
exports.logout = function(req, res) {
    if (req.user != null) {
        if (req.user.admin) {
            var username = req.user.admin.username;
            logger.info("GET: logging out " + username);
            req.logout();
            res.json({"message": username + " successfully logged out", loggedOut: true});
        }
        else {
            var username = req.user.student.username;
            logger.info("GET: logging out " + username);
            req.logout();
            res.json({"message": username + " successfully logged out", loggedOut: true});
        }
    }
    else {
        res.json({"message": "No session exists", loggedOut: false});
    }
};

exports.isLoggedIn = function(req, res) {
    logger.info("GET: Is a user logged in");
    if (req.user) {
        if (req.user.student != null) {
            res.json({username: req.user.student.username, authType: "student", "loggedIn": true});
        }
        else if (req.user.admin!= null) {
            res.json({username: req.user.admin.username, authType: "admin", "loggedIn": true});
        }
        else {
            res.json({"loggedIn": false});
        }
    }
    else {
        res.json({"loggedIn": false});
    }
};