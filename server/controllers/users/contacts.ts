import asyncHandler from 'express-async-handler';
import { isEmpty } from 'lodash';

import { Users } from '../../database/entities';
import { findById, save, repositories } from '../../database/helpers';

const addContacts = asyncHandler(async (req, res, next) => {
  const [userRepo, user]: [repositories, Users] = await findById(
    Users,
    req.session.id!
  );
  if (user) {
    user.contacts = req.body.contacts ? req.body.contacts : {};
    await save(userRepo, user);
    return res.sendStatus(200);
  }
  return res.sendStatus(401);
});

const updateContacts = asyncHandler(async (req, res, next) => {
  if (
    isEmpty(req.body.updatedContacts) &&
    (!Array.isArray(req.body.deletedContacts) ||
      isEmpty(req.body.deletedContacts))
  )
    return res.sendStatus(400);
  const [userRepo, user]: [repositories, Users] = await findById(
    Users,
    req.session.id!
  );
  if (user) {
    Object.keys(req.body.updatedContacts).forEach(updatedContact => {
      user.contacts[updatedContact] = req.body.updatedContacts[updatedContact];
    });
    req.body.deletedContacts.forEach((deletedContact: string) => {
      delete user.contacts[deletedContact];
    });
    await save(userRepo, user);
    return res.sendStatus(200);
  }
  return res.sendStatus(401);
});

export { addContacts, updateContacts };
