import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiCheckCircle, FiXCircle, FiClock, FiAward } from 'react-icons/fi';
import { documentService, vivaService } from '../services';
import { toast } from 'react-toastify';

function VivaQuestionsNew() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [vivaHistory, setVivaHistory] = useState([]);

  const [generateForm, setGenerateForm] = useState({
    topic: '',
    documentId: '',
    count: 5,
    includeMCQ: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [docsData, historyData] = await Promise.all([
        documentService.getAll({ type: 'syllabus,notes', status: 'completed' }),
        vivaService.getResults({ limit: 10 })
      ]);

      setDocuments(docsData.documents || []);
      setVivaHistory(historyData.results || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!generateForm.topic) {
      toast.error('Topic is required');
      return;
    }

    try {
      setGenerating(true);
      
      const response = await vivaService.generate(generateForm);

      setCurrentSession({
        sessionId: response.sessionId,
        questions: response.questions
      });
      setAnswers({});
      setShowResults(false);
      toast.success('Questions generated successfully!');
    } catch (error) {
      toast.error('Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!currentSession) return;

    const answerArray = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer
    }));

    if (answerArray.length === 0) {
      toast.error('Please answer at least one question');
      return;
    }

    try {
      const response = await vivaService.submit({
        sessionId: currentSession.sessionId,
        answers: answerArray
      });

      setResults(response);
      setShowResults(true);
      toast.success('Answers submitted successfully!');
      
      // Reload history
      await loadData();
    } catch (error) {
      toast.error('Failed to submit answers');
    }
  };

  const handleNewTest = () => {
    setCurrentSession(null);
    setAnswers({});
    setResults(null);
    setShowResults(false);
    setGenerateForm({
      topic: '',
      documentId: '',
      count: 5,
      includeMCQ: true
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Viva & MCQ Practice</h1>
          <p className="text-gray-500 mt-1">Test your knowledge with AI-generated questions</p>
        </div>
        {currentSession && !showResults && (
          <button
            onClick={handleNewTest}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            <FiRefreshCw />
            <span>New Test</span>
          </button>
        )}
      </div>

      {!currentSession && !showResults && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Generate Questions</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Topic Field - FIRST FIELD */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic *
              </label>
              <input
                type="text"
                value={generateForm.topic}
                onChange={(e) => setGenerateForm({ ...generateForm, topic: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ 
                  display: 'block',
                  width: '100%',
                  minHeight: '42px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db'
                }}
                placeholder="e.g., Operating Systems, Data Structures"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Document (Optional)
              </label>
              <select
                value={generateForm.documentId}
                onChange={(e) => setGenerateForm({ ...generateForm, documentId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None</option>
                {documents.map(doc => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={generateForm.count}
                  onChange={(e) => setGenerateForm({ ...generateForm, count: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 mt-8">
                  <input
                    type="checkbox"
                    checked={generateForm.includeMCQ}
                    onChange={(e) => setGenerateForm({ ...generateForm, includeMCQ: e.target.checked })}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Include MCQs</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {generating ? 'Generating...' : 'Generate Questions'}
            </button>
          </form>
        </div>
      )}

      {currentSession && !showResults && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Topic:</strong> {generateForm.topic} • 
              <strong className="ml-2">Questions:</strong> {currentSession.questions.length}
            </p>
          </div>

          {currentSession.questions.map((q, index) => (
            <div key={q.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{q.question}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      q.type === 'mcq' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {q.type === 'mcq' ? 'MCQ' : 'Viva'}
                    </span>
                  </div>

                  {q.type === 'mcq' ? (
                    <div className="space-y-2">
                      {q.options.map((option, optIndex) => (
                        <label
                          key={optIndex}
                          className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            answers[q.id] === option.charAt(0)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={option.charAt(0)}
                            checked={answers[q.id] === option.charAt(0)}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="mr-3"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      placeholder="Type your answer here..."
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-lg"
          >
            Submit Answers
          </button>
        </div>
      )}

      {showResults && results && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 text-white text-center shadow-lg">
            <FiAward className="text-6xl mx-auto mb-4" />
            <h2 className="text-3xl font-bold">Test Completed!</h2>
            {results.score !== null && (
              <div className="mt-4">
                <p className="text-5xl font-bold">{results.score}%</p>
                <p className="text-green-100 mt-2">
                  {results.correctAnswers} out of {results.totalMCQs} MCQs correct
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Detailed Results</h3>
            {results.results.map((result, index) => (
              <div key={result.questionId} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start space-x-3">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    result.type === 'mcq' && result.isCorrect
                      ? 'bg-green-100 text-green-700'
                      : result.type === 'mcq' && !result.isCorrect
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{result.question}</h4>
                    
                    {result.type === 'mcq' && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Your Answer:</span>
                          <span className={`font-semibold ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {result.userAnswer}
                          </span>
                          {result.isCorrect ? (
                            <FiCheckCircle className="text-green-600" />
                          ) : (
                            <FiXCircle className="text-red-600" />
                          )}
                        </div>
                        {!result.isCorrect && (
                          <div className="text-sm">
                            <span className="text-gray-600">Correct Answer:</span>
                            <span className="ml-2 font-semibold text-green-600">{result.correctAnswer}</span>
                          </div>
                        )}
                        {result.explanation && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-900">{result.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {result.type === 'viva' && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700"><strong>Your Answer:</strong> {result.userAnswer}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleNewTest}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center space-x-2"
          >
            <FiRefreshCw />
            <span>Start New Test</span>
          </button>
        </div>
      )}

      {vivaHistory.length > 0 && !currentSession && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Test History</h2>
          <div className="space-y-3">
            {vivaHistory.map(test => (
              <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">{test.topic}</h4>
                  <p className="text-sm text-gray-600">
                    <FiClock className="inline mr-1" />
                    {new Date(test.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  {test.score !== null && (
                    <div className={`text-2xl font-bold ${
                      test.score >= 80 ? 'text-green-600' : test.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {test.score}%
                    </div>
                  )}
                  <p className="text-xs text-gray-500">{test.totalQuestions} questions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VivaQuestionsNew;
