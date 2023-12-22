import mongoose, { ObjectId } from 'mongoose';
import { TokenStatus, TokenType } from '../Constants/Token';

const tokenSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: TokenType
  },
  status: {
    type: String,
    enum: TokenStatus
  },
  userId: {
    type: ObjectId,
    ref: 'user',
    default: null,
    sparse: true
  },
  expiredAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null }
});

tokenSchema.methods.toJSON = function () {
  const values = { ...this.toObject() };

  delete values.__v;
  delete values._id;
  delete values.createdAt;
  delete values.updatedAt;
  delete values.deletedAt;

  return values;
};

tokenSchema.methods.isExpired = function () {
  return this.status === TokenStatus.Expired || this.expired_at < Date.now();
};

tokenSchema.methods.expire = async function () {
  this.status = TokenStatus.Expired;
  this.expiredAt = new Date();
  this.updatedAt = new Date();
  await this.save();
};

export const Token = mongoose.model('Token', tokenSchema);
