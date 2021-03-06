const Sentiment = require("sentiment");
const nlp = require("compromise");

(str => {
  const sentiment = new Sentiment();
  console.log(sentiment.analyze(str), "String");

  let docForNlp = nlp(str)
    .sentences()
    .terms()
    .out("tags");

  let adverbCount = 0;
  let negCount = 0;

  for (let i = 0; i < docForNlp.length; i++) {
    const tags = docForNlp[i].tags;
    tags.forEach(element => {
      if (element === "Adverb") {
        adverbCount++;
      } else if (element === "Negative") {
        negCount++;
      }
    });
  }

  // 2
  const w = sentiment.analyze(str);
  const positiveWords = w.positive.length;
  const negativeWords = w.negative.length;

  console.log("negative words ", negativeWords);
  console.log("positive words", positiveWords);
  console.log("negative count", negCount);
  console.log("adverb count", adverbCount);

  let severity = "Low";
  if (w.score < -1) {
    severity = "High";
  } else if (w.score < 1) {
    if (adverbCount > 1) severity = "High";
    else severity = "Medium";
  }

  //
  console.log(severity);
  //   return severity;
})("I am dying. Help me.");

// var Analyzer = require("natural").SentimentAnalyzer;
// var stemmer = require("natural").PorterStemmer;
// var analyzer = new Analyzer("English", stemmer, "afinn");
// // getSentiment expects an array of strings
// console.log(
//   analyzer.getSentiment([
//     "I",
//     "feeling",
//     "dizzy",
//     "i",
//     "am",
//     "not",
//     "feeling",
//     "well"
//   ])
// );
// if (w.score < 0) {
//   if (adverbCount >= 2) severity = "High";
//   else if (adverbCount > 0) severity = "Medium";
// }
// for severity
// if (negativeWords > positiveWords) {
//   console.log("negWords > posWords");
//   if (negCount > 2 && adverbCount > negCount) {
//     severity = "High";
//   } else if (adverbCount < negCount) {
//     severity = "Medium";
//   }
// } else if (positiveWords > negativeWords) {
//   console.log("posWords > negWords");
//   if (adverbCount > negCount) severity = "Low";
//   else {
//     severity = "Medium";
//   }
// } else {
//   console.log("posWords === negWords");

//   if (negCount > adverbCount) {
//     severity = "Medium";
//   } else if (adverbCount > negCount) {
//     severity = "High";
//   } else {
//     severity = "Low";
//   }
// }
