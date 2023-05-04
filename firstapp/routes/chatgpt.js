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
        // console.log(res.locals.response.response);
        res.locals.response = res.locals.response.response.trim();
        if (!resp_generated) { 
            res.locals.response = "";
        }
        res.render('chatgpt');
    });



/* Records the prompt and response */
router.post('/chatgpt',
    isLoggedIn,
    async (req, res, next) => {

        const prompt = req.body.prompt;
        // Make the openai completion prompt to ada (for now, will change later)
        const completion = await openai.createCompletion({
            model: 'text-ada-001',
            prompt: prompt,
            max_tokens: 150,
            temperature: 0.9,
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

module.exports = router;