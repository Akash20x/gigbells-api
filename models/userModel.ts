import mongoose ,{ Schema, Document } from "mongoose";

interface IUser extends Document {
    name: string;
    email: string;
    userName: string;
    password: string;
  }

const userSchema = new Schema<IUser>(
    {
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      userName: {
        type: String,
      },
      password: {
        type: String,
      }
    }
  );

const User = mongoose.model<IUser>("user", userSchema);

export default User;