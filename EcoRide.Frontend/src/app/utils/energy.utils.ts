export function getEnergyIcon(type: string): string {
  switch (type) {
    case 'Electric': return '\u26A1';
    case 'Hybrid': return '\uD83D\uDD0B';
    case 'LPG': return '\uD83C\uDF3F';
    default: return '\u26A1';
  }
}
