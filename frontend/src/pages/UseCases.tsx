import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface UseCase {
  id: string;
  workshopId: string;
  title: string;
  problemStatement: string;
  currentProcess: string;
  desiredOutcome: string;
  businessImpact: number;
  feasibility: number;
  timeToValue: number;
  totalScore: number;
  createdAt: string;
  updatedAt: string;
}

interface ConsolidatedPainPoint {
  id: string;
  description: string;
}

const UseCases: React.FC = () => {
  const { id: workshopId } = useParams<{ id: string }>();
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [painPoints, setPainPoints] = useState<ConsolidatedPainPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [newUseCase, setNewUseCase] = useState({
    title: '',
    problemStatement: '',
    currentProcess: '',
    desiredOutcome: '',
    relatedPainPoints: [] as string[],
  });
  const [scores, setScores] = useState({
    businessImpact: 3,
    feasibility: 3,
    timeToValue: 3,
  });
  
  useAuth();
  
  useEffect(() => {
    const mockUseCases: UseCase[] = [
      {
        id: '1',
        workshopId: workshopId || '',
        title: 'Automated Deployment Pipeline',
        problemStatement: 'Manual deployments are error-prone and time-consuming',
        currentProcess: 'Engineers manually deploy code to production environments',
        desiredOutcome: 'Fully automated CI/CD pipeline with testing and approval gates',
        businessImpact: 5,
        feasibility: 4,
        timeToValue: 3,
        totalScore: 12,
        createdAt: '2025-05-10T12:00:00Z',
        updatedAt: '2025-05-10T12:00:00Z',
      },
      {
        id: '2',
        workshopId: workshopId || '',
        title: 'Automated Testing Framework',
        problemStatement: 'Lack of automated testing leads to quality issues',
        currentProcess: 'Manual testing with inconsistent coverage',
        desiredOutcome: 'Comprehensive automated test suite with high coverage',
        businessImpact: 4,
        feasibility: 3,
        timeToValue: 2,
        totalScore: 9,
        createdAt: '2025-05-10T12:30:00Z',
        updatedAt: '2025-05-10T12:30:00Z',
      },
    ];
    
    const mockPainPoints: ConsolidatedPainPoint[] = [
      {
        id: 'c1',
        description: 'Deployment and CI/CD pipeline issues',
      },
      {
        id: 'c2',
        description: 'Lack of automated testing leads to quality issues',
      },
      {
        id: 'c3',
        description: 'Poor documentation makes onboarding difficult',
      },
    ];
    
    setUseCases(mockUseCases);
    setPainPoints(mockPainPoints);
    setIsLoading(false);
  }, [workshopId]);
  
  const handleAddUseCase = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUseCaseData: UseCase = {
      id: Math.random().toString(36).substring(2, 9),
      workshopId: workshopId || '',
      title: newUseCase.title,
      problemStatement: newUseCase.problemStatement,
      currentProcess: newUseCase.currentProcess,
      desiredOutcome: newUseCase.desiredOutcome,
      businessImpact: 0,
      feasibility: 0,
      timeToValue: 0,
      totalScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setUseCases([...useCases, newUseCaseData]);
    setShowAddModal(false);
    setNewUseCase({
      title: '',
      problemStatement: '',
      currentProcess: '',
      desiredOutcome: '',
      relatedPainPoints: [],
    });
  };
  
  const handleScoreUseCase = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUseCase) return;
    
    const totalScore = scores.businessImpact + scores.feasibility + scores.timeToValue;
    
    const updatedUseCases = useCases.map(uc => {
      if (uc.id === selectedUseCase.id) {
        return {
          ...uc,
          businessImpact: scores.businessImpact,
          feasibility: scores.feasibility,
          timeToValue: scores.timeToValue,
          totalScore,
          updatedAt: new Date().toISOString(),
        };
      }
      return uc;
    });
    
    setUseCases(updatedUseCases);
    setShowScoreModal(false);
    setSelectedUseCase(null);
    setScores({
      businessImpact: 3,
      feasibility: 3,
      timeToValue: 3,
    });
  };
  
  const openScoreModal = (useCase: UseCase) => {
    setSelectedUseCase(useCase);
    setScores({
      businessImpact: useCase.businessImpact || 3,
      feasibility: useCase.feasibility || 3,
      timeToValue: useCase.timeToValue || 3,
    });
    setShowScoreModal(true);
  };
  
  const togglePainPointSelection = (id: string) => {
    if (newUseCase.relatedPainPoints.includes(id)) {
      setNewUseCase({
        ...newUseCase,
        relatedPainPoints: newUseCase.relatedPainPoints.filter(p => p !== id),
      });
    } else {
      setNewUseCase({
        ...newUseCase,
        relatedPainPoints: [...newUseCase.relatedPainPoints, id],
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Use Cases</h1>
            <div className="flex space-x-4">
              <Link
                to={`/workshops/${workshopId}/painpoints`}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Pain Points
              </Link>
              <Link
                to={`/usecases/${workshopId}/actionplans`}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Next: Action Plans
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Step 3: Develop Use Cases</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Create formal use cases based on the consolidated pain points.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Use Case
              </button>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-4 mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div className="border-t border-gray-200">
              {useCases.length === 0 ? (
                <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                  No use cases added yet. Click "Add Use Case" to get started.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {useCases.map((useCase) => (
                    <li key={useCase.id} className="px-4 py-5 sm:px-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div className="mb-4 sm:mb-0 sm:pr-8 sm:w-2/3">
                          <h4 className="text-lg font-medium text-indigo-600">{useCase.title}</h4>
                          <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                            <div className="col-span-1 sm:col-span-2">
                              <span className="text-sm font-medium text-gray-500">Problem Statement:</span>
                              <p className="mt-1 text-sm text-gray-900">{useCase.problemStatement}</p>
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                              <span className="text-sm font-medium text-gray-500">Current Process:</span>
                              <p className="mt-1 text-sm text-gray-900">{useCase.currentProcess}</p>
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                              <span className="text-sm font-medium text-gray-500">Desired Outcome:</span>
                              <p className="mt-1 text-sm text-gray-900">{useCase.desiredOutcome}</p>
                            </div>
                          </div>
                        </div>
                        <div className="sm:w-1/3 flex flex-col items-center justify-center border-t pt-4 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-8">
                          <div className="w-full max-w-xs bg-gray-50 rounded-lg p-4 shadow-sm">
                            <h5 className="text-sm font-medium text-gray-500 text-center mb-2">Prioritization Score</h5>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-500">Business Impact:</span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((score) => (
                                  <div
                                    key={score}
                                    className={`w-4 h-4 mx-0.5 rounded-full ${
                                      score <= useCase.businessImpact ? 'bg-indigo-500' : 'bg-gray-200'
                                    }`}
                                  ></div>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-500">Feasibility:</span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((score) => (
                                  <div
                                    key={score}
                                    className={`w-4 h-4 mx-0.5 rounded-full ${
                                      score <= useCase.feasibility ? 'bg-indigo-500' : 'bg-gray-200'
                                    }`}
                                  ></div>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-xs text-gray-500">Time to Value:</span>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((score) => (
                                  <div
                                    key={score}
                                    className={`w-4 h-4 mx-0.5 rounded-full ${
                                      score <= useCase.timeToValue ? 'bg-indigo-500' : 'bg-gray-200'
                                    }`}
                                  ></div>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                              <span className="text-sm font-medium text-gray-700">Total Score:</span>
                              <span className="text-lg font-bold text-indigo-600">{useCase.totalScore}</span>
                            </div>
                            <button
                              onClick={() => openScoreModal(useCase)}
                              className="mt-3 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              {useCase.totalScore > 0 ? 'Update Score' : 'Score Use Case'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Step 4: Prioritize Use Cases</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Score each use case based on business impact, implementation feasibility, and time to value.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Use Case
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business Impact
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Feasibility
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time to Value
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {useCases.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No use cases to prioritize yet.
                        </td>
                      </tr>
                    ) : (
                      useCases
                        .sort((a, b) => b.totalScore - a.totalScore)
                        .map((useCase) => (
                          <tr key={useCase.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                              {useCase.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                              {useCase.businessImpact}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                              {useCase.feasibility}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                              {useCase.timeToValue}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 text-center">
                              {useCase.totalScore}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {showAddModal && (
        <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowAddModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddUseCase}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Add Use Case
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newUseCase.title}
                            onChange={(e) => setNewUseCase({ ...newUseCase, title: e.target.value })}
                            placeholder="E.g., Automated Deployment Pipeline"
                          />
                        </div>
                        <div>
                          <label htmlFor="problemStatement" className="block text-sm font-medium text-gray-700">
                            Problem Statement
                          </label>
                          <textarea
                            id="problemStatement"
                            name="problemStatement"
                            rows={2}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newUseCase.problemStatement}
                            onChange={(e) => setNewUseCase({ ...newUseCase, problemStatement: e.target.value })}
                            placeholder="Describe the problem this use case addresses"
                          ></textarea>
                        </div>
                        <div>
                          <label htmlFor="currentProcess" className="block text-sm font-medium text-gray-700">
                            Current Process
                          </label>
                          <textarea
                            id="currentProcess"
                            name="currentProcess"
                            rows={2}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newUseCase.currentProcess}
                            onChange={(e) => setNewUseCase({ ...newUseCase, currentProcess: e.target.value })}
                            placeholder="Describe how things work currently"
                          ></textarea>
                        </div>
                        <div>
                          <label htmlFor="desiredOutcome" className="block text-sm font-medium text-gray-700">
                            Desired Outcome
                          </label>
                          <textarea
                            id="desiredOutcome"
                            name="desiredOutcome"
                            rows={2}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newUseCase.desiredOutcome}
                            onChange={(e) => setNewUseCase({ ...newUseCase, desiredOutcome: e.target.value })}
                            placeholder="Describe the ideal solution"
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Related Pain Points
                          </label>
                          <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                            {painPoints.map((painPoint) => (
                              <div key={painPoint.id} className="flex items-center px-3 py-2 border-b border-gray-200 last:border-b-0">
                                <input
                                  type="checkbox"
                                  id={`painpoint-${painPoint.id}`}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  checked={newUseCase.relatedPainPoints.includes(painPoint.id)}
                                  onChange={() => togglePainPointSelection(painPoint.id)}
                                />
                                <label htmlFor={`painpoint-${painPoint.id}`} className="ml-3 text-sm text-gray-700">
                                  {painPoint.description}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {showScoreModal && selectedUseCase && (
        <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowScoreModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleScoreUseCase}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Score Use Case: {selectedUseCase.title}
                      </h3>
                      <div className="mt-4 space-y-6">
                        <div>
                          <label htmlFor="businessImpact" className="block text-sm font-medium text-gray-700">
                            Business Impact (1-5)
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            How significant is the impact on business outcomes?
                          </p>
                          <div className="mt-2 flex items-center">
                            <input
                              type="range"
                              id="businessImpact"
                              name="businessImpact"
                              min="1"
                              max="5"
                              step="1"
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              value={scores.businessImpact}
                              onChange={(e) => setScores({ ...scores, businessImpact: parseInt(e.target.value) })}
                            />
                            <span className="ml-3 text-lg font-medium text-indigo-600 w-6 text-center">
                              {scores.businessImpact}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="feasibility" className="block text-sm font-medium text-gray-700">
                            Implementation Feasibility (1-5)
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            How feasible is it to implement this solution?
                          </p>
                          <div className="mt-2 flex items-center">
                            <input
                              type="range"
                              id="feasibility"
                              name="feasibility"
                              min="1"
                              max="5"
                              step="1"
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              value={scores.feasibility}
                              onChange={(e) => setScores({ ...scores, feasibility: parseInt(e.target.value) })}
                            />
                            <span className="ml-3 text-lg font-medium text-indigo-600 w-6 text-center">
                              {scores.feasibility}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="timeToValue" className="block text-sm font-medium text-gray-700">
                            Time to Value (1-5)
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            How quickly can we realize value from this solution?
                          </p>
                          <div className="mt-2 flex items-center">
                            <input
                              type="range"
                              id="timeToValue"
                              name="timeToValue"
                              min="1"
                              max="5"
                              step="1"
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              value={scores.timeToValue}
                              onChange={(e) => setScores({ ...scores, timeToValue: parseInt(e.target.value) })}
                            />
                            <span className="ml-3 text-lg font-medium text-indigo-600 w-6 text-center">
                              {scores.timeToValue}
                            </span>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Total Score:</span>
                            <span className="text-xl font-bold text-indigo-600">
                              {scores.businessImpact + scores.feasibility + scores.timeToValue}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Save Scores
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowScoreModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UseCases;
