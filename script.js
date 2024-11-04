class Item {
    constructor(name, type, quantity, image) {
        this.id = Math.random().toString(36).substring(2, 15);
        this.name = name;
        this.type = type;
        this.quantity = quantity;
        this.image = image;
        this.isHeld = false;
    }
}

// GLOBALS
const CRAFTING_AREA_SIZE = 10;
const MAIN_INVENTORY_SIZE = 27;
const HOTBAR_SIZE = 9;

let craftingAreaItems = new Array(CRAFTING_AREA_SIZE).fill(undefined);
let mainInventoryItems = new Array(MAIN_INVENTORY_SIZE).fill(undefined);
let hotbarItems = new Array(HOTBAR_SIZE).fill(undefined);

let heldItem = null;
let mouseX, mouseY;

mainInventoryItems[0] = new Item('Birch Log', 'block', 64, 'assets/minecraft/textures/block/birch_log.png');
mainInventoryItems[1] = new Item('Diamond Block', 'block', 64, 'assets/minecraft/textures/block/diamond_block.png');
mainInventoryItems[2] = new Item('Diamond Block', 'block', 64, 'assets/minecraft/textures/block/diamond_block.png');
mainInventoryItems[3] = new Item('Sticks', 'item', 64, 'assets/minecraft/textures/item/stick.png');
hotbarItems[0] = new Item('Diamond Sword', 'weapon', 1, 'assets/minecraft/textures/item/diamond_sword.png');
hotbarItems[1] = new Item('Diamond Pickaxe', 'tool', 1, 'assets/minecraft/textures/item/diamond_pickaxe.png');
hotbarItems[2] = new Item('Diamond Axe', 'tool', 1, 'assets/minecraft/textures/item/diamond_axe.png');
hotbarItems[3] = new Item('Diamond Hoe', 'tool', 1, 'assets/minecraft/textures/item/diamond_hoe.png');
hotbarItems[4] = new Item('Diamond Shovel', 'tool', 1, 'assets/minecraft/textures/item/diamond_shovel.png');
hotbarItems[5] = new Item('Diamond', 'item', 64, 'assets/minecraft/textures/item/diamond.png');
hotbarItems[6] = new Item('Torch', 'tool', 1, 'assets/minecraft/textures/block/torch.png');
hotbarItems[7] = new Item('Egg', 'item', 1, 'assets/minecraft/textures/item/egg.png');
hotbarItems[8] = new Item('Dragon Breath', 'consumable', 1, 'assets/minecraft/textures/item/dragon_breath.png');

/**
 * Takes an Item and creates a div to be appended in renderInventory()
 * @param {Item} item A raw Item object
 * @returns A div ready to be added to an inventory slot
 */
function createItemElement(item) {
    let itemDiv = document.createElement('div');
    itemDiv.classList.add('item');
    itemDiv.style.backgroundImage = `url(${item.image})`;
    itemDiv.draggable = true;
    itemDiv.dataset.itemName = item.name;
    itemDiv.dataset.id = item.id;

    itemDiv.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', JSON.stringify(item));
    });

    const quantityDiv = document.createElement('div');
    quantityDiv.classList.add('quantity');
    quantityDiv.textContent = item.quantity;
    itemDiv.appendChild(quantityDiv);

    return itemDiv;
}

/**
 * Takes care of rendering the inventory on screen. Clears all slots and then
 * renders appropriate items in their places minus any item being held.
 */
function renderInventory() {
    const craftingAreaDivs = document.querySelectorAll('.crafting-area > .slot');
    const mainInventoryDivs = document.querySelectorAll('.main-inventory > .slot');
    const hotbarDivs = document.querySelectorAll('.hotbar > .slot');

    craftingAreaDivs.forEach((slot, index) => {
        slot.innerHTML = '';
        if (craftingAreaItems[index]) {
            const itemDiv = createItemElement(craftingAreaItems[index]);
            slot.appendChild(itemDiv);

            // Update quantity
            const quantityDiv = itemDiv.querySelector('.quantity');
            quantityDiv.textContent = craftingAreaItems[index].quantity;
        }
    });

    mainInventoryDivs.forEach((slot, index) => {
        slot.innerHTML = '';
        if (mainInventoryItems[index]) {
            const itemDiv = createItemElement(mainInventoryItems[index]);
            slot.appendChild(itemDiv);

            // Update quantity
            const quantityDiv = itemDiv.querySelector('.quantity');
            quantityDiv.textContent = mainInventoryItems[index].quantity;
        }
    });

    hotbarDivs.forEach((slot, index) => {
        slot.innerHTML = '';
        if (hotbarItems[index]) {
            const itemDiv = createItemElement(hotbarItems[index]);
            slot.appendChild(itemDiv);

            // Update quantity
            const quantityDiv = itemDiv.querySelector('.quantity');
            quantityDiv.textContent = hotbarItems[index].quantity;
        }
    });
}

// LONG FUNCTION
// Need to break up into many functions
function handleClick(event) {
    const slot = event.target.closest('.slot');
    if (!slot) return;

    let targetArray, newLocation;
    if(slot.parentElement.classList.contains('crafting-area')) {
        targetArray = craftingAreaItems;
    } else if(slot.parentElement.classList.contains('main-inventory')) {
        targetArray = mainInventoryItems;
    } else if(slot.parentElement.classList.contains('hotbar')) {
        targetArray = hotbarItems;
    }

    newLocation = Array.from(slot.parentElement.children).indexOf(slot);

    if(heldItem) {
        if(!event.ctrlKey) {
            if (targetArray[newLocation]) {
                if (targetArray[newLocation].name === heldItem.name) {
                    const totalQuantity = targetArray[newLocation].quantity + heldItem.quantity;
                    if (totalQuantity <= 64) {
                        targetArray[newLocation].quantity = totalQuantity;
                        heldItem = null;
                        hideHeldItem();
                    } else {
                        targetArray[newLocation].quantity = 64;
                        heldItem.quantity = totalQuantity - 64;

                        const heldItemDiv = document.querySelector('.held-item');
                        if (heldItemDiv) {
                            const quantityDiv = heldItemDiv.querySelector('.quantity');
                            if (quantityDiv) {
                                quantityDiv.textContent = heldItem.quantity;
                            }
                        }
                    }
                } else {
                    const temp = targetArray[newLocation];
                    targetArray[newLocation] = heldItem;
                    heldItem = temp;

                    const heldItemDiv = document.querySelector('.held-item');
                    if (heldItemDiv) {
                        heldItemDiv.style.backgroundImage = `url(${heldItem.image})`;
                        const quantityDiv = heldItemDiv.querySelector('.quantity');
                        if (quantityDiv) {
                            quantityDiv.textContent = heldItem.quantity;
                        }
                    }
                }
            } else {
                targetArray[newLocation] = heldItem;
                heldItem = null;
                hideHeldItem();
            }
        } else {
            if(targetArray[newLocation]) {
                if(targetArray[newLocation].name === heldItem.name) {
                    targetArray[newLocation].quantity++;
                    heldItem.quantity--;
                    const heldItemDiv = document.querySelector('.held-item');
                    if (heldItemDiv) {
                        const quantityDiv = heldItemDiv.querySelector('.quantity');
                        if (quantityDiv) {
                            quantityDiv.textContent = heldItem.quantity;
                        }
                    }
                    if(heldItem.quantity === 0) {
                        heldItem = null;
                        hideHeldItem();
                    }
                }
                else {
                    const temp = targetArray[newLocation];
                    targetArray[newLocation] = heldItem;
                    heldItem = temp;
                }
            } else {
                targetArray[newLocation] = new Item(heldItem.name, heldItem.type, 1, heldItem.image);
                heldItem.quantity--;

                const heldItemDiv = document.querySelector('.held-item');
                if (heldItemDiv) {
                    const quantityDiv = heldItemDiv.querySelector('.quantity');
                    if (quantityDiv) {
                        quantityDiv.textContent = heldItem.quantity;
                    }
                }

                if(heldItem.quantity === 0) {
                    heldItem = null;
                    hideHeldItem();
                }
            }
        }
    } else {
        const itemDiv = slot.querySelector('.item');
        if (itemDiv) {
            const itemId = itemDiv.dataset.id;
            console.log('Item ID: ', itemId)
            console.log(targetArray)
            const itemIndex = targetArray.findIndex(item => item && item.id === itemId);
            console.log('Index: ', itemIndex)
            if (itemIndex > -1) {
                if (event.ctrlKey) {
                    const halfQuantity = Math.ceil(targetArray[itemIndex].quantity / 2);
                    heldItem = new Item(targetArray[itemIndex].name, targetArray[itemIndex].type, halfQuantity, targetArray[itemIndex].image);
                    targetArray[itemIndex].quantity -= halfQuantity;
                    if (targetArray[itemIndex].quantity === 0) {
                        targetArray[itemIndex] = undefined;
                    }
                } else {
                    heldItem = targetArray[itemIndex];
                    targetArray[itemIndex] = undefined;
                }

                heldItem.isHeld = true;
                createHeldItemDiv(itemDiv);
            }
        }
    }
    renderInventory();
}

function hideHeldItem() {
    const heldItemDiv = document.querySelector('.held-item');
    if (heldItemDiv) {
        heldItemDiv.remove();
    }
}

function createHeldItemDiv(item) {
    const heldItemDiv = item.cloneNode(true);
    heldItemDiv.classList.add('held-item');
    heldItemDiv.style.position = 'absolute';
    heldItemDiv.style.zIndex = 1000;
    heldItemDiv.style.pointerEvents = 'none';
    
    const quantityDiv = heldItemDiv.querySelector('.quantity');
    if (quantityDiv) {
        quantityDiv.textContent = heldItem.quantity;
    }

    document.body.appendChild(heldItemDiv);
}

/**
 * Simply updates mouseX and mouseY locations if an item is being held.
 * @param {Event} event A mouse click
 */
function handleMouseMove(event) {
    if(heldItem) {
        mouseX = event.clientX;
        mouseY = event.clientY;
        updateHeldItemPosition();
    }
}

/**
 * Repositions the held item respective to the mouse location
 */
function updateHeldItemPosition() {
    const heldItemDiv = document.querySelector('.held-item');
    if(heldItemDiv) {
        heldItemDiv.style.left = `${mouseX - 16}px`;
        heldItemDiv.style.top = `${mouseY - 16}px`;
    }
}

/**
 * Main driver for mouse events. Assigns each slot a click event listener
 * and a listener for the mouse moving
 */
function handleMouseEvents() {
    const allSlots = document.querySelectorAll('.slot');
    allSlots.forEach(slot => {
        slot.addEventListener('click', handleClick);
    });
    document.addEventListener('mousemove', handleMouseMove);
}

renderInventory();
handleMouseEvents();