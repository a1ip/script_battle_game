
interface IEnvConfig {
    api: string;
    websocket: string;
    staticHost: string;
}

const localConfig = {
    api: 'http://localhost:1337',
    websocket: 'ws://localhost:1337',
    staticHost: 'http://localhost:8080'
};

const prodConfig = {
    api: 'http://142.93.129.144:1337',
    websocket: 'ws://142.93.129.144:1337',
    staticHost: 'http://142.93.129.144'
};

export class Environment {
    config: IEnvConfig;

    constructor() {
        if (location.hostname === 'localhost') {
            this.config = localConfig;
        } else {
            this.config = prodConfig;
        }
    }

}