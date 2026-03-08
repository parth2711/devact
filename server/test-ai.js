require('dotenv').config({path: 'C:/Users/Parth Jangir/Documents/projects/devact/.env'});
const ai = require('C:/Users/Parth Jangir/Documents/projects/devact/server/services/ai.service');
const fs = require('fs');

ai.generateRepoFeedback({name: 'test', description: 'desc', language: 'python'}, {}, [])
  .then(res => console.log('SUCCESS:', res.substring(0, 100)))
  .catch(e => {
     const errDetails = {
       message: e.message,
       status: e.status,
       statusText: e.statusText,
       errorDetails: e.errorDetails
     };
     fs.writeFileSync('geminierr.json', JSON.stringify(errDetails, null, 2));
  });
