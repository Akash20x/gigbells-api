import { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";

  
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
  
    if (authHeader) {
      const token = authHeader.split(' ')[1];
  
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if(decoded.sub){
            next();
        }        
          
      } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
      }
    } else {
      return res.status(401).json({ message: 'You are not authenticated!' });
    }
  };
  

  export default verifyToken
