/**
 * Merchant.js - Handles merchant encounters and item trading
 */

import { ItemFactory } from './Item.js';

export class Merchant {
    constructor() {
        this.inventory = [];
        this.soldItems = [];
        this.encounterCount = 0;
    }

    generateInventory(player, itemCount = 3) {
        this.encounterCount++;
        this.inventory = ItemFactory.createMerchantInventory(player.gold, itemCount);
        this.soldItems = [];
    }

    purchaseItem(itemIndex, player) {
        if (itemIndex < 0 || itemIndex >= this.inventory.length) {
            return { success: false, message: 'Invalid item.' };
        }

        if (this.soldItems.includes(itemIndex)) {
            return { success: false, message: 'Item already sold.' };
        }

        const item = this.inventory[itemIndex];
        const actualCost = ItemFactory.applyDiscount(item, player);

        if (player.gold < actualCost) {
            return { success: false, message: 'Not enough gold!' };
        }

        // Process purchase
        player.spendGold(actualCost);
        player.addItem(item);
        this.soldItems.push(itemIndex);

        return { 
            success: true, 
            message: `Purchased ${item.name} for ${actualCost} gold!`,
            item: item
        };
    }

    isItemSold(itemIndex) {
        return this.soldItems.includes(itemIndex);
    }

    getAvailableItems() {
        return this.inventory.filter((item, index) => !this.soldItems.includes(index));
    }

    hasAvailableItems() {
        return this.getAvailableItems().length > 0;
    }

    getGreeting() {
        const greetings = [
            "Welcome, brave adventurer! What catches your eye?",
            "Ah, a customer! I have just what you need!",
            "These wares won't last long at these prices!",
            "Looking for something special? You've come to the right place!",
            "My goods are the finest in the land!",
            "Step right up! Everything must go!",
            "Treasures from far and wide, all for you!",
            "Your gold is welcome here, friend!",
            "I've been waiting for someone like you!",
            "Rare items, fair prices!"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    getFarewell() {
        const farewells = [
            "Come back soon!",
            "Safe travels, adventurer!",
            "May fortune smile upon you!",
            "Good luck on your journey!",
            "Until we meet again!",
            "Spend that gold wisely!",
            "May your blade stay sharp!",
            "The road ahead is dangerous - be prepared!",
            "I'll have new stock next time!",
            "Farewell, and may the gods watch over you!"
        ];
        return farewells[Math.floor(Math.random() * farewells.length)];
    }

    getItemPitch(item) {
        const pitches = {
            'common': [
                "A solid choice for any adventurer!",
                "You won't regret this purchase!",
                "Simple, but effective!",
                "A reliable piece of equipment!"
            ],
            'rare': [
                "Ah, you have a good eye!",
                "This is one of my better pieces!",
                "Not many can afford this quality!",
                "A rare find indeed!"
            ],
            'epic': [
                "Now THIS is a legendary piece!",
                "Only for the most discerning customers!",
                "You won't find this anywhere else!",
                "A true masterwork!"
            ],
            'legendary': [
                "By the gods, you've found my best item!",
                "Forged by ancient masters!",
                "This could turn the tide of any battle!",
                "A once-in-a-lifetime opportunity!"
            ]
        };

        const rarityPitches = pitches[item.rarity] || pitches.common;
        return rarityPitches[Math.floor(Math.random() * rarityPitches.length)];
    }

    // Special merchant events
    shouldOfferDeal(player) {
        // 20% chance to offer a special deal
        return Math.random() < 0.2;
    }

    generateSpecialDeal(player) {
        const deals = [
            {
                name: 'Buy One Get One',
                description: 'Purchase one item, get a random common item free!',
                type: 'bogo'
            },
            {
                name: 'Clearance Sale',
                description: 'All items 30% off!',
                type: 'discount',
                amount: 0.3
            },
            {
                name: 'Lucky Draw',
                description: 'Spend 20 gold for a random item!',
                type: 'lucky',
                cost: 20
            },
            {
                name: 'Bulk Discount',
                description: 'Buy 2 items, get 40% off!',
                type: 'bulk'
            }
        ];

        return deals[Math.floor(Math.random() * deals.length)];
    }

    // Merchant dialogue based on player state
    getContextualDialogue(player) {
        if (player.currentHP < player.maxHP * 0.3) {
            return "You look hurt! Perhaps a healing potion?";
        }
        
        if (player.gold > 100) {
            return "My, my! Someone's been successful! Let me show you my premium items!";
        }
        
        if (player.gold < 15) {
            return "A bit short on gold, eh? Come back when you've had more luck!";
        }

        if (this.encounterCount === 1) {
            return "First time seeing you! Let me show you what I've got!";
        }

        return this.getGreeting();
    }

    // Track merchant stats
    getTotalSales() {
        return this.soldItems.length;
    }

    reset() {
        this.inventory = [];
        this.soldItems = [];
        this.encounterCount = 0;
    }
}

/**
 * Special Merchant Types (for future expansion)
 */
export class BlackMarketMerchant extends Merchant {
    constructor() {
        super();
        this.name = "Shady Dealer";
    }

    generateInventory(player, itemCount = 3) {
        // Black market has more rare/epic items but higher prices
        this.encounterCount++;
        this.inventory = [];
        
        for (let i = 0; i < itemCount; i++) {
            const item = ItemFactory.createRandomItem(player.gold + 50);
            // Increase price by 20%
            item.cost = Math.floor(item.cost * 1.2);
            this.inventory.push(item);
        }
        
        this.soldItems = [];
    }

    getGreeting() {
        return "Psst... looking for something special? I've got the goods... for the right price.";
    }
}

export class DiscountMerchant extends Merchant {
    constructor() {
        super();
        this.name = "Generous Merchant";
    }

    generateInventory(player, itemCount = 4) {
        // Discount merchant has more items at lower prices
        this.encounterCount++;
        this.inventory = ItemFactory.createMerchantInventory(player.gold, itemCount);
        
        // Reduce all prices by 20%
        this.inventory.forEach(item => {
            item.cost = Math.floor(item.cost * 0.8);
        });
        
        this.soldItems = [];
    }

    getGreeting() {
        return "Special sale today! Everything at a discount!";
    }
}

export class MysteriousMerchant extends Merchant {
    constructor() {
        super();
        this.name = "Mysterious Merchant";
    }

    generateInventory(player, itemCount = 3) {
        // Mysterious merchant has random quality items
        this.encounterCount++;
        this.inventory = [];
        
        for (let i = 0; i < itemCount; i++) {
            const item = ItemFactory.createRandomItem(player.gold);
            // Randomize price
            const priceVariance = 0.7 + Math.random() * 0.6; // 70% to 130%
            item.cost = Math.floor(item.cost * priceVariance);
            this.inventory.push(item);
        }
        
        this.soldItems = [];
    }

    getGreeting() {
        return "Fate has brought you to me... Let's see what destiny has in store.";
    }
}

/**
 * MerchantFactory - Creates different types of merchants
 */
export class MerchantFactory {
    static createMerchant(encounterNumber, player) {
        // Special merchant types appear less frequently
        if (encounterNumber % 9 === 0 && encounterNumber > 0) {
            return new BlackMarketMerchant();
        }
        
        if (encounterNumber % 6 === 0 && encounterNumber > 0) {
            return new DiscountMerchant();
        }
        
        if (encounterNumber % 12 === 0 && encounterNumber > 0) {
            return new MysteriousMerchant();
        }

        return new Merchant();
    }

    static getMerchantAppearanceRounds() {
        // Merchant appears every 3 rounds
        return 3;
    }
}
