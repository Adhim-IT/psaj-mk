import { type NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Ubah params menjadi Promise
  try {
    const resolvedParams = await params; // Tunggu params agar bisa diakses
    const eventId = resolvedParams.id; // Akses id setelah resolve

    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser || !currentUser.studentId) {
      return NextResponse.json({ registered: false, status: null });
    }

    const registration = await prisma.event_registrants.findFirst({
      where: {
        event_id: eventId,
        student_id: currentUser.studentId,
      },
    });

    if (!registration) {
      return NextResponse.json({ registered: false, status: null });
    }

    const event = registration.status === 'paid' ? await prisma.events.findUnique({ where: { id: eventId } }) : null;

    return NextResponse.json({
      registered: true,
      status: registration.status,
      whatsappLink: event?.whatsapp_group_link || null,
    });
  } catch (error) {
    console.error('Error checking event status:', error);
    return NextResponse.json({ error: 'Failed to check event status' }, { status: 500 });
  }
}

