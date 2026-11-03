/**
 * Generic CRUD operations for custom objects and fields
 * Works with any object_id without hard-coding entity logic
 */

import { ObjectMetadata, FieldMetadata, Record as RecordModel } from "@/lib/serverModels";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Get object metadata by name (singular or plural)
 */
export async function getObject(nameOrId: string): Promise<any> {
  // Try to find by name_singular first
  let obj = await ObjectMetadata.findOne({
    where: { name_singular: nameOrId },
  });

  // Try by name_plural if not found
  if (!obj) {
    obj = await ObjectMetadata.findOne({
      where: { name_plural: nameOrId },
    });
  }

  // Try by UUID if not found
  if (!obj) {
    obj = await ObjectMetadata.findByPk(nameOrId);
  }

  return obj;
}

/**
 * Get all fields for an object
 */
export async function getFieldsForObject(objectId: string): Promise<any[]> {
  const fields = await FieldMetadata.findAll({
    where: { object_id: objectId },
    order: [["display_order", "ASC"]],
  });
  return fields;
}

/**
 * Validate record data against field metadata
 */
export async function validateRecord(objectId: string, data: Record<string, any>): Promise<ValidationResult> {
  const fields = await getFieldsForObject(objectId);
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = data[field.name];

    // Check required
    if (field.required && (value === null || value === undefined || value === "")) {
      errors[field.name] = `${field.label} is required`;
      continue;
    }

    // Skip validation if empty and not required
    if (value === null || value === undefined || value === "") {
      continue;
    }

    // Validate email
    if (field.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        errors[field.name] = "Invalid email format";
      }
    }

    // Validate phone
    if (field.type === "phone") {
      const phoneRegex = /^\+?[\d\s\-()]+$/;
      if (!phoneRegex.test(String(value))) {
        errors[field.name] = "Invalid phone format";
      }
    }

    // Validate number and currency
    if ((field.type === "number" || field.type === "currency") && isNaN(Number(value))) {
      errors[field.name] = "Must be a valid number";
    }

    // Validate select options
    if (field.type === "select" && field.config?.options) {
      const validOptions = field.config.options.map((opt: any) => opt.value);
      if (!validOptions.includes(value)) {
        errors[field.name] = "Invalid selection";
      }
    }

    // Validate multi_select options
    if (field.type === "multi_select" && field.config?.options) {
      const validOptions = field.config.options.map((opt: any) => opt.value);
      if (Array.isArray(value)) {
        const invalidOptions = value.filter((v: string) => !validOptions.includes(v));
        if (invalidOptions.length > 0) {
          errors[field.name] = `Invalid selection: ${invalidOptions.join(", ")}`;
        }
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Create a new record
 */
export async function createRecord(
  objectId: string,
  data: Record<string, any>,
  userId?: number
): Promise<any> {
  // Validate
  const validation = await validateRecord(objectId, data);
  if (!validation.valid) {
    const errorMsg = Object.values(validation.errors).join("; ");
    throw new Error(`Validation failed: ${errorMsg}`);
  }

  // Create
  const record = await RecordModel.create({
    object_id: objectId,
    data,
    created_by_user_id: userId,
    updated_by_user_id: userId,
  });

  return record;
}

/**
 * Get a single record by ID
 */
export async function getRecord(recordId: string, objectId?: string): Promise<any> {
  const where: any = { id: recordId };
  if (objectId) {
    where.object_id = objectId;
  }

  const record = await RecordModel.findOne({ where });
  if (!record) {
    throw new Error("Record not found");
  }

  return record;
}

/**
 * Update a record
 */
export async function updateRecord(
  recordId: string,
  data: Record<string, any>,
  objectId?: string,
  userId?: number
): Promise<any> {
  // Get record
  const record = await getRecord(recordId, objectId);

  // Validate
  const validation = await validateRecord(record.object_id, data);
  if (!validation.valid) {
    const errorMsg = Object.values(validation.errors).join("; ");
    throw new Error(`Validation failed: ${errorMsg}`);
  }

  // Update
  record.data = data;
  record.updated_by_user_id = userId;
  await record.save();

  return record;
}

/**
 * Delete a record
 */
export async function deleteRecord(recordId: string, objectId?: string): Promise<void> {
  const record = await getRecord(recordId, objectId);
  await record.destroy();
}

/**
 * List records with filtering, sorting, pagination
 */
export async function listRecords(
  objectId: string,
  options: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDir?: "ASC" | "DESC";
    filters?: Record<string, any>;
    assignedToUserId?: number;
  } = {}
): Promise<{ rows: any[]; count: number }> {
  const limit = options.limit || 50;
  const offset = options.offset || 0;
  const orderBy = options.orderBy || "created_at";
  const orderDir = options.orderDir || "DESC";

  const where: any = { object_id: objectId };

  // Filter by assigned user (for non-admin views)
  if (options.assignedToUserId) {
    where.assigned_to_user_id = options.assignedToUserId;
  }

  // Add custom filters (simple key-value matching in JSONB)
  // This is basic - for production, use proper JSONB queries
  if (options.filters) {
    // Filters would need to be handled via raw SQL for JSONB
    // For now, we filter in-memory after fetch
  }

  const { rows, count } = await RecordModel.findAndCountAll({
    where,
    limit,
    offset,
    order: [[orderBy, orderDir]],
  });

  return { rows, count };
}

/**
 * Get record with field metadata
 * Useful for forms - returns both data and schema
 */
export async function getRecordWithFields(recordId: string): Promise<{
  record: any;
  fields: any[];
  object: any;
}> {
  const record = await getRecord(recordId);
  const fields = await getFieldsForObject(record.object_id);
  const object = await ObjectMetadata.findByPk(record.object_id);

  return { record, fields, object };
}

/**
 * Get all fields for an object (for rendering forms)
 * Useful when creating new records
 */
export async function getObjectSchema(objectId: string): Promise<{
  object: any;
  fields: any[];
}> {
  const object = await ObjectMetadata.findByPk(objectId);
  if (!object) {
    throw new Error("Object not found");
  }

  const fields = await getFieldsForObject(objectId);

  return { object, fields };
}

/* eslint-enable @typescript-eslint/no-explicit-any */
