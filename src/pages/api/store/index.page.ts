/* istanbul ignore file -- @preserve */
// import db from 'db';
import { api } from 'src/blitz-server';

export default api(async (req, res, _ctx) => {
  // await db.$queryRaw`SELECT 1`;
  console.log('store api');
  // res.status(200).send({});

  if (req.method === 'POST') {
    try {
      const reCaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `secret=your_secret_key&response=${req.body.gRecaptchaToken}`
      });

      const resultJson = await reCaptchaRes.json();
      // .then((reCaptchaRes) => reCaptchaRes.json())
      // .then((reCaptchaRes) => {
      console.log(resultJson, 'Response from Google reCaptcha verification API');
      if (resultJson?.score > 0.5) {
        // Save data to the database from here
        res.status(200).json({
          status: 'success',
          message: 'Enquiry submitted successfully'
        });
      } else {
        res.status(200).json({
          status: 'failure',
          message: 'Google ReCaptcha Failure'
        });
      }
      // });
    } catch (err) {
      res.status(405).json({
        status: 'failure',
        message: 'Error submitting the enquiry form'
      });
    }
  } else {
    res.status(405);
    res.end();
  }
});
