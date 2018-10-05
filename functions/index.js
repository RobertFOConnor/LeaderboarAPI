const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')({origin: true});

const gameTitle = 'superkeyboy';

const firebaseApp = firebase.initializeApp(
    functions.config().firebase
);

function getScores() {
    const ref = firebaseApp.database().ref(gameTitle);
    return ref.once('value').then(snap => snap.val());
}

function addScore(index, name, score) {
    firebase.database().ref(gameTitle + '/scores/' + index).set({
        name: name,
        score: score,
    });
}

function clearScores() {
    for (let i = 0; i < 10; i++) {
        firebase.database().ref(gameTitle + '/scores/' + i).set({
            name: "null",
            score: 0,
        });
    }
}

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

// GET

app.get('/scores', (request, response) => {
    cors(request, response, () => {
        return getScores().then(scores => {
            response.setHeader('Access-Control-Allow-Headers', '*');
            response.setHeader('Access-Control-Allow-Origin', '*');
            return response.send(scores);
        });
    });
});

app.get('/clear-scores', (request, response) => {
    return clearScores();
});

// POST

app.post('/scores', (request, response) => {
    response.set('Access-Control-Allow-Origin', '*');
    const name = request.body.name;
    const score = request.body.score;
    const position = request.body.position;

    response.send(name + " " + score);
    cors(request, response, () => {
        return addScore(position, name, score);
    });
});

exports.app = functions.https.onRequest(app);
