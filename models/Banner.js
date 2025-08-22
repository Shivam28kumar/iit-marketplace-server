// server/models/Banner.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BannerSchema = new Schema({
imageUrl: {
type: String,
required: true,
},
linkUrl: {
type: String,
required: true,
},
isActive: {
type: Boolean,
default: true,
}
}, { timestamps: true });
module.exports = mongoose.model('Banner', BannerSchema);