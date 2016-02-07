// TODO: 
// Sizing more responsive
// Waggly borders
// Better scrolling
// Relative sizing of panels

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
    this.commentElement = this.dropTarget.querySelector('.comment');
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

    // Add the first panels. 
    this.addPanels(Story.FIRST_PANELS);

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

    // Try adding a touch liteners.
    newItem.addEventListener('touchstart', this.touchStart.bind(this));
    newItem.addEventListener('touchmove', this.touchMove.bind(this));
    newItem.addEventListener('touchend', this.touchEnd.bind(this));

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
        newItem.setAttribute('title', itemInfo.id);
        if (itemInfo.image){
            newItem.innerHTML = '<img src="assets/' + itemInfo.image + '">';
        } else {
            newItem.innerHTML = itemInfo.id;
        }

        if (elementToReplace){
            this.itemContainer.replaceChild(newItem, elementToReplace);
        } else {
            this.itemContainer.appendChild(newItem);
        }
    }
};

Story.prototype.addPanels = function(panels, panelGroupClasses){
    var newPanelGroup = document.createElement('div');
    newPanelGroup.classList.add('panel-group', 'latest');
    if (panelGroupClasses){
        DOMTokenList.prototype.add.apply(newPanelGroup.classList, panelGroupClasses);
    }

    var previous = document.querySelector('.latest');
    if (previous) previous.classList.remove('latest');

    panels.forEach(function(panelInfo) {
        var newPanel = document.createElement('div');
        newPanel.classList.add('panel');
        var text = document.createElement('span');
        text.classList.add('panel-text');
        var image = document.createElement('img');
        image.classList.add('panel-image');

        if (panelInfo.specialClasses){
            DOMTokenList.prototype.add.apply(newPanel.classList, 
                    panelInfo.specialClasses);
        }

        // Add the image and text
        if (panelInfo.text){
            text.innerHTML = panelInfo.text;
            newPanel.appendChild(text);
        }
        if (panelInfo.image){
            image.setAttribute('src', panelInfo.image);
            if (panelInfo.textFirst){
                newPanel.appendChild(image);
            } else {
                newPanel.insertBefore(image, text);
            }
        }

        // Add the panel to the group.
        newPanelGroup.appendChild(newPanel);
    });

    // Add the new panels. 
    this.panelsContainer.appendChild(newPanelGroup);
};

/** 
 * A wrapper method that just does the extra bit of removing the highlight from
 * the previously highlighted panels. 
 */
Story.prototype.showDropTarget = function(){
    // Update the message after each choice.
    switch(this.choicesMade){
        case 1: 
            this.commentElement.innerHTML = 'Oh dear, that wasn\'t enough.';
            break;
        case 2: 
            this.commentElement.innerHTML = 'Perhaps a few more..?';
            break;
        case 3: 
            this.commentElement.innerHTML = 'Hmm... Not quite.';
            break;
        case 4: 
            this.commentElement.innerHTML = 'A bit of grumpiness left!';
            break;
        default: 
    }

    this.dropTarget.classList.remove('hidden');

    var previous = document.querySelector('.latest');
    if (previous) previous.classList.remove('latest');
}

Story.prototype.continue = function(evt){
    // Show the options.
    this.itemContainer.classList.remove('hidden');

    // Show the drop target.
    this.showDropTarget();

    // Hide the continue option.
    this.flowAction.classList.add('hidden');
};

Story.prototype.restart = function(evt){
    this.destroy();

    new Story();
};

Story.prototype.touchStart = function(evt){
    evt.preventDefault();

    if (evt.touches.length === 1){
        var touch = evt.touches[0];
        this.dragIcon.style.left = touch.pageX - 50 + 'px';
        this.dragIcon.style.top = touch.pageY - 50 + 'px';
        document.body.appendChild(this.dragIcon);

        touch.target.style.opacity = 0.5;
    }
}

Story.prototype.touchEnd = function(evt){
    if (event.touches.length === 0){
        var touch = event.changedTouches[0];
        var itemInfo = Story.options[touch.target.dataset.id];
        var endElement = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (endElement === this.dropTarget){
            this.chooseOption(itemInfo);
        }
        document.body.removeChild(this.dragIcon);

        touch.target.style.opacity = 1;
    }

    this.dropTarget.classList.remove('ready');
}

Story.prototype.touchMove = function(evt){
    event.preventDefault();

    if (event.touches.length === 1){
        var touch = event.touches[0];
        this.dragIcon.style.left = touch.pageX - 50 + 'px';
        this.dragIcon.style.top = touch.pageY - 50 + 'px';

        var hoverElement = document.elementFromPoint(touch.clientX, touch.clientY);
        if (hoverElement === this.dropTarget){
            this.dropTarget.classList.add('ready');
        } else {
            this.dropTarget.classList.remove('ready');
        }
    }
}

Story.prototype.startItemDrag = function(evt){
    evt.dataTransfer.effectAllowed = 'move';
    evt.dataTransfer.setDragImage(this.dragIcon, 10, 10);
    evt.dataTransfer.setData('text/plain', 
            JSON.stringify(Story.options[evt.target.dataset.id]));

    evt.target.style.opacity = 0.5;
};

Story.prototype.endItemDrag = function(evt){
    evt.target.style.opacity = 1;
};


Story.prototype.drop = function(evt){
    evt.preventDefault();

    itemInfo = JSON.parse(evt.dataTransfer.getData('text'));
    this.chooseOption(itemInfo);
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

Story.prototype.chooseOption = function(itemInfo){
    // Increment the count of choices made.
    this.choicesMade++;

    if (itemInfo.id === Story.FINAL_ITEM_ID){
        // The dropped item is the final item. 

        // Show the restart option. 
        document.querySelector('.continue').classList.add('hidden');
        document.querySelector('.restart').classList.remove('hidden');
    } else {
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
    this.addPanels(itemInfo.panels, itemInfo.panelGroupClasses);

    this.dropTarget.classList.remove('ready');
}

Story.FINAL_ITEM_ID = 'elephant';

Story.FIRST_PANELS = [
    {
        text: 'Grumpy Bear\'s Valentine',
        image: '',
        specialClasses: ['title-panel'],
    }, 
    {
        text: 'Today is February 14th. Grumpy Bear is sleepy, hungry, and above all, grumpy!',
        image: '',
    }, 
    {
        text: '"It\'s <span class="accent">Valentine\'s Day</span>; where\'s my gift?" he grumbles.',
        image: '',
    }, 
];

Story.MAX_CHOICES = 4;

Story.options = {
    'rock': {
        id: 'rock',
        image: 'rock.png',
        panels: [
            {text: '"Ooh, can I climb it?"'}, {text: '(Climbs on)'}
        ]
    }, 
    'aeropress': {
        id: 'aeropress',
        image: 'aeropress.png',
        panels: [
            {text: '(grumble)'}, {text: '(drink)'}, {text: '(Perks up)'}
        ]
    }, 
    'cookies': {
        id: 'cookies',
        image: 'cookies.png',
        panels: [
            {text: '"Insert directly into mouth hole!"'}, {text: '*chomp*'}
        ]
    }, 
    'books': {
        id: 'books',
        image: 'books.png',
        panels: [
            {text: 'Yay, plane reading!'}, {text: 'Or for rainy days.'}
        ]
    }, 
    'BB8': {
        id: 'BB8',
        image: 'bb8.png',
        panels: [
            {text: 'Ooh!'}, {text: 'Let\'s go see star wars!'}
        ]
    }, 
    'turntable': { 
        id: 'turntable',
        image: 'turntable.png',
        panels: [
            {text: 'Am I hipster yet?'}
        ]
    }, 
    'spam': {
        id: 'spam',
        image: 'spam.png',
        panels: [
            {text: '(look)'}, {text: 'Aww...'}, {text: '(toss)'}
        ]
    }, 
    'starbucks': {
        id: 'starbucks',
        image: 'starbucks.png',
        panels: [
            {text: '(sip)'}, {text: 'blech!'}, {text: '(toss)'}
        ]
    }, 
    'dog': {
        id: 'dog',
        image: 'dog.png',
        panels: [
            {text: '(look)'}, {text: '(barks)'}, {text: '(Puts on headphones)'}
        ]
    },
    'elephant': {
        id: 'elephant',
        panels: [
            {
                text: '(Box opens)',
            }, {
                text: '(Hugs)', 
                specialClasses: ['hug-panel'],
            }, {
                text: 'Sappy romantic stuff goes here.'
            }
        ],
        panelGroupClasses: ['final-panels'],
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