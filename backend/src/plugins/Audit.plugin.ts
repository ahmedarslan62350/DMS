import { Schema, UpdateQuery, UpdateQueryKnownOnly } from "mongoose";
import { AuditLog } from "../models/AuditLog.model";

export const auditPlugin = (schema: Schema, options: any) => {
  schema.pre("findOneAndUpdate", async function () {
    const docToUpdate = await this.model.findOne(this.getQuery()).lean();
    if (!docToUpdate) return;

    const update = this.getUpdate() as UpdateQuery<
      UpdateQueryKnownOnly<typeof schema>
    >;
    const changes: any[] = [];

    Object.keys(update?.$set || {}).forEach((field) => {
      const oldValue = docToUpdate[field];
      const newValue = update.$set[field];

      if (oldValue !== newValue) {
        changes.push({
          field,
          oldValue,
          newValue,
        });
      }
    });

    if (!changes.length) return;

    const userId = this.getOptions().userId;

    for (const change of changes) {
      await AuditLog.create({
        entityType: options.entityType,
        entityId: docToUpdate._id,
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        action: "update",
        changedBy: userId,
      });
    }
  });

  schema.pre("save", async function () {
    if (!this.isNew) return;

    const changedBy = (this as any).$locals?.userId;

    const docObj = this.toObject();
    delete (docObj as any).__v;

    await AuditLog.create({
      entityType: options.entityType,
      entityId: this._id as any,
      field: "all_fields",
      oldValue: null,
      newValue: JSON.stringify(docObj),
      action: "create",
      changedBy: changedBy,
    });
  });

  schema.pre("findOneAndDelete", async function () {
    const docToDelete = await this.model.findOne(this.getQuery());
    if (!docToDelete) return;

    const userId = this.getOptions()?.userId;

    await AuditLog.create({
      entityType: options.entityType,
      entityId: docToDelete._id,
      field: "all_fields",
      oldValue: JSON.stringify(docToDelete.toObject()),
      newValue: "DELETED",
      action: "delete",
      changedBy: userId,
    });
  });
};
