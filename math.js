function gaussian(mean = 0, stdev = 1) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
}

function mul(a, x) {
    let c = new Array(a.length);
    for (let i = 0; i < a.length; i++) {
        c[i] = a[i] * x;
    }
    return c;
}

function add_(a, b) {
    for (let i = 0; i < a.length; i++) {
        a[i] += b[i];
    }
}

function dot(a, b) {
    let dot = 0.;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
    }
    return dot;
}
