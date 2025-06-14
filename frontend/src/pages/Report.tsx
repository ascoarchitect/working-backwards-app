import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface Workshop {
  id: string;
  name: string;
  description: string;
  facilitator: string;
  status: string;
  createdAt: string;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface PainPoint {
  id: string;
  description: string;
  category: string;
  impact: 'low' | 'medium' | 'high';
}

interface UseCase {
  id: string;
  title: string;
  problemStatement: string;
  currentProcess: string;
  desiredOutcome: string;
  businessImpact: number;
  feasibility: number;
  timeToValue: number;
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
}

interface ActionTask {
  id: string;
  description: string;
  owner: string;
  dueDate: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

const Report: React.FC = () => {
  const { id: workshopId } = useParams<{ id: string }>();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);
  
  useAuth();
  
  useEffect(() => {
    const mockWorkshop: Workshop = {
      id: workshopId || '1',
      name: 'SDLC Improvement Workshop',
      description: 'Identifying pain points in our software development lifecycle',
      facilitator: 'John Doe',
      status: 'active',
      createdAt: '2025-05-10T10:00:00Z',
    };
    
    const mockParticipants: Participant[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'facilitator',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'participant',
      },
      {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'participant',
      },
    ];
    
    const mockPainPoints: PainPoint[] = [
      {
        id: 'c1',
        description: 'Deployment and CI/CD pipeline issues',
        category: 'process',
        impact: 'high',
      },
      {
        id: 'c2',
        description: 'Lack of automated testing leads to quality issues',
        category: 'testing',
        impact: 'high',
      },
      {
        id: 'c3',
        description: 'Poor documentation makes onboarding difficult',
        category: 'documentation',
        impact: 'medium',
      },
    ];
    
    const mockUseCases: UseCase[] = [
      {
        id: '1',
        title: 'Automated Deployment Pipeline',
        problemStatement: 'Manual deployments are error-prone and time-consuming',
        currentProcess: 'Engineers manually deploy code to production environments',
        desiredOutcome: 'Fully automated CI/CD pipeline with testing and approval gates',
        businessImpact: 5,
        feasibility: 4,
        timeToValue: 3,
        totalScore: 12,
      },
      {
        id: '2',
        title: 'Automated Testing Framework',
        problemStatement: 'Lack of automated testing leads to quality issues',
        currentProcess: 'Manual testing with inconsistent coverage',
        desiredOutcome: 'Comprehensive automated test suite with high coverage',
        businessImpact: 4,
        feasibility: 3,
        timeToValue: 2,
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
      },
    ];
    
    setWorkshop(mockWorkshop);
    setParticipants(mockParticipants);
    setPainPoints(mockPainPoints);
    setUseCases(mockUseCases);
    setActionPlans(mockActionPlans);
    setIsLoading(false);
  }, [workshopId]);
  
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
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
  
  const getImpactBadgeClass = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-red-500">Workshop not found</div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen bg-gray-50 ${isPrinting ? 'print:bg-white' : ''}`}>
      <header className="bg-white shadow print:hidden">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Final Report</h1>
            <div className="flex space-x-4">
              <Link
                to={`/usecases/${workshopId}/actionplans`}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Action Plans
              </Link>
              <button
                onClick={handlePrint}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Print Report
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 print:px-0 print:py-0 print:max-w-none">
        <div className="px-4 py-6 sm:px-0 print:px-8" ref={printRef}>
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 print:hidden" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          
          <div className="print:py-4 print:border-b print:border-gray-300">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-900">{workshop.name}</h2>
              <p className="text-sm text-gray-500">
                Created on {new Date(workshop.createdAt).toLocaleDateString()}
              </p>
            </div>
            <p className="mt-2 text-gray-600">{workshop.description}</p>
            <p className="mt-1 text-sm text-gray-500">Facilitated by: {workshop.facilitator}</p>
          </div>
          
          <div className="mt-8 print:mt-6">
            <h3 className="text-xl font-semibold text-gray-900 print:text-lg">Participants</h3>
            <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg print:ring-0 print:shadow-none">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {participants.map((participant) => (
                    <tr key={participant.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{participant.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{participant.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {participant.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-8 print:mt-6 print:break-inside-avoid">
            <h3 className="text-xl font-semibold text-gray-900 print:text-lg">Identified Pain Points</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {painPoints.map((painPoint) => (
                <div key={painPoint.id} className="bg-white overflow-hidden shadow rounded-lg print:shadow-none print:border print:border-gray-200">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-medium text-gray-900">{painPoint.description}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactBadgeClass(painPoint.impact)}`}>
                        {painPoint.impact}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Category: {painPoint.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 print:mt-6 print:break-inside-avoid">
            <h3 className="text-xl font-semibold text-gray-900 print:text-lg">Prioritized Use Cases</h3>
            <div className="mt-4 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg print:ring-0 print:shadow-none">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Use Case</th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Business Impact</th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Feasibility</th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Time to Value</th>
                    <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {useCases
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .map((useCase) => (
                      <tr key={useCase.id}>
                        <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{useCase.title}</td>
                        <td className="px-3 py-4 text-sm text-gray-500 text-center">{useCase.businessImpact}</td>
                        <td className="px-3 py-4 text-sm text-gray-500 text-center">{useCase.feasibility}</td>
                        <td className="px-3 py-4 text-sm text-gray-500 text-center">{useCase.timeToValue}</td>
                        <td className="px-3 py-4 text-sm font-bold text-indigo-600 text-center">{useCase.totalScore}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {useCases.sort((a, b) => b.totalScore - a.totalScore).map((useCase) => (
            <div key={useCase.id} className="mt-8 print:mt-6 print:break-inside-avoid">
              <h3 className="text-xl font-semibold text-gray-900 print:text-lg">Use Case: {useCase.title}</h3>
              <div className="mt-4 bg-white overflow-hidden shadow rounded-lg print:shadow-none print:border print:border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Problem Statement</dt>
                      <dd className="mt-1 text-sm text-gray-900">{useCase.problemStatement}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Current Process</dt>
                      <dd className="mt-1 text-sm text-gray-900">{useCase.currentProcess}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Desired Outcome</dt>
                      <dd className="mt-1 text-sm text-gray-900">{useCase.desiredOutcome}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Business Impact</dt>
                      <dd className="mt-1 text-sm text-gray-900">{useCase.businessImpact} / 5</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Implementation Feasibility</dt>
                      <dd className="mt-1 text-sm text-gray-900">{useCase.feasibility} / 5</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Time to Value</dt>
                      <dd className="mt-1 text-sm text-gray-900">{useCase.timeToValue} / 5</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Total Score</dt>
                      <dd className="mt-1 text-sm font-bold text-indigo-600">{useCase.totalScore} / 15</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {actionPlans.filter(plan => plan.useCaseId === useCase.id).map((plan) => (
                <div key={plan.id} className="mt-4 bg-white overflow-hidden shadow rounded-lg print:shadow-none print:border print:border-gray-200">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-medium text-gray-900">Action Plan: {plan.title}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(plan.status)}`}>
                        {getStatusText(plan.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
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
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Tasks</h5>
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {plan.tasks.map((task) => (
                            <tr key={task.id}>
                              <td className="px-3 py-2 text-xs text-gray-900">{task.description}</td>
                              <td className="px-3 py-2 text-xs text-gray-500">{task.owner}</td>
                              <td className="px-3 py-2 text-xs text-gray-500">{new Date(task.dueDate).toLocaleDateString()}</td>
                              <td className="px-3 py-2 text-xs">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                                  {getStatusText(task.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          
          <div className="mt-12 print:mt-8 print:break-inside-avoid">
            <h3 className="text-xl font-semibold text-gray-900 print:text-lg">Summary</h3>
            <div className="mt-4 bg-white overflow-hidden shadow rounded-lg print:shadow-none print:border print:border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-600">
                  This report summarizes the outcomes of the "{workshop.name}" workshop. The team identified {painPoints.length} key pain points
                  in the current software development lifecycle and developed {useCases.length} use cases to address these challenges.
                  The use cases were prioritized based on business impact, implementation feasibility, and time to value.
                </p>
                <p className="mt-4 text-sm text-gray-600">
                  The top-scoring use case was "{useCases.sort((a, b) => b.totalScore - a.totalScore)[0]?.title}" with a score of 
                  {useCases.sort((a, b) => b.totalScore - a.totalScore)[0]?.totalScore}/15. Detailed action plans have been created for 
                  the prioritized use cases, with clear ownership, timelines, and tasks.
                </p>
                <p className="mt-4 text-sm text-gray-600">
                  The next steps are to execute the action plans according to the defined timelines and track progress regularly.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 print:mt-8 print:pb-8 print:break-inside-avoid">
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500 text-center">
                Generated by Working Backwards Workshop Application
              </p>
              <p className="text-sm text-gray-500 text-center">
                {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page {
            size: A4;
            margin: 0.5cm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />
    </div>
  );
};

export default Report;
