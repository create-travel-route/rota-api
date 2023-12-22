import UserService from '../../Services/User';
import Joi from '../../Joi.js';
import { isMongoObjectId } from '../../Utils/MongoHelper.js';
import Authentication from '../../Middlewares/Authentication.js';
import HTTPError from '../../Exceptions/HTTPError.js';
import { Role } from '../../Constants/User.js';
import { User } from '../../Models/User.js';

const updateSchema = Joi.object({
  firstName: Joi.string().min(2).max(30),
  lastName: Joi.string().min(2).max(30)
});

const getUsers = async (req, res, next) => {
  try {
    const users = await UserService.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isMongoObjectId(id)) {
      return res.status(400).send();
    }

    const user = await UserService.findOneById(id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  const { id } = req.params;
  if (!isMongoObjectId(id)) {
    return res.status(400).send();
  }

  const { error } = updateSchema.validate(req.body);
  if (error) {
    return res.status(400).send({
      errors: error.details
    });
  }

  const user = req.user;

  if (!user || user.deletedAt) {
    throw new HTTPError('User not found');
  }

  if (user.role !== Role.Admin && user._id != id) {
    return res.status(401).send();
  }

  try {
    const user = await UserService.update({ ...req.body }, id);
    res.status(200).send(user);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!isMongoObjectId(id)) {
    return res.status(400).send();
  }

  const user = req.user;

  if (!user || user.deletedAt) {
    throw new HTTPError('User not found');
  }

  if (user.role !== Role.Admin && user._id != id) {
    return res.status(401).send();
  }

  const isDeleted = await UserService.deleteUser(id);
  if (!isDeleted) {
    return res.status(400).json({
      message: 'Error'
    });
  }
  res.status(200).json({
    message: 'Successfully deleted'
  });
};

export default [
  {
    prefix: '/users',
    inject: (router) => {
      router.get('', getUsers);
      router.get('/:id', getUser);
      router.put('/:id', updateUser);
      router.delete('/:id', deleteUser);
    }
  }
];
