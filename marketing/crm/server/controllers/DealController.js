import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const getDeals = async (req, res) => {
  try {
    const { page = 1, limit = 20, stage, customer_id, owner_id } = req.query;
    const offset = (page - 1) * limit;
    const companyId = req.user.companyId;

    let query = 'SELECT * FROM deals WHERE company_id = $1 AND status = $2';
    const params = [companyId, 'open'];
    let paramCount = 3;

    if (stage) {
      query += ` AND stage = $${paramCount}`;
      params.push(stage);
      paramCount++;
    }

    if (customer_id) {
      query += ` AND customer_id = $${paramCount}`;
      params.push(customer_id);
      paramCount++;
    }

    if (owner_id) {
      query += ` AND owner_id = $${paramCount}`;
      params.push(owner_id);
      paramCount++;
    }

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM deals WHERE company_id = $1 AND status = $2`,
      [companyId, 'open']
    );
    const total = parseInt(countResult.rows[0].total);

    // Get pipeline value sum
    const pipelineResult = await pool.query(
      `SELECT SUM(amount) as total_pipeline_value FROM deals WHERE company_id = $1 AND status = $2`,
      [companyId, 'open']
    );
    const pipelineValue = pipelineResult.rows[0].total_pipeline_value || 0;

    // Get paginated results
    const result = await pool.query(
      query + ` ORDER BY expected_close_date ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    res.json({
      data: result.rows,
      total,
      pipeline_value: pipelineValue,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('getDeals error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getDealById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const result = await pool.query(
      'SELECT * FROM deals WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json({ deal: result.rows[0] });
  } catch (err) {
    console.error('getDealById error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const createDeal = async (req, res) => {
  try {
    const { title, customer_id, amount, stage, expected_close_date, owner_id, description } = req.body;
    const companyId = req.user.companyId;
    const dealId = uuidv4();

    if (!title || !customer_id || !amount) {
      return res.status(400).json({ error: 'title, customer_id, and amount are required' });
    }

    const result = await pool.query(
      `INSERT INTO deals (id, company_id, customer_id, title, amount, stage, expected_close_date, owner_id, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [dealId, companyId, customer_id, title, amount, stage || 'Prospecção', expected_close_date || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], owner_id || req.user.id, description, 'open']
    );

    res.status(201).json({
      message: 'Deal created successfully',
      deal: result.rows[0]
    });
  } catch (err) {
    console.error('createDeal error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const updateData = req.body;

    const allowedFields = ['title', 'amount', 'stage', 'expected_close_date', 'owner_id', 'description', 'probability'];
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
      `UPDATE deals SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json({
      message: 'Deal updated successfully',
      deal: result.rows[0]
    });
  } catch (err) {
    console.error('updateDeal error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const changeStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const companyId = req.user.companyId;

    const validStages = ['Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechado'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage' });
    }

    const result = await pool.query(
      `UPDATE deals SET stage = $1, updated_at = NOW()
       WHERE id = $2 AND company_id = $3
       RETURNING *`,
      [stage, id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json({
      message: 'Stage changed successfully',
      deal: result.rows[0]
    });
  } catch (err) {
    console.error('changeStage error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const markAsWon = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const result = await pool.query(
      `UPDATE deals SET status = $1, stage = $2, updated_at = NOW()
       WHERE id = $3 AND company_id = $4
       RETURNING *`,
      ['won', 'Fechado', id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Update customer health score
    const deal = result.rows[0];
    await pool.query(
      `UPDATE customers SET health_score = LEAST(100, health_score + 10) 
       WHERE id = $1 AND company_id = $2`,
      [deal.customer_id, companyId]
    );

    res.json({
      message: 'Deal marked as won',
      deal: result.rows[0]
    });
  } catch (err) {
    console.error('markAsWon error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const markAsLost = async (req, res) => {
  try {
    const { id } = req.params;
    const { lost_reason } = req.body;
    const companyId = req.user.companyId;

    const result = await pool.query(
      `UPDATE deals SET status = $1, description = $2, updated_at = NOW()
       WHERE id = $3 AND company_id = $4
       RETURNING *`,
      ['lost', lost_reason || 'Perdido', id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Update customer health score (decrease)
    const deal = result.rows[0];
    await pool.query(
      `UPDATE customers SET health_score = GREATEST(0, health_score - 15) 
       WHERE id = $1 AND company_id = $2`,
      [deal.customer_id, companyId]
    );

    res.json({
      message: 'Deal marked as lost',
      deal: result.rows[0]
    });
  } catch (err) {
    console.error('markAsLost error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getDealsGroupedByStage = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const result = await pool.query(
      `SELECT stage, COUNT(*) as count, SUM(amount) as value
       FROM deals
       WHERE company_id = $1 AND status = $2
       GROUP BY stage
       ORDER BY 
         CASE stage
           WHEN 'Prospecção' THEN 1
           WHEN 'Qualificação' THEN 2
           WHEN 'Proposta' THEN 3
           WHEN 'Negociação' THEN 4
           WHEN 'Fechado' THEN 5
         END`,
      [companyId, 'open']
    );

    res.json({
      stages: result.rows
    });
  } catch (err) {
    console.error('getDealsGroupedByStage error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const result = await pool.query(
      'DELETE FROM deals WHERE id = $1 AND company_id = $2 RETURNING id',
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json({ message: 'Deal deleted successfully' });
  } catch (err) {
    console.error('deleteDeal error:', err);
    res.status(500).json({ error: err.message });
  }
};
