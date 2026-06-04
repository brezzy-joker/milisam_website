// ============================================================
//  MILISAM ENTERPRISE — Node.js + Express + PostgreSQL Backend
//  File: server.js
//
//  SETUP:
//    npm install express pg cors dotenv
//    node server.js
// ============================================================

const express = require('express');
const { Pool }  = require('pg');
const cors      = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: '*',   // In production, change to your domain e.g. 'https://milisamenterprise.co.ke'
  methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));
app.use(express.json());

// ── PostgreSQL Connection Pool ──────────────────────────────
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'milisam_enterprise',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'samuel123',
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Test DB connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// ============================================================
//  HELPER: Input Validation
// ============================================================
function validateBooking(body) {
  const errors = [];
  if (!body.full_name || body.full_name.trim().length < 2)
    errors.push('full_name is required (min 2 characters)');
  if (!body.phone || body.phone.trim().length < 9)
    errors.push('phone is required (min 9 digits)');
  if (!body.service)
    errors.push('service is required');
  const allowed = ['cleaning', 'business', 'products', 'maintenance', 'other'];
  if (body.service && !allowed.includes(body.service))
    errors.push(`service must be one of: ${allowed.join(', ')}`);
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
    errors.push('email format is invalid');
  return errors;
}

// ============================================================
//  ROUTES
// ============================================================

// ── Health Check ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Milisam Enterprise API is running' });
});

// ── POST /bookings — Create a new booking ───────────────────
app.post('/bookings', async (req, res) => {
  const {
    full_name,
    phone,
    email,
    service,
    preferred_date,
    location,
    message
  } = req.body;

  // Validate
  const errors = validateBooking(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const result = await pool.query(
      `INSERT INTO bookings
         (full_name, phone, email, service, preferred_date, location, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, full_name, service, status, submitted_at`,
      [
        full_name.trim(),
        phone.trim(),
        email ? email.trim() : null,
        service,
        preferred_date || null,
        location ? location.trim() : null,
        message ? message.trim() : null
      ]
    );

    const booking = result.rows[0];
    console.log(`📋 New booking #${booking.id} — ${booking.full_name} — ${booking.service}`);

    res.status(201).json({
      success:    true,
      booking_id: `MIL-${String(booking.id).padStart(5, '0')}`,
      message:    'Booking received successfully. We will contact you within 1 hour.',
      data:       booking
    });

  } catch (err) {
    console.error('❌ Booking insert error:', err.message);
    res.status(500).json({ success: false, error: 'Server error. Please try again.' });
  }
});

// ── GET /bookings — List all bookings (admin) ───────────────
app.get('/bookings', async (req, res) => {
  const { status, service, limit = 50, offset = 0 } = req.query;

  let query  = 'SELECT * FROM bookings WHERE 1=1';
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }
  if (service) {
    params.push(service);
    query += ` AND service = $${params.length}`;
  }

  params.push(parseInt(limit));
  query += ` ORDER BY submitted_at DESC LIMIT $${params.length}`;

  params.push(parseInt(offset));
  query += ` OFFSET $${params.length}`;

  try {
    const result = await pool.query(query, params);
    res.json({
      success: true,
      count:   result.rowCount,
      data:    result.rows
    });
  } catch (err) {
    console.error('❌ Bookings fetch error:', err.message);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// ── GET /bookings/:id — Get single booking ──────────────────
app.get('/bookings/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, error: 'Booking not found.' });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('❌ Booking fetch error:', err.message);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// ── PATCH /bookings/:id/status — Update booking status ──────
app.patch('/bookings/:id/status', async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];

  if (!allowed.includes(status))
    return res.status(400).json({
      success: false,
      error: `status must be one of: ${allowed.join(', ')}`
    });

  try {
    const result = await pool.query(
      `UPDATE bookings SET status = $1 WHERE id = $2
       RETURNING id, full_name, service, status, updated_at`,
      [status, req.params.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, error: 'Booking not found.' });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('❌ Status update error:', err.message);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// ── GET /services — List active services ────────────────────
app.get('/services', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM services WHERE is_active = TRUE ORDER BY id'
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('❌ Services fetch error:', err.message);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// ── POST /contacts — General enquiry ────────────────────────
app.post('/contacts', async (req, res) => {
  const { full_name, phone, email, subject, message } = req.body;

  if (!full_name || !email || !message)
    return res.status(400).json({
      success: false,
      error: 'full_name, email and message are required.'
    });

  try {
    const result = await pool.query(
      `INSERT INTO contacts (full_name, phone, email, subject, message)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
      [full_name.trim(), phone || null, email.trim(), subject || null, message.trim()]
    );
    res.status(201).json({
      success: true,
      message: 'Enquiry received. We will get back to you shortly.',
      data:    result.rows[0]
    });
  } catch (err) {
    console.error('❌ Contact insert error:', err.message);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Milisam API running on http://localhost:${PORT}`);
});