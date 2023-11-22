function getLevelFromXPAmount(xpAmount: BigInt): number {
  //levels work as follows.
  //Every level is 20 percent more xp than the previous level.
  //Level 1 is 100 xp.
  //Level 2 is 120 xp, including the previous 100 xp.
  //Level 3 is 144 xp, including the previous 120 xp and 100 xp and etc.
    let xpAmountNumber = parseInt(xpAmount.toString());
    let level = 1;
    let xpNeeded = 100;
    while (xpAmountNumber >= xpNeeded) {
        level++;
        xpNeeded = Math.round(xpNeeded * 1.2);
    }
    return level;
}

function xpToNextLevel(xpAmount: BigInt): number {
    let xpAmountNumber = parseInt(xpAmount.toString());
    let level = 1;
    let xpNeeded = 100;
    while (xpAmountNumber >= xpNeeded) {
        level++;
        xpNeeded = Math.round(xpNeeded * 1.2);
    }
    return xpNeeded - xpAmountNumber;
}

export {getLevelFromXPAmount, xpToNextLevel}