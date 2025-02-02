// app/api/creditcards/route.ts
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
        // Notice "creditCard" instead of "creditCards"
        const creditCards = await prisma.creditCard.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                dateAdded: 'desc'
            }
        });

        return NextResponse.json(creditCards);
    } catch (error) {
        console.error('Error fetching credit cards:', error);
        return NextResponse.json(
            { error: 'Error fetching credit cards' },
            { status: 500 }
        );
    }
}