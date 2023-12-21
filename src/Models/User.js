import mongoose from 'mongoose';
import { encrypt } from '../Utils/Encription';
import { Role } from '../Constants/User';
import { Token } from './Token';
import { TokenStatus, TokenType } from '../Constants/Token';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  passwordSalt: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: Role,
    default: 'user'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null }
});

userSchema.methods.toJSON = function () {
  const values = { ...this.toObject() };

  delete values.passwordHash;
  delete values.passwordSalt;
  delete values.__v;
  values.id = values._id;

  delete values._id;

  return values;
};

userSchema.methods.createToken = async function () {
  const expiredAt = new Date();
  expiredAt.setDate(new Date().getDate() + 30);

  const timestamp = Math.round(new Date().getTime() / 1000);
  const key = `${this.id}_${this.passwordHash}_${timestamp}`;

  const token = await Token.create({
    value: encrypt(key),
    type: TokenType.Auth,
    status: TokenStatus.Active,
    userId: this.id,
    expiredAt
  });

  return token;
};

export const User = mongoose.model('User', userSchema);
