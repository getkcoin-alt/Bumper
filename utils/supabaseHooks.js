import { useState, useEffect } from 'react';
import { supabase } from './supabase';

// Firms hooks
export function useFirms() {
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFirms();
  }, []);

  async function loadFirms() {
    try {
      const { data, error } = await supabase
        .from('firms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFirms(data || []);
    } catch (error) {
      console.error('Error loading firms:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addFirm(name) {
    try {
      const { data, error } = await supabase
        .from('firms')
        .insert([{ name }])
        .select()
        .single();
      
      if (error) throw error;
      setFirms(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding firm:', error);
      throw error;
    }
  }

  return { firms, loading, addFirm, reload: loadFirms };
}

// Users hooks
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addUser(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ ...userData, role: 'partner' }])
        .select()
        .single();
      
      if (error) throw error;
      setUsers(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  }

  return { users, loading, addUser, reload: loadUsers };
}

// Vehicles hooks
export function useVehicles(firmId = null) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, [firmId]);

  async function loadVehicles() {
    try {
      let query = supabase.from('vehicles').select('*');
      
      if (firmId) {
        query = query.eq('firm_id', firmId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addVehicle(vehicleData) {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicleData])
        .select()
        .single();
      
      if (error) throw error;
      setVehicles(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  }

  return { vehicles, loading, addVehicle, reload: loadVehicles };
}

// Expenses hooks
export function useExpenses(firmId = null) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, [firmId]);

  async function loadExpenses() {
    try {
      let query = supabase.from('expenses').select('*');
      
      if (firmId) {
        query = query.eq('firm_id', firmId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addExpense(expenseData) {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select()
        .single();
      
      if (error) throw error;
      setExpenses(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  return { expenses, loading, addExpense, reload: loadExpenses };
}

// Trips hooks
export function useTrips(firmId = null) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, [firmId]);

  async function loadTrips() {
    try {
      let query = supabase.from('trips').select('*');
      
      if (firmId) {
        query = query.eq('firm_id', firmId);
      }
      
      const { data, error } = await query.order('date', { ascending: false });
      
      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addTrip(tripData) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert([{ ...tripData, locked: true }])
        .select()
        .single();
      
      if (error) throw error;
      setTrips(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding trip:', error);
      throw error;
    }
  }

  return { trips, loading, addTrip, reload: loadTrips };
}
