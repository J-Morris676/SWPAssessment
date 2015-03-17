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
    "_id": new ObjectId("54f34ee4d416319c38d58709"),
    "username": "admin1",
    "password": "admin1",
    "firstName": "Bobby",
    "lastName": "Wall"
};
var sampleAdminToPost = {
    "_id": new ObjectId("54f34ee4d416319c38d58708"),
    "username": "admin2",
    "password": "admin2",
    "firstName": "Billy",
    "lastName": "Wall"
};
var sampleStudent = {
    "_id": new ObjectId("54f34ee4d416319c38d58784"),
    "username": "Bobby1",
    "firstName": "Bobby",
    "password": "123321",
    "lastName": "Bob"
};
var sampleStudentToPost = {
    "_id": new ObjectId("54f34ee4d416319c38d58714"),
    "username": "Bobby2",
    "firstName": "Bobby",
    "password": "123321",
    "lastName": "Bob"
};
var sampleAssessment = {
    "title":"Assessment 1",
    "_id": new ObjectId("54f34ee4d416319c38d58799"),
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
var sampleAssessmentSchedule = {
    "_id": new ObjectId("54f34ee4d416319c38d58783"),
    startDate: new Date(new Date().getTime() + 4000),
    endDate: new Date(new Date().getTime() + 30 * 60000),
    assessment: sampleAssessment._id,
    version: sampleAssessment.versions[0]._id,
    students: [{"username": sampleStudent.username}],
    admin: sampleAdmin.username
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
function signInAsAdmin(admin, cb) {
    api.post("/auth/login")
        .send({
            "username": admin.username,
            "password": admin.password
        })
        .expect(200, function(err, res) {
            if (err) throw err;
            cb(res.headers["set-cookie"][0].split(";")[0]);
        })
}

function logOut(adminCookie, cb) {
    api.get("/auth/logout")
        .set("Cookie", adminCookie)
        .expect(200, function(err, res) {
            if (err) throw err;
            cb();
        })
}

describe('adminOperationsOnAdmins', function() {
    var adminCookie;

    before("Add an admin before testing", function(done){
        MongoClient.connect("mongodb://localhost:27017/SWPAssessment", function(err, db) {
            if(!err) {
                db.collection("admins").insert({
                    _id: sampleAdmin._id,
                    username: sampleAdmin.username,
                    password: md5(sampleAdmin.password),
                    firstName: sampleAdmin.firstName,
                    lastName: sampleAdmin.lastName
                }, function() {
                    signInAsAdmin(sampleAdmin, function(cookie) {
                        adminCookie = cookie;
                        done();
                    });
                });
            }
        });
    });

    describe('#getAllAdmins()', function(){
        it('Should successfully get all admins', function(done){
            api.get('/resources/admins')
                .set("Cookie", adminCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });


    describe('#postAdmin()', function() {
        it('Should successfully post an admin', function(done){
            api.post('/resources/admins')
                .set("Cookie", adminCookie)
                .send(sampleAdminToPost)
                .expect(201, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    after("Remove the admins after testing", function(done){
        MongoClient.connect("mongodb://localhost:27017/SWPAssessment", function(err, db) {
            if(!err) {
                logOut(adminCookie, function() {
                    db.collection("admins").remove({
                        username: sampleAdmin.username
                    }, function() {
                        db.collection("admins").remove({
                            username: sampleAdminToPost.username
                        }, function() {
                            done();
                        });
                    });
                })
            }
        });
    });
});

describe('adminOperationsOnStudents', function() {
    var adminCookie;

    before("Add an admin & student before testing", function(done){
        MongoClient.connect("mongodb://localhost:27017/SWPAssessment", function(err, db) {
            if(!err) {
                db.collection("admins").insert({
                    _id: sampleAdmin._id,
                    username: sampleAdmin.username,
                    password: md5(sampleAdmin.password),
                    firstName: sampleAdmin.firstName,
                    lastName: sampleAdmin.lastName
                }, function() {
                    db.close();
                    signInAsAdmin(sampleAdmin, function(cookie) {
                        adminCookie = cookie;
                        done();
                    });
                });
            }
        });
    });

    describe('#postStudent()', function() {
        it('Should successfully post a student', function(done){
            api.post('/resources/students')
                .send(sampleStudent)
                .set("Cookie", adminCookie)
                .expect(201, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#getAllStudents()', function(){
        it('Should successfully retrieve all students', function(done){
            api.get('/resources/students')
                .set("Cookie", adminCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        })
    });

    describe('#getStudent()', function(){
        it('Should successfully retrieve student', function(done){
            api.get('/resources/students/' + sampleStudent.username)
                .set("Cookie", adminCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    after("Remove the admin & student after testing", function(done){
        MongoClient.connect("mongodb://localhost:27017/SWPAssessment", function(err, db) {
            if(!err) {
                logOut(adminCookie, function() {
                    db.collection("students").remove({
                        username: sampleStudent.username
                    }, function() {
                        db.collection("admins").remove({
                            username: sampleAdmin.username
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

describe('adminOperationsOnAssessments', function() {
    var adminCookie;

    before("Add an admin and assessment before testing", function(done){
        MongoClient.connect("mongodb://localhost:27017/SWPAssessment", function(err, db) {
            if(!err) {
                db.collection("admins").insert({
                    _id: sampleAdmin._id,
                    username: sampleAdmin.username,
                    password: md5(sampleAdmin.password),
                    firstName: sampleAdmin.firstName,
                    lastName: sampleAdmin.lastName
                }, function() {
                    db.close();
                    signInAsAdmin(sampleAdmin, function(cookie) {
                        adminCookie = cookie;
                        done();
                    });
                });
            }
        });
    });

    describe('#postAssessment()', function() {
        it('Should successfully post an assessment', function(done){
            api.post('/resources/assessments')
                .send(sampleAssessment)
                .set("Cookie", adminCookie)
                .expect(201, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#getAllAssessments()', function(){
        it('Should successfully get all assessments)', function(done){
            api.get('/resources/assessments')
                .set("Cookie", adminCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#getAssessmentById()', function(){
        it('Should successfully get an assessment', function(done){
            api.get('/resources/assessments/' + sampleAssessment._id)
                .set("Cookie", adminCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#getAssessmentVersions()', function(){
        it('Should successfully get assessment versions', function(done){
            api.get('/resources/assessments/' + sampleAssessment._id + "/versions")
                .set("Cookie", adminCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#getAssessmentVersion()', function(){
        it('Should successfully get assessment version', function(done){
            api.get('/resources/assessments/' + sampleAssessment._id + "/versions/" + sampleAssessment.versions[0]._id )
                .set("Cookie", adminCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#getAssessmentVersionQuestions()', function(){
        it('Should successfully get assessment version questions', function(done){
            api.get('/resources/assessments/' + sampleAssessment._id + "/versions/" + sampleAssessment.versions[0]._id + "/questions")
                .set("Cookie", adminCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });
    describe('#getAssessmentVersionQuestion()', function(){
        it('Should successfully get assessment version question', function(done){
            api.get('/resources/assessments/' + sampleAssessment._id + "/versions/" + sampleAssessment.versions[0]._id + "/questions/" + sampleAssessment.versions[0].QAs[0]._id )
                .set("Cookie", adminCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#editAssessment()', function() {
        it('Should successfully edit an assessment', function(done){
            api.put('/resources/assessments/' + sampleAssessment._id)
                .send(sampleAssessment)
                .set("Cookie", adminCookie)
                .expect(201, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#postVersionIntoAssessment()', function() {
        it('Should successfully post an assessment version into an assessment', function(done){
            api.post('/resources/assessments/' + sampleAssessment._id + "/versions")
                .send(sampleAssessment.versions[0])
                .set("Cookie", adminCookie)
                .expect(201, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#editAssessmentVersion()', function() {
        it('Should successfully edit version in assessment', function(done){
            api.put('/resources/assessments/' + sampleAssessment._id + "/versions/" + sampleAssessment.versions[0]._id)
                .send(sampleAssessment.versions[0])
                .set("Cookie", adminCookie)
                .expect(201, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#postQuestionIntoAssessmentVersion()', function() {
        it('Should successfully post a question into an assessment version', function(done){
            api.post('/resources/assessments/' + sampleAssessment._id + "/versions/" + sampleAssessment.versions[0]._id + "/questions")
                .send(sampleAssessment.versions[0].QAs[0])
                .set("Cookie", adminCookie)
                .expect(201, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#editQuestionInAssessmentVersion()', function() {
        it('Should successfully edit a question in an assessment version', function(done){
            api.put('/resources/assessments/' + sampleAssessment._id + "/versions/" + sampleAssessment.versions[0]._id + "/questions/0")
                .send(sampleAssessment.versions[0].QAs[0])
                .set("Cookie", adminCookie)
                .expect(201, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    after("Remove the admin & assessment after testing", function(done){
        MongoClient.connect("mongodb://localhost:27017/SWPAssessment", function(err, db) {
            if(!err) {
                logOut(adminCookie, function() {
                    db.collection("admins").remove({
                        username: sampleAdmin.username
                    }, function() {
                        db.collection("assessments").remove({
                            _id: sampleAssessment._id
                        }, function() {
                            db.close();
                            done();
                        });
                    });
                })
            }
        });
    });
});

describe('adminOperationsOnAssessmentSchedules', function() {
    var adminCookie;

    before("Add an admin, student & assessment before testing", function(done){
        MongoClient.connect("mongodb://localhost:27017/SWPAssessment", function(err, db) {
            if(!err) {
                db.collection("admins").insert({
                    _id: sampleAdmin._id,
                    username: sampleAdmin.username,
                    password: md5(sampleAdmin.password),
                    firstName: sampleAdmin.firstName,
                    lastName: sampleAdmin.lastName
                }, function() {
                    db.collection("students").insert({
                        _id: sampleStudent._id,
                        username: sampleStudent.username,
                        password: md5(sampleStudent.password),
                        firstName: sampleStudent.firstName,
                        lastName: sampleStudent.lastName
                    }, function() {
                        db.collection("assessments").insert(sampleAssessment, function() {
                            db.close();
                            signInAsAdmin(sampleAdmin, function(cookie) {
                                adminCookie = cookie;
                                done();
                            });
                        });
                    });
                });
            }
        });
    });

    describe('#postAssessmentSchedule()', function() {
        it('Should successfully post an assessment schedule', function(done){
            api.post('/resources/schedules')
                .send(sampleAssessmentSchedule)
                .set("Cookie", adminCookie)
                .expect(201, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#getAllAssessmentSchedules()', function(){
        it('Should successfully get all assessment schedules', function(done){
            api.get('/resources/schedules')
                .set("Cookie", adminCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#getStudentsAssessmentSchedule()', function(){
        it('Should successfully get get the students scheduled assessments', function(done){
            api.get('/resources/schedules/students/' + sampleStudent._id)
                .set("Cookie", adminCookie)
                .expect(200, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#postStudentIntoAssessmentSchedule()', function() {
        it('Should successfully post a student into an assessment schedule', function(done){
            api.post('/resources/schedules/' + sampleAssessmentSchedule._id + "/students")
                .send({username: sampleAdminToPost.username})
                .set("Cookie", adminCookie)
                .expect(201, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#postStudentIntoAssessmentSchedule()', function() {
        it('Should successfully post a student into an assessment schedule', function(done){
            api.post('/resources/schedules/' + sampleAssessmentSchedule._id + "/students")
                .send(sampleAssessmentSchedule.students[0])
                .set("Cookie", adminCookie)
                .expect(202, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#editDatesInAssessmentSchedule()', function() {
        it('Should successfully edit dates in an assessment schedule', function(done){
            api.put('/resources/schedules/' + sampleAssessmentSchedule._id + "/dates")
                .send({startDate: sampleAssessmentSchedule.startDate, endDate: sampleAssessmentSchedule.endDate})
                .set("Cookie", adminCookie)
                .expect(201, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#startAssessmentBeforeTime()', function(){
        it('Should fail to start the student on the assessment (unauthorised)', function(done){
            api.post("/resources/schedules/" + sampleAssessmentSchedule._id + "/start/" + sampleAdmin.username)
                .set("Cookie", adminCookie)
                .expect(401, function(err, res) {
                    if (err) throw err;
                    done();
                });
        });
    });

    describe('#startAssessmentDuringTime()', function(){
        this.timeout(6000);
        it('Should fail to start the assessment (unauthorised)', function(done){
            setTimeout(function(){
                api.post('/resources/schedules/' + sampleAssessmentSchedule._id + "/start/" + sampleAdmin.username)
                    .set("Cookie", adminCookie)
                    .expect(401, function(err, res){
                        if (err) throw err;
                        done();
                    });
            }, 4000);
        });
    });

    describe('#finishAssessmentDuringTime()', function() {
        it('Should fail to end assessment (unauthorised)', function(done){
            api.post('/resources/schedules/' + sampleAssessmentSchedule._id + "/end/" + sampleAdmin.username)
                .send(sampleAssessmentAnswers)
                .set("Cookie", adminCookie)
                .expect(401, function(err, res){
                    if (err) throw err;
                    done();
                });
        });
    });

    after("Remove the student, admin, assessment schedule & assessment after testing", function(done){
        MongoClient.connect("mongodb://localhost:27017/SWPAssessment", function(err, db) {
            if(!err) {
                logOut(adminCookie, function() {
                    db.collection("students").remove({
                        username: sampleStudent.username
                    }, function() {
                        db.collection("admins").remove({
                            username: sampleAdmin.username
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
                    })
                });
            }
        });
    });
});