/**
 * Item.js - Handles items, upgrades, and their effects on the player
 */

export class Item {
    constructor(name, description, cost, rarity = 'common') {
        this.name = name;
        this.description = description;
        this.cost = cost;
        this.rarity = rarity; // 'common', 'rare', 'epic', 'legendary'
        this.isPermanent = false; // Lasts for the entire run
    }

    apply(player) {
        // Override this method in subclasses
    }

    getRarityColor() {
        const colors = {
            'common': 'text-gray-300',
            'rare': 'text-blue-400',
            'epic': 'text-purple-400',
            'legendary': 'text-yellow-400'
        };
        return colors[this.rarity] || colors.common;
    }
}

/**
 * Stat Boost Items
 */
export class SharpenedEdge extends Item {
    constructor() {
        super(
            'Sharpened Edge',
            '+3 to all attack rolls',
            15,
            'common'
        );
        this.isPermanent = true;
        this.attackBonus = 3;
    }

    apply(player) {
        player.attackBonus += this.attackBonus;
    }
}

export class BlessedBarrier extends Item {
    constructor() {
        super(
            'Blessed Barrier',
            '+2 defense per round',
            15,
            'common'
        );
        this.isPermanent = true;
        this.defenseBonus = 2;
    }

    apply(player) {
        player.defenseBonus += this.defenseBonus;
    }
}

export class IronPlate extends Item {
    constructor() {
        super(
            'Iron Plate',
            '+5 defense per round',
            25,
            'rare'
        );
        this.isPermanent = true;
        this.defenseBonus = 5;
    }

    apply(player) {
        player.defenseBonus += this.defenseBonus;
    }
}

export class PowerGauntlets extends Item {
    constructor() {
        super(
            'Power Gauntlets',
            '+5 to all attack rolls',
            25,
            'rare'
        );
        this.isPermanent = true;
        this.attackBonus = 5;
    }

    apply(player) {
        player.attackBonus += this.attackBonus;
    }
}

export class VampiricBlade extends Item {
    constructor() {
        super(
            'Vampiric Blade',
            'Heal 2 HP for each attack made',
            30,
            'epic'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.addEffect({
            name: 'Vampiric',
            healing: 2,
            permanent: true
        });
    }
}

export class BerserkersRage extends Item {
    constructor() {
        super(
            'Berserker\'s Rage',
            '+8 attack, -3 defense',
            20,
            'rare'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.attackBonus += 8;
        player.defenseBonus -= 3;
    }
}

export class TurtleShell extends Item {
    constructor() {
        super(
            'Turtle Shell',
            '+10 defense, -2 attack',
            20,
            'rare'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.defenseBonus += 10;
        player.attackBonus -= 2;
    }
}

/**
 * Health Items
 */
export class HealthPotion extends Item {
    constructor() {
        super(
            'Health Potion',
            'Restore 30 HP immediately',
            12,
            'common'
        );
    }

    apply(player) {
        player.heal(30);
    }
}

export class GreaterHealthPotion extends Item {
    constructor() {
        super(
            'Greater Health Potion',
            'Restore 50 HP immediately',
            20,
            'rare'
        );
    }

    apply(player) {
        player.heal(50);
    }
}

export class MaxHealthUpgrade extends Item {
    constructor() {
        super(
            'Vitality Boost',
            '+20 max HP',
            25,
            'rare'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.maxHP += 20;
        player.currentHP += 20;
    }
}

export class PhoenixFeather extends Item {
    constructor() {
        super(
            'Phoenix Feather',
            'Revive with 50% HP when killed (one time)',
            50,
            'legendary'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.addEffect({
            name: 'Phoenix Feather',
            revive: true,
            reviveHP: 0.5,
            permanent: true
        });
    }
}

/**
 * Dice Manipulation Items
 */
export class RerollToken extends Item {
    constructor() {
        super(
            'Reroll Token',
            '+1 free reroll per round',
            18,
            'common'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.rerollsPerRound += 1;
    }
}

export class LuckyDie extends Item {
    constructor() {
        super(
            'Lucky Die',
            '+2 to all dice rolls this round',
            20,
            'rare'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.addEffect({
            name: 'Lucky',
            diceBonus: 2,
            permanent: true
        });
    }
}

export class DiceFaceUpgrade extends Item {
    constructor() {
        super(
            'Dice Upgrade Kit',
            'Upgrade a random die face to higher value',
            30,
            'epic'
        );
    }

    apply(player) {
        // This will be handled in GameManager when purchased
        // Randomly select a die and upgrade one of its faces
    }
}

export class LoadedDice extends Item {
    constructor() {
        super(
            'Loaded Dice',
            'First roll of each round is guaranteed maximum',
            40,
            'epic'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.addEffect({
            name: 'Loaded Dice',
            firstRollMax: true,
            permanent: true
        });
    }
}

/**
 * Critical Strike Items
 */
export class CriticalEdge extends Item {
    constructor() {
        super(
            'Critical Edge',
            '+10% critical strike chance',
            22,
            'rare'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.critChance += 10;
    }
}

export class SavageBlow extends Item {
    constructor() {
        super(
            'Savage Blow',
            'Critical strikes deal 250% damage instead of 200%',
            30,
            'epic'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.critMultiplier = 2.5;
    }
}

export class GuaranteedCrit extends Item {
    constructor() {
        super(
            'Assassin\'s Mark',
            'Next attack is a guaranteed critical strike',
            25,
            'rare'
        );
    }

    apply(player) {
        player.addEffect({
            name: 'Guaranteed Crit',
            guaranteedCrit: true,
            duration: 1
        });
    }
}

/**
 * Special Ability Items
 */
export class MagicAmplifier extends Item {
    constructor() {
        super(
            'Magic Amplifier',
            'Magic symbols provide +5 damage',
            20,
            'rare'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.addEffect({
            name: 'Magic Amplifier',
            magicBonus: 5,
            permanent: true
        });
    }
}

export class SymbolCollector extends Item {
    constructor() {
        super(
            'Symbol Collector',
            'Special symbols are 20% more likely',
            28,
            'epic'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.addEffect({
            name: 'Symbol Collector',
            symbolChance: 0.2,
            permanent: true
        });
    }
}

export class DoubleSymbol extends Item {
    constructor() {
        super(
            'Twin Rune',
            'Special symbols count as 2 symbols',
            35,
            'epic'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.addEffect({
            name: 'Twin Rune',
            doubleSymbols: true,
            permanent: true
        });
    }
}

/**
 * Defensive Items
 */
export class ThornArmor extends Item {
    constructor() {
        super(
            'Thorn Armor',
            'Reflect 30% of damage taken back to enemy',
            25,
            'rare'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.addEffect({
            name: 'Thorns',
            reflectDamage: 0.3,
            permanent: true
        });
    }
}

export class ShieldOfFaith extends Item {
    constructor() {
        super(
            'Shield of Faith',
            'Block 5 damage from all attacks',
            30,
            'epic'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.addEffect({
            name: 'Shield of Faith',
            blockDamage: 5,
            permanent: true
        });
    }
}

export class Evasion extends Item {
    constructor() {
        super(
            'Evasion Cloak',
            '20% chance to dodge attacks completely',
            35,
            'epic'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.addEffect({
            name: 'Evasion',
            dodgeChance: 0.2,
            permanent: true
        });
    }
}

/**
 * Utility Items
 */
export class GoldMagnet extends Item {
    constructor() {
        super(
            'Gold Magnet',
            '+50% gold from enemies',
            20,
            'rare'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.addEffect({
            name: 'Gold Magnet',
            goldMultiplier: 1.5,
            permanent: true
        });
    }
}

export class ExtraGold extends Item {
    constructor() {
        super(
            'Treasure Chest',
            'Gain 50 gold immediately',
            10,
            'common'
        );
    }

    apply(player) {
        player.addGold(50);
    }
}

export class MerchantDiscount extends Item {
    constructor() {
        super(
            'Merchant\'s Favor',
            'All items cost 20% less for this run',
            25,
            'rare'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.addEffect({
            name: 'Discount',
            priceMultiplier: 0.8,
            permanent: true
        });
    }
}

/**
 * Combo Items
 */
export class BalancedBlade extends Item {
    constructor() {
        super(
            'Balanced Blade',
            '+3 attack, +3 defense',
            25,
            'rare'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.attackBonus += 3;
        player.defenseBonus += 3;
    }
}

export class ChaosCrystal extends Item {
    constructor() {
        super(
            'Chaos Crystal',
            'Random strong effect each combat',
            30,
            'epic'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.addEffect({
            name: 'Chaos Crystal',
            randomEffect: true,
            permanent: true
        });
    }
}

export class BloodPact extends Item {
    constructor() {
        super(
            'Blood Pact',
            'Lose 5 max HP, gain +10 attack',
            20,
            'rare'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.maxHP -= 5;
        player.currentHP = Math.min(player.currentHP, player.maxHP);
        player.attackBonus += 10;
    }
}

export class RegenerationRing extends Item {
    constructor() {
        super(
            'Regeneration Ring',
            'Heal 3 HP at the start of each round',
            28,
            'epic'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.addEffect({
            name: 'Regeneration',
            healPerTurn: 3,
            permanent: true
        });
    }
}

export class FocusedMind extends Item {
    constructor() {
        super(
            'Focused Mind',
            'Special abilities are 30% more powerful',
            32,
            'epic'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.addEffect({
            name: 'Focus',
            abilityBonus: 0.3,
            permanent: true
        });
    }
}

export class TimeWarpAmulet extends Item {
    constructor() {
        super(
            'Time Warp Amulet',
            'Take 2 actions this round (once per run)',
            60,
            'legendary'
        );
    }

    apply(player) {
        player.addEffect({
            name: 'Time Warp',
            extraTurn: true,
            duration: 1
        });
    }
}

export class DragonScale extends Item {
    constructor() {
        super(
            'Dragon Scale',
            '+8 defense, immune to burn damage',
            35,
            'epic'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.defenseBonus += 8;
        player.addEffect({
            name: 'Dragon Scale',
            burnImmune: true,
            permanent: true
        });
    }
}

export class PoisonVial extends Item {
    constructor() {
        super(
            'Poison Vial',
            'All attacks apply 3 poison damage',
            30,
            'epic'
        );
        this.isPermanent = true;
    }

    apply(player) {
        player.addEffect({
            name: 'Poison Vial',
            poisonDamage: 3,
            permanent: true
        });
    }
}

/**
 * ItemFactory - Creates and manages item pool
 */
export class ItemFactory {
    static getAllItems() {
        return [
            SharpenedEdge,
            BlessedBarrier,
            IronPlate,
            PowerGauntlets,
            VampiricBlade,
            BerserkersRage,
            TurtleShell,
            HealthPotion,
            GreaterHealthPotion,
            MaxHealthUpgrade,
            PhoenixFeather,
            RerollToken,
            LuckyDie,
            DiceFaceUpgrade,
            LoadedDice,
            CriticalEdge,
            SavageBlow,
            GuaranteedCrit,
            MagicAmplifier,
            SymbolCollector,
            DoubleSymbol,
            ThornArmor,
            ShieldOfFaith,
            Evasion,
            GoldMagnet,
            ExtraGold,
            MerchantDiscount,
            BalancedBlade,
            ChaosCrystal,
            BloodPact,
            RegenerationRing,
            FocusedMind,
            TimeWarpAmulet,
            DragonScale,
            PoisonVial
        ];
    }

    static getItemsByRarity(rarity) {
        const allItems = this.getAllItems();
        return allItems.filter(ItemClass => {
            const item = new ItemClass();
            return item.rarity === rarity;
        });
    }

    static createRandomItem(playerGold = 0) {
        // Weight rarities based on player's gold
        let rarityPool = [];
        
        // Common items always available
        rarityPool.push(...Array(50).fill('common'));
        
        // Rare items if player has some gold
        if (playerGold >= 20) {
            rarityPool.push(...Array(30).fill('rare'));
        }
        
        // Epic items if player has good gold
        if (playerGold >= 30) {
            rarityPool.push(...Array(15).fill('epic'));
        }
        
        // Legendary items if player has lots of gold
        if (playerGold >= 50) {
            rarityPool.push(...Array(5).fill('legendary'));
        }

        const selectedRarity = rarityPool[Math.floor(Math.random() * rarityPool.length)];
        const itemsOfRarity = this.getItemsByRarity(selectedRarity);
        
        if (itemsOfRarity.length === 0) {
            // Fallback to common
            const commonItems = this.getItemsByRarity('common');
            const ItemClass = commonItems[Math.floor(Math.random() * commonItems.length)];
            return new ItemClass();
        }

        const ItemClass = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
        return new ItemClass();
    }

    static createMerchantInventory(playerGold, count = 3) {
        const items = [];
        const allItemClasses = this.getAllItems();
        
        // Ensure variety - no duplicates
        const availableItems = [...allItemClasses];
        
        for (let i = 0; i < count && availableItems.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableItems.length);
            const ItemClass = availableItems[randomIndex];
            items.push(new ItemClass());
            availableItems.splice(randomIndex, 1);
        }

        return items;
    }

    static applyDiscount(item, player) {
        let cost = item.cost;
        const discountEffect = player.effects.find(e => e.name === 'Discount');
        if (discountEffect && discountEffect.priceMultiplier) {
            cost = Math.floor(cost * discountEffect.priceMultiplier);
        }
        return cost;
    }
}
