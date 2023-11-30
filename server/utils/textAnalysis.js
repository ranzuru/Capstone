import natural from 'natural';
import stopword from 'stopword';
import _ from 'lodash';

const tokenizer = new natural.WordTokenizer();

const getBigrams = (words) => {
  let bigrams = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(words[i] + ' ' + words[i + 1]);
  }
  return bigrams;
};

export const analyzeTextForCommonWords = (texts) => {
  let allBigrams = [];

  texts.forEach((text) => {
    let words = tokenizer.tokenize(text).map((word) => word.toLowerCase());

    if (Array.isArray(stopword.en)) {
      words = words.filter((word) => !stopword.en.includes(word));
    }

    let bigrams = getBigrams(words);
    allBigrams.push(...bigrams);
  });

  // Count frequencies of bigrams
  const bigramFrequencies = _.countBy(allBigrams);
  const sortedBigrams = Object.entries(bigramFrequencies).sort(
    (a, b) => b[1] - a[1]
  );

  return {
    bigramAnalysis: sortedBigrams.slice(0, 5), // Top 5 bigrams
  };
};
