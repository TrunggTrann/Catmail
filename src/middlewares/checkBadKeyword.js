const stringSimilarity = require('string-similarity');
const BadKeyword = require('../models/BadKeyword')
const getBadKeyword = async () => {
    const data = await BadKeyword.find({});
    const badKeywords = data.map((badKeyword) => {
        return badKeyword.keyword
    })
    return badKeywords
}


const checkBadKeyword = async (req, res, next) => {
    const words = req.body.message
    const badKeywords = await getBadKeyword()
    if(badKeywords.length > 0) {

        const matches = stringSimilarity.findBestMatch(words, badKeywords);
        const bestMatch = matches.bestMatch;
        if (bestMatch.rating > 0.5) {
            return res.status(400).json('Không thể gửi email do chứa bad keyword'); // nội dung email chứa bad keyword
        }
        next(); // nội dung email không chứa bad keyword
    }
    next()
}
module.exports = { checkBadKeyword }
