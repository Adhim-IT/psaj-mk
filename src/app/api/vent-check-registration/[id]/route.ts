import { type NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

// Format dengan params sebagai Promise
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Sesuaikan dengan Promise
) {
  try {
    const resolvedParams = await params; // Tunggu params sebelum mengakses id
    const eventId = resolvedParams.id;

    // Check if user is authenticated
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user with student ID
    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.studentId) {
      return NextResponse.json({ isRegistered: false });
    }

    // Check if the student is already registered for the event
    const registration = await prisma.event_registrants.findFirst({
      where: {
        event_id: eventId,
        student_id: currentUser.studentId,
      },
    });

    return NextResponse.json({
      isRegistered: !!registration,
      status: registration?.status || null,
    });
  } catch (error) {
    console.error('Error checking registration:', error);
    return NextResponse.json({ error: 'Failed to check registration' }, { status: 500 });
  }
}
