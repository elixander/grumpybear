document.addEventListener('DOMContentLoaded', function(){
    console.log('Hello, Bear! Happy Valentine\'s Day :)');

    new Story();
});


function Story(){
    this.originalHTML = document.body.innerHTML;

    this.remainingOptions = Object.assign({}, Story.options);
    // Remove the final option to save. 
    delete this.remainingOptions[Story.FINAL_ITEM_ID];

    this.itemContainer = document.querySelector('.items-box');
    this.panelsContainer = document.querySelector('.panels-box');
    this.dropTarget = document.querySelector('.active-panel');
    this.flowAction = document.querySelector('.flow-action');

    this.continueButton = this.flowAction.querySelector('.continue');
    this.restartButton = this.flowAction.querySelector('.restart');

    this.dragIcon = document.createElement('img');
    this.dragIcon.src = './assets/present-icon.png';
    this.dragIcon.classList.add('drag-icon');

    this.choicesMade = 0;

    // Create initial items.
    for (var i = 0; i < 3; i++){
        this.addItem();
    }

    // Add the first panel.
    this.addPanels([Story.FIRST_PANEL]);

    this.showDropTarget();

    // Bind listeners to drop target. 
    this.dropTarget.addEventListener('dragenter', this.enterDropTarget.bind(this));
    this.dropTarget.addEventListener('dragleave', this.leaveDropTarget.bind(this));
    this.dropTarget.addEventListener('dragover', this.allowDrop.bind(this));
    this.dropTarget.addEventListener('drop', this.drop.bind(this));

    this.continueButton.addEventListener('click', this.continue.bind(this));
    this.restartButton.addEventListener('click', this.restart.bind(this));
}

Story.prototype.destroy = function(){
    // Reset the contents entirely, wiping out listeners in the process. 
    document.body.innerHTML = this.originalHTML;
}

 /*
 * Adds a random item from the remaining options
 *
 * @param {Element} elementToReplace (Optional) 
 * @param {boolean} isFinalItem (Optional) 
 */
Story.prototype.addItem = function(elementToReplace, isFinalItem){
    var newItem = document.createElement('div');
    newItem.classList.add('item');
    newItem.setAttribute('draggable', true);

    // Set listeners and add them to the unbind method.
    newItem.addEventListener('dragstart', this.startItemDrag.bind(this));
    newItem.addEventListener('dragend', this.endItemDrag);

    if (isFinalItem){
        newItem.dataset.id = Story.FINAL_ITEM_ID;
        newItem.innerHTML = Story.FINAL_ITEM_ID;

        this.itemContainer.innerHTML = '';
        this.itemContainer.appendChild(newItem);
    } else {
        // Choose a random item to add.
        var keys = Object.keys(this.remainingOptions);
        var which = keys[Math.floor(Math.random() * keys.length)];
        var itemInfo = this.remainingOptions[which];

        // Remove the chosen item from the remaining items list. 
        delete this.remainingOptions[which];

        newItem.dataset.id = itemInfo.id;
        newItem.innerHTML = itemInfo.id;

        if (elementToReplace){
            this.itemContainer.replaceChild(newItem, elementToReplace);
        } else {
            this.itemContainer.appendChild(newItem);
        }
    }
};

Story.prototype.addPanels = function(panels){
    var newPanelGroup = document.createElement('div');
    newPanelGroup.classList.add('panel-group', 'latest');

    var previous = document.querySelector('.latest');
    if (previous) previous.classList.remove('latest');

    panels.forEach(function(panelInfo) {
        var newPanel = document.createElement('div');
        newPanel.classList.add('panel');

        newPanel.innerHTML = panelInfo.text;

        newPanelGroup.appendChild(newPanel);
    });

    this.panelsContainer.appendChild(newPanelGroup);

    newPanelGroup.scrollIntoView();
};

/** 
 * A wrapper method that just does the extra bit of removing the highlight from
 * the previously highlighted panels. 
 */
Story.prototype.showDropTarget = function(){
    this.dropTarget.classList.remove('hidden');

    var previous = document.querySelector('.latest');
    if (previous) previous.classList.remove('latest');
}

Story.prototype.continue = function(evt){
    // Show the options.
    this.itemContainer.classList.remove('hidden');
    this.itemContainer.scrollIntoView();

    // Show the drop target.
    this.showDropTarget();

    // Hide the continue option.
    this.flowAction.classList.add('hidden');
};

Story.prototype.restart = function(evt){
    this.destroy();

    new Story();
};

Story.prototype.startItemDrag = function(evt){
    document.body.classList.add('dragging');
    
    evt.dataTransfer.effectAllowed = 'move';
    evt.dataTransfer.setDragImage(this.dragIcon, 10, 10);
    evt.dataTransfer.setData('text/plain', 
            JSON.stringify(Story.options[evt.target.dataset.id]));

    evt.target.style.opacity = 0.5;
};

Story.prototype.endItemDrag = function(evt){
    document.body.classList.remove('dragging');

    evt.target.style.opacity = 1;
};


Story.prototype.drop = function(evt){
    evt.preventDefault();

    itemInfo = JSON.parse(evt.dataTransfer.getData('text'));

    if (itemInfo.id === Story.FINAL_ITEM_ID){
        // The dropped item is the final item. 

        // Show the restart option. 
        document.querySelector('.continue').classList.add('hidden');
        document.querySelector('.restart').classList.remove('hidden');
    } else {
         // Increment the count of choices made.
        this.choicesMade++;

        if (this.choicesMade >= Story.MAX_CHOICES){
            // Replace the options with the final option. 
            this.addItem(null, true /* isFinalItem */);
        } else {
            // Replace the chosen option. 
            var chosen = document.querySelector('[data-id="' + itemInfo.id + '"]');
            this.addItem(chosen /* elementToReplace */);
        }
    }

    // Hide the options.
    this.itemContainer.classList.add('hidden');

    // Hide the drop target.
    this.dropTarget.classList.add('hidden');

    // Show the continue or restart option.
    this.flowAction.classList.remove('hidden');

    // Add the relevant panels.
    this.addPanels(itemInfo.panels);

    this.dropTarget.classList.remove('ready');
};

Story.prototype.allowDrop = function(evt){
    evt.preventDefault();
};

Story.prototype.enterDropTarget = function(evt){
    this.dropTarget.classList.add('ready');
};

Story.prototype.leaveDropTarget = function(evt){
    this.dropTarget.classList.remove('ready');
};

Story.FINAL_ITEM_ID = 'elephant';

Story.FIRST_PANEL = {
    text: 'Grumpy Bear\'s Valentine',
    image: '',
};

Story.MAX_CHOICES = 4;

Story.options = {
    'rock': {
        id: 'rock',
        panels: [
            {text: 'Ooh, can I climb it?'}, {text: '(Climbs on)'}
        ]
    }, 
    'coffee': {
        id: 'coffee',
        panels: [
            {text: '(grumble)'}, {text: '(drink)'}, {text: '(Perks up)'}
        ]
    }, 
    'cookies': {
        id: 'cookies',
        panels: [
            {text: 'Insert directly into mouth hole!'}, {text: '*chomp*'}
        ]
    }, 
    'books': {
        id: 'books',
        panels: [
            {text: 'Yay, plane reading!'}, {text: 'Or for rainy days.'}
        ]
    }, 
    'BB8': {
        id: 'BB8',
        panels: [
            {text: 'Ooh!'}, {text: 'Let\'s go see star wars!'}
        ]
    }, 
    'turntable': { 
        id: 'turntable',
        panels: [
            {text: 'Am I hipster yet?'}
        ]
    }, 
    'spam': {
        id: 'spam',
        panels: [
            {text: '(look)'}, {text: 'Aww...'}, {text: '(toss)'}
        ]
    }, 
    'starbucks': {
        id: 'starbucks',
        panels: [
            {text: '(sip)'}, {text: 'blech!'}, {text: '(toss)'}
        ]
    }, 
    'dog': {
        id: 'dog',
        panels: [
            {text: '(look)'}, {text: '(barks)'}, {text: '(Puts on headphones)'}
        ]
    },
    'elephant': {
        id: 'elephant',
        panels: [
            {text: '(Box opens)'}, {text: '(Hugs)'}, {text: 'Sappy romantic stuff goes here.'}
        ]
    },
}

// def transformRect2Polygon(elem):
//     elem.tag = ns('polygon')
//     x = float(elem.attrib['x'])
//     y = float(elem.attrib['y'])
//     w = float(elem.attrib['width'])
//     h = float(elem.attrib['height'])
//     elem.attrib['points'] = '%f,%f %f,%f %f,%f %f,%f' % (
//             x, y,
//             x + w, y,
//             x + w, y + h,
//             x, y + h
//             )

// def transformPolyline(elem):
//     points = parsePoints(elem.attrib['points'])
//     newPoints = []
//     for i in xrange(len(points) - 1):
//         p1, p2 = points[i], points[i + 1]

//         newPoints.append(p1)
//         l = lineLength(p1, p2)
//         if l > 10:
//             p = splitLine(p1, p2, frandrange(4, l - 4))
//             newPoints.append((
//                 p[0] + frandrange(0.5, 2) * random.choice([1, -1]),
//                 p[1] + frandrange(0.5, 2) * random.choice([1, -1])
//             ))

//     newPoints.append(points[-1])

//     elem.attrib['points'] = ' '.join(['%f,%f' % (putPixels(p[0]), putPixels(p[1])) for p in newPoints])

//     