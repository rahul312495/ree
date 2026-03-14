require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

async function seed() {
  await connectDB();
  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  console.log('🗑️  Cleared collections');

  // Admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@freshmart.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1-555-0100',
    address: '1 FreshMart HQ, Market Street',
  });

  // Customers
  const customerData = [
    { name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-0101', address: '12 Oak Lane, Springfield' },
    { name: 'Bob Martinez', email: 'bob@example.com', phone: '+1-555-0102', address: '34 Elm Street, Riverside' },
    { name: 'Carol White', email: 'carol@example.com', phone: '+1-555-0103', address: '56 Pine Ave, Lakewood' },
    { name: 'David Chen', email: 'david@example.com', phone: '+1-555-0104', address: '78 Maple Blvd, Hillside' },
    { name: 'Eva Rodriguez', email: 'eva@example.com', phone: '+1-555-0105', address: '90 Cedar Rd, Maplewood' },
    { name: 'Frank Kim', email: 'frank@example.com', phone: '+1-555-0106', address: '11 Birch Court, Oakdale' },
  ];
  const customers = await User.insertMany(
    customerData.map((c) => ({ ...c, password: 'password123', role: 'customer' }))
  );
  console.log(`✅ ${customers.length + 1} users created (1 admin + ${customers.length} customers)`);

  // Products
  const productsData = [
    { name: 'Organic Apples', category: 'Fruits', price: 3.99, stock: 150, unit: 'kg', emoji: '🍎', description: 'Fresh Gala apples, locally sourced' },
    { name: 'Bananas', category: 'Fruits', price: 1.49, stock: 200, unit: 'kg', emoji: '🍌', description: 'Ripe yellow bananas' },
    { name: 'Strawberries', category: 'Fruits', price: 4.99, stock: 80, unit: 'pack', emoji: '🍓', description: 'Sweet summer strawberries, 500g pack' },
    { name: 'Oranges', category: 'Fruits', price: 2.99, stock: 120, unit: 'kg', emoji: '🍊', description: 'Navel oranges, seedless' },
    { name: 'Grapes', category: 'Fruits', price: 5.49, stock: 60, unit: 'kg', emoji: '🍇', description: 'Red seedless grapes' },
    { name: 'Broccoli', category: 'Vegetables', price: 2.49, stock: 90, unit: 'pcs', emoji: '🥦', description: 'Fresh organic broccoli head' },
    { name: 'Carrots', category: 'Vegetables', price: 1.99, stock: 180, unit: 'kg', emoji: '🥕', description: 'Baby carrots, washed and ready to eat' },
    { name: 'Spinach', category: 'Vegetables', price: 3.29, stock: 70, unit: 'pack', emoji: '🥬', description: 'Baby spinach, 200g bag' },
    { name: 'Tomatoes', category: 'Vegetables', price: 3.49, stock: 110, unit: 'kg', emoji: '🍅', description: 'Vine-ripened tomatoes' },
    { name: 'Bell Peppers', category: 'Vegetables', price: 4.99, stock: 55, unit: 'pack', emoji: '🫑', description: 'Tri-color peppers, 3-pack' },
    { name: 'Whole Milk', category: 'Dairy', price: 2.99, stock: 95, unit: 'l', emoji: '🥛', description: 'Full-fat fresh milk, 1L' },
    { name: 'Cheddar Cheese', category: 'Dairy', price: 6.49, stock: 45, unit: 'pack', emoji: '🧀', description: 'Mature cheddar, 400g block' },
    { name: 'Greek Yogurt', category: 'Dairy', price: 3.79, stock: 80, unit: 'pcs', emoji: '🫙', description: 'Plain full-fat Greek yogurt, 500g' },
    { name: 'Butter', category: 'Dairy', price: 4.29, stock: 65, unit: 'pack', emoji: '🧈', description: 'Unsalted European-style butter, 250g' },
    { name: 'Sourdough Bread', category: 'Bakery', price: 5.99, stock: 30, unit: 'pcs', emoji: '🍞', description: 'Artisan sourdough loaf, baked fresh daily' },
    { name: 'Croissants', category: 'Bakery', price: 4.49, stock: 40, unit: 'pack', emoji: '🥐', description: 'Butter croissants, pack of 4' },
    { name: 'Whole Wheat Bread', category: 'Bakery', price: 3.99, stock: 50, unit: 'pcs', emoji: '🥖', description: 'Seeded whole wheat loaf' },
    { name: 'Chicken Breast', category: 'Meat & Seafood', price: 9.99, stock: 40, unit: 'kg', emoji: '🍗', description: 'Free-range boneless chicken breast' },
    { name: 'Atlantic Salmon', category: 'Meat & Seafood', price: 14.99, stock: 25, unit: 'kg', emoji: '🐟', description: 'Fresh Atlantic salmon fillet' },
    { name: 'Orange Juice', category: 'Beverages', price: 3.99, stock: 75, unit: 'l', emoji: '🍊', description: 'Freshly squeezed, no added sugar, 1L' },
    { name: 'Sparkling Water', category: 'Beverages', price: 1.99, stock: 200, unit: 'l', emoji: '💧', description: 'Natural mineral water, 1.5L' },
    { name: 'Green Tea', category: 'Beverages', price: 4.99, stock: 60, unit: 'pack', emoji: '🍵', description: 'Japanese green tea, 25 bags' },
    { name: 'Mixed Nuts', category: 'Snacks', price: 8.99, stock: 55, unit: 'pack', emoji: '🥜', description: 'Premium mixed nuts, 400g bag, unsalted' },
    { name: 'Dark Chocolate', category: 'Snacks', price: 3.49, stock: 90, unit: 'pcs', emoji: '🍫', description: '72% dark chocolate bar, 100g' },
    { name: 'Olive Oil', category: 'Pantry', price: 11.99, stock: 35, unit: 'l', emoji: '🫒', description: 'Extra virgin, cold-pressed, 500ml' },
    { name: 'Basmati Rice', category: 'Pantry', price: 6.99, stock: 120, unit: 'kg', emoji: '🍚', description: 'Premium aged Basmati rice, 2kg bag' },
    { name: 'Pasta', category: 'Pantry', price: 2.49, stock: 150, unit: 'pack', emoji: '🍝', description: 'Bronze-die spaghetti, 500g' },
  ];
  const products = await Product.insertMany(productsData);
  console.log(`✅ ${products.length} products created`);

  // Orders — generate over last 7 days
  const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Delivered', 'Delivered'];
  const orders = [];
  for (let day = 6; day >= 0; day--) {
    const ordersPerDay = Math.floor(Math.random() * 4) + 2;
    for (let o = 0; o < ordersPerDay; o++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const numItems = Math.floor(Math.random() * 4) + 1;
      const selectedProducts = products.sort(() => 0.5 - Math.random()).slice(0, numItems);
      const items = selectedProducts.map((p) => ({
        product: p._id,
        name: p.name,
        emoji: p.emoji,
        price: p.price,
        quantity: Math.floor(Math.random() * 3) + 1,
      }));
      const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const date = new Date();
      date.setDate(date.getDate() - day);
      date.setHours(Math.floor(Math.random() * 14) + 8);
      orders.push({
        orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
        customer: customer._id,
        items,
        totalAmount: Math.round(totalAmount * 100) / 100,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        deliveryAddress: customer.address,
        createdAt: date,
        updatedAt: date,
      });
    }
  }
  await Order.insertMany(orders);
  console.log(`✅ ${orders.length} orders created`);

  console.log('\n🌱 Database seeded!');
  console.log('----------------------------');
  console.log('Admin login:');
  console.log('  Email:    admin@freshmart.com');
  console.log('  Password: admin123');
  console.log('----------------------------');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
