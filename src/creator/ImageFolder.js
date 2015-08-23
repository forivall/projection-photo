// TODO: separate concerns!

import React from 'react';

import ipc from 'ipc';
import fs from 'fs';
import path from 'path';
import {debounce, sortBy, contains, without, pluck} from 'lodash';
import walk from 'walk';
import {ExifImage} from 'exif';
import ImageGallery from 'react-image-gallery';

function debounceHandler(handler, ...args) {
  var debounced = debounce(handler, ...args);
  return function(event, ...args) {
    event.persist();
    debounced(event, ...args);
  }
}

function getBounds(max, dim) {
  var ratio;
  if (dim.width > dim.height) {
    return {width: max, height: (dim.height / dim.width) * max};
  } else if (dim.width < dim.height) {
    return {width: (dim.width / dim.height) * max, height: max};
  }
  return {width: max, height: max};
}

export default class ImageFolder extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {root: '', images: [], currentImage: {}, selectedImages: []};
    this.handleDirChange = this.handleDirChange.bind(this);
    this.handleSlide = this.handleSlide.bind(this);
    this.handleAddRemove = this.handleAddRemove.bind(this);
  }

  handleDirChange(event) {
    var root = event.target.value;
    if (!root) { return; }
    console.log('set root', root);
    ipc.send('set-root-directory', {root: root});
    this.setState({root});

    fs.readFile(this.slideshowPath(), {encoding: 'utf8'}, (err, rawData) => {
      var data = {images: []};
      if (rawData) {
        try {
          data = JSON.parse(rawData);
        } catch (e) {}
      }
      this.collectImageFiles(root, data.images);
    });

  }

  collectImageFiles(root, selectedImagePaths) {
    var walker = walk.walk(root);
    var images = [], selectedImages = [];
    walker.on('file', (root, fileStat, next) => {
      if (!/^\.jpe?g/i.test(path.extname(fileStat.name))) {
        console.log('not jpg' + fileStat.name);
        return next();
      }
      var filePath = path.resolve(root, fileStat.name);
      try {
        new ExifImage({ image: filePath }, (err, exifData) => {
          if (err) {
            console.log(filePath);
            console.log(err);
            next();
            return;
          }
          // console.log(filePath);
          // console.log(exifData);
          let image = {
            path: filePath,
            original: "file://" + filePath,
            date: exifData.exif.CreateDate || exifData.exif.DateTimeOriginal,
            width: exifData.exif.ExifImageWidth,
            height: exifData.exif.ExifImageHeight,
          };
          images.push(image);
          if (contains(selectedImagePaths, filePath)) {
            selectedImages.push(image);
          }
          next();
        });
      } catch(e) {
        console.log('fatal error', e);
      }
    });
    walker.on('end', () => {
      images = sortBy(images, 'date');
      this.setState({images, selectedImages, currentImage: images[0] || {}});
    })
  }

  handleSlide(index) {
    let newImage = this.state.images[index];
    this.setState({currentImage: newImage || {}});
    console.log('slid to ' + index + ': ' + this.state.images[index].path);
    // console.log(this.state.currentImage.date);
  }

  handleAddRemove(event) {
    var newSelectedImages;
    if (contains(this.state.selectedImages, this.state.currentImage)) {
      newSelectedImages = without(this.state.selectedImages, this.state.currentImage);
    } else {
      newSelectedImages = this.state.selectedImages.concat(this.state.currentImage);
    }
    var root = this.state.root;
    fs.writeFile(this.slideshowPath(),
      JSON.stringify({images: pluck(newSelectedImages, 'path').map((imgPath) => path.relative(root, imgPath))}), (err) => {
        if (err) { console.log('error writing file: ' + err); }
      }
    );
    this.setState({selectedImages: newSelectedImages});
  }

  slideshowPath() {
    return path.join(this.state.root, 'projection-photo-slideshow.json');
  }

  render() {
    return (<div>
      <input onChange={debounceHandler(this.handleDirChange, 1000)} placeholder="type directory here"></input>
      <div><button onClick={this.handleAddRemove}>{contains(this.state.selectedImages, this.state.currentImage) ? 'Remove' : 'Add'} Image</button>{this.state.currentImage.date}</div>
      <ImageGallery items={this.state.images} showBullets={true} onSlide={this.handleSlide}/>
      {
      // {this.state.images.map((image) => {
      //   let bounds = getBounds(32, image);
      //   return <img src={"file://" + image.path} height={bounds.height} width={bounds.width} />
      // })}
      }
    </div>);
  }
}
