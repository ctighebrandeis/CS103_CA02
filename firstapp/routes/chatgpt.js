/*
todo.js -- Router for the ToDoList
*/
const express = require('express');
const router = express.Router();
const User = require('../models/User')
const {Configuration, OpenAIApi} = require('openai');


isLoggedIn = (req,res,next) => {
        if (res.locals.loggedIn) {
            next()  
        } else {
            res.redirect('/login')
        }
    }


// get the value associated to the key
router.get('/chatgpt/',
    isLoggedIn,
    async (req, res, next) => {
        const show = req.query.show
        const completed = show=='completed'
        res.render('chatgpt');
    });



/* Records the prompt and response */
router.post('/chatgpt',
    isLoggedIn,
    async (req, res, next) => {

        const prompt = req.body.prompt;
        // Make the openai completion prompt to ada (for now, will change later)
        const completion = await openai.complete({
            model: 'text-ada-001',
            prompt: prompt,
            maxTokens: 450,
            temperature: 0.9,
        });

        const response = completion.data.choices[0].text;
        console.log(response);

        // Make the GPTResponse item
        const gptResponse = new GPTResponse(
            {prompt: prompt,
            response: response,
            userId: req.user._id,
            time_made: new Date()})
        
        await gptResponse.save();
        res.redirect('/chatgpt/response')
    });

module.exports = router;