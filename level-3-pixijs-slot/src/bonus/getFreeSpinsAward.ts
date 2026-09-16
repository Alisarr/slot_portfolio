export function getFreeSpinsAward(scatterCount: number): number {
  if (scatterCount >= 5) {
    return 20;
  }

  if (scatterCount === 4) {
    return 15;
  } 
  if (scatterCount === 3) {
    return 10;
  }

  return 0;
}