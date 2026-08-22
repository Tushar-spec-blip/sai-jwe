const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./src/database/db');

const customersRouter = require('./src/routes/customers');
const productsRouter = require('./src/routes/products');
const invoicesRouter = require('./src/routes/invoices');
const metalRatesRouter = require('./src/routes/metalRates');
const settingsRouter = require('./src/routes/settings');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', customersRouter);
app.use('/api/products', productsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/metal-rates', metalRatesRouter);
app.use('/api/settings', settingsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Sri Sai Jewels API running', version: '1.0.0' });
});

// Start server after DB is ready
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n╔════════════════════════════════════╗`);
    console.log(`║   Sri Sai Jewels API Server        ║`);
    console.log(`║   Running at http://localhost:${PORT}  ║`);
    console.log(`╚════════════════════════════════════╝\n`);
  });
}).catch((err) => {
  console.error('[ERROR] Failed to initialize database:', err);
  process.exit(1);
});
