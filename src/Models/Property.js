import mongoose, { Types } from 'mongoose';
import { Category } from '../Constants/Property';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: Category,
    default: 'property'
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      index: '2dsphere'
    }
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    type: Number,
    required: true,
    default: 0
  },
  hostId: {
    type: Types.ObjectId,
    ref: 'user',
    default: null,
    sparse: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null }
});

propertySchema.methods.toJSON = function () {
  const values = { ...this.toObject() };

  delete values.__v;
  values.id = values._id;

  delete values._id;

  return values;
};

export const Property = mongoose.model('Property', propertySchema);
