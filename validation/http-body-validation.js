/*
 *  Validation rules for HTTP body content
 *  Created by Jamie Morris on 27/02/15.
 */
var Joi = require('joi');

exports.user = {
    body: {
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/).required(),
        firstName: Joi.string().min(2).max(30).required(),
        lastName: Joi.string().min(2).max(30).required()
    }
};

exports.editUser = {
    body: {
        password: Joi.string().regex(/[a-zA-Z0-9]{3,30}/),
        firstName: Joi.string().min(2).max(30),
        lastName: Joi.string().min(2).max(30)
    }
};

exports.QA = {
    body: {
        type: Joi.string().valid(["multi", "free", "call"]).required(),
        question: Joi.string().allow("").required(),
        answer: Joi.any().required(),

        answers: Joi.array(),
        additionalInfo: Joi.object()
    }
};

exports.version = {
    body: {
        QAs: Joi.array().includes(Joi.object().keys({
            type: Joi.string().valid(["multi", "free", "call"]).required(),
            question: Joi.string().allow('').required(),
            answer: Joi.any().required(),

            answers: Joi.array(),
            additionalInfo: Joi.object()
        }))
    }
};

exports.assessment = {
    body: {
        title: Joi.string().min(3).max(30).required(),
        versions: Joi.array().includes(Joi.object().keys({
            QAs:  Joi.array().includes(Joi.object().keys({
                type: Joi.string().valid(["multi", "free", "call"]).required(),
                question: Joi.string().allow('').required(),
                answer: Joi.any().required(),

                answers: Joi.array(),
                additionalInfo: Joi.object()
            }))
        }))
    }
};

exports.assessmentSchedule = {
    body: {
        startDate: Joi.date().required(),
        endDate: Joi.date().min(Joi.ref('startDate')).required(),
        assessment: Joi.string().length(24).required(),
        version: Joi.string().length(24).required(),
        students: Joi.array().includes(Joi.object().keys({
            username: Joi.string().required()
        })),
        admin: Joi.string().required()
    }
};

exports.assessmentScheduleStudent = {
    body: {
        username: Joi.string().required()
    }
};

exports.assessmentScheduleDates = {
    body: {
        startDate: Joi.date().required(),
        endDate: Joi.date().min(Joi.ref('startDate')).required()
    }
};

exports.startScheduledAssessment = {
    params: {
        scheduleId: Joi.string().length(24).required(),
        studentUsername: Joi.string().alphanum().min(3).max(30).required()
    }
};

exports.endScheduledAssessment = {
    params: {
        scheduleId: Joi.string().length(24).required(),
        studentUsername: Joi.string().alphanum().min(3).max(30).required()
    },
    body: Joi.array().includes(Joi.object().keys({
        type: Joi.string().valid(["multi", "free", "call"]).required(),
        question: Joi.string().required(),
        answer: Joi.any().required()
    }))
};