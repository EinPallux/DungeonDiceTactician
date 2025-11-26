# Dungeon Dice Tactician

A roguelike RPG browser game where you use custom dice to battle enemies, purchase upgrades, and survive as long as possible!

## 🎮 How to Play

### Starting the Game
1. Open `index.html` in your web browser
2. Choose from 12 unique character classes
3. Each class has unique dice, passive abilities, and special powers

### Combat System
1. **Roll Dice** - Click to roll your character's custom dice
2. **Assign Dice** - Drag and drop dice to three slots:
   - ⚔️ **Attack Slot** - Deals damage to the enemy
   - 🛡️ **Defense Slot** - Reduces incoming damage
   - ✨ **Special Slot** - Activates class-specific abilities
3. **Execute Turn** - Apply your actions and watch the battle unfold!

### Game Loop
- Fight enemies that get stronger each round
- Earn gold from defeated enemies
- Every 3 rounds, a **Traveling Merchant** appears
- Purchase powerful items and upgrades
- Survive as long as you can!

## 🎭 Character Classes (12 Total)

### 1. **Blade Dancer**
- High attack focus with momentum mechanics
- Passive: Gain +1 damage for each consecutive attack
- Special: Cyclone Slash (2+ Crits → 300% damage)

### 2. **Geomancer**
- Earth magic with defensive prowess
- Passive: All 3 symbols (Earth/Stone/Crystal) → +10 attack & defense
- Special: Stoneform (+25 defense next round)

### 3. **Shadow Priest**
- Dark magic that accumulates power over time
- Passive: Unspent darkness symbols → +2 stored power each
- Special: Sacrifice (Lose 5 HP → +20+ damage)

### 4. **Pyromantic**
- Fire mage dealing devastating burning damage
- Passive: Each flame symbol → +2 fire damage
- Special: Inferno (40 instant + burn damage over time)

### 5. **Frost Weaver**
- Ice mage with strong defensive capabilities
- Passive: Each frost symbol → +3 defense
- Special: Frozen Prison (Reduce enemy attack by 50%)

### 6. **Storm Caller**
- Lightning wielder with high critical strikes
- Passive: Each lightning → +10% crit chance
- Special: Thunderstrike (35 guaranteed critical)

### 7. **Nature Shaman**
- Healer drawing power from nature
- Passive: Each nature symbol → Heal 3 HP
- Special: Wild Growth (Heal 25 HP + regeneration)

### 8. **Blood Knight**
- Warrior who sacrifices life for power
- Passive: Life steal 30% of attack per blood symbol
- Special: Blood Sacrifice (Lose 15 HP → +50 damage)

### 9. **Holy Paladin**
- Divine warrior with protection and healing
- Passive: Each holy symbol → +4 defense
- Special: Divine Shield (Heal + absorb damage)

### 10. **Chaos Mage**
- Unpredictable mage with wild random effects
- Passive: Random powerful effect per chaos symbol
- Special: Chaos Bolt (20-80 random damage)

### 11. **Time Weaver**
- Manipulator of time and space
- Passive: Store time stacks
- Special: Time Warp (Stat boost + enemy skip turn)

### 12. **Spirit Summoner**
- Summoner who channels spirit allies
- Passive: Accumulate spirits for +2 damage each
- Special: Spirit Guardian (Summon powerful ally)

## 👾 Enemy Types (50+ Unique Enemies)

### Minions (25 types)
- Goblin, Skeleton, Zombie, Wolf, Spider, Slime
- Elemental types: Fire, Ice, Wind, Earth
- And many more...

### Elite Enemies (15 types)
- Stone Golem, Dark Mage, Berserker, Necromancer
- Vampire Lord, Werewolf, Minotaur, Hydra
- And more challenging foes...

### Boss Enemies (10 types)
- Ancient Dragon, Demon King, Ancient Lich
- Titan Golem, Void Lord, Eldritch Horror
- Appear every 10 rounds!

## 🛒 Merchant Items (35+ Items)

### Stat Boosts
- Sharpened Edge, Power Gauntlets, Iron Plate
- Berserker's Rage, Balanced Blade

### Health & Defense
- Health Potions, Vitality Boost, Phoenix Feather
- Shield of Faith, Thorn Armor, Evasion Cloak

### Dice Manipulation
- Reroll Tokens, Lucky Die, Loaded Dice
- Dice Face Upgrades

### Special Effects
- Vampiric Blade, Magic Amplifier, Poison Vial
- Dragon Scale, Regeneration Ring

### Utility
- Gold Magnet, Merchant's Favor, Treasure Chest

## 🎨 Features

### Core Features
✅ 12 unique character classes with distinct playstyles
✅ 50+ different enemies with unique behaviors
✅ 35+ items and upgrades
✅ Roguelike progression system
✅ Beautiful modern UI with animations
✅ Drag-and-drop dice mechanics
✅ Detailed combat log
✅ Best runs leaderboard (saved locally)

### Advanced Mechanics
✅ Class-specific passive and special abilities
✅ Status effects (Burn, Poison, Freeze, etc.)
✅ Critical strikes and combos
✅ Merchant appears every 3 rounds
✅ Scaling difficulty
✅ Boss encounters every 10 rounds
✅ Multiple merchant types (Normal, Discount, Black Market)

### UI/UX
✅ Responsive design (mobile-friendly)
✅ Smooth animations and transitions
✅ Intuitive drag-and-drop interface
✅ Visual feedback for all actions
✅ HP bars with color coding
✅ Effect badges showing active buffs/debuffs
✅ Combat log with color-coded messages

## 🚀 Technical Details

- **Pure Vanilla JavaScript** (ES6 modules)
- **TailwindCSS** for styling
- **Modular Architecture** with separate classes
- **No external dependencies** (runs on GitHub Pages)
- **LocalStorage** for saving best runs
- **Deterministic combat system**

## 📁 File Structure

```
dungeon-dice-tactician/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── main.js (Entry point & UI controller)
    ├── GameManager.js (Core game logic)
    ├── Player.js (Player & class system)
    ├── Enemy.js (Enemy generation & AI)
    ├── Dice.js (Dice mechanics)
    ├── Item.js (Item definitions)
    └── Merchant.js (Merchant system)
```

## 🎯 Tips for Players

1. **Learn Your Class** - Each class has unique mechanics. Experiment!
2. **Manage Resources** - Don't spend all your gold at once
3. **Balance Attack & Defense** - Pure offense can be risky
4. **Watch Enemy Patterns** - Some enemies telegraph their moves
5. **Use Special Abilities** - They can turn the tide of battle
6. **Plan Ahead** - Think about next round, not just this one
7. **Boss Rounds** - Save gold for healing before rounds 10, 20, 30...

## 🏆 Goals

- Survive as many rounds as possible
- Defeat all enemy types
- Try all character classes
- Find the perfect item combination
- Get to round 50+

## 🔧 Customization

The game is built with modularity in mind. You can easily:
- Add new character classes (see `Player.js`)
- Create new enemies (see `Enemy.js`)
- Add new items (see `Item.js`)
- Modify dice faces (see `Dice.js`)
- Adjust difficulty scaling (see `GameManager.js`)

## 📝 License

This game is free to play and modify for personal use.

---

**Enjoy your adventure, brave tactician! May your dice roll true! 🎲**
