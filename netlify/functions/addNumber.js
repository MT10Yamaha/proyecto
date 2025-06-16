const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const newNumber = body.number;
  const token = process.env.GITHUB_TOKEN;

  const octokit = new Octokit({ auth: token });
  const owner = 'MT10Yamaha'; // Cambia esto
  const repo = 'proyecto'; // Cambia esto
  const path = 'numbers.json';

  try {
    const res = await octokit.repos.getContent({ owner, repo, path });
    const sha = res.data.sha;
    const content = Buffer.from(res.data.content, 'base64').toString();
    const data = JSON.parse(content);

    if (!data.numbers.includes(newNumber)) {
      data.numbers.push(newNumber);
    }

    const updatedContent = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Add ${newNumber}`,
      content: updatedContent,
      sha
    });

    return { statusCode: 200, body: JSON.stringify({ message: 'Agregado.' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
