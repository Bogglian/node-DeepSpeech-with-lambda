const AWS = require('aws-sdk');
const dsb = require('./dsBuffer');

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
  };

  if (response.statusCode !== 200) return 1;
  return response.body;
};
