import { DiskType } from './DiskType';

export interface Disk {
  getDiskType(): DiskType;

  getSizeMb(): number;

  getCurrentlyAvailableMb(): number;
}
