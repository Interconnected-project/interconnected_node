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

  static get REQUEST_CONNECTION(): string {
    return 'REQUEST_CONNECTION';
  }

  static get ANSWER_CONNECTION(): string {
    return 'ANSWER_CONNECTION';
  }

  static get ICE_CANDIDATE(): string {
    return 'ICE_CANDIDATE';
  }
}
