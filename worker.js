import cssNano from './cssnano';

function readFilePromise(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.readAsText(file, 'UTF-8');

    reader.onload = function (evt) {
      resolve(evt.target.result);
    }
    reader.onerror = function (evt) {
      reject('Error reading CSS file');
    }
  });
}

onmessage = function(e) {
  Promise.all(e.data.map(file => readFilePromise(file)))
    .then(data => data.join(''))
    .then(cssString => {
      if (cssString.length) {
        return cssNano(cssString);
      }

      return {
        css: '',
      };
    })
    .then(result => postMessage(result.css));
}
