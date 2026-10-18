// Sample menu with typical-serving estimates. Values are approximate and vary by recipe and portion.
// diet: 'veg' (vegetarian) or 'non-veg' (includes eggs, meat and fish).
export const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];

export const CUISINES = ['Indian', 'Italian', 'Chinese', 'Mexican', 'Japanese'];

const item = (name, cuisine, meal, diet, kcal, protein, carbs, fat, serving) =>
  ({ name, cuisine, meal, diet, kcal, protein, carbs, fat, serving });

export const MENU = [
  // Indian
  item('Idli with sambar', 'Indian', 'breakfast', 'veg', 250, 9, 45, 3, '2 idli with 1 cup sambar'),
  item('Poha', 'Indian', 'breakfast', 'veg', 260, 6, 45, 6, '1 bowl poha with peanuts'),
  item('Upma', 'Indian', 'breakfast', 'veg', 230, 6, 36, 7, '1 bowl vegetable upma'),
  item('Egg bhurji with roti', 'Indian', 'breakfast', 'non-veg', 380, 20, 35, 18, '2 eggs bhurji with 2 roti'),
  item('Dal tadka with brown rice', 'Indian', 'lunch', 'veg', 420, 16, 65, 10, '1 bowl dal with 1 cup brown rice'),
  item('Rajma chawal', 'Indian', 'lunch', 'veg', 500, 18, 85, 9, '1 cup rajma with 1 cup rice'),
  item('Paneer bhurji with roti', 'Indian', 'lunch', 'veg', 450, 20, 40, 22, '1 cup paneer bhurji with 2 roti'),
  item('Chicken tikka with roti', 'Indian', 'lunch', 'non-veg', 480, 35, 40, 18, '6 chicken tikka pieces with 2 roti'),
  item('Palak paneer with roti', 'Indian', 'dinner', 'veg', 430, 18, 35, 24, '1 cup palak paneer with 2 roti'),
  item('Chana masala with roti', 'Indian', 'dinner', 'veg', 420, 16, 58, 14, '1 cup chana masala with 2 roti'),
  item('Fish curry with rice', 'Indian', 'dinner', 'non-veg', 480, 30, 50, 16, '1 cup fish curry with 1 cup rice'),
  item('Roasted chana', 'Indian', 'snack', 'veg', 180, 10, 25, 4, '1 small bowl roasted chana'),
  item('Sprouts chaat', 'Indian', 'snack', 'veg', 150, 9, 24, 2, '1 bowl sprouts chaat'),
  item('Chicken tikka bites', 'Indian', 'snack', 'non-veg', 220, 25, 4, 11, '6 pieces chicken tikka'),
  // Italian
  item('Greek yogurt with berries', 'Italian', 'breakfast', 'veg', 200, 15, 25, 4, '1 cup yogurt with berries'),
  item('Avocado toast with egg', 'Italian', 'breakfast', 'non-veg', 360, 15, 30, 20, '1 slice toast, half avocado, 1 egg'),
  item('Minestrone soup', 'Italian', 'lunch', 'veg', 300, 11, 45, 8, '1 bowl minestrone'),
  item('Caprese salad with bread', 'Italian', 'lunch', 'veg', 420, 14, 40, 22, '1 caprese salad with 1 slice bread'),
  item('Grilled chicken pasta', 'Italian', 'lunch', 'non-veg', 580, 38, 65, 18, '1 bowl pasta with grilled chicken'),
  item('Margherita pizza', 'Italian', 'dinner', 'veg', 560, 22, 70, 22, '2 slices margherita pizza'),
  item('Salmon with vegetables', 'Italian', 'dinner', 'non-veg', 480, 36, 20, 26, '1 salmon fillet with roasted vegetables'),
  item('Bruschetta', 'Italian', 'snack', 'veg', 180, 5, 22, 8, '2 bruschetta'),
  // Chinese
  item('Vegetable congee', 'Chinese', 'breakfast', 'veg', 220, 6, 40, 4, '1 bowl vegetable congee'),
  item('Vegetable fried rice', 'Chinese', 'lunch', 'veg', 480, 10, 75, 14, '1 plate vegetable fried rice'),
  item('Chicken chow mein', 'Chinese', 'lunch', 'non-veg', 520, 26, 60, 18, '1 plate chicken chow mein'),
  item('Tofu stir-fry with rice', 'Chinese', 'lunch', 'veg', 420, 20, 50, 14, '1 cup tofu stir-fry with 1 cup rice'),
  item('Vegetable manchurian', 'Chinese', 'dinner', 'veg', 440, 9, 50, 20, '6 manchurian balls with gravy'),
  item('Chicken hot and sour soup', 'Chinese', 'dinner', 'non-veg', 180, 14, 12, 7, '1 bowl hot and sour soup'),
  item('Steamed edamame', 'Chinese', 'snack', 'veg', 190, 17, 14, 8, '1 cup edamame'),
  // Mexican
  item('Vegetable breakfast burrito', 'Mexican', 'breakfast', 'veg', 450, 16, 55, 18, '1 burrito with beans and vegetables'),
  item('Scrambled eggs with black beans', 'Mexican', 'breakfast', 'non-veg', 380, 24, 28, 18, '2 eggs with 1/2 cup black beans'),
  item('Veg burrito bowl', 'Mexican', 'lunch', 'veg', 560, 18, 80, 18, '1 bowl rice, beans, salsa and vegetables'),
  item('Chicken burrito bowl', 'Mexican', 'lunch', 'non-veg', 620, 40, 65, 20, '1 bowl rice, chicken, beans and salsa'),
  item('Vegetable quesadilla', 'Mexican', 'dinner', 'veg', 520, 20, 50, 26, '1 quesadilla with vegetables and cheese'),
  item('Fish tacos', 'Mexican', 'dinner', 'non-veg', 460, 28, 45, 16, '2 fish tacos'),
  item('Guacamole with chips', 'Mexican', 'snack', 'veg', 320, 4, 35, 18, '1/2 cup guacamole with 20 chips'),
  // Japanese
  item('Miso soup with rice', 'Japanese', 'breakfast', 'veg', 280, 10, 50, 4, '1 bowl miso soup with 1 cup rice'),
  item('Vegetable sushi rolls', 'Japanese', 'lunch', 'veg', 380, 10, 70, 6, '8 pieces vegetable sushi'),
  item('Chicken teriyaki bowl', 'Japanese', 'lunch', 'non-veg', 600, 36, 80, 14, '1 bowl rice with chicken teriyaki'),
  item('Tofu ramen', 'Japanese', 'dinner', 'veg', 480, 22, 65, 14, '1 bowl tofu ramen'),
  item('Salmon sushi set', 'Japanese', 'dinner', 'non-veg', 500, 30, 60, 12, '8 pieces salmon sushi'),
  item('Edamame', 'Japanese', 'snack', 'veg', 190, 17, 14, 8, '1 cup edamame with salt'),
];

// Returns the menu items that match the choices. Non-veg choices include vegetarian items too.
export function matchingMeals({ diet, meal, cuisine }) {
  return MENU.filter(m =>
    m.meal === meal &&
    (!cuisine || cuisine === 'any' || m.cuisine.toLowerCase() === cuisine.toLowerCase()) &&
    (diet === 'non-veg' || m.diet === 'veg'));
}
