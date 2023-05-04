const express = require('express');
const router = express.Router();

isLoggedIn = (req,res,next) => {
    if (res.locals.loggedIn) {
        next()  
    } else {
        res.redirect('/login')
    }
}

router.get('/index',
    isLoggedIn,
    async (req, res, next) => {
        res.render('ca02_index');
    });

router.get('/ca02_about',
    isLoggedIn,
    async (req, res, next) => {
        res.render('ca02_about');
    });

router.get('/chris',
    isLoggedIn,
    async (req, res, next) => {
        res.render('chris');
    });
    

module.exports = router;