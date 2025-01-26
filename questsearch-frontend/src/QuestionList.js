import React from 'react';

const QuestionList = ({ results = [], currentPage, totalPages, handleNextPage, handlePreviousPage }) => {
    return (
        <div>
            <ul className="space-y-4">
                {results.length > 0 ? (
                    results.map((question) => (
                        <li key={question.id} className="bg-gray-50 p-4 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold">
                                {question.title} <span className="text-sm text-gray-500">({question.type})</span>
                            </h3>

                            {question.type === 'ANAGRAM' && question.blocks && (
                                <div className="mt-2">
                                    <h4 className="font-medium">Blocks:</h4>
                                    <ul className="list-disc ml-6">
                                        {question.blocks.map((block, index) => (
                                            <li key={index}>{block.text}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {question.type === 'MCQ' && question.options && (
                                <div className="mt-2">
                                    <h4 className="font-medium">Options:</h4>
                                    <ul className="list-disc ml-6">
                                        {question.options.map((option, index) => (
                                            <li
                                                key={index}
                                                className={
                                                    option.isCorrectAnswer
                                                        ? 'text-green-600 font-bold'
                                                        : ''
                                                }
                                            >
                                                {option.text} {option.isCorrectAnswer ? '(Correct)' : ''}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {question.solution && (
                                <p className="mt-2 text-gray-700">
                                    <span className="font-medium">Solution:</span> {question.solution}
                                </p>
                            )}
                        </li>
                    ))
                ) : (
                    <li className="bg-gray-50 p-4 rounded-lg shadow-md">
                        <p>No questions found.</p>
                    </li>
                )}
            </ul>
            <div className="flex justify-between mt-4">
                <button onClick={handlePreviousPage} disabled={currentPage === 1} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                    Previous
                </button>
                <span> Page {currentPage} of {totalPages} </span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
                    Next
                </button>
            </div>
        </div>
    );
};

export default QuestionList;