/**
 * Created by Jamie Morris on 06/12/15.
 * To resolve server dependencies:
 *  - npm-install-missing
 */

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var path = require('path');
var validate = require('express-validation');

var dataAccessServices = require('./services/data-access-services');
var dataUploadServices = require('./services/data-upload-services');
var dataDeleteServices = require('./services/data-delete-services');

var paramsValidation = require('./validation/http-url-params-validation');
var bodyValidation = require('./validation/http-body-validation');

var passport = require('./authentication/local-strategies').passport;
var flash = require('connect-flash');
var session = require("express-session");

var app = express();

// all environments
app.set('port', process.env.PORT || 3002);

app.use(serveStatic(path.join(__dirname, 'public')));
app.disable('etag');

app.use(session({
    secret: 'keyboardcat',
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(bodyParser.json());

//Passes urls on for Angular app:
app.get('/:page', function(req, res) {
    res.sendFile('index.html', { root: __dirname+'/public' });
});
//Admins:
app.get('/admin/:name', function(req, res) {
    res.sendFile('index.html', { root: __dirname+'/public' });
});
app.get('/admin/assessments/:id', function(req, res) {
    res.sendFile('index.html', { root: __dirname+'/public' });
});
app.get('/admin/students/:id', function(req, res) {
    res.sendFile('index.html', { root: __dirname+'/public' });
});
app.get('/admin/assessmentSchedules/:id', function(req, res) {
    res.sendFile('index.html', { root: __dirname+'/public' });
});
//Student paths:
app.get('/student/:name', function(req, res) {
    res.sendFile('index.html', { root: __dirname+'/public' });
});
app.get('/student/assessmentSchedules/:_id', function(req, res) {
    res.sendFile('index.html', { root: __dirname+'/public' });
});
app.get('/student/assessmentSchedules/:_id/sitAssessment', function(req, res) {
    res.sendFile('index.html', { root: __dirname+'/public' });
});


/************************************************
 *                                              *
 *            Access                            *
 *                                              *
 ***********************************************/
app.get("/resources/users/:username", dataAccessServices.getUserByUserName);

app.get("/resources/admins", dataAccessServices.getAllAdmins);
app.get("/resources/admins/:username", dataAccessServices.getAdminByUsername);

app.get("/resources/students", dataAccessServices.getAllStudents);
app.get("/resources/students/:username", validate(paramsValidation.user), dataAccessServices.getStudentByUserName);

app.get("/resources/assessments", dataAccessServices.getAllAssessments);
app.get("/resources/assessments/:assessmentId", validate(paramsValidation.assessment), dataAccessServices.getAssessmentById);
app.get("/resources/assessments/:assessmentId/versions", dataAccessServices.getAssessmentVersions);
app.get("/resources/assessments/:assessmentId/versions/:versionId", validate(paramsValidation.assessmentAndVersion), dataAccessServices.getAssessmentVersionById);

app.get("/resources/assessments/:assessmentId/versions/:versionId/questions", validate(paramsValidation.assessmentAndVersion), dataAccessServices.getQuestionsByAssessmentIdAndVersionId);
app.get("/resources/assessments/:assessmentId/versions/:versionId/questions/:questionId", validate(paramsValidation.assessmentAndVersionAndQuestion), dataAccessServices.getQuestionByAssessmentIdAndVersionIdAndQuestionId);

app.get("/resources/schedules", dataAccessServices.getScheduledAssessments);
app.get("/resources/schedules/:scheduledAssessmentId", dataAccessServices.getScheduledAssessmentsById);
app.get("/resources/schedules/students/:username", validate(paramsValidation.user), dataAccessServices.getScheduledAssessmentsByStudentUsername);

app.get("/auth/isLoggedIn", dataAccessServices.isLoggedIn);

/************************************************
 *                                              *
 *            Upload/Update/Auth                *
 *                                              *
 ***********************************************/


app.post("/resources/students", validate(bodyValidation.user), dataUploadServices.insertStudent);
app.put("/resources/students/:studentUsername", validate(bodyValidation.editUser), dataUploadServices.editStudent);

app.post("/resources/admins", validate(bodyValidation.user), dataUploadServices.insertAdmin);
app.put("/resources/admins/:adminUsername", validate(bodyValidation.editUser), dataUploadServices.editAdmin);

app.post("/resources/assessments", validate(bodyValidation.assessment), dataUploadServices.insertAssessment);
app.put("/resources/assessments/:assessmentId", validate(bodyValidation.assessment), dataUploadServices.editAssessment);

app.post("/resources/assessments/:assessmentId/versions", validate(bodyValidation.version), dataUploadServices.insertVersionIntoAssessment);
app.put("/resources/assessments/:assessmentId/versions/:versionId", validate(bodyValidation.version), dataUploadServices.editVersionInAssessment);

app.post("/resources/assessments/:assessmentId/versions/:versionId/questions",validate(bodyValidation.QA), dataUploadServices.insertQuestionIntoVersionOfAssessment);
app.put("/resources/assessments/:assessmentId/versions/:versionId/questions/:questionNo",validate(bodyValidation.QA), dataUploadServices.editQuestionInVersionOfAssessment);

app.post("/resources/schedules", validate(bodyValidation.assessmentSchedule), dataUploadServices.insertAssessmentScheduleDate);
app.post("/resources/schedules/:scheduleId/students", validate(bodyValidation.assessmentScheduleStudent), dataUploadServices.insertStudentsIntoAssessmentSchedule);
app.put("/resources/schedules/:scheduleId/dates", validate(bodyValidation.assessmentScheduleDates), dataUploadServices.editDatesOnAssessmentSchedule);
app.put("/resources/schedules/:scheduleId", validate(bodyValidation.assessmentSchedule), dataUploadServices.editAssessmentSchedule);


//Attempts to allow a Student to start and end a given assessment (sessions):
app.post("/resources/schedules/:scheduleId/start/:studentUsername", validate(bodyValidation.startScheduledAssessment), dataUploadServices.attemptAssessmentStart);
app.post("/resources/schedules/:scheduleId/end/:studentUsername", validate(bodyValidation.endScheduledAssessment), dataUploadServices.attemptAssessmentEnd);

app.post('/auth/login', dataUploadServices.authenticateUser);

app.get('/auth/logout', dataAccessServices.logout);

/************************************************
 *                                              *
 *            Delete                            *
 *                                              *
 ***********************************************/
app.delete("/resources/admins/:username", validate(paramsValidation.user), dataDeleteServices.deleteAdmin);
app.delete("/resources/students/:username", validate(paramsValidation.user), dataDeleteServices.deleteStudent);
app.delete("/resources/assessments/:assessmentId", validate(paramsValidation.assessment), dataDeleteServices.deleteAssessmentById);
app.delete("/resources/assessments/:assessmentId/versions", validate(paramsValidation.assessment), dataDeleteServices.deleteVersionsInAssessment);
app.delete("/resources/assessments/:assessmentId/versions/:versionId", validate(paramsValidation.assessmentAndVersion), dataDeleteServices.deleteVersionInAssessmentById);
app.delete("/resources/assessments/:assessmentId/versions/:versionId/questions", validate(paramsValidation.assessmentAndVersion), dataDeleteServices.deleteQuestionsInAssessmentVersion);
app.delete("/resources/assessments/:assessmentId/versions/:versionId/questions/:questionId", validate(paramsValidation.assessmentAndVersionAndQuestion), dataDeleteServices.deleteQuestionInAssessmentVersion);

app.delete("/resources/schedules/:scheduleId", validate(paramsValidation.schedule), dataDeleteServices.deleteScheduleByScheduleId);
app.delete("/resources/schedules/:scheduleId/students/:username", validate(paramsValidation.scheduleAndStudent), dataDeleteServices.deleteStudentFromScheduleByScheduleIdAndUsername);

//Error handle:
app.use(function(err, req, res, next) {
    var error = (err.stack === 'undefined') ? err.stack : err;
    console.error(error);

    res.status(500).send({error: error});
});


http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});