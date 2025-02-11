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

const prisma = new PrismaClient();

async function loadCards() {
    const fileContent = fs.readFileSync('credit-cards.csv', 'utf-8');

    Papa.parse(fileContent, {
        header: true,
        complete: async (results) => {
            try {
                for (const row of results.data as CreditCard[]) {
                    const annualFee = row['Annual Fee']
                        ? parseFloat(row['Annual Fee'].replace('$', '').replace(',', ''))
                        : 0;

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
                await prisma.$disconnect();
            }
        },
        error: (error: ParseError) => {
            console.error('❌ Error parsing CSV:', error);
        }
    });
}

loadCards();