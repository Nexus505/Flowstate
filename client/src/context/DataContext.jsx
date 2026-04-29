import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from './ToastContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const toast = useToast();

  const [workouts,     setWorkouts]     = useState([]);
  const [sleepData,    setSleepData]    = useState([]);
  const [expenses,     setExpenses]     = useState([]);
  const [habits,       setHabits]       = useState([]);
  const [nutrition,    setNutrition]    = useState([]);
  const [workData,     setWorkData]     = useState([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [loading,      setLoading]      = useState(true);

  const TODAY = new Date().toISOString().split('T')[0];

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
      api.get(`/water?date=${TODAY}`),
    ])
      .then(([w, s, e, h, n, wk, wat]) => {
        setWorkouts(w.data);
        setSleepData(s.data);
        setExpenses(e.data);
        setHabits(h.data);
        setNutrition(n.data);
        setWorkData(wk.data);
        setWaterGlasses(wat.data.glasses ?? 0);
      })
      .catch((err) => console.error('Data fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  // ── Workout Actions ─────────────────────────────────────────
  const addWorkout = async (w) => {
    try {
      const { data } = await api.post('/workouts', w);
      setWorkouts(prev => [data, ...prev]);
      toast.success('Workout logged!');
    } catch {
      toast.error('Failed to log workout.');
    }
  };

  const deleteWorkout = async (id) => {
    try {
      await api.delete(`/workouts/${id}`);
      setWorkouts(prev => prev.filter(w => w._id !== id));
      toast.success('Workout deleted.');
    } catch {
      toast.error('Failed to delete workout.');
    }
  };

  // ── Sleep Actions ───────────────────────────────────────────
  const addSleep = async (s) => {
    try {
      const { data } = await api.post('/sleep', s);
      setSleepData(prev => [data, ...prev]);
      toast.success('Sleep logged!');
    } catch {
      toast.error('Failed to log sleep.');
    }
  };

  const deleteSleep = async (id) => {
    try {
      await api.delete(`/sleep/${id}`);
      setSleepData(prev => prev.filter(s => s._id !== id));
      toast.success('Sleep entry deleted.');
    } catch {
      toast.error('Failed to delete entry.');
    }
  };

  // ── Expense Actions ─────────────────────────────────────────
  const addExpense = async (e) => {
    try {
      const { data } = await api.post('/expenses', e);
      setExpenses(prev => [data, ...prev]);
      toast.success('Transaction added!');
    } catch {
      toast.error('Failed to add transaction.');
    }
  };

  const deleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(e => e._id !== id));
      toast.success('Transaction deleted.');
    } catch {
      toast.error('Failed to delete transaction.');
    }
  };

  // ── Nutrition Actions ───────────────────────────────────────
  const addMeal = async (meal, date) => {
    try {
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
      toast.success('Meal logged!');
    } catch {
      toast.error('Failed to log meal.');
    }
  };

  const deleteNutritionDay = async (id) => {
    try {
      await api.delete(`/nutrition/${id}`);
      setNutrition(prev => prev.filter(n => n._id !== id));
      toast.success('Day entry deleted.');
    } catch {
      toast.error('Failed to delete entry.');
    }
  };

  const deleteMeal = async (dayId, mealIdx) => {
    try {
      const { data } = await api.delete(`/nutrition/${dayId}/meal/${mealIdx}`);
      if (data.removed) {
        setNutrition(prev => prev.filter(n => n._id !== dayId));
      } else {
        setNutrition(prev => prev.map(n => n._id === dayId ? data : n));
      }
      toast.success('Meal deleted.');
    } catch {
      toast.error('Failed to delete meal.');
    }
  };

  // ── Work Actions ────────────────────────────────────────────
  const addWork = async (w) => {
    try {
      const { data } = await api.post('/work', w);
      setWorkData(prev => [data, ...prev]);
      toast.success('Session logged!');
    } catch {
      toast.error('Failed to log session.');
    }
  };

  const deleteWork = async (id) => {
    try {
      await api.delete(`/work/${id}`);
      setWorkData(prev => prev.filter(w => w._id !== id));
      toast.success('Session deleted.');
    } catch {
      toast.error('Failed to delete session.');
    }
  };

  // ── Habit Actions ───────────────────────────────────────────
  const addHabit = async (h) => {
    try {
      const { data } = await api.post('/habits', h);
      setHabits(prev => [data, ...prev]);
      toast.success(`"${h.name}" habit created!`);
    } catch {
      toast.error('Failed to create habit.');
    }
  };

  const toggleHabit = async (id) => {
    try {
      const { data } = await api.patch(`/habits/${id}/toggle`);
      setHabits(prev => prev.map(h => h._id === id ? data : h));
    } catch {
      toast.error('Failed to update habit.');
    }
  };

  const deleteHabit = async (id) => {
    try {
      await api.delete(`/habits/${id}`);
      setHabits(prev => prev.filter(h => h._id !== id));
      toast.success('Habit deleted.');
    } catch {
      toast.error('Failed to delete habit.');
    }
  };

  // ── Water Actions ────────────────────────────────────────────
  const updateWater = async (glasses) => {
    const clamped = Math.max(0, Math.min(20, glasses));
    setWaterGlasses(clamped);   // optimistic
    try {
      await api.put('/water', { date: TODAY, glasses: clamped });
    } catch {
      toast.error('Failed to save water intake.');
    }
  };

  // ── Refresh all data (called after login) ───────────────────
  const refreshAll = async () => {
    setLoading(true);
    try {
      const [w, s, e, h, n, wk, wat] = await Promise.all([
        api.get('/workouts'),
        api.get('/sleep'),
        api.get('/expenses'),
        api.get('/habits'),
        api.get('/nutrition'),
        api.get('/work'),
        api.get(`/water?date=${TODAY}`),
      ]);
      setWorkouts(w.data);
      setSleepData(s.data);
      setExpenses(e.data);
      setHabits(h.data);
      setNutrition(n.data);
      setWorkData(wk.data);
      setWaterGlasses(wat.data.glasses ?? 0);
    } catch (err) {
      console.error('Refresh error:', err);
      toast.error('Failed to refresh data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider value={{
      workouts,  addWorkout,  deleteWorkout,
      sleepData, addSleep,    deleteSleep,
      expenses,  addExpense,  deleteExpense,
      habits,    addHabit,    toggleHabit,  deleteHabit,
      nutrition, addMeal,     deleteNutritionDay, deleteMeal,
      workData,  addWork,     deleteWork,
      waterGlasses, updateWater,
      loading,   refreshAll,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
