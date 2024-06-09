import PropertyService from '../../Services/Property.js';
import Joi from '../../Joi.js';
import HTTPError from '../../Exceptions/HTTPError.js';
import { isMongoObjectId } from '../../Utils/MongoHelper.js';
import { Role } from '../../Constants/User.js';

const createPropertySchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(2).max(500).required(),
  category: Joi.string().required(),
  address: Joi.string().min(2).max(500).required(),
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  budget: Joi.number().required()
});

const reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().min(2).max(500).required()
});

const createProperty = async (req, res, next) => {
  const { error } = createPropertySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      errors: error.details
    });
  }

  const { title, description, category, address, lng, lat, budget } = req.body;

  try {
    const property = await PropertyService.create({
      title,
      description,
      category,
      address,
      lng,
      lat,
      budget,
      rating: 0,
      hostId: req.user._id
    });
    return res.status(201).json({
      property: property.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

const getProperties = async (req, res, next) => {
  try {
    const properties = await PropertyService.find({
      deletedAt: null,
      ...req.query
    });
    res.json(properties);
  } catch (err) {
    next(err);
  }
};

const getProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isMongoObjectId(id)) {
      return res.status(400).send();
    }

    const property = await PropertyService.findOneById(id);
    res.json(property);
  } catch (err) {
    next(err);
  }
};

const updateProperty = async (req, res, next) => {
  const { id } = req.params;
  if (!isMongoObjectId(id)) {
    return res.status(400).send();
  }

  const { error } = createPropertySchema.validate(req.body);
  if (error) {
    return res.status(400).send({
      errors: error.details
    });
  }

  const user = req.user;

  if (!user || user.deletedAt) {
    throw new HTTPError('User not found');
  }

  try {
    const property = await PropertyService.findOneById(id);
    if (!property) {
      throw new HTTPError('Property not found');
    }

    if (
      user.role === Role.Traveler ||
      user.role === Role.Guest ||
      (user.role === Role.Host && property.hostId.toString() !== user._id.toString())
    ) {
      return res.status(401).send();
    }

    const updatedProperty = await PropertyService.update({ ...req.body }, id);
    return res.status(200).json({
      property: updatedProperty.toJSON()
    });
  } catch (err) {
    next(err);
  }
};

const deleteProperty = async (req, res) => {
  const { id } = req.params;
  if (!isMongoObjectId(id)) {
    return res.status(400).send();
  }

  const isDeleted = await PropertyService.deleteProperty(id);
  if (!isDeleted) {
    return res.status(400).json({
      message: 'Property could not be deleted'
    });
  }

  res.status(200).json({
    message: 'Successfully deleted'
  });
};

const getPropertiesBetweenTwoLocations = async (req, res, next) => {
  const { lon1, lat1, lon2, lat2 } = req.query;

  try {
    const properties = await PropertyService.getPropertiesByLocation({
      lon1,
      lat1,
      lon2,
      lat2
    });
    res.json(properties);
  } catch (err) {
    next(err);
  }
};

const createRoute = async (req, res, next) => {
  const { lon1, lat1, lon2, lat2, budget = Infinity, review, ...otherFilters } = req.query;

  let minReviewCount = 0;
  let maxReviewCount = Infinity;

  switch (parseInt(review, 10)) {
    case 0:
      minReviewCount = 0;
      maxReviewCount = 4;
      break;
    case 1:
      minReviewCount = 5;
      maxReviewCount = 10;
      break;
    case 2:
      minReviewCount = 10;
      break;
    case 3:
      minReviewCount = 20;
      break;
    default:
      break;
  }

  try {
    const properties = await PropertyService.getPropertiesByLocation({
      lon1,
      lat1,
      lon2,
      lat2,
      deletedAt: null,
      $expr: {
        $and: [
          { $gte: [{ $size: '$reviews' }, minReviewCount] },
          { $lte: [{ $size: '$reviews' }, maxReviewCount] }
        ]
      },
      ...otherFilters
    });

    const newProperties = [
      {
        title: 'Başlangıç', // Mekan ismi
        distance: 0, // Mesafe
        budget: 0, // Bütçe
        location: {
          coordinates: [lon1, lat1]
        }
      },
      ...properties,
      {
        title: 'Bitiş', // Mekan ismi
        distance: 0, // Mesafe
        budget: 0, // Bütçe
        location: {
          coordinates: [lon2, lat2]
        }
      }
    ];

    // Matrisi oluştur
    const matrix = await PropertyService.createMatrix(newProperties);
    const { dist, cost } = await PropertyService.floydWarshallWithBudgetConstraint(matrix);

    const path = await PropertyService.createRoute(dist, cost, budget);
    const pathWithProperty = path.map((node) => newProperties[node]);
    res.json(pathWithProperty);
  } catch (err) {
    next(err);
  }
};

const reviewProperty = async (req, res, next) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!isMongoObjectId(id)) {
    return res.status(400).send();
  }
  if (rating < 1 || rating > 5 || comment === null) {
    return res.status(400).send();
  }

  const { error } = reviewSchema.validate(req.body);
  if (error) {
    return res.status(400).send({
      errors: error.details
    });
  }

  const user = req.user;

  if (!user || user.deletedAt) {
    throw new HTTPError('User not found');
  }

  try {
    const property = await PropertyService.findOneById(id);
    if (!property) {
      throw new HTTPError('Property not found');
    }

    await PropertyService.addReview({ user: user._id, rating, comment }, id);
    return res.status(200).send();
  } catch (err) {
    next(err);
  }
};

export default [
  {
    prefix: '/properties',
    inject: (router) => {
      router.post('', createProperty);
      router.get('', getProperties);
      router.put('/:id', updateProperty);
      router.get('/places', getPropertiesBetweenTwoLocations);
      router.get('/route', createRoute);
      router.get('/:id', getProperty);
      router.delete('/:id', deleteProperty);
      router.post('/:id/review', reviewProperty);
    }
  }
];
