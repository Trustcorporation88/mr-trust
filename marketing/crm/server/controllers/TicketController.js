import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const getTickets = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority, customer_id, assigned_to } = req.query;
    const offset = (page - 1) * limit;
    const companyId = req.user.companyId;

    let query = 'SELECT * FROM tickets WHERE company_id = $1';
    const params = [companyId];
    let paramCount = 2;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    } else {
      // Default: show open and in_progress tickets
      query += ` AND status IN ($${paramCount}, $${paramCount + 1})`;
      params.push('open', 'in_progress');
      paramCount += 2;
    }

    if (priority) {
      query += ` AND priority = $${paramCount}`;
      params.push(priority);
      paramCount++;
    }

    if (customer_id) {
      query += ` AND customer_id = $${paramCount}`;
      params.push(customer_id);
      paramCount++;
    }

    if (assigned_to) {
      query += ` AND assigned_to = $${paramCount}`;
      params.push(assigned_to);
      paramCount++;
    }

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM tickets WHERE company_id = $1`,
      [companyId]
    );
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results with SLA status
    const result = await pool.query(
      query + ` ORDER BY priority DESC, created_at ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    // Add SLA status to each ticket
    const ticketsWithSLA = result.rows.map(ticket => {
      const now = new Date();
      const deadline = new Date(ticket.sla_deadline);
      const remaining = Math.max(0, Math.floor((deadline - now) / 1000 / 60)); // minutes
      const isOverdue = now > deadline;

      return {
        ...ticket,
        sla_remaining_minutes: remaining,
        sla_is_overdue: isOverdue,
        sla_status: isOverdue ? 'overdue' : remaining < 60 ? 'warning' : 'ok'
      };
    });

    res.json({
      data: ticketsWithSLA,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('getTickets error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const result = await pool.query(
      'SELECT * FROM tickets WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const ticket = result.rows[0];
    const now = new Date();
    const deadline = new Date(ticket.sla_deadline);
    const remaining = Math.max(0, Math.floor((deadline - now) / 1000 / 60));
    const isOverdue = now > deadline;

    res.json({
      ticket: {
        ...ticket,
        sla_remaining_minutes: remaining,
        sla_is_overdue: isOverdue,
        sla_status: isOverdue ? 'overdue' : remaining < 60 ? 'warning' : 'ok'
      }
    });
  } catch (err) {
    console.error('getTicketById error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const createTicket = async (req, res) => {
  try {
    const { title, customer_id, priority, description, assigned_to } = req.body;
    const companyId = req.user.companyId;
    const ticketId = uuidv4();

    if (!title || !customer_id) {
      return res.status(400).json({ error: 'title and customer_id are required' });
    }

    // SLA deadline based on priority (hours)
    const slaDurationHours = priority === 'high' ? 4 : priority === 'medium' ? 24 : 72;
    const slaDeadline = new Date(Date.now() + slaDurationHours * 60 * 60 * 1000);

    const result = await pool.query(
      `INSERT INTO tickets (id, company_id, customer_id, title, priority, description, assigned_to, sla_deadline, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [ticketId, companyId, customer_id, title, priority || 'medium', description, assigned_to, slaDeadline, 'open']
    );

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: result.rows[0]
    });
  } catch (err) {
    console.error('createTicket error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const updateData = req.body;

    const allowedFields = ['title', 'priority', 'description', 'assigned_to', 'status'];
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
      `UPDATE tickets SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({
      message: 'Ticket updated successfully',
      ticket: result.rows[0]
    });
  } catch (err) {
    console.error('updateTicket error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const resolveTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution_notes } = req.body;
    const companyId = req.user.companyId;

    const result = await pool.query(
      `UPDATE tickets SET status = $1, description = CONCAT(description, E'\n\n--- RESOLUTION ---\n', $2), updated_at = NOW()
       WHERE id = $3 AND company_id = $4
       RETURNING *`,
      ['resolved', resolution_notes || 'Ticket resolved', id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({
      message: 'Ticket resolved successfully',
      ticket: result.rows[0]
    });
  } catch (err) {
    console.error('resolveTicket error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const submitCSAT = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comments } = req.body;
    const companyId = req.user.companyId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }

    const result = await pool.query(
      `UPDATE tickets SET status = $1, csat_rating = $2, csat_comments = $3, updated_at = NOW()
       WHERE id = $4 AND company_id = $5
       RETURNING *`,
      ['closed', rating, comments || '', id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({
      message: 'CSAT rating submitted',
      ticket: result.rows[0]
    });
  } catch (err) {
    console.error('submitCSAT error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getTicketMetrics = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    // Total metrics
    const metricsResult = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'open') as open_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COUNT(*) FILTER (WHERE status = 'closed') as closed_count,
        COUNT(*) FILTER (WHERE sla_deadline < NOW() AND status NOT IN ('resolved', 'closed')) as overdue_count,
        AVG(csat_rating) FILTER (WHERE csat_rating IS NOT NULL) as avg_csat
       FROM tickets
       WHERE company_id = $1`,
      [companyId]
    );

    const metrics = metricsResult.rows[0];

    // SLA compliance
    const slaResult = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE sla_deadline >= updated_at) as compliant
       FROM tickets
       WHERE company_id = $1 AND status IN ('resolved', 'closed')`,
      [companyId]
    );

    const slaCompliance = slaResult.rows[0];
    const complianceRate = slaCompliance.total > 0 
      ? Math.round((slaCompliance.compliant / slaCompliance.total) * 100)
      : 100;

    res.json({
      open: parseInt(metrics.open_count),
      in_progress: parseInt(metrics.in_progress_count),
      resolved: parseInt(metrics.resolved_count),
      closed: parseInt(metrics.closed_count),
      overdue: parseInt(metrics.overdue_count),
      avg_csat: Math.round(parseFloat(metrics.avg_csat) * 10) / 10,
      sla_compliance_rate: complianceRate
    });
  } catch (err) {
    console.error('getTicketMetrics error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const result = await pool.query(
      'DELETE FROM tickets WHERE id = $1 AND company_id = $2 RETURNING id',
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    console.error('deleteTicket error:', err);
    res.status(500).json({ error: err.message });
  }
};
