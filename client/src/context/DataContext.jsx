import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [workouts,  setWorkouts]  = useState([]);
  const [sleepData, setSleepData] = useState([]);
  const [expenses,  setExpenses]  = useState([]);
  const [habits,    setHabits]    = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [workData,  setWorkData]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  // ── Fetch all data on mount ─────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('fs_token');
    if (!token) { setLoading(false); return; }

    Promise.all([
      api.get('/workouts'),
      api.get('/sleep'),
      api.get('/expenses'),
      api.get('/habits'),
      api.get('/nutrition'),
      api.get('/work'),
    ])
      .then(([w, s, e, h, n, wk]) => {
        setWorkouts(w.data);
        setSleepData(s.data);
        setExpenses(e.data);
        setHabits(h.data);
        setNutrition(n.data);
        setWorkData(wk.data);
      })
      .catch((err) => console.error('Data fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  // ── Actions ─────────────────────────────────────────────────
  const addWorkout = async (w) => {
    const { data } = await api.post('/workouts', w);
    setWorkouts(prev => [data, ...prev]);
  };

  const addSleep = async (s) => {
    const { data } = await api.post('/sleep', s);
    setSleepData(prev => [data, ...prev]);
  };

  const addExpense = async (e) => {
    const { data } = await api.post('/expenses', e);
    setExpenses(prev => [data, ...prev]);
  };

  const addMeal = async (meal, date) => {
    const { data } = await api.post('/nutrition', { meal, date });
    setNutrition(prev => {
      const idx = prev.findIndex(d => d._id === data._id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = data;
        return updated;
      }
      return [data, ...prev];
    });
  };

  const addWork = async (w) => {
    const { data } = await api.post('/work', w);
    setWorkData(prev => [data, ...prev]);
  };

  const toggleHabit = async (id) => {
    const { data } = await api.patch(`/habits/${id}/toggle`);
    setHabits(prev => prev.map(h => h._id === id ? data : h));
  };

  // ── Refresh all data (called after login) ───────────────────
  const refreshAll = async () => {
    setLoading(true);
    try {
      const [w, s, e, h, n, wk] = await Promise.all([
        api.get('/workouts'),
        api.get('/sleep'),
        api.get('/expenses'),
        api.get('/habits'),
        api.get('/nutrition'),
        api.get('/work'),
      ]);
      setWorkouts(w.data);
      setSleepData(s.data);
      setExpenses(e.data);
      setHabits(h.data);
      setNutrition(n.data);
      setWorkData(wk.data);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider value={{
      workouts,  addWorkout,
      sleepData, addSleep,
      expenses,  addExpense,
      habits,    toggleHabit,
      nutrition, addMeal,
      workData,  addWork,
      loading,   refreshAll,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
