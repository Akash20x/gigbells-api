import jwt from "jsonwebtoken";

const getUserIDFromToken = (req: any) => {
  const authHeader = req.headers.authorization;

  const tokenValue = authHeader.split(' ')[1];

  try {
    const decodedToken = jwt.verify(tokenValue, process.env.JWT_SECRET as string);
    const userId = decodedToken.sub;

    return userId;
  } catch (error) {

  if (error.name === 'TokenExpiredError') {
    return 'TokenExpired';
  }

  return null; 
  }
};


interface DecodedToken {
  sub: string; 
  role: string; 
  userName: string;
}

  const getUserNameFromToken = (req: any) => {
    const authHeader = req.headers.authorization;
  
    const tokenValue = authHeader.split(' ')[1];
  
    try {
      const decodedToken = jwt.verify(tokenValue, process.env.JWT_SECRET as string) as DecodedToken;
      const userName = decodedToken.userName;
  
      return userName;
    } catch (error) {
      return null;
    }
  };
  
  

export {getUserIDFromToken, getUserNameFromToken}