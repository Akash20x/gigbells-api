import mongoose, { Schema, Document } from "mongoose";

interface Social {
  platform: string;
  link: string;
}

interface Position {
  title: string;
  company: string;
  location: string;
  isCurrentPosition: boolean;
  startedAt: {
    month: string;
    year: string;
},
  endedAt: {
    month: string;
    year: string;
},
description: string;
}


interface Education {
  title: string;
  location: string;
  startedAtYear: string;
  endedAtYear: string;
  description: string;
}


interface Service {
  name: string;
  feeType: string;
  fixedCost: {
    currency: string;
    cost: string;
    durationType: string;
  };
  skills: string[];
  description: string;
  deliverables: string;
}

interface IProfile extends Document {
  name: string;
  description: string;
  skills: object;
  location: string;
  userName: string;
  social: Social[];
  image: string;
  about: string;
  positions: Position[],
  educationRecords: Education[],
  services: Service[]
}


const socialSchema = new Schema<Social>({
    platform: { type: String},
    link: { type: String },
});

const positionSchema = new Schema<Position>({
    title: { type: String},
    company: { type: String },
    location: { type: String },
    isCurrentPosition: {type: Boolean},
    startedAt: {type: Object},
    endedAt: {type: Object},
    description: {type: String}
});

const educationSchema = new Schema<Education>({
    title: { type: String},
    location: { type: String },
    startedAtYear: {type: String},
    endedAtYear: {type: String},
    description: {type: String}
});

const serviceSchema = new Schema<Service>({
    name: { type: String},
    feeType: { type: String },
    fixedCost: {type: Object},
    skills: { type: [String] },
    description: {type: String},
    deliverables: {type: String}
});


const profileSchema = new Schema<IProfile>(
  {
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    skills: {
      type: Schema.Types.Mixed, 
    },
    location: {
      type: String,
      trim: true,
    },
    userName: {
      type: String,
    },
    social: { type: [socialSchema] },
    image: {
      type: String,
    },
    about: {
      type: String,
    },
    positions: {
      type: [positionSchema]
    },
    educationRecords: {
      type: [educationSchema]
    },
    services: {
      type: [serviceSchema]
    }
  },
  {
    timestamps: true, 
  }
);

const Profile = mongoose.model<IProfile>("Profile", profileSchema);

export default Profile;

