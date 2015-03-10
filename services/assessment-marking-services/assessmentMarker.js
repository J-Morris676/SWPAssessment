/**
 * Marks a given assessment using the exported function
 *  - Uses answerMarker.js to mark individual questions in an assessment.
 * Created by Jamie Morris on 16/02/15.
 */

var clone = require('clone');

var answerMarker = require("./answerMarker.js");

function AnswersException(message) {
    this.message = message;
    this.name = "answersException";
}

function constructGrade(result, grade, answer) {
    grade.score += result.score;
    grade.possible += result.possible;
    answer.result = clone( result );
    grade.markedAnswers.push(answer);

    return grade;
}

exports.markAssessment = function(assessment, answers) {
    var questions = assessment.QAs;

    if (questions.length != answers.length)
        throw new AnswersException("Answer and question amount don't equal");

    var grade = {
        score: 0,
        possible: 0,
        markedAnswers: [],
        date: new Date()
    };

    for (var QAIndex = 0; QAIndex < questions.length; QAIndex ++) {
        switch (questions[QAIndex].type) {
            case "multi":
                var result = answerMarker.multiChoiceMark(questions[QAIndex], answers[QAIndex]);
                grade = constructGrade(result, grade, answers[QAIndex]);
                break;
            case "call":
                var result = answerMarker.callLogMark(questions[QAIndex], answers[QAIndex]);
                grade = constructGrade(result, grade, answers[QAIndex]);
                break;
            case "free":
                var result = answerMarker.freeTextMark(questions[QAIndex], answers[QAIndex]);
                grade = constructGrade(result, grade, answers[QAIndex]);
                break;
        }
    }

    grade.percent = (grade.score/grade.possible)*100;
    return grade;
};