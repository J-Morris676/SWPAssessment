/**
 * Unit tests for the API - server must be running.
 *  --> Tests interaction response status' with the API, NOT the functionality.
 *
 *  Note:
 *      To observe the result of a suite of tests, comment out 'after' clearance functions to see the results in the db.
 * Created by Jamie Morris on 06/02/15.
 */
var assert = require("assert");
var supertest = require('supertest');
var api = supertest('http://localhost:3002');
var md5 = require('md5');

//TODO: When all tests are done & you are satisfied - tighten them up with expect()'s - put response bodies in.
//TODO: Student tests for delete and inserts.
//TODO: Admin tests for all.

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var sampleAdmin = {
    "username": "admin1",
    "password": "admin1",
    "firstName": "Bobby",
    "lastName": "Wall"
};
var sampleStudent = {
    "_id": new ObjectId("54f34ee4d416319c38d58784"),
    "username": "Bobby1",
    "firstName": "Bobby",
    "password": "123321",
    "lastName": "Bob"
};
var sampleAssessment = {
    "title":"Assessment 1",
    "_id": new ObjectId("54f34ee4d416319c38d58793"),
    "versions":[
        {
            "_id": new ObjectId("54f34ee4d416319c38d58792"),
            "QAs":[
                {
                    "_id": new ObjectId("54f34ee4d416319c38d58791"),
                    "type":"multi",
                    "question":"What is the capital of England?",
                    "answers":[
                        "Cardiff",
                        "Edinburgh",
                        "London",
                        "Dublin",
                        "Belfast"
                    ],
                    "answer":2
                },
                {
                    "_id": new ObjectId("54f34ee4d416319c38d58790"),
                    "type":"call",
                    "question": "Which is right?",
                    "additionalInfo": {
                        "details": [
                            {
                                "date": new Date("2015-06-13T10:01:03.301Z"),
                                "log": "Caller requests details of duty chemist as requires medication"
                            },
                            {
                                "date": new Date("2015-06-13T10:05:00.001Z"),
                                "log": "Checked NHS website - details obtained and passed to caller"
                            },
                            {
                                "date": new Date("2015-06-14T10:06:00.001Z"),
                                "log": "Incident for closure"
                            }
                        ],
                        "background": {
                            "uniqueID": 8130,
                            "dateReceived": new Date("2011-06-13T10:00:00.001Z"),
                            "response": "Resolved/referred",
                            "openCodeCategory": "Administration",
                            "dateRecorder": new Date("2015-06-13T10:01:00.001Z"),
                            "contactMethod": "Non emergency call",
                            "callerStatus": "Third Party",
                            "callerName": "Joanne Gleeson",
                            "callerAddress": "121 Snowhill, Sandford, SA7 4RT",
                            "callerTelephone": "06302 445554",
                            "incidentLocation": "121 Snowhill, Sandford, SA7 4RT"
                        }
                    },
                    "answers": [
                        "Something",
                        "SomethingElse",
                        "SomethingElseAgain"
                    ],
                    "answer":2
                }
            ]
        }
    ]
};
var sampleAssessmentAnswers = [
    {
        "type" : "multi",
        "question" : "What is the capital of England?",
        "answer" : 2
    },
    {
        "type" : "call",
        question: "lala",
        "answer" : 2
    }
];

//Signs in as a student and returns the cookie to emulate a browser session:
function signInAsStudent(student, cb) {
    api.post("/auth/login")
        .send(student)
        .expect(200, function(err, res) {
            if (err) throw err;
            cb(res.headers["set-cookie"][0].split(";")[0]);
        })
}

function logOut(studentCookie, cb) {
    api.get("/auth/logout")
        .set("Cookie", studentCookie)
        .expect(200, function(err, res) {
            if (err) throw err;
            cb();
        })
}

describe('studentOperationsOnAdmins', function() {
    var studentCookie;

    before("Add a student before testing", function(done){
        MongoClient.connect("mongodb://localhost:27017/SWPAssessment", function(err, db) {
            if(!err) {
                db.collection("students").insert({
                    _id: sampleStudent._id,
                    username: sampleStudent.username,
                    password: md5(sampleStudent.password),
                    firstName: sampleStudent.firstName,
                    lastName: sampleStudent.lastName
                }, function() {
                    db.close();
                    signInAsStudent(sampleStudent, function(cookie) {
                        studentCookie = cookie;
                        done();
                    });
                });
            }
        });
    });

    describe('#getAllAdmins()', function(){
        it('Should fail to get all admins (unauthorised)', function(done){
            api.get('/resources/admins')
                .set("Cookie", studentCookie)
                .expect(401, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });


    describe('#postAdmin()', function() {
        it('Should fail to post an admin (unauthorised)', function(done){
            api.post('/resources/admins')
                .set("Cookie", studentCookie)
                .send(sampleAdmin)
                .expect(401, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    after("Remove the student after testing", function(done){
        MongoClient.connect("mongodb://localhost:27017/SWPAssessment", function(err, db) {
            if(!err) {
                logOut(studentCookie, function() {
                    db.collection("students").remove({
                        username: sampleStudent.username
                    }, function() {
                        db.close();
                        done();
                    });
                });
            }
        });
    });
});

describe('studentOperationsOnStudents', function() {
    var studentCookie;

    before("Add a student before testing", function(done){
        MongoClient.connect("mongodb://localhost:27017/SWPAssessment", function(err, db) {
            if(!err) {
                db.collection("students").insert({
                    _id: sampleStudent._id,
                    username: sampleStudent.username,
                    password: md5(sampleStudent.password),
                    firstName: sampleStudent.firstName,
                    lastName: sampleStudent.lastName
                }, function() {
                    db.close();
                    signInAsStudent(sampleStudent, function(cookie) {
                        studentCookie = cookie;
                        done();
                    });
                });
            }
        });
    });

    describe('#getAllStudents()', function(){
        it('Should fail to retrieve all students (unauthorised)', function(done){
                api.get('/resources/students')
                    .set("Cookie", studentCookie)
                    .expect(401, function(err, res) {
                        if (err) throw err;
                        done();
                    });
            })
    });

    describe('#getOwnStudent()', function(){
        it('Should successfully retrieve students own details', function(done){
            api.get('/resources/students/' + sampleStudent.username)
                .set("Cookie", studentCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#getOtherStudent()', function(){
        it('Should fail to retrieve other student (unauthorised)', function(done){
            api.get('/resources/students/' + 'bill1')
                .set("Cookie", studentCookie)
                .expect(401, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });


    describe('#postStudent()', function() {
        it('Should fail to get post a student (unauthorised)', function(done){
            api.post('/resources/students')
                .send(sampleStudent)
                .set("Cookie", studentCookie)
                .expect(401, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    after("Remove the student after testing", function(done){
        MongoClient.connect("mongodb://localhost:27017/SWPAssessment", function(err, db) {
            if(!err) {
                logOut(studentCookie, function() {
                    db.collection("students").remove({
                        username: sampleStudent.username
                    }, function() {
                        db.close();
                        done();
                    });
                });
            }
        });
    });
});

describe('studentOperationsOnAssessments', function() {
    var studentCookie;

    before("Add a student & assessment before testing", function(done){
        MongoClient.connect("mongodb://localhost:27017/SWPAssessment", function(err, db) {
            if(!err) {
                db.collection("students").insert({
                    _id: sampleStudent._id,
                    username: sampleStudent.username,
                    password: md5(sampleStudent.password),
                    firstName: sampleStudent.firstName,
                    lastName: sampleStudent.lastName
                }, function() {
                    db.collection("assessments").insert(sampleAssessment);
                    db.close();
                    signInAsStudent(sampleStudent, function(cookie) {
                        studentCookie = cookie;
                        done();
                    });
                });
            }
        });
    });

    describe('#getAllAssessments()', function(){
        it('Should fail to get all assessments (unauthorised)', function(done){
            api.get('/resources/assessments')
                .set("Cookie", studentCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#getAssessmentById()', function(){
        it('Should fail to get an assessment (unauthorised)', function(done){
            api.get('/resources/assessments/' + sampleAssessment._id)
                .set("Cookie", studentCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#getAssessmentVersions()', function(){
        it('Should fail to get assessment versions (unauthorised)', function(done){
            api.get('/resources/assessments/' + sampleAssessment._id + "/versions")
                .set("Cookie", studentCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#getAssessmentVersion()', function(){
        it('Should fail to get assessment version (unauthorised)', function(done){
            api.get('/resources/assessments/' + sampleAssessment._id + "/versions/" + sampleAssessment.versions[0]._id )
                .set("Cookie", studentCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#getAssessmentVersionQuestions()', function(){
        it('Should fail to get assessment version questions (unauthorised)', function(done){
            api.get('/resources/assessments/' + sampleAssessment._id + "/versions/" + sampleAssessment.versions[0]._id + "/questions")
                .set("Cookie", studentCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });
    describe('#getAssessmentVersionQuestion()', function(){
        it('Should fail to get assessment version question (unauthorised)', function(done){
            api.get('/resources/assessments/' + sampleAssessment._id + "/versions/" + sampleAssessment.versions[0]._id + "/questions/" + sampleAssessment.versions[0].QAs[0]._id )
                .set("Cookie", studentCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });


    describe('#postAssessment()', function() {
        it('Should fail to post an assessment (unauthorised)', function(done){
            api.post('/resources/assessments')
                .send(sampleAssessment)
                .set("Cookie", studentCookie)
                .expect(401, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#editAssessment()', function() {
        it('Should fail to edit an assessment (unauthorised)', function(done){
            api.put('/resources/assessments/' + sampleAssessment._id)
                .send(sampleAssessment)
                .set("Cookie", studentCookie)
                .expect(401, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#postVersionIntoAssessment()', function() {
        it('Should fail to post an assessment version into an assessment (unauthorised)', function(done){
            api.post('/resources/assessments/' + sampleAssessment._id + "/versions")
                .send(sampleAssessment.versions[0])
                .set("Cookie", studentCookie)
                .expect(401, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#editAssessmentVersion()', function() {
        it('Should fail to edit version in assessment (unauthorised)', function(done){
            api.put('/resources/assessments/' + sampleAssessment._id + "/versions/" + sampleAssessment.versions[0]._id)
                .send(sampleAssessment.versions[0])
                .set("Cookie", studentCookie)
                .expect(401, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#postQuestionIntoAssessmentVersion()', function() {
        it('Should fail to post a question into an assessment version (unauthorised)', function(done){
            api.post('/resources/assessments/' + sampleAssessment._id + "/versions/" + sampleAssessment.versions[0]._id + "/questions")
                .send(sampleAssessment.versions[0].QAs[0])
                .set("Cookie", studentCookie)
                .expect(401, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#editQuestionInAssessmentVersion()', function() {
        it('Should fail to edit a question in an assessment version (unauthorised)', function(done){
            api.put('/resources/assessments/' + sampleAssessment._id + "/versions/" + sampleAssessment.versions[0]._id + "/questions/" +
                    sampleAssessment.versions[0].QAs[0]._id)
                .send(sampleAssessment.versions[0].QAs[0])
                .set("Cookie", studentCookie)
                .expect(401, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    after("Remove the student & assessment after testing", function(done){
        MongoClient.connect("mongodb://localhost:27017/SWPAssessment", function(err, db) {
            if(!err) {
                logOut(studentCookie, function() {
                    db.collection("students").remove({
                        username: sampleStudent.username
                    }, function() {
                        db.collection("assessments").remove({
                            _id: sampleAssessment._id
                        }, function() {
                            db.close();
                            done();
                        });
                    });
                });
            }
        });
    });
});

describe('studentOperationsOnAssessmentSchedules', function() {
    var studentCookie;

    var sampleAssessmentSchedule = {
        "_id": new ObjectId("54f34ee4d416319c38d58783"),
        startDate: new Date(new Date().getTime() + 2000),
        endDate: new Date(new Date().getTime() + 30 * 60000),
        assessment: sampleAssessment._id,
        version: sampleAssessment.versions[0]._id,
        students: [{"username": sampleStudent.username}],
        admin: sampleAdmin.username
    };

    before("Add a student, assessment & assessment schedule before testing", function(done){
        MongoClient.connect("mongodb://localhost:27017/SWPAssessment", function(err, db) {
            if(!err) {
                db.collection("students").insert({
                    _id: sampleStudent._id,
                    username: sampleStudent.username,
                    password: md5(sampleStudent.password),
                    firstName: sampleStudent.firstName,
                    lastName: sampleStudent.lastName
                });
                db.collection("assessmentSchedule").insert(sampleAssessmentSchedule, function() {
                    db.collection("assessments").insert(sampleAssessment, function() {
                        db.close();
                        signInAsStudent(sampleStudent, function(cookie) {
                            studentCookie = cookie;
                            done();
                        });
                    });
                });

            }
        });
    });

    describe('#getAllAssessmentSchedules()', function(){
        it('Should fail to get all assessment schedules (unauthorised)', function(done){
            api.get('/resources/schedules')
                .set("Cookie", studentCookie)
                .expect(401, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#getOwnAssessmentSchedule()', function(){
        it('Should successfully get own schedule for assessments', function(done){
            api.get('/resources/schedules/students/' + sampleStudent.username)
                .set("Cookie", studentCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#getOthersAssessmentSchedule()', function(){
        it('Should fail to get a scheduled assessment (unauthorised)', function(done){
            api.get('/resources/schedules/students/bill1')
                .set("Cookie", studentCookie)
                .expect(401, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#postAssessmentSchedule()', function() {
        it('Should fail to post an assessment schedule (unauthorised)', function(done){
            api.post('/resources/schedules')
                .send(sampleAssessmentSchedule)
                .set("Cookie", studentCookie)
                .expect(401, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#postStudentIntoAssessmentSchedule()', function() {
        it('Should fail to post a student into an assessment schedule (unauthorised)', function(done){
            api.post('/resources/schedules/' + sampleAssessmentSchedule._id + "/students")
                .send(sampleAssessmentSchedule.students[0])
                .set("Cookie", studentCookie)
                .expect(401, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#editDatesInAssessmentSchedule()', function() {
        it('Should fail to edit dates in an assessment schedule (unauthorised)', function(done){
            api.put('/resources/schedules/' + sampleAssessmentSchedule._id + "/dates")
                .send({startDate: sampleAssessmentSchedule.startDate, endDate: sampleAssessmentSchedule.endDate})
                .set("Cookie", studentCookie)
                .expect(401, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#startAssessmentDuringTime()', function(){
        this.timeout(4000);
        it('Should successfully start the assessment', function(done){
            setTimeout(function(){
                api.post('/resources/schedules/' + sampleAssessmentSchedule._id + "/start/" + sampleStudent.username)
                    .set("Cookie", studentCookie)
                    .expect(201, function(err, res){
                        if (err) throw err;
                        done();
                    });
            }, 2000);
        });
    });

    describe('#finishAssessmentDuringTime()', function() {
        it('Should finish by submitting answers submit answers', function(done){
            api.post('/resources/schedules/' + sampleAssessmentSchedule._id + "/end/" + sampleStudent.username)
                .send(sampleAssessmentAnswers)
                .set("Cookie", studentCookie)
                .expect(201, function(err, res){
                    if (err) throw err;
                    done();
                });
        });
    });

    after("Remove the student, assessment & assessment schedule after testing", function(done){
        MongoClient.connect("mongodb://localhost:27017/SWPAssessment", function(err, db) {
            if(!err) {
                logOut(studentCookie, function() {
                    db.collection("students").remove({
                        username: sampleStudent.username
                    }, function() {
                        db.collection("assessmentSchedule").remove({
                            _id: sampleAssessmentSchedule._id
                        }, function() {
                            db.collection("assessments").remove({
                                _id: sampleAssessment._id
                            }, function() {
                                db.close();
                                done();
                            });
                        });
                    });
                });
            }
        });
    });
});