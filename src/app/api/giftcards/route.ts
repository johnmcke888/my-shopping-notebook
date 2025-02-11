import { NextResponse } from 'next/server';
import prisma from '@/lib/db';  // Make sure this line looks exactly like this!

export async function GET(request: Request) {
    // Get the userId from the URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
        );
    }

    try {
        const giftCards = await prisma.giftCard.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                dateAdded: 'desc'
            }
        });

        return NextResponse.json(giftCards);
    } catch (error) {
        console.error('Error fetching gift cards:', error);
        return NextResponse.json(
            { error: 'Error fetching gift cards' },
            { status: 500 }
        );
    }
}