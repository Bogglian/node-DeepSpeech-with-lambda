const dsb = require('./dsBuffer');

exports.handler = async event => {
  // TODO implement
  const response = {
    statusCode: 200,
    body: dsb(event.buffer),
  };

  if (response.statusCode !== 200) return 0;
  return response.body;
};
