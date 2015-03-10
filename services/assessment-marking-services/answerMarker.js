/**
 * Functions that mark pre-defined question types
 * Created by Jamie Morris on 16/02/15.
 */

exports.multiChoiceMark = function(question, answer) {
    var markObject = {
        "score": 0,
        "possible": 1,
        "actual": question.answer
    };

    if (question.answer == answer.answer)
        markObject.score = 1;
    else markObject.score = 0;
    return markObject;
};

//Call is an advanced multi-choice with call log information:
exports.callLogMark = function(question, answer) {
    var markObject = {
        "score": 0,
        "possible": 1,
        "actual": question.answer
    };

    if (question.answer == answer.answer)
        markObject.score = 1;
    else markObject.score = 0;
    return markObject;
};

exports.freeTextMark = function(question, answer) {
    var markObject = {
        "score": 0,
        "possible": question.answer.length,
        "actual": question.answer
    };

    for (var possibleFreeTextTerm = 0; possibleFreeTextTerm < question.answer.length; possibleFreeTextTerm++) {
        var pattern = "^.*" + question.answer[possibleFreeTextTerm] + ".*$"

        var QARegex = new RegExp(pattern, "i");
        if (QARegex.test(answer.answer)) {
            markObject.score++;
        }

    }

    return markObject;
};

