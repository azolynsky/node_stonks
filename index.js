const fetch = require('node-fetch');
const getSymbols = require('./symbols').getSymbols;
const _ = require('lodash');

const EXCLUDED_SYMBOLS = ["VERY", "EDIT", "GO", "ON", "IT", "HI", "GO", "SO", "EVER", "CAN", "AN", "HE", "LOW", "AT", "DD"]

async function main() {
  console.log("working")

  var symbols = await getSymbols()

  symbols=symbols.filter(s => s.length > 1);
  symbols=symbols.filter(s => !EXCLUDED_SYMBOLS.includes(s))

  console.log(symbols.length)

  var weekWeights = [];
  for (var i = 1; i <= 5; i++){
    const weekComments = await getComments((i*7+7)+"d", (i*7)+"d");

    const weekSymbolWeights = _.sortBy(symbols.map(s => { return { name: s, score: _.sumBy(weekComments.filter(c => c.body.includes(s)), "score") } }).filter(sw => sw.score > 0), "score");

    weekWeights = [...weekWeights, weekSymbolWeights];

    console.log(`${i} week(s) ago: `)
    prettyPrintWeights(weekSymbolWeights);
  }
}

main();

function prettyPrintWeights(weights){
  const SCALE = .2;

  for (var i = 0; i < weights.length; i++){
    const weight = weights[i];
    var weightDisplay = "";
    var namePrefixSpaces = "";

    for (var j = weight.name.length; j <= 6; j++){
      namePrefixSpaces += " ";
    }

    for(var j = 1; j <= (weight.score * SCALE); j++){
      weightDisplay += "|"
    }
    
    console.log(`${namePrefixSpaces}${weight.name} : ${weightDisplay}`);
  }
}

async function getPosts() {
  return new Promise((resolve, reject) => {
    let returnData = null;

    fetch('http://api.pushshift.io/reddit/submission/search?subreddit=robinhoodpennystocks&sort_type=score&sort=desc&size=100')
      .then(response => response.json())
      .then(data => { 
        returnData = data.data;
        if (returnData)
          resolve(returnData); 
        else
          console.log(data)
      })
  })
}

async function getComments(start, end, searchTerm) {
  return new Promise((resolve, reject) => {
    let suffix = ""
    suffix += start ? `&after=${start}` : "";
    suffix += end ? `&before=${end}` : "";
    suffix += searchTerm ? `&q=${searchTerm}` : "";

    try{
      fetch("http://api.pushshift.io/reddit/comment/search?subreddit=robinhoodpennystocks&sort_type=score&sort=desc&size=100" + suffix)
        .then(response => response.json())
        .then(data => {resolve(data.data)})
    }
    catch(err){
      console.log(err)
      reject(err)
    }
  })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}