const { Octokit } = require("@octokit/rest");
const fetch = require("node-fetch");

exports.handler = async (event) => {
  const token = process.env.GITHUB_TOKEN;
  const octokit = new Octokit({ auth: token });

  const owner = "MT10Yamaha";
  const repo = "proyecto";
  const blockedPath = "blocked.json";

  const number = event.queryStringParameters.number;

  if (!number) {
    return {
      statusCode: 400,
      body: "❌ Número no especificado"
    };
  }

  try {
    const waUrl = `https://wa.me/${number}`;
    const res = await fetch(waUrl);
    const html = await res.text();

    // Analiza si WhatsApp muestra un error en la página
    const numeroInvalido = html.includes("no es válido") || html.includes("invalid phone number");

    if (!numeroInvalido) {
      return {
        statusCode: 200,
        body: `✅ El número ${number} está activo.`
      };
    }

    // Si el número está roto, agregarlo a blocked.json
    const bloqueadosRes = await octokit.repos.getContent({ owner, repo, path: blockedPath });
    const sha = bloqueadosRes.data.sha;
    const bloqueadosContent = Buffer.from(bloqueadosRes.data.content, "base64").toString();
    const data = JSON.parse(bloqueadosContent);

    if (!data.blocked.includes(number)) {
      data.blocked.push(number);
    }

    const updatedContent = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: blockedPath,
      message: `🛑 Bloqueado automáticamente el número ${number}`,
      content: updatedContent,
      sha
    });

    return {
      statusCode: 200,
      body: `🛑 Número ${number} detectado como inválido y bloqueado.`
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `❌ Error interno: ${err.message}`
    };
  }
};
