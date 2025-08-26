export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENV: 'staging' | 'prod' | 'test';
      USERNAME: string;
      PASSWORD: string;
      AMSUITEBASEURL: string;
      AMSUITECOREURL: string;
      AMSUITEGPAURL: string;
      USERSUCCESS: string;
    }
  }
}
