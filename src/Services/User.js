import { createSaltHashPassword } from '../Utils/Encription';
import { User } from '../Models/User';
import { getDocByForeignKey } from '../Utils/MongoHelper';
import { Token } from '../Models/Token';

// create user
const create = async ({ firstName, lastName, email, password, role }) => {
  const { hash: passwordHash, salt: passwordSalt } = createSaltHashPassword(password);

  const newUser = await User.create({
    firstName,
    lastName,
    role,
    email,
    passwordHash,
    passwordSalt
  });

  return newUser;
};

// all users
const find = async (where) => {
  const users = await User.find(where).exec();

  return users;
};

// find one by where
const findOne = async (where) => {
  if (typeof where !== 'object') {
    throw Error('Invalid find one filter');
  }
  const user = await User.findOne(where).exec();

  return user;
};

// find one user by id
const findOneById = async (id) => {
  const user = await User.findById(id).exec();

  return user;
};

// find user by token
const getUserFromToken = async (value) => {
  return (
    await getDocByForeignKey(
      Token,
      { value },
      {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    )
  )?.user[0];
};

// update user
const update = async ({ firstName, lastName }, id) => {
  const user = await findOneById(id);

  Object.assign(user, { firstName, lastName });
  return await user.save();
};

// delete user
const deleteUser = async (id) => {
  const userToDelete = await findOneById(id);

  if (!userToDelete) {
    return false;
  }

  userToDelete.deletedAt = new Date();
  userToDelete.updatedAt = new Date();

  userToDelete.save();

  return 'OK';
};

const UserService = { create, find, findOne, getUserFromToken, findOneById, update, deleteUser };

export default UserService;
