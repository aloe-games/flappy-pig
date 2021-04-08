// Image loading global variables
let loadCount = 0;
let loadTotal = 0;
let preloaded = false;
 
// Load images
function loadImages(imagefiles) {
    // Initialize variables
    loadCount = 0;
    loadTotal = imagefiles.length;
    preloaded = false;
 
    // Load the images
    let loadedImages = [];
    for (let i=0; i<imagefiles.length; i++) {
        // Create the image object
        let image = new Image();
 
        // Add onload event handler
        image.onload = function () {
            loadCount++;
            if (loadCount === loadTotal) {
                // Done loading
                preloaded = true;
            }
        };
 
        // Set the source url of the image
        image.src = imagefiles[i];
 
        // Save to the image array
        loadedImages[i] = image;
    }
 
    // Return an array of images
    return loadedImages;
}