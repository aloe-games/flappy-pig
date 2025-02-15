class Agent {
    constructor() {
        this.w = [[gaussian(), gaussian()], [gaussian(), gaussian()]];
        this.b = [[gaussian()], [gaussian()]];
        this.gamma = 0.99;
        this.alpha = 0.00005;
    }

    forward(observation, action) {
        return dot(observation, this.w[action]) + dot(this.b[action][0], [1.]);
    }

    act(observation) {
        return this.forward(observation, 1) > this.forward(observation, 0) ? 1 : 0;
    }

    learn(observation, action, reward, next_observation, done) {
        let z = this.forward(observation, action);
        let y = reward + (1 - done) * this.gamma * Math.max(this.forward(next_observation, 0), this.forward(next_observation, 1));

        let dz = z - y;
        let dw = mul(observation, dz);
        let db = mul([1.], dz);

        add_(this.w[action], mul(dw, -this.alpha));
        add_(this.b[action], mul(db, -this.alpha));
    }
}
