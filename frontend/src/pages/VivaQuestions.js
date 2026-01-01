import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiCheckCircle, FiXCircle, FiStar } from 'react-icons/fi';
import { vivaService, documentService } from '../services';
import { toast } from 'react-toastify';

const VivaQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  const [generateForm, setGenerateForm] = useState({
    subject: '',
    topic: '',
    documentId: '',
    count: 5,
    difficulty: 'medium'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [questionsData, docsData] = await Promise.all([
        vivaService.getAll(),
        documentService.getAll({ type: 'syllabus,notes', status: 'completed' })
      ]);

      setQuestions(questionsData.questions || []);
      setDocuments(docsData.documents || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!generateForm.subject || !generateForm.topic) {
      toast.error('Subject and topic are required');
      return;
    }

    try {
      setGenerating(true);
      const data = await vivaService.generate({
        ...generateForm,
        documentId: generateForm.documentId || undefined
      });

      toast.success(`${data.questions.length} questions generated!`);
      setQuestions([...data.questions, ...questions]);
      
      // Reset form
      setGenerateForm({
        subject: '',
        topic: '',
        documentId: '',
        count: 5,
        difficulty: 'medium'
      });
    } catch (error) {
      toast.error(error.message || 'Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitAnswer = async (questionId) => {
    if (!userAnswer.trim()) {
      toast.error('Please enter your answer');
      return;
    }

    try {
      setEvaluating(true);
      const data = await vivaService.submitAnswer(questionId, { userAnswer });
      setEvaluation(data.evaluation);
      toast.success('Answer evaluated!');
    } catch (error) {
      toast.error('Failed to evaluate answer');
    } finally {
      setEvaluating(false);
    }
  };

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
    setUserAnswer('');
    setEvaluation(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-700 bg-green-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'hard': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Viva Questions</h1>
        <p className="text-gray-600">Practice with AI-generated exam-style questions</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Generator Panel */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Generate Questions</h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject *</label>
                <input
                  type="text"
                  value={generateForm.subject}
                  onChange={(e) => setGenerateForm({ ...generateForm, subject: e.target.value })}
                  placeholder="e.g., Computer Science"
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Topic *</label>
                <input
                  type="text"
                  value={generateForm.topic}
                  onChange={(e) => setGenerateForm({ ...generateForm, topic: e.target.value })}
                  placeholder="e.g., Data Structures"
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reference Document (Optional)</label>
                <select
                  value={generateForm.documentId}
                  onChange={(e) => setGenerateForm({ ...generateForm, documentId: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="">None</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Number of Questions</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={generateForm.count}
                  onChange={(e) => setGenerateForm({ ...generateForm, count: parseInt(e.target.value) })}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={generateForm.difficulty}
                  onChange={(e) => setGenerateForm({ ...generateForm, difficulty: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <FiRefreshCw className={generating ? 'animate-spin' : ''} />
                {generating ? 'Generating...' : 'Generate Questions'}
              </button>
            </form>
          </div>
        </div>

        {/* Questions & Answer Panel */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="card p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="card p-12 text-center">
              <FiStar className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No questions yet</h3>
              <p className="text-gray-600">Generate your first set of questions to get started</p>
            </div>
          ) : (
            <>
              {/* Questions List */}
              {!selectedQuestion && (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold mb-4">Generated Questions ({questions.length})</h2>
                  {questions.map((question, idx) => (
                    <div
                      key={question.id}
                      onClick={() => handleQuestionClick(question)}
                      className="card p-4 hover:shadow-lg cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            <span className="font-semibold text-indigo-600">Q{idx + 1}.</span>
                            <p className="flex-1 font-medium">{question.question}</p>
                          </div>
                          <div className="flex gap-3 text-sm text-gray-600 ml-8">
                            <span>{question.subject}</span>
                            <span>•</span>
                            <span>{question.topic}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Answer Interface */}
              {selectedQuestion && (
                <div className="card p-6">
                  <button
                    onClick={() => setSelectedQuestion(null)}
                    className="text-indigo-600 mb-4 hover:underline"
                  >
                    ← Back to questions
                  </button>

                  <div className="mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl font-semibold flex-1">{selectedQuestion.question}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                        {selectedQuestion.difficulty}
                      </span>
                    </div>
                    <div className="flex gap-3 text-sm text-gray-600">
                      <span>{selectedQuestion.subject}</span>
                      <span>•</span>
                      <span>{selectedQuestion.topic}</span>
                    </div>
                  </div>

                  {/* Answer Input */}
                  {!evaluation && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">Your Answer</label>
                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        rows="6"
                        placeholder="Type your answer here..."
                        className="input-field w-full"
                      />
                      <button
                        onClick={() => handleSubmitAnswer(selectedQuestion.id)}
                        disabled={evaluating}
                        className="btn-primary mt-3 flex items-center gap-2"
                      >
                        {evaluating ? 'Evaluating...' : 'Submit Answer'}
                      </button>
                    </div>
                  )}

                  {/* Evaluation Result */}
                  {evaluation && (
                    <div className="space-y-4">
                      <div className={`p-6 rounded-lg ${evaluation.isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-orange-50 border-2 border-orange-200'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          {evaluation.isCorrect ? (
                            <FiCheckCircle className="text-3xl text-green-600" />
                          ) : (
                            <FiXCircle className="text-3xl text-orange-600" />
                          )}
                          <div>
                            <h3 className="text-xl font-semibold">
                              {evaluation.isCorrect ? 'Correct!' : 'Good Attempt!'}
                            </h3>
                            <p className="text-lg font-medium">Score: {evaluation.score}/100</p>
                          </div>
                        </div>
                        <p className="text-gray-700">{evaluation.feedback}</p>
                      </div>

                      <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                        <h4 className="font-semibold mb-2">Model Answer:</h4>
                        <p className="text-gray-700">{selectedQuestion.answer}</p>
                      </div>

                      <button
                        onClick={() => {
                          setUserAnswer('');
                          setEvaluation(null);
                        }}
                        className="btn-primary"
                      >
                        Try Another Answer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VivaQuestions;
