import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { get } from '../utils/redis';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.path.includes(`/api/${process.env.VERSION}/auth`)) return next();
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.replace("Bearer ", "");
    if (!token) throw new Error("Unauthorized");

    const publicKey = await get(token)

    if (!publicKey) throw new Error("Unauthorized");

    const user = jwt.verify(token, publicKey, { algorithms: ['RS256'] })
    req.user = user
    if (user) next();
  } catch (error) {
    console.log(error);
    if (error.expiredAt) {
      delete error.expiredAt;
      error.message = "Token timeout";
    }
    res.status(401).json({ code: 401, message: error.message, error });
  }
};