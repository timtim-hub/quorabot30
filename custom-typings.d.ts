declare module '@browserbasehq/stagehand' {
  export class Stagehand {
    constructor(config: any);
    init(): Promise<void>;
    page: any;
    close(): Promise<void>;
  }
}

declare module 'node-pop3' {
  export default class POP3Client {
    constructor(port: number, host: string, options: { tlserrs: boolean; enabletls: boolean; debug: boolean });
    on(event: string, callback: (...args: any[]) => void): void;
    login(username: string, password: string): void;
    list(): void;
    retr(msgnumber: number): void;
    quit(): void;
  }
} 