import * as express from 'express';
import * as expressWs from 'express-ws';
import { NoteService } from './note.service';
import * as path from 'path';
import { WallStore } from './store/wall.store';
import { NoteStore } from './store/note.store';

class Server {
    public app: express.Application;

    public wallStore = new WallStore();
    public noteStore = new NoteStore();

    constructor(
        private port: number
    ) {
        const app = express();

        app.use(express.static("client"));

        this.app = this.initializeWebSocket(app);

        // fall through
        this.app.get('*', (req, res) => res.sendFile('./client/index.html', { root: path.resolve() }));
    }

    private initializeWebSocket(app: express.Application): express.Application {
        const wsInstance = expressWs(app);
        const noteService = new NoteService(this.wallStore, this.noteStore, wsInstance);

        wsInstance.app.ws('/ws', noteService.onWebSocket);

        wsInstance.getWss().on("connection", (ws, req) => {
            console.log("connected");
        });

        return wsInstance.app;
    }

    public listen(): void {
        this.app.listen(this.port, () => {
            console.log(`Listening on port ${this.port}`);
        });
    }
}

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000; 
new Server(port).listen();
