const { Octokit } = require("@octokit/rest");

exports.handler = async () => {
  const token = process.env.GITHUB_TOKEN;
  const octokit = new Octokit({ auth: token });

  const owner = 'MT10Yamaha'; // Tu nombre de usuario en GitHub
  const repo = 'proyecto';    // Tu repositorio
  const path = 'numbers.json';
  const blockedPath = 'blocked.json';

  try {
    // Obtener datos desde GitHub
    const numbersRes = await octokit.repos.getContent({ owner, repo, path });
    const blockedRes = await octokit.repos.getContent({ owner, repo, path: blockedPath });

    const numbers = JSON.parse(Buffer.from(numbersRes.data.content, 'base64').toString()).numbers;
    const blocked = JSON.parse(Buffer.from(blockedRes.data.content, 'base64').toString()).blocked;

    // Filtrar números válidos
    const available = numbers.filter(n => !blocked.includes(n));

    if (available.length === 0) {
      return {
        statusCode: 404,
        body: '❌ No hay números disponibles.'
      };
    }

    const randomNumber = available[Math.floor(Math.random() * available.length)];
    const whatsappLink = `https://wa.me/${randomNumber}`;

    return {
      statusCode: 302,
      headers: {
        Location: whatsappLink
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Error al procesar redirección: ${error.message}`
    };
  }
};
