const mongoose = require('mongoose');
const fs = require('fs');
const { ObjectId } = require('mongoose').Types;

mongoose.connect('mongodb://localhost:27017/questsearch', { useNewUrlParser: true, useUnifiedTopology: true });

const questionSchema = new mongoose.Schema({
    title: String,
    type: String,
    anagramType: { type: String, default: null },
    blocks: [{
        text: String,
        showInOption: Boolean,
        isAnswer: Boolean
    }],
    options: [{
        text: String,
        isCorrectAnswer: Boolean
    }],
    solution: { type: String, default: null },
});
const Question = mongoose.model('Question', questionSchema);

fs.readFile('data/questions.json', 'utf8', async (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    const questions = JSON.parse(data).map(question => {
        if (question._id) {
            question._id = new ObjectId(question._id.$oid);
        }
        return question;
    });

    try {
        await Question.insertMany(questions);
        console.log('Data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
    } finally {
        mongoose.connection.close();
    }
});