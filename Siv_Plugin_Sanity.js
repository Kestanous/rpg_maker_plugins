/*:
  * @plugindesc (v0.4.0) Makes building and using plugins easier. Comes with a dependency manager.
  *
  * Released under MIT license, https://github.com/Sivli-Embir/rpg_maker_plugins/blob/master/LICENSE
  *
  * @author Sivli Embir & Noxx Embir
  *
  *
  * @help
  * ============================================================================
  * Documentation
  * ============================================================================
  *
  * For RPG Maker MV 1.5+
  *
  * If you are reading this then you are probobly using another one of my
  * plugins. Be aware that this plugin is safe to use (as far as I know)
  * but I am still doing a lot of work on it. Until I feel its done it will not
  * be fully documented and its version will say v0.x.
  *
  * The point of this plugin is to make creating plugins easier and reduce
  * avoidable bugs. Among other things it has a dependency manager, which means
  * if you define your plugins with this tool they will always load in the
  * order you want regardless of the order in the offical Plugin Manager.
  *
  * ============================================================================
  * API Usage
  * ============================================================================
  *
  * For details on how to use the API please read the comments in the code
  * for now.
  *
  * SIV_SCOPE.definePlugin (object): use dependency manager.
  *
  * SIV_SCOPE.getNotetags(object): check if game object has matching notetags
  *
  * SIV_SCOPE.registerPluginCommand (name, function): will run the funciton on
  * plugin command call.
  *
  * ============================================================================
  * Notetag format
  * ============================================================================
  * <ExampleTag />  results in:
  * {name: "ExampleTag", args: []}
  *
  * <ExampleTag some arguments />  results in:
  * {
  *   name: "ExampleTag",
  *   args: ['some', 'arguments']
  * }
  *
  * <ExampleTag some arguments>
  * child 1
  * child 2
  * <ExampleTag /> results in:
  * {
  *   name: "ExampleTag",
  *   args: ['some', 'arguments'],
  *   children: ['child 1', 'child 2']
  * }
  *
  * Be aware that the following is also valid but not encouraged:
  * <ExampleTag valid but>
  * really not a good format.
  * As it is harder to read where ExampleTag ended.
  * />
  *
  * ===ON EVENTS===
  * SIV_SCOPE.onInit (function): DB, Plutins, and note tags are laoded.
  * SIV_SCOPE.onFrame (function): best to not use this... (if you must use scene
  * update instead)
  * SIV_SCOPE.onSceneEvent: (sceneObj, eventName, function):
  *   sceneObj: (Scene_[name] The scene game object) example: Scene_Map
  *   eventName: 'create', 'start', 'update', 'terminate',
  *   (also for map: 'addObjects')
  *
  * ============================================================================
  * Change Log
  * ============================================================================
  *
  * Version 0.0.0:
  * - Pending v1
  */

/**
 * Developed By Team:
 *  ██████╗  ██████╗ ███████╗███████╗    ██████╗ ██████╗  █████╗  ██████╗  ██████╗ ███╗   ██╗
 *  ██╔══██╗██╔═══██╗██╔════╝██╔════╝    ██╔══██╗██╔══██╗██╔══██╗██╔════╝ ██╔═══██╗████╗  ██║
 *  ██████╔╝██║   ██║███████╗█████╗      ██║  ██║██████╔╝███████║██║  ███╗██║   ██║██╔██╗ ██║
 *  ██╔══██╗██║   ██║╚════██║██╔══╝      ██║  ██║██╔══██╗██╔══██║██║   ██║██║   ██║██║╚██╗██║
 *  ██║  ██║╚██████╔╝███████║███████╗    ██████╔╝██║  ██║██║  ██║╚██████╔╝╚██████╔╝██║ ╚████║
 *  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚══════╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝
 */


/////////////////////////////////////////////////////////////////////////////////
// Some good house keeping given we don't have nice js2016+ import scoping.    //
// I use SIV_SCOPE to keep from bleeding into something else and hopefully not //
// conflicting with other plugins.                                             //
/////////////////////////////////////////////////////////////////////////////////

var SIV_SCOPE = {
  _wrapper: {//global holder for PRG Maker wraps.
    custom: {} //plugin defined wrappers
  },
  _plugins: {}, //all the plugins that are registered.
  _data: { //where I will store all SIV_SCOPE global variables.
    databaseHasLoaded: false, //a way to prevent queues from firing before init.
    notetagDictionary: { //A list of ALL the notetags in the game
      maps: {}, //maps require special treatment.
      mapEvents: {} //map events require special treatment.
    }
  },
  _pluginCommands: {}, //This is where I store plugin functions.
  _onQueue: { //all the on[state] queue functions.
    onInit: [],
    onFrame: [],
    variableChange: {},
  },
  _extractSaveContents: [],
  _makeSaveContents: [],
  parameters: PluginManager.parameters('Siv_Plugin_Sanity')
};
///////////////////////////////////////////////////////////////////////////////////
// PUBLIC API. This is for use by anyone using the plugin. Everything after this //
// is not meant to be used outside of the plugin, so hack at your own risk :)    //
///////////////////////////////////////////////////////////////////////////////////

/**
 * If you use this to define your plugin Siv_Plugin_Sanity will make sure it loads and
 * runs at the right time. That is after the database exists and after any required
 * plugins. It will also load beore the onInit function, when you should do global config work.
 * @param  {Object} definition must contain a name {string} and a plugin {function}.
 * It may include a require {Array} with a list of plugin names {String}.
 * @return {Null}
 */
SIV_SCOPE.definePlugin = function(definition) {
  if (typeof definition.name !== 'string') {
    console.log('Siv_Plugin_Sanity - A plugin without a name was found, skipping!');
    return;
  }
  if (typeof definition.plugin !== 'function') {
    console.log('Siv_Plugin_Sanity - plugin: ' + definition.name + ' did not define a plugin function and does nothing!');
    return;
  }
  if (definition.requires && (typeof definition.requires !== 'object' || !definition.requires.hasOwnProperty('length'))) {
    console.log('Siv_Plugin_Sanity - plugin: ' + definition.name + ' has invalid requirements, skipping');
    return;
  }
  SIV_SCOPE._plugins[definition.name] = definition;
  try {
    SIV_SCOPE._dependencyGraph.addNode(definition.name)
    if (definition.requires) {
      for (var i = 0; i < definition.requires.length; i++) {
        SIV_SCOPE._dependencyGraph.addDependency(definition.name, definition.requires[i]);
      }
    }
  } catch (e) {
    if (Utils.isNwjs()) {
      var _debugWindow = require('nw.gui').Window.get().showDevTools();
      _debugWindow.focus();
    }
    throw e;
  }
}

/**
 * Will run once when: the database is loaded, the core engine variables are made,
 * and after all the plugins are run. WARNING! This is not onStart/onNewGame/onLoad
 * @param  {Function} func A standard function that should contain any code that
 * needs to be run at startup.
 * @return {Null}
 */
SIV_SCOPE.onInit = function(func) {
  SIV_SCOPE._onQueue.onInit.push(func)
}

/**
 * This will run approximately 60 times a second. Unless you have a very specific
 * need you likely don't want to use this. This is a great way to introduce lag!
 * @param  {Function} func A standard function that should contain any code that
 * needs to be run once a frame.
 * @return {Null}
 */
 SIV_SCOPE.onFrame = function(func) {
   SIV_SCOPE._onQueue.onFrame.push(func)
 }

 SIV_SCOPE.onVariableChange = function(index, func) {
   if (!SIV_SCOPE._onQueue.variableChange[index]) SIV_SCOPE._onQueue.variableChange[index] = []
   SIV_SCOPE._onQueue.variableChange[index].push(func)
 }


SIV_SCOPE.onSceneEvent = function(scene, event, func) {
  SIV_SCOPE.onEvent(scene.name, event, func)
  event = event.toLowerCase();
}


/**
 * Find out if a given game object has a notetag. This takes a query and returns
 * an array of all matchs.
 *
 * The query shoud have:
 * the (type) of object you have - currently: "actors", "armors", 'classes',
 * 'commonEvents', 'enemies', 'skills', 'states', 'weapons'
 * the (id) of the object, the index or number in the database
 * the (match) string. This can ether be an exact string match or regex query.
 *
 * @param  {Object} obj must contain a type {String} and an id {Number} and
 * a name {String}. mapEvents also requires a mapId {Number}
 * @return {Array} This array as objects:
 * name {String} the name of the notetag
 * args {Array} all the notetag top level arguments
 * children {Array} this is ether undefined or an array of child data.
 */
SIV_SCOPE.getNotetags = function(obj) {
  var notes;
  if (obj.type === 'mapEvents') {
    if (!obj.mapId) {
      console.log('mapEvents must have mapId.');
      return []
    }
    notes = (((SIV_SCOPE._data.notetagDictionary[obj.type] || {})[obj.mapId] || {})[obj.id] || {}).notes
  } else {
    notes = ((SIV_SCOPE._data.notetagDictionary[obj.type] || {})[obj.id] || {}).notes
  }
  if (!notes || !notes.length) return [];
  if (!obj.name) return notes;
  return notes.filter(function(note) {
    return note.tag == obj.name;
  })
}

/**
 * This lets you run plugin commands in a very fast and efficent way.
 *
 * Warning: Last write wins case, the last plugin to use the same command name
 * will be the only one to use the command. Breaking change from core!
 *
 * a: consider building in a namespace backend option, or front end even...
 * but how??? The user will only say the original name, how do we get intent?
 * Can we run all matchs? Should we? imo no but...
 *
 * @param  {String} command A globally unique name for your command
 * @param  {Function} func  A standard function that will preform whatever
 * you want your plugin command to do.
 * @return {Null}
 */
SIV_SCOPE.registerPluginCommand = function(command, func) {
  if (command && func) SIV_SCOPE._pluginCommands[command] = func;
}

SIV_SCOPE.fireCustomEvent = function() {
  var args = [];
  Array.prototype.push.apply( args, arguments );
  if (!args[0]) {
    console.log("fireCustomEvent: Missing name");
    return;
  }
  if (!args[1]) {
    console.log("fireCustomEvent: Missing method");
    return;
  }
  var name = args.shift();
  var method = args.shift();
  SIV_SCOPE._runOnScene.call(this, args, name, method)
}

SIV_SCOPE.onEvent = function(name, method, func) {
  name = name.toLowerCase();
  method = method.toLowerCase();
  if (!SIV_SCOPE._onQueue[name]) SIV_SCOPE._onQueue[name] = {}
  if (!SIV_SCOPE._onQueue[name][method]) SIV_SCOPE._onQueue[name][method] = []
  SIV_SCOPE._onQueue[name][method].push(func);
}


/////////////
// API END //
/////////////

/**
 * Builds the notetags, calls the plugin graph, build the plugins, eventuall calls onInit
 */
SIV_SCOPE._wrapper.data_manager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!SIV_SCOPE._wrapper.data_manager_isDatabaseLoaded.apply(this, arguments)) return false;
  if (SIV_SCOPE._data.databaseHasLoaded) return true;

  SIV_SCOPE._buildNotetagDictionary('actors', $dataActors)
  SIV_SCOPE._buildNotetagDictionary('armors', $dataArmors)
  SIV_SCOPE._buildNotetagDictionary('classes', $dataClasses)
  SIV_SCOPE._buildNotetagDictionary('commonEvents', $dataCommonEvents)
  SIV_SCOPE._buildNotetagDictionary('enemies', $dataEnemies)
  SIV_SCOPE._buildNotetagDictionary('skills', $dataSkills)
  SIV_SCOPE._buildNotetagDictionary('states', $dataStates)
  SIV_SCOPE._buildNotetagDictionary('weapons', $dataWeapons)

  var pluginList = SIV_SCOPE._dependencyGraph.overallOrder();
  for (var i = 0; i < pluginList.length; i++) {
    SIV_SCOPE._plugins[pluginList[i]].plugin.call(window)
  }

  SIV_SCOPE._databaseHasLoaded()
  return true;
};

/**
 * part of isDatabaseLoaded
 */
SIV_SCOPE._buildNotetagDictionary = function(type, data) {
  SIV_SCOPE._data.notetagDictionary[type] = {}
  if (type == 'commonEvents') {
    for (var i = 1; i < data.length; i++) {
      var notes = SIV_SCOPE._parseEventPageNotes(data[i], []);
      SIV_SCOPE._data.notetagDictionary[type][i] = {notes: notes}
    }
  } else {
    for (var i = 1; i < data.length; i++) {
      SIV_SCOPE._data.notetagDictionary[type][i] = {
        notes: SIV_SCOPE._parseNoteTag(data[i].note)
      }
    }
  }
}
SIV_SCOPE._parseEventPageNotes = function(page, notes) {
  for (var i = 0; i < page.list.length; i++) {
    if (page.list[i].code == 108 || page.list[i].code == 408) {
      for (var ii = 0; ii < page.list[i].parameters.length; ii++) {
        notes = notes.concat(SIV_SCOPE._parseNoteTag(page.list[i].parameters[ii]))
      }
    }
  }
  return notes;
}

SIV_SCOPE._parseNoteTag = function(notes) {
  var match, results = [], headerEndStrip = 2;
  if (notes && notes.length) match = notes.match(/<(?:(?!\/>).|\n)+\/>/g)
  if (!match || !match.length) return results;
  for (var i = 0; i < match.length; i++) {
    var note = {}
    , children = match[i].split('\n') //break by line, tags without children will return 1
    , header = children.shift(); //this is the acutal tag

    if (children.length > 0) {
      headerEndStrip = 1
      children.pop() //throw out the last line as its only the close tag
      note.children = children
    }
    //remove `< & >` and break up the tag and arguments
    header = header.trim().substring(1, header.length-headerEndStrip).split(' ').filter(function(s) { return s.length })
    note.tag = header.shift()
    note.args = header
    results.push(note)
  }
  return results;
}

/**
 * part of isDatabaseLoaded
 */
SIV_SCOPE._databaseHasLoaded = function() {
  SIV_SCOPE._data.databaseHasLoaded = true;
  if (SIV_SCOPE._onQueue.onInit.length) {
    for (var i = 0; i < SIV_SCOPE._onQueue.onInit.length; i++) {
      SIV_SCOPE._onQueue.onInit[i].apply(this, arguments)
    }
  }
}

/**
 * mostly safe mutator, this will not give plugins game core save data. It's
 * still risky as they can put too much into it. Use with discretion please!
 */
SIV_SCOPE._wrapper.data_manager_make_save_contents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
  var contents = SIV_SCOPE._wrapper.data_manager_make_save_contents.apply(this, arguments)
  if (!contents['SIV_SAVE_DATA']) contents['SIV_SAVE_DATA'] = {}
  for (var i = 0; i < SIV_SCOPE._makeSaveContents.length; i++) {
    SIV_SCOPE._makeSaveContents[i].call(this, contents['SIV_SAVE_DATA'])
  }
  return contents;
}

/**
 * Much safer the makeSaveContents, this just loads in the SIV_SAVE_DATA scope
 */
SIV_SCOPE._wrapper.data_manager_extract_save_contents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function() {
 SIV_SCOPE._wrapper.data_manager_extract_save_contents.apply(this, arguments)
 for (var i = 0; i < SIV_SCOPE._extractSaveContents.length; i++) {
   SIV_SCOPE._extractSaveContents[i].call(this, arguments[0]['SIV_SAVE_DATA'])
 }
}


/**
 * the On Scene Event runners
 */

SIV_SCOPE._wrapper.scene_base_create = Scene_Base.prototype.create;
Scene_Base.prototype.create = function() {
  SIV_SCOPE._wrapper.scene_base_create.apply(this, arguments)
  if (this.constructor.name === Scene_Map.name) { //This is a horrable lie! (use pre player transfer)
    SIV_SCOPE._data.currentMapInstance = this;
    return;
  }
  else SIV_SCOPE._runOnScene.call(this, arguments, this.constructor.name, 'create')
}

SIV_SCOPE._wrapper.scene_base_start = Scene_Base.prototype.start;
Scene_Base.prototype.start = function() {
  SIV_SCOPE._wrapper.scene_base_start.apply(this, arguments)
  if (this.constructor.name === Scene_Map.name) SIV_SCOPE._runOnMap.call(this, 'start')
  else SIV_SCOPE._runOnScene.call(this, arguments, this.constructor.name, 'start')
}

SIV_SCOPE._wrapper.scene_base_update = Scene_Base.prototype.update;
Scene_Base.prototype.update = function() {
  SIV_SCOPE._wrapper.scene_base_update.apply(this, arguments)
  if (this.constructor.name === Scene_Map.name) SIV_SCOPE._runOnMap.call(this, 'update')
  else SIV_SCOPE._runOnScene.call(this, arguments, this.constructor.name, 'update')
}

SIV_SCOPE._wrapper.scene_base_terminate = Scene_Base.prototype.terminate;
Scene_Base.prototype.terminate = function() {
  if (this.constructor.name === Scene_Map.name) SIV_SCOPE._runOnMap.call(this, 'terminate')
  else SIV_SCOPE._runOnScene.call(this, arguments, this.constructor.name, 'terminate')
  SIV_SCOPE._wrapper.scene_base_terminate.apply(this, arguments)
}

//fake out on map create queue to make sure the map data is actually loaded
SIV_SCOPE._wrapper.game_player_perform_transfer = Game_Player.prototype.performTransfer;
Game_Player.prototype.performTransfer = function() {
  SIV_SCOPE._runOnMap.call(SIV_SCOPE._data.currentMapInstance, 'create')
  SIV_SCOPE._wrapper.game_player_perform_transfer.apply(this, arguments)
}

SIV_SCOPE._wrapper._scene_map_create_display_objects = Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects = function() {
  SIV_SCOPE._wrapper._scene_map_create_display_objects.apply(this, arguments)
  SIV_SCOPE._runOnMap.call(this, 'addObjects')
}

SIV_SCOPE._runOnScene = function(args, name, event) {
  name = name.toLowerCase()
  event = event.toLowerCase()
  if (SIV_SCOPE._onQueue[name] && SIV_SCOPE._onQueue[name][event]) {
    for (var i = 0; i < SIV_SCOPE._onQueue[name][event].length; i++) {
      SIV_SCOPE._onQueue[name][event][i].apply(this, args)
    }
  }
}

SIV_SCOPE._runOnMap = function(event) {
  event = event.toLowerCase()
  if (SIV_SCOPE._onQueue.scene_map && SIV_SCOPE._onQueue.scene_map[event]) {
    for (var i = 0; i < SIV_SCOPE._onQueue.scene_map[event].length; i++) {
      var mapId, oldMapId;
      if ($gamePlayer.isTransferring()) {
        mapId = $gamePlayer.newMapId();
        oldMapId = $gameMap.mapId();
      } else mapId = $gameMap.mapId();
      SIV_SCOPE._onQueue.scene_map[event][i].call(this, mapId, oldMapId)
    }
  }
}



//we should use onChange but it does not have the index or the value...
SIV_SCOPE._wrapper.game_variables_set_value = Game_Variables.prototype.setValue
Game_Variables.prototype.setValue = function(index) {
  SIV_SCOPE._wrapper.game_variables_set_value.apply(this, arguments);
  if (SIV_SCOPE._onQueue.variableChange[index]) {
    for (var i = 0; i < SIV_SCOPE._onQueue.variableChange[index].length; i++) {
      SIV_SCOPE._onQueue.variableChange[index][i].apply(this, arguments);
    }
  }
}

//117 == call common event from other event (-_- bad naming convention IMO)
SIV_SCOPE._wrapper.game_interpreter_command117 = Game_Interpreter.prototype.command117;
Game_Interpreter.prototype.command117 = function() {
  var commonEventId = this._params[0]
  , result = SIV_SCOPE._wrapper.game_interpreter_command117.apply(this, arguments);
  if (this._childInterpreter) this._childInterpreter._commonEventId = commonEventId;
  return result
};

Game_Interpreter.prototype.getOriginEventId = function() {
  var isCommonEvent = (this._depth > 0)
  return {
    id: (isCommonEvent) ? this._commonEventId : this._eventId,
    commonEvent: isCommonEvent
  }
}


/**
 * BEHOLD! The Dictionary Function Switch! Lay your worship at the feet of the
 * JS Gods for this gift that they have given us!
 *
 * This will fire off any functions registered by their command names. This skips
 * all the ifs and switch logic. If its registered it will run, if nothing is registered
 * then nothing happens. Instant wonderful perfect switch. ( I am kinda a fan :P )
 *
 * !!!Warning!!! Last write wins apply here. Conflicting commands will only fire
 * the last one defined.
 *
 */
SIV_SCOPE._wrapper._game_interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command) {
	SIV_SCOPE._wrapper._game_interpreter_pluginCommand.apply(this, arguments);
  if (SIV_SCOPE._pluginCommands[command]) SIV_SCOPE._pluginCommands[command].apply(this, arguments);
};




/**
 * If we have not laoded the map notes yet do so now.
 * This is also where we should get the map event notes.
 */
SIV_SCOPE.onSceneEvent(Scene_Map, 'create', function(mapId, oldMapId) {
  if (SIV_SCOPE._preloadMapNotes) return;
  if ($dataMap && !SIV_SCOPE._data.notetagDictionary['maps'][mapId]) {
    SIV_SCOPE._data.notetagDictionary['maps'][mapId] = {
      notes: SIV_SCOPE._parseNoteTag($dataMap.note)
    }
    SIV_SCOPE._data.notetagDictionary['mapEvents'][mapId] = {}
    for (var eventId = 1; eventId < $dataMap.events.length; eventId++) {
      SIV_SCOPE._data.notetagDictionary['mapEvents'][mapId][eventId] = {}
      var notes = []
      for (var pageIndex = 0; pageIndex < $dataMap.events[eventId].pages.length; pageIndex++) {
        notes = SIV_SCOPE._parseEventPageNotes($dataMap.events[eventId].pages[pageIndex], notes)
      }
      SIV_SCOPE._data.notetagDictionary['mapEvents'][mapId][eventId] = {
        notes: notes
      }
    }
  }
})

/**
 * runs the onFrame queue
 */
 SIV_SCOPE._wrapper.scene_manager_update = SceneManager.update;
 SceneManager.update = function() {
   SIV_SCOPE._wrapper.scene_manager_update.call(this);
   if (SIV_SCOPE._data.databaseHasLoaded && SIV_SCOPE._onQueue.onFrame.length) {
     for (var i = 0; i < SIV_SCOPE._onQueue.onFrame.length; i++) {
       SIV_SCOPE._onQueue.onFrame[i].apply(this, arguments)
     }
   }
 }

 function Window_Smart_Text() {
   Window_Smart_Text.prototype.initialize.apply(this, arguments)
 }
 Window_Smart_Text.prototype = Object.create(Window_Base.prototype);

 Window_Smart_Text.prototype.initialize = function(settings) {
   //It seems there must be a bug with MV 1.5 window initialize.
   //It does not let you grow the size of your window content (may I am missing something?)
   //Eather way setting it to full screen size does the trick.
   //We then resize with refresh so the correct window size is always displayed.
   Window_Base.prototype.initialize.call(this, 0, 0, Graphics.boxWidth, Graphics.boxHeight);
   this._defaultSettings = Object.assign({}, {
     positionX:   50,
     positionY:   50,
     fontSize:    20,
     padding:     18,
     textSpacing: 4,
     visible: true
   }, settings);
   this._textRows = []
   this.contents.fontSize = settings.fontSize;
   this.padding = settings.padding;
   this.visible = settings.visible;
   this.refresh()
 }

 Window_Smart_Text.prototype.refresh = function() {
   if (this.visible) {
     this.contents.clear();
     this._textRows = [];
     if (this.addContents) this.addContents();
     var totalTextWidth = 0, totalTextHeight = 0;

     //calculate needed settings
     totalTextHeight = (this.contents.fontSize + this._defaultSettings.textSpacing)
       * (this._textRows.length) - + this._defaultSettings.textSpacing;
     for (var i = 0; i < this._textRows.length; i++) {
       totalTextWidth = Math.max( totalTextWidth, this.contents.measureTextWidth(this._textRows[i]));
     }


     //acutally draw contents
     for (var i = 0; i < this._textRows.length; i++) {
       this.contents.drawText(this._textRows[i], 0, (this.contents.fontSize + this._defaultSettings.textSpacing) * i, totalTextWidth, this.contents.fontSize, 'center');
     }

     totalTextWidth += this.padding * 2
     totalTextHeight += this.padding * 2
     this.move(this.getPercentX(this._defaultSettings.positionX, totalTextWidth)
      , this.getPercentY(this._defaultSettings.positionY, totalTextHeight)
      , totalTextWidth, totalTextHeight)
   }
 };

 Window_Smart_Text.prototype.addText = function(text) {
     this._textRows.push(text)
 }

 //the mockup of our smart window
 Window_Smart_Text.prototype.getPercentX = function(target, offset) {
   return this._percent(Graphics.boxWidth, target, offset);
 }
 Window_Smart_Text.prototype.getPercentY = function(target, offset) {
   return this._percent(Graphics.boxHeight, target, offset);
 }
 Window_Smart_Text.prototype._percent = function(fullSize, target, offset) {
   offset = offset || 0;
   var pix = (fullSize - offset) * (target / 100);
   if (pix < 0) return 0;
   return pix;
 }

////////////////////////////////////////////////////////////////////////////////////
// JS EXTENTIONS & External code that makes me wish I could load npm dependances. //
// I will try to keep this to a minimum.                                          //
////////////////////////////////////////////////////////////////////////////////////
 Math.fmod = function (a,b) {
   //floor mod. This lets us match the c++ webkit style of handling timestamps
   return Number((a - (Math.floor(a / b) * b)).toPrecision(8));
 };

/**
 * A simple dependency graph
 * https://github.com/jriecken/dependency-graph
 * https://github.com/jriecken/dependency-graph/blob/master/LICENSE
 */
!function(){function n(n,e,i){var t=[],o={};return function s(d){o[d]=!0,t.push(d),n[d].forEach(function(n){if(o[n]){if(t.indexOf(n)>=0)throw t.push(n),new Error("Dependency Cycle Found: "+t.join(" -> "))}else s(n)}),t.pop(),e&&0!==n[d].length||-1!==i.indexOf(d)||i.push(d)}}var e=function(){this.nodes={},this.outgoingEdges={},this.incomingEdges={}};e.prototype={addNode:function(n,e){this.hasNode(n)||(2===arguments.length?this.nodes[n]=e:this.nodes[n]=n,this.outgoingEdges[n]=[],this.incomingEdges[n]=[])},removeNode:function(n){this.hasNode(n)&&(delete this.nodes[n],delete this.outgoingEdges[n],delete this.incomingEdges[n],[this.incomingEdges,this.outgoingEdges].forEach(function(e){Object.keys(e).forEach(function(i){var t=e[i].indexOf(n);t>=0&&e[i].splice(t,1)},this)}))},hasNode:function(n){return this.nodes.hasOwnProperty(n)},getNodeData:function(n){if(this.hasNode(n))return this.nodes[n];throw new Error("Plugin does not exist: "+n)},setNodeData:function(n,e){if(!this.hasNode(n))throw new Error("Plugin does not exist: "+n);this.nodes[n]=e},addDependency:function(n,e){if(!this.hasNode(n))throw new Error("Plugin does not exist: "+n);if(!this.hasNode(e))throw new Error("Plugin does not exist: "+e);return-1===this.outgoingEdges[n].indexOf(e)&&this.outgoingEdges[n].push(e),-1===this.incomingEdges[e].indexOf(n)&&this.incomingEdges[e].push(n),!0},removeDependency:function(n,e){var i;this.hasNode(n)&&(i=this.outgoingEdges[n].indexOf(e))>=0&&this.outgoingEdges[n].splice(i,1),this.hasNode(e)&&(i=this.incomingEdges[e].indexOf(n))>=0&&this.incomingEdges[e].splice(i,1)},dependenciesOf:function(e,i){if(this.hasNode(e)){var t=[];n(this.outgoingEdges,i,t)(e);var o=t.indexOf(e);return o>=0&&t.splice(o,1),t}throw new Error("Plugin does not exist: "+e)},dependantsOf:function(e,i){if(this.hasNode(e)){var t=[];n(this.incomingEdges,i,t)(e);var o=t.indexOf(e);return o>=0&&t.splice(o,1),t}throw new Error("Plugin does not exist: "+e)},overallOrder:function(e){var i=this,t=[],o=Object.keys(this.nodes);if(0===o.length)return t;var s=n(this.outgoingEdges,!1,[]);o.forEach(function(n){s(n)});var d=n(this.outgoingEdges,e,t);return o.filter(function(n){return 0===i.incomingEdges[n].length}).forEach(function(n){d(n)}),t}},window.DepGraph=e}();
SIV_SCOPE._dependencyGraph = new DepGraph();

// going old school with some mustache.js
// https://github.com/janl/mustache.js
// https://github.com/janl/mustache.js/blob/master/LICENSE
!function(b,c){"object"==typeof exports&&exports&&"string"!=typeof exports.nodeName?c(exports):"function"==typeof define&&define.amd?define(["exports"],c):(b.Mustache={},c(b.Mustache))}(this,function(b){function e(a){return"function"==typeof a}function f(a){return d(a)?"array":typeof a}function g(a){return a.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function h(a,b){return null!=a&&"object"==typeof a&&b in a}function j(a,b){return i.call(a,b)}function l(a){return!j(k,a)}function n(a){return String(a).replace(/[&<>"'`=\/]/g,function(b){return m[b]})}function t(a,c){function k(){if(i&&!j)for(;h.length;)delete f[h.pop()];else h=[];i=!1,j=!1}function x(a){if("string"==typeof a&&(a=a.split(p,2)),!d(a)||2!==a.length)throw new Error("Invalid tags: "+a);m=new RegExp(g(a[0])+"\\s*"),n=new RegExp("\\s*"+g(a[1])),t=new RegExp("\\s*"+g("}"+a[1]))}if(!a)return[];var m,n,t,e=[],f=[],h=[],i=!1,j=!1;x(c||b.tags);for(var z,A,B,C,D,E,y=new w(a);!y.eos();){if(z=y.pos,B=y.scanUntil(m))for(var F=0,G=B.length;F<G;++F)C=B.charAt(F),l(C)?h.push(f.length):j=!0,f.push(["text",C,z,z+1]),z+=1,"\n"===C&&k();if(!y.scan(m))break;if(i=!0,A=y.scan(s)||"name",y.scan(o),"="===A?(B=y.scanUntil(q),y.scan(q),y.scanUntil(n)):"{"===A?(B=y.scanUntil(t),y.scan(r),y.scanUntil(n),A="&"):B=y.scanUntil(n),!y.scan(n))throw new Error("Unclosed tag at "+y.pos);if(D=[A,B,z,y.pos],f.push(D),"#"===A||"^"===A)e.push(D);else if("/"===A){if(!(E=e.pop()))throw new Error('Unopened section "'+B+'" at '+z);if(E[1]!==B)throw new Error('Unclosed section "'+E[1]+'" at '+z)}else"name"===A||"{"===A||"&"===A?j=!0:"="===A&&x(B)}if(E=e.pop())throw new Error('Unclosed section "'+E[1]+'" at '+y.pos);return v(u(f))}function u(a){for(var c,d,b=[],e=0,f=a.length;e<f;++e)(c=a[e])&&("text"===c[0]&&d&&"text"===d[0]?(d[1]+=c[1],d[3]=c[3]):(b.push(c),d=c));return b}function v(a){for(var e,f,b=[],c=b,d=[],g=0,h=a.length;g<h;++g)switch(e=a[g],e[0]){case"#":case"^":c.push(e),d.push(e),c=e[4]=[];break;case"/":f=d.pop(),f[5]=e[2],c=d.length>0?d[d.length-1][4]:b;break;default:c.push(e)}return b}function w(a){this.string=a,this.tail=a,this.pos=0}function x(a,b){this.view=a,this.cache={".":this.view},this.parent=b}function y(){this.cache={}}var c=Object.prototype.toString,d=Array.isArray||function(b){return"[object Array]"===c.call(b)},i=RegExp.prototype.test,k=/\S/,m={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"},o=/\s*/,p=/\s+/,q=/\s*=/,r=/\s*\}/,s=/#|\^|\/|>|\{|&|=|!/;w.prototype.eos=function(){return""===this.tail},w.prototype.scan=function(b){var c=this.tail.match(b);if(!c||0!==c.index)return"";var d=c[0];return this.tail=this.tail.substring(d.length),this.pos+=d.length,d},w.prototype.scanUntil=function(b){var d,c=this.tail.search(b);switch(c){case-1:d=this.tail,this.tail="";break;case 0:d="";break;default:d=this.tail.substring(0,c),this.tail=this.tail.substring(c)}return this.pos+=d.length,d},x.prototype.push=function(b){return new x(b,this)},x.prototype.lookup=function(b){var d,c=this.cache;if(c.hasOwnProperty(b))d=c[b];else{for(var g,i,f=this,j=!1;f;){if(b.indexOf(".")>0)for(d=f.view,g=b.split("."),i=0;null!=d&&i<g.length;)i===g.length-1&&(j=h(d,g[i])),d=d[g[i++]];else d=f.view[b],j=h(f.view,b);if(j)break;f=f.parent}c[b]=d}return e(d)&&(d=d.call(this.view)),d},y.prototype.clearCache=function(){this.cache={}},y.prototype.parse=function(b,c){var d=this.cache,e=d[b];return null==e&&(e=d[b]=t(b,c)),e},y.prototype.render=function(b,c,d){var e=this.parse(b),f=c instanceof x?c:new x(c);return this.renderTokens(e,f,d,b)},y.prototype.renderTokens=function(b,c,d,e){for(var g,h,i,f="",j=0,k=b.length;j<k;++j)i=void 0,g=b[j],h=g[0],"#"===h?i=this.renderSection(g,c,d,e):"^"===h?i=this.renderInverted(g,c,d,e):">"===h?i=this.renderPartial(g,c,d,e):"&"===h?i=this.unescapedValue(g,c):"name"===h?i=this.escapedValue(g,c):"text"===h&&(i=this.rawValue(g)),void 0!==i&&(f+=i);return f},y.prototype.renderSection=function(b,c,f,g){function k(a){return h.render(a,c,f)}var h=this,i="",j=c.lookup(b[1]);if(j){if(d(j))for(var l=0,m=j.length;l<m;++l)i+=this.renderTokens(b[4],c.push(j[l]),f,g);else if("object"==typeof j||"string"==typeof j||"number"==typeof j)i+=this.renderTokens(b[4],c.push(j),f,g);else if(e(j)){if("string"!=typeof g)throw new Error("Cannot use higher-order sections without the original template");j=j.call(c.view,g.slice(b[3],b[5]),k),null!=j&&(i+=j)}else i+=this.renderTokens(b[4],c,f,g);return i}},y.prototype.renderInverted=function(b,c,e,f){var g=c.lookup(b[1]);if(!g||d(g)&&0===g.length)return this.renderTokens(b[4],c,e,f)},y.prototype.renderPartial=function(b,c,d){if(d){var f=e(d)?d(b[1]):d[b[1]];return null!=f?this.renderTokens(this.parse(f),c,d,f):void 0}},y.prototype.unescapedValue=function(b,c){var d=c.lookup(b[1]);if(null!=d)return d},y.prototype.escapedValue=function(c,d){var e=d.lookup(c[1]);if(null!=e)return b.escape(e)},y.prototype.rawValue=function(b){return b[1]},b.name="mustache.js",b.version="2.3.0",b.tags=["{{","}}"];var z=new y;return b.clearCache=function(){return z.clearCache()},b.parse=function(b,c){return z.parse(b,c)},b.render=function(b,c,d){if("string"!=typeof b)throw new TypeError('Invalid template! Template should be a "string" but "'+f(b)+'" was given as the first argument for mustache#render(template, view, partials)');return z.render(b,c,d)},b.to_html=function(c,d,f,g){var h=b.render(c,d,f);if(!e(g))return h;g(h)},b.escape=n,b.Scanner=w,b.Context=x,b.Writer=y,b});
