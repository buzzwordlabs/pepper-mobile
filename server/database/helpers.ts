import {
  FindManyOptions,
  getRepository,
  ObjectType,
  Repository
} from 'typeorm';

import {
  Calls,
  Faqs,
  Subscriptions,
  Users,
  Voicemails,
  Uglycalls
} from './entities';

export type entities =
  | ObjectType<Calls>
  | ObjectType<Faqs>
  | ObjectType<Subscriptions>
  | ObjectType<Users>
  | ObjectType<Voicemails>
  | ObjectType<Uglycalls>;

export type repositories =
  | Repository<Calls>
  | Repository<Faqs>
  | Repository<Subscriptions>
  | Repository<Users>
  | Repository<Voicemails>
  | Repository<Uglycalls>;

async function save(repository: any, entity: any): Promise<any> {
  return repository.save(entity);
}

// If string, arg is an id (UUID), if object literal, one or more filters
async function deleteOneOrMany(entity: entities, options: any): Promise<any> {
  return getRepository(entity).delete(options);
}

async function create(entity: entities, data: any): Promise<any> {
  const entityRepository = getRepository(entity);
  return save(entityRepository, entityRepository.create(data));
}

async function findById(
  entity: entities,
  id: string
): Promise<[repositories, any]> {
  const entityRepository = getRepository(entity);
  const singleEntity = await entityRepository.findOne(id);
  return [entityRepository, singleEntity];
}

async function findOne(
  entity: entities,
  options: any
): Promise<[repositories, any]> {
  const entityRepository = getRepository(entity);
  const singleEntity = await entityRepository.findOne(options);
  return [entityRepository, singleEntity];
}

async function find(
  entity: entities,
  options: FindManyOptions
): Promise<[repositories, any]> {
  const entityRepository = getRepository(entity);
  const entities = await entityRepository.find(options);
  return [entityRepository, entities];
}

async function count(entity: entities, options: any): Promise<number> {
  const entityRepository = getRepository(entity);
  return entityRepository.count(options);
}

function camelcaseTwilioData(twilioData: any) {
  return {
    called: twilioData.Called,
    toState: twilioData.ToState,
    callerCountry: twilioData.CallerCountry,
    direction: twilioData.Direction,
    calledVia: twilioData.CalledVia,
    callerState: twilioData.CallerState,
    toZip: twilioData.ToZip,
    callSid: twilioData.CallSid,
    to: twilioData.To,
    callerZip: twilioData.CallerZip,
    toCountry: twilioData.ToCountry,
    apiVersion: twilioData.ApiVersion,
    calledZip: twilioData.CalledZip,
    calledCity: twilioData.CalledCity,
    callStatus: twilioData.CallStatus,
    from: twilioData.From,
    accountSid: twilioData.AccountSid,
    calledCountry: twilioData.CalledCountry,
    callerCity: twilioData.CallerCity,
    caller: twilioData.Caller,
    fromCountry: twilioData.FromCountry,
    toCity: twilioData.ToCity,
    fromCity: twilioData.FromCity,
    calledState: twilioData.CalledState,
    forwardedFrom: twilioData.ForwardedFrom,
    fromZip: twilioData.FromZip,
    fromState: twilioData.FromState
  };
}

export {
  create,
  findById,
  findOne,
  find,
  count,
  save,
  camelcaseTwilioData,
  deleteOneOrMany
};
