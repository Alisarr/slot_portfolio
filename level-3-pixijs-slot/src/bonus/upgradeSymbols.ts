import type {Board, Reel, SymbolId} from  "../core/types";

function upgradeSymbol(symbol: SymbolId): SymbolId{
    return symbol === "low-1" ? "high-1" : symbol;
}

function upgradeReel(reel: Reel): Reel {
    return[
        upgradeSymbol(reel[0]),
        upgradeSymbol(reel[1]),
        upgradeSymbol(reel[2]),
    ];
}

export function upgradeSymbols(board: Board): Board {
    return [
        upgradeReel(board[0]),
        upgradeReel(board[1]),
        upgradeReel(board[2]),
        upgradeReel(board[3]),
        upgradeReel(board[4]),
    ];
}