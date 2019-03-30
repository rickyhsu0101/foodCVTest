const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const FoodPostingSchema = new Schema({
  image: {
    type: String,
    required: true
  },
  time: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  locationLat: {
    type: Number,
    required: true
  },
  locationLong: {
    type: Number,
    required: true
  },
  donor: {
    type: String,
    required: true
  },
  acceptor: {
    type: String,
    required: true
  }
});
mongoose.model('foodpostings', FoodPostingSchema);