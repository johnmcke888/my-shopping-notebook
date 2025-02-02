import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json(
            { error: 'User ID is required' },
            { status: 400 }
        );
    }

    try {
        const creditCards = await prisma.creditCards.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                dateAdded: 'desc'
            }
        });

        return NextResponse.json(creditCards);
    } catch (error) {
        console.error('Error fetching gift cards:', error);
        return NextResponse.json(
            { error: 'Error fetching gift cards' },
            { status: 500 }
        );
    }
}