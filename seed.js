const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');
const ServiceArea = require('./models/ServiceArea');
const Offer = require('./models/Offer');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, {
    tls: true,
  });
  console.log('Connected to MongoDB');

  // Clear existing data
  await Restaurant.deleteMany({});
  await MenuItem.deleteMany({});
  await ServiceArea.deleteMany({});
  await Offer.deleteMany({});
  console.log('Cleared existing data');

  // Service Areas
  const areas = await ServiceArea.insertMany([
    { name: 'Choudwar', active: true },
    { name: 'Jobra', active: true },
    { name: 'Niali', active: true },
    { name: 'Tarapur', active: true },
    { name: 'Kandarpur', active: true },
    { name: 'Badambadi', active: true },
    { name: 'Jagatpur', active: true },
  ]);
  console.log(`✅ ${areas.length} service areas added`);

  // Restaurants
  const restaurants = await Restaurant.insertMany([
    { name: 'Hotel Biryani Palace', address: 'Main Road, Choudwar', area: 'Choudwar', category: 'Biryani & Rice', rating: 4.5, deliveryTime: '25-35 min', isOpen: true },
    { name: 'Swagat Fast Food', address: 'Market Complex, Choudwar', area: 'Choudwar', category: 'Fast Food', rating: 4.2, deliveryTime: '20-30 min', isOpen: true },
    { name: 'Shree Jagannath Dhaba', address: 'NH 16, Jobra', area: 'Jobra', category: 'Odia Cuisine', rating: 4.7, deliveryTime: '30-40 min', isOpen: true },
    { name: 'Dilli Corner', address: 'Bypass Road, Badambadi', area: 'Badambadi', category: 'North Indian', rating: 4.0, deliveryTime: '35-45 min', isOpen: true },
    { name: 'Mama Momos', address: 'Station Road, Choudwar', area: 'Choudwar', category: 'Chinese & Momos', rating: 4.3, deliveryTime: '20-25 min', isOpen: true },
  ]);
  console.log(`✅ ${restaurants.length} restaurants added`);

  // Menu Items
  const [biryani, swagat, jagannath, dilli, mama] = restaurants;

  await MenuItem.insertMany([
    // Biryani Palace
    { restaurantId: biryani._id, name: 'Chicken Biryani', description: 'Aromatic long-grain rice with tender chicken', price: 150, category: 'Biryani', isVeg: false },
    { restaurantId: biryani._id, name: 'Mutton Biryani', description: 'Slow-cooked mutton with spiced rice', price: 200, category: 'Biryani', isVeg: false },
    { restaurantId: biryani._id, name: 'Veg Biryani', description: 'Fragrant rice with seasonal vegetables', price: 100, category: 'Biryani', isVeg: true },
    { restaurantId: biryani._id, name: 'Raita', description: 'Chilled yogurt with cucumber', price: 30, category: 'Sides', isVeg: true },
    { restaurantId: biryani._id, name: 'Soft Drink', description: 'Chilled 300ml bottle', price: 40, category: 'Beverages', isVeg: true },

    // Swagat Fast Food
    { restaurantId: swagat._id, name: 'Chicken Burger', description: 'Crispy fried chicken with lettuce & sauce', price: 80, category: 'Burgers', isVeg: false },
    { restaurantId: swagat._id, name: 'Veg Burger', description: 'Aloo tikki with fresh veggies', price: 60, category: 'Burgers', isVeg: true },
    { restaurantId: swagat._id, name: 'French Fries', description: 'Crispy salted fries', price: 50, category: 'Snacks', isVeg: true },
    { restaurantId: swagat._id, name: 'Chicken Roll', description: 'Chicken tikka wrapped in paratha', price: 70, category: 'Rolls', isVeg: false },
    { restaurantId: swagat._id, name: 'Cold Coffee', description: 'Creamy blended cold coffee', price: 60, category: 'Beverages', isVeg: true },

    // Jagannath Dhaba
    { restaurantId: jagannath._id, name: 'Dalma', description: 'Traditional Odia lentil & vegetable curry', price: 80, category: 'Odia Special', isVeg: true },
    { restaurantId: jagannath._id, name: 'Pakhala Bhata', description: 'Fermented rice with accompaniments', price: 70, category: 'Odia Special', isVeg: true },
    { restaurantId: jagannath._id, name: 'Mutton Curry', description: 'Spicy Odia style mutton gravy', price: 180, category: 'Main Course', isVeg: false },
    { restaurantId: jagannath._id, name: 'Fish Curry', description: 'Fresh rohu fish in mustard gravy', price: 120, category: 'Main Course', isVeg: false },
    { restaurantId: jagannath._id, name: 'Steamed Rice', description: 'Plain steamed white rice', price: 40, category: 'Staple', isVeg: true },

    // Dilli Corner
    { restaurantId: dilli._id, name: 'Butter Chicken', description: 'Creamy tomato chicken gravy', price: 160, category: 'Main Course', isVeg: false },
    { restaurantId: dilli._id, name: 'Dal Makhani', description: 'Slow-cooked black lentils in butter', price: 110, category: 'Main Course', isVeg: true },
    { restaurantId: dilli._id, name: 'Garlic Naan', description: 'Soft tandoor bread with garlic butter', price: 40, category: 'Bread', isVeg: true },
    { restaurantId: dilli._id, name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 130, category: 'Starters', isVeg: true },

    // Mama Momos
    { restaurantId: mama._id, name: 'Chicken Steam Momos (8 pcs)', description: 'Juicy chicken dumplings with chilli sauce', price: 90, category: 'Steam Momos', isVeg: false },
    { restaurantId: mama._id, name: 'Veg Steam Momos (8 pcs)', description: 'Veggies & paneer dumplings', price: 70, category: 'Steam Momos', isVeg: true },
    { restaurantId: mama._id, name: 'Chicken Fried Momos (8 pcs)', description: 'Crispy fried chicken momos', price: 100, category: 'Fried Momos', isVeg: false },
    { restaurantId: mama._id, name: 'Chilli Chicken', description: 'Indo-Chinese spicy dry chilli chicken', price: 120, category: 'Chinese', isVeg: false },
    { restaurantId: mama._id, name: 'Veg Noodles', description: 'Stir-fried noodles with vegetables', price: 80, category: 'Chinese', isVeg: true },
  ]);
  console.log('✅ Menu items added');

  // Sample Offers
  // Find Biryani item id for Sunday special
  const chickenBiryani = await MenuItem.findOne({ restaurantId: biryani._id, name: 'Chicken Biryani' });

  await Offer.insertMany([
    {
      title: 'Sunday Biryani Special',
      description: 'Get Chicken Biryani for only ₹80 every Sunday!',
      restaurantId: biryani._id,
      active: true,
      badgeColor: '#e63946',
      conditions: { daysOfWeek: [0], applicableItemIds: [chickenBiryani._id] },
      reward: { type: 'fixed_price', fixedPrice: 80 },
    },
    {
      title: 'Loyalty Reward',
      description: 'Order for 6 days in a row and get a Free Biryani on Sunday!',
      restaurantId: biryani._id,
      active: true,
      badgeColor: '#2a9d8f',
      conditions: { requiredConsecutiveDays: 6, daysOfWeek: [0] },
      reward: { type: 'free_item', freeItemName: 'Biryani' },
    },
  ]);
  console.log('✅ Sample offers added');

  console.log('\n🎉 Database seeded successfully!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
