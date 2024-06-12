const express = require('express');
const jsdom = require("jsdom");
const { default: axios } = require('axios');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = jsdom;
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;
const config = {
  application: {
      cors: {
          server: [
              {
                  origin: "*", //servidor que deseas que consuma o (*) en caso que sea acceso libre
                  credentials: true
              }
          ]
      }
}}
// Función para limpiar y extraer el contenido del artículo
const cleanAndExtractArticle = (html) => {
  const doc = new JSDOM(html).window.document;
  const reader = new Readability(doc);
  const article = reader.parse();
  return article ? article.textContent.trim() : '';
}

// Función para eliminar elementos no deseados
const removeUnwantedElements = (document) => {
  const selectors = ['img'];
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => element.remove());
  });
}
app.use(cors(
  config.application.cors.server
));
// Ruta para obtener y limpiar el HTML de una URL
app.get('/api/clean-html', async (req, res) => {
  try {
    const url = req.query.url; // Extraer URL de los parámetros de consulta
    if (!url) {
      return res.status(400).send('URL is required');
    }

    const response = await axios.get(url); // Esperar la respuesta de Axios
    const html = response.data;
    
    // Parsear el HTML usando JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Eliminar elementos no deseados
    removeUnwantedElements(document);

    // Limpiar y extraer el contenido del artículo
    const cleanedText = cleanAndExtractArticle(document.documentElement.innerHTML);

    res.send(cleanedText);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
