const AWS = require('aws-sdk');
const dsb = require('./dsBuffer');

// // for input file
// const dsf = require('./dsFile');

// // for streaming
// const EventEmitter = require('events');
// const dss = require('./dsStreaming');
// const streamServer = require('./stream');

const s3 = new AWS.S3();

function onError(err) {
  console.log(`error: ${err}`);
  return 1;
}

function readFile(bucketName, filename) {
  const params = { Bucket: bucketName, Key: filename };

  s3.getObject(params, (err, data) => {
    if (!err) onError(err);

    console.log(data.Body.toString());
    return data.Body.toString();
  });
}

exports.handler = async event => {
  const outputGraph = readFile('models', event.s3.models.outputGraph);
  const alphabet = readFile('models', event.s3.models.alphabet);
  const lm = readFile('models', event.s3.models.lm);
  const trie = readFile('models', event.s3.models.trie);

  const response = {
    statusCode: 200,
    body: dsb(event.buffer, outputGraph, alphabet, lm, trie),

    // // for input file
    // body: dsf(event.file, outputGraph, alphabet, lm, trie),
  };

  // // for streaming
  // const myEmitter = new EventEmitter();
  // const audioStreamCb = dss(myEmitter, outputGraph, alphabet, lm, trie);
  // streamServer(audioStreamCb, myEmitter);

  if (response.statusCode !== 200) return 1;
  return response.body;
};
