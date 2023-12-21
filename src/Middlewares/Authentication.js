import UserService from '../Services/User';

const Authentication = async (req, res, next) => {
  const token = req.header('x-access-token');
  if (!token)
    return res.status(401).send({
      error: 'No token available.'
    });
  req.user = null;
  req.user = (await UserService.getUserFromToken(token)) ?? null;

  next();
};

export default Authentication;
