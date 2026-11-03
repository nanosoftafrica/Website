# Phase 1: Custom Fields System Architecture

**Document Purpose:** Design database schema and system architecture for custom objects and fields  
**Date:** August 3, 2026  
**Status:** Design Phase

---

## 1. Core Concept

Instead of hard-coding entity tables, we'll use a flexible metadata system:

- **Object Metadata:** Defines what entity types exist (Company, Contact, Opportunity, etc.)
- **Field Metadata:** Defines what fields each entity has and their types
- **Records:** Generic row storage where all entity instances live (JSON data column)

### Key Principle
One `records` table with a `data` JSONB column stores all entity instances, indexed by `object_id`. This mirrors Twenty CRM's approach and allows unlimited customization without schema migrations.

---

## 2. Database Schema

### Table: `object_metadata`
Defines entity types in the system.

```sql
CREATE TABLE object_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_singular VARCHAR(100) UNIQUE NOT NULL,      -- "company", "contact", "opportunity"
  name_plural VARCHAR(100) NOT NULL,               -- "companies", "contacts", "opportunities"
  label_singular VARCHAR(100) NOT NULL,            -- "Company", "Contact", "Opportunity"
  label_plural VARCHAR(100) NOT NULL,              -- "Companies", "Contacts", "Opportunities"
  icon VARCHAR(50),                                -- emoji: "🏢", "👤", "🎯", "📋"
  is_standard BOOLEAN DEFAULT false,               -- true for built-in (never delete)
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  created_by_user_id INTEGER,
  updated_at TIMESTAMP DEFAULT now(),
  updated_by_user_id INTEGER,
  
  CONSTRAINT check_names CHECK (
    name_singular ~ '^[a-z_]+$' AND 
    name_plural ~ '^[a-z_]+$'
  )
);

-- Indexes
CREATE UNIQUE INDEX idx_object_metadata_name_singular ON object_metadata(name_singular);
CREATE INDEX idx_object_metadata_is_standard ON object_metadata(is_standard);
```

**Seed Data:**
```json
{
  "name_singular": "company",
  "name_plural": "companies",
  "label_singular": "Company",
  "label_plural": "Companies",
  "icon": "🏢",
  "is_standard": true,
  "description": "Customer organizations"
},
{
  "name_singular": "contact",
  "name_plural": "contacts",
  "label_singular": "Contact",
  "label_plural": "Contacts",
  "icon": "👤",
  "is_standard": true,
  "description": "People at companies"
},
{
  "name_singular": "opportunity",
  "name_plural": "opportunities",
  "label_singular": "Opportunity",
  "label_plural": "Opportunities",
  "icon": "🎯",
  "is_standard": true,
  "description": "Sales deals and opportunities"
},
{
  "name_singular": "project",
  "name_plural": "projects",
  "label_singular": "Project",
  "label_plural": "Projects",
  "icon": "📋",
  "is_standard": true,
  "description": "Work orders and projects"
}
```

---

### Table: `field_metadata`
Defines fields for each object type.

```sql
CREATE TABLE field_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id UUID NOT NULL REFERENCES object_metadata(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,                      -- "name", "email", "annual_revenue"
  label VARCHAR(100) NOT NULL,                     -- "Name", "Email", "Annual Revenue"
  type VARCHAR(50) NOT NULL,                       -- text, email, phone, number, currency, select, date, datetime, boolean, relation
  
  -- Common field properties
  required BOOLEAN DEFAULT false,
  unique_constraint BOOLEAN DEFAULT false,
  default_value TEXT,
  placeholder VARCHAR(255),
  help_text TEXT,
  
  -- Type-specific config (stored as JSON)
  -- For select/multi_select: { options: [{ value, label, color }] }
  -- For relation: { relation_target_object_id, relation_type: 'one_to_one'|'one_to_many'|'many_to_many' }
  -- For number/currency: { min, max, precision }
  config JSONB DEFAULT '{}',
  
  -- Display
  display_order INTEGER DEFAULT 999,
  hidden BOOLEAN DEFAULT false,
  
  -- Audit
  created_at TIMESTAMP DEFAULT now(),
  created_by_user_id INTEGER,
  updated_at TIMESTAMP DEFAULT now(),
  updated_by_user_id INTEGER,
  
  CONSTRAINT check_field_name CHECK (name ~ '^[a-z_]+$'),
  UNIQUE (object_id, name)
);

-- Indexes
CREATE INDEX idx_field_metadata_object_id ON field_metadata(object_id);
CREATE INDEX idx_field_metadata_type ON field_metadata(type);
```

**Field Types Supported:**
- `text` — Short text (VARCHAR)
- `long_text` — Long text (TEXT)
- `email` — Email input
- `phone` — Phone number input
- `number` — Integer or decimal
- `currency` — Number with currency symbol (config: { currency: "KES" })
- `boolean` — True/false checkbox
- `date` — Date picker (YYYY-MM-DD)
- `datetime` — Date + time picker
- `select` — Single select from options (config: { options: [...] })
- `multi_select` — Multiple selections
- `relation` — Link to another object (config: { target_object_id, relation_type })

**Seed Data Example (Company fields):**
```json
[
  {
    "object_id": "<company_object_id>",
    "name": "name",
    "label": "Name",
    "type": "text",
    "required": true,
    "display_order": 1
  },
  {
    "object_id": "<company_object_id>",
    "name": "email",
    "label": "Email",
    "type": "email",
    "display_order": 2
  },
  {
    "object_id": "<company_object_id>",
    "name": "phone",
    "label": "Phone",
    "type": "phone",
    "display_order": 3
  },
  {
    "object_id": "<company_object_id>",
    "name": "annual_revenue",
    "label": "Annual Revenue (KES)",
    "type": "currency",
    "config": { "currency": "KES" },
    "display_order": 4
  },
  {
    "object_id": "<company_object_id>",
    "name": "status",
    "label": "Status",
    "type": "select",
    "config": {
      "options": [
        { "value": "prospect", "label": "Prospect", "color": "#3b82f6" },
        { "value": "customer", "label": "Customer", "color": "#10b981" },
        { "value": "inactive", "label": "Inactive", "color": "#6b7280" }
      ]
    },
    "display_order": 5
  }
]
```

---

### Table: `records`
Generic record storage for all objects.

```sql
CREATE TABLE records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id UUID NOT NULL REFERENCES object_metadata(id) ON DELETE CASCADE,
  
  -- All field values stored as JSONB
  -- Example: { "name": "Acme Corp", "email": "contact@acme.com", "annual_revenue": 1000000 }
  data JSONB NOT NULL DEFAULT '{}',
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT now(),
  created_by_user_id INTEGER,
  updated_at TIMESTAMP DEFAULT now(),
  updated_by_user_id INTEGER,
  
  -- For multi-user access control (Phase 2)
  assigned_to_user_id INTEGER,
  
  CONSTRAINT check_data CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for common operations
CREATE INDEX idx_records_object_id ON records(object_id);
CREATE INDEX idx_records_created_at ON records(created_at DESC);
CREATE INDEX idx_records_assigned_to ON records(assigned_to_user_id);
CREATE INDEX idx_records_object_created ON records(object_id, created_at DESC);

-- Full-text search on text/email fields (optional, Phase 2)
-- CREATE INDEX idx_records_text_search ON records USING gin(data jsonb_path_ops);
```

**Example Record:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "object_id": "<company_object_id>",
  "data": {
    "name": "Acme Corporation",
    "email": "sales@acme.com",
    "phone": "+254 20 1234567",
    "annual_revenue": 5000000,
    "status": "customer"
  },
  "created_at": "2026-08-01T10:00:00Z",
  "created_by_user_id": 1,
  "assigned_to_user_id": 2
}
```

---

### Table: `tasks`
Task management (Phase 1, critical).

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'TODO',              -- TODO, DONE
  
  -- Link to parent record
  record_id UUID REFERENCES records(id) ON DELETE CASCADE,
  record_object_id UUID REFERENCES object_metadata(id),
  
  -- Assignment
  assigned_to_user_id INTEGER,
  created_by_user_id INTEGER NOT NULL,
  
  -- Dates
  due_date DATE,
  due_time TIME,
  reminder_sent_at TIMESTAMP,                      -- Track if reminder was sent
  completed_at TIMESTAMP,                          -- When marked DONE
  
  -- Audit
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT check_status CHECK (status IN ('TODO', 'DONE'))
);

-- Indexes
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to_user_id, status);
CREATE INDEX idx_tasks_record_id ON tasks(record_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_status ON tasks(status);
```

---

### Table: `notes`
Simple notes attached to records (Phase 1).

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  
  -- Link to parent record
  record_id UUID REFERENCES records(id) ON DELETE CASCADE,
  record_object_id UUID REFERENCES object_metadata(id),
  
  -- Author
  created_by_user_id INTEGER NOT NULL,
  
  -- Audit
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX idx_notes_record_id ON notes(record_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
```

---

## 3. System Architecture

### Request Flow: Create a Company

```
1. Client: POST /api/admin/objects/companies/records
   {
     "data": {
       "name": "Acme Corp",
       "email": "sales@acme.com",
       "annual_revenue": 5000000
     }
   }

2. Server (lib/adminDb.ts):
   - Fetch object_metadata where name_singular = "companies"
   - Fetch field_metadata for that object
   - Validate data against field_metadata (required, types, etc.)
   - Insert into records table
   - Return created record with all fields

3. Client: Render record detail page with DynamicForm
   - Fetch record + field_metadata
   - Render form based on field_metadata
   - User can edit and save changes
```

### Request Flow: Fetch Record with Fields

```
GET /api/admin/objects/companies/records/550e8400-e29b-41d4-a716-446655440000

Response:
{
  "record": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "data": {
      "name": "Acme Corp",
      "email": "sales@acme.com",
      "annual_revenue": 5000000,
      "status": "customer"
    }
  },
  "fields": [
    {
      "id": "field-1",
      "name": "name",
      "label": "Name",
      "type": "text",
      "required": true,
      "display_order": 1
    },
    {
      "id": "field-2",
      "name": "email",
      "label": "Email",
      "type": "email",
      "display_order": 2
    },
    // ... rest of fields
  ]
}
```

---

## 4. Implementation Strategy

### Step 1: Database Migrations (Task #2)
- Create tables: `object_metadata`, `field_metadata`, `records`, `tasks`, `notes`
- Seed standard objects (company, contact, opportunity, project)
- Seed standard fields for each object
- Add Prisma schema definitions

### Step 2: Backend Service Layer (lib/adminDb.ts)
Create helper functions:
- `getObject(name_singular)` — Fetch object metadata
- `getFields(objectId)` — Fetch all fields for an object
- `validateRecord(data, fields)` — Validate against field metadata
- `createRecord(objectId, data)` — Create with validation
- `updateRecord(recordId, data)` — Update with validation
- `getRecordWithFields(recordId)` — Fetch record + field metadata

### Step 3: React Component (DynamicForm)
Create `<DynamicForm>` that:
- Accepts `fields` array from server
- Renders input for each field type
- Handles validation on client side
- Submits to API

### Step 4: API Endpoints
Generic CRUD endpoints:
- `POST /api/admin/objects/[objectId]/records` (create)
- `GET /api/admin/objects/[objectId]/records` (list)
- `GET /api/admin/objects/[objectId]/records/[recordId]` (get one)
- `PUT /api/admin/objects/[objectId]/records/[recordId]` (update)
- `DELETE /api/admin/objects/[objectId]/records/[recordId]` (delete)

### Step 5: Backward Compatibility
Keep old endpoints working:
- `/api/admin/companies` → routes to `/api/admin/objects/companies/records`
- `/api/admin/deals` → routes to `/api/admin/objects/opportunities/records`
- Existing code continues working during migration

---

## 5. Future Extensions (Phase 2+)

### Custom Objects
Users can create new objects via UI:
- Button: "+ New Entity Type"
- Form: name, icon, description
- Auto-create with default fields

### Relation Types (Many-to-Many)
```
object_relations table:
- relation_id, source_object_id, target_object_id, relation_type
- E.g., projects can have many suppliers, suppliers can have many projects
```

### Computed Fields
```
config: {
  computed_from: ["field1", "field2"],
  formula: "field1 + field2"
}
```

### Validation Rules
```
field_metadata.config: {
  validation: {
    min_length: 3,
    max_length: 100,
    regex_pattern: "^[A-Z].*"
  }
}
```

---

## 6. ER Diagram (ASCII)

```
object_metadata
├── id (PK)
├── name_singular (UK)
├── name_plural
├── icon
└── is_standard

field_metadata
├── id (PK)
├── object_id (FK → object_metadata)
├── name (UK with object_id)
├── type
├── config (JSONB)
└── display_order

records (THE CORE TABLE)
├── id (PK)
├── object_id (FK → object_metadata)
├── data (JSONB)  ← ALL field values live here
├── created_at
└── assigned_to_user_id (Phase 2)

tasks
├── id (PK)
├── record_id (FK → records)
├── record_object_id (FK → object_metadata)
├── assigned_to_user_id
├── due_date
└── status

notes
├── id (PK)
├── record_id (FK → records)
├── content
└── created_by_user_id
```

---

## 7. Key Design Decisions

| Decision | Why |
|----------|-----|
| Single `records` table with JSONB | Flexible schema, no migrations for new fields, mirrors Twenty CRM |
| UUID for IDs | Better distributed systems, no guessing order |
| JSONB for data | Native PostgreSQL support, indexable, queryable |
| Separate metadata tables | Clear separation of concerns, easy to fetch schema |
| Keep old endpoints | Backward compatibility, gradual migration |
| Task + Note tables | Structured data, easier to query "all tasks for this month" |

---

## 8. Validation & Error Handling

### Field Validation Rules
- `required: true` → Must not be null/empty
- `unique_constraint: true` → Must be unique across all records in object
- `type: "email"` → Must match email regex
- `type: "phone"` → Must be valid phone format
- `config.min / max` → Numeric bounds
- `config.options` → Must be one of allowed values

### API Error Responses
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "name",
      "message": "Required field missing"
    }
  ]
}
```

---

## 9. Testing Strategy

### Unit Tests
- `validateRecord()` with valid/invalid data
- Field type validation (email, phone, number)
- Relation field validation

### Integration Tests
- Create company via API, fetch, verify fields
- Update company, verify data persists
- Migrate old deals → new opportunities

### E2E Tests
- List companies → click one → edit fields → save
- See updated data in list view

---

## Summary

**This design enables:**
✅ Unlimited custom fields without code changes  
✅ Custom objects (future)  
✅ Clean separation of concerns (metadata vs. data)  
✅ Backward compatibility with existing entities  
✅ Foundation for Phase 2 (activity timeline, multi-user, dashboards)

**Estimated Build Time:**
- Database schema + migrations: 1-2 days
- Backend service layer: 2-3 days
- DynamicForm component: 2-3 days
- API endpoints: 2-3 days
- Tests + validation: 2 days
- **Total: ~2 weeks for Phase 1 foundation**
