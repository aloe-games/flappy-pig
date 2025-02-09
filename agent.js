class Agent {
    constructor() {
        this.w = [
            [Math.random(), Math.random()],
            [Math.random(), Math.random()]
        ];
        this.b = [Math.random(), Math.random()];
        this.gamma = 0.99;
        this.alpha = 0.00005;
    }

    forward(observation, action) {
        return observation[0] * this.w[action][0] + observation[1] * this.w[action][1] + this.b[action];
    }

    act(observation) {
        return Number(this.forward(observation, 1) > this.forward(observation, 0));
    }

    learn(observation, action, reward, next_observation, done) {
        let z = this.forward(observation, action);
        let y = reward + (1 - done) * this.gamma * Math.max(this.forward(next_observation, 0), this.forward(next_observation, 1));

        let dz = z - y;
        let dw = [observation[0] * dz, observation[1] * dz]
        let db = dz

        this.w[action][0] -= this.alpha * dw[0];
        this.w[action][1] -= this.alpha * dw[1];
        this.b[action] -= this.alpha * db;
    }
}
