/*
todo.js -- Router for the ToDoList
*/
const express = require('express');
const router = express.Router();
const User = require('../models/User')
const {Configuration, OpenAIApi} = require('openai');
const GPTResponse = require('../models/GPTResponse')
// Read the API key from the environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

let resp_generated = false;

isLoggedIn = (req,res,next) => {
        if (res.locals.loggedIn) {
            next()  
        } else {
            res.redirect('/login')
        }
    }

// Create an instance of the API client
const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// get the value associated to the key
router.get('/chatgpt/',
    isLoggedIn,
    async (req, res, next) => {
        // Find the most recent response from the current user and store it in res.locals.response
        res.locals.response = await GPTResponse.findOne({userId: req.user._id}).sort({time_made: -1});
        console.log(res.locals.response);
        
        // If there is no response, set res.locals.response to an empty string
        if (res.locals.response == null) {
            res.locals.response = "";
        } else {
            res.locals.response = res.locals.response.response.trim();
        }
        if (!resp_generated) { 
            res.locals.response = "";
        }
        res.render('chatgpt');
    });



/* Records the prompt and response */
router.post('/chatgpt',
    isLoggedIn,
    async (req, res, next) => {

        let prompt = req.body.question;

        // Extend the prompt to ask about the proof
        prompt = "Please explain the following mathematical proof or theorem in plain English:\n" + prompt + "\n\nGive a brief example of how this proof or theorem is used:\n";

        // Make the openai completion prompt to curie
        const completion = await openai.createCompletion({
            model: 'text-curie-001',
            prompt: prompt,
            max_tokens: 1500,
            temperature: 0.8,
        });

        const response = completion.data.choices[0].text;
        resp_generated = true;
        // console.log(response);
        // console.log("Made response")
        // Make the GPTResponse item
        const gptResponse = new GPTResponse(
            {prompt: prompt,
            response: response,
            userId: req.user._id,
            time_made: new Date()})
        
        await gptResponse.save();
        res.locals.response = response;
        res.redirect('/chatgpt')
    });

router.get('/chatgpt/history',
    isLoggedIn,
    async (req, res, next) => {
        // Find all responses from the current user and store it in res.locals.responses
        res.locals.responses = await GPTResponse.find({userId: req.user._id}).sort({time_made: -1});
        res.render('chatgpt_history');
    });

router.get('/chatgpt/delete/:id',
    isLoggedIn,
    async (req, res, next) => {
        // Find the response with the given id and delete it
        await GPTResponse.deleteOne({_id: req.params.id});
        res.redirect('/chatgpt/history');
    });

module.exports = router;