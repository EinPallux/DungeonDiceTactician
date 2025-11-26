/**
 * Player.js - Handles player character, stats, and class-specific abilities
 */

import { DiceFactory } from './Dice.js';

export class Player {
    constructor(className, diceSet) {
        this.className = className;
        this.diceSet = diceSet;
        
        // Base stats
        this.maxHP = 100;
        this.currentHP = 100;
        this.gold = 0;
        
        // Combat stats
        this.attackBonus = 0;
        this.defenseBonus = 0;
        this.critChance = 0;
        this.critMultiplier = 2.0;
        
        // Class-specific stats
        this.momentum = 0;
        this.unspentSymbols = 0;
        this.consecutiveAttacks = 0;
        
        // Active effects
        this.effects = [];
        
        // Items and upgrades
        this.items = [];
        this.permanentUpgrades = [];
        
        // Rerolls
        this.rerollsPerRound = 0;
        this.rerollsUsed = 0;
        
        // Class-specific counters
        this.specialCounters = {};
        this.initializeClassCounters();
    }

    initializeClassCounters() {
        const counters = {
            'Blade Dancer': { momentum: 0 },
            'Geomancer': { earthCount: 0, stoneCount: 0, crystalCount: 0 },
            'Shadow Priest': { darknessStacks: 0, voidPower: 0 },
            'Pyromantic': { flameStacks: 0, burnDamage: 0 },
            'Frost Weaver': { frostStacks: 0, chillDuration: 0 },
            'Storm Caller': { lightningCharge: 0, windStacks: 0 },
            'Nature Shaman': { growthStacks: 0, healingPower: 0 },
            'Blood Knight': { bloodStacks: 0, lifeSteal: 0 },
            'Holy Paladin': { holyPower: 0, divineShield: 0 },
            'Chaos Mage': { chaosStacks: 0, wildMagic: 0 },
            'Time Weaver': { timeStacks: 0, hasteEffect: 0 },
            'Spirit Summoner': { spiritCount: 0, summonPower: 0 }
        };
        
        this.specialCounters = counters[this.className] || {};
    }

    takeDamage(amount) {
        const actualDamage = Math.max(0, amount);
        this.currentHP = Math.max(0, this.currentHP - actualDamage);
        return actualDamage;
    }

    heal(amount) {
        const actualHeal = Math.min(amount, this.maxHP - this.currentHP);
        this.currentHP = Math.min(this.maxHP, this.currentHP + actualHeal);
        return actualHeal;
    }

    addGold(amount) {
        this.gold += amount;
    }

    spendGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
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
        this.effects = this.effects.filter(effect => {
            if (effect.duration !== undefined) {
                effect.duration--;
                return effect.duration > 0;
            }
            return true;
        });
    }

    addItem(item) {
        this.items.push(item);
        item.apply(this);
    }

    resetRerolls() {
        this.rerollsUsed = 0;
    }

    canReroll() {
        return this.rerollsUsed < this.rerollsPerRound;
    }

    useReroll() {
        if (this.canReroll()) {
            this.rerollsUsed++;
            return true;
        }
        return false;
    }

    isAlive() {
        return this.currentHP > 0;
    }

    // Class-specific passive abilities
    applyPassiveAbility(combatContext) {
        const passives = {
            'Blade Dancer': this.bladeDancerPassive.bind(this),
            'Geomancer': this.geomancerPassive.bind(this),
            'Shadow Priest': this.shadowPriestPassive.bind(this),
            'Pyromantic': this.pyromanticPassive.bind(this),
            'Frost Weaver': this.frostWeaverPassive.bind(this),
            'Storm Caller': this.stormCallerPassive.bind(this),
            'Nature Shaman': this.natureShamanPassive.bind(this),
            'Blood Knight': this.bloodKnightPassive.bind(this),
            'Holy Paladin': this.holyPaladinPassive.bind(this),
            'Chaos Mage': this.chaosMagePassive.bind(this),
            'Time Weaver': this.timeWeaverPassive.bind(this),
            'Spirit Summoner': this.spiritSummonerPassive.bind(this)
        };

        const passive = passives[this.className];
        if (passive) {
            return passive(combatContext);
        }
        return {};
    }

    // Class-specific special abilities
    activateSpecial(combatContext) {
        const specials = {
            'Blade Dancer': this.bladeDancerSpecial.bind(this),
            'Geomancer': this.geomancerSpecial.bind(this),
            'Shadow Priest': this.shadowPriestSpecial.bind(this),
            'Pyromantic': this.pyromanticSpecial.bind(this),
            'Frost Weaver': this.frostWeaverSpecial.bind(this),
            'Storm Caller': this.stormCallerSpecial.bind(this),
            'Nature Shaman': this.natureShamanSpecial.bind(this),
            'Blood Knight': this.bloodKnightSpecial.bind(this),
            'Holy Paladin': this.holyPaladinSpecial.bind(this),
            'Chaos Mage': this.chaosMageSpecial.bind(this),
            'Time Weaver': this.timeWeaverSpecial.bind(this),
            'Spirit Summoner': this.spiritSummonerSpecial.bind(this)
        };

        const special = specials[this.className];
        if (special) {
            return special(combatContext);
        }
        return {};
    }

    // BLADE DANCER - High attack, momentum-based
    bladeDancerPassive(context) {
        if (context.attackValue > 0) {
            this.specialCounters.momentum++;
            const bonusDamage = this.specialCounters.momentum;
            return { 
                bonusDamage, 
                message: `Momentum +${bonusDamage} damage!` 
            };
        } else {
            this.specialCounters.momentum = 0;
        }
        return {};
    }

    bladeDancerSpecial(context) {
        const critCount = context.specialDice.filter(d => d.getFaceType() === 'crit').length;
        if (critCount >= 2) {
            const damage = Math.floor(context.attackValue * 3);
            return {
                damage,
                message: '⚔️ Cyclone Slash! 300% damage!',
                success: true
            };
        }
        return { success: false };
    }

    // GEOMANCER - Earth, stone, crystal symbols
    geomancerPassive(context) {
        const symbols = context.specialDice.map(d => d.getFaceSymbol());
        const hasEarth = symbols.includes('earth');
        const hasStone = symbols.includes('stone');
        const hasCrystal = symbols.includes('crystal');

        if (hasEarth && hasStone && hasCrystal) {
            return {
                bonusDamage: 10,
                bonusDefense: 10,
                message: '🌍 Earthshatter! +10 attack and defense!'
            };
        }
        return {};
    }

    geomancerSpecial(context) {
        const stoneCount = context.specialDice.filter(d => d.getFaceSymbol() === 'stone').length;
        if (stoneCount >= 1) {
            this.addEffect({ name: 'Stoneform', defense: 25, duration: 1 });
            return {
                message: '🗿 Stoneform! +25 defense next round!',
                success: true
            };
        }
        return { success: false };
    }

    // SHADOW PRIEST - Darkness symbols, power accumulation
    shadowPriestPassive(context) {
        const unspentDarkness = context.specialDice.filter(d => 
            d.getFaceSymbol() === 'darkness' || 
            d.getFaceSymbol() === 'void' ||
            d.getFaceSymbol() === 'shadow'
        ).length;

        if (unspentDarkness > 0) {
            this.specialCounters.darknessStacks += unspentDarkness * 2;
            return {
                message: `🌑 Deepening Void: +${unspentDarkness * 2} power stored (Total: ${this.specialCounters.darknessStacks})`
            };
        }
        return {};
    }

    shadowPriestSpecial(context) {
        if (this.specialCounters.darknessStacks >= 5) {
            this.takeDamage(5);
            const bonusDamage = 20 + this.specialCounters.darknessStacks;
            this.specialCounters.darknessStacks = 0;
            return {
                bonusDamage,
                message: `👥 Sacrifice! Lost 5 HP, +${bonusDamage} damage!`,
                success: true
            };
        }
        return { success: false };
    }

    // PYROMANTIC - Flame symbols, burning damage
    pyromanticPassive(context) {
        const flameCount = context.specialDice.filter(d => d.getFaceSymbol() === 'flame').length;
        if (flameCount > 0) {
            this.specialCounters.flameStacks += flameCount;
            return {
                bonusDamage: flameCount * 2,
                message: `🔥 Burning Fury: +${flameCount * 2} fire damage!`
            };
        }
        return {};
    }

    pyromanticSpecial(context) {
        const flameCount = context.specialDice.filter(d => d.getFaceSymbol() === 'flame').length;
        if (flameCount >= 3) {
            const damage = 40;
            this.specialCounters.burnDamage = 10;
            return {
                bonusDamage: damage,
                message: '🔥 INFERNO! 40 instant damage + 10 burn damage for 3 rounds!',
                success: true,
                applyEffect: { name: 'Burn', damage: 10, duration: 3 }
            };
        }
        return { success: false };
    }

    // FROST WEAVER - Frost symbols, slowing and defense
    frostWeaverPassive(context) {
        const frostCount = context.specialDice.filter(d => d.getFaceSymbol() === 'frost').length;
        if (frostCount > 0) {
            this.specialCounters.frostStacks += frostCount;
            return {
                bonusDefense: frostCount * 3,
                message: `❄️ Frost Armor: +${frostCount * 3} defense!`
            };
        }
        return {};
    }

    frostWeaverSpecial(context) {
        const frostCount = context.specialDice.filter(d => d.getFaceSymbol() === 'frost').length;
        if (frostCount >= 2) {
            return {
                message: '❄️ Frozen Prison! Enemy attack reduced by 50% for 2 rounds!',
                success: true,
                applyEffect: { name: 'Frozen', attackReduction: 0.5, duration: 2 }
            };
        }
        return { success: false };
    }

    // STORM CALLER - Lightning and wind, critical strikes
    stormCallerPassive(context) {
        const lightningCount = context.specialDice.filter(d => d.getFaceSymbol() === 'lightning').length;
        if (lightningCount > 0) {
            this.specialCounters.lightningCharge += lightningCount;
            this.critChance += lightningCount * 10;
            return {
                message: `⚡ Lightning Charge: +${lightningCount * 10}% crit chance!`
            };
        }
        return {};
    }

    stormCallerSpecial(context) {
        const lightningCount = context.specialDice.filter(d => d.getFaceSymbol() === 'lightning').length;
        if (lightningCount >= 2) {
            const damage = 35;
            return {
                bonusDamage: damage,
                isCrit: true,
                message: '⚡ THUNDERSTRIKE! 35 guaranteed critical damage!',
                success: true
            };
        }
        return { success: false };
    }

    // NATURE SHAMAN - Nature symbols, healing and growth
    natureShamanPassive(context) {
        const natureCount = context.specialDice.filter(d => d.getFaceSymbol() === 'nature').length;
        if (natureCount > 0) {
            const healAmount = natureCount * 3;
            this.heal(healAmount);
            return {
                message: `🌿 Nature's Blessing: Healed ${healAmount} HP!`
            };
        }
        return {};
    }

    natureShamanSpecial(context) {
        const natureCount = context.specialDice.filter(d => d.getFaceSymbol() === 'nature').length;
        if (natureCount >= 3) {
            const healAmount = 25;
            this.heal(healAmount);
            this.addEffect({ name: 'Regeneration', healing: 5, duration: 3 });
            return {
                message: `🌿 Wild Growth! Healed ${healAmount} HP + 5 HP regen for 3 rounds!`,
                success: true
            };
        }
        return { success: false };
    }

    // BLOOD KNIGHT - Blood symbols, life steal and sacrifice
    bloodKnightPassive(context) {
        const bloodCount = context.specialDice.filter(d => d.getFaceSymbol() === 'blood').length;
        if (bloodCount > 0 && context.attackValue > 0) {
            const lifeSteal = Math.floor(context.attackValue * 0.3 * bloodCount);
            this.heal(lifeSteal);
            return {
                message: `🩸 Blood Pact: Healed ${lifeSteal} HP from life steal!`
            };
        }
        return {};
    }

    bloodKnightSpecial(context) {
        const bloodCount = context.specialDice.filter(d => d.getFaceSymbol() === 'blood').length;
        if (bloodCount >= 2) {
            const sacrifice = 15;
            const bonusDamage = 50;
            this.takeDamage(sacrifice);
            return {
                bonusDamage,
                message: `🩸 Blood Sacrifice! Lost ${sacrifice} HP for ${bonusDamage} extra damage!`,
                success: true
            };
        }
        return { success: false };
    }

    // HOLY PALADIN - Holy symbols, protection and healing
    holyPaladinPassive(context) {
        const holyCount = context.specialDice.filter(d => d.getFaceSymbol() === 'holy').length;
        if (holyCount > 0) {
            this.specialCounters.holyPower += holyCount;
            return {
                bonusDefense: holyCount * 4,
                message: `✝️ Divine Protection: +${holyCount * 4} defense!`
            };
        }
        return {};
    }

    holyPaladinSpecial(context) {
        const holyCount = context.specialDice.filter(d => d.getFaceSymbol() === 'holy').length;
        if (holyCount >= 2 && this.specialCounters.holyPower >= 5) {
            const healAmount = 20;
            this.heal(healAmount);
            this.specialCounters.divineShield = 30;
            this.specialCounters.holyPower = 0;
            return {
                message: `✝️ Divine Shield! Healed ${healAmount} HP + absorb 30 damage!`,
                success: true
            };
        }
        return { success: false };
    }

    // CHAOS MAGE - Chaos symbols, random powerful effects
    chaosMagePassive(context) {
        const chaosCount = context.specialDice.filter(d => d.getFaceSymbol() === 'chaos').length;
        if (chaosCount > 0) {
            const randomEffects = [
                { bonusDamage: 15, message: '🌀 Chaos Surge: +15 damage!' },
                { bonusDefense: 15, message: '🌀 Chaos Ward: +15 defense!' },
                { bonusDamage: 25, selfDamage: 5, message: '🌀 Wild Magic: +25 damage, -5 HP!' },
                { bonusDefense: 20, bonusDamage: 10, message: '🌀 Chaos Balance: +10 damage, +20 defense!' }
            ];
            const effect = randomEffects[Math.floor(Math.random() * randomEffects.length)];
            if (effect.selfDamage) this.takeDamage(effect.selfDamage);
            return effect;
        }
        return {};
    }

    chaosMageSpecial(context) {
        const chaosCount = context.specialDice.filter(d => d.getFaceSymbol() === 'chaos').length;
        if (chaosCount >= 2) {
            const randomValue = Math.floor(Math.random() * 60) + 20; // 20-80 damage
            return {
                bonusDamage: randomValue,
                message: `🌀 CHAOS BOLT! ${randomValue} random damage!`,
                success: true
            };
        }
        return { success: false };
    }

    // TIME WEAVER - Time symbols, manipulation of turn order
    timeWeaverPassive(context) {
        const timeCount = context.specialDice.filter(d => d.getFaceSymbol() === 'time').length;
        if (timeCount > 0) {
            this.specialCounters.timeStacks += timeCount;
            return {
                message: `⏰ Time Dilation: Stored ${timeCount} time stacks (Total: ${this.specialCounters.timeStacks})`
            };
        }
        return {};
    }

    timeWeaverSpecial(context) {
        const timeCount = context.specialDice.filter(d => d.getFaceSymbol() === 'time').length;
        if (timeCount >= 3 && this.specialCounters.timeStacks >= 6) {
            this.specialCounters.timeStacks = 0;
            this.addEffect({ name: 'Haste', bonusAttack: 10, bonusDefense: 10, duration: 2 });
            return {
                message: '⏰ TIME WARP! +10 attack and defense for 2 rounds + enemy skip next turn!',
                success: true,
                skipEnemyTurn: true
            };
        }
        return { success: false };
    }

    // SPIRIT SUMMONER - Spirit symbols, summoning allies
    spiritSummonerPassive(context) {
        const spiritCount = context.specialDice.filter(d => d.getFaceSymbol() === 'spirit').length;
        if (spiritCount > 0) {
            this.specialCounters.spiritCount += spiritCount;
            return {
                bonusDamage: this.specialCounters.spiritCount * 2,
                message: `👻 Spirit Power: +${this.specialCounters.spiritCount * 2} damage from ${this.specialCounters.spiritCount} spirits!`
            };
        }
        return {};
    }

    spiritSummonerSpecial(context) {
        const spiritCount = context.specialDice.filter(d => d.getFaceSymbol() === 'spirit').length;
        if (spiritCount >= 3) {
            const damage = 30;
            this.addEffect({ name: 'Spirit Guardian', defense: 15, attack: 8, duration: 2 });
            return {
                bonusDamage: damage,
                message: '👻 SPIRIT GUARDIAN! 30 damage + summon guardian (+8 attack, +15 defense for 2 rounds)!',
                success: true
            };
        }
        return { success: false };
    }

    getHPPercentage() {
        return (this.currentHP / this.maxHP) * 100;
    }

    // Get all active stat modifiers
    getTotalAttackBonus() {
        let total = this.attackBonus;
        this.effects.forEach(effect => {
            if (effect.attack) total += effect.attack;
            if (effect.bonusAttack) total += effect.bonusAttack;
        });
        return total;
    }

    getTotalDefenseBonus() {
        let total = this.defenseBonus;
        this.effects.forEach(effect => {
            if (effect.defense) total += effect.defense;
            if (effect.bonusDefense) total += effect.bonusDefense;
        });
        // Add divine shield if active
        if (this.specialCounters.divineShield > 0) {
            total += this.specialCounters.divineShield;
        }
        return total;
    }
}

/**
 * PlayerFactory - Creates players with specific classes
 */
export class PlayerFactory {
    static createPlayer(className) {
        const diceSet = DiceFactory.createDiceForClass(className);
        return new Player(className, diceSet);
    }

    static getClassInfo() {
        return [
            {
                name: 'Blade Dancer',
                description: 'Swift melee combatant focused on consecutive attacks',
                passive: 'Momentum: +1 damage for each consecutive attack',
                special: 'Cyclone Slash: 2+ Crit symbols → 300% attack damage'
            },
            {
                name: 'Geomancer',
                description: 'Earth magic wielder with defensive prowess',
                passive: 'Earthshatter: All 3 symbols (Earth/Stone/Crystal) → +10 attack & defense',
                special: 'Stoneform: 1+ Stone symbols → +25 defense next round'
            },
            {
                name: 'Shadow Priest',
                description: 'Dark magic user who accumulates power over time',
                passive: 'Deepening Void: Unspent darkness symbols → +2 power each (stored)',
                special: 'Sacrifice: Lose 5 HP → +20+ damage (consumes stored power)'
            },
            {
                name: 'Pyromantic',
                description: 'Fire mage dealing devastating burning damage',
                passive: 'Burning Fury: Each flame symbol → +2 fire damage',
                special: 'Inferno: 3+ Flame symbols → 40 damage + 10 burn over 3 rounds'
            },
            {
                name: 'Frost Weaver',
                description: 'Ice mage with strong defensive capabilities',
                passive: 'Frost Armor: Each frost symbol → +3 defense',
                special: 'Frozen Prison: 2+ Frost symbols → Enemy attack reduced 50% for 2 rounds'
            },
            {
                name: 'Storm Caller',
                description: 'Lightning wielder with high critical strike chance',
                passive: 'Lightning Charge: Each lightning symbol → +10% crit chance',
                special: 'Thunderstrike: 2+ Lightning symbols → 35 guaranteed critical damage'
            },
            {
                name: 'Nature Shaman',
                description: 'Healer drawing power from nature',
                passive: 'Nature\'s Blessing: Each nature symbol → Heal 3 HP',
                special: 'Wild Growth: 3+ Nature symbols → Heal 25 HP + 5 HP regen for 3 rounds'
            },
            {
                name: 'Blood Knight',
                description: 'Warrior who sacrifices life for power',
                passive: 'Blood Pact: Life steal 30% of attack damage per blood symbol',
                special: 'Blood Sacrifice: 2+ Blood symbols → Lose 15 HP, +50 damage'
            },
            {
                name: 'Holy Paladin',
                description: 'Divine warrior with protection and healing',
                passive: 'Divine Protection: Each holy symbol → +4 defense & store holy power',
                special: 'Divine Shield: 2+ Holy symbols + 5 power → Heal 20 HP + absorb 30 damage'
            },
            {
                name: 'Chaos Mage',
                description: 'Unpredictable mage with wild random effects',
                passive: 'Chaos Surge: Random powerful effect per chaos symbol',
                special: 'Chaos Bolt: 2+ Chaos symbols → 20-80 random damage'
            },
            {
                name: 'Time Weaver',
                description: 'Manipulator of time and space',
                passive: 'Time Dilation: Store time stacks from time symbols',
                special: 'Time Warp: 3+ Time symbols + 6 stacks → +10 atk/def for 2 rounds + enemy skip turn'
            },
            {
                name: 'Spirit Summoner',
                description: 'Summoner who channels spirit allies',
                passive: 'Spirit Power: Accumulate spirits, +2 damage per spirit',
                special: 'Spirit Guardian: 3+ Spirit symbols → 30 damage + summon guardian (+8 atk, +15 def for 2 rounds)'
            }
        ];
    }
}
