/**
 * Basic services that interact with the database layer to delete data.
 *  Startup: C:\apps\mongodb-win32-i386-2.6.0\bin\mongod --dbpath C:\apps\mongodb-win32-i386-2.6.0\data\db
 * Created by Jamie Morris on 07/02/15..
 */
var dataDeleteRepository = require('../repositories/data-delete-repository.js');
var databaseConnection = require('../repositories/database-connection');

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

exports.deleteAdmin = function(req, res) {
    logger.info("DELETE: admin " + req.params.username);
    dataDeleteRepository.deleteAdmin(req.params.username, function(err, responseObj) {
        if (err) res.status(500).json(err);
        else res.json(responseObj);
    });
};

exports.deleteStudent = function(req, res) {
    logger.info("DELETE: student " + req.params.username);
    dataDeleteRepository.deleteStudent(req.params.username, function(err, responseObj) {
        if (err) res.status(500).json(err);
        else res.json(responseObj);
    });
};

exports.deleteAssessmentById = function(req, res) {
    logger.info("DELETE: assessment " + req.params.assessmentId);
    dataDeleteRepository.deleteAssessmentById(req.params.assessmentId, function(err, responseObj) {
        if (err) res.status(500).json(err);
        else res.json(responseObj);
    });
};

exports.deleteVersionsInAssessment = function(req, res) {
    logger.info("DELETE: all version in [assessment: " + req.params.assessmentId + "]");
    dataDeleteRepository.deleteAssessmentVersions(req.params.assessmentId, function(err, responseObj) {
        if (err) res.status(500).json(err);
        else res.json(responseObj);
    });
};

exports.deleteVersionInAssessmentById = function(req, res) {
    logger.info("DELETE: version " + req.params.versionId + " in [assessment: " + req.params.assessmentId + "]");
    dataDeleteRepository.deleteVersionInAssessmentById(req.params.assessmentId, req.params.versionId, function(err, responseObj) {
        if (err) res.status(500).json(err);
        else res.json(responseObj);
    });
};

exports.deleteQuestionsInAssessmentVersion = function(req, res) {
    logger.info("DELETE: all questions [assessment: " + req.params.assessmentId + ", version: " + req.params.versionId+"]");
    dataDeleteRepository.deleteQuestionsInVersionByAssessmentIdAndVersionId(req.params.assessmentId, req.params.versionId, function(err, responseObj) {
        if (err) res.status(500).json(err);
        else res.json(responseObj);
    });
};

exports.deleteQuestionInAssessmentVersion = function(req, res) {
    logger.info("DELETE: question " + req.params.questionId + " [assessment: " + req.params.assessmentId + ", version: " + req.params.versionId +"]");
    dataDeleteRepository.deleteQuestionInVersionByAssessmentIdAndVersionNoAndQuestionId(req.params.assessmentId, req.params.versionId,
        req.params.questionId, function(err, responseObj) {
        if (err) res.status(500).json(err);
        else res.json(responseObj);
    });
};

exports.deleteScheduleByScheduleId = function(req, res) {
    logger.info("DELETE: schedule " + req.params.scheduleId);
    dataDeleteRepository.deleteScheduleByScheduleId(req.params.scheduleId, function(err, responseObj) {
        if (err) res.status(500).json(err);
        else res.json(responseObj);
    });
};

exports.deleteStudentFromScheduleByScheduleIdAndUsername = function(req, res) {
    logger.info("DELETE: "  + req.params.username + " from assessment schedule " + req.params.scheduleId);
    dataDeleteRepository.deleteStudentFromScheduleByScheduleIdAndUsername(req.params.scheduleId, req.params.username,
        function(err, responseObj) {
            if (err) res.status(500).json(err);
            else res.json(responseObj);
        }
    );
};