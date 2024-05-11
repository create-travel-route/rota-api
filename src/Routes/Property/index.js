import PropertyService from '../../Services/Property.js';
import Joi from '../../Joi.js';
import { isMongoObjectId } from '../../Utils/MongoHelper.js';

const createPropertySchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(2).max(500).required(),
  category: Joi.string().required(),
  address: Joi.string().min(2).max(500).required(),
  lat: Joi.number().min(-90).max(90).required(),
  lng: Joi.number().min(-180).max(180).required(),
  budget: Joi.number().required()
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
    const properties = await PropertyService.find();
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
  const { lon1, lat1, lon2, lat2, budget } = req.query;

  try {
    const properties = await PropertyService.getPropertiesByLocation({
      lon1,
      lat1,
      lon2,
      lat2
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
    const { dist, cost, Next } = await PropertyService.floydWarshallWithBudgetConstraint(
      matrix,
      budget
    );

    const path = await PropertyService.createRoute(dist);

    const pathWithProperty = path.map((node) => newProperties[node]);
    res.json(pathWithProperty);
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
      router.get('/places', getPropertiesBetweenTwoLocations);
      router.get('/route', createRoute);
      router.get('/:id', getProperty);
      router.delete('/:id', deleteProperty);
    }
  }
];
