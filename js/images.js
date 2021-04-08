function loadImages(imagefiles, callback) {
    let loadedImages = [];
    for (let i = 0; i < imagefiles.length; i++) {
        let image = new Image();

        if (i === imagefiles.length - 1) {
            image.onload = callback;
        }

        image.src = imagefiles[i];
        loadedImages[i] = image;
    }

    return loadedImages;
}