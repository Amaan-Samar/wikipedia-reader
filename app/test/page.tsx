// app/test/page.tsx
'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/wikipedia?action=random');
      const data = await response.json();
      setResult(data);
      console.log('API Response:', data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>
      <button 
        onClick={testAPI}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Test Random Article
      </button>
      
      {loading && <p className="mt-4">Loading...</p>}
      {error && <p className="mt-4 text-red-600">Error: {error}</p>}
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}