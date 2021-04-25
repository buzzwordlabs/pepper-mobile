import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { Faqs } from '../database/entities';
import { find, repositories } from '../database/helpers';

const getFaqs = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const [faqRepo, faq]: [repositories, Faqs[]] = await find(Faqs, {
      select: ['question', 'answer', 'id']
    });
    return res.status(200).json({ faq });
  }
);

export { getFaqs };
