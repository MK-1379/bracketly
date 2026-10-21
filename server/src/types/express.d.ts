declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

export {};
