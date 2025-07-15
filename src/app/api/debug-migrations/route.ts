import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 Debug Migrations: Checking migration status...');
    
    // Check if _prisma_migrations table exists
    const migrationTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations'
      )
    `;
    
    let migrations: any[] = [];
    if (migrationTableExists) {
      // Get migration history
      migrations = await prisma.$queryRaw`
        SELECT migration_name, finished_at, applied_steps_count
        FROM _prisma_migrations
        ORDER BY finished_at DESC
      ` as any[];
    }
    
    // Check current schema version
    const userTableSchema = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'User'
      ORDER BY ordinal_position
    `;
    
    // Check for expected columns
    const expectedColumns = [
      'id', 'email', 'password', 'firstName', 'lastName', 'role',
      'emailVerified', 'emailVerificationToken', 'emailVerificationExpires',
      'passwordResetToken', 'passwordResetExpires', 'createdAt', 'updatedAt'
    ];
    
    const actualColumns = (userTableSchema as Array<{column_name: string}>).map(col => col.column_name);
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
    
    return NextResponse.json({
      success: true,
      migrationTableExists,
      migrations,
      userTableSchema,
      expectedColumns,
      actualColumns,
      missingColumns,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('❌ Migration check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 