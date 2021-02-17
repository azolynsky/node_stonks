const fetch = require('node-fetch');
const getSymbols = require('./symbols').getSymbols;
const _ = require('lodash');

async function main() {
  console.log("working")
  var symbols = await getSymbols()
  console.log(symbols.length)

  const WEEKS_BACK = 20;
  const SUBREDDIT = "robinhoodpennystocks";

  var weekWeights = [];
  for (var i = 0; i <= WEEKS_BACK; i++){
    const weekComments = await getComments(SUBREDDIT, (i*7+7)+"d", (i*7)+"d");
    const weekSymbolWeights = _.sortBy(symbols.map(s => { return { name: s, score: _.sumBy(weekComments.filter(c => {
      var regex = new RegExp("[$ \n\r]("+s+")[\. \!\?\,]", "g");
      return regex.test(c.body);
    }), "score") } }).filter(sw => sw.score > 0), "score");

    weekWeights = [...weekWeights, weekSymbolWeights];

    console.log(`${i} week(s) ago: `)
    prettyPrintWeights(weekSymbolWeights);
  }

  console.log(JSON.stringify(weekWeights));
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

    fetch('http://api.pushshift.io/reddit/submission/search?subreddit=robinhoodpennystocks&sort_type=score&sort=desc&size=500')
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

async function getComments(subreddit, start, end, searchTerm) {
  return new Promise((resolve, reject) => {
    let suffix = ""
    suffix += start ? `&after=${start}` : "";
    suffix += end ? `&before=${end}` : "";
    suffix += searchTerm ? `&q=${searchTerm}` : "";

    try{
      fetch(`http://api.pushshift.io/reddit/comment/search?subreddit=${subreddit}&sort_type=score&sort=desc&size=500${suffix}`)
        .then(response => response.json())
        .then(data => {resolve(data.data)})
    }
    catch(err){
      console.log(err)
      reject(err)
    }
  })
}