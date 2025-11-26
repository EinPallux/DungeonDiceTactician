/**
 * Dice.js - Handles dice mechanics, faces, and rolling
 */

export class DiceFace {
    constructor(type, value, symbol = null) {
        this.type = type; // 'attack', 'defense', 'crit', 'magic', 'special'
        this.value = value; // numeric value for attack/defense, or 0 for symbols
        this.symbol = symbol; // symbol name for special faces
    }

    toString() {
        if (this.type === 'attack') return `⚔️${this.value}`;
        if (this.type === 'defense') return `🛡️${this.value}`;
        if (this.type === 'crit') return '💥';
        if (this.type === 'magic') return '✨';
        if (this.type === 'special' && this.symbol) return this.getSymbolIcon();
        return '?';
    }

    getSymbolIcon() {
        const symbols = {
            'earth': '🌍',
            'stone': '🗿',
            'crystal': '💎',
            'darkness': '🌑',
            'void': '🕳️',
            'shadow': '👥',
            'flame': '🔥',
            'frost': '❄️',
            'lightning': '⚡',
            'wind': '💨',
            'nature': '🌿',
            'blood': '🩸',
            'holy': '✝️',
            'chaos': '🌀',
            'time': '⏰',
            'spirit': '👻',
            'poison': '☠️',
            'blade': '🗡️'
        };
        return symbols[this.symbol] || '⭐';
    }

    getCSSClass() {
        return `die-face-${this.type}`;
    }
}

export class Dice {
    constructor(faces = []) {
        this.id = this.generateId();
        this.faces = faces; // Array of DiceFace objects
        this.currentFace = null;
        this.isRolled = false;
    }

    generateId() {
        return `die_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    roll() {
        const randomIndex = Math.floor(Math.random() * this.faces.length);
        this.currentFace = this.faces[randomIndex];
        this.isRolled = true;
        return this.currentFace;
    }

    getFaceValue() {
        return this.currentFace ? this.currentFace.value : 0;
    }

    getFaceType() {
        return this.currentFace ? this.currentFace.type : null;
    }

    getFaceSymbol() {
        return this.currentFace ? this.currentFace.symbol : null;
    }

    reset() {
        this.currentFace = null;
        this.isRolled = false;
    }

    clone() {
        const newDice = new Dice([...this.faces]);
        if (this.isRolled) {
            newDice.currentFace = this.currentFace;
            newDice.isRolled = true;
        }
        return newDice;
    }
}

/**
 * DiceSet - Manages a collection of dice for a character class
 */
export class DiceSet {
    constructor(className, diceArray = []) {
        this.className = className;
        this.dice = diceArray;
    }

    rollAll() {
        const results = [];
        this.dice.forEach(die => {
            results.push(die.roll());
        });
        return results;
    }

    resetAll() {
        this.dice.forEach(die => die.reset());
    }

    getDice() {
        return this.dice;
    }

    addDie(die) {
        this.dice.push(die);
    }

    removeDie(index) {
        if (index >= 0 && index < this.dice.length) {
            this.dice.splice(index, 1);
        }
    }

    // Replace a specific face on a die
    replaceFace(dieIndex, faceIndex, newFace) {
        if (dieIndex >= 0 && dieIndex < this.dice.length) {
            const die = this.dice[dieIndex];
            if (faceIndex >= 0 && faceIndex < die.faces.length) {
                die.faces[faceIndex] = newFace;
            }
        }
    }

    clone() {
        const clonedDice = this.dice.map(die => die.clone());
        return new DiceSet(this.className, clonedDice);
    }
}

/**
 * DiceFactory - Creates dice sets for different classes
 */
export class DiceFactory {
    static createBladeDancerDice() {
        const dice = [];
        
        // Die 1: High attack focus
        dice.push(new Dice([
            new DiceFace('attack', 8),
            new DiceFace('attack', 6),
            new DiceFace('attack', 10),
            new DiceFace('crit'),
            new DiceFace('defense', 3),
            new DiceFace('attack', 7)
        ]));

        // Die 2: Crit and attack
        dice.push(new Dice([
            new DiceFace('attack', 6),
            new DiceFace('crit'),
            new DiceFace('attack', 5),
            new DiceFace('crit'),
            new DiceFace('attack', 9),
            new DiceFace('defense', 4)
        ]));

        // Die 3: Balanced
        dice.push(new Dice([
            new DiceFace('attack', 7),
            new DiceFace('defense', 5),
            new DiceFace('attack', 8),
            new DiceFace('crit'),
            new DiceFace('defense', 6),
            new DiceFace('attack', 6)
        ]));

        return new DiceSet('Blade Dancer', dice);
    }

    static createGeomancerDice() {
        const dice = [];
        
        // Die 1: Earth symbols
        dice.push(new Dice([
            new DiceFace('special', 0, 'earth'),
            new DiceFace('attack', 5),
            new DiceFace('defense', 7),
            new DiceFace('special', 0, 'earth'),
            new DiceFace('defense', 8),
            new DiceFace('attack', 6)
        ]));

        // Die 2: Stone symbols
        dice.push(new Dice([
            new DiceFace('special', 0, 'stone'),
            new DiceFace('defense', 9),
            new DiceFace('attack', 5),
            new DiceFace('special', 0, 'stone'),
            new DiceFace('defense', 7),
            new DiceFace('attack', 6)
        ]));

        // Die 3: Crystal symbols
        dice.push(new Dice([
            new DiceFace('special', 0, 'crystal'),
            new DiceFace('attack', 6),
            new DiceFace('defense', 6),
            new DiceFace('special', 0, 'crystal'),
            new DiceFace('magic'),
            new DiceFace('attack', 7)
        ]));

        return new DiceSet('Geomancer', dice);
    }

    static createShadowPriestDice() {
        const dice = [];
        
        // Die 1: Darkness focus
        dice.push(new Dice([
            new DiceFace('special', 0, 'darkness'),
            new DiceFace('magic'),
            new DiceFace('attack', 5),
            new DiceFace('special', 0, 'darkness'),
            new DiceFace('magic'),
            new DiceFace('defense', 5)
        ]));

        // Die 2: Void symbols
        dice.push(new Dice([
            new DiceFace('special', 0, 'void'),
            new DiceFace('attack', 6),
            new DiceFace('special', 0, 'void'),
            new DiceFace('magic'),
            new DiceFace('defense', 6),
            new DiceFace('attack', 7)
        ]));

        // Die 3: Shadow and magic
        dice.push(new Dice([
            new DiceFace('special', 0, 'shadow'),
            new DiceFace('magic'),
            new DiceFace('attack', 6),
            new DiceFace('defense', 7),
            new DiceFace('special', 0, 'shadow'),
            new DiceFace('magic')
        ]));

        return new DiceSet('Shadow Priest', dice);
    }

    static createPyromanticDice() {
        const dice = [];
        
        // Die 1: Flame focus
        dice.push(new Dice([
            new DiceFace('special', 0, 'flame'),
            new DiceFace('attack', 9),
            new DiceFace('attack', 8),
            new DiceFace('special', 0, 'flame'),
            new DiceFace('magic'),
            new DiceFace('attack', 10)
        ]));

        // Die 2: High attack with flame
        dice.push(new Dice([
            new DiceFace('attack', 7),
            new DiceFace('special', 0, 'flame'),
            new DiceFace('attack', 11),
            new DiceFace('crit'),
            new DiceFace('attack', 8),
            new DiceFace('defense', 3)
        ]));

        // Die 3: Balanced flame
        dice.push(new Dice([
            new DiceFace('special', 0, 'flame'),
            new DiceFace('attack', 6),
            new DiceFace('defense', 4),
            new DiceFace('magic'),
            new DiceFace('attack', 9),
            new DiceFace('special', 0, 'flame')
        ]));

        return new DiceSet('Pyromantic', dice);
    }

    static createFrostWeaverDice() {
        const dice = [];
        
        // Die 1: Frost control
        dice.push(new Dice([
            new DiceFace('special', 0, 'frost'),
            new DiceFace('defense', 8),
            new DiceFace('attack', 5),
            new DiceFace('special', 0, 'frost'),
            new DiceFace('magic'),
            new DiceFace('defense', 7)
        ]));

        // Die 2: Frost and magic
        dice.push(new Dice([
            new DiceFace('attack', 6),
            new DiceFace('special', 0, 'frost'),
            new DiceFace('defense', 9),
            new DiceFace('magic'),
            new DiceFace('attack', 7),
            new DiceFace('special', 0, 'frost')
        ]));

        // Die 3: Balanced frost
        dice.push(new Dice([
            new DiceFace('special', 0, 'frost'),
            new DiceFace('attack', 6),
            new DiceFace('defense', 8),
            new DiceFace('attack', 7),
            new DiceFace('magic'),
            new DiceFace('defense', 6)
        ]));

        return new DiceSet('Frost Weaver', dice);
    }

    static createStormCallerDice() {
        const dice = [];
        
        // Die 1: Lightning strikes
        dice.push(new Dice([
            new DiceFace('special', 0, 'lightning'),
            new DiceFace('attack', 8),
            new DiceFace('crit'),
            new DiceFace('special', 0, 'lightning'),
            new DiceFace('attack', 10),
            new DiceFace('magic')
        ]));

        // Die 2: Wind and lightning
        dice.push(new Dice([
            new DiceFace('special', 0, 'wind'),
            new DiceFace('attack', 7),
            new DiceFace('defense', 5),
            new DiceFace('special', 0, 'lightning'),
            new DiceFace('crit'),
            new DiceFace('attack', 9)
        ]));

        // Die 3: Storm power
        dice.push(new Dice([
            new DiceFace('attack', 6),
            new DiceFace('special', 0, 'wind'),
            new DiceFace('magic'),
            new DiceFace('attack', 8),
            new DiceFace('special', 0, 'lightning'),
            new DiceFace('defense', 6)
        ]));

        return new DiceSet('Storm Caller', dice);
    }

    static createNatureShamanDice() {
        const dice = [];
        
        // Die 1: Nature's power
        dice.push(new Dice([
            new DiceFace('special', 0, 'nature'),
            new DiceFace('defense', 8),
            new DiceFace('attack', 6),
            new DiceFace('special', 0, 'nature'),
            new DiceFace('defense', 9),
            new DiceFace('magic')
        ]));

        // Die 2: Healing and growth
        dice.push(new Dice([
            new DiceFace('attack', 5),
            new DiceFace('special', 0, 'nature'),
            new DiceFace('defense', 10),
            new DiceFace('magic'),
            new DiceFace('defense', 7),
            new DiceFace('attack', 6)
        ]));

        // Die 3: Balanced nature
        dice.push(new Dice([
            new DiceFace('special', 0, 'nature'),
            new DiceFace('attack', 7),
            new DiceFace('defense', 7),
            new DiceFace('attack', 6),
            new DiceFace('special', 0, 'nature'),
            new DiceFace('magic')
        ]));

        return new DiceSet('Nature Shaman', dice);
    }

    static createBloodKnightDice() {
        const dice = [];
        
        // Die 1: Blood sacrifice
        dice.push(new Dice([
            new DiceFace('special', 0, 'blood'),
            new DiceFace('attack', 9),
            new DiceFace('attack', 7),
            new DiceFace('special', 0, 'blood'),
            new DiceFace('crit'),
            new DiceFace('attack', 8)
        ]));

        // Die 2: High risk, high reward
        dice.push(new Dice([
            new DiceFace('attack', 10),
            new DiceFace('special', 0, 'blood'),
            new DiceFace('attack', 6),
            new DiceFace('crit'),
            new DiceFace('defense', 4),
            new DiceFace('attack', 11)
        ]));

        // Die 3: Blood magic
        dice.push(new Dice([
            new DiceFace('special', 0, 'blood'),
            new DiceFace('attack', 8),
            new DiceFace('magic'),
            new DiceFace('attack', 7),
            new DiceFace('special', 0, 'blood'),
            new DiceFace('defense', 5)
        ]));

        return new DiceSet('Blood Knight', dice);
    }

    static createHolyPaladinDice() {
        const dice = [];
        
        // Die 1: Holy protection
        dice.push(new Dice([
            new DiceFace('special', 0, 'holy'),
            new DiceFace('defense', 9),
            new DiceFace('attack', 6),
            new DiceFace('special', 0, 'holy'),
            new DiceFace('defense', 8),
            new DiceFace('magic')
        ]));

        // Die 2: Righteous power
        dice.push(new Dice([
            new DiceFace('attack', 7),
            new DiceFace('special', 0, 'holy'),
            new DiceFace('defense', 7),
            new DiceFace('attack', 8),
            new DiceFace('magic'),
            new DiceFace('defense', 6)
        ]));

        // Die 3: Divine balance
        dice.push(new Dice([
            new DiceFace('special', 0, 'holy'),
            new DiceFace('attack', 7),
            new DiceFace('defense', 8),
            new DiceFace('magic'),
            new DiceFace('attack', 6),
            new DiceFace('defense', 7)
        ]));

        return new DiceSet('Holy Paladin', dice);
    }

    static createChaosMageDice() {
        const dice = [];
        
        // Die 1: Pure chaos
        dice.push(new Dice([
            new DiceFace('special', 0, 'chaos'),
            new DiceFace('attack', 12),
            new DiceFace('defense', 2),
            new DiceFace('special', 0, 'chaos'),
            new DiceFace('attack', 3),
            new DiceFace('magic')
        ]));

        // Die 2: Unpredictable power
        dice.push(new Dice([
            new DiceFace('attack', 10),
            new DiceFace('special', 0, 'chaos'),
            new DiceFace('defense', 10),
            new DiceFace('crit'),
            new DiceFace('attack', 4),
            new DiceFace('special', 0, 'chaos')
        ]));

        // Die 3: Wild magic
        dice.push(new Dice([
            new DiceFace('special', 0, 'chaos'),
            new DiceFace('magic'),
            new DiceFace('attack', 8),
            new DiceFace('defense', 6),
            new DiceFace('crit'),
            new DiceFace('magic')
        ]));

        return new DiceSet('Chaos Mage', dice);
    }

    static createTimeWeaverDice() {
        const dice = [];
        
        // Die 1: Time manipulation
        dice.push(new Dice([
            new DiceFace('special', 0, 'time'),
            new DiceFace('attack', 6),
            new DiceFace('defense', 6),
            new DiceFace('special', 0, 'time'),
            new DiceFace('magic'),
            new DiceFace('attack', 7)
        ]));

        // Die 2: Temporal power
        dice.push(new Dice([
            new DiceFace('defense', 7),
            new DiceFace('special', 0, 'time'),
            new DiceFace('attack', 8),
            new DiceFace('magic'),
            new DiceFace('defense', 8),
            new DiceFace('special', 0, 'time')
        ]));

        // Die 3: Time control
        dice.push(new Dice([
            new DiceFace('special', 0, 'time'),
            new DiceFace('attack', 7),
            new DiceFace('defense', 7),
            new DiceFace('crit'),
            new DiceFace('magic'),
            new DiceFace('attack', 6)
        ]));

        return new DiceSet('Time Weaver', dice);
    }

    static createSpiritSummonerDice() {
        const dice = [];
        
        // Die 1: Spirit power
        dice.push(new Dice([
            new DiceFace('special', 0, 'spirit'),
            new DiceFace('magic'),
            new DiceFace('attack', 6),
            new DiceFace('special', 0, 'spirit'),
            new DiceFace('defense', 7),
            new DiceFace('magic')
        ]));

        // Die 2: Summoning
        dice.push(new Dice([
            new DiceFace('attack', 5),
            new DiceFace('special', 0, 'spirit'),
            new DiceFace('magic'),
            new DiceFace('defense', 8),
            new DiceFace('attack', 7),
            new DiceFace('special', 0, 'spirit')
        ]));

        // Die 3: Spirit magic
        dice.push(new Dice([
            new DiceFace('special', 0, 'spirit'),
            new DiceFace('attack', 6),
            new DiceFace('defense', 6),
            new DiceFace('magic'),
            new DiceFace('attack', 7),
            new DiceFace('magic')
        ]));

        return new DiceSet('Spirit Summoner', dice);
    }

    // Factory method to get dice by class name
    static createDiceForClass(className) {
        const creators = {
            'Blade Dancer': this.createBladeDancerDice,
            'Geomancer': this.createGeomancerDice,
            'Shadow Priest': this.createShadowPriestDice,
            'Pyromantic': this.createPyromanticDice,
            'Frost Weaver': this.createFrostWeaverDice,
            'Storm Caller': this.createStormCallerDice,
            'Nature Shaman': this.createNatureShamanDice,
            'Blood Knight': this.createBloodKnightDice,
            'Holy Paladin': this.createHolyPaladinDice,
            'Chaos Mage': this.createChaosMageDice,
            'Time Weaver': this.createTimeWeaverDice,
            'Spirit Summoner': this.createSpiritSummonerDice
        };

        const creator = creators[className];
        return creator ? creator.call(this) : this.createBladeDancerDice();
    }
}
