import cssNano from './cssnano';
import { saveAs } from 'file-saver';

new Vue({
  el: '#app',
  data: {
    fileSelected: false,
    isDragging: false,
    inputHasFocus: false,
    result: '',
    selectedFiles: [],
    worker: null,
  },
  mounted() {
    if (window.Worker) {
      this.worker = new Worker('worker.js');
      this.worker.onmessage = e => {
        this.result = e.data;
      };
    }
  },
  methods: {
    openFileInput() {
      this.$refs.fileInput.click();
    },
    readFiles() {
      return Promise.all(this.selectedFiles.map(file => readFilePromise(file))).then(data => data.join(''));
    },
    drop(e) {
      this.isDragging = false;
      this.fileSelected = true;
      this.selectedFiles = [
        ...this.selectedFiles,
        ...Array.from(e.dataTransfer.files)
      ];

      if (this.worker) {
        this.worker.postMessage(this.selectedFiles);
      } else {
        this.readFiles()
          .then(cssString => cssNano(cssString))
          .then(result => {
            this.result = result.css
          });
      }
    },
    fileInputChange(e) {
      this.isDragging = false;
      this.fileSelected = true;
      this.selectedFiles = [
        ...this.selectedFiles,
        ...Array.from(e.target.files)
      ];

      if (this.worker) {
        this.worker.postMessage(this.selectedFiles);
      } else {
        this.readFiles()
          .then(cssString => cssNano(cssString))
          .then(result => {
            this.result = result.css
          });
      }
    },
    mergeCSS() {
      const blobObj = new Blob([this.result], {type: "text/plain;charset=utf-8"});
      saveAs(blobObj, 'merged.css');
      // this.readFiles().then(cssNano).then(str => console.log(str.css));
    },
  },
  filters: {
    fileSizeFormat(val) {
      const size = parseFloat(val) || 0;

      if (!size) {
        return '0B';
      }

      if (size < 1000) {
        return `${size}B`;
      }

      if (size < 1000000) {
        return `${Math.round(size / 1000)}KB`
      }

      if (size < 8000000) {
        return `${Math.round(size / 1000000)}MB`
      }

      return 'Too large';
    }
  }
});
