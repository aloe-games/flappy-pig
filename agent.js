class Agent {
    constructor(observation, action) {
        this.w = random(action, observation);
        this.b = random(action, 1);
        this.gamma = 0.99;
        this.alpha = 0.00005;
    }

    forward(observation, action) {
        return dot(observation, this.w[action]) + dot(this.b[action][0], [1.]);
    }

    values(observation) {
        let values = new Array(this.w.length);
        for (let action = 0; action < values.length; action++) {
            values[action] = this.forward(observation, action);
        }
        return values;
    }

    act(observation) {
        let values = this.values(observation);
        return values.indexOf(Math.max(...values));
    }

    learn(observation, action, reward, next_observation, done) {
        let z = this.forward(observation, action);
        let y = reward + (1 - done) * this.gamma * Math.max(...this.values(next_observation));

        let dz = z - y;
        let dw = mul(observation, dz);
        let db = mul([1.], dz);

        add_(this.w[action], mul(dw, -this.alpha));
        add_(this.b[action], mul(db, -this.alpha));
    }
}
