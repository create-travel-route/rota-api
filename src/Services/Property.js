import { Property } from '../Models/Property';

// create property
const create = async ({
  title,
  description,
  category,
  address,
  lng,
  lat,
  budget,
  rating,
  hostId
}) => {
  const property = await Property.create({
    title,
    description,
    category,
    address,
    location: {
      type: 'Point',
      coordinates: [lng, lat]
    },
    budget,
    rating,
    hostId
  });

  return property;
};

// all properties
const find = async (where) => {
  const properties = await Property.find(where).exec();

  return properties;
};

// find one by where
const findOne = async (where) => {
  if (typeof where !== 'object') {
    throw Error('Invalid find one filter');
  }
  const property = await Property.findOne(where).exec();

  return property;
};

// find one property by id
const findOneById = async (id) => {
  const property = await Property.findById(id).exec();

  return property;
};

// update property
const update = async ({ title, description, category, address, location }, id) => {
  const property = await findOneById(id);

  Object.assign(property, { title, description, category, address, location });
  return await property.save();
};

// delete property
const deleteProperty = async (id) => {
  const propertyToDelete = await findOneById(id);

  if (!propertyToDelete) {
    throw Error("Property not found or you don't have permission.");
  }

  propertyToDelete.deletedAt = new Date();
  propertyToDelete.updatedAt = new Date();

  propertyToDelete.save();

  return 'OK';
};

const getPropertiesByLocation = async ({ lon1, lat1, lon2, lat2 }) => {
  const properties = await find({
    location: {
      $geoWithin: {
        $box: [
          [lon1, lat1],
          [lon2, lat2]
        ]
      }
    }
  });

  return properties;
};

const PropertyService = {
  create,
  find,
  findOne,
  findOneById,
  update,
  deleteProperty,
  getPropertiesByLocation
};

export default PropertyService;
