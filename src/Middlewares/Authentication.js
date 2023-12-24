import UserService from '../Services/User';
import { WHITELIST } from '../constants/api';

let isIgnoredPath = (path, method) => {
  return WHITELIST.some((p) => p.method === method && p.path.test(path));
};

const Authentication = async (req, res, next) => {
  if (isIgnoredPath(req.path, req.method)) {
    return next();
  }

  const token = req.header('x-access-token');
  if (!token)
    return res.status(401).json({
      error: 'No token available.'
    });
  req.user = null;
  req.user = (await UserService.getUserFromToken(token)) ?? null;

  if (!req.user || req.user.deletedAt) {
    return res.status(401).json({
      error: 'No user.'
    });
  }

  next();
};

export default Authentication;
