/*:
  * @plugindesc (v0.2.0) Makes building and using plugins easier. Comes with a dependency manager.
  *
  * Released under MIT license, https://github.com/Sivli-Embir/rpg_maker_plugins/blob/master/LICENSE
  *
  * @author Sivli Embir
  *
  * @param ---Variables---
  *
  * @param Preload Map Notes
  * @parent ---Variables---
  * @desc Do more work on init but save on per map load. Check console for total time taken. (~2milliseconds each)
  * @type boolean
  * @default false
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
  * avoidable bugs. Amonge other things it has a dependency manager, which means
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
  * SIV_SCOPE.hasNotetag(object): check if game object has matching notetags
  *
  * SIV_SCOPE.registerPluginCommand (name, function): will run the funciton on
  * plugin command call.
  *
  * ===ON EVENTS===
  * SIV_SCOPE.onInit (function): DB, Plutins, and note tags are laoded.
  * SIV_SCOPE.onFrame (function): best to not use this... (if you must use scene
  * update instead)
  * SIV_SCOPE.onSceneEvent: (sceneType, eventName, function):
  *   sceneType: 'title', 'map', 'menu', 'item', ext...
  *   eventName: 'create', 'start', 'update', 'terminate', (map: 'addObjects')
  *
  * ============================================================================
  * Change Log
  * ============================================================================
  *
  * Version 0.0.0:
  * - Pending v1
*/

/////////////////////////////////////////////////////////////////////////////////
// Some good house keeping given we don't have nice js2016+ import scoping.    //
// I use SIV_SCOPE to keep from bleeding into something else and hopefully not //
// conflicting with other plugins.                                             //
/////////////////////////////////////////////////////////////////////////////////

var SIV_SCOPE = {
  _wrapper: {}, //global holder for PRG Maker wraps.
  _plugins: {}, //all the plugins that are registered.
  _data: { //where I will store all SIV_SCOPE global variables.
    databaseHasLoaded: false, //a way to prevent queues from firing before init.
    notetagDictionary: { //A list of ALL the notetags in the game
      maps: {} //maps require special treatment.
    }
  },
  _pluginCommands: {}, //This is where I store plugin functions.
  _onQueue: { //all the on[state] queue functions.
    onInit: [],
    onFrame: []
  },
  parameters: PluginManager.parameters('Siv_Plugin_Sanity')
};

SIV_SCOPE._preloadMapNotes = SIV_SCOPE.parameters['Preload Map Notes'] === 'true';
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

  if (definition.requires) {
    SIV_SCOPE._dependencyGraph.add(definition.name, {after: definition.requires})
  } else {
    SIV_SCOPE._dependencyGraph.add(definition.name)
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

// TODO: onNewGame
// TODO: onLoadGame
// TODO: onStartGame

SIV_SCOPE.onSceneEvent = function(scene, event, func) {
  scene = "Scene_" + scene.charAt(0).toUpperCase() + scene.substr(1).toLowerCase();
  event = event.toLowerCase();
  if (!SIV_SCOPE._onQueue[scene]) SIV_SCOPE._onQueue[scene] = {}
  if (!SIV_SCOPE._onQueue[scene][event]) SIV_SCOPE._onQueue[scene][event] = []
  SIV_SCOPE._onQueue[scene][event].push(func);
}


/**
 * Find out if a given game object has a notetag. This takes a query and returns
 * a truthy or false answer. I say truthy because it returns the notetags in an
 * array format, but an array is the same as true if you want to use an if statement.
 *
 * The query shoud have:
 * the (type) of object you have - currently: "actors", "armors", 'classes',
 * 'commonEvents', 'enemies', 'skills', 'states', 'weapons'
 * the (id) of the object, the index or number in the database
 * the (match) string. This can ether be an exact string match or regex query.
 *
 * @param  {Object} obj must contain a type {String} and an id {String} and
 * a match {String or RegExp}.
 * @return {Array or False} It will return an array with 1 or matchs or false.
 */
SIV_SCOPE.hasNotetag = function(obj) {
  var notes = ((SIV_SCOPE._data.notetagDictionary[obj.type] || {})[obj.id] || {}).notes
  , results = [], found;
  if (!notes || !notes.length) return false;
  for (var i = 0; i < notes.length; i++) {
    found = notes[i].match(obj.match);
    if (found) results.push(notes[i])
  }
  return results.length ? results : false;
}

/**
 * This lets you run plugin commands is a very fast efficent way.
 *
 * Warning: Last write wins case, the last plugin to use the same command name
 * will be the only one to use the command. Breaking change from core!
 *
 * TODO: consider building in a namespace backend option, or front end even...
 * but how??? The user will only say the original name, how do we get intent?
 * Can we run all matchs? Should we? IMO no but...
 *
 * @param  {String} command A globally unique name for your command
 * @param  {Function} func  A standard function that will preform whatever
 * you want your plugin command to do.
 * @return {Null}
 */
SIV_SCOPE.registerPluginCommand = function(command, func) {
  if (command && func) SIV_SCOPE._pluginCommands[command] = func;
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

  if (SIV_SCOPE._preloadMapNotes) {
    var timestamp = (new Date()).getTime()
    //HAHAHA YOU FOOLS we are in node. Fear my power!
    // TODO: Ok for real, find a better way to do this. Maybe asyc stream it?
    for (var i = 1; i < $dataMapInfos.length; i++) {
      try {
        SIV_SCOPE._data.notetagDictionary['maps'][$dataMapInfos[i].id] = {
          notes: require('./data/Map%1.json'.format($dataMapInfos[i].id.padZero(3))).note.match(/<[^\r\n]+?>/g)
        }
      } catch (e) { console.log('found some bad map data'); }
    }
    console.log('Preload Map Notes added total milliseconds lag of: ', (new Date()).getTime() - timestamp)
  }

  SIV_SCOPE._buildNotetagDictionary('actors', $dataActors)
  SIV_SCOPE._buildNotetagDictionary('armors', $dataArmors)
  SIV_SCOPE._buildNotetagDictionary('classes', $dataClasses)
  SIV_SCOPE._buildNotetagDictionary('commonEvents', $dataCommonEvents)
  SIV_SCOPE._buildNotetagDictionary('enemies', $dataEnemies)
  SIV_SCOPE._buildNotetagDictionary('skills', $dataSkills)
  SIV_SCOPE._buildNotetagDictionary('states', $dataStates)
  SIV_SCOPE._buildNotetagDictionary('weapons', $dataWeapons)

  var pluginList = SIV_SCOPE._dependencyGraph.nodes;
  for (var i = 0; i < pluginList.length; i++) {
    try { SIV_SCOPE._plugins[pluginList[i]].plugin.call(window) }
    catch (e) { console.error(e) }
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
      var notes = [];
      for (var ii = 0; ii < data[i].list.length; ii++) {
        if (data[i].list[ii].code == 108) {
          for (var iii = 0; iii < data[i].list[ii].parameters.length; iii++) {
            notes.push(data[i].list[ii].parameters[iii])
          }
        }
      }
      SIV_SCOPE._data.notetagDictionary[type][i] = {notes: notes}
    }
  } else {
    for (var i = 1; i < data.length; i++) {
      SIV_SCOPE._data.notetagDictionary[type][i] = {
        notes: data[i].note.match(/<[^\r\n]+?>/g)
      }
    }
  }
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
 * the On Scene Event runners
 */
SIV_SCOPE._wrapper.scene_base_create = Scene_Base.prototype.create;
Scene_Base.prototype.create = function() {
  SIV_SCOPE._wrapper.scene_base_create.apply(this, arguments)
  if (this.constructor.name === 'Scene_Map') { //This is a horrable lie! (use pre player transfer)
    SIV_SCOPE._data.currentMapInstance = this;
    return;
  }
  else SIV_SCOPE._runOnScene.call(this, arguments, this.constructor.name, 'create')
}

SIV_SCOPE._wrapper.scene_base_start = Scene_Base.prototype.start;
Scene_Base.prototype.start = function() {
  console.log(this.constructor.name);
  SIV_SCOPE._wrapper.scene_base_start.apply(this, arguments)
  if (this.constructor.name === 'Scene_Map') SIV_SCOPE._runOnMap.call(this, 'start')
  else SIV_SCOPE._runOnScene.call(this, arguments, this.constructor.name, 'start')
}

SIV_SCOPE._wrapper.scene_base_update = Scene_Base.prototype.update;
Scene_Base.prototype.update = function() {
  SIV_SCOPE._wrapper.scene_base_update.apply(this, arguments)
  if (this.constructor.name === 'Scene_Map') SIV_SCOPE._runOnMap.call(this, 'update')
  else SIV_SCOPE._runOnScene.call(this, arguments, this.constructor.name, 'update')
}

SIV_SCOPE._wrapper.scene_base_terminate = Scene_Base.prototype.terminate;
Scene_Base.prototype.terminate = function() {
  if (this.constructor.name === 'Scene_Map') SIV_SCOPE._runOnMap.call(this, 'terminate')
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
  SIV_SCOPE._runOnMap.call(this, 'addobjects')
}

SIV_SCOPE._runOnScene = function(args, name, event) {
  if (SIV_SCOPE._onQueue[name] && SIV_SCOPE._onQueue[name][event]) {
    for (var i = 0; i < SIV_SCOPE._onQueue[name][event].length; i++) {
      SIV_SCOPE._onQueue[this.constructor.name][event][i].apply(this, args)
    }
  }
}

SIV_SCOPE._runOnMap = function(event) {
  if (SIV_SCOPE._onQueue.Scene_Map && SIV_SCOPE._onQueue.Scene_Map[event]) {
    for (var i = 0; i < SIV_SCOPE._onQueue.Scene_Map[event].length; i++) {
      var mapId, oldMapId;
      if ($gamePlayer.isTransferring()) {
        mapId = $gamePlayer.newMapId();
        oldMapId = $gameMap.mapId();
      } else mapId = $gameMap.mapId();
      SIV_SCOPE._onQueue.Scene_Map[event][i].call(this, mapId, oldMapId)
    }
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
 */
SIV_SCOPE.onSceneEvent('map', 'create', function(mapId, oldMapId) {
  if (SIV_SCOPE._preloadMapNotes) return;
  if ($dataMap && !SIV_SCOPE._data.notetagDictionary['maps'][mapId]) {
    SIV_SCOPE._data.notetagDictionary['maps'][mapId] = {
      notes: ($dataMap.note || '').match(/<[^\r\n]+?>/g)
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


////////////////////////////////////////////////////////////////////////////////////
// JS EXTENTIONS & External code that makes me wish I could load npm dependances. //
// I will try to keep this to a minimum.                                          //
////////////////////////////////////////////////////////////////////////////////////
 Math.fmod = function (a,b) {
   //floor mod. This lets us match the c++ webkit style of handling timestamps
   return Number((a - (Math.floor(a / b) * b)).toPrecision(8));
 };


// TODO: REWRITE these code bits so they take less room and focus just on what we need.

/*
 * A partial of Hoek
 * https://github.com/hapijs/Hoek
 * https://raw.githubusercontent.com/hapijs/Hoek/master/LICENSE
 */
HOEK_NOT = {}
HOEK_NOT.assert = function (condition /*, msg1, msg2, msg3 */) {
    if (condition) {
        return;
    }
    if (arguments.length === 2 && arguments[1] instanceof Error) {
        throw arguments[1];
    }
    var msgs = [];
    for (var i = 1; i < arguments.length; ++i) {
        if (arguments[i] !== '') {
            msgs.push(arguments[i]);            // Avoids Array.slice arguments leak, allowing for V8 optimizations
        }
    }
    msgs = msgs.map(function(msg) {
        return typeof msg === 'string' ? msg : msg instanceof Error ? msg.message : JSON.stringify(msg);
    });
    throw new Error(msgs.join(' ') || 'Unknown error');
};
HOEK_NOT.shallow = function (source) {
    var target = {};
    var keys = Object.keys(source);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        target[key] = source[key];
    }
    return target;
};

/*
 * A modified version of and wrapped Topo
 * https://github.com/hapijs/topo
 * https://raw.githubusercontent.com/hapijs/topo/master/LICENSE
 */
SIV_SCOPE._dependencyGraph = (function() {
  var internals = {};
  internals.Topo = function () {

      this._items = [];
      this.nodes = [];
  };
  internals.Topo.prototype.add = function (nodes, options) {
      options = options || {};
      var self = this;

      // Validate rules

      var before = [].concat(options.before || []);
      var after = [].concat(options.after || []);
      var group = options.group || '?';
      var sort = options.sort || 0;                   // Used for merging only

      HOEK_NOT.assert(before.indexOf(group) === -1, 'Item cannot come before itself:', group);
      HOEK_NOT.assert(before.indexOf('?') === -1, 'Item cannot come before unassociated items');
      HOEK_NOT.assert(after.indexOf(group) === -1, 'Item cannot come after itself:', group);
      HOEK_NOT.assert(after.indexOf('?') === -1, 'Item cannot come after unassociated items');

      ([].concat(nodes)).forEach(function (node, i) {

          var item = {
              seq: self._items.length,
              sort,
              before,
              after,
              group,
              node
          };

          self._items.push(item);
      });

      // Insert event

      var error = this._sort();
      HOEK_NOT.assert(!error, 'item', (group !== '?' ? 'added into group ' + group : ''), 'created a dependencies error');

      return this.nodes;
  };


  internals.Topo.prototype.merge = function (others) {

      others = [].concat(others);
      for (var i = 0; i < others.length; ++i) {
          var other = others[i];
          if (other) {
              for (var j = 0; j < other._items.length; ++j) {
                  var item = HOEK_NOT.shallow(other._items[j]);
                  this._items.push(item);
              }
          }
      }

      // Sort items

      this._items.sort(internals.mergeSort);
      for (var i = 0; i < this._items.length; ++i) {
          this._items[i].seq = i;
      }

      var error = this._sort();
      HOEK_NOT.assert(!error, 'merge created a dependencies error');

      return this.nodes;
  };


  internals.mergeSort = function (a, b) {

      return a.sort === b.sort ? 0 : (a.sort < b.sort ? -1 : 1);
  };


  internals.Topo.prototype._sort = function () {
      var self = this;
      // varruct graph

      var graph = {};
      var graphAfters = Object.create(null); // A prototype can bungle lookups w/ false positives
      var groups = Object.create(null);

      for (var i = 0; i < this._items.length; ++i) {
          var item = this._items[i];
          var seq = item.seq;                         // Unique across all items
          var group = item.group;

          // Determine Groups

          groups[group] = groups[group] || [];
          groups[group].push(seq);

          // Build intermediary graph using 'before'

          graph[seq] = item.before;

          // Build second intermediary graph with 'after'

          var after = item.after;
          for (var j = 0; j < after.length; ++j) {
              graphAfters[after[j]] = (graphAfters[after[j]] || []).concat(seq);
          }
      }

      // Expand intermediary graph

      var graphNodes = Object.keys(graph);
      for (var i = 0; i < graphNodes.length; ++i) {
          var node = graphNodes[i];
          var expandedGroups = [];

          var graphNodeItems = Object.keys(graph[node]);
          for (var j = 0; j < graphNodeItems.length; ++j) {
              var group = graph[node][graphNodeItems[j]];
              groups[group] = groups[group] || [];

              for (var k = 0; k < groups[group].length; ++k) {
                  expandedGroups.push(groups[group][k]);
              }
          }
          graph[node] = expandedGroups;
      }

      // Merge intermediary graph using graphAfters into final graph

      var afterNodes = Object.keys(graphAfters);
      for (var i = 0; i < afterNodes.length; ++i) {
          var group = afterNodes[i];

          if (groups[group]) {
              for (var j = 0; j < groups[group].length; ++j) {
                  var node = groups[group][j];
                  graph[node] = graph[node].concat(graphAfters[group]);
              }
          }
      }

      // Compile ancestors

      var children;
      var ancestors = {};
      graphNodes = Object.keys(graph);
      for (var i = 0; i < graphNodes.length; ++i) {
          var node = graphNodes[i];
          children = graph[node];

          for (var j = 0; j < children.length; ++j) {
              ancestors[children[j]] = (ancestors[children[j]] || []).concat(node);
          }
      }

      // Topo sort

      var visited = {};
      var sorted = [];

      for (var i = 0; i < this._items.length; ++i) {          // Really looping thru item.seq values out of order
          var next = i;

          if (ancestors[i]) {
              next = null;
              for (var j = 0; j < this._items.length; ++j) {  // As above, these are item.seq values
                  if (visited[j] === true) {
                      continue;
                  }

                  if (!ancestors[j]) {
                      ancestors[j] = [];
                  }

                  var shouldSeeCount = ancestors[j].length;
                  var seenCount = 0;
                  for (var k = 0; k < shouldSeeCount; ++k) {
                      if (visited[ancestors[j][k]]) {
                          ++seenCount;
                      }
                  }

                  if (seenCount === shouldSeeCount) {
                      next = j;
                      break;
                  }
              }
          }

          if (next !== null) {
              visited[next] = true;
              sorted.push(next);
          }
      }

      if (sorted.length !== this._items.length) {
          return new Error('Invalid dependencies');
      }

      var seqIndex = {};
      for (var i = 0; i < this._items.length; ++i) {
          var item = this._items[i];
          seqIndex[item.seq] = item;
      }

      var sortedNodes = [];
      this._items = sorted.map(function(value) {

          var sortedItem = seqIndex[value];
          sortedNodes.push(sortedItem.node);
          return sortedItem;
      });

      self.nodes = sortedNodes;
  };
  return new internals.Topo();
})()
