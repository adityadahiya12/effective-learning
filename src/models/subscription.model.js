import mongoose , {Schema } from "mongoose";

const subscriptionSchema = new Schema({
  subscriber: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },// one who is subscribing 
  channel: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription = mongoose.model("Subscription", subscriptionSchema);
