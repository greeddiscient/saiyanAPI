const mongoose = require('mongoose');

const { Schema } = mongoose;

const RoundSchema = new Schema({
  User: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  }
});

const Round = mongoose.model('rounds', RoundSchema);

module.exports = Round;
