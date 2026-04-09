import { m21 } from './src/engine/data/m21';

try {
    const cards = Object.values(m21).map(card => ({
        name: card.name,
        oracleText: card.oracleText,
        engineStatus: card.abilities?.length ? 'IMPLEMENTED' : 'DATA_ONLY',
        manualStatus: card.abilities?.length ? 'VERIFIED' : 'MISSING',
    }));
    console.log(`Success! Found ${cards.length} cards.`);
    console.log('Sample:', cards[0]);
} catch (e) {
    console.error('Crash in registry logic:', e);
}
