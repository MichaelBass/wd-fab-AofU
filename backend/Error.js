const mongoose = require('mongoose');


const errorSchema = new mongoose.Schema({
oid: String,
demo:{age:String,drive:Number,gender:Number,other:String,public_transportaton:Number,race:Number,walking:Number,wc:Number},
FormOID:String, 
ID:String,
message:String
});
const Errors = mongoose.model('error', errorSchema );

module.exports = { Errors };
