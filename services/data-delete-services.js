/**
 * Basic services that interact with the database layer to delete data.
 *  Startup: C:\apps\mongodb-win32-i386-2.6.0\bin\mongod --dbpath C:\apps\mongodb-win32-i386-2.6.0\data\db
 * Created by Jamie Morris on 07/02/15..
 */
var dataDeleteRepository = require('../repositories/data-delete-repository.js');
var authCheck = require('../authentication/check-authenticated');

var fs = require('fs');
var path = require('path');

var log4js = require("log4js");
var log4js_extend = require("log4js-extend");

log4js_extend(log4js, {
    path: __dirname,
    format: " (at @name (@file:@line:@column))"
});

var logger = log4js.getLogger();

exports.deleteAdmin = function(req, res) {
    logger.info("DELETE: admin " + req.params.username);

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataDeleteRepository.deleteAdmin(req.params.username, function (err, responseObj) {
            if (err) res.status(500).json(err);
            else res.json(responseObj);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.deleteStudent = function(req, res) {
    logger.info("DELETE: student " + req.params.username);

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataDeleteRepository.deleteStudent(req.params.username, function(err, responseObj) {
            if (err) res.status(500).json(err);
            else res.json(responseObj);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.deleteAssessmentById = function(req, res) {
    logger.info("DELETE: assessment " + req.params.assessmentId);

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataDeleteRepository.deleteAssessmentById(req.params.assessmentId, function (err, responseObj) {
            if (err) res.status(500).json(err);
            else res.json(responseObj);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.deleteVersionsInAssessment = function(req, res) {
    logger.info("DELETE: all versions in [assessment: " + req.params.assessmentId + "]");

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataDeleteRepository.deleteAssessmentVersions(req.params.assessmentId, function (err, responseObj) {
            if (err) res.status(500).json(err);
            else res.json(responseObj);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.deleteVersionInAssessmentById = function(req, res) {
    logger.info("DELETE: version " + req.params.versionId + " in [assessment: " + req.params.assessmentId + "]");

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataDeleteRepository.deleteVersionInAssessmentById(req.params.assessmentId, req.params.versionId, function(err, responseObj) {
            if (err) res.status(500).json(err);
            else res.json(responseObj);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.deleteQuestionsInAssessmentVersion = function(req, res) {
    logger.info("DELETE: all questions [assessment: " + req.params.assessmentId + ", version: " + req.params.versionId+"]");

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataDeleteRepository.deleteQuestionsInVersionByAssessmentIdAndVersionId(req.params.assessmentId, req.params.versionId, function(err, responseObj) {
            if (err) res.status(500).json(err);
            else res.json(responseObj);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.deleteQuestionInAssessmentVersion = function(req, res) {
    logger.info("DELETE: question " + req.params.questionId + " [assessment: " + req.params.assessmentId + ", version: " + req.params.versionId +"]");

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataDeleteRepository.deleteQuestionInVersionByAssessmentIdAndVersionNoAndQuestionId(req.params.assessmentId, req.params.versionId,
            req.params.questionId, function(err, responseObj) {
            if (err) res.status(500).json(err);
            else res.json(responseObj);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.deleteScheduleByScheduleId = function(req, res) {
    logger.info("DELETE: schedule " + req.params.scheduleId);

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataDeleteRepository.deleteScheduleByScheduleId(req.params.scheduleId, function(err, responseObj) {
            if (err) res.status(500).json(err);
            else res.json(responseObj);
        });
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};

exports.deleteStudentFromScheduleByScheduleIdAndUsername = function(req, res) {
    logger.info("DELETE: "  + req.params.username + " from assessment schedule " + req.params.scheduleId);

    if (authCheck.admin.checkAuthenticated(req.user)) {
        dataDeleteRepository.deleteStudentFromScheduleByScheduleIdAndUsername(req.params.scheduleId, req.params.username,
            function(err, responseObj) {
                if (err) res.status(500).json(err);
                else res.json(responseObj);
            }
        );
    }
    else {
        res.status(401).json({"message": "Not authenticated"});
    }
};