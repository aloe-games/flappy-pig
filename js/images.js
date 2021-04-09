function loadImages(imagePaths, callback) {
    let images = [];
    for (let i = 0; i < imagePaths.length; i++) {
        images[i] = new Image();
    }
    for (let i = 0; i < imagePaths.length - 1; i++) {
        images[i].onload = function () {
            images[i + 1].src = imagePaths[i + 1];
        }
    }
    images[imagePaths.length - 1].onload = function () {
        callback(images)
    };
    images[0].src = imagePaths[0];
}