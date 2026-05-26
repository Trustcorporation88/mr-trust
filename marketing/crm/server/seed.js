#!/usr/bin/env node

/**
 * Seed Database com dados demo para MEISHOP CRM
 */

import pool from './config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const seedData = async () => {
  try {
    console.log('========================================');
    console.log('  MEISHOP CRM - Seed Database');
    console.log('========================================');
    console.log('');

    // ============================================
    // 1. Criar ou obter Company
    // ============================================
    console.log('  -> Creating or finding company...');
    
    let companyId;
    const cnpj = '12345678000190';

    try {
      // Tentar encontrar company existente
      const existingCompany = await pool.query(
        'SELECT id FROM companies WHERE cnpj = $1',
        [cnpj]
      );

      if (existingCompany.rows.length > 0) {
        companyId = existingCompany.rows[0].id;
        console.log(`  [OK] Found existing company (ID: ${companyId.substring(0, 8)}...)`);
      } else {
        // Criar nova company
        companyId = uuidv4();
        await pool.query(
          `INSERT INTO companies (id, name, cnpj, website, industry, size, subscription_plan, subscription_start, subscription_end, is_active, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()::date, (NOW() + interval '1 year')::date, true, NOW())`,
          [
            companyId,
            'MEISHOP Demo',
            cnpj,
            'https://meishop.demo',
            'Technology',
            'medium',
            'professional'
          ]
        );
        console.log(`  [OK] Company created (ID: ${companyId.substring(0, 8)}...)`);
      }
    } catch (err) {
      console.error('  [ERROR]', err.message);
      throw err;
    }

    console.log('');

    // ============================================
    // 2. Criar ou obter Admin User
    // ============================================
    console.log('  -> Creating or finding admin user...');

    let userId;
    const adminEmail = 'admin@meishop.com';

    try {
      // Tentar encontrar user existente
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [adminEmail]
      );

      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
        console.log(`  [OK] Found existing admin user: ${adminEmail}`);
      } else {
        // Criar novo user
        userId = uuidv4();
        const passwordHash = await bcrypt.hash('admin123', 10);
        await pool.query(
          `INSERT INTO users (id, email, password_hash, full_name, role, company_id, department, is_active, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())`,
          [
            userId,
            adminEmail,
            passwordHash,
            'Admin User',
            'admin',
            companyId,
            'Management'
          ]
        );
        console.log(`  [OK] Admin user created: ${adminEmail}`);
        console.log(`       Password: admin123`);
      }
    } catch (err) {
      console.error('  [ERROR]', err.message);
      throw err;
    }

    console.log('');

    // ============================================
    // 2.5. Criar Demo Customers
    // ============================================
    console.log('  -> Creating demo customers...');

    const customerIds = [];
    const customers = [
      { name: 'Cliente A', email: 'cliente-a@email.com', phone: '11999999999', location: 'São Paulo' },
      { name: 'Cliente B', email: 'cliente-b@email.com', phone: '11988888888', location: 'Rio de Janeiro' },
      { name: 'Cliente C', email: 'cliente-c@email.com', phone: '11977777777', location: 'Belo Horizonte' },
      { name: 'Cliente D', email: 'cliente-d@email.com', phone: '11966666666', location: 'Salvador' }
    ];

    for (const customer of customers) {
      try {
        const customerId = uuidv4();
        await pool.query(
          `INSERT INTO customers (id, company_id, name, email, phone, location, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            customerId,
            companyId,
            customer.name,
            customer.email,
            customer.phone,
            customer.location
          ]
        );
        customerIds.push(customerId);
      } catch (err) {
        console.error(`    [WARN] Error creating customer: ${err.message}`);
      }
    }

    console.log(`  [OK] Created ${customerIds.length} demo customers`);
    console.log('');

    const dealStages = [
      { name: 'Lead Qualificado', stage: 'lead', amount: 15000, probability: 20 },
      { name: 'Proposta Enviada', stage: 'proposal', amount: 25000, probability: 50 },
      { name: 'Negociação', stage: 'negotiation', amount: 35000, probability: 70 },
      { name: 'Fechamento', stage: 'closing', amount: 50000, probability: 90 },
      { name: 'Ganho', stage: 'won', amount: 45000, probability: 100 }
    ];

    for (const deal of dealStages) {
      try {
        const dealId = uuidv4();
        // Usar customers criados, ciclando através deles
        const customerId = customerIds[dealStages.indexOf(deal) % customerIds.length];
        
        await pool.query(
          `INSERT INTO deals (id, company_id, customer_id, title, description, stage, amount, probability, currency, expected_close_date, owner_id, created_by_id, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()::date + interval '30 days', $10, $11, $12, NOW())`,
          [
            dealId,
            companyId,
            customerId,
            `Deal ${deal.name}`,
            `Demo deal in ${deal.name} stage`,
            deal.stage,
            deal.amount,
            deal.probability,
            'BRL',
            userId,
            userId,
            'open'
          ]
        );
      } catch (err) {
        console.error(`    [WARN] Error creating deal: ${err.message}`);
      }
    }

    console.log(`  [OK] Created ${dealStages.length} demo deals`);
    console.log('');

    // ============================================
    // 4. Criar Tickets Demo (Support Tickets)
    // ============================================
    console.log('  -> Creating demo tickets...');

    const tickets = [
      {
        title: 'Bug no Dashboard',
        description: 'Gráficos não estão carregando',
        priority: 'high',
        status: 'open',
        category: 'bug'
      },
      {
        title: 'Aumentar limite de usuários',
        description: 'Precisamos de mais 5 contas de usuário',
        priority: 'medium',
        status: 'open',
        category: 'feature'
      },
      {
        title: 'Integração com Mailchimp',
        description: 'Conectar API do Mailchimp',
        priority: 'low',
        status: 'pending',
        category: 'feature'
      },
      {
        title: 'Exportar relatório para Excel',
        description: 'Adicionar opção de export',
        priority: 'medium',
        status: 'resolved',
        category: 'feature'
      }
    ];

    for (const ticket of tickets) {
      try {
        const ticketId = uuidv4();
        // Usar customers criados, ciclando através deles
        const customerId = customerIds[tickets.indexOf(ticket) % customerIds.length];
        const slaHours = ticket.priority === 'high' ? 4 : ticket.priority === 'medium' ? 24 : 72;
        const dueDate = new Date(Date.now() + slaHours * 60 * 60 * 1000);

        await pool.query(
          `INSERT INTO tickets (id, company_id, customer_id, title, description, priority, status, category, assigned_to_id, created_by_id, sla_hours, due_date, channel, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())`,
          [
            ticketId,
            companyId,
            customerId,
            ticket.title,
            ticket.description,
            ticket.priority,
            ticket.status,
            ticket.category,
            userId,
            userId,
            slaHours,
            dueDate,
            'email'
          ]
        );
      } catch (err) {
        console.error(`    [WARN] Error creating ticket: ${err.message}`);
      }
    }

    console.log(`  [OK] Created ${tickets.length} demo tickets`);
    console.log('');

    // ============================================
    // 5. Criar Campaigns Demo (Marketing)
    // ============================================
    console.log('  -> Creating demo campaigns...');

    const campaigns = [
      {
        name: 'Email Marketing - Março',
        budget: 5000,
        revenue: 15000,
        leads: 120,
        deals: 8,
        type: 'email'
      },
      {
        name: 'Social Media - Abril',
        budget: 3000,
        revenue: 8000,
        leads: 85,
        deals: 4,
        type: 'social'
      },
      {
        name: 'Google Ads - Maio',
        budget: 7000,
        revenue: 21000,
        leads: 200,
        deals: 15,
        type: 'paid_search'
      },
      {
        name: 'Webinar - Evento Online',
        budget: 2000,
        revenue: 12000,
        leads: 95,
        deals: 7,
        type: 'webinar'
      }
    ];

    for (const campaign of campaigns) {
      try {
        const campaignId = uuidv4();
        await pool.query(
          `INSERT INTO campaigns (id, company_id, name, type, channel, budget, revenue_attributed, leads_generated, opportunities_created, currency, status, created_by_id, start_date, end_date, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()::date, (NOW() + interval '30 days')::date, NOW())`,
          [
            campaignId,
            companyId,
            campaign.name,
            campaign.type,
            campaign.type,
            campaign.budget,
            campaign.revenue,
            campaign.leads,
            campaign.deals,
            'BRL',
            'completed',
            userId
          ]
        );
      } catch (err) {
        // Ignorar duplicatas
      }
    }

    console.log(`  [OK] Created ${campaigns.length} demo campaigns`);
    console.log('');

    console.log('========================================');
    console.log('  SEED COMPLETED!');
    console.log('========================================');
    console.log('');
    console.log('Demo Credentials:');
    console.log('  Email:    admin@meishop.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('You can now:');
    console.log('  1. Login with demo credentials');
    console.log('  2. View deals in Kanban board');
    console.log('  3. Check tickets with SLA');
    console.log('  4. Analyze campaign performance');
    console.log('');

    process.exit(0);
  } catch (err) {
    console.error('');
    console.error('[ERROR]', err.message);
    console.error('');
    process.exit(1);
  }
};

seedData();
