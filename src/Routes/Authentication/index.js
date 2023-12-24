import { TokenStatus } from '../../Constants/Token';
import { Role } from '../../Constants/User';
import HTTPError from '../../Exceptions/HTTPError';
import Joi from '../../Joi';
import Authentication from '../../Middlewares/Authentication';
import { Token } from '../../Models/Token';
import { User } from '../../Models/User';
import UserService from '../../Services/User';
import { makeSha512 } from '../../Utils/Encription';
import { getDocument } from '../../Utils/MongoHelper';

const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(30).required(),
  passwordAgain: Joi.string().min(8).max(30).required(),
  isHost: Joi.boolean().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(30).required()
});

const login = async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).send({
      errors: error.details
    });
  }
  const { email, password } = req.body;

  try {
    const user = await UserService.findOne({ email });

    if (user) {
      const passwordHash = makeSha512(password, user.passwordSalt);
      if (passwordHash === user.passwordHash) {
        const token = await user.createToken();
        return res.json({ user, token });
      }
    }

    throw new HTTPError('Username or password is incorrect!', 401);
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      errors: error.details
    });
  }

  const { firstName, lastName, email, password, passwordAgain, isHost } = req.body;

  if (password !== passwordAgain) {
    return res.status(400).json({
      error: 'Passwords must be same!'
    });
  }

  try {
    const user = await UserService.create({
      firstName,
      lastName,
      email,
      password,
      passwordAgain,
      role: isHost ? Role.Host : Role.Traveler
    });
    return res.status(201).json(user);
  } catch (error) {
    let errorMsg = error.toString();
    if (error.keyValue) {
      // if mongoose throw exception like duplication error
      let key = Object.keys(error.keyValue)[0];
      switch (key) {
        case 'email':
          key = 'Email';
          break;
      }
      errorMsg = `${key} is already in use!`;
    }
    next({
      message: errorMsg
    });
  }
};

const logout = async (req, res, next) => {
  try {
    const value = req.headers['x-access-token'];
    const token = await getDocument(Token, { value });

    if (token.status !== TokenStatus.Active) {
      return res.status(400).send();
    }

    await token.expire();

    return res.status(200).send();
  } catch (err) {
    next(err);
  }
};

// get me fonksiyonu tokenı alıp userı getir
const me = async (req, res) => {
  const value = req.headers['x-access-token'];
  const token = await getDocument(Token, { value });

  if (!token || token.isExpired()) {
    return res.status(401).send();
  }

  return res.json({
    user: new User(req.user),
    token
  });
};

export default [
  {
    prefix: '/authentication',
    inject: (router) => {
      router.post('/register', register);
      router.post('/login', login);
      router.get('/logout', logout);
      router.get('/me', me);
    }
  }
];
