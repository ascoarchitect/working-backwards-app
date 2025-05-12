import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface UseCase {
  id: string;
  title: string;
  totalScore: number;
}

interface ActionPlan {
  id: string;
  useCaseId: string;
  title: string;
  description: string;
  owner: string;
  startDate: string;
  endDate: string;
  status: 'not_started' | 'in_progress' | 'completed';
  tasks: ActionTask[];
  createdAt: string;
}

interface ActionTask {
  id: string;
  description: string;
  owner: string;
  dueDate: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

const ActionPlans: React.FC = () => {
  const { id: workshopId } = useParams<{ id: string }>();
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedActionPlan, setSelectedActionPlan] = useState<ActionPlan | null>(null);
  const [newActionPlan, setNewActionPlan] = useState({
    useCaseId: '',
    title: '',
    description: '',
    owner: '',
    startDate: '',
    endDate: '',
  });
  const [newTask, setNewTask] = useState({
    description: '',
    owner: '',
    dueDate: '',
  });
  
  const { user } = useAuth();
  
  useEffect(() => {
    const mockUseCases: UseCase[] = [
      {
        id: '1',
        title: 'Automated Deployment Pipeline',
        totalScore: 12,
      },
      {
        id: '2',
        title: 'Automated Testing Framework',
        totalScore: 9,
      },
    ];
    
    const mockActionPlans: ActionPlan[] = [
      {
        id: '1',
        useCaseId: '1',
        title: 'Implement CI/CD Pipeline',
        description: 'Set up a fully automated CI/CD pipeline with testing and approval gates',
        owner: 'John Doe',
        startDate: '2025-06-01',
        endDate: '2025-07-15',
        status: 'not_started',
        tasks: [
          {
            id: '1-1',
            description: 'Research CI/CD tools',
            owner: 'Jane Smith',
            dueDate: '2025-06-10',
            status: 'not_started',
          },
          {
            id: '1-2',
            description: 'Set up build automation',
            owner: 'John Doe',
            dueDate: '2025-06-20',
            status: 'not_started',
          },
          {
            id: '1-3',
            description: 'Configure deployment pipelines',
            owner: 'Bob Johnson',
            dueDate: '2025-07-05',
            status: 'not_started',
          },
        ],
        createdAt: '2025-05-15T10:00:00Z',
      },
    ];
    
    setUseCases(mockUseCases);
    setActionPlans(mockActionPlans);
    setIsLoading(false);
  }, [workshopId]);
  
  const handleAddActionPlan = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newActionPlanData: ActionPlan = {
      id: Math.random().toString(36).substring(2, 9),
      useCaseId: newActionPlan.useCaseId,
      title: newActionPlan.title,
      description: newActionPlan.description,
      owner: newActionPlan.owner,
      startDate: newActionPlan.startDate,
      endDate: newActionPlan.endDate,
      status: 'not_started',
      tasks: [],
      createdAt: new Date().toISOString(),
    };
    
    setActionPlans([...actionPlans, newActionPlanData]);
    setShowAddModal(false);
    setNewActionPlan({
      useCaseId: '',
      title: '',
      description: '',
      owner: '',
      startDate: '',
      endDate: '',
    });
  };
  
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedActionPlan) return;
    
    const newTaskData: ActionTask = {
      id: `${selectedActionPlan.id}-${Math.random().toString(36).substring(2, 9)}`,
      description: newTask.description,
      owner: newTask.owner,
      dueDate: newTask.dueDate,
      status: 'not_started',
    };
    
    const updatedActionPlans = actionPlans.map(plan => {
      if (plan.id === selectedActionPlan.id) {
        return {
          ...plan,
          tasks: [...plan.tasks, newTaskData],
        };
      }
      return plan;
    });
    
    setActionPlans(updatedActionPlans);
    setShowAddTaskModal(false);
    setNewTask({
      description: '',
      owner: '',
      dueDate: '',
    });
  };
  
  const updateTaskStatus = (planId: string, taskId: string, status: 'not_started' | 'in_progress' | 'completed') => {
    const updatedActionPlans = actionPlans.map(plan => {
      if (plan.id === planId) {
        const updatedTasks = plan.tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, status };
          }
          return task;
        });
        
        let planStatus: 'not_started' | 'in_progress' | 'completed' = 'not_started';
        const completedCount = updatedTasks.filter(t => t.status === 'completed').length;
        const inProgressCount = updatedTasks.filter(t => t.status === 'in_progress').length;
        
        if (completedCount === updatedTasks.length) {
          planStatus = 'completed';
        } else if (inProgressCount > 0 || completedCount > 0) {
          planStatus = 'in_progress';
        }
        
        return {
          ...plan,
          tasks: updatedTasks,
          status: planStatus,
        };
      }
      return plan;
    });
    
    setActionPlans(updatedActionPlans);
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
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
            <h1 className="text-3xl font-bold text-gray-900">Action Plans</h1>
            <div className="flex space-x-4">
              <Link
                to={`/workshops/${workshopId}/usecases`}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Use Cases
              </Link>
              <Link
                to={`/workshops/${workshopId}/report`}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Next: Final Report
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
                <h3 className="text-lg leading-6 font-medium text-gray-900">Step 5: Create Action Plans</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Develop detailed action plans for the top-scoring use cases.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Action Plan
              </button>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-4 mb-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div className="border-t border-gray-200">
              {actionPlans.length === 0 ? (
                <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                  No action plans added yet. Click "Add Action Plan" to get started.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {actionPlans.map((plan) => {
                    const useCase = useCases.find(uc => uc.id === plan.useCaseId);
                    return (
                      <div key={plan.id} className="px-4 py-5 sm:px-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div className="mb-4 sm:mb-0 sm:pr-8 sm:w-2/3">
                            <div className="flex items-center">
                              <h4 className="text-lg font-medium text-indigo-600">{plan.title}</h4>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(plan.status)}`}>
                                {getStatusText(plan.status)}
                              </span>
                            </div>
                            {useCase && (
                              <p className="mt-1 text-sm text-gray-500">
                                For use case: {useCase.title}
                              </p>
                            )}
                            <p className="mt-2 text-sm text-gray-900">{plan.description}</p>
                            <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                              <div className="col-span-1">
                                <span className="text-xs font-medium text-gray-500">Owner:</span>
                                <p className="text-sm text-gray-900">{plan.owner}</p>
                              </div>
                              <div className="col-span-1">
                                <span className="text-xs font-medium text-gray-500">Timeline:</span>
                                <p className="text-sm text-gray-900">
                                  {new Date(plan.startDate).toLocaleDateString()} to {new Date(plan.endDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="text-sm font-medium text-gray-700">Tasks</h5>
                                <button
                                  onClick={() => {
                                    setSelectedActionPlan(plan);
                                    setShowAddTaskModal(true);
                                  }}
                                  className="text-xs text-indigo-600 hover:text-indigo-900"
                                >
                                  + Add Task
                                </button>
                              </div>
                              
                              {plan.tasks.length === 0 ? (
                                <p className="text-sm text-gray-500">No tasks added yet.</p>
                              ) : (
                                <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                                  {plan.tasks.map((task) => (
                                    <li key={task.id} className="px-3 py-3 flex items-start justify-between">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center">
                                          <select
                                            value={task.status}
                                            onChange={(e) => updateTaskStatus(plan.id, task.id, e.target.value as 'not_started' | 'in_progress' | 'completed')}
                                            className="mr-2 text-xs border-gray-300 rounded-md"
                                          >
                                            <option value="not_started">Not Started</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                          </select>
                                          <p className={`text-sm font-medium ${
                                            task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'
                                          }`}>
                                            {task.description}
                                          </p>
                                        </div>
                                        <div className="mt-1 flex items-center text-xs text-gray-500">
                                          <span>Owner: {task.owner}</span>
                                          <span className="mx-1">•</span>
                                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                        </div>
                                      </div>
                                      <div className="ml-3 flex-shrink-0">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                                          {getStatusText(task.status)}
                                        </span>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                          
                          <div className="sm:w-1/3 sm:pl-8 sm:border-l sm:border-gray-200">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Progress</h5>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-indigo-600 h-2.5 rounded-full" 
                                style={{ 
                                  width: `${plan.tasks.length > 0 
                                    ? (plan.tasks.filter(t => t.status === 'completed').length / plan.tasks.length) * 100 
                                    : 0}%` 
                                }}
                              ></div>
                            </div>
                            <div className="mt-1 flex justify-between text-xs text-gray-500">
                              <span>
                                {plan.tasks.filter(t => t.status === 'completed').length} of {plan.tasks.length} tasks completed
                              </span>
                              <span>
                                {plan.tasks.length > 0 
                                  ? Math.round((plan.tasks.filter(t => t.status === 'completed').length / plan.tasks.length) * 100) 
                                  : 0}%
                              </span>
                            </div>
                            
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Timeline</h5>
                              <div className="relative pt-1">
                                <div className="flex mb-2 items-center justify-between">
                                  <div>
                                    <span className="text-xs font-semibold inline-block text-indigo-600">
                                      {new Date(plan.startDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs font-semibold inline-block text-indigo-600">
                                      {new Date(plan.endDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  {/* Calculate progress based on current date vs start/end dates */}
                                  {(() => {
                                    const start = new Date(plan.startDate).getTime();
                                    const end = new Date(plan.endDate).getTime();
                                    const now = new Date().getTime();
                                    const progress = Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
                                    return (
                                      <div 
                                        className="bg-indigo-600 h-2.5 rounded-full" 
                                        style={{ width: `${progress}%` }}
                                      ></div>
                                    );
                                  })()}
                                </div>
                                <div className="mt-1 text-xs text-center text-gray-500">
                                  {(() => {
                                    const end = new Date(plan.endDate);
                                    const now = new Date();
                                    const diffTime = end.getTime() - now.getTime();
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    return diffDays > 0 
                                      ? `${diffDays} days remaining` 
                                      : 'Past due date';
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {showAddModal && (
        <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowAddModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddActionPlan}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Add Action Plan
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="useCaseId" className="block text-sm font-medium text-gray-700">
                            Use Case
                          </label>
                          <select
                            id="useCaseId"
                            name="useCaseId"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newActionPlan.useCaseId}
                            onChange={(e) => setNewActionPlan({ ...newActionPlan, useCaseId: e.target.value })}
                          >
                            <option value="">Select a use case</option>
                            {useCases.map((useCase) => (
                              <option key={useCase.id} value={useCase.id}>
                                {useCase.title} (Score: {useCase.totalScore})
                              </option>
                            ))}
                          </select>
                        </div>
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
                            value={newActionPlan.title}
                            onChange={(e) => setNewActionPlan({ ...newActionPlan, title: e.target.value })}
                            placeholder="E.g., Implement CI/CD Pipeline"
                          />
                        </div>
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
                            value={newActionPlan.description}
                            onChange={(e) => setNewActionPlan({ ...newActionPlan, description: e.target.value })}
                            placeholder="Describe the action plan"
                          ></textarea>
                        </div>
                        <div>
                          <label htmlFor="owner" className="block text-sm font-medium text-gray-700">
                            Owner
                          </label>
                          <input
                            type="text"
                            name="owner"
                            id="owner"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newActionPlan.owner}
                            onChange={(e) => setNewActionPlan({ ...newActionPlan, owner: e.target.value })}
                            placeholder="Who is responsible for this plan"
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                              Start Date
                            </label>
                            <input
                              type="date"
                              name="startDate"
                              id="startDate"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={newActionPlan.startDate}
                              onChange={(e) => setNewActionPlan({ ...newActionPlan, startDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                              End Date
                            </label>
                            <input
                              type="date"
                              name="endDate"
                              id="endDate"
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={newActionPlan.endDate}
                              onChange={(e) => setNewActionPlan({ ...newActionPlan, endDate: e.target.value })}
                            />
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
      
      {showAddTaskModal && selectedActionPlan && (
        <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowAddTaskModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddTask}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Add Task to {selectedActionPlan.title}
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <input
                            type="text"
                            name="description"
                            id="description"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            placeholder="E.g., Research CI/CD tools"
                          />
                        </div>
                        <div>
                          <label htmlFor="taskOwner" className="block text-sm font-medium text-gray-700">
                            Owner
                          </label>
                          <input
                            type="text"
                            name="taskOwner"
                            id="taskOwner"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newTask.owner}
                            onChange={(e) => setNewTask({ ...newTask, owner: e.target.value })}
                            placeholder="Who is responsible for this task"
                          />
                        </div>
                        <div>
                          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                            Due Date
                          </label>
                          <input
                            type="date"
                            name="dueDate"
                            id="dueDate"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newTask.dueDate}
                            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                          />
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
                    Add Task
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowAddTaskModal(false)}
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

export default ActionPlans;
