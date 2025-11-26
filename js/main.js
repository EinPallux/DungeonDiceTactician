/**
 * main.js - Entry point and UI controller
 */

import { GameManager } from './GameManager.js';
import { PlayerFactory } from './Player.js';
import { ItemFactory } from './Item.js';

// Global game instance
let game = null;
let draggedDie = null;

// Initialize game on page load
document.addEventListener('DOMContentLoaded', () => {
    game = new GameManager();
    initializeUI();
    showLandingPage();
});

// UI Initialization
function initializeUI() {
    setupClassSelection();
    setupGameControls();
    setupMerchantControls();
    setupEndRunControls();
    setupPauseControls();
    setupDragAndDrop();
}

// Landing Page
function showLandingPage() {
    document.getElementById('landing-page').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    
    // Display class cards
    displayClassCards();
    displayBestRuns();
}

function displayClassCards() {
    const classContainer = document.getElementById('class-selection');
    classContainer.innerHTML = '';
    
    const classes = PlayerFactory.getClassInfo();
    
    classes.forEach(classInfo => {
        const card = createClassCard(classInfo);
        classContainer.appendChild(card);
    });
}

function createClassCard(classInfo) {
    const card = document.createElement('div');
    card.className = 'class-card';
    card.innerHTML = `
        <h3>${classInfo.name}</h3>
        <p class="text-sm text-gray-300 mb-3">${classInfo.description}</p>
        <div class="passive">
            <strong>Passive:</strong> ${classInfo.passive}
        </div>
        <div class="special">
            <strong>Special:</strong> ${classInfo.special}
        </div>
        <button class="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition transform hover:scale-105 choose-class-btn">
            Choose ${classInfo.name}
        </button>
    `;
    
    const button = card.querySelector('.choose-class-btn');
    button.addEventListener('click', () => startGame(classInfo.name));
    
    return card;
}

function displayBestRuns() {
    const bestRunsContainer = document.getElementById('best-runs');
    const bestRuns = game.getBestRuns().slice(0, 3);
    
    if (bestRuns.length === 0) {
        bestRunsContainer.innerHTML = '<p class="text-gray-400 text-center col-span-3">No runs yet. Start your first adventure!</p>';
        return;
    }
    
    bestRunsContainer.innerHTML = '';
    bestRuns.forEach((run, index) => {
        const card = document.createElement('div');
        card.className = 'best-run-card';
        card.innerHTML = `
            <h4 class="text-lg font-bold mb-2">#${index + 1} Best Run</h4>
            <p class="text-sm"><strong>Class:</strong> ${run.className}</p>
            <p class="text-sm"><strong>Round:</strong> ${run.round}</p>
            <p class="text-sm"><strong>Enemies:</strong> ${run.enemiesDefeated}</p>
            <p class="text-sm"><strong>Damage:</strong> ${run.damageDealt}</p>
            <p class="text-sm text-gray-400">${run.date}</p>
        `;
        bestRunsContainer.appendChild(card);
    });
}

// Game Start
function startGame(className) {
    const result = game.startNewRun(className);
    if (result.success) {
        showGameScreen();
        updateGameUI();
        addToCombatLog(result.message, 'info');
    }
}

function showGameScreen() {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
}

// Setup Controls
function setupClassSelection() {
    // Handled in displayClassCards
}

function setupGameControls() {
    document.getElementById('roll-dice-btn').addEventListener('click', handleRollDice);
    document.getElementById('execute-turn-btn').addEventListener('click', handleExecuteTurn);
    document.getElementById('pause-btn').addEventListener('click', showPauseModal);
    document.getElementById('surrender-btn').addEventListener('click', handleSurrender);
}

function setupMerchantControls() {
    document.getElementById('close-merchant-btn').addEventListener('click', closeMerchant);
}

function setupEndRunControls() {
    document.getElementById('restart-btn').addEventListener('click', handleRestart);
    document.getElementById('main-menu-btn').addEventListener('click', handleMainMenu);
}

function setupPauseControls() {
    document.getElementById('resume-btn').addEventListener('click', hidePauseModal);
    document.getElementById('pause-main-menu-btn').addEventListener('click', handlePauseMainMenu);
}

// Game Actions
function handleRollDice() {
    const result = game.rollDice();
    if (result.success) {
        displayDice(result.dice);
        updateGameUI();
        addToCombatLog('Dice rolled!', 'info');
        
        // Add rolling animation
        document.querySelectorAll('.die').forEach(die => {
            die.classList.add('rolling');
            setTimeout(() => die.classList.remove('rolling'), 500);
        });
    }
}

function handleExecuteTurn() {
    if (!game.canExecuteTurn()) {
        addToCombatLog('Assign at least one die before executing turn!', 'info');
        return;
    }
    
    const result = game.executeTurn();
    if (result.success) {
        // Display combat log
        result.combatLog.forEach(log => {
            addToCombatLog(log.message, log.type);
        });
        
        updateGameUI();
        
        // Check for state changes
        if (result.enemyDefeated) {
            if (result.nextState === 'merchant') {
                setTimeout(() => showMerchantModal(), 1000);
            }
        }
        
        if (result.playerDefeated) {
            setTimeout(() => showEndRunModal(), 1000);
        }
    }
}

function handleSurrender() {
    if (confirm('Are you sure you want to surrender? Your run will end.')) {
        game.handlePlayerDefeat([]);
        showEndRunModal();
    }
}

function handleRestart() {
    const className = game.player.className;
    game.resetGame();
    document.getElementById('end-run-modal').classList.add('hidden');
    startGame(className);
}

function handleMainMenu() {
    game.resetGame();
    document.getElementById('end-run-modal').classList.add('hidden');
    showLandingPage();
}

function handlePauseMainMenu() {
    game.resetGame();
    hidePauseModal();
    showLandingPage();
}

// Dice Display and Interaction
function displayDice(dice) {
    const container = document.getElementById('dice-container');
    container.innerHTML = '';
    
    dice.forEach(die => {
        const dieElement = createDieElement(die);
        container.appendChild(dieElement);
    });
}

function createDieElement(die) {
    const element = document.createElement('div');
    element.className = `die ${die.currentFace.getCSSClass()}`;
    element.setAttribute('data-die-id', die.id);
    element.setAttribute('draggable', 'true');
    element.textContent = die.currentFace.toString();
    element.title = `${die.currentFace.type}: ${die.currentFace.value || die.currentFace.symbol || ''}`;
    
    // Add drag events
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragend', handleDragEnd);
    
    return element;
}

// Drag and Drop
function setupDragAndDrop() {
    const dropzones = document.querySelectorAll('.dropzone');
    
    dropzones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('click', handleDropzoneClick);
    });
}

function handleDragStart(e) {
    draggedDie = e.target.getAttribute('data-die-id');
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (!draggedDie) return;
    
    const slot = e.currentTarget.id.replace('-slot', '');
    const result = game.assignDie(draggedDie, slot);
    
    if (result.success) {
        updateDiceAssignments();
        updateGameUI();
    }
    
    draggedDie = null;
}

function handleDropzoneClick(e) {
    const dropzone = e.currentTarget;
    const slot = dropzone.id.replace('-slot', '');
    
    // If clicking on a die in the slot, unassign it
    if (e.target.classList.contains('die')) {
        const dieId = e.target.getAttribute('data-die-id');
        game.unassignDie(dieId, slot);
        updateDiceAssignments();
        updateGameUI();
    }
}

function updateDiceAssignments() {
    // Clear all slots
    document.getElementById('attack-slot').innerHTML = '<p class="text-gray-500 text-sm">Drop dice here</p>';
    document.getElementById('defense-slot').innerHTML = '<p class="text-gray-500 text-sm">Drop dice here</p>';
    document.getElementById('special-slot').innerHTML = '<p class="text-gray-500 text-sm">Drop dice here</p>';
    
    // Update attack slot
    if (game.assignedDice.attack) {
        const attackSlot = document.getElementById('attack-slot');
        attackSlot.innerHTML = '';
        attackSlot.appendChild(createDieElement(game.assignedDice.attack));
    }
    
    // Update defense slot
    if (game.assignedDice.defense) {
        const defenseSlot = document.getElementById('defense-slot');
        defenseSlot.innerHTML = '';
        defenseSlot.appendChild(createDieElement(game.assignedDice.defense));
    }
    
    // Update special slot
    if (game.assignedDice.special.length > 0) {
        const specialSlot = document.getElementById('special-slot');
        specialSlot.innerHTML = '';
        game.assignedDice.special.forEach(die => {
            specialSlot.appendChild(createDieElement(die));
        });
    }
    
    // Update totals
    document.getElementById('attack-total').textContent = game.calculateTotalAttackValue();
    document.getElementById('defense-total').textContent = game.calculateTotalDefenseValue();
    
    // Update special status
    const specialCount = game.assignedDice.special.length;
    document.getElementById('special-status').textContent = specialCount > 0 ? `${specialCount} symbol(s)` : 'Not Ready';
}

// UI Updates
function updateGameUI() {
    const state = game.getGameState();
    
    if (state.player) {
        updatePlayerUI(state.player);
    }
    
    if (state.enemy) {
        updateEnemyUI(state.enemy);
    }
    
    updateRoundDisplay();
    updateExecuteButton();
    
    if (state.dice.hasRolled) {
        updateDiceAssignments();
    }
}

function updatePlayerUI(player) {
    document.getElementById('player-class-name').textContent = player.className;
    document.getElementById('player-hp-text').textContent = `${player.currentHP}/${player.maxHP}`;
    document.getElementById('gold-amount').textContent = player.gold;
    
    // Update HP bar
    const hpPercent = (player.currentHP / player.maxHP) * 100;
    const hpBar = document.getElementById('player-hp-bar');
    hpBar.style.width = `${hpPercent}%`;
    
    // Color coding for HP
    if (hpPercent > 60) {
        hpBar.className = 'bg-gradient-to-r from-green-500 to-green-400 h-4 transition-all duration-500';
    } else if (hpPercent > 30) {
        hpBar.className = 'bg-gradient-to-r from-yellow-500 to-yellow-400 h-4 transition-all duration-500';
    } else {
        hpBar.className = 'bg-gradient-to-r from-red-500 to-red-400 h-4 transition-all duration-500';
    }
    
    // Update stats
    document.getElementById('player-attack-bonus').textContent = `+${player.attackBonus}`;
    document.getElementById('player-defense-bonus').textContent = `+${player.defenseBonus}`;
    document.getElementById('player-momentum').textContent = player.specialCounters.momentum || 0;
    document.getElementById('rerolls-remaining').textContent = player.rerollsRemaining;
    
    // Update effects
    updatePlayerEffects(player.effects);
}

function updateEnemyUI(enemy) {
    document.getElementById('enemy-name').textContent = enemy.name;
    document.getElementById('enemy-type').textContent = enemy.type.toUpperCase();
    document.getElementById('enemy-hp-text').textContent = `${enemy.currentHP}/${enemy.maxHP}`;
    
    // Update HP bar
    const hpPercent = (enemy.currentHP / enemy.maxHP) * 100;
    document.getElementById('enemy-hp-bar').style.width = `${hpPercent}%`;
    
    // Update next action
    const nextAction = enemy.nextAction;
    let actionText = 'Unknown';
    if (nextAction.type === 'attack') {
        actionText = `Attack (${nextAction.value})`;
        if (nextAction.message) actionText = nextAction.message;
    } else if (nextAction.type === 'heal') {
        actionText = `Heal (${nextAction.value})`;
    } else if (nextAction.type === 'defend') {
        actionText = 'Defend';
    }
    document.getElementById('enemy-next-action').textContent = actionText;
    
    // Update effects
    updateEnemyEffects(enemy.effects);
}

function updatePlayerEffects(effects) {
    const container = document.getElementById('player-effects');
    container.innerHTML = '';
    
    if (effects.length === 0) {
        container.innerHTML = '<span class="text-gray-500 text-xs">None</span>';
        return;
    }
    
    effects.forEach(effect => {
        const badge = document.createElement('span');
        badge.className = 'effect-badge';
        
        let text = effect.name;
        if (effect.duration !== undefined) {
            text += ` (${effect.duration})`;
        }
        badge.textContent = text;
        
        container.appendChild(badge);
    });
}

function updateEnemyEffects(effects) {
    const container = document.getElementById('enemy-effects');
    container.innerHTML = '';
    
    if (effects.length === 0) {
        return;
    }
    
    effects.forEach(effect => {
        const badge = document.createElement('span');
        badge.className = 'effect-badge negative';
        
        let text = effect.name;
        if (effect.duration !== undefined) {
            text += ` (${effect.duration})`;
        }
        badge.textContent = text;
        
        container.appendChild(badge);
    });
}

function updateRoundDisplay() {
    document.getElementById('round-number').textContent = game.currentRound;
}

function updateExecuteButton() {
    const button = document.getElementById('execute-turn-btn');
    button.disabled = !game.canExecuteTurn();
}

// Combat Log
function addToCombatLog(message, type = 'info') {
    const log = document.getElementById('combat-log');
    const entry = document.createElement('p');
    entry.className = `log-${type}`;
    entry.textContent = message;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
    
    // Keep log manageable
    if (log.children.length > 50) {
        log.removeChild(log.firstChild);
    }
}

function clearCombatLog() {
    document.getElementById('combat-log').innerHTML = '<p class="text-gray-400">Combat begins...</p>';
}

// Merchant Modal
function showMerchantModal() {
    const modal = document.getElementById('merchant-modal');
    const state = game.getGameState();
    
    if (!state.merchant) return;
    
    // Update gold display
    document.getElementById('merchant-gold').textContent = state.player.gold;
    
    // Display items
    displayMerchantItems(state.merchant.inventory, state.merchant.soldItems);
    
    modal.classList.remove('hidden');
    addToCombatLog(state.merchant.greeting, 'info');
}

function displayMerchantItems(inventory, soldItems) {
    const container = document.getElementById('merchant-items');
    container.innerHTML = '';
    
    inventory.forEach((item, index) => {
        const itemCard = createMerchantItemCard(item, index, soldItems.includes(index));
        container.appendChild(itemCard);
    });
}

function createMerchantItemCard(item, index, isSold) {
    const card = document.createElement('div');
    card.className = `merchant-item ${isSold ? 'sold-out' : ''}`;
    
    const actualCost = ItemFactory.applyDiscount(item, game.player);
    
    card.innerHTML = `
        <h4 class="${item.getRarityColor()}">${item.name}</h4>
        <p class="text-sm text-gray-300 my-2">${item.description}</p>
        <div class="flex justify-between items-center mt-4">
            <span class="item-price">💰 ${actualCost}</span>
            <button class="px-4 py-2 bg-green-600 hover:bg-green-500 rounded transition buy-item-btn" 
                    ${isSold ? 'disabled' : ''}>
                ${isSold ? 'Sold' : 'Buy'}
            </button>
        </div>
    `;
    
    if (!isSold) {
        const button = card.querySelector('.buy-item-btn');
        button.addEventListener('click', () => purchaseItem(index));
    }
    
    return card;
}

function purchaseItem(itemIndex) {
    const result = game.purchaseItem(itemIndex);
    
    if (result.success) {
        addToCombatLog(result.message, 'special');
        
        // Refresh merchant display
        const state = game.getGameState();
        document.getElementById('merchant-gold').textContent = state.player.gold;
        displayMerchantItems(state.merchant.inventory, state.merchant.soldItems);
        
        updateGameUI();
    } else {
        addToCombatLog(result.message, 'info');
    }
}

function closeMerchant() {
    const modal = document.getElementById('merchant-modal');
    modal.classList.add('hidden');
    
    game.leaveMerchant();
    updateGameUI();
    addToCombatLog('Continuing your journey...', 'info');
}

// End Run Modal
function showEndRunModal() {
    const modal = document.getElementById('end-run-modal');
    const statsContainer = document.getElementById('run-stats');
    
    const stats = game.stats;
    
    statsContainer.innerHTML = `
        <div class="text-center mb-4">
            <p class="text-3xl font-bold text-purple-400">${stats.className}</p>
        </div>
        <p><strong>Rounds Survived:</strong> ${stats.highestRound - 1}</p>
        <p><strong>Enemies Defeated:</strong> ${stats.enemiesDefeated}</p>
        <p><strong>Total Damage Dealt:</strong> ${stats.totalDamageDealt}</p>
        <p><strong>Total Damage Taken:</strong> ${stats.totalDamageTaken}</p>
        <p><strong>Gold Earned:</strong> ${stats.goldEarned}</p>
        <p><strong>Items Purchased:</strong> ${stats.itemsPurchased}</p>
    `;
    
    modal.classList.remove('hidden');
}

// Pause Modal
function showPauseModal() {
    document.getElementById('pause-modal').classList.remove('hidden');
}

function hidePauseModal() {
    document.getElementById('pause-modal').classList.add('hidden');
}

// Export for debugging
window.game = game;
