import { io, Socket } from 'socket.io-client';
import JobsRepository from '../contribution/common/JobsRepository';
import ClientSpecificP2PConnectionBuilders from '../p2p/builders/ClientSpecificP2PConnectionBuilders';
import MasterP2PConnectionsHub from '../p2p/hubs/MasterP2PConnectionsHub';
import SlaveP2PConnectionsHub from '../p2p/hubs/SlaveP2PConnectionsHub';
import applyBrokerServiceSocketHandlers from './applyBrokerServiceSocketHandlers';
import DeviceType from './DeviceType';

export default class BrokerServiceSocket {
  private socket: Socket | undefined;
  private slaveP2PConnectionsHub: SlaveP2PConnectionsHub;
  private masterP2PConnectionsHub: MasterP2PConnectionsHub;
  private jobsRepository: JobsRepository;

  constructor(
    private interconnectedNodeId: string,
    private builders: ClientSpecificP2PConnectionBuilders,
    private deviceType: DeviceType
  ) {
    this.socket = undefined;
    this.slaveP2PConnectionsHub = new SlaveP2PConnectionsHub();
    this.masterP2PConnectionsHub = new MasterP2PConnectionsHub();
    this.jobsRepository = new JobsRepository();
  }

  open(brokerServiceAddress: string): void {
    if (this.socket !== undefined) {
      throw new Error('BrokerServiceSocket already opened');
    }
    this.socket = io(brokerServiceAddress, {
      autoConnect: false,
      query: {
        id: this.interconnectedNodeId,
        role: 'NODE',
      },
    });
    applyBrokerServiceSocketHandlers(
      this.socket,
      this.interconnectedNodeId,
      this.slaveP2PConnectionsHub,
      this.masterP2PConnectionsHub,
      this.jobsRepository,
      this.builders,
      this.deviceType
    );
    this.socket.connect();
  }

  close(): void {
    if (this.socket === undefined) {
      throw new Error('BrokerServiceSocket is not open');
    }
    this.socket.disconnect();
    this.slaveP2PConnectionsHub.flush().forEach((s) => {
      this.jobsRepository.remove(s.operationId)?.stop();
      s.close();
    });
    this.masterP2PConnectionsHub.flush().forEach((m) => m.close());
    this.socket = undefined;
  }

  get isOpen(): boolean {
    return this.socket !== undefined;
  }

  get isConnected(): boolean {
    if (this.socket === undefined) {
      throw new Error('BrokerServiceSocket is not open');
    }
    return this.socket.connected;
  }

  get isContributing(): boolean {
    if (this.socket === undefined) {
      throw new Error('BrokerServiceSocket is not open');
    }
    return this.jobsRepository.isContributing;
  }
}
