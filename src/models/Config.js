const mongoose = require('mongoose')

const ConfigSchema = mongoose.Schema({
    maxRecipients: {
      type: Number,
      default: 10,
    },
    maxAttachmentSize: {
      type: Number,
      default: 10 * 1024 * 1024, // 10MB
    },
    maxAttachments: {
      type: Number,
      default: 5,
    },
    maxEmailSize: {
      type: Number,
      default: 20 * 1024 * 1024, // 20MB
    },
});

const Config = mongoose.model('Config', ConfigSchema)
module.exports = Config
