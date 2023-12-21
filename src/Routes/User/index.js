import UserService from '../../Services/User';
import Joi from '../../Joi.js';
import { isMongoObjectId } from '../../Utils/MongoHelper.js';
import Authentication from '../../Middlewares/Authentication.js';
import HTTPError from '../../Exceptions/HTTPError.js';
import { Role } from '../../Constants/User.js';
import { User } from '../../Models/User.js';

const updateSchema = {
  body: Joi.object({
    firstName: Joi.string().min(2).max(30),
    lastName: Joi.string().min(2).max(30)
  })
};

const getUsers = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await UserService.find(username);
    res.send(user);
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
    res.send(user);
  } catch (err) {
    next(err);
  }
};

// const updateUser = async (req, res, next) => {
//   const { error } = updateSchema.body.validate(req.body);
//   if (error) {
//     return res.status(400).send({
//       errors: error.details
//     });
//   }

//   // if (!user || user.deletedAt) {
//   //   throw new HTTPError('User not found');
//   // }

//   // if (user.role !== Role.Admin && user._id != req.params.id) {
//   //   return res.status(401).send();
//   // }

//   // if (user.role !== Role.Admin && user.role === Role.Admin) {
//   //   return res.status(400).send();
//   // }

//   try {
//     const user = await UserService.update({ ...req.body }, req.params.id);
//     res.status(200).send(user);
//   } catch (err) {
//     next(err);
//   }
// };

// const deleteUser = async (req, res) => {
//   const isDeleted = await UserService.deleteUser(req.user.id);
//   if (isDeleted) {
//     res.send(200, {
//       message: 'Successfully deleted'
//     });
//   }
// };

export default [
  {
    prefix: '/users',
    inject: (router) => {
      router.use(Authentication);
      router.get('', getUsers);
      router.get('/:id', getUser);
      //router.put('/:id', updateUser);
      //router.delete('/:id', deleteUser);
    }
  }
];
