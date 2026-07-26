import spinSound from "../src/assets/sounds/spin.wav";
import buttonSound from "../src/assets/sounds/button.wav";
import coinSound from "../src/assets/sounds/coin.wav";
import winSound from "../src/assets/sounds/win.wav";

export class SoundManager {

    private spin: HTMLAudioElement;

    private button: HTMLAudioElement;

    private coin: HTMLAudioElement;

    private win: HTMLAudioElement;



constructor() {

    this.spin =
        new Audio(
            spinSound
        );

    this.button =
        new Audio(
            buttonSound
        );

    this.coin =
        new Audio(
            coinSound
        );

    this.win =
        new Audio(
            winSound
        );

}

playSpin(): void {

    this.spin.currentTime = 0;

    this.spin.play();

}

playButton(): void {

    this.button.currentTime = 0;

    this.button.play();

}

playCoin(): void {

    this.coin.currentTime = 0;

    this.coin.play();

}

playWin(): void {

    this.win.currentTime = 0;

    this.win.play();

}

 stopSpin(): void {

 this.fadeOutSpin();

}

    private fadeOutSpin(): void {

        const fade = () => {

        this.spin.volume = Math.max(
        0,
        this.spin.volume - 0.05
        );


        if (this.spin.volume <= 0) {

        this.spin.pause();

        this.spin.currentTime = 0;

        this.spin.volume = 1;

        return;

       }
       requestAnimationFrame(fade);

        };

        fade();

    }

}