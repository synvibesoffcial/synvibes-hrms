import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    console.log('🔍 Debug DB: Starting database connection test...');
    
    // Test basic connection
    const connectionTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful:', connectionTest);
    
    // Get environment info
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 20) + '...',
    };
    
    // Get user count
    const userCount = await prisma.user.count();
    console.log('📊 Total users in database:', userCount);
    
    // Get recent users
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        emailVerified: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    
    console.log('📋 Recent users:', recentUsers.map(u => ({ 
      email: u.email, 
      role: u.role, 
      verified: u.emailVerified,
      created: u.createdAt 
    })));
    
    // Get database tables info
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    return NextResponse.json({
      success: true,
      environment: envInfo,
      userCount,
      recentUsers,
      tables,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 