import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Workshop {
  id: string;
  name: string;
  description: string;
  facilitator: string;
  status: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkshop, setNewWorkshop] = useState({
    name: '',
    description: '',
  });
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const mockWorkshops: Workshop[] = [
      {
        id: '1',
        name: 'SDLC Improvement Workshop',
        description: 'Identifying pain points in our software development lifecycle',
        facilitator: 'John Doe',
        status: 'active',
        createdAt: '2025-05-10T10:00:00Z',
      },
      {
        id: '2',
        name: 'DevOps Transformation',
        description: 'Working backwards from ideal DevOps practices',
        facilitator: 'Jane Smith',
        status: 'active',
        createdAt: '2025-05-08T14:30:00Z',
      },
    ];
    
    setWorkshops(mockWorkshops);
    setIsLoading(false);
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleCreateWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newWorkshopData: Workshop = {
      id: Math.random().toString(36).substring(2, 9),
      name: newWorkshop.name,
      description: newWorkshop.description,
      facilitator: user?.name || 'Unknown',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    
    setWorkshops([...workshops, newWorkshopData]);
    setShowCreateModal(false);
    setNewWorkshop({ name: '', description: '' });
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
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Working Backwards</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Your Workshops</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create New Workshop
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workshops.map((workshop) => (
              <Link
                key={workshop.id}
                to={`/workshops/${workshop.id}`}
                className="block bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
              >
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{workshop.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{workshop.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Facilitator: {workshop.facilitator}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {workshop.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {workshops.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No workshops found. Create your first workshop to get started.</p>
            </div>
          )}
        </div>
      </main>
      
      {showCreateModal && (
        <div className="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowCreateModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateWorkshop}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Create New Workshop
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Workshop Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newWorkshop.name}
                            onChange={(e) => setNewWorkshop({ ...newWorkshop, name: e.target.value })}
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
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={newWorkshop.description}
                            onChange={(e) => setNewWorkshop({ ...newWorkshop, description: e.target.value })}
                          ></textarea>
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
                    Create
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowCreateModal(false)}
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

export default Dashboard;
