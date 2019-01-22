const Sox = require('sox-stream');
const DeepSpeech = require('deepspeech');
const MemoryStream = require('memory-stream');

module.exports = (emitter, outputGraph, alphabet, lm, trie) => {
  // These constants control the beam search decoder

  // Beam width used in the CTC decoder when building candidate transcriptions
  const BEAM_WIDTH = 500;

  // The alpha hyperparameter of the CTC decoder. Language Model weight
  const LM_ALPHA = 0.75;

  // The beta hyperparameter of the CTC decoder. Word insertion bonus.
  const LM_BETA = 1.85;

  // These constants are tied to the shape of the graph used (changing them changes
  // the geometry of the first layer), so make sure you use the same constants that
  // were used during training

  // Number of MFCC features to use
  const N_FEATURES = 26;

  // Size of the context window used for producing timesteps in the input vector
  const N_CONTEXT = 9;

  console.log('Loading model from file %s', outputGraph);
  const model = new DeepSpeech.Model(
    outputGraph,
    N_FEATURES,
    N_CONTEXT,
    alphabet,
    BEAM_WIDTH,
  );
  console.log('Finished loading model');
  console.log('Loading language model from file(s) %s %s', lm, trie);
  model.enableDecoderWithLM(alphabet, lm, trie, LM_ALPHA, LM_BETA);
  console.log('Finished loading langauge model');

  return function(stream) {
    const audioStream = new MemoryStream();
    stream
      .pipe(
        Sox({
          output: {
            bits: 16,
            rate: 16000,
            channels: 1,
            type: 'raw',
          },
        }),
      )
      .pipe(audioStream);

    audioStream.on('finish', () => {
      const audioBuffer = audioStream.toBuffer();
      console.log('Running inference...');
      const text = model.stt(
        audioBuffer.slice(0, audioBuffer.length / 2),
        16000,
      );
      console.log('Inference finished: %s', String(text));
      emitter.emit('text', { text });
    });
  };
};
