import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, segment, owner_id } = req.query;
    const offset = (page - 1) * limit;
    const companyId = req.user.companyId;

    let query = 'SELECT * FROM customers WHERE company_id = $1 AND is_active = true';
    const params = [companyId];
    let paramCount = 2;

    // Search
    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Filter by segment
    if (segment) {
      query += ` AND segment = $${paramCount}`;
      params.push(segment);
      paramCount++;
    }

    // Filter by owner
    if (owner_id) {
      query += ` AND owner_id = $${paramCount}`;
      params.push(owner_id);
      paramCount++;
    }

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM customers WHERE company_id = $1 AND is_active = true`,
      [companyId]
    );
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const result = await pool.query(
      query + ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    res.json({
      data: result.rows,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('getCustomers error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    // Get customer
    const customerResult = await pool.query(
      'SELECT * FROM customers WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = customerResult.rows[0];

    // Get recent interactions
    const interactionsResult = await pool.query(
      'SELECT * FROM interactions WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 10',
      [id]
    );

    // Get active deals
    const dealsResult = await pool.query(
      'SELECT * FROM deals WHERE customer_id = $1 AND status = $2 ORDER BY expected_close_date ASC',
      [id, 'open']
    );

    // Get open tickets
    const ticketsResult = await pool.query(
      'SELECT * FROM tickets WHERE customer_id = $1 AND status IN ($2, $3) ORDER BY created_at DESC LIMIT 5',
      [id, 'open', 'in_progress']
    );

    res.json({
      customer,
      interactions: interactionsResult.rows,
      deals: dealsResult.rows,
      tickets: ticketsResult.rows
    });
  } catch (err) {
    console.error('getCustomerById error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, segment, owner_id } = req.body;
    const companyId = req.user.companyId;
    const customerId = uuidv4();

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await pool.query(
      `INSERT INTO customers (id, company_id, name, email, phone, segment, owner_id, health_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 50)
       RETURNING *`,
      [customerId, companyId, name, email, phone, segment, owner_id]
    );

    res.status(201).json({
      message: 'Customer created successfully',
      customer: result.rows[0]
    });
  } catch (err) {
    console.error('createCustomer error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const updateData = req.body;

    // Build dynamic update query
    const allowedFields = ['name', 'email', 'phone', 'segment', 'industry', 'health_score', 'owner_id'];
    const updates = [];
    const values = [id, companyId];
    let paramCount = 3;

    for (const field of allowedFields) {
      if (field in updateData) {
        updates.push(`${field} = $${paramCount}`);
        values.push(updateData[field]);
        paramCount++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const result = await pool.query(
      `UPDATE customers SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({
      message: 'Customer updated successfully',
      customer: result.rows[0]
    });
  } catch (err) {
    console.error('updateCustomer error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const result = await pool.query(
      'UPDATE customers SET is_active = false, updated_at = NOW() WHERE id = $1 AND company_id = $2 RETURNING id',
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('deleteCustomer error:', err);
    res.status(500).json({ error: err.message });
  }
};
