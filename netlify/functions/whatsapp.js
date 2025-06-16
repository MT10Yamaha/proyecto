const fetch = require('node-fetch');
const numbers = require('../../numbers.json');

exports.handler = async () => {
  for (let num of numbers.numbers) {
    try {
      const res = await fetch(`https://wa.me/${num}`);
      const text = await res.text();
      if (!text.includes("no es válido") && !text.includes("invalid")) {
        return {
          statusCode: 302,
          headers: {
            Location: `https://wa.me/${num}`
          }
        };
      }
    } catch (err) {
      continue;
    }
  }

  return {
    statusCode: 404,
    body: 'No hay números disponibles.'
  };
};
