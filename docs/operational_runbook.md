# EkDrishti CMS — Production Operational Playbook & Runbook

This runbook documents disaster recovery workflows, backup policies, rollbacks, and readiness checklists for the EkDrishti digital platform (in compliance with **Part 5E of the CMS Master SRS**).

---

## 1. Database Backup & Restore Operations

MongoDB is the single source of truth for portfolio settings, activity logs, brute-force keys, and CRM contacts.

### A. Database Backup Procedure (mongodump)
To back up the MongoDB database, run the standard `mongodump` utility. This can be scheduled as a daily cron job.

```bash
# General Backup command
mongodump --uri="YOUR_MONGODB_URI" --out=/backups/mongodb/$(date +%F-%H%M)

# Example for Local/Docker environment
mongodump --db=ekdrishti_test --out=./backups/$(date +%F)
```

### B. Database Restore Procedure (mongorestore)
In the event of database corruption or hardware failure, recover the database dump:

```bash
# Warning: This will overwrite existing collections!
mongorestore --uri="YOUR_MONGODB_URI" --drop /backups/mongodb/2026-07-20-1600/
```

---

## 2. Media Assets Backup & Restore Operations

Portfolio media files are stored on Amazon S3. 

### A. S3 Media Sync Backup
Synchronize media assets to a secondary local or secure remote storage system:

```bash
# Sync S3 Bucket to a backup directory locally
aws s3 sync s3://assets-ekdrishti ./backups/s3-media/ --region eu-north-1
```

### B. S3 Media Restoration
To restore media assets to S3 from a local backup:

```bash
# Restore local media files to S3 bucket
aws s3 sync ./backups/s3-media/ s3://assets-ekdrishti --region eu-north-1
```

---

## 3. Deployment Rollback Strategies

All serverless deployments are managed via Vercel.

### A. Instant Vercel Rollback (CLI)
If a critical error is detected after deployment, roll back to the last stable deployment hash instantly:

```bash
# List previous deployments
vercel list

# Rollback deployment to a specific stable deployment ID
vercel rollback premium-digital-agency-dnjvec.vercel.app [DEPLOYMENT_ID]
```

### B. Safe Git-based Reversion
To cleanly revert changes via source control:

```bash
# Revert the latest commit on main branch
git revert HEAD

# Push changes to main to trigger the CI/CD rebuild
git push origin main
```

---

## 4. Production Readiness Pre-Release Checklist

Before promoting any release to production, verify the following checks:

| Subsystem | Check Action | Expected Status |
| :--- | :--- | :--- |
| **Database** | Ping `/health` endpoint and verify database connection code is `1` | Connected |
| **Storage** | Upload a test portfolio WebP image in Admin Media | Success |
| **Email** | Submit a contact form and verify transactional notification delivery | Dispatched |
| **SEO** | Query `/sitemap.xml` and `/robots.txt` in a browser | XML & text nodes return |
| **Security** | Check that `Strict-Transport-Security` and `X-Frame-Options` exist in response headers | Headers present |
| **Integrations** | Verify that `JWT_SECRET`, `SMTP_HOST`, and `SMTP_PASSWORD` are populated in Vercel settings | Env vars valid |
