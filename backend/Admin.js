const mongoose = require('mongoose');


const adminSchema = new mongoose.Schema({
oid: String,
username:String, 
password:String,
sponsor_code:String,
message:String,
email:String,
sms:String
});
const Admin = mongoose.model('admin', adminSchema );

module.exports = { Admin };
