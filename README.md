# 🚀 Distributed Job Queue System

A scalable **Job Queue System** that allows scheduling and processing of background jobs with **fault tolerance**, **retry mechanisms**, and **circuit breaker pattern**. Designed to handle failures gracefully and ensure reliable job execution.

---

## 🌐 Live Demo

🚀 Frontend: https://your-frontend.vercel.app
⚙️ Backend API: http://your-ec2-public-ip

---

## 🧠 Problem Statement

Modern applications require background processing (emails, payments, notifications).
This system ensures:

* Reliable job execution
* Failure handling
* Observability and monitoring

---

## 🏗️ Architecture Overview

* Jobs are pushed into a queue
* Workers consume jobs sequentially
* Failed jobs are retried automatically
* Dead Letter Queue handles permanent failures
* Circuit Breaker prevents cascading failures

---

## ⚙️ Tech Stack

* **Backend:** Node.js, Express
* **Queue System:** RabbitMQ
* **Caching / State:** Redis
* **Monitoring:** Prometheus + Grafana
* **Frontend:** React / Next.js
* **Deployment:** AWS EC2 (Backend), Vercel (Frontend)
* **Containerization:** Docker

---

## 🔥 Features

### ✅ Job Queue System

* Schedule and process background jobs
* FIFO-based execution using RabbitMQ

### 🔁 Retry Mechanism

* Automatic retries for failed jobs
* Configurable retry limits

### 💀 Dead Letter Queue

* Failed jobs moved after retry exhaustion
* Prevents system blockage

### ⚡ Circuit Breaker Pattern

* Prevents repeated failures from crashing the system
* Supports:

  * Closed State
  * Open State
  * Half-Open State

### 📊 Monitoring & Metrics

* Prometheus for metrics collection
* Grafana dashboards for visualization

### 🧑‍💻 Worker System

* Dedicated workers for job processing
* Handles failures and retries efficiently

### 🟢 Health Monitoring

* Service health endpoints
* Real-time system insights

---

## 📸 Screenshots

*Add your dashboard / grafana / UI screenshots here*

---

## 🔄 System Flow

1. User schedules a job via frontend/API
2. Job is pushed to RabbitMQ queue
3. Worker picks the job
4. If success → completed
5. If failure → retry
6. If retries exhausted → Dead Letter Queue
7. Circuit breaker activates on repeated failures

---

## 🔑 Key Concepts Implemented

* Distributed Systems Basics
* Fault Tolerance
* Circuit Breaker Pattern
* Retry Strategies
* Message Queues
* Observability (Metrics + Dashboards)

---

## 🛠️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/your-username/job-queue-system.git
cd job-queue-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```env
PORT=5000
REDIS_URL=your_redis_url
RABBITMQ_URL=your_rabbitmq_url
```

### 4. Run Services (Docker Recommended)

```bash
docker-compose up
```

### 5. Start Backend

```bash
npm run dev
```

---

## 🌍 Deployment

* **Frontend:** Vercel
* **Backend:** AWS EC2
* **Queue + Redis:** Docker containers

---

## 📈 Future Improvements

* Job prioritization
* Rate limiting
* Distributed workers scaling
* UI improvements

---

## 👨‍💻 Author

Dhruv Singh

---

## ⭐ Why This Project Stands Out

* Real-world backend architecture
* Production-grade patterns (Circuit Breaker, DLQ)
* Monitoring with Prometheus & Grafana
* Cloud deployment (AWS + Vercel)

---
