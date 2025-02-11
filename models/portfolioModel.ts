import mongoose, { Schema, Document } from "mongoose";


interface Image {
  name: string;
  url: string;
}

interface Card {
    style: string;
    color: string;
    size: string;
    body: string;
    opacity: number;
    url: string;
    image: string;
    isSubPage: boolean;
    subPage: {
      description: string;
      functionality: string;
      tags: string[],
      link: {
          code: string;
          live: string;
      },
      images: Image[]
    }
  }

interface Collection {
  name: string;
  cards: Card[];
}

interface IPortfolio extends Document {
  userName: string;
  collections: Collection[]
}


const imageSchema = new Schema<Image>({
  name: { type: String},
  url: { type: String},
});


const cardSchema = new Schema<Card>({
    style: { type: String},
    color: { type: String},
    size: { type: String},
    body: { type: String},
    opacity: { type: Number},
    url: { type: String},
    image: { type: String},
    isSubPage: { type: Boolean },
    subPage: {
      description: { type: String },
      functionality: { type: String },
      tags: { type: [String] },
      link: {
        code: { type: String },
        live: { type: String }
      },
      images: { type: [imageSchema] }
    }
});

const collectionSchema = new Schema<Collection>({
    name: { type: String},
    cards: { type: [cardSchema] },
});


const portfolioSchema = new Schema<IPortfolio>(
  {
    userName: { type: String},
    collections: { type: [collectionSchema] },
  },
  {
    timestamps: true, 
  }
);

const Portfolio = mongoose.model<IPortfolio>("Portfolio", portfolioSchema);

export default Portfolio;

