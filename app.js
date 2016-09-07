var builder = require('botbuilder');
var restify = require('restify');

//==============================================================================
// Bot Setup
//==============================================================================

// Create chat bot
// var connector = new builder.ChatConnector({
//     appId: process.env.MICROSOFT_APP_ID,
//     appPassword: process.env.MICROSOFT_APP_PASSWORD
// });
// var bot = new builder.UniversalBot(connector);

var bot = new builder.BotConnectorBot({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// USED FOR CONSOLE CONNECTOR
// var connector = new builder.ConsoleConnector().listen();
// var bot = new builder.UniversalBot(connector);

//==============================================================================
// Bots Dialogs
//==============================================================================

var intents = new builder.IntentDialog();
bot.dialog('/', intents);

intents.matches(/^change name/i, [
    function (session) {
        session.beginDialog('/profile');
    },
    function (session, results) {
        session.send('Ok... Changed your name to %s', session.userData.name);
    }
]);

intents.onDefault([
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);

//===========================================================================================
// SERVER SETUP
// Credit: http://fisheyefocus.com/fisheyeview/wp-content/uploads/2016/07/ms..bot_.demo_..js
//===========================================================================================

// Setup restify server
var server = restify.createServer();

// Query parser
server.use(restify.queryParser());

// Main landing page
server.post('/', function create (req, res, next) {
    res.send(201, "Hello, welcome to fbot.");
    return next();
});

// Bot endpoint
server.post('/api/messages', bot.listen());

// Get Bot endpoint to start listening for Dialog requests
server.listen(process.env.PORT || 3000, function () {
    console.log('%s listening to %s', server.name, server.url);
});