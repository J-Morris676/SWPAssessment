/*
 *  MongoDB database configurations for all different environments
 *  Created by Jamie Morris on 06/02/15.
 */

var config = {};

//local
config.uri = "mongodb://localhost";
config.dbName = "SWPAssessment";

config.port = 27017;

module.exports = config;