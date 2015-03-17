/**
 * Created by Jamie Morris on 02/03/15.
 *  - Functions to determine the access rights of a given user
 */
exports.student = {};
exports.admin = {};

exports.checkAuthenticated = function(user) {
    if (user != null)
        return true;
    else
        return false;
};

//Admins:
exports.admin.checkAuthenticated = function(user) {
    if (exports.checkAuthenticated(user)) {
        if (user.admin == null) {
            return false;
        }
        else {
            return true;
        }
    }
    else {
        return false;
    }
};

exports.admin.checkAuthenticatedByUserName = function(user, username) {
    if (exports.admin.checkAuthenticated(user)) {
        if (user.admin.username == username) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
};

//Students:
exports.student.checkAuthenticated = function(user) {
    if (exports.checkAuthenticated(user)) {
        if (user.student == null) {
            return false;
        }
        else {
            return true;
        }
    }
    else {
        return false;
    }
};

exports.student.checkAuthenticatedByUserName = function(user, username) {
    if (exports.student.checkAuthenticated(user)) {
        if (user.student.username == username) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
};
