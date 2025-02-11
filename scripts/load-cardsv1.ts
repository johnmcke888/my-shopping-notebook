// scripts/load-cards.ts

import { PrismaClient } from '@prisma/client';
import Papa, { ParseError } from 'papaparse';
import fs from 'fs';

interface CreditCard {
    'Issuer': string;
    'Card Name': string;
    'Business/Personal': string;
    'Annual Fee': string;
    'Annual/Monthly Credits': string;
    'Annual Free Nights or Points Bonus': string | null;
}

// Think of PrismaClient like a special helper that talks to our database
const prisma = new PrismaClient();

async function loadCards() {
    // First, read our CSV file
    // This is like opening a book to read its contents
    const fileContent = fs.readFileSync('credit-cards.csv', 'utf-8');

    // Use Papa Parse to read our CSV
    // This is like having someone translate the CSV into something our code can understand
    Papa.parse(fileContent, {
        header: true, // This tells Papa that our first row contains column names
        complete: async (results) => {
            try {
                // For each row in our CSV...
                for (const row of results.data as CreditCard[]) {
                    // Clean up the annual fee (remove '$' and convert to number)
                    const annualFee = row['Annual Fee']
                        ? parseFloat(row['Annual Fee'].replace('$', '').replace(',', ''))
                        : 0;

                    // Add this card to our database
                    await prisma.availableCard.create({
                        data: {
                            issuer: row['Issuer'] || '',
                            cardName: row['Card Name'] || '',
                            type: row['Business/Personal'] || '',
                            annualFee: annualFee,
                            credits: JSON.stringify(row['Annual/Monthly Credits'] || ''),
                            freeNights: row['Annual Free Nights or Points Bonus'] || null
                        }
                    });
                }
                console.log('✨ All cards have been loaded successfully!');
            } catch (error) {
                console.error('❌ Error loading cards:', error);
            } finally {
                // Always disconnect from the database when we're done
                await prisma.$disconnect();
            }
        },
        error: (error: ParseError) => {
            console.error('❌ Error parsing CSV:', error);
        }
    });
}

// Run our function!
loadCards();