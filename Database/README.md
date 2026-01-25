# EcoRide Database Initialization

## Overview

This directory contains SQL scripts for initializing the EcoRide PostgreSQL database. The database initialization follows **best practices** for Kubernetes deployments with idempotent scripts and migration tracking.

## Architecture

### Deployment Method: Kubernetes Job + ConfigMap

The database is initialized using a **Helm post-install/post-upgrade Job** that:
1. Waits for PostgreSQL to be ready
2. Executes the consolidated init script
3. Tracks migrations in `schema_migrations` table
4. Is **idempotent** (safe to re-run)

### Files

#### Production Files (Used by Kubernetes)
- **`init_database.sql`** - Consolidated, idempotent initialization script
  - Creates all tables with `IF NOT EXISTS`
  - Inserts data with `ON CONFLICT DO NOTHING`
  - Tracks migrations with version numbers
  - Safe to re-run multiple times

#### Legacy Files (Reference only)
- `01_create_database.sql` - Original DB creation script
- `02_create_tables.sql` - Original table creation
- `03_insert_data.sql` - Original test data
- `04_add_language_preference.sql` - Migration #2
- `05_fix_energy_types.sql` - Migration #3
- `check_reviews.sql` - Diagnostic script
- `test_rating_update.sql` - Test script

**Note:** Legacy files are kept for reference but are **not used** in production. All logic has been consolidated into `init_database.sql`.

## Migration System

### Schema Migrations Table

```sql
CREATE TABLE schema_migrations (
    version INTEGER PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Current Migrations

| Version | Description | Included In |
|---------|-------------|-------------|
| v1 | Initial database schema and test data | `init_database.sql` |
| v2 | Add language preference to users | `init_database.sql` |
| v3 | Standardize energy type values | `init_database.sql` |

### Adding New Migrations

To add a new migration:

1. Edit `Database/init_database.sql` and add a new migration block:

```sql
-- ==============================================================================
-- STEP X: Your migration description (vN)
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = N) THEN
        -- Your migration SQL here

        INSERT INTO schema_migrations (version, description)
        VALUES (N, 'Your migration description');

        RAISE NOTICE 'Migration vN: Your description - EXECUTED';
    ELSE
        RAISE NOTICE 'Migration vN: Your description - ALREADY EXECUTED, SKIPPED';
    END IF;
END $$;
```

2. Update the ConfigMap in Helm chart:
   - Copy the full `init_database.sql` content
   - Paste into `ecoride-postgres/templates/configmap-init.yaml`

3. Deploy using Helm (Job will run automatically on upgrade)

## Kubernetes Deployment

### How It Works

1. **Helm Install/Upgrade** triggers the Job (via `helm.sh/hook: post-install,post-upgrade`)
2. **Init Container** waits for PostgreSQL to be ready (`pg_isready`)
3. **Main Container** executes `init_database.sql`
4. **Script** checks `schema_migrations` and only runs new migrations
5. **Job** logs migration status and exits

### Manual Execution

If you need to run the init script manually:

```bash
# Get the postgres pod name
POSTGRES_POD=$(kubectl get pod -l app.kubernetes.io/name=ecoride-postgres -o name -n dev)

# Copy the script to the pod
kubectl cp Database/init_database.sql $POSTGRES_POD:/tmp/init.sql -n dev

# Execute the script
kubectl exec -n dev $POSTGRES_POD -- psql -U ecoride_user -d ecoride -f /tmp/init.sql
```

### Check Migration Status

```bash
kubectl exec -n dev -it ecoride-postgres--dev-0 -- \
  psql -U ecoride_user -d ecoride -c \
  "SELECT version, description, executed_at FROM schema_migrations ORDER BY version;"
```

Expected output:
```
 version |             description              |      executed_at
---------+--------------------------------------+------------------------
       1 | Initial database schema and test data| 2026-01-25 10:30:00
       2 | Add language preference to users     | 2026-01-25 10:30:01
       3 | Standardize energy type values       | 2026-01-25 10:30:02
```

## Test Users

The init script creates test users with password `Password123!`:

| Email | Username | Roles | Credits |
|-------|----------|-------|---------|
| jean.dupont@email.com | jeandu | Passenger, Driver | 50 |
| marie.martin@email.com | mariema | Passenger, Driver | 30 |
| pierre.durand@email.com | pierredu | Passenger, Driver | 45 |
| sophie.bernard@email.com | sophieb | Passenger | 25 |
| admin@ecoride.fr | admin | Administrator | 1000 |
| support@ecoride.fr | support | Employee | 0 |

## Best Practices Applied

✅ **Idempotency**: All scripts can be run multiple times safely
✅ **Migration Tracking**: Version-based system prevents duplicate executions
✅ **Kubernetes Native**: Uses Jobs and ConfigMaps (no external tools)
✅ **Atomic Operations**: Each migration is wrapped in a transaction-like block
✅ **Logging**: Clear NOTICE messages for each migration step
✅ **Rollback Safety**: Old migrations never re-execute
✅ **Foreign Key Constraints**: Named constraints for better debugging
✅ **Index Creation**: Performance indexes created with IF NOT EXISTS

## Troubleshooting

### Job Fails with "relation already exists"
This is normal if tables exist. The script is idempotent and will skip existing objects.

### Job Stuck in "Pending"
Check if PostgreSQL pod is running:
```bash
kubectl get pods -l app.kubernetes.io/name=ecoride-postgres -n dev
```

### View Job Logs
```bash
kubectl logs -n dev -l app.kubernetes.io/name=ecoride-postgres-init --tail=100
```

### Force Re-run Job
```bash
# Delete the job (will be recreated on next helm upgrade)
kubectl delete job ecoride-postgres--dev-init-job -n dev

# Trigger helm upgrade
helm upgrade ecoride-postgres ./ecoride-postgres -n dev -f values-dev.yaml
```

## Production Considerations

For production environments:
1. **Backup First**: Always backup before running migrations
2. **Test in Staging**: Test new migrations in dev/preprod first
3. **Review Logs**: Check Job logs after deployment
4. **Monitor Performance**: Large data migrations may need tuning
5. **Rolling Back**: If a migration fails, restore from backup (migrations are tracked, so re-run is safe)

## Future Enhancements

Potential improvements:
- [ ] Add migration checksums for data integrity
- [ ] Support for down migrations (rollback scripts)
- [ ] Integration with Entity Framework Core Migrations
- [ ] Automated backup before migrations
- [ ] Migration dry-run mode
