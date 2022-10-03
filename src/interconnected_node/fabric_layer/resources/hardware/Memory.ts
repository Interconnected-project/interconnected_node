export interface Memory {
  get totalSizeMb(): number;

  get currentlyAvailableMb(): number;
}
