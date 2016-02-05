

document.addEventListener('DOMContentLoaded', function(){
    console.log('Hello, Bear! Happy Valentine\'s Day :)');

    var story = new Story();

    function restart(){
        story.destroy();
        story = new Story();
    }
});


function Story(){
    this.remainingOptions = [
        'rock', 
        'coffee', 
        'cookies', 
        'books', 
        'BB8', 
        'turntable', 
        'spam', 
        'starbucks', 
        'dog'  
    ];

    this.itemContainer = document.querySelector('.items-box');
    this.dropTarget = document.querySelector('.active-panel');
    this.flowAction = document.querySelector('.flow-action');

    this.dragIcon = document.createElement('img');
    this.dragIcon.src = './assets/present-icon.png';
    this.dragIcon.classList.add('drag-icon');

    this.choicesMade = 0;

    // Create initial items.
    for (var i = 0; i < 3; i++){
        this.addItem();
    }

    // Bind listeners to drop target. 
    this.dropTarget.addEventListener('dragenter', this.enterDropTarget.bind(this));
    this.dropTarget.addEventListener('dragleave', this.leaveDropTarget.bind(this));
    this.dropTarget.addEventListener('dragover', this.allowDrop.bind(this));
    this.dropTarget.addEventListener('drop', this.drop.bind(this));

    document.querySelector('.continue').addEventListener('click', this.continue.bind(this));
}

Story.prototype.destroy = function(){
    // Unbind all the listeners and clear the DOM content.
}

 /*
 * Adds a random item from the remaining options
 *
 * @param {Element} elementToReplace (Optional) 
 */
Story.prototype.addItem = function(elementToReplace){
    var newItem = document.createElement('div');
    newItem.classList.add('item');
    newItem.setAttribute('draggable', true);

    // Set listeners.
    newItem.addEventListener('dragstart', this.startItemDrag.bind(this));
    newItem.addEventListener('dragend', this.endItemDrag.bind(this));


    // Choose a random item to add.
    var which = Math.floor(Math.random() * this.remainingOptions.length);
    var itemType = this.remainingOptions.splice(which, 1);
    newItem.dataset.id = itemType;
    newItem.innerHTML = itemType;

    if (elementToReplace){
        this.itemContainer.replaceChild(newItem, elementToReplace);
    } else {
        this.itemContainer.appendChild(newItem);
    }
};


Story.prototype.startItemDrag = function(evt){
    document.body.classList.add('dragging');
    
    evt.dataTransfer.effectAllowed = 'move';
    evt.dataTransfer.setDragImage(this.dragIcon, 10, 10);
    evt.dataTransfer.setData('text/plain', evt.target.dataset.id);

    evt.target.style.opacity = 0.5;
}

Story.prototype.endItemDrag = function(evt){
    document.body.classList.remove('dragging');

    evt.target.style.opacity = 1;
}


Story.prototype.drop = function(evt){
    evt.preventDefault();

    

    // Increment the count of choices made.
    this.choicesMade++;

    if (this.choicesMade >= Story.MAX_CHOICES){

    } else {
        // Hide the options.
        this.itemContainer.classList.add('hidden');

        // Show the continue option.
        this.flowAction.classList.remove('hidden');

        // Replace the chosen option. 
        var chosen = document.querySelector('[data-id="' + evt.dataTransfer.getData('text') + '"]');
        this.addItem(chosen /* elementToReplace */);
    }
}

Story.prototype.allowDrop = function(evt){
    evt.preventDefault();

}


Story.prototype.enterDropTarget = function(evt){
    this.dropTarget.classList.add('ready');
}

Story.prototype.leaveDropTarget = function(evt){
    this.dropTarget.classList.remove('ready');
}

Story.prototype.continue = function(evt){
    // Show the options.
    this.itemContainer.classList.remove('hidden');

    // Hide the continue option.
    this.flowAction.classList.add('hidden');
}

Story.MAX_CHOICES = 4;

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