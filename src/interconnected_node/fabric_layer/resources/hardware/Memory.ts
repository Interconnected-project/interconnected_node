export interface Memory {
  getTotalSizeMb(): number;

  getCurrentlyAvailableMb(): number;
}
