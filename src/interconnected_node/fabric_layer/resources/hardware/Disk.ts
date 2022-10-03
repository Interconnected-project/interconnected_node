import { DiskType } from './DiskType';

export interface Disk {
  get diskType(): DiskType;

  get sizeMb(): number;

  get currentlyAvailableMb(): number;
}
