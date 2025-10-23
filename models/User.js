import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true},
  profileImageUrl: {type: String, default: null},
  role: { type:String, enum:["admin", "member"], default: "member"}, //Role-based access
  tokenVersion: { type: Number, default: 0 },
},
{ timestamps: true }
);

export default mongoose.model("User", UserSchema);