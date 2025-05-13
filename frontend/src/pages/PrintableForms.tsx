import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';

const PrintableForms: React.FC = () => {
  const { id: workshopId } = useParams<{ id: string }>();
  const [activeForm, setActiveForm] = useState<string>('painpoints');
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white print:min-h-0">
      <header className="bg-white shadow print:hidden">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Printable Workshop Forms</h1>
            <div className="flex space-x-4">
              <Link
                to={`/workshops/${workshopId || ''}`}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Workshop
              </Link>
              <button
                onClick={handlePrint}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Print Current Form
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 print:px-0 print:py-0 print:max-w-none">
        <div className="px-4 py-6 sm:px-0 print:p-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6 print:shadow-none print:mb-0">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center print:hidden">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Workshop Forms</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Print these forms for offline workshop facilitation in sensitive environments.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 print:border-t-0">
              <div className="flex flex-wrap print:hidden">
                <button
                  className={`px-4 py-2 text-sm font-medium ${activeForm === 'painpoints' ? 'bg-indigo-100 text-indigo-700 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveForm('painpoints')}
                >
                  Step 1: Pain Points
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${activeForm === 'usecases' ? 'bg-indigo-100 text-indigo-700 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveForm('usecases')}
                >
                  Step 2: Use Cases
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${activeForm === 'actionplans' ? 'bg-indigo-100 text-indigo-700 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveForm('actionplans')}
                >
                  Step 3: Action Plans
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${activeForm === 'report' ? 'bg-indigo-100 text-indigo-700 border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveForm('report')}
                >
                  Step 4: Final Report
                </button>
              </div>

              <div className="p-4 print:p-0" ref={printRef}>
                {/* Pain Points Form - Page 1 */}
                {activeForm === 'painpoints' && (
                  <>
                    {/* Pain Points Submission Form - Page 1 */}
                    <div className="print:block print:page-break-after-always">
                      {/* Two-column header layout */}
                      <div className="flex justify-between items-start print:mb-2">
                        <div className="print:text-left">
                          <h2 className="text-lg font-bold print:text-lg">Working Backwards Workshop</h2>
                          <h3 className="text-md font-semibold print:text-md">Step 1: Pain Points Identification</h3>
                        </div>
                        <div className="print:text-right print:text-sm">
                          <p>Workshop Name: ___________________________</p>
                          <p>Date: ___________________________</p>
                          <p>Facilitator: ___________________________</p>
                        </div>
                      </div>

                      {/* Two pain point forms on one page */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
                        {/* First Pain Point Form */}
                        <div className="border border-gray-300 rounded-md p-3 print:text-sm">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Pain Point Submission</h4>
                            <div className="border border-gray-300 rounded-md h-6 w-10 flex items-center justify-center">
                              <span className="text-xs text-gray-500">Ref #</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Participant Name</label>
                              <div className="mt-1 border-b border-gray-300 h-5"></div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Role</label>
                              <div className="mt-1 border-b border-gray-300 h-5"></div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Description</label>
                              <div className="mt-1 border border-gray-300 rounded-md h-16"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Category</label>
                                <div className="mt-1 flex flex-col space-y-1">
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">Process</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">Technology</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">People</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Impact</label>
                                <div className="mt-1 flex flex-col space-y-1">
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">Low</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">Medium</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">High</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Second Pain Point Form */}
                        <div className="border border-gray-300 rounded-md p-3 print:text-sm">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Pain Point Submission</h4>
                            <div className="border border-gray-300 rounded-md h-6 w-10 flex items-center justify-center">
                              <span className="text-xs text-gray-500">Ref #</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Participant Name</label>
                              <div className="mt-1 border-b border-gray-300 h-5"></div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Role</label>
                              <div className="mt-1 border-b border-gray-300 h-5"></div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Description</label>
                              <div className="mt-1 border border-gray-300 rounded-md h-16"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Category</label>
                                <div className="mt-1 flex flex-col space-y-1">
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">Process</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">Technology</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">People</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Impact</label>
                                <div className="mt-1 flex flex-col space-y-1">
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">Low</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">Medium</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">High</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 print:text-xs text-gray-500 italic">
                        <p>This form is for offline workshop facilitation. Data collected on this form should be entered into the Working Backwards application later.</p>
                      </div>
                    </div>

                    {/* Pain Points Consolidation Form - Page 2 */}
                    <div className="print:block print:page-break-after-always mt-8 print:mt-0">
                      {/* Two-column header layout */}
                      <div className="flex justify-between items-start print:mb-2">
                        <div className="print:text-left">
                          <h2 className="text-lg font-bold print:text-lg">Working Backwards Workshop</h2>
                          <h3 className="text-md font-semibold print:text-md">Step 1: Pain Points Consolidation</h3>
                        </div>
                        <div className="print:text-right print:text-sm">
                          <p>Workshop Name: ___________________________</p>
                          <p>Date: ___________________________</p>
                          <p>Facilitator: ___________________________</p>
                        </div>
                      </div>

                      {/* Two consolidation forms on one page */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
                        {/* First Consolidation Form */}
                        <div className="border border-gray-300 rounded-md p-3 print:text-sm">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Pain Point Consolidation</h4>
                            <div className="border border-gray-300 rounded-md h-6 w-10 flex items-center justify-center">
                              <span className="text-xs text-gray-500">Ref #</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Related Pain Points (List Ref #s)</label>
                              <div className="mt-1 border border-gray-300 rounded-md h-12"></div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Consolidated Description</label>
                              <div className="mt-1 border border-gray-300 rounded-md h-16"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Category</label>
                                <div className="mt-1 flex flex-col space-y-1">
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">Process</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">Technology</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">People</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Priority</label>
                                <div className="mt-1 flex flex-col space-y-1">
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">Low</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">Medium</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">High</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Second Consolidation Form */}
                        <div className="border border-gray-300 rounded-md p-3 print:text-sm">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Pain Point Consolidation</h4>
                            <div className="border border-gray-300 rounded-md h-6 w-10 flex items-center justify-center">
                              <span className="text-xs text-gray-500">Ref #</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Related Pain Points (List Ref #s)</label>
                              <div className="mt-1 border border-gray-300 rounded-md h-12"></div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Consolidated Description</label>
                              <div className="mt-1 border border-gray-300 rounded-md h-16"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Category</label>
                                <div className="mt-1 flex flex-col space-y-1">
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">Process</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">Technology</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">People</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Priority</label>
                                <div className="mt-1 flex flex-col space-y-1">
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">Low</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">Medium</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 border border-gray-300 rounded-sm"></div>
                                    <span className="ml-1 text-xs">High</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 print:text-xs text-gray-500 italic">
                        <p>This form is for offline workshop facilitation. Data collected on this form should be entered into the Working Backwards application later.</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Use Cases Form */}
                {activeForm === 'usecases' && (
                  <div className="print:block print:page-break-after-always">
                    <div className="print:text-center print:mb-4">
                      <h2 className="text-xl font-bold print:text-2xl">Working Backwards Workshop</h2>
                      <h3 className="text-lg font-semibold print:text-xl">Step 2: Use Case Development &amp; Prioritization</h3>
                      <div className="print:mt-2 print:text-sm">
                        <p>Workshop Name: ___________________________</p>
                        <p>Date: ___________________________</p>
                        <p>Facilitator: ___________________________</p>
                      </div>
                    </div>

                    <div className="mt-6 print:mt-4">
                      <h4 className="text-md font-medium">Use Case Information</h4>
                      <div className="mt-2 border border-gray-300 rounded-md p-3">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <div className="mt-1 border-b border-gray-300 h-6"></div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Problem Statement</label>
                            <div className="mt-1 border border-gray-300 rounded-md h-16"></div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Current Process</label>
                            <div className="mt-1 border border-gray-300 rounded-md h-16"></div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Desired Outcome</label>
                            <div className="mt-1 border border-gray-300 rounded-md h-16"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 print:mt-4">
                      <h4 className="text-md font-medium">Related Pain Points</h4>
                      <div className="mt-2 border border-gray-300 rounded-md p-3">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">List the consolidated pain points that this use case addresses:</p>
                          <div className="border border-gray-300 rounded-md h-16"></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 print:mt-4">
                      <h4 className="text-md font-medium">Prioritization Scoring</h4>
                      <div className="mt-2 border border-gray-300 rounded-md p-3">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Business Impact (1-5)</label>
                            <p className="text-xs text-gray-500">How significant is the impact on business outcomes?</p>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-xs">Low</span>
                              <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map((score) => (
                                  <div key={score} className="h-5 w-5 border border-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-xs">{score}</span>
                                  </div>
                                ))}
                              </div>
                              <span className="text-xs">High</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Implementation Feasibility (1-5)</label>
                            <p className="text-xs text-gray-500">How feasible is it to implement this solution?</p>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-xs">Low</span>
                              <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map((score) => (
                                  <div key={score} className="h-5 w-5 border border-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-xs">{score}</span>
                                  </div>
                                ))}
                              </div>
                              <span className="text-xs">High</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Time to Value (1-5)</label>
                            <p className="text-xs text-gray-500">How quickly can we realize value from this solution?</p>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-xs">Low</span>
                              <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map((score) => (
                                  <div key={score} className="h-5 w-5 border border-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-xs">{score}</span>
                                  </div>
                                ))}
                              </div>
                              <span className="text-xs">High</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Total Score:</span>
                              <div className="border border-gray-300 rounded-md w-12 h-8 flex items-center justify-center">
                                <span className="text-lg font-bold text-gray-400">/15</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 print:mt-4 print:text-xs text-gray-500 italic">
                      <p>This form is for offline workshop facilitation. Data collected on this form should be entered into the Working Backwards application later.</p>
                    </div>
                  </div>
                )}

                {/* Action Plans Form */}
                {activeForm === 'actionplans' && (
                  <div className="print:block print:page-break-after-always">
                    <div className="print:text-center print:mb-4">
                      <h2 className="text-xl font-bold print:text-2xl">Working Backwards Workshop</h2>
                      <h3 className="text-lg font-semibold print:text-xl">Step 3: Action Plan Development</h3>
                      <div className="print:mt-2 print:text-sm">
                        <p>Workshop Name: ___________________________</p>
                        <p>Date: ___________________________</p>
                        <p>Facilitator: ___________________________</p>
                      </div>
                    </div>

                    <div className="mt-6 print:mt-4">
                      <h4 className="text-md font-medium">Action Plan Information</h4>
                      <div className="mt-2 border border-gray-300 rounded-md p-3">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Related Use Case</label>
                            <div className="mt-1 border-b border-gray-300 h-6"></div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Action Plan Title</label>
                            <div className="mt-1 border-b border-gray-300 h-6"></div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <div className="mt-1 border border-gray-300 rounded-md h-16"></div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Owner</label>
                              <div className="mt-1 border-b border-gray-300 h-6"></div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Start Date</label>
                              <div className="mt-1 border-b border-gray-300 h-6"></div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">End Date</label>
                              <div className="mt-1 border-b border-gray-300 h-6"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 print:mt-4">
                      <h4 className="text-md font-medium">Tasks</h4>
                      <div className="mt-2 border border-gray-300 rounded-md p-3">
                        <div className="space-y-4">
                          <div className="border-b border-gray-200 pb-2">
                            <div className="grid grid-cols-12 gap-2">
                              <div className="col-span-6">
                                <label className="block text-sm font-medium text-gray-700">Task Description</label>
                              </div>
                              <div className="col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Owner</label>
                              </div>
                              <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                              </div>
                              <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                              </div>
                            </div>
                          </div>
                          
                          {[1, 2, 3, 4, 5].map((index) => (
                            <div key={index} className="grid grid-cols-12 gap-2">
                              <div className="col-span-6">
                                <div className="border-b border-gray-300 h-6"></div>
                              </div>
                              <div className="col-span-3">
                                <div className="border-b border-gray-300 h-6"></div>
                              </div>
                              <div className="col-span-2">
                                <div className="border-b border-gray-300 h-6"></div>
                              </div>
                              <div className="col-span-1 flex items-center justify-center">
                                <div className="h-4 w-4 border border-gray-300 rounded-sm"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 print:mt-4 print:text-xs text-gray-500 italic">
                      <p>This form is for offline workshop facilitation. Data collected on this form should be entered into the Working Backwards application later.</p>
                    </div>
                  </div>
                )}

                {/* Final Report Form */}
                {activeForm === 'report' && (
                  <div className="print:block print:page-break-after-always">
                    <div className="print:text-center print:mb-4">
                      <h2 className="text-xl font-bold print:text-2xl">Working Backwards Workshop</h2>
                      <h3 className="text-lg font-semibold print:text-xl">Step 4: Final Report</h3>
                      <div className="print:mt-2 print:text-sm">
                        <p>Workshop Name: ___________________________</p>
                        <p>Date: ___________________________</p>
                        <p>Facilitator: ___________________________</p>
                      </div>
                    </div>

                    <div className="mt-6 print:mt-4">
                      <h4 className="text-md font-medium">Workshop Summary</h4>
                      <div className="mt-2 border border-gray-300 rounded-md p-3">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Key Outcomes</label>
                            <div className="mt-1 border border-gray-300 rounded-md h-20"></div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Participants</label>
                            <div className="mt-1 border border-gray-300 rounded-md h-12"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 print:mt-4">
                      <h4 className="text-md font-medium">Top Pain Points Identified</h4>
                      <div className="mt-2 border border-gray-300 rounded-md p-3">
                        <div className="space-y-2">
                          {[1, 2, 3].map((index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 border-b border-gray-200 pb-2">
                              <div className="col-span-8">
                                <label className="block text-xs font-medium text-gray-700">Description</label>
                                <div className="border-b border-gray-300 h-6"></div>
                              </div>
                              <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-700">Category</label>
                                <div className="border-b border-gray-300 h-6"></div>
                              </div>
                              <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-700">Impact</label>
                                <div className="border-b border-gray-300 h-6"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 print:mt-4">
                      <h4 className="text-md font-medium">Prioritized Use Cases</h4>
                      <div className="mt-2 border border-gray-300 rounded-md p-3">
                        <div className="space-y-2">
                          <div className="grid grid-cols-12 gap-2 border-b border-gray-200 pb-2">
                            <div className="col-span-4">
                              <label className="block text-xs font-medium text-gray-700">Use Case</label>
                            </div>
                            <div className="col-span-2 text-center">
                              <label className="block text-xs font-medium text-gray-700">Business Impact</label>
                            </div>
                            <div className="col-span-2 text-center">
                              <label className="block text-xs font-medium text-gray-700">Feasibility</label>
                            </div>
                            <div className="col-span-2 text-center">
                              <label className="block text-xs font-medium text-gray-700">Time to Value</label>
                            </div>
                            <div className="col-span-2 text-center">
                              <label className="block text-xs font-medium text-gray-700">Total Score</label>
                            </div>
                          </div>
                          
                          {[1, 2, 3].map((index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 py-1">
                              <div className="col-span-4">
                                <div className="border-b border-gray-300 h-6"></div>
                              </div>
                              <div className="col-span-2 text-center">
                                <div className="border-b border-gray-300 h-6"></div>
                              </div>
                              <div className="col-span-2 text-center">
                                <div className="border-b border-gray-300 h-6"></div>
                              </div>
                              <div className="col-span-2 text-center">
                                <div className="border-b border-gray-300 h-6"></div>
                              </div>
                              <div className="col-span-2 text-center">
                                <div className="border-b border-gray-300 h-6"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 print:mt-4">
                      <h4 className="text-md font-medium">Action Plan Summary</h4>
                      <div className="mt-2 border border-gray-300 rounded-md p-3">
                        <div className="space-y-4">
                          {[1, 2].map((index) => (
                            <div key={index} className="border-b border-gray-200 pb-2">
                              <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-4">
                                  <label className="block text-xs font-medium text-gray-700">Action Plan Title</label>
                                  <div className="border-b border-gray-300 h-6"></div>
                                </div>
                                <div className="col-span-4">
                                  <label className="block text-xs font-medium text-gray-700">Owner</label>
                                  <div className="border-b border-gray-300 h-6"></div>
                                </div>
                                <div className="col-span-4">
                                  <label className="block text-xs font-medium text-gray-700">Timeline</label>
                                  <div className="border-b border-gray-300 h-6"></div>
                                </div>
                              </div>
                              <div className="mt-2">
                                <label className="block text-xs font-medium text-gray-700">Key Tasks</label>
                                <div className="border border-gray-300 rounded-md h-12"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 print:mt-4 print:text-xs text-gray-500 italic">
                      <p>This form is for offline workshop facilitation. Data collected on this form should be entered into the Working Backwards application later.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrintableForms;
