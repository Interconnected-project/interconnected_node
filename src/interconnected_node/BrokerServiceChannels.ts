export default class BrokerServiceChannels {
  private constructor() {
    //does nothing
  }

  static get RECRUITMENT_REQUEST(): string {
    return 'RECRUITMENT_REQUEST';
  }

  static get RECRUITMENT_BROADCAST(): string {
    return 'RECRUITMENT_BROADCAST';
  }

  static get RECRUITMENT_ACCEPT(): string {
    return 'RECRUITMENT_ACCEPT';
  }

  static get OFFER_NODE(): string {
    return 'OFFER_NODE';
  }

  static get INITIALIZE_CONNECTION(): string {
    return 'INITIALIZE_CONNECTION';
  }

  static get INCOMING_CONNECTION(): string {
    return 'INCOMING_CONNECTION';
  }

  static get ANSWER_CONNECTION(): string {
    return 'ANSWER_CONNECTION';
  }

  static get FINALIZE_CONNECTION(): string {
    return 'FINALIZE_CONNECTION';
  }

  static get ICE_CANDIDATE(): string {
    return 'ICE_CANDIDATE';
  }
}
