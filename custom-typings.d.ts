declare module '@browserbasehq/stagehand' {
  export class Stagehand {
    constructor(config: any);
    init(): Promise<void>;
    page: any;
    close(): Promise<void>;
  }
} 