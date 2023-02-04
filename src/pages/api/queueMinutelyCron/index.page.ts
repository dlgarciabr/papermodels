import { CronJob } from 'quirrel/blitz';

export default CronJob(
  'api/queueMinutelyCron', // the path of this API route
  '* * * * *', // cron schedule (see https://crontab.guru)
  async () => {
    console.log('A new minute has begun!');
  }
);
