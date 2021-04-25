interface Session {
  id?: string;
}

declare namespace Express {
  export interface Request {
    session: Session;
    callId?: string;
  }
}
