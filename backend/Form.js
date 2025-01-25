const mongoose = require('mongoose');


const formSchema = new mongoose.Schema({
FormOID: String,
ID:String, 
Name:String,
Domain:String,
Items:[{ID:String,Name:String,Index:String,Prompt:String,Slope:String,Operator:String,Maps:[{ItemResponseOID:String,Value:String,ResponseOption:String,Position:String,Category:String,Calibration:String}]}]
});
const Form = mongoose.model('form', formSchema );

module.exports = { Form };
