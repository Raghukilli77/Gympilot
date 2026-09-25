# 🏋️ GymPilot

> A simple and modern gym management system for managing members, memberships, payments, expiry dates, and WhatsApp reminders.

---
view live:https://gympilotx.vercel.app/
## 📌 About The Project

GymPilot is a full-stack web application designed to help gym owners manage their daily gym operations from a single dashboard.

Instead of maintaining member details, payment records, and membership expiry information manually, GymPilot provides a centralized system to manage everything digitally.

The project started as a basic HTML, CSS, and JavaScript application and was later upgraded with Supabase for authentication, PostgreSQL database storage, Row Level Security, and real-time data handling.

---

## 🎯 Problem Statement

Many small gyms still manage their members using notebooks, spreadsheets, and manual WhatsApp messages.

This can make it difficult to:

- Track all gym members
- Know which memberships are active
- Identify expired memberships
- Track payment history
- Manage renewals
- Remind members before their membership expires

GymPilot aims to simplify these tasks through one web application.

---

## ✨ Features

### 👤 Member Management

- Add new members
- Edit member information
- Delete members
- Search members
- View member details
- Track joining date
- Track membership expiry date
- Track membership status

### 📊 Dashboard

- Total members
- Active members
- Expiring memberships
- Expired memberships
- Quick access to important actions

### 💰 Payment Management

- Record member payments
- Optional initial payment while adding a member
- Separate payment workflow
- Payment history for each member
- Track total payments
- Support partial payments
- Record payment date
- Store plan details with payment records

### 🔄 Membership Renewal

- Extend membership while recording a payment
- Automatically calculate the new expiry date
- Handle renewal of expired memberships
- Keep payment records separate from member information

### 📱 WhatsApp Reminders

- Identify memberships approaching expiry
- Send WhatsApp reminders
- Prevent repeated reminders using reminder tracking
- WhatsApp automation through WAHA

### 🔐 Authentication & Security

- User signup and login
- Supabase Authentication
- User-specific data
- PostgreSQL Row Level Security (RLS)
- Gym owner based data isolation

### ⚡ Realtime Data

- Supabase Realtime integration
- Database changes can be reflected in the application without manually refreshing the page

---

## 🛠️ Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend / Database

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Row Level Security
- Supabase Realtime

### Automation

- WAHA
- WhatsApp

### Deployment

- Static web hosting
- Supabase backend
- Render for WAHA hosting/testing

---

## 🏗️ System Architecture

```text
                    Gym Owner
                       │
                       ▼
                ┌──────────────┐
                │   GymPilot   │
                │ HTML/CSS/JS  │
                └──────┬───────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Supabase Auth   │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   PostgreSQL    │
              │    Database     │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │       RLS       │
              │ Data Isolation  │
              └─────────────────┘


          Membership Reminder Flow

              GymPilot
                  │
                  ▼
          Expiry Detection
                  │
                  ▼
                WAHA
                  │
                  ▼
              WhatsApp
                  │
                  ▼
               Member
