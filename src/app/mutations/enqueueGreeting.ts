import greetingsQueue from '../../pages/api/queues/greetingsQueue.page';

export default async function enqueueGreeting() {
  console.log('mutation queue#########################');
  await greetingsQueue.enqueue({
    to: 'Sandy Cheeks',
    message: 'Howdy!'
  });
}
