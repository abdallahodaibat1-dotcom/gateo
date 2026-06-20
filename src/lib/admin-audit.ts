import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export type AdminAction =
  | 'ADMIN_LOGIN'
  | 'ADMIN_LOGOUT'
  | 'BUSINESS_APPROVED'
  | 'BUSINESS_REJECTED'
  | 'BUSINESS_DELETED'
  | 'BUSINESS_UPDATED'
  | 'PROFESSIONAL_APPROVED'
  | 'PROFESSIONAL_REJECTED'
  | 'PROFESSIONAL_SUSPENDED'
  | 'PROFESSIONAL_UPDATED'
  | 'PROFESSIONAL_DELETED'
  | 'USER_SUSPENDED'
  | 'USER_ACTIVATED'
  | 'USER_DELETED'
  | 'USER_UPDATED'
  | 'POST_DELETED'
  | 'POST_HIDDEN'
  | 'REPORT_RESOLVED'
  | 'REPORT_DISMISSED'
  | 'SETTINGS_UPDATED'
  | 'CATEGORY_CREATED'
  | 'CATEGORY_UPDATED'
  | 'CATEGORY_DELETED';

interface AuditLogOptions {
  adminId: string;
  action: AdminAction;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAdminAction(options: AuditLogOptions) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId: options.adminId,
        action: options.action,
        entityType: options.entityType || null,
        entityId: options.entityId || null,
        metadata: options.metadata ? JSON.stringify(options.metadata) : null,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
      },
    });
  } catch (error) {
    // Never throw from audit logging; just log to console
    console.error('Failed to write admin audit log:', error);
  }
}

export function getRequestMeta(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown';
  return {
    ipAddress: ip,
    userAgent: req.headers.get('user-agent') || '',
  };
}
