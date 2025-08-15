import mongooose , {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username: { type: String, required: true, unique: true,lowercase: true,trim:true ,index:true },
    email: { type: String, required: true, unique: true ,lowercase: true,trim:true },
    fullname: { type: String, required: true, trim: true },
    avatar: { type: String, required: true, trim: true },
    coverImage :{ type: String, required: true, trim: true },
    watchHistory: [{ type: Schema.Types.ObjectId, ref: "Video" }],

    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.isPasswordMatch = async function (password) {
    return await bcrypt.compare(password, this.password);
};


userSchema.methods.generateAccessToken = function () {
    return jwt.sign({ id: this._id,email: this.email ,username: this.username }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
    });
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
    });
};  

const User = mongoose.model("User", userSchema);

export default User;
