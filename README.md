# Data Lifecycle Management - Oracle to Iceberg Offload Control Plane

## 🚀 Overview

This project demonstrates an end-to-end **data lifecycle management system**:

- Offloading data from **Oracle (hot storage)** → **Apache Iceberg (cold storage)**
- Managing pipelines via a **Control Plane UI**
- Processing data using **Apache Spark**
- Querying across systems using **Trino (federated query engine)**

---

## 🧠 Architecture

```
Oracle (Hot Data)
        │
        ▼
   Spark (Offload Engine)
        │
        ▼
Iceberg (Cold Data on MinIO)
        │
        ▼
      Trino (Federated Query)
        │
        ▼
 Control Plane (React + FastAPI)
```

---

## 🧩 Components

### 🔹 Backend
- FastAPI
- SQLAlchemy
- PostgreSQL (metadata)

### 🔹 Frontend
- React + TypeScript
- TailwindCSS

Features:
- Connection management
- Table inventory browsing
- Coverage analysis
- Job submission
- Job monitoring & logs

### 🔹 Data Processing
- Apache Spark (PySpark)
- Oracle → Iceberg pipeline

### 🔹 Storage & Query
- Oracle XE (source)
- Apache Iceberg (data lake)
- MinIO (S3 storage)
- Trino (query engine)

---

## ⚙️ Features

### ✅ Connection Management
- Add / delete Oracle connections
- Test connectivity

### ✅ Inventory Explorer
- Browse schemas, tables, columns
- Select date column dynamically

### ✅ Data Coverage
- Compare Oracle vs Iceberg
- Compute **offloadable window**

### ✅ Offload Job
- Submit job with date range
- Uses **DELETE + APPEND** to avoid duplicates

### ✅ Job Monitoring
- Job history
- Status tracking:
  - `PENDING → RUNNING → SUCCESS / FAILED`
- Spark logs captured and displayed in UI

### ✅ Federated Query
Query across systems via Trino

---

## 🛠️ Setup

### 1. Clone repository

```bash
git clone https://github.com/phuocchvn/datalifecyclemgmt.git
cd datalifecyclemgmt
```

---

### 2. Prepare required JARs

Create folder:

```bash
mkdir jars
```

Download and place:

- `ojdbc8.jar` (Oracle JDBC driver)
- (Optional) `hadoop-aws` and `aws-java-sdk-bundle` jars

```
jars/
  └── ojdbc8.jar
```

---

### 3. Start system

```bash
docker compose up -d
```

---

## 🌐 Access

| Component        | URL |
|----------------|-----|
| Frontend UI     | http://localhost:5173 |
| Backend API     | http://localhost:8000/docs |
| Trino UI        | http://localhost:8080 |
| MinIO Console   | http://localhost:9001 |

---

## 🔍 Example Workflow

1. Create Oracle connection
2. Select schema → table → date column
3. View coverage
4. Submit offload job
5. Monitor job logs
6. Query via Trino

---

## 📦 Project Structure

```
control-plane/
  ├── backend/
  ├── frontend/
  └── sql/

conf/
  └── trino/

docker-compose.yml
README.md
```

---

## ⚠️ Important Notes

Do NOT commit:
- `jars/`
- `drivers/`
- database volumes
- logs

Use Docker network hostnames:
- `oracle`
- `spark`
- `trino`

---

## 🚀 Future Improvements

- Async job execution (background worker)
- MERGE INTO instead of DELETE + APPEND
- Partition optimization
- Data validation layer
- UI enhancements (timeline, charts)

---
