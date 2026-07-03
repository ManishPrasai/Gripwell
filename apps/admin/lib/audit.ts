/**
 * Audit log helper — writes to AdminActionLog.
 *
 * Every structural write in the admin console should leave a row here:
 *   await logAction({ adminId, action: 'LOGIN', entityType: 'AdminUser',
 *                     entityId: adminId, ip })
 *
 * Fails silently so an audit-log DB error never breaks the actual operation.
 * In production, consider queuing this asynchronously.
 */
import { prisma } from '@nova/database'

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'TOTP_ENROLLED'
  | 'TOTP_DISABLED'
  | 'TOTP_RECOVERY_USED'
  | 'PASSWORD_CHANGED'
  | 'ADMIN_CREATED'
  | 'ADMIN_UPDATED'
  | 'ADMIN_DELETED'
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_REFUNDED'
  | 'STORE_UPDATED'
  | 'STORE_CLOSED'
  | 'STORE_REOPENED'
  | 'REVIEW_REPLIED'
  | 'ROLE_CREATED'
  | 'ROLE_UPDATED'
  | 'ROLE_DELETED'
  | 'DISCOUNT_CREATED'
  | 'DISCOUNT_UPDATED'
  | 'DISCOUNT_DELETED'
  | 'PAGE_PUBLISHED'
  | 'PAGE_UNPUBLISHED'
  | 'PAGE_DELETED'
  | 'STAFF_LOGIN_ISSUED'
  | 'STAFF_LOGIN_RESET'
  | 'STAFF_REMOVED'

interface LogParams {
  adminId:     string
  action:      AuditAction
  entityType:  string
  entityId?:   string
  before?:     object | null
  after?:      object | null
  ip?:         string
}

export async function logAction({
  adminId, action, entityType, entityId, before, after, ip,
}: LogParams): Promise<void> {
  try {
    await prisma.adminActionLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId:    entityId   ?? null,
        beforeState: before     ? JSON.stringify(before) : null,
        afterState:  after      ? JSON.stringify(after)  : null,
        ipAddress:   ip         ?? null,
      },
    })
  } catch (err) {
    // Never let audit logging break the actual operation
    console.error('[audit] Failed to write log:', err)
  }
}
