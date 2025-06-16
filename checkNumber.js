const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  const number = event.queryStringParameters.number;
  const token = process.env.GITHUB_TOKEN;

  const octokit = new Octokit({ auth: token });
  const owner = 'MT10Yamaha'; // cambia por tu nombre de usuario de GitHub
  const repo = 'proyecto'; // cambia por tu repositorio
  const path = 'numbers.json';

  try {
    const res = await octokit.repos.getContent({ owner, repo, path });
    const content = Buffer.from(res.data.content, 'base64').toString();
    const data = JSON.parse(content);

    const isBlocked = data.numbers.includes(number);

    return {
      statusCode: 200,
      body: JSON.stringify({ blocked: isBlocked })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
