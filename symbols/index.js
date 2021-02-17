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
            const record_num = 11;  // or however many elements there are in each row
            var allTextLines = text.split(/\r\n|\n/);
            resolve(allTextLines.map(l => l.split(",")[0]));
        })
    })
}
}