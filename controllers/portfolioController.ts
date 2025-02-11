import { Request, Response } from "express";
import Profile from "../models/profileModel";
import User from "../models/userModel";
import Portfolio from "../models/portfolioModel";
import { v2 as cloudinary } from 'cloudinary';
import { getUserIDFromToken, getUserNameFromToken } from "../utils/user";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const updateProfile = async (req: Request, res: Response) => {
        
  try {
    const { name, description, skills, location, userName, social } = req.body;

    if (!userName) {
      return res.status(400).json({ message: "Username is required to update the profile" });
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { userName }, 
      { name, description, skills, location, social }, 
      { new: true } 
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const profile = {
      name: updatedProfile.name, 
      description: updatedProfile.description,
      skills: updatedProfile.skills,
      location: updatedProfile.location,
      social: updatedProfile.social
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

}

const editProfileImage = async (req: Request, res: Response) => {
    
    
  try {
    const {userName, imageId} = req.body;

    if (!userName) {
      return res.status(400).json({ message: "Username is required to update the profile" });
    }

    
    if(imageId){

      const result = await cloudinary.uploader.destroy(imageId, { invalidate: true });
      
      if (result.result !== "ok") {
        return res.status(400).json({ message: "Failed to delete image" });
      }

      const updatedProfile = await Profile.findOneAndUpdate(
        { userName }, 
        { image: ''}, 
        { new: true } 
      );
  
      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
  
      return res.status(200).json(updatedProfile.image);
    
    }

   
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }


    // Convert buffer to base64
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fileBase64, {
        folder: "portal",
    });


    if (!result.secure_url) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { userName }, 
      { image: result.secure_url}, 
      { new: true } 
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json(updatedProfile.image);
  
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
    
}

const getUserPortfolio = async (req: Request, res: Response) => {
  try {
    const id = getUserIDFromToken(req);

    const user = await User.findOne({ _id: id });

    if (!user) {
      return res.status(400).json({ message: "This account doesn't exist" });
    }
      
    let profile = await Profile.findOne({ userName: user.userName });

    if (!profile) {
      profile = new Profile({ userName: user.userName, name: user.name });
      await profile.save();

      return res.status(200).json({ profile });

    }

    const portfolio = await Portfolio.findOne({ userName: user.userName });

    return res.status(200).json({ profile, portfolio });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserServices = async (req: Request, res: Response) => {
  
  try {
    const username = req.params.username; 

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
      
    let profile = await Profile.findOne({ userName: username });

    if (!profile) {
      return res.status(400).json({ message: "Account Not Exist" });
    }

    return res.status(200).json({ services: profile.services });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPortfolioPreview = async (req: Request, res: Response) => {
  
  try {

    const username = req.params.username; 
  
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }
      
    const profile = await Profile.findOne({ userName: username });

    if (!profile) {
      return res.status(400).json({ message: "Account Not Exist" });
    }

    const portfolio = await Portfolio.findOne({ userName: username });

    return res.status(200).json({ profile, portfolio });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
    
const addCollection = async (req: Request, res: Response) => {
        
  try {
    const { name } = req.body;

    const userName = getUserNameFromToken(req);

    
    if (!userName) {
      return res.status(400).json({ message: "Username is required to add collection" });
    }

    if (!name) {
      return res.status(400).json({ message: "Collection name is required" });
    }
    
    const updatedPortfolio = await Portfolio.findOneAndUpdate(
      { userName }, 
      { $push: { collections: { name, cards: [] } } }, 
      { new: true, upsert: true } 
    );
    

    if (!updatedPortfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    return res.status(200).json({portfolio: updatedPortfolio.collections});

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
    
}

const deleteCollection = async (req: Request, res: Response) => {
        
  try {
    const collectionId = req.query.collectionId;

    const userName = getUserNameFromToken(req);

    
    if (!userName) {
      return res.status(400).json({ message: "Username is required to delete collection" });
    }

    if (!collectionId) {
      return res.status(400).json({ message: "Collection ID is required" });
    }
    
    const updatedPortfolio = await Portfolio.findOneAndUpdate(
      { userName }, 
      { $pull: { collections: { _id: collectionId } } }, 
      { new: true } 
    );

    if (!updatedPortfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    return res.status(200).json({portfolio: updatedPortfolio.collections});

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
    
}

const editCollection = async (req: Request, res: Response) => {
        
  try {
    const collectionId = req.query.collectionId;

    const { name } = req.body;

    const userName = getUserNameFromToken(req);

    if (!userName) {
      return res.status(400).json({ message: "Username is required to edit collection" });
    }

    if (!name) {
      return res.status(400).json({ message: "Collection name is required" });
    }
    

    const updatedPortfolio = await Portfolio.findOneAndUpdate(
      { userName, "collections._id": collectionId }, 
      { $set: { "collections.$.name": name } }, 
      { new: true } 
    );

    if (!updatedPortfolio) {
      return res.status(404).json({ message: "Collection not found" });
    }

    return res.status(200).json({portfolio: updatedPortfolio.collections});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
    
}

const addCard = async (req: Request, res: Response) => {
      
  try {

    const collectionId = req.query.collectionId;

    const { card } = req.body;

    const userName = getUserNameFromToken(req);

    if (!userName) {
      return res.status(400).json({ message: "Username is required to add card" });
    }

    const newCard = {
      style: card.style,
      color: card.color,
      size: card.size,
      opacity: card.opacity,
      body: card.body,
      url: card.url,
      image: card.image,
      isSubPage: card.isSubPage,
      subPage: {
          description: card.subPage.description,
          functionality: card.subPage.functionality,
          tags: card.subPage.tags,
          link: card.subPage.link,
          images: card.subPage.images
      }
    }

    const updatedPortfolio = await Portfolio.findOneAndUpdate(
      {userName, "collections._id": collectionId},
      {$push: {"collections.$.cards": newCard}},
      {new: true}
    );
    

    if (!updatedPortfolio) {
      return res.status(404).json({ message: "Collection not found" });
    }

    return res.status(200).json({portfolio: updatedPortfolio.collections});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
    
}

const deleteCard = async (req: Request, res: Response) => {
    
  try {
    const collectionId = req.query.collectionId;
    const cardId = req.query.cardId;

    const userName = getUserNameFromToken(req);

    if (!userName) {
      return res.status(400).json({ message: "Username is required to delete card" });
    }

    if (!collectionId) {
      return res.status(400).json({ message: "Collection ID is required" });
    }

    if (!cardId) {
      return res.status(400).json({ message: "Card ID is required" });
    }
    
    const updatedPortfolio = await Portfolio.findOneAndUpdate(
      { userName, "collections._id": collectionId }, 
      { $pull: { "collections.$.cards": { _id: cardId } } }, 
      { new: true } 
    );
    
    if (!updatedPortfolio) {
      return res.status(404).json({ message: "Card or Collection not found" });
    }

    return res.status(200).json({portfolio: updatedPortfolio.collections});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
    
}  

const editCard = async (req: Request, res: Response) => {
  
  try {
    const collectionId = req.query.collectionId;
    const cardId = req.query.cardId;

    const { card } = req.body;

    const userName = getUserNameFromToken(req);

    if (!userName) {
      return res.status(400).json({ message: "Username is required to edit card" });
    }

    if (!cardId) {
      return res.status(400).json({ message: "Card ID is required" });
    }
    

    const updatedPortfolio = await Portfolio.findOneAndUpdate(
      { userName, "collections._id": collectionId },
      { $set: { "collections.$.cards.$[cardElem]": card } },
      { arrayFilters: [{ "cardElem._id": cardId }], new: true }
    );

    if (!updatedPortfolio) {
      return res.status(404).json({ message: "Card or Collection not found" });
    }

    return res.status(200).json({portfolio: updatedPortfolio.collections});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
    
}

const saveAbout = async (req: Request, res: Response) => {
        
  try {
    const { about } = req.body;

    const userName = getUserNameFromToken(req);

    if (!userName) {
      return res.status(400).json({ message: "Username is required to save about" });
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { userName }, 
      { about }, 
      { new: true } 
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({about: updatedProfile.about});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
    
}


const addPosition = async (req: Request, res: Response) => {
      
  try {

    const position = req.body;

    const userName = getUserNameFromToken(req);

    if (!userName) {
      return res.status(400).json({ message: "Username is required to add position" });
    }

    const newPosition = {
      title: position.title,
      company: position.company,
      location: position.location,
      isCurrentPosition: position.isCurrentPosition,
      startedAt: position.startedAt,
      endedAt: position.endedAt,
      description: position.description
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      {userName},
      { $push: { positions: newPosition } },
      {new: true}
    );
    

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({positions: updatedProfile.positions});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
    
}  

const deletePosition = async (req: Request, res: Response) => {
      
  try {
    const positionId = req.query.positionId;

    const userName = getUserNameFromToken(req);

    
    if (!userName) {
      return res.status(400).json({ message: "Username is required to delete position" });
    }

    if (!positionId) {
      return res.status(400).json({ message: "Position ID is required" });
    }
    
    const updatedProfile = await Profile.findOneAndUpdate(
      { userName }, 
      { $pull: { positions: { _id: positionId } } }, 
      { new: true } 
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Position not found" });
    }

    return res.status(200).json({positions: updatedProfile.positions});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
    
}

const editPosition = async (req: Request, res: Response) => {

  try {
    const positionId = req.query.positionId;

    const position = req.body;

    const updatedPosition = {
      title: position.title,
      company: position.company,
      location: position.location,
      isCurrentPosition: position.isCurrentPosition,
      startedAt: position.startedAt,
      endedAt: position.endedAt,
      description: position.description
    }

    const userName = getUserNameFromToken(req);

    if (!userName) {
      return res.status(400).json({ message: "Username is required to edit position" });
    }

    if (!positionId) {
      return res.status(400).json({ message: "Position ID is required" });
    }

    const updatedPortfolio = await Profile.findOneAndUpdate(
      { userName, "positions._id": positionId },
      { $set: { "positions.$[positionElem]": updatedPosition } },
      { arrayFilters: [{ "positionElem._id": positionId }], new: true }
    );

    if (!updatedPortfolio) {
      return res.status(404).json({ message: "Position not found" });
    }

    return res.status(200).json({positions: updatedPortfolio.positions});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
    
}


const addEducation = async (req: Request, res: Response) => {
  
  try {

    const education = req.body;
        
    const userName = getUserNameFromToken(req);

    if (!userName) {
      return res.status(400).json({ message: "Username is required to add education" });
    }

    const newEducation = {
      title: education.title,
      location: education.location,
      startedAtYear: education.startedAtYear,
      endedAtYear: education.endedAtYear,
      description: education.description
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      {userName},
      { $push: { educationRecords: newEducation } },
      {new: true}
    );
    
    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile Not Found" });
    }

    return res.status(200).json({education: updatedProfile.educationRecords});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
    
}  


const deleteEducation = async (req: Request, res: Response) => {
  
  try {
    const educationId = req.query.educationId;

    const userName = getUserNameFromToken(req);

    if (!userName) {
      return res.status(400).json({ message: "Username is required to delete education" });
    }

    if (!educationId) {
      return res.status(400).json({ message: "Position ID is required" });
    }
    
    const updatedProfile = await Profile.findOneAndUpdate(
      { userName }, 
      { $pull: { educationRecords: { _id: educationId } } }, 
      { new: true } 
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Education Record Not Found" });
    }

    return res.status(200).json({education: updatedProfile.educationRecords});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
    
} 

const editEducation = async (req: Request, res: Response) => {

  try {
    const educationId = req.query.educationId;

    const education = req.body;

    const updatedEducationRecord = {
      title: education.title,
      location: education.location,
      startedAtYear: education.startedAtYear,
      endedAtYear: education.endedAtYear,
      description: education.description
    }

    const userName = getUserNameFromToken(req);

    if (!userName) {
      return res.status(400).json({ message: "Username is required to edit education" });
    }

    if (!educationId) {
      return res.status(400).json({ message: "Education ID is required" });
    }
    

    const updatedPortfolio = await Profile.findOneAndUpdate(
      { userName, "educationRecords._id": educationId },
      { $set: { "educationRecords.$[educationRecordElem]": updatedEducationRecord } },
      { arrayFilters: [{ "educationRecordElem._id": educationId }], new: true }
    );

    if (!updatedPortfolio) {
      return res.status(404).json({ message: "Education Record Not Found" });
    }

    return res.status(200).json({education: updatedPortfolio.educationRecords});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
    
}

const addService = async (req: Request, res: Response) => {
  
  try {

    const service = req.body;
      
    const userName = getUserNameFromToken(req);

    if (!userName) {
      return res.status(400).json({ message: "Username is required to add service" });
    }

    const newService = {
      name: service.name,
      feeType: service.feeType,
      fixedCost: service.fixedCost,
      skills: service.skills,
      description: service.description,
      deliverables: service.deliverables
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      {userName},
      { $push: { services: newService } },
      {new: true}
    );
    

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({services: updatedProfile.services});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
    
}  

const deleteService = async (req: Request, res: Response) => {

  try {
    const serviceId = req.query.serviceId;

    const userName = getUserNameFromToken(req);

    if (!userName) {
      return res.status(400).json({ message: "Username is required to delete service" });
    }

    if (!serviceId) {
      return res.status(400).json({ message: "Service ID is required" });
    }
    
    const updatedProfile = await Profile.findOneAndUpdate(
      { userName }, 
      { $pull: { services: { _id: serviceId } } }, 
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.status(200).json({services: updatedProfile.services});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
    
} 


const editService = async (req: Request, res: Response) => {

  try {
    const serviceId = req.query.serviceId;

    const service = req.body;

    const updatedService = {
      name: service.name,
      feeType: service.feeType,
      fixedCost: service.fixedCost,
      skills: service.skills,
      description: service.description,
      deliverables: service.deliverables
    }

    const userName = getUserNameFromToken(req);

    if (!userName) {
      return res.status(400).json({ message: "Username is required to edit service" });
    }

    if (!serviceId) {
      return res.status(400).json({ message: "Service ID is required" });
    }
    

    const updatedPortfolio = await Profile.findOneAndUpdate(
      { userName, "services._id": serviceId },
      { $set: { "services.$[serviceElem]": updatedService } },
      { arrayFilters: [{ "serviceElem._id": serviceId }], new: true }
    );

    if (!updatedPortfolio) {
      return res.status(404).json({ message: "Service not found" });
    }

    return res.status(200).json({services: updatedPortfolio.services});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
    
}   


const uploadImage = async (req: Request, res: Response) => {
  
  try {

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert buffer to base64
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fileBase64, {
        folder: "portal",
    });

    res.json({
        public_id: result.public_id,
        url: result.secure_url,
    });
} catch (error) {
    res.status(500).json({ message: "Image upload failed" });
}
    
}
        
const deleteImage = async (req: Request, res: Response) => {
  
  try {
    const { public_id } = req.body; 

    if (!public_id) {
        return res.status(400).json({ error: "Public ID is required" });
    }

    // Delete the image
    const result = await cloudinary.uploader.destroy(public_id, { invalidate: true });

    if (result.result !== "ok") {
        return res.status(400).json({ error: "Failed to delete image" });
    }

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
      res.status(500).json({ message: "Image deletion failed" });
  }
    
}
        

export default {
    updateProfile,
    getUserPortfolio,
    getUserServices,
    editProfileImage,
    getPortfolioPreview,
    addCollection,
    deleteCollection,
    editCollection,
    addCard,
    editCard,
    deleteCard,
    saveAbout,
    addPosition,
    deletePosition,
    editPosition,
    addEducation,
    deleteEducation,
    editEducation,
    addService,
    deleteService,
    editService,
    uploadImage, 
    deleteImage
}