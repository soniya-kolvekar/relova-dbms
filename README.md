# Relova DBMS — Industrial Surplus Material Exchange Platform

> **Academic DBMS Project | Circular Industrial Symbiosis Platform**  
> Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, and Supabase PostgreSQL.

---

## 📌 Executive Summary

**Relova** is a B2B circular economy platform that facilitates the exchange of industrial surplus materials between manufacturing plants, factories, and warehouses (**Material Providers**) and workshops, craftsmen, and fabrication units (**Material Recipients**).

This repository contains the **Simplified Academic DBMS Edition** of Relova. It focuses on a streamlined, 8-table relational PostgreSQL architecture that implements the complete circular lifecycle: user registration, surplus listing publication, demand radar matching, custody transfer, physical scale weigh-in verification, and quantified environmental impact reporting (Landfill diversion, CO₂e reduction, and water conservation).

---

## 🏗️ Relational Architecture (The 8 Tables)

The database schema is normalized and reduced to **exactly 8 core tables** to ensure clarity for academic evaluations while preserving complete relational integrity:

```
                      +-------------------+
                      |       users       |
                      +-------------------+
                        | (1)           | (1)
                        |               |
                    (N) |               | (N)
       +--------------------+       +---------------------+
       |   resource_lots    |       |   demand_requests   |
       +--------------------+       +---------------------+
         | (1)          | (1)         | (1)           | (1)
         |              |             |               |
     (N) |          (N) |         (N) |           (N) |
+---------------------+ +-------------+ +---------------------+
| material_categories | |   matches   | | material_categories |
+---------------------+ +-------------+ +---------------------+
                              | (1)
                              |
                          (1) |
                        +-------------------+
                        |     exchanges     |
                        +-------------------+
                          | (1)           | (1)
                          |               |
                      (N) |           (1) |
          +---------------------+       +--------------------+
          |   exchange_events   |       |   impact_records   |
          +---------------------+       +--------------------+
```

### Table Definitions

| No. | Table Name | Purpose | Primary Key | Key Foreign Keys & Constraints |
|:---:|:---|:---|:---|:---|
| **1** | `users` | Stores organization profiles with unified dual capability (`both` provider & recipient). | `id` (UUID) | Unique email, phone, geographical coordinates. |
| **2** | `material_categories` | Global taxonomy for industrial materials (Timber, Packaging, Polymers, Textiles, Biomass, Metals). | `category_id` (UUID) | Unique category names. |
| **3** | `resource_lots` | Surplus inventory lots published by industrial providers. | `lot_id` (UUID) | `provider_id -> users(id)`, `category_id -> material_categories(category_id)`, check constraints for `quantity > 0` and valid condition grades. |
| **4** | `demand_requests` | Material requirements radar submitted by recipients. | `request_id` (UUID) | `recipient_id -> users(id)`, `category_id -> material_categories(category_id)`, urgency levels (`immediate`, `high`, `medium`). |
| **5** | `matches` | Bilateral compatibility pairings identified by the matching engine. | `match_id` (UUID) | `lot_id -> resource_lots(lot_id)`, `request_id -> demand_requests(request_id)`, composite unique `(lot_id, request_id)`. |
| **6** | `exchanges` | Active custody transfer agreements, logistics windows, and physical scale verification. | `exchange_id` (UUID) | `match_id -> matches(match_id)`, verification code token, weigh-in check constraints. |
| **7** | `exchange_events` | Immutable historical audit log tracking every state change during custody transfer. | `event_id` (UUID) | `exchange_id -> exchanges(exchange_id)`. |
| **8** | `impact_records` | Quantified environmental benefits calculated upon verified completion of an exchange. | `impact_id` (UUID) | `exchange_id -> exchanges(exchange_id)`, calculated landfill diverted kg, CO₂e saved kg, water conserved liters. |

---

## ⚡ DBMS Concepts & Features Implemented

1. **Relational Integrity & Foreign Keys**:
   - Strict `ON DELETE RESTRICT` constraints to prevent orphan records in active supply chains.
2. **Check Constraints**:
   - `quantity > 0` and `required_quantity > 0` (prevent negative inventory).
   - Valid enumerated states for `status` and `condition_grade`.
   - `CHECK (status <> 'completed' OR (measured_quantity IS NOT NULL AND completed_at IS NOT NULL))` ensures no exchange can be finalized without a verified physical weigh-in.
3. **Database Triggers & Stored Procedures**:
   - `fn_auto_match_engine()`: Automatically fires on `INSERT` to `resource_lots` or `demand_requests` to calculate compatibility scores and populate `matches`.
   - `record_exchange_status()`: Automatically logs state transitions to `exchange_events` whenever an exchange moves from `submitted` -> `accepted` -> `logistics_scheduled` -> `completed`.
   - `set_updated_at()`: Automatically keeps `updated_at` timestamps accurate on all modifications.
4. **Row Level Security (RLS)**:
   - Configured across all 8 tables.
5. **No Static / Dummy Data**:
   - All statistics, inventory feeds, demand specifications, and impact metrics are queried and computed dynamically from PostgreSQL.

---

## 💻 Tech Stack & Design

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with an industrial **Neo-Brutalist** aesthetic (bold `2px #000` borders, hard `4px 4px 0px #000` drop shadows, high-contrast monospace typography).
- **Icons**: Clean Lucide React industrial category icons (no broken image upload pipelines).
- **Database / Backend**: Supabase (PostgreSQL 15+ with PostgREST API).

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ installed.
- A Supabase account and project.

### 2. Clone and Install
```bash
git clone https://github.com/soniya-kolvekar/relova-dbms.git
cd relova-dbms
npm install
```

### 3. Database Setup (Supabase)
1. Open your Supabase project's **SQL Editor**:
   `https://supabase.com/dashboard/project/<your-project-id>/sql/new`
2. Open [`schema.sql`](./schema.sql) in this repository.
3. Paste the entire content and click **Run**.
   - It will safely create all 8 tables, indexes, triggers, constraints, and standard category seeds.

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### 5. Run the Application
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Verification & Testing

To run the automated 8-table relational lifecycle test:
```bash
node ../test-e2e-workflow.mjs
```
This tests:
1. Category taxonomy lookup
2. User profile resolution
3. Surplus lot creation
4. Demand request submission
5. Automatic trigger-based match generation
6. Custody exchange progression & audit event creation
7. Scale weigh-in recording and environmental impact calculations

---

## 👥 Contributors & Academic Context

Developed as an academic DBMS project demonstrating normalized relational schema design, transactional integrity, automated stored triggers, and dynamic B2B circular economy workflows.
