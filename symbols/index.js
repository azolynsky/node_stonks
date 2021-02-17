const fs = require('fs')

module.exports = {getSymbols: async function getSymbols() {
    let text = '';

    return new Promise((resolve, reject) => {
        fs.readFile('./symbols/symbols.csv', 'utf8', (err, data) => {
            if (err) {
                console.error(err)
                return
            }
            
            text = data;
            var allTextLines = text.split(/\r\n|\n/);
            var allSymbols = allTextLines.map(l => l.split(",")[0]);

            fs.readFile('./symbols/englishWords.txt', 'utf8', (err, data) => {
                if (err) {
                    console.error(err)
                    return
                }
                
                text = data;
                var allWords = text.split(/\r\n|\n/);
                allWords = allWords.map(w => w.toUpperCase())
                resolve(allSymbols.filter(s => !allWords.includes(s)))
            })
        })
    })
}
}