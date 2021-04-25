import express from 'express';
import mercuryRouter from './mercury';
import { RETOOL_PEPPER_API_KEY } from '../../config';

const retoolRouter = express.Router();

retoolRouter.use((req, res, next) => {
  const header = req.headers.authorization;
  const apiKey = header ? header.split(' ')[1] : '';
  if (apiKey !== RETOOL_PEPPER_API_KEY) return res.sendStatus(401);
  next();
});

retoolRouter.use('/mercury', mercuryRouter);

export default retoolRouter;
