// Load the SDK
const aws = require('aws-sdk')
const fs = require('fs')
const eventEmitter = require('events');

const go = new eventEmitter();
const start = new eventEmitter();
const text = fs.readFileSync('./input.txt').toString().split(' ').reverse();
const textLength = text.length;
let nextWordStart = 0;
let label = 1;

const Polly = new aws.Polly({
  signatureVersion: 'v4',
  region: 'us-west-2'
})

var params = {
  OutputFormat: 'mp3',
  VoiceId: 'Matthew',
  OutputS3BucketName: process.env.S3BucketName || '', /* required */
  Engine: 'standard' || 'neural',
  LanguageCode: 'en-US',
  OutputS3KeyPrefix: 'prefixTest',
  SampleRate: '22050',
  TextType: 'text' || 'ssml'
};

const run = () => {
  let chunk = [];
  let full = false;
  while (!full) {
    if (chunk.concat(text[0]).join(' ').length >= 100000 || nextWordStart >= textLength || nextWordStart === 1000000) {
      full = true;
      chunk = chunk.join(' ')
      fs.writeFileSync(`./output part ${label}.txt`, chunk);
      params.Text = chunk;
      params.Engine = 'neural';
      params.OutputS3KeyPrefix = `PrefixGoesHere${label}`;
      params.SampleRate = '24000';
      Polly.startSpeechSynthesisTask(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        if (label < 10) run();
      });
      label++;
    } else {
      chunk.push(text.pop());
    }
  }
}

run();
