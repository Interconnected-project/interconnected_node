import { Hardware } from './hardware/Hardware';
import { Network } from './network/Network';
import { Software } from './software/Software';

export class Resources {
  private _hardware: Hardware;
  private _software: Software;
  private _network: Network;

  constructor(hardware: Hardware, software: Software, network: Network) {
    this._hardware = hardware;
    this._software = software;
    this._network = network;
  }

  get hardware(): Hardware {
    return this._hardware;
  }

  get software(): Software {
    return this._software;
  }

  get network(): Network {
    return this._network;
  }
}
