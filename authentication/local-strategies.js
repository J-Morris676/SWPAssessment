/**
 * Created by Jamie Morris on 01/03/15.
 *  - Definition of a strategy for use with Passport.js
 */
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;

var log4js = require("log4js");
var log4js_extend = require("log4js-extend");

log4js_extend(log4js, {
    path: __dirname,
    format: " (at @name (@file:@line:@column))"
});
var logger = log4js.getLogger();
var dataAccessRepository = require('../repositories/data-access-repository.js');
var md5 = require('md5');

passport.use('local', new LocalStrategy(
    function(username, password, done) {
        logger.info("Signing in user: " + username);

        //Try Student first:
        dataAccessRepository.findStudentByUsername(username, {}, function(err, student) {
            if (err) return done(err);

            //If no student, try admin:
            if (!student) {
                dataAccessRepository.findAdminByUsername(username, {}, function(err, admin) {
                    if (err) return done(err);

                    if (!admin) {
                        return done(null, false, {
                            message: "User '" + username + "' is not registered."
                        });
                    }
                    if (!authenticate(admin, password)) {
                        return done(null, false, {
                            message: 'Incorrect password.'
                        });
                    }
                    admin = {username: admin.username, id: admin._id};
                    return done(null, {admin: admin});
                });
            }
            else if (!authenticate(student, password)) {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
            else if (student) {
                student = {username: student.username, id: student._id};
                return done(null, {student: student});
            }
        });
    }

));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    if (user.admin) {
        dataAccessRepository.findAdminByUsername(user.admin.username, {}, function(err, user) {
            done(err, {admin: user});
        });
    }
    else if (user.student) {
        dataAccessRepository.findStudentByUsername(user.student.username, {}, function(err, user) {
            done(err, {student: user});
        });
    }


});

var authenticate = function(user, password) {
    if (md5(password)== user.password) return true;
    else return false;
};

exports.passport = passport;