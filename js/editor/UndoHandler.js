// Right now undo happens on an object by object basis, but maybe each undo/redo will clear and load the entire scene

function UndoHandler(editor) {
    var self = this;

    self.editor = editor;

    self.actionStack = [];
    self.actionStackPos = -1;
    self.actionLimit = 20;
}

UndoHandler.prototype.hasUndos = function() {
    var self = this;
    return (self.actionStackPos != -1);
};

UndoHandler.prototype.hasRedos = function() {
    var self = this;
    return (self.actionStackPos != self.actionStack.length - 1);
};

UndoHandler.prototype.doAction = function(action, reverse) {
    var self = this;
    var editor = self.editor;

    if(action.type == "edit") {

        if(reverse) {
            var object = editor.getObjectByName(action.data.name);
            object.setData(action.data.oldData);
        } else {
            var object = editor.getObjectByName(action.data.name);
            object.setData(action.data.newData);
        }

    } else if(action.type == "add") {

        if(reverse) {
            var object = editor.getObjectByName(action.data.name);
            editor.destroyObject(object);
        } else {
            editor.createObject(action.data);
        }

    } else if(action.type == "remove") {

        if(reverse) {
            editor.createObject(action.data);
        } else {
            var object = editor.getObjectByName(action.data.name);
            editor.destroyObject(object);
        }

    } else if(action.type == "clear") {

        if(reverse) {
            editor.load(action.data);
        } else {
            editor.clear();
        }
    
    } else if(action.type == "scene") {

        if(reverse) {
            editor.load(action.data.oldData);
        } else {
            editor.load(action.data.newData);
        }
    }
}

UndoHandler.prototype.undoAction = function() {
    var self = this;

    if (!self.hasUndos()) return;
    var action = self.actionStack[self.actionStackPos];
    self.actionStackPos--;
    
    self.doAction(action, true);

    editorUI.setUndoRedo(self.hasUndos(), self.hasRedos());
    self.editor.save();
    editorUI.updateSelectedObject();

    console.log("Undo action: " + action.type);
};

UndoHandler.prototype.redoAction = function() {
    var self = this;

    if (!self.hasRedos()) return;
    self.actionStackPos++;
    var action = self.actionStack[self.actionStackPos];

    self.doAction(action, false);

    editorUI.setUndoRedo(self.hasUndos(), self.hasRedos());
    self.editor.save();
    editorUI.updateSelectedObject();

    console.log("Redo action: " + action.type);
};

UndoHandler.prototype.addAction = function(actionType, actionData) {
    var self = this;

    var action = {
        type: actionType,
        data: actionData,
    }

    // Remove the redo states
    self.actionStack.splice(self.actionStackPos + 1, self.actionStack.length);

    // Push action
    self.actionStack.push(action);
    self.actionStackPos++;
            
    // Don't let the stack get too big. Remove oldest.
    if (self.actionStack.length > self.actionLimit){
        self.actionStack.shift();
        self.actionStackPos--;
    }

    editorUI.setUndoRedo(true, false);
    self.editor.save();
    editorUI.updateSelectedObject();

    console.log("Add action " + action.type);
};

UndoHandler.prototype.editObject = function(object) {
    var self = this;

    // // Save the old state of the object and the new state of the object
    // var newData = object.getData();
    // var oldData = object.oldData;
    // self.addAction("edit", {name:object.data.name, newData:newData, oldData:oldData});
    // object.oldData = newData;
    self.editScene();
};

UndoHandler.prototype.addObject = function(object) {
    var self = this;
    // self.addAction("add", object.getData());
    self.editScene();
}

UndoHandler.prototype.removeObject = function(object) {
    var self = this;
    // self.addAction("remove", object.getData());
    self.editScene();
}

UndoHandler.prototype.clearScene = function(sceneData) {
    var self = this;
    // self.addAction("clear", sceneData);
    self.editScene();
}

UndoHandler.prototype.editScene = function() {
    var self = this;
    var editor = self.editor;

    var oldData = editor.sceneData;
    var newData = editor.save();

    self.addAction("scene", {newData:newData, oldData:oldData});
}