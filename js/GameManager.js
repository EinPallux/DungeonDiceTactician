/**
 * GameManager.js - Core game logic and state management
 */

import { PlayerFactory } from './Player.js';
import { EnemyFactory } from './Enemy.js';
import { MerchantFactory } from './Merchant.js';
import { DiceFactory } from './Dice.js';

export class GameManager {
    constructor() {
        this.player = null;
        this.enemy = null;
        this.merchant = null;
        
        this.currentRound = 0;
        this.gameState = 'menu'; // 'menu', 'combat', 'merchant', 'gameOver'
        this.merchantEncounterCount = 0;
        
        // Combat state
        this.rolledDice = [];
        this.assignedDice = {
            attack: null,
            defense: null,
            special: []
        };
        this.hasRolled = false;
        
        // Statistics
        this.stats = {
            enemiesDefeated: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            goldEarned: 0,
            itemsPurchased: 0,
            highestRound: 0
        };

        // Best runs tracking (stored in localStorage)
        this.loadBestRuns();
    }

    // Game Initialization
    startNewRun(className) {
        this.player = PlayerFactory.createPlayer(className);
        this.currentRound = 1;
        this.gameState = 'combat';
        this.merchantEncounterCount = 0;
        this.hasRolled = false;
        
        // Reset stats
        this.stats = {
            enemiesDefeated: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            goldEarned: 0,
            itemsPurchased: 0,
            highestRound: 0,
            className: className
        };

        // Create first enemy
        this.spawnEnemy();
        
        return {
            success: true,
            message: `${className} embarks on a new adventure!`
        };
    }

    // Enemy Management
    spawnEnemy() {
        this.enemy = EnemyFactory.createEnemy(this.currentRound);
        this.hasRolled = false;
        this.resetDiceAssignments();
    }

    // Dice Rolling
    rollDice() {
        if (!this.player || this.gameState !== 'combat') {
            return { success: false, message: 'Cannot roll dice now.' };
        }

        this.rolledDice = [];
        this.resetDiceAssignments();

        const diceSet = this.player.diceSet;
        const results = diceSet.rollAll();
        this.rolledDice = diceSet.getDice();
        this.hasRolled = true;

        return {
            success: true,
            dice: this.rolledDice
        };
    }

    rerollDice() {
        if (!this.player.canReroll()) {
            return { success: false, message: 'No rerolls remaining!' };
        }

        this.player.useReroll();
        return this.rollDice();
    }

    // Dice Assignment
    assignDie(dieId, slot) {
        const die = this.rolledDice.find(d => d.id === dieId);
        if (!die || !die.isRolled) {
            return { success: false, message: 'Invalid die.' };
        }

        // Remove die from previous slot if assigned
        this.removeDieFromAllSlots(dieId);

        // Assign to new slot
        if (slot === 'attack') {
            this.assignedDice.attack = die;
        } else if (slot === 'defense') {
            this.assignedDice.defense = die;
        } else if (slot === 'special') {
            this.assignedDice.special.push(die);
        }

        return { success: true };
    }

    removeDieFromAllSlots(dieId) {
        if (this.assignedDice.attack && this.assignedDice.attack.id === dieId) {
            this.assignedDice.attack = null;
        }
        if (this.assignedDice.defense && this.assignedDice.defense.id === dieId) {
            this.assignedDice.defense = null;
        }
        this.assignedDice.special = this.assignedDice.special.filter(d => d.id !== dieId);
    }

    unassignDie(dieId, slot) {
        if (slot === 'attack' && this.assignedDice.attack && this.assignedDice.attack.id === dieId) {
            this.assignedDice.attack = null;
            return { success: true };
        }
        if (slot === 'defense' && this.assignedDice.defense && this.assignedDice.defense.id === dieId) {
            this.assignedDice.defense = null;
            return { success: true };
        }
        if (slot === 'special') {
            const index = this.assignedDice.special.findIndex(d => d.id === dieId);
            if (index !== -1) {
                this.assignedDice.special.splice(index, 1);
                return { success: true };
            }
        }
        return { success: false };
    }

    resetDiceAssignments() {
        this.assignedDice = {
            attack: null,
            defense: null,
            special: []
        };
    }

    canExecuteTurn() {
        return this.hasRolled && (this.assignedDice.attack || this.assignedDice.defense || this.assignedDice.special.length > 0);
    }

    // Combat Execution
    executeTurn() {
        if (!this.canExecuteTurn()) {
            return { success: false, message: 'Assign at least one die before executing turn.' };
        }

        const combatLog = [];

        // Calculate player action values
        let attackValue = 0;
        let defenseValue = 0;

        if (this.assignedDice.attack) {
            const die = this.assignedDice.attack;
            if (die.getFaceType() === 'attack') {
                attackValue = die.getFaceValue();
            }
        }

        if (this.assignedDice.defense) {
            const die = this.assignedDice.defense;
            if (die.getFaceType() === 'defense') {
                defenseValue = die.getFaceValue();
            }
        }

        // Apply bonuses
        attackValue += this.player.getTotalAttackBonus();
        defenseValue += this.player.getTotalDefenseBonus();

        // Create combat context for abilities
        const combatContext = {
            attackValue,
            defenseValue,
            specialDice: this.assignedDice.special,
            round: this.currentRound
        };

        // Apply passive ability
        const passiveResult = this.player.applyPassiveAbility(combatContext);
        if (passiveResult.message) {
            combatLog.push({ type: 'player', message: passiveResult.message });
        }
        if (passiveResult.bonusDamage) {
            attackValue += passiveResult.bonusDamage;
        }
        if (passiveResult.bonusDefense) {
            defenseValue += passiveResult.bonusDefense;
        }

        // Try to activate special ability
        let specialActivated = false;
        if (this.assignedDice.special.length > 0) {
            const specialResult = this.player.activateSpecial(combatContext);
            if (specialResult.success) {
                specialActivated = true;
                combatLog.push({ type: 'special', message: specialResult.message });
                
                if (specialResult.bonusDamage) {
                    attackValue += specialResult.bonusDamage;
                }
                if (specialResult.damage) {
                    attackValue = specialResult.damage;
                }
                if (specialResult.bonusDefense) {
                    defenseValue += specialResult.bonusDefense;
                }
                if (specialResult.isCrit) {
                    attackValue = Math.floor(attackValue * this.player.critMultiplier);
                }
                if (specialResult.applyEffect) {
                    this.enemy.addEffect(specialResult.applyEffect);
                }
                if (specialResult.skipEnemyTurn) {
                    // Time Weaver ability - enemy skips turn
                    combatLog.push({ type: 'info', message: 'Enemy is frozen in time!' });
                }
            }
        }

        // Check for critical strike
        const critRoll = Math.random() * 100;
        if (critRoll < this.player.critChance && attackValue > 0) {
            attackValue = Math.floor(attackValue * this.player.critMultiplier);
            combatLog.push({ type: 'special', message: '💥 CRITICAL HIT!' });
        }

        // Player attacks enemy
        if (attackValue > 0) {
            const damageDealt = this.enemy.takeDamage(attackValue);
            combatLog.push({ type: 'player', message: `You deal ${damageDealt} damage!` });
            this.stats.totalDamageDealt += damageDealt;

            // Check for thorn damage
            const thornEffect = this.player.effects.find(e => e.name === 'Thorns');
            if (thornEffect && thornEffect.reflectDamage) {
                const reflected = Math.floor(damageDealt * thornEffect.reflectDamage);
                combatLog.push({ type: 'player', message: `Thorns reflect ${reflected} damage!` });
            }
        } else {
            combatLog.push({ type: 'info', message: 'You defend.' });
        }

        // Check if enemy is defeated
        if (!this.enemy.isAlive()) {
            return this.handleEnemyDefeat(combatLog);
        }

        // Update enemy effects
        this.enemy.updateEffects();

        // Enemy attacks (unless skipped by special ability)
        const skipEnemyTurn = this.assignedDice.special.length > 0 && 
                              this.player.className === 'Time Weaver' && 
                              specialActivated;

        if (!skipEnemyTurn) {
            const enemyAction = this.enemy.executeAction();
            
            if (enemyAction.type === 'attack') {
                let enemyDamage = enemyAction.value;
                
                // Apply player defense
                let mitigatedDamage = Math.max(0, enemyDamage - defenseValue);
                
                // Apply shield block
                const shieldEffect = this.player.effects.find(e => e.name === 'Shield of Faith');
                if (shieldEffect && shieldEffect.blockDamage) {
                    mitigatedDamage = Math.max(0, mitigatedDamage - shieldEffect.blockDamage);
                }

                // Check evasion
                const evasionEffect = this.player.effects.find(e => e.name === 'Evasion');
                if (evasionEffect && evasionEffect.dodgeChance) {
                    if (Math.random() < evasionEffect.dodgeChance) {
                        combatLog.push({ type: 'player', message: 'You dodged the attack!' });
                        mitigatedDamage = 0;
                    }
                }

                if (mitigatedDamage > 0) {
                    // Apply divine shield
                    if (this.player.specialCounters.divineShield > 0) {
                        const absorbed = Math.min(mitigatedDamage, this.player.specialCounters.divineShield);
                        this.player.specialCounters.divineShield -= absorbed;
                        mitigatedDamage -= absorbed;
                        combatLog.push({ type: 'player', message: `Divine Shield absorbs ${absorbed} damage!` });
                    }

                    const actualDamage = this.player.takeDamage(mitigatedDamage);
                    this.stats.totalDamageTaken += actualDamage;
                    
                    const actionMessage = enemyAction.message || `${this.enemy.name} attacks`;
                    combatLog.push({ type: 'enemy', message: `${actionMessage} for ${actualDamage} damage!` });
                } else {
                    combatLog.push({ type: 'player', message: 'You blocked all damage!' });
                }

                // Apply enemy effects (poison, burn, etc.)
                if (enemyAction.poison) {
                    this.player.addEffect({ name: 'Poison', damage: enemyAction.poison, duration: 3 });
                    combatLog.push({ type: 'enemy', message: `You are poisoned! (${enemyAction.poison} damage/turn)` });
                }
                if (enemyAction.burn) {
                    this.player.addEffect({ name: 'Burn', damage: enemyAction.burn, duration: 3 });
                    combatLog.push({ type: 'enemy', message: `You are burning! (${enemyAction.burn} damage/turn)` });
                }

                // Enemy life steal
                if (enemyAction.lifeSteal) {
                    const healAmount = Math.floor(enemyAction.value * enemyAction.lifeSteal);
                    this.enemy.heal(healAmount);
                    combatLog.push({ type: 'enemy', message: `${this.enemy.name} heals ${healAmount} HP!` });
                }
            } else if (enemyAction.type === 'heal') {
                const healAmount = this.enemy.heal(enemyAction.value);
                const actionMessage = enemyAction.message || `${this.enemy.name} heals`;
                combatLog.push({ type: 'enemy', message: `${actionMessage} for ${healAmount} HP!` });
            } else if (enemyAction.type === 'defend') {
                const actionMessage = enemyAction.message || `${this.enemy.name} defends`;
                combatLog.push({ type: 'enemy', message: actionMessage });
            }
        }

        // Update player effects (DoT, healing, etc.)
        this.player.updateEffects();
        
        // Apply regeneration
        const regenEffect = this.player.effects.find(e => e.name === 'Regeneration' && e.healPerTurn);
        if (regenEffect) {
            const healAmount = this.player.heal(regenEffect.healPerTurn);
            if (healAmount > 0) {
                combatLog.push({ type: 'player', message: `Regeneration heals ${healAmount} HP!` });
            }
        }

        // Check if player is defeated
        if (!this.player.isAlive()) {
            return this.handlePlayerDefeat(combatLog);
        }

        // Reset for next turn
        this.hasRolled = false;
        this.resetDiceAssignments();
        this.player.resetRerolls();

        return {
            success: true,
            combatLog,
            playerHP: this.player.currentHP,
            enemyHP: this.enemy.currentHP
        };
    }

    handleEnemyDefeat(combatLog) {
        this.stats.enemiesDefeated++;
        
        // Award gold
        let goldReward = this.enemy.goldReward;
        const goldMagnet = this.player.effects.find(e => e.name === 'Gold Magnet');
        if (goldMagnet && goldMagnet.goldMultiplier) {
            goldReward = Math.floor(goldReward * goldMagnet.goldMultiplier);
        }
        
        this.player.addGold(goldReward);
        this.stats.goldEarned += goldReward;
        
        combatLog.push({ type: 'special', message: `${this.enemy.name} defeated! +${goldReward} gold` });

        // Progress to next round
        this.currentRound++;
        this.stats.highestRound = Math.max(this.stats.highestRound, this.currentRound);

        // Check for merchant encounter
        if (this.currentRound % 3 === 0) {
            this.gameState = 'merchant';
            this.merchantEncounterCount++;
            this.merchant = MerchantFactory.createMerchant(this.merchantEncounterCount, this.player);
            this.merchant.generateInventory(this.player);
            
            combatLog.push({ type: 'info', message: '🧙 A traveling merchant appears!' });
        } else {
            this.spawnEnemy();
        }

        this.hasRolled = false;
        this.resetDiceAssignments();
        this.player.resetRerolls();

        return {
            success: true,
            enemyDefeated: true,
            combatLog,
            nextState: this.gameState
        };
    }

    handlePlayerDefeat(combatLog) {
        this.gameState = 'gameOver';
        
        // Save best run
        this.saveBestRun();
        
        combatLog.push({ type: 'enemy', message: 'You have been defeated...' });

        return {
            success: true,
            playerDefeated: true,
            combatLog,
            stats: this.stats
        };
    }

    // Merchant Management
    purchaseItem(itemIndex) {
        if (!this.merchant || this.gameState !== 'merchant') {
            return { success: false, message: 'No merchant available.' };
        }

        const result = this.merchant.purchaseItem(itemIndex, this.player);
        if (result.success) {
            this.stats.itemsPurchased++;
        }
        
        return result;
    }

    leaveMerchant() {
        if (this.gameState !== 'merchant') {
            return { success: false };
        }

        this.gameState = 'combat';
        this.spawnEnemy();
        
        return { success: true };
    }

    // Statistics and Save System
    saveBestRun() {
        const bestRuns = this.loadBestRuns();
        
        const runData = {
            className: this.stats.className,
            round: this.currentRound - 1,
            enemiesDefeated: this.stats.enemiesDefeated,
            damageDealt: this.stats.totalDamageDealt,
            gold: this.stats.goldEarned,
            date: new Date().toLocaleDateString()
        };

        bestRuns.push(runData);
        
        // Sort by round (highest first) and keep top 10
        bestRuns.sort((a, b) => b.round - a.round);
        const top10 = bestRuns.slice(0, 10);
        
        localStorage.setItem('dungeonDiceTactician_bestRuns', JSON.stringify(top10));
    }

    loadBestRuns() {
        const saved = localStorage.getItem('dungeonDiceTactician_bestRuns');
        return saved ? JSON.parse(saved) : [];
    }

    getBestRuns() {
        return this.loadBestRuns();
    }

    // Game State Queries
    getGameState() {
        return {
            state: this.gameState,
            round: this.currentRound,
            player: this.player ? {
                className: this.player.className,
                currentHP: this.player.currentHP,
                maxHP: this.player.maxHP,
                gold: this.player.gold,
                attackBonus: this.player.getTotalAttackBonus(),
                defenseBonus: this.player.getTotalDefenseBonus(),
                effects: this.player.effects,
                rerollsRemaining: this.player.rerollsPerRound - this.player.rerollsUsed,
                specialCounters: this.player.specialCounters
            } : null,
            enemy: this.enemy ? {
                name: this.enemy.name,
                type: this.enemy.type,
                currentHP: this.enemy.currentHP,
                maxHP: this.enemy.maxHP,
                attack: this.enemy.getTotalAttack(),
                defense: this.enemy.getTotalDefense(),
                effects: this.enemy.effects,
                nextAction: this.enemy.getNextAction()
            } : null,
            dice: {
                rolled: this.rolledDice,
                assigned: this.assignedDice,
                hasRolled: this.hasRolled
            },
            merchant: this.merchant ? {
                inventory: this.merchant.inventory,
                soldItems: this.merchant.soldItems,
                greeting: this.merchant.getContextualDialogue(this.player)
            } : null
        };
    }

    resetGame() {
        this.player = null;
        this.enemy = null;
        this.merchant = null;
        this.currentRound = 0;
        this.gameState = 'menu';
        this.merchantEncounterCount = 0;
        this.hasRolled = false;
        this.resetDiceAssignments();
    }

    // Utility Methods
    getAssignedDiceCount() {
        let count = 0;
        if (this.assignedDice.attack) count++;
        if (this.assignedDice.defense) count++;
        count += this.assignedDice.special.length;
        return count;
    }

    getUnassignedDice() {
        const assignedIds = [];
        if (this.assignedDice.attack) assignedIds.push(this.assignedDice.attack.id);
        if (this.assignedDice.defense) assignedIds.push(this.assignedDice.defense.id);
        this.assignedDice.special.forEach(d => assignedIds.push(d.id));
        
        return this.rolledDice.filter(d => !assignedIds.includes(d.id));
    }

    calculateTotalAttackValue() {
        let total = 0;
        if (this.assignedDice.attack && this.assignedDice.attack.getFaceType() === 'attack') {
            total = this.assignedDice.attack.getFaceValue();
        }
        total += this.player ? this.player.getTotalAttackBonus() : 0;
        return total;
    }

    calculateTotalDefenseValue() {
        let total = 0;
        if (this.assignedDice.defense && this.assignedDice.defense.getFaceType() === 'defense') {
            total = this.assignedDice.defense.getFaceValue();
        }
        total += this.player ? this.player.getTotalDefenseBonus() : 0;
        return total;
    }
}
