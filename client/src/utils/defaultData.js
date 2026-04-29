export const defaultData = {
  user: { 
    name: "Alex Rivera", 
    email: "alex@example.com", 
    avatar: "AR", 
    joinDate: "2026-01-01" 
  },
  sleep: [
    { date: "2026-04-26", hours: 7.5, quality: 4, notes: "Felt rested" },
    { date: "2026-04-25", hours: 6.2, quality: 3, notes: "Woke up once" },
    { date: "2026-04-24", hours: 8.1, quality: 5, notes: "Deep sleep" },
    { date: "2026-04-23", hours: 5.5, quality: 2, notes: "Too much screen time" },
    { date: "2026-04-22", hours: 7.0, quality: 4, notes: "" },
    { date: "2026-04-21", hours: 7.8, quality: 4, notes: "" },
    { date: "2026-04-20", hours: 6.9, quality: 3, notes: "" },
  ],
  workouts: [
    { date: "2026-04-26", type: "Running", duration: 45, intensity: 4, calories: 420, notes: "Morning 5k" },
    { date: "2026-04-24", type: "Gym", duration: 60, intensity: 5, calories: 350, notes: "Leg day" },
    { date: "2026-04-22", type: "Yoga", duration: 30, intensity: 2, calories: 120, notes: "Recovery" },
    { date: "2026-04-20", type: "Cycling", duration: 90, intensity: 4, calories: 650, notes: "Long ride" },
  ],
  nutrition: [
    { date: "2026-04-26", meals: [{ name: "Oatmeal", calories: 350, protein: 12, carbs: 55, fat: 8 }, { name: "Chicken Salad", calories: 500, protein: 45, carbs: 15, fat: 22 }] },
    { date: "2026-04-25", meals: [{ name: "Protein Shake", calories: 250, protein: 30, carbs: 10, fat: 5 }, { name: "Steak & Potatoes", calories: 800, protein: 50, carbs: 60, fat: 35 }] }
  ],
  expenses: [
    { date: "2026-04-26", category: "Food", description: "Groceries", amount: 120.50, type: "expense" },
    { date: "2026-04-25", category: "Transport", description: "Gas", amount: 45.00, type: "expense" },
    { date: "2026-04-20", category: "Income", description: "Salary", amount: 4500.00, type: "income" },
  ],
  work: [
    { date: "2026-04-26", hoursWorked: 8.5, tasksCompleted: 6, mood: 4, notes: "Productive day" },
    { date: "2026-04-25", hoursWorked: 7.0, tasksCompleted: 3, mood: 3, notes: "Lots of meetings" },
  ],
  habits: [
    { id: 1, name: "Drink Water", icon: "Droplets", color: "#38bdf8", streak: 12, completedDates: ["2026-04-26", "2026-04-25", "2026-04-24", "2026-04-23", "2026-04-22"] },
    { id: 2, name: "Meditate", icon: "Brain", color: "#818cf8", streak: 3, completedDates: ["2026-04-26", "2026-04-25", "2026-04-24"] },
    { id: 3, name: "Read", icon: "BookOpen", color: "#34d399", streak: 0, completedDates: ["2026-04-24", "2026-04-22"] }
  ],
  journal: [
    { date: "2026-04-26", mood: 4, emoji: "🙂", note: "Feeling good about the progress today." },
    { date: "2026-04-25", mood: 3, emoji: "😐", note: "A bit tired, but got through the day." }
  ],
};
