import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import { getUserIDFromToken } from "../utils/user";


const createToken = (user: any, role?: string) => {
  const payload = {
    sub: user._id,
    role: role ? role : "user",
    userName: user.userName
  };

  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "5d",
  });
};


const registerUser = async (req: Request, res: Response) => {

  try {
  
    const { name, email, password, userName, role } = req.body;

    if (!name || !email || !password || !userName) {
      return res.status(400).json({ message: "All fields must be filled" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password is too short (minimum is 6 characters)" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { userName }],
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "EmailID has already been taken" });
      }
      if (existingUser.userName === userName) {
        return res.status(400).json({ message: "Username has already been taken" });
      }
    }

    // Create a new user
    const newUser = new User({
        name,
        email,
        password: await bcrypt.hash(password, 10),
        userName
    });

    // Save the new user
    await newUser.save();
    const token = createToken(newUser, role);

    return res.status(200).json({ token });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  
}


const loginUser = async (req: Request, res: Response) => {

    try {
    
      const { email, password} = req.body; 
  
      if (!email || !password ) {
        return res.status(400).json({ message: "All fields must be filled" });
      }
  
      const user = await User.findOne({email});
  
      if(!user){
        return res.status(400).json({message: "No User Found"})
      }
  
      const comparePasswords = await bcrypt.compare(password, user.password);
    
      if (!comparePasswords) {
        return res
          .status(400)
          .json({ message: "Invalid Email or password." });
      }
    
        const token = createToken(user);
  
        return res.status(200).json({token});
  
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
    
}



const getUserInfo = async (req: Request, res: Response) => {

  try {

    const id = getUserIDFromToken(req);


    if(!id){
      return res.status(400).json({message: "Login required to manage profile"})
    }

    if(id === 'TokenExpired'){
      return res.status(400).json({message: "Token Expired"})
    }
    
    const user = await User.findOne({_id: id});

    if(!user){
      return res.status(400).json({message: "This account doesn't exist"})
    }

    const userData = {
      "name": user.name,
      "userName": user.userName
    }

    return res.status(200).json({user: userData});
    
  } catch (error) {
    
    return res.status(500).json({ message: error.message });
  }
  
}


export default {registerUser, loginUser, getUserInfo}
  
