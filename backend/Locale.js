const mongoose = require('mongoose');


const localeSchema = new mongoose.Schema({
locale: String,
Items:[{key:String,value:String}]
});
const Locale = mongoose.model('locale', localeSchema );

module.exports = { Locale };
