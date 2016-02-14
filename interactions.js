document.addEventListener('DOMContentLoaded', function(){
    console.log('Hello, Bear! Happy Valentine\'s Day :)');

    new Story();
});

window.addEventListener('unload', function(){
    // Reset scroll so that refreshes start at the top of the page. 
    document.body.scrollTop = 0;
});

window.addEventListener('resize', function(){
    // Since we periodically set min-height explicitly, it needs to be cleared when the
    // viewport dimensions change.
    document.querySelector('.content-box').style['min-height'] = '100%';
})

window.addEventListener('orientationchange', function(){
    // Since we periodically set min-height explicitly, it needs to be cleared when the
    // viewport dimensions change.
    document.querySelector('.content-box').style['min-height'] = '100%';
})


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
    document.body.scrollTop = 0;
}

Story.prototype.destroy = function(){
    // Reset the contents entirely, wiping out listeners in the process. 
    document.body.innerHTML = this.originalHTML;

    // Clear the timer if it somehow still exists.
    if (this.scrollTimer) clearInterval(this.scrollTimer);
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

    var itemInfo; 
    if (isFinalItem){
        itemInfo = Story.options[Story.FINAL_ITEM_ID];
        this.itemContainer.innerHTML = '';
    } else {
        // Choose a random item to add.
        var keys = Object.keys(this.remainingOptions);
        var which = keys[Math.floor(Math.random() * keys.length)];
        var itemInfo = this.remainingOptions[which];

        // Remove the chosen item from the remaining items list. 
        delete this.remainingOptions[which];        
    }

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
};

/*
 * Returns the new panel group containing the new panels. 
 */
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
            image.setAttribute('src', 'assets/' + panelInfo.image);
            if (panelInfo.textFirst || !panelInfo.text){
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

    return newPanelGroup;
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

    // Scroll to the bottom.
    this.smoothScrollTo(this.dropTarget);

    // Hide the continue option.
    this.flowAction.classList.add('hidden');
};

Story.prototype.restart = function(evt){
    this.destroy();
    document.body.scrollTop = 0;

    new Story();
};

// Note: this only scrolls down
Story.prototype.smoothScrollTo = function(target){
    // Clear any timer that currently exists (there shouldn't be one, though).
    if (this.scrollTimer) clearInterval(this.scrollTimer);

    var scroll = function(){
        var distance = target.offsetTop - BUFFER;
        var maxScroll = document.body.scrollHeight - document.body.offsetHeight;
        var currentScroll = document.body.scrollTop;
        var distanceToTravel = Math.ceil(Math.min(Story.DEFAULT_TRAVEL_DISTANCE, Math.max(0, distance - currentScroll)));

        document.body.scrollTop += distanceToTravel;
        
        var newScroll = document.body.scrollTop;

        if (newScroll <= currentScroll || newScroll >= maxScroll){
            clearInterval(this.scrollTimer);
        }
    }.bind(this);

    this.scrollTimer = window.setInterval(scroll, 25);
}

function cubicEasing(t) { 
    return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
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
        // If a single touch ended, check its drop location. If more than one touch was on 
        // and all were removed, just cancel the drag. 
        if (event.changedTouches.length === 1){
            var touch = event.changedTouches[0];
            var itemInfo = Story.options[touch.target.dataset.id];
            var endElement = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (endElement === this.dropTarget){
                this.chooseOption(itemInfo);
            }
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

    // Before manipulating DOM, set a min height before adding content to prevent page resizing.
    var pageHeight = document.body.scrollHeight;
    document.querySelector('.content-box').style['min-height'] = pageHeight + 'px';
    
    // Hide the options.
    this.itemContainer.classList.add('hidden');

    // Hide the drop target.
    this.dropTarget.classList.add('hidden');

    // Make sure the dropTarget is back in its original state. 
    this.dropTarget.classList.remove('ready');

    // Add the relevant panels.
    var newPanelGroup = this.addPanels(itemInfo.panels, itemInfo.panelGroupClasses);

    // Show the continue or restart option.
    this.flowAction.classList.remove('hidden');

    // Autoscroll to the added panels when the viewport is narrow and items are likely to all
    // be in separate rows. 
    if (document.body.offsetWidth <= 550) {
        this.smoothScrollTo(newPanelGroup);
    }
}

Story.DEFAULT_TRAVEL_DISTANCE = 20;

Story.FINAL_ITEM_ID = 'mystery';

Story.FIRST_PANELS = [
    {
        text: 'Grumpy Bear\'s Valentine',
        image: '',
        specialClasses: ['title-panel', 'force-row'],
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
            {
                text: '"Ooh, can I climb it?"', 
                image: 'rock/oohrock.png',
            }, {
                image: 'rock/hehe.png',
            }
        ]
    }, 
    'aeropress': {
        id: 'aeropress',
        image: 'aeropress.png',
        panels: [
            {image: 'aeropress/grumble.png'}, 
            {image: 'aeropress/sip.png'}, 
            {image: 'aeropress/perkup.png'},
        ]
    }, 
    'cookies': {
        id: 'cookies',
        image: 'cookies.png',
        panels: [
            {
                text: '"Insert directly into mouth hole!"',
                image: 'cookies/insert.png',
                textFirst: true,
            }, {
                text: '*chompnomnomnom*', 
                image: 'cookies/yum.png',
            }
        ]
    }, 
    'books': {
        id: 'books',
        image: 'books.png',
        panels: [
            {
                text: '"Yay, plane reading!"', 
                image: 'books/planebooks.png', 
                textFirst: true
            }, {
                text: '"Or for rainy days."', 
                image: 'books/rainyread.png'
            }
        ]
    }, 
    'BB8': {
        id: 'BB8',
        image: 'bb8.png',
        panels: [
            {
                text: '"Ooh!"', 
                image: 'bb8/ooh.png',
                textFirst: true,
            }, {
                text: '"Let\'s go see Star Wars!"', 
                image: 'bb8/starwars.png'
            }
        ]
    }, 
    'turntable': { 
        id: 'turntable',
        image: 'turntable.png',
        panels: [
            {
                image: 'turntable/enjoy.png',
            }, {
                text: '"Am I hipster yet?"', 
                image: 'turntable/hipster.png',
                textFirst: true
            }
        ]
    }, 
    'spam': {
        id: 'spam',
        image: 'spam.png',
        panels: [
            {
                image: 'spam/mail.png'
            }, {
                text: '"Aww..."', 
                image: 'spam/aww.png'
            }, {
                image: 'spam/toss.png'
            }
        ]
    }, 
    'starbucks': {
        id: 'starbucks',
        image: 'starbucks.png',
        panels: [
            {
                image: 'starbucks/lick.png'
            }, {
                text: '*BLECH!*',
                image: 'starbucks/blech.png',
                textFirst: true
            }
        ]
    }, 
    'dog': {
        id: 'dog',
        image: 'dog.png',
        panels: [
            {image: 'dog/um.png'}, 
            {image: 'dog/yip.png'}, 
            {image: 'dog/headphones.png'}
        ]
    },
    'mystery': {
        id: 'mystery',
        image: 'mystery.gif',
        panels: [
            {
                image: 'mystery/open.gif',
                specialClasses: ['force-row', 'open-panel']
            }, {
                image: 'mystery/hug.png', 
                text: '"Will you be my <span class="accent">Valentine</span>?"',
                specialClasses: ['hug-panel'],
            }, {
                text: '<p>Hello, my dear bear :) I hope you are having a wonderful day. ' + 
                        'I\'m sorry I can\'t spend Valentine\'s day with you in person this year,' + 
                        ' but it was a lot of fun to make this little comic thingy for you, and I hope that you\'ve enjoyed it,' + 
                        ' and that it makes up for being apart a little bit' + 
                        ' (feel free to go back through and try options you didn\'t choose this time around :)' + 
                        ' There are nine total, not including the final item.)' + 
                        ' As a side effect, I\'ve improved at drawing bears...' + 
                        ' Which just means I shall have to draw you more, I suppose! :P' + 
                        ' Enjoy your time with your father and your new living quarters!' +
                        ' I miss you very much, love you even more, and look forward to seeing you soon!' + 
                        '<br><br>Yours affectionately,<br>Elephant</p>'
            }
        ],
        panelGroupClasses: ['final-panels'],
    },
}

var BUFFER = 15;

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