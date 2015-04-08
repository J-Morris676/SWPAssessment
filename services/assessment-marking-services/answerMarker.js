/**
 * Functions that mark pre-defined question types
 * Created by Jamie Morris on 16/02/15.
 */
var natural = require('natural');

exports.multiChoiceMark = function(question, answer) {
    var markObject = {
        "score": 0,
        "possible": 1,
        "actual": question.answers[question.answer]
    };

    if (markObject.actual == answer.answer)
        markObject.score = 1;
    else markObject.score = 0;

    return markObject;
};

//Call is an advanced multi-choice with call log information:
exports.callLogMark = function(question, answer) {
    var markObject = {
        "score": 0,
        "possible": 1,
        "actual": question.answers[question.answer]
    };

    if (markObject.actual == answer.answer)
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
    if (answer.answer != null) {
        var givenAnswer = answer.answer.replace(/(\r\n|\n|\r)/gm," ");

        for (var possibleFreeTextTerm = 0; possibleFreeTextTerm < question.answer.length; possibleFreeTextTerm++) {
            var pattern = "^.*" + question.answer[possibleFreeTextTerm].replace(/ /g,".*") + ".*$"

            var QARegex = new RegExp(pattern, "i");
            //First attempt a standard regex for an exact match:
            if (QARegex.test(givenAnswer)) {
                markObject.score++;
            }
            //Then do a more complex search matching based on the Jaro Winkler distance algorithm:
            else {
                var actualAnswerWordLength = question.answer[possibleFreeTextTerm].split(" ").length;
                var givenAnswerWordSplit = givenAnswer.split(" ");

                //Linearly check each sequence of given answers words the same length of the actual answer:
                for (var wordIndex = 0; wordIndex < givenAnswerWordSplit.length-(actualAnswerWordLength-1); wordIndex++) {
                    var givenAnswerTermArray = givenAnswerWordSplit.slice(wordIndex, wordIndex+actualAnswerWordLength);
                    var actualAnswerTermArray = question.answer[possibleFreeTextTerm].split(" ");

                    var smallestSimilarityWord = 0;

                    for (var actualAnswerWordIndex = 0; actualAnswerWordIndex < actualAnswerTermArray.length; actualAnswerWordIndex++) {
                        var similarity = natural.JaroWinklerDistance(actualAnswerTermArray[actualAnswerWordIndex].toLowerCase(), givenAnswerTermArray[actualAnswerWordIndex].toLowerCase());

                        if (similarity < 0.9) {
                            smallestSimilarityWord = 0;
                            break;
                        }
                        else if (similarity > smallestSimilarityWord) {
                            smallestSimilarityWord = similarity;
                        }
                    }

                    //If ALL words in the term are > 0.9 similar then mark correct:
                    if (smallestSimilarityWord > 0.9) {
                        markObject.score++;
                        break;
                    }
                }
            }

        }
    }

    return markObject;
};

