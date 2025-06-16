const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  const numberToRemove = event.queryStringParameters.number;
  const token = process.env.GITHUB_TOKEN;

  const octokit = new Octokit({ auth: token });
  const owner = 'TU_USUARIO'; // Cambia esto
  const repo = 'TU_REPOSITORIO'; // Cambia esto
  const path = 'numbers.json';

  try {
    const res = await octokit.repos.getContent({ owner, repo, path });
    const sha = res.data.sha;
    const content = Buffer.from(res.data.content, 'base64').toString();
    const data = JSON.parse(content);

    data.numbers = data.numbers.filter(n => n !== numberToRemove);

    const updatedContent = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Remove ${numberToRemove}`,
      content: updatedContent,
      sha
    });

    return { statusCode: 200, body: JSON.stringify({ message: 'Eliminado.' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
