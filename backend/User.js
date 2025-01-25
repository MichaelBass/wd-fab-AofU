const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
oid: String,
study_code:String, 
password:String,
sponsor_code:String,
message:String,
forms:[{FormOID:String,ID:String,Name:String,Domain:String,Items:[{ID:String,Name:String,Index:String,Prompt:String,Slope:String,Operator:String,Maps:[{ItemResponseOID:String,Value:String,ResponseOption:String,Position:String,Category:String,Calibration:String}]}]}],
assessments:[{ID:Number,Domain:String,Active:Boolean,Started:Date,Finished:Date}],
responses:[{oid:String,ID:String,Prompt:String,ItemResponseOID:String,Value:String}],
results:[{oid:String,ItemID:String,score:Number,error:Number,fit:Number}],
demo:{age:String,drive:Number,gender:Number,other:String,public_transportaton:Number,race:Number,walking:Number,wc:Number},
params:[{key:String,value:String}]
});
const User = mongoose.model('user', userSchema );

module.exports = { User };
