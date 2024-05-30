const express = require('express');
const jsdom = require("jsdom");
const { default: axios } = require('axios');
const { JSDOM } = jsdom;

const app = express();
const PORT = process.env.PORT || 4000;;

// Función para convertir HTML a texto sin entidades
const convertHtmlToText = (html) => {
  var entities = [
    ['amp', '&'],
    ['apos', '\''],
    ['#x27', '\''],
    ['#x2F', '/'],
    ['#39', '\''],
    ['#47', '/'],
    ['lt', '<'],
    ['gt', '>'],
    ['nbsp', ' '],
    ['quot', '"']
  ];

  // Reemplazar entidades HTML
  for (var i = 0, max = entities.length; i < max; ++i) {
    html = html.replace(new RegExp('&' + entities[i][0] + ';', 'g'), entities[i][1]);
  }
  
  return html.replace(/\s+/g, '  ').trim(); // Eliminar espacios redundantes y recortar
}

// Función para eliminar elementos no deseados
const removeUnwantedElements = (document) => {
  const selectors = ['img', 'br','button', 'script', 'style', 'iframe', 'noscript', 'header', 'footer', 'nav', 'aside', '.advertisement', '.ad', '.ads'];
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => element.remove());
  });
}

// Función para extraer el texto del contenido principal
const extractMainContent = (document) => {
  const selectors = [ 'main', 'section', 'div'];
  for (let selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.textContent || element.innerText;
    }
  }


  return document.body.textContent || document.body.innerText;
}

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
    
    // Extraer el contenido principal
    let content = extractMainContent(document);

    // Convertir el contenido a texto plano
    const cleanedText = convertHtmlToText(content);

    res.send(cleanedText);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
