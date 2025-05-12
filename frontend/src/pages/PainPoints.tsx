import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PainPoint {
  id: string;
  workshopId: string;
  participantId: string;
  participantName: string;
  description: string;
  category: string;
  impact: 'low' | 'medium' | 'high';
  isConsolidated: boolean;
  createdAt: string;
}

interface ConsolidatedPainPoint {
  id: string;
  workshopId: string;
  description: string;
  category: string;
  impact: 'low' | 'medium' | 'high';
  sourceIds: string[];
  createdAt: string;
}

const PainPoints: React.FC = () => {
  const { id: workshopId } = useParams<{ id: string }>();
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [consolidatedPainPoints, setConsolidatedPainPoints] = useState<ConsolidatedPainPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConsolidateModal, setShowConsolidateModal] = useState(false);
  const [newPainPoint, setNewPainPoint] = useState({
    description: '',
    category: 'process',
    impact: 'medium' as 'low' | 'medium' | 'high',
  });
  const [selectedPainPoints, setSelectedPainPoints] = useState<string[]>([]);
  const [consolidationDescription, setConsolidationDescription] = useState('');
  
  const { user } = useAuth();
  
  useEffect(() => {
    const mockPainPoints: PainPoint[] = [
      {
        id: '1',
        workshopId: workshopId || '',
        participantId: '1',
        participantName: 'John Doe',
        description: 'Manual deployment process is error-prone and time-consuming',
        category: 'process',
        impact: 'high',
        isConsolidated: false,
        createdAt: '2025-05-10T10:00:00Z',
      },
      {
        id: '2',
        workshopId: workshopId || '',
        participantId: '2',
        participantName: 'Jane Smith',
        description: 'Lack of automated testing leads to quality issues',
        category: 'testing',
        impact: 'high',
        isConsolidated: false,
        createdAt: '2025-05-10T10:05:00Z',
      },
      {
        id: '3',
        workshopId: workshopId || '',
        participantId: '3',
        participantName: 'Bob Johnson',
        description: 'Poor documentation makes onboarding difficult',
        category: 'documentation',
        impact: 'medium',
        isConsolidated: false,
        createdAt: '2025-05-10T10:10:00Z',
      },
    ];
    
    const mockConsolidatedPainPoints: ConsolidatedPainPoint[] = [
      {
        id: 'c1',
        workshopId: workshopId || '',
        description: 'Deployment and CI/CD pipeline issues',
        category: 'process',
        impact: 'high',
        sourceIds: ['1'],
        createdAt: '2025-05-10T11:00:00Z',
      },
    ];
    
    setPainPoints(mockPainPoints);
    setConsolidatedPainPoints(mockConsolidatedPainPoints);
    setIsLoading(false);
  }, [workshopId]);
  
  const handleAddPainPoint = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPainPointData: PainPoint = {
      id: Math.random().toString(36).substring(2, 9),
      workshopId: workshopId || '',
      participantId: user?.id || '',
      participantName: user?.name || 'Unknown',
      description: newPainPoint.description,
      category: newPainPoint.category,
      impact: newPainPoint.impact,
      isConsolidated: false,
      createdAt: new Date().toISOString(),
    };
    
    setPainPoints([...painPoints, newPainPointData]);
    setShowAddModal(false);
    setNewPainPoint({
      description: '',
      category: 'process',
      impact: 'medium',
    });
  };
  
  const handleConsolidatePainPoints = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedPainPoints.length === 0) {
      setError('Please select at least one pain point to consolidate');
      return;
    }
    
    const newConsolidatedPainPoint: ConsolidatedPainPoint = {
      id: `c${Math.random().toString(36).substring(2, 9)}`,
      workshopId: workshopId || '',
      description: consolidationDescription,
      category: painPoints.find(p => p.id === selectedPainPoints[0])?.category || 'process',
      impact: 'high',
      sourceIds: selectedPainPoints,
      createdAt: new Date().toISOString(),
    };
    
    setConsolidatedPainPoints([...consolidatedPainPoints, newConsolidatedPainPoint]);
    
    const updatedPainPoints = painPoints.map(p => {
      if (selectedPainPoints.includes(p.id)) {
        return { ...p, isConsolidated: true };
      }
      return p;
    });
    
    setPainPoints(updatedPainPoints);
    setShowConsolidateModal(false);
    setSelectedPainPoints([]);
    setConsolidationDescription('');
  };
  
  const togglePainPointSelection = (id: string) => {
    if (selectedPainPoints.includes(id)) {
      setSelectedPainPoints(selectedPainPoints.filter(p => p !== id));
    } else {
      setSelectedPainPoints([...selectedPainPoints, id]);
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
            <h1 className="text-3xl font-bold text-gray-900">Pain Points</h1>
            <div className="flex space-x-4">
              <Link
                to={`/workshops/${workshopId}`}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Workshop
              </Link>
              <Link
                to={`/workshops/${workshopId}/usecases`}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Next: Use Cases
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
                <h3 className="text-lg leading-6 font-medium text-gray-900">Step 1: Identify Pain Points</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Each participant should identify their SDLC pain points.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Pain Point
              </button>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-4 mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {painPoints.length === 0 ? (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                    No pain points added yet. Click "Add Pain Point" to get started.
                  </li>
                ) : (
                  painPoints.map((painPoint) => (
                    <li key={painPoint.id} className={`px-4 py-4 sm:px-6 ${painPoint.isConsolidated ? 'bg-gray-50' : ''}`}>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={selectedPainPoints.includes(painPoint.id)}
                          onChange={() => togglePainPointSelection(painPoint.id)}
                          disabled={painPoint.isConsolidated}
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${painPoint.isConsolidated ? 'text-gray-400' : 'text-indigo-600'}`}>
                              {painPoint.description}
                              {painPoint.isConsolidated && (
                                <span className="ml-2 text-xs text-gray-500">(Consolidated)</span>
                              )}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                painPoint.impact === 'high' ? 'bg-red-100 text-red-800' :
                                painPoint.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {painPoint.impact}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {painPoint.category}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">
                            Added by {painPoint.participantName} on {new Date(painPoint.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Step 2: Consolidate Similar Pain Points</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Group similar pain points together for easier analysis.
                </p>
              </div>
              <button
                onClick={() => setShowConsolidateModal(true)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                disabled={painPoints.filter(p => !p.isConsolidated).length === 0}
              >
                Consolidate Selected
              </button>
            </div>
            
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {consolidatedPainPoints.length === 0 ? (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                    No consolidated pain points yet. Select individual pain points and click "Consolidate Selected" to create a consolidated view.
                  </li>
                ) : (
                  consolidatedPainPoints.map((painPoint) => (
                    <li key={painPoint.id} className="px-4 py-4 sm:px-6 bg-indigo-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-600">{painPoint.description}</p>
                          <p className="text-sm text-gray-500">
                            Consolidated on {new Date(painPoint.createdAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Sources: {painPoint.sourceIds.length} pain points
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            painPoint.impact === 'high' ? 'bg-red-100 text-red-800' :
                            painPoint.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {painPoint.impact}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {painPoint.category}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      {showAddModal && (
        <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowAddModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddPainPoint}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Add Pain Point
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newPainPoint.description}
                            onChange={(e) => setNewPainPoint({ ...newPainPoint, description: e.target.value })}
                            placeholder="Describe the pain point in your SDLC process"
                          ></textarea>
                        </div>
                        <div>
                          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                            Category
                          </label>
                          <select
                            id="category"
                            name="category"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newPainPoint.category}
                            onChange={(e) => setNewPainPoint({ ...newPainPoint, category: e.target.value })}
                          >
                            <option value="process">Process</option>
                            <option value="testing">Testing</option>
                            <option value="documentation">Documentation</option>
                            <option value="deployment">Deployment</option>
                            <option value="communication">Communication</option>
                            <option value="tools">Tools</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="impact" className="block text-sm font-medium text-gray-700">
                            Impact
                          </label>
                          <select
                            id="impact"
                            name="impact"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newPainPoint.impact}
                            onChange={(e) => setNewPainPoint({ ...newPainPoint, impact: e.target.value as 'low' | 'medium' | 'high' })}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
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
      
      {showConsolidateModal && (
        <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowConsolidateModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleConsolidatePainPoints}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Consolidate Pain Points
                      </h3>
                      
                      {selectedPainPoints.length === 0 ? (
                        <div className="mt-2 text-sm text-red-500">
                          Please select at least one pain point to consolidate.
                        </div>
                      ) : (
                        <div className="mt-2 text-sm text-gray-500">
                          You have selected {selectedPainPoints.length} pain point(s) to consolidate.
                        </div>
                      )}
                      
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="consolidation-description" className="block text-sm font-medium text-gray-700">
                            Consolidated Description
                          </label>
                          <textarea
                            id="consolidation-description"
                            name="consolidation-description"
                            rows={3}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={consolidationDescription}
                            onChange={(e) => setConsolidationDescription(e.target.value)}
                            placeholder="Provide a summary description for these consolidated pain points"
                          ></textarea>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700">Selected Pain Points:</h4>
                          <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md">
                            {selectedPainPoints.map(id => {
                              const painPoint = painPoints.find(p => p.id === id);
                              return painPoint ? (
                                <li key={id} className="px-3 py-2 text-sm">
                                  <p className="font-medium text-gray-900">{painPoint.description}</p>
                                  <p className="text-xs text-gray-500">
                                    {painPoint.participantName} - {painPoint.category} - {painPoint.impact}
                                  </p>
                                </li>
                              ) : null;
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={selectedPainPoints.length === 0}
                  >
                    Consolidate
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowConsolidateModal(false)}
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

export default PainPoints;
