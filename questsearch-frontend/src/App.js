import React, { useState, useEffect } from 'react';
import { searchQuestions } from './services/QuestionServiceClient';
import QuestionList from './QuestionList'; // Import the QuestionList component
import './App.css';

const App = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedTypes, setSelectedTypes] = useState([]); // State for selected question types

  const questionTypes = ['MCQ', 'READ_ALONG', 'CONTENT_ONLY', 'ANAGRAM'];

  const handleTypeChange = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await searchQuestions(query, currentPage); // Pass currentPage to the search function
      const filteredResults = response.questions.filter(question =>
        selectedTypes.length === 0 || selectedTypes.includes(question.type)
      );
      setResults(filteredResults);
      setTotalPages(response.totalPages);
      setCurrentPage(1); // Reset to the first page after a new search
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setTotalPages(0);
    setCurrentPage(1);
    setSelectedTypes([]); // Clear selected types
  };

  const handleNextPage = async () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      await fetchQuestions(currentPage + 1); // Fetch next page questions
    }
  };

  const handlePreviousPage = async () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      await fetchQuestions(currentPage - 1); // Fetch previous page questions
    }
  };

  const fetchQuestions = async (page) => {
    setLoading(true);
    try {
      const response = await searchQuestions(query, page); // Fetch questions for the specified page
      const filteredResults = response.questions.filter(question =>
        selectedTypes.length === 0 || selectedTypes.includes(question.type)
      );
      setResults(filteredResults);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      fetchQuestions(currentPage); // Fetch questions when the page or query changes
    }
  }, [currentPage, query, selectedTypes]); // Add selectedTypes to the dependency array

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">Search Questions</h1>
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for questions..."
            className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Search
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Clear
          </button>
        </div>

        <h2 className="text-lg font-semibold mb-2">Filter by Question Type:</h2>
        <div className="flex flex-wrap gap-4 mb-6">
          {questionTypes.map(type => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => handleTypeChange(type)}
                className="mr-2"
              />
              {type}
            </label>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        ) : (
          <QuestionList
            results={results}
            currentPage={currentPage}
            totalPages={totalPages}
            handleNextPage={handleNextPage}
            handlePreviousPage={handlePreviousPage}
          />
        )}
      </div>
    </div>
  );
};

export default App;