import type {Board, Reel, SymbolId } from "./types";

const SYMBOL_POOL: readonly SymbolId[] = [
    "low-1", "low-1", "low-1", "low-1",
    "low-2", "low-2", "low-2", "low-2",
    "low-3", "low-3", "low-3",
    "low-4", "low-4", "low-4",
    "high-1", "high-1",
    "high-2",
    "high-3",
    "wild",
    "scatter",
];

function pickRandomSymbol(): SymbolId {
    const index = Math.floor(Math.random()* SYMBOL_POOL.length);
    const symbol = SYMBOL_POOL[index];

    if (symbol === undefined) {
        throw new Error("Symbol was not found");
    }

    return symbol;
}

function createReel(): Reel {

    return [
        pickRandomSymbol(),
        pickRandomSymbol(),
        pickRandomSymbol(),
    ];
}
export function generateBoard(): Board {
    return [
        createReel(),
        createReel(),
        createReel(),
        createReel(),
        createReel(),
    ];
}
    
