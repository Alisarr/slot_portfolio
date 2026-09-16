import type {Board} from "./types";

export function countScatters(board: Board): number {
    let scatterCount = 0;
    for ( const reel of board){
        for (const symbol of reel){
            if (symbol === "scatter"){
                scatterCount += 1;
            }
        }
    }
    return scatterCount;
}
export function shouldTriggerBonus(board: Board): boolean {
  const scatterCount = countScatters(board);

  return scatterCount >= 3;}
  