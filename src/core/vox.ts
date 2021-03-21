/* eslint-disable no-console */
const Vox = (function () {
    const privateProps = new WeakMap();
    const _attack = 50;
    const _decay = 200;
    let _compressor = undefined,
        _context = undefined;

    class Vox {

        constructor(context, compressor, freq, wave) {
            const node = context.createGain();
            node.connect(compressor);
            node.gain.setValueAtTime(0, context.currentTime);


            const oscillator = context.createOscillator();
            oscillator.type = wave;
            oscillator.frequency.setValueAtTime(freq, context.currentTime); // value in hertz
            oscillator.connect(node);
            oscillator.start();

            privateProps.set(this, {
                oscillators: [oscillator],
                node: node,
                playing: false,
                wave: wave
            });

            _context = context;
            _compressor = compressor;

        }

        get context() {
            return _context;
        }
        get compressor() {
            return _compressor;
        }
        get node() {
            return privateProps.get(this).node;
        }
        get gain() {
            return privateProps.get(this).node.gain;
        }
        get oscillators() {
            return privateProps.get(this).oscillators;
        }
        get playing() {
            return privateProps.get(this).playing;
        }
        set playing(bool) {
            privateProps.get(this).playing = bool;
        }
        get wave() {
            return privateProps.get(this).wave;
        }
        set wave(type) {
            for (let o = 0; o < this.oscillators.length; o++) {
                this.oscillators[o].type = type;
            }
            privateProps.get(this).wave = type;
        }

        setChord(freqArray) {
            //cleaning
            for (let i = 0; i < privateProps.get(this).oscillators.length; i++) {
                privateProps.get(this).oscillators[i].stop();
            }
            privateProps.get(this).oscillators = [];
            // setting chord
            for (let i = 0; i < freqArray.length; i++) {
                const oscillator = _context.createOscillator();
                oscillator.type = this.wave;
                oscillator.frequency.setValueAtTime(freqArray[i], _context.currentTime); // value in hertz
                oscillator.connect(this.node);
                oscillator.start();
                privateProps.get(this).oscillators.push(oscillator);
            }
            return freqArray;
        }
        blow() {
            let attack = _attack / 1000;
            attack = attack * (1 - this.gain.value);
            this.gain.cancelScheduledValues(_context.currentTime);
            this.gain.setValueAtTime(this.gain.value, _context.currentTime);
            this.gain.linearRampToValueAtTime(1, _context.currentTime + attack);
            this.playing = true;
            if (!this.playing) this.release();
        }
        release() {
            let decay = _decay / 1000;
            decay = decay * this.gain.value;
            this.gain.cancelScheduledValues(_context.currentTime);
            this.gain.setValueAtTime(this.gain.value, _context.currentTime);
            this.gain.linearRampToValueAtTime(0, _context.currentTime + decay);
            this.playing = false;
        }
    }
    return Vox;
})();

export default Vox;