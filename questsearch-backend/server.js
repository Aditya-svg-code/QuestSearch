const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors'); // Import the cors package

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// Load proto file
const packageDefinition = protoLoader.loadSync('proto/questions.proto', {});
const proto = grpc.loadPackageDefinition(packageDefinition);

// Log the loaded proto to check if the service is defined
console.log(proto);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/questsearch', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define Question schema
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

// Implement search function for gRPC
const searchQuestions = async (call, callback) => {
    const query = call.request.query;
    try {
        const questions = await Question.find({ title: new RegExp(query, 'i') });

        const responseQuestions = questions.map(q => {
            return {
                id: q._id,
                title: q.title,
                type: q.type,
                anagramType: q.anagramType,
                blocks: q.blocks,
                options: q.options,
                solution: q.solution
            };
        });

        callback(null, { questions: responseQuestions });
    } catch (err) {
        console.error('Error fetching questions from MongoDB:', err);
        callback({
            code: grpc.status.INTERNAL,
            details: 'Error fetching questions from MongoDB'
        });
    }
};

app.get('/search', async (req, res) => {
    const query = req.query.query;
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    console.log('Received search query:', query); // Log the query

    // Create a gRPC client with increased max message size
    const client = new proto.QuestionService('localhost:50051', grpc.credentials.createInsecure(), {
        'grpc.max_receive_message_length': 10 * 1024 * 1024 // Set max message size to 10 MB
    });

    // Call the SearchQuestions method
    client.SearchQuestions({ query }, (error, response) => {
        if (error) {
            console.error('Error calling gRPC service:', error);
            return res.status(500).json({ error: 'Error calling gRPC service', details: error });
        }

        // Log the number of questions found
        console.log('Number of questions found:', response.questions.length);

        // Paginate the results
        const totalQuestions = response.questions.length; // Total number of questions
        const paginatedQuestions = response.questions.slice(skip, skip + limit); // Get the questions for the current page

        res.json({
            page,
            limit,
            totalQuestions,
            totalPages: Math.ceil(totalQuestions / limit),
            questions: paginatedQuestions
        });
    });
});

// Start gRPC server with increased max message size
const server = new grpc.Server({
    'grpc.max_receive_message_length': 10 * 1024 * 1024 // Set max message size to 10 MB
});
server.addService(proto.QuestionService.service, { SearchQuestions: searchQuestions });
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('gRPC server running on port 50051');
});

// Start Express server
app.listen(3000, () => {
    console.log('Express server running on port 3000');
});