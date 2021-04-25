import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { promisify } from 'util';

const signAsync = promisify(jwt.sign);
// make a JWT token with the onboardingStep in the payload
const create = async (userId: string, onboardingStep: number) => {
  const payload = {
    id: userId,
    onboardingStep
  };
  // @ts-ignore
  return signAsync(payload, JWT_SECRET!, {
    algorithm: 'HS256'
  });
};

const verifyAsync = promisify(jwt.verify);

const verify = async (token: string): Promise<any> => {
  // @ts-ignore
  return verifyAsync(token, JWT_SECRET!, { algorithms: ['HS256'] });
};

export { create, verify };
