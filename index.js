const dsb = require("./dsBuffer");

exports.handler = async event => {
  // TODO implement
  const response = {
    statusCode: 200,
    body: dsb(event.buffer)
  };

  if (respons.statusCode !== 200) return;
  return response.body;
};
