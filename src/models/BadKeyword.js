const mongoose = require('mongoose')

const BadKeywordSchema = mongoose.Schema(
    {
        keyword: { type: String, required: true },
    },
    {
    timestamps: true,
        timestamps: true,
        timestamps: true,
    }
)
const BadKeyword = mongoose.model('BadKeyword', BadKeywordSchema)
module.exports = BadKeyword
