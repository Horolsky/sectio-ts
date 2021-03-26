export class Vox {
    readonly attack = 50;
    readonly decay = 200;
    readonly compressor: DynamicsCompressorNode;
    readonly context: AudioContext;
    readonly oscillators: OscillatorNode[];
    readonly node: GainNode;
    private _playing: boolean;
    private _wave: OscillatorType;
    constructor(
        context: AudioContext,
        compressor: DynamicsCompressorNode, 
        freq: number,
        wave: OscillatorType
        ) {
        const node = context.createGain();
        node.connect(compressor);
        node.gain.setValueAtTime(0, context.currentTime);

        const oscillator = context.createOscillator();
        oscillator.type = wave;
        oscillator.frequency.setValueAtTime(freq, context.currentTime); // value in hertz
        oscillator.connect(node);
        oscillator.start();

        
        this.oscillators = [oscillator];
        this.node = node;
        this._playing =  false;
        this._wave = wave;
        
        this.context = context;
        this.compressor = compressor;

    }


    get wave() {
        return this._wave;
    }
    set wave(type) {
        for (let o = 0; o < this.oscillators.length; o++) {
            this.oscillators[o].type = type;
        }
        this._wave = type;
    }
    get gain() {
        return this.node.gain;
    }
    get playing() {
        return this._playing;
    }
    set playing(val: boolean) {
        this._playing = val;
    }

    setChord(freqArray: number[]) {
        //cleaning
        for (let i = 0; i < this.oscillators.length; i++) {
            this.oscillators[i].stop();
        }
        this.oscillators.splice(0,this.oscillators.length);
        // setting chord
        for (let i = 0; i < freqArray.length; i++) {
            const oscillator = this.context.createOscillator();
            oscillator.type = this.wave;
            oscillator.frequency.setValueAtTime(freqArray[i], this.context.currentTime); // value in hertz
            oscillator.connect(this.node);
            oscillator.start();
            this.oscillators.push(oscillator);
        }
    }
    blow() {
        let attack = this.attack / 1000;
        attack = attack * (1 - this.gain.value);
        this.gain.cancelScheduledValues(this.context.currentTime);
        this.gain.setValueAtTime(this.gain.value, this.context.currentTime);
        this.gain.linearRampToValueAtTime(1, this.context.currentTime + attack);
        this.playing = true;
        if (!this.playing) this.release();
    }
    release() {
        let decay = this.decay / 1000;
        decay = decay * this.gain.value;
        this.gain.cancelScheduledValues(this.context.currentTime);
        this.gain.setValueAtTime(this.gain.value, this.context.currentTime);
        this.gain.linearRampToValueAtTime(0, this.context.currentTime + decay);
        this.playing = false;
    }
}

export default {
    Vox
};