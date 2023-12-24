export const SECRET_KEY = process.env.SECRET_KEY || 'mi3sjsQDwdEFm655LBu8URhk2fTjb34u';

const IGNORE_REGEX = '([^/]+)'; // confim all cases except / char
const IGNORE = ':IGNORE:';
const l = '/'; // slash (/) char
const s = '^'; // start
const e = '$'; //end

export const PATHS = [
  {
    path: '/authentication/login',
    method: 'POST'
  },
  {
    path: '/authentication/register',
    method: 'POST'
  }
  //   {
  //     path: `/pharmacies/${IGNORE}/is-exist`,
  //     method: 'GET'
  //   },
];

let a = PATHS.map((p) => {
  return {
    ...p,
    path: new RegExp(s + p.path.replaceAll('/', l).replaceAll(':IGNORE:', IGNORE_REGEX) + e)
  };
});

export const WHITELIST = a;
