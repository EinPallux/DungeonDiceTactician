/**
 * Enemy.js - Handles enemy creation, behavior, and combat AI
 */

export class Enemy {
    constructor(name, type, hp, attack, defense = 0) {
        this.name = name;
        this.type = type; // 'minion', 'elite', 'boss'
        this.maxHP = hp;
        this.currentHP = hp;
        this.baseAttack = attack;
        this.attack = attack;
        this.defense = defense;
        
        // Behavior and abilities
        this.behavior = null;
        this.turnCounter = 0;
        this.abilities = [];
        this.effects = [];
        
        // Special mechanics
        this.chargeCounter = 0;
        this.specialCooldown = 0;
        
        // Rewards
        this.goldReward = this.calculateGoldReward();
    }

    calculateGoldReward() {
        const baseGold = {
            'minion': 10,
            'elite': 25,
            'boss': 50
        };
        return baseGold[this.type] || 10;
    }

    takeDamage(amount) {
        const actualDamage = Math.max(0, amount - this.defense);
        this.currentHP = Math.max(0, this.currentHP - actualDamage);
        return actualDamage;
    }

    heal(amount) {
        const actualHeal = Math.min(amount, this.maxHP - this.currentHP);
        this.currentHP = Math.min(this.maxHP, this.currentHP + actualHeal);
        return actualHeal;
    }

    isAlive() {
        return this.currentHP > 0;
    }

    addEffect(effect) {
        this.effects.push(effect);
    }

    removeEffect(effectName) {
        this.effects = this.effects.filter(e => e.name !== effectName);
    }

    hasEffect(effectName) {
        return this.effects.some(e => e.name === effectName);
    }

    updateEffects() {
        // Process damage over time effects
        this.effects.forEach(effect => {
            if (effect.damage) {
                this.takeDamage(effect.damage);
            }
            if (effect.healing) {
                this.heal(effect.healing);
            }
        });

        // Reduce duration and remove expired effects
        this.effects = this.effects.filter(effect => {
            if (effect.duration !== undefined) {
                effect.duration--;
                return effect.duration > 0;
            }
            return true;
        });
    }

    getNextAction() {
        if (this.behavior) {
            return this.behavior(this);
        }
        return { type: 'attack', value: this.attack };
    }

    executeAction() {
        this.turnCounter++;
        const action = this.getNextAction();
        
        // Apply attack reduction from effects (like Frozen)
        if (action.type === 'attack' && this.hasEffect('Frozen')) {
            const frozenEffect = this.effects.find(e => e.name === 'Frozen');
            if (frozenEffect && frozenEffect.attackReduction) {
                action.value = Math.floor(action.value * (1 - frozenEffect.attackReduction));
            }
        }

        return action;
    }

    getHPPercentage() {
        return (this.currentHP / this.maxHP) * 100;
    }

    getTotalAttack() {
        let total = this.attack;
        this.effects.forEach(effect => {
            if (effect.attackBonus) total += effect.attackBonus;
        });
        return total;
    }

    getTotalDefense() {
        let total = this.defense;
        this.effects.forEach(effect => {
            if (effect.defenseBonus) total += effect.defenseBonus;
        });
        return total;
    }
}

/**
 * EnemyFactory - Creates enemies with scaling based on round number
 */
export class EnemyFactory {
    static createEnemy(roundNumber) {
        // Every 10 rounds, increase chance of elite/boss
        const isBossRound = roundNumber % 10 === 0 && roundNumber > 0;
        const isEliteRound = roundNumber % 5 === 0 && !isBossRound && roundNumber > 0;

        if (isBossRound) {
            return this.createBoss(roundNumber);
        } else if (isEliteRound) {
            return this.createElite(roundNumber);
        } else {
            return this.createMinion(roundNumber);
        }
    }

    static createMinion(roundNumber) {
        const minions = [
            this.createGoblin,
            this.createSkeleton,
            this.createRat,
            this.createBat,
            this.createSlime,
            this.createZombie,
            this.createWolf,
            this.createSpider,
            this.createBandit,
            this.createCultist,
            this.createImp,
            this.createGhost,
            this.createWisp,
            this.createMushroom,
            this.createCrab,
            this.createSnake,
            this.createScorpion,
            this.createHarpy,
            this.createGremlin,
            this.createShadowling,
            this.createFireElemental,
            this.createIceElemental,
            this.createWindElemental,
            this.createEarthElemental,
            this.createCorruptedKnight
        ];

        const creator = minions[Math.floor(Math.random() * minions.length)];
        return creator.call(this, roundNumber);
    }

    static createElite(roundNumber) {
        const elites = [
            this.createStoneGolem,
            this.createDarkMage,
            this.createBerserker,
            this.createNecromancer,
            this.createAssassin,
            this.createWarlock,
            this.createVampire,
            this.createWerewolf,
            this.createMinotaur,
            this.createHydra,
            this.createPhoenix,
            this.createFrostGiant,
            this.createDemonLord,
            this.createDragonKnight,
            this.createLich
        ];

        const creator = elites[Math.floor(Math.random() * elites.length)];
        return creator.call(this, roundNumber);
    }

    static createBoss(roundNumber) {
        const bosses = [
            this.createDragon,
            this.createDemonKing,
            this.createAncientLich,
            this.createTitanGolem,
            this.createVoidLord,
            this.createArchmage,
            this.createDarkOverlord,
            this.createCelestialBeing,
            this.createEldritchHorror,
            this.createPrimordialBeast
        ];

        const creator = bosses[Math.floor(Math.random() * bosses.length)];
        return creator.call(this, roundNumber);
    }

    static scaleStats(baseHP, baseAttack, roundNumber) {
        const multiplier = 1 + (roundNumber * 0.15);
        return {
            hp: Math.floor(baseHP * multiplier),
            attack: Math.floor(baseAttack * multiplier)
        };
    }

    // MINION ENEMIES (25 total)

    static createGoblin(roundNumber) {
        const stats = this.scaleStats(30, 8, roundNumber);
        const enemy = new Enemy('Goblin', 'minion', stats.hp, stats.attack, 0);
        enemy.behavior = (self) => ({ type: 'attack', value: self.attack });
        return enemy;
    }

    static createSkeleton(roundNumber) {
        const stats = this.scaleStats(25, 10, roundNumber);
        const enemy = new Enemy('Skeleton', 'minion', stats.hp, stats.attack, 2);
        enemy.behavior = (self) => ({ type: 'attack', value: self.attack });
        return enemy;
    }

    static createRat(roundNumber) {
        const stats = this.scaleStats(20, 6, roundNumber);
        const enemy = new Enemy('Giant Rat', 'minion', stats.hp, stats.attack, 0);
        enemy.behavior = (self) => {
            // Fast attacks, low damage
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createBat(roundNumber) {
        const stats = this.scaleStats(22, 7, roundNumber);
        const enemy = new Enemy('Vampire Bat', 'minion', stats.hp, stats.attack, 0);
        enemy.behavior = (self) => {
            // Life steal on hit
            return { type: 'attack', value: self.attack, lifeSteal: 0.3 };
        };
        return enemy;
    }

    static createSlime(roundNumber) {
        const stats = this.scaleStats(35, 5, roundNumber);
        const enemy = new Enemy('Slime', 'minion', stats.hp, stats.attack, 1);
        enemy.behavior = (self) => {
            // Splits when health is low
            if (self.getHPPercentage() < 30 && !self.hasSplit) {
                self.hasSplit = true;
                return { type: 'heal', value: 10 };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createZombie(roundNumber) {
        const stats = this.scaleStats(40, 9, roundNumber);
        const enemy = new Enemy('Zombie', 'minion', stats.hp, stats.attack, 1);
        enemy.behavior = (self) => ({ type: 'attack', value: self.attack });
        return enemy;
    }

    static createWolf(roundNumber) {
        const stats = this.scaleStats(28, 11, roundNumber);
        const enemy = new Enemy('Dire Wolf', 'minion', stats.hp, stats.attack, 0);
        enemy.behavior = (self) => {
            // Higher attack every 2 turns
            if (self.turnCounter % 2 === 0) {
                return { type: 'attack', value: Math.floor(self.attack * 1.5), message: 'Savage Bite!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createSpider(roundNumber) {
        const stats = this.scaleStats(26, 8, roundNumber);
        const enemy = new Enemy('Giant Spider', 'minion', stats.hp, stats.attack, 1);
        enemy.behavior = (self) => {
            // Poison attack every 3 turns
            if (self.turnCounter % 3 === 0) {
                return { type: 'attack', value: self.attack, poison: 3, message: 'Poison Bite!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createBandit(roundNumber) {
        const stats = this.scaleStats(32, 10, roundNumber);
        const enemy = new Enemy('Bandit', 'minion', stats.hp, stats.attack, 0);
        enemy.behavior = (self) => ({ type: 'attack', value: self.attack });
        return enemy;
    }

    static createCultist(roundNumber) {
        const stats = this.scaleStats(27, 7, roundNumber);
        const enemy = new Enemy('Cultist', 'minion', stats.hp, stats.attack, 0);
        enemy.chargeCounter = 0;
        enemy.behavior = (self) => {
            self.chargeCounter++;
            if (self.chargeCounter >= 3) {
                self.chargeCounter = 0;
                return { type: 'attack', value: self.attack * 2, message: 'Dark Ritual!' };
            }
            return { type: 'attack', value: Math.floor(self.attack * 0.5), message: 'Charging...' };
        };
        return enemy;
    }

    static createImp(roundNumber) {
        const stats = this.scaleStats(24, 9, roundNumber);
        const enemy = new Enemy('Imp', 'minion', stats.hp, stats.attack, 0);
        enemy.behavior = (self) => {
            // Random attack value
            const variance = Math.floor(Math.random() * 6) - 3;
            return { type: 'attack', value: self.attack + variance };
        };
        return enemy;
    }

    static createGhost(roundNumber) {
        const stats = this.scaleStats(23, 8, roundNumber);
        const enemy = new Enemy('Ghost', 'minion', stats.hp, stats.attack, 0);
        enemy.behavior = (self) => {
            // Phases out, reducing damage taken
            if (self.turnCounter % 4 === 0) {
                return { type: 'defend', value: 10, message: 'Ethereal Form' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createWisp(roundNumber) {
        const stats = this.scaleStats(20, 7, roundNumber);
        const enemy = new Enemy('Wisp', 'minion', stats.hp, stats.attack, 0);
        enemy.behavior = (self) => ({ type: 'attack', value: self.attack });
        return enemy;
    }

    static createMushroom(roundNumber) {
        const stats = this.scaleStats(38, 6, roundNumber);
        const enemy = new Enemy('Poison Mushroom', 'minion', stats.hp, stats.attack, 2);
        enemy.behavior = (self) => {
            // Releases spores
            return { type: 'attack', value: self.attack, poison: 2 };
        };
        return enemy;
    }

    static createCrab(roundNumber) {
        const stats = this.scaleStats(33, 8, roundNumber);
        const enemy = new Enemy('Giant Crab', 'minion', stats.hp, stats.attack, 3);
        enemy.behavior = (self) => {
            // Hard shell defense
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createSnake(roundNumber) {
        const stats = this.scaleStats(25, 9, roundNumber);
        const enemy = new Enemy('Viper', 'minion', stats.hp, stats.attack, 0);
        enemy.behavior = (self) => {
            // Venomous strike
            if (self.turnCounter % 2 === 0) {
                return { type: 'attack', value: self.attack, poison: 4, message: 'Venomous Strike!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createScorpion(roundNumber) {
        const stats = this.scaleStats(29, 10, roundNumber);
        const enemy = new Enemy('Giant Scorpion', 'minion', stats.hp, stats.attack, 1);
        enemy.behavior = (self) => {
            // Tail strike with poison
            return { type: 'attack', value: self.attack, poison: 2 };
        };
        return enemy;
    }

    static createHarpy(roundNumber) {
        const stats = this.scaleStats(27, 11, roundNumber);
        const enemy = new Enemy('Harpy', 'minion', stats.hp, stats.attack, 0);
        enemy.behavior = (self) => {
            // Dive attack
            if (self.turnCounter % 3 === 0) {
                return { type: 'attack', value: Math.floor(self.attack * 1.6), message: 'Dive Bomb!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createGremlin(roundNumber) {
        const stats = this.scaleStats(26, 9, roundNumber);
        const enemy = new Enemy('Gremlin', 'minion', stats.hp, stats.attack, 0);
        enemy.behavior = (self) => {
            // Tricks and debuffs
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createShadowling(roundNumber) {
        const stats = this.scaleStats(24, 10, roundNumber);
        const enemy = new Enemy('Shadowling', 'minion', stats.hp, stats.attack, 0);
        enemy.behavior = (self) => {
            // Shadow attacks
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createFireElemental(roundNumber) {
        const stats = this.scaleStats(30, 12, roundNumber);
        const enemy = new Enemy('Fire Elemental', 'minion', stats.hp, stats.attack, 0);
        enemy.behavior = (self) => {
            // Burning attacks
            return { type: 'attack', value: self.attack, burn: 2 };
        };
        return enemy;
    }

    static createIceElemental(roundNumber) {
        const stats = this.scaleStats(32, 9, roundNumber);
        const enemy = new Enemy('Ice Elemental', 'minion', stats.hp, stats.attack, 2);
        enemy.behavior = (self) => {
            // Freezing attacks
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createWindElemental(roundNumber) {
        const stats = this.scaleStats(28, 11, roundNumber);
        const enemy = new Enemy('Wind Elemental', 'minion', stats.hp, stats.attack, 0);
        enemy.behavior = (self) => {
            // Swift attacks
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createEarthElemental(roundNumber) {
        const stats = this.scaleStats(45, 8, roundNumber);
        const enemy = new Enemy('Earth Elemental', 'minion', stats.hp, stats.attack, 4);
        enemy.behavior = (self) => {
            // Slow but tanky
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createCorruptedKnight(roundNumber) {
        const stats = this.scaleStats(35, 11, roundNumber);
        const enemy = new Enemy('Corrupted Knight', 'minion', stats.hp, stats.attack, 3);
        enemy.behavior = (self) => {
            // Heavy armor
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    // ELITE ENEMIES (15 total)

    static createStoneGolem(roundNumber) {
        const stats = this.scaleStats(80, 12, roundNumber);
        const enemy = new Enemy('Stone Golem', 'elite', stats.hp, stats.attack, 5);
        enemy.behavior = (self) => {
            // Slow but powerful
            if (self.turnCounter % 3 === 0) {
                return { type: 'attack', value: Math.floor(self.attack * 2), message: 'Boulder Smash!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createDarkMage(roundNumber) {
        const stats = this.scaleStats(60, 18, roundNumber);
        const enemy = new Enemy('Dark Mage', 'elite', stats.hp, stats.attack, 2);
        enemy.behavior = (self) => {
            // Alternates between curse and blast
            if (self.turnCounter % 2 === 0) {
                return { type: 'attack', value: Math.floor(self.attack * 1.3), message: 'Dark Blast!' };
            }
            return { type: 'attack', value: self.attack, message: 'Curse!' };
        };
        return enemy;
    }

    static createBerserker(roundNumber) {
        const stats = this.scaleStats(70, 20, roundNumber);
        const enemy = new Enemy('Berserker', 'elite', stats.hp, stats.attack, 1);
        enemy.behavior = (self) => {
            // Gets stronger as HP lowers
            const hpPercent = self.getHPPercentage();
            const rageBonus = hpPercent < 50 ? Math.floor(self.attack * 0.5) : 0;
            return { type: 'attack', value: self.attack + rageBonus };
        };
        return enemy;
    }

    static createNecromancer(roundNumber) {
        const stats = this.scaleStats(55, 14, roundNumber);
        const enemy = new Enemy('Necromancer', 'elite', stats.hp, stats.attack, 2);
        enemy.behavior = (self) => {
            // Heals every 4 turns
            if (self.turnCounter % 4 === 0) {
                return { type: 'heal', value: 20, message: 'Death Siphon!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createAssassin(roundNumber) {
        const stats = this.scaleStats(50, 25, roundNumber);
        const enemy = new Enemy('Shadow Assassin', 'elite', stats.hp, stats.attack, 0);
        enemy.behavior = (self) => {
            // High damage, low HP
            if (self.turnCounter % 3 === 0) {
                return { type: 'attack', value: Math.floor(self.attack * 1.8), message: 'Backstab!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createWarlock(roundNumber) {
        const stats = this.scaleStats(65, 16, roundNumber);
        const enemy = new Enemy('Warlock', 'elite', stats.hp, stats.attack, 3);
        enemy.behavior = (self) => {
            // Curses and DoT
            if (self.turnCounter % 2 === 0) {
                return { type: 'attack', value: self.attack, poison: 5, message: 'Curse of Pain!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createVampire(roundNumber) {
        const stats = this.scaleStats(60, 17, roundNumber);
        const enemy = new Enemy('Vampire Lord', 'elite', stats.hp, stats.attack, 2);
        enemy.behavior = (self) => {
            // Life steal attacks
            return { type: 'attack', value: self.attack, lifeSteal: 0.5 };
        };
        return enemy;
    }

    static createWerewolf(roundNumber) {
        const stats = this.scaleStats(75, 19, roundNumber);
        const enemy = new Enemy('Werewolf', 'elite', stats.hp, stats.attack, 2);
        enemy.behavior = (self) => {
            // Frenzy attacks
            if (self.turnCounter % 3 === 0) {
                return { type: 'attack', value: Math.floor(self.attack * 1.7), message: 'Feral Frenzy!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createMinotaur(roundNumber) {
        const stats = this.scaleStats(85, 18, roundNumber);
        const enemy = new Enemy('Minotaur', 'elite', stats.hp, stats.attack, 4);
        enemy.chargeCounter = 0;
        enemy.behavior = (self) => {
            self.chargeCounter++;
            if (self.chargeCounter >= 3) {
                self.chargeCounter = 0;
                return { type: 'attack', value: Math.floor(self.attack * 2.5), message: 'CHARGE!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createHydra(roundNumber) {
        const stats = this.scaleStats(70, 15, roundNumber);
        const enemy = new Enemy('Hydra', 'elite', stats.hp, stats.attack, 3);
        enemy.behavior = (self) => {
            // Multi-head attack
            return { type: 'attack', value: Math.floor(self.attack * 1.5), message: 'Multiple heads strike!' };
        };
        return enemy;
    }

    static createPhoenix(roundNumber) {
        const stats = this.scaleStats(55, 20, roundNumber);
        const enemy = new Enemy('Phoenix', 'elite', stats.hp, stats.attack, 1);
        enemy.hasRevived = false;
        enemy.behavior = (self) => {
            // Revives once
            if (self.currentHP <= 0 && !self.hasRevived) {
                self.hasRevived = true;
                self.currentHP = Math.floor(self.maxHP * 0.5);
                return { type: 'revive', message: 'Phoenix rises from ashes!' };
            }
            return { type: 'attack', value: self.attack, burn: 3 };
        };
        return enemy;
    }

    static createFrostGiant(roundNumber) {
        const stats = this.scaleStats(90, 16, roundNumber);
        const enemy = new Enemy('Frost Giant', 'elite', stats.hp, stats.attack, 5);
        enemy.behavior = (self) => {
            // Ice attacks
            if (self.turnCounter % 3 === 0) {
                return { type: 'attack', value: Math.floor(self.attack * 1.8), message: 'Glacial Slam!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createDemonLord(roundNumber) {
        const stats = this.scaleStats(75, 22, roundNumber);
        const enemy = new Enemy('Demon Lord', 'elite', stats.hp, stats.attack, 3);
        enemy.behavior = (self) => {
            // Powerful dark magic
            if (self.turnCounter % 2 === 0) {
                return { type: 'attack', value: Math.floor(self.attack * 1.5), message: 'Hellfire!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createDragonKnight(roundNumber) {
        const stats = this.scaleStats(80, 20, roundNumber);
        const enemy = new Enemy('Dragon Knight', 'elite', stats.hp, stats.attack, 6);
        enemy.behavior = (self) => {
            // Dragon breath every 4 turns
            if (self.turnCounter % 4 === 0) {
                return { type: 'attack', value: Math.floor(self.attack * 2), message: 'Dragon Breath!', burn: 5 };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createLich(roundNumber) {
        const stats = this.scaleStats(65, 18, roundNumber);
        const enemy = new Enemy('Lich', 'elite', stats.hp, stats.attack, 4);
        enemy.behavior = (self) => {
            // Death magic
            if (self.turnCounter % 3 === 0) {
                return { type: 'heal', value: 15, message: 'Life Drain!' };
            }
            return { type: 'attack', value: self.attack, poison: 4 };
        };
        return enemy;
    }

    // BOSS ENEMIES (10 total)

    static createDragon(roundNumber) {
        const stats = this.scaleStats(150, 25, roundNumber);
        const enemy = new Enemy('Ancient Dragon', 'boss', stats.hp, stats.attack, 8);
        enemy.phase = 1;
        enemy.behavior = (self) => {
            // Phase changes
            if (self.getHPPercentage() < 50 && self.phase === 1) {
                self.phase = 2;
                return { type: 'attack', value: Math.floor(self.attack * 3), message: 'MEGA DRAGON BREATH!', burn: 10 };
            }
            if (self.turnCounter % 3 === 0) {
                return { type: 'attack', value: Math.floor(self.attack * 2), message: 'Dragon Breath!', burn: 5 };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createDemonKing(roundNumber) {
        const stats = this.scaleStats(140, 28, roundNumber);
        const enemy = new Enemy('Demon King', 'boss', stats.hp, stats.attack, 6);
        enemy.behavior = (self) => {
            if (self.turnCounter % 4 === 0) {
                return { type: 'attack', value: Math.floor(self.attack * 2.5), message: 'Infernal Judgment!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createAncientLich(roundNumber) {
        const stats = this.scaleStats(120, 22, roundNumber);
        const enemy = new Enemy('Ancient Lich', 'boss', stats.hp, stats.attack, 7);
        enemy.behavior = (self) => {
            if (self.turnCounter % 3 === 0) {
                return { type: 'heal', value: 25, message: 'Soul Harvest!' };
            }
            return { type: 'attack', value: self.attack, poison: 6 };
        };
        return enemy;
    }

    static createTitanGolem(roundNumber) {
        const stats = this.scaleStats(180, 20, roundNumber);
        const enemy = new Enemy('Titan Golem', 'boss', stats.hp, stats.attack, 10);
        enemy.chargeCounter = 0;
        enemy.behavior = (self) => {
            self.chargeCounter++;
            if (self.chargeCounter >= 4) {
                self.chargeCounter = 0;
                return { type: 'attack', value: Math.floor(self.attack * 3.5), message: 'EARTHQUAKE!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createVoidLord(roundNumber) {
        const stats = this.scaleStats(130, 26, roundNumber);
        const enemy = new Enemy('Void Lord', 'boss', stats.hp, stats.attack, 7);
        enemy.behavior = (self) => {
            if (self.turnCounter % 2 === 0) {
                return { type: 'attack', value: Math.floor(self.attack * 1.8), message: 'Void Blast!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createArchmage(roundNumber) {
        const stats = this.scaleStats(110, 30, roundNumber);
        const enemy = new Enemy('Archmage', 'boss', stats.hp, stats.attack, 5);
        enemy.behavior = (self) => {
            const spells = ['Fireball', 'Lightning', 'Ice Storm', 'Arcane Missiles'];
            const spell = spells[self.turnCounter % 4];
            return { type: 'attack', value: Math.floor(self.attack * 1.5), message: `${spell}!` };
        };
        return enemy;
    }

    static createDarkOverlord(roundNumber) {
        const stats = this.scaleStats(145, 27, roundNumber);
        const enemy = new Enemy('Dark Overlord', 'boss', stats.hp, stats.attack, 8);
        enemy.behavior = (self) => {
            if (self.turnCounter % 5 === 0) {
                return { type: 'attack', value: Math.floor(self.attack * 3), message: 'DARK OBLITERATION!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createCelestialBeing(roundNumber) {
        const stats = this.scaleStats(125, 24, roundNumber);
        const enemy = new Enemy('Celestial Being', 'boss', stats.hp, stats.attack, 6);
        enemy.behavior = (self) => {
            if (self.turnCounter % 3 === 0) {
                return { type: 'heal', value: 20, message: 'Divine Regeneration!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createEldritchHorror(roundNumber) {
        const stats = this.scaleStats(135, 29, roundNumber);
        const enemy = new Enemy('Eldritch Horror', 'boss', stats.hp, stats.attack, 7);
        enemy.behavior = (self) => {
            if (self.turnCounter % 4 === 0) {
                return { type: 'attack', value: Math.floor(self.attack * 2.5), message: 'Maddening Gaze!', poison: 8 };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }

    static createPrimordialBeast(roundNumber) {
        const stats = this.scaleStats(160, 23, roundNumber);
        const enemy = new Enemy('Primordial Beast', 'boss', stats.hp, stats.attack, 9);
        enemy.behavior = (self) => {
            if (self.getHPPercentage() < 30) {
                return { type: 'attack', value: Math.floor(self.attack * 2.5), message: 'Primal Rage!' };
            }
            if (self.turnCounter % 3 === 0) {
                return { type: 'attack', value: Math.floor(self.attack * 1.8), message: 'Savage Roar!' };
            }
            return { type: 'attack', value: self.attack };
        };
        return enemy;
    }
}
