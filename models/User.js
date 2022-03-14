const mongoose = require("mongoose");
const { compare, hash } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    token: { type: String, trim: true },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

UserSchema.statics.findByEmailAndPassword = async (email, password) => {
  try {
    const user = await User.findOne({ email: email });
    console.log(user, "user2");
    if (!user) throw new Error("user not found");
    const isMatched = await compare(password, user.password);
    console.log(isMatched);
    if (!isMatched) throw new Error("type Valid Password");
    return user;
  } catch (err) {
    err.name = "Ststic Error";
    console.log(err);
    throw err;
  }
};

UserSchema.statics.findUserByToken = async (token) => {
  try {
    const user = await User.findOne({ token: token });
    if (!user) throw new Error("invalid Credentials");
    user.isConfirmed = true;
    await user.save();
    console.log(user);
    return user;
  } catch (err) {
    err.name = "Ststic Error";
    console.log(err);
    throw err;
  }
};

UserSchema.statics.findByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email });
    console.log(user);
    return user;
  } catch (err) {
    err.name = "Ststic Error";
    console.log(err);
  }
};

// new Date("2021-09-28T15:21:21.446+00:00").getTime()
//=> 1632842481446

UserSchema.methods.genrateToken = async function () {
  try {
    const user = this;
    const SecretKey = `${user.email}-${new Date(user.createdAt).getTime()}`;
    const token1 = await sign({ id: user._id }, SecretKey, {
      expiresIn: "30d",
    });
    user.token = token1;
    await user.save();
    return token1;
  } catch (err) {
    console.log(err);
  }
};

UserSchema.pre("save", async function (next) {
  try {
    const user = this;
    if (user.isModified("password")) {
      const hashPassword = await hash(user.password, 10);
      user.password = hashPassword;
      next();
    } else {
      next();
    }
  } catch (err) {
    console.log(err, "Schema Error");
  }
});

var User = mongoose.model("user", UserSchema);

module.exports = User;
