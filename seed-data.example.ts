// This file should be named 'seed-data.example.ts'

// First, we import Prisma - think of this like getting our database tools ready
import { PrismaClient } from '@prisma/client';

// Create our database helper - like opening up our connection to the database
const prisma = new PrismaClient();

// Our main function that will do all the work
async function main() {
    // Replace these with your own values when you make your real seed-data.ts file
    const YOUR_CLERK_ID = "user_123abc...";  // Example format for a Clerk ID
    const YOUR_EMAIL = "example@email.com";

    // First, we'll make sure the user exists in our database
    // If they don't exist, we create them. If they do, we leave them as is
    const user = await prisma.user.upsert({
        where: {
            id: YOUR_CLERK_ID,
        },
        update: {},  // Don't change anything if the user exists
        create: {
            id: YOUR_CLERK_ID,
            email: YOUR_EMAIL
        }
    });

    // Here's our list of example gift cards
    const testCards = [
        {
            merchant: "Example Store",
            cardNumber: "1111222233334444",
            balance: 50.00,
            isNetworkCard: false,
            status: "active",
            expirationDate: null,  // Added this to match our schema
            pin: null  // Added this to match our schema
        },
        {
            merchant: "Sample Shop",
            cardNumber: "5555666677778888",
            balance: 100.00,
            isNetworkCard: false,
            status: "active",
            expirationDate: null,
            pin: null
        },
        {
            merchant: "Example Network Card",
            cardNumber: "4000111122223333",
            balance: 250.00,
            isNetworkCard: true,
            status: "active",
            expirationDate: new Date('2025-12-31'),  // Example expiration date
            pin: "123"  // Example PIN/CVV
        }
    ];

    // Add each test card to the database
    for (const cardData of testCards) {
        await prisma.giftCard.create({
            data: {
                ...cardData,
                userId: user.id,
                dateAdded: new Date(),
            }
        });
    }

    console.log('Added test data successfully!');
}

// Run our main function and handle any errors
main()
    .catch(e => {
        console.error('Error adding test data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });