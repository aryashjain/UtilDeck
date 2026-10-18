// Calorie and macro estimates. Mifflin-St Jeor for BMR, then an activity multiplier.
// Macros are a fixed split of the daily target: 30% protein, 40% carbs, 30% fat.

export const ACTIVITY_LEVELS = {
  sedentary: { label: 'Little or no exercise', factor: 1.2 },
  light: { label: 'Exercise 1 to 3 days a week', factor: 1.375 },
  moderate: { label: 'Exercise 3 to 5 days a week', factor: 1.55 },
  active: { label: 'Hard exercise 6 to 7 days a week', factor: 1.725 },
};

export const GOALS = {
  lose: { label: 'Lose weight (about 500 kcal a day below maintenance)', adjust: -500 },
  maintain: { label: 'Maintain weight', adjust: 0 },
  gain: { label: 'Gain weight (about 300 kcal a day above maintenance)', adjust: 300 },
};

// Share of the day's calories for each meal, used by the meal picker
export const MEAL_SHARE = { breakfast: 0.25, lunch: 0.35, dinner: 0.3, snack: 0.1 };

const MACRO_SPLIT = { protein: 0.3, carbs: 0.4, fat: 0.3 };

export function calorieTargets({ sex, age, heightCm, weightKg, activity, goal }) {
  if (!['male', 'female'].includes(sex)) throw new Error('Choose male or female.');
  if (!(age >= 13 && age <= 100)) throw new Error('Age must be between 13 and 100.');
  if (!(heightCm >= 100 && heightCm <= 250)) throw new Error('Height must be between 100 and 250 cm.');
  if (!(weightKg >= 30 && weightKg <= 250)) throw new Error('Weight must be between 30 and 250 kg.');
  if (!ACTIVITY_LEVELS[activity]) throw new Error('Choose an activity level.');
  if (!GOALS[goal]) throw new Error('Choose a goal.');

  const sexOffset = sex === 'male' ? 5 : -161;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + sexOffset;
  const maintenance = bmr * ACTIVITY_LEVELS[activity].factor;
  const target = maintenance + GOALS[goal].adjust;

  return {
    bmr: Math.round(bmr),
    maintenance: Math.round(maintenance),
    target: Math.round(target),
    protein: Math.round((target * MACRO_SPLIT.protein) / 4),
    carbs: Math.round((target * MACRO_SPLIT.carbs) / 4),
    fat: Math.round((target * MACRO_SPLIT.fat) / 9),
  };
}

// Where the calorie target is saved, so the meal picker can use it
export const TARGET_KEY = 'toolkit_calorie_target';
