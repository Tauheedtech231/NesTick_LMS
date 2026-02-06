import React from 'react';

function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-red-700 mb-4">
          Student Dashboard
        </h1>
        <p className="text-gray-700 text-lg mb-6">
          This dashboard is currently under development.
        </p>
        <div className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold">
          🚧 Under Development
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
