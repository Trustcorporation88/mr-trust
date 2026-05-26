import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const getCampaigns = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const offset = (page - 1) * limit;
    const companyId = req.user.companyId;

    let query = 'SELECT * FROM campaigns WHERE company_id = $1';
    const params = [companyId];
    let paramCount = 2;

    if (type) {
      query += ` AND type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM campaigns WHERE company_id = $1`,
      [companyId]
    );
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results with ROI calculation
    const result = await pool.query(
      query + ` ORDER BY start_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    // Calculate ROI for each campaign
    const campaignsWithROI = result.rows.map(campaign => {
      const roi = campaign.budget && campaign.revenue
        ? Math.round(((campaign.revenue - campaign.budget) / campaign.budget) * 100)
        : 0;

      return {
        ...campaign,
        roi_percentage: roi,
        roi_amount: campaign.revenue - campaign.budget
      };
    });

    res.json({
      data: campaignsWithROI,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('getCampaigns error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const result = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = result.rows[0];
    const roi = campaign.budget && campaign.revenue
      ? Math.round(((campaign.revenue - campaign.budget) / campaign.budget) * 100)
      : 0;

    // Get leads/contacts created from this campaign
    const leadsResult = await pool.query(
      `SELECT COUNT(*) as total_leads,
              COUNT(*) FILTER (WHERE status IN ('Qualificação', 'Proposta', 'Negociação', 'Fechado')) as qualified_leads
       FROM deals
       WHERE campaign_id = $1`,
      [id]
    );

    const leads = leadsResult.rows[0];

    res.json({
      campaign: {
        ...campaign,
        roi_percentage: roi,
        roi_amount: campaign.revenue - campaign.budget,
        conversion_rate: leads.total_leads > 0 
          ? Math.round((leads.qualified_leads / leads.total_leads) * 100)
          : 0,
        leads_generated: leads.total_leads,
        qualified_leads: leads.qualified_leads
      }
    });
  } catch (err) {
    console.error('getCampaignById error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const { name, type, description, start_date, end_date, budget, channel } = req.body;
    const companyId = req.user.companyId;
    const campaignId = uuidv4();

    if (!name || !type || !budget) {
      return res.status(400).json({ error: 'name, type, and budget are required' });
    }

    const result = await pool.query(
      `INSERT INTO campaigns (id, company_id, name, type, description, start_date, end_date, budget, channel, status, revenue)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        campaignId,
        companyId,
        name,
        type, // email, sms, social, content, event, webinar, ads
        description,
        start_date || new Date().toISOString().split('T')[0],
        end_date || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        budget,
        channel || 'direct',
        'active',
        0 // initial revenue
      ]
    );

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign: result.rows[0]
    });
  } catch (err) {
    console.error('createCampaign error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const updateData = req.body;

    const allowedFields = ['name', 'description', 'type', 'start_date', 'end_date', 'budget', 'channel', 'status', 'revenue'];
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
      `UPDATE campaigns SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({
      message: 'Campaign updated successfully',
      campaign: result.rows[0]
    });
  } catch (err) {
    console.error('updateCampaign error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getCampaignROI = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const result = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = result.rows[0];

    // Get conversion metrics
    const metricsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_leads,
        COUNT(*) FILTER (WHERE status IN ('Qualificação', 'Proposta', 'Negociação')) as pipeline_leads,
        COUNT(*) FILTER (WHERE status = 'Fechado') as closed_deals,
        SUM(amount) FILTER (WHERE status = 'Fechado') as closed_value
       FROM deals
       WHERE campaign_id = $1`,
      [id]
    );

    const metrics = metricsResult.rows[0];
    const totalLeads = parseInt(metrics.total_leads) || 0;
    const closedValue = parseInt(metrics.closed_value) || 0;

    const roi = campaign.budget && closedValue
      ? Math.round(((closedValue - campaign.budget) / campaign.budget) * 100)
      : 0;

    const costPerLead = totalLeads > 0 ? (campaign.budget / totalLeads) : 0;
    const costPerDeal = parseInt(metrics.closed_deals) > 0
      ? (campaign.budget / parseInt(metrics.closed_deals))
      : 0;

    res.json({
      campaign_name: campaign.name,
      budget: campaign.budget,
      revenue: campaign.revenue || 0,
      total_leads: totalLeads,
      pipeline_leads: parseInt(metrics.pipeline_leads) || 0,
      closed_deals: parseInt(metrics.closed_deals) || 0,
      closed_value: closedValue,
      roi_percentage: roi,
      roi_amount: closedValue - campaign.budget,
      cost_per_lead: Math.round(costPerLead * 100) / 100,
      cost_per_deal: Math.round(costPerDeal * 100) / 100,
      conversion_rate: totalLeads > 0 
        ? Math.round((parseInt(metrics.closed_deals) / totalLeads) * 100)
        : 0
    });
  } catch (err) {
    console.error('getCampaignROI error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllCampaignsROI = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const result = await pool.query(
      `SELECT 
        c.id,
        c.name,
        c.type,
        c.budget,
        c.revenue,
        COUNT(d.id) as total_leads,
        COUNT(d.id) FILTER (WHERE d.status = 'Fechado') as closed_deals,
        SUM(d.amount) FILTER (WHERE d.status = 'Fechado') as closed_value
       FROM campaigns c
       LEFT JOIN deals d ON d.campaign_id = c.id
       WHERE c.company_id = $1
       GROUP BY c.id, c.name, c.type, c.budget, c.revenue
       ORDER BY c.start_date DESC`,
      [companyId]
    );

    const campaignsROI = result.rows.map(campaign => {
      const totalLeads = parseInt(campaign.total_leads) || 0;
      const closedValue = parseInt(campaign.closed_value) || 0;
      const roi = campaign.budget && closedValue
        ? Math.round(((closedValue - campaign.budget) / campaign.budget) * 100)
        : 0;

      return {
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        budget: campaign.budget,
        revenue: campaign.revenue || 0,
        total_leads: totalLeads,
        closed_deals: parseInt(campaign.closed_deals) || 0,
        closed_value: closedValue,
        roi_percentage: roi,
        roi_amount: closedValue - campaign.budget
      };
    });

    // Calculate totals
    const totals = {
      total_budget: campaignsROI.reduce((sum, c) => sum + c.budget, 0),
      total_revenue: campaignsROI.reduce((sum, c) => sum + c.revenue, 0),
      total_leads: campaignsROI.reduce((sum, c) => sum + c.total_leads, 0),
      total_closed_deals: campaignsROI.reduce((sum, c) => sum + c.closed_deals, 0),
      total_closed_value: campaignsROI.reduce((sum, c) => sum + c.closed_value, 0)
    };

    res.json({
      campaigns: campaignsROI,
      totals
    });
  } catch (err) {
    console.error('getAllCampaignsROI error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const result = await pool.query(
      'DELETE FROM campaigns WHERE id = $1 AND company_id = $2 RETURNING id',
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    console.error('deleteCampaign error:', err);
    res.status(500).json({ error: err.message });
  }
};
