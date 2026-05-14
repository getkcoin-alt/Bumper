import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

/**
 * Simple test component to verify Supabase connection
 * Add this to your app temporarily to test the database
 */
export default function SupabaseTest() {
  const [status, setStatus] = useState('Testing connection...');
  const [firms, setFirms] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  async function testConnection() {
    try {
      // Test 1: Check connection
      setStatus('✓ Supabase client initialized');

      // Test 2: Fetch firms
      const { data, error } = await supabase
        .from('firms')
        .select('*');

      if (error) throw error;

      setFirms(data || []);
      setStatus('✓ Successfully connected to database!');
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
      setStatus('✗ Connection failed');
    }
  }

  return (
    <div style={{
      padding: '20px',
      margin: '20px',
      background: '#161b22',
      border: '1px solid #30363d',
      borderRadius: '10px',
      color: '#e6edf3'
    }}>
      <h2 style={{ marginBottom: '16px' }}>🔌 Supabase Connection Test</h2>
      
      <div style={{ marginBottom: '12px' }}>
        <strong>Status:</strong> {status}
      </div>

      {error && (
        <div style={{
          padding: '12px',
          background: '#ff6b6b18',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          marginBottom: '12px',
          color: '#ff6b6b'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {firms.length > 0 && (
        <div>
          <h3 style={{ marginTop: '16px', marginBottom: '8px' }}>
            Firms in Database ({firms.length}):
          </h3>
          <ul style={{ paddingLeft: '20px' }}>
            {firms.map(firm => (
              <li key={firm.id}>
                {firm.name} (Created: {new Date(firm.created_at).toLocaleDateString()})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: '#21262d',
        borderRadius: '8px',
        fontSize: '12px'
      }}>
        <strong>Connection Details:</strong>
        <div>URL: {import.meta.env.VITE_SUPABASE_URL}</div>
        <div>Key: {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✓ Set' : '✗ Missing'}</div>
      </div>
    </div>
  );
}

// To use this test component, add it to your App.jsx:
// import SupabaseTest from './SupabaseTest';
// 
// Then in your render:
// <SupabaseTest />
