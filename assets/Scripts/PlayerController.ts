import { _decorator, Component, EventMouse, Input, input, Node, Vec3, Animation  } from 'cc';
const { ccclass, property } = _decorator;

export const BLOCK_SIZE = 40; 

@ccclass('PlayerController')
export class PlayerController extends Component {

    //used to judge if the player is jumping.
    private _startJump: boolean = false;

    //the number of steps will the player jump, should be 1 or 2. determined by which mouse button is clicked.
    private _jumpStep: number = 1;

    //the time it takes for the player to jump once.
    private _jumpTime: number = 0.1;

    //the time that the player's current jump action has taken, should be set to 0 each time the player jumps, when it reaches the value of `_jumpTime`, the jump action is completed.
    private _curJumpTime: number = 0;

    // The player's current vertical speed, used to calculate the Y value of position when jumping.
    private _curJumpSpeed: number = 1;

    // The current position of the player, used as the original position in the physics formula.
    private _curPos: Vec3 = new Vec3();

    //movement calculated by deltaTime.
    private _deltaPos: Vec3 = new Vec3(0, 0, 0);

    // store the final position of the player, when the player's jumping action ends, it will be used directly to avoid cumulative errors.
    private _targetPos: Vec3 = new Vec3();

    private _curMoveIndex: number = 0;

    @property(Animation)
    BodyAnim:Animation = null;

    start() {
        // input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    setInputActive(active: boolean) {
        if (active) {
            input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        } else {
            input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }

    update (deltaTime: number) {
        if (this._startJump) {
            this._curJumpTime += deltaTime;
            if (this._curJumpTime > this._jumpTime) {
                // end
                this.node.setPosition(this._targetPos);
                this._startJump = false;      
                this.onOnceJumpEnd();        
            } else {
                // tween
                this.node.getPosition(this._curPos);
                this._deltaPos.x = this._curJumpSpeed * deltaTime;
                Vec3.add(this._curPos, this._curPos, this._deltaPos);
                this.node.setPosition(this._curPos);
            }
        }
    }

    onMouseUp(event: EventMouse) {
        if (event.getButton() === EventMouse.BUTTON_LEFT) {
            // this.BodyAnim.play('oneStep');
            this.jumpByStep(1)
        } else if (event.getButton() === EventMouse.BUTTON_RIGHT) {
            // this.BodyAnim.play('twoStep');
            this.jumpByStep(2)

        }
    }

    jumpByStep(step: number) {
        if (this._startJump) {
            return;
        }
        this._startJump = true;
        this._jumpStep = step;
        this._curJumpTime = 0;
        this._curJumpSpeed = this._jumpStep * BLOCK_SIZE/ this._jumpTime;
        this.node.getPosition(this._curPos);
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep* BLOCK_SIZE, 0, 0));  
        
        if (this.BodyAnim) {
            if (step === 1) {
                this.BodyAnim.play('oneStep');
            } else if (step === 2) {
                this.BodyAnim.play('twoStep');
            }
        }
    
        this._curMoveIndex += step;
    }

    reset() {
        this._curMoveIndex = 0;
        this.node.getPosition(this._curPos);
        this._targetPos.set(0,0,0);
    }

    onOnceJumpEnd() {
        this.node.emit('JumpEnd', this._curMoveIndex);
    }
}