/**
 *  Validation rules for URL parameters
 *  Created by Jamie Morris on 27/02/15.
 */

var Joi = require('joi');

exports.user = {
    params: {
        username: Joi.string().alphanum().min(3).max(30).required()
    }
};

exports.assessment = {
    params: {
        assessmentId: Joi.string().length(24).required()
    }
};

exports.assessmentAndVersion = {
    params: {
        assessmentId: Joi.string().length(24).required(),
        versionId: Joi.string().length(24).required()
    }
};

exports.assessmentAndVersionAndQuestion = {
    params: {
        assessmentId: Joi.string().length(24).required(),
        versionId: Joi.string().length(24).required(),
        questionId: Joi.string().length(24).required()
    }
};

exports.schedule = {
    params: {
        scheduleId: Joi.string().length(24).required()
    }
};

exports.scheduleAndStudent = {
    params: {
        scheduleId: Joi.string().length(24).required(),
        username: Joi.string().alphanum().min(3).max(30).required()
    }
};