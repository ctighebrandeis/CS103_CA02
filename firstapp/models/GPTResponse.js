
'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var GPTResponse = Schema( {
    prompt: String,
    response: String,
    time_made: Date,
    userId: {type:ObjectId, ref:'user' }
} );

module.exports = mongoose.model( 'Chris_GPTResponse', GPTResponse );