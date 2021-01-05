import Router from 'koa-router';
import participantStore from './store';
import participantIdStore from './id_store'
import { broadcast } from "../utils";

export const router = new Router();

router.get('/', async (ctx) => {
  const response = ctx.response;
  const userId = ctx.state.user._id;
  response.body = await participantStore.find({ userId });
  //response.body = await participantStore.find({})
  response.status = 200; // ok
});

router.get('/:id', async (ctx) => {
  const userId = ctx.state.user._id;
  const participant = await participantStore.findOne({ _id: ctx.params.id });
  const response = ctx.response;
  if (participant) {
    if (participant.userId === userId) {
      response.body = participant;
      response.status = 200; // ok
    } else {
      response.status = 403; // forbidden
    }
  } else {
    response.status = 404; // not found
  }
});

router.get('/between/:start/:stop', async (ctx) => {
  const userId = ctx.state.user._id;
  const participants = await participantStore.find({ userId });
  const response = ctx.response;
  var filtered_participants = Array();
  for(var i=ctx.params.start; i<ctx.params.stop; i++){
      filtered_participants.push(participants[i]);
  }
  response.body = filtered_participants;
  response.status = 200;
});

router.get('/age/:age', async (ctx) => {
  const userId = ctx.state.user._id;
  const participants = await participantStore.find({ userId });
  const response = ctx.response;
  var filtered_participants = Array();
  participants.forEach(part=>{
    if(part.age == ctx.params.age){
      filtered_participants.push(part);
    }
  })
  response.body = filtered_participants;
  response.status = 200;
});

const createParticipant = async (ctx, participant, response) => {
  console.log("Router: POST request: Create")
  try {
      const userId = ctx.state.user._id;
      participant.userId = userId;
      var participant_id = (await participantIdStore.findCurrentId({}))[0].currentId;
      participant._id = participant_id;
      const participant_inserted = await participantStore.insert(participant);
      response.body = participant_inserted;
      response.status = 201; // created
      broadcast(userId, { type: 'created', payload: participant });
      participantIdStore.incrementCurrentId({currentId:participant._id});

  } catch (err) {
    console.log("Router: POST request: Create error")
    response.body = { message: err.message };
    response.status = 400; // bad request
  }
};

router.post('/', async ctx => await createParticipant(ctx, ctx.request.body, ctx.response));

router.put('/:id', async (ctx) => {
  console.log("Router: PUT request: Update")
  const participant = ctx.request.body;
  console.log(ctx.params)
  const id = ctx.params.id;
  const participantId = participant._id;
  const response = ctx.response;
  if (participantId != id) { // conditie originala: participantId && participantId !== id
    console.log(typeof(participantId));
    console.log(typeof(id));
    response.body = { message: 'Param id and body _id should be the same' };
    response.status = 400; // bad request
    return;
  }
  if (!participantId) {
    console.log("Router: PUT request: create participant");
    await createParticipant(ctx, participant, response);
  } else {
    console.log("Router: PUT request: update participant");
    const userId = ctx.state.user._id;
    participant.userId = userId.toString();
    const updatedCount = await participantStore.update({ _id: id }, participant);
    if (updatedCount === 1) {
      response.body = participant;
      response.status = 200; // ok
      broadcast(participantId, { type: 'updated', payload: participant });
    } else {
      response.body = { message: 'Resource no longer exists' };
      response.status = 405; // method not allowed
    }
  }
});

router.del('/:id', async (ctx) => {
  const userId = ctx.state.user._id;
  const participant = await participantStore.findOne({ _id: ctx.params.id });
  if (participant && userId !== participant.userId) {
    ctx.response.status = 403; // forbidden
  } else {
    await participantStore.remove({ _id: ctx.params.id });
    ctx.response.status = 204; // no content
  }
});
