import {BattleSide} from "../battle/BattleSide";
import {Subject} from 'rxjs/index';
import {Inject} from '../InjectDectorator';
import {WebsocketConnection} from '../WebsocketConnection';

export class ClientState {

    @Inject(WebsocketConnection) private connection: WebsocketConnection;

    name = '';
    side: BattleSide;

    army = {
        0: 'character_null',
        1: 'character_null',
        2: 'character_null',
        3: 'character_null'
    };

    change$ = new Subject<any>();

    set(newState: any) {
        Object.assign(this, {}, newState);

        this.change$.next(newState);

        if (this.side === BattleSide.left) {
            this.connection.sendLeftState(newState);
        }

        if (this.side === BattleSide.right) {
            this.connection.sendRightState(newState);
        }
    }
}