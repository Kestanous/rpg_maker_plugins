/**:
  * @plugindesc (v0.0.0) WIP! S
  *
  * @author Sivli Embir
  *
  * @help
  * ============================================================================
  * Documentation
  * ============================================================================
  *
  * ============================================================================
  * Coder Stuff
  * ============================================================================
  *
  * ============================================================================
  * Change Log
  * ============================================================================
  *
  * Version 0.0.0:
  * - Pending
*/

/**
 * Some good house keeping given we don't have nice js2016+ import scoping.
 * I use SIV_SCOPE to keep from bleeding into something else and hopefully not
 * conflicting with other plugins.
 */

var SIV_SCOPE = {
  _wrapper: {}, //global holder for PRG Maker wraps.
  _data: { //where I will store all SIV_SCOPE global variables.
    databaseHasLoaded: false, //a way to prevent queues from firing before init.
    notetagDictionary: { //A list of ALL the notetags in the game
      maps: {} //maps require special treatment.
    }
  },
  _pluginComands: {}, //This is where I store plugin functions.
  _onQueue: { //all the on[state] queue functions.
    onInit: [],
    onFrame: [],
    onMapSetup: []
  }
};

SIV_SCOPE._wrapper.data_manager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!SIV_SCOPE._wrapper.data_manager_isDatabaseLoaded.apply(this, arguments)) return false;
  SIV_SCOPE._buildNotetagDictionary('actors', $dataActors)
  // SIV_SCOPE._buildNotetagDictionary('animations', $dataAnimations)
  SIV_SCOPE._buildNotetagDictionary('armors', $dataArmors)
  SIV_SCOPE._buildNotetagDictionary('classes', $dataClasses)
  SIV_SCOPE._buildNotetagDictionary('commonEvents', $dataCommonEvents)
  SIV_SCOPE._buildNotetagDictionary('enemies', $dataEnemies)
  // SIV_SCOPE._buildNotetagDictionary('map', $dataMap)
  // SIV_SCOPE._buildNotetagDictionary('mapInfos', $dataMapInfos)
  SIV_SCOPE._buildNotetagDictionary('skills', $dataSkills)
  SIV_SCOPE._buildNotetagDictionary('states', $dataStates)
  // SIV_SCOPE._buildNotetagDictionary('system', $dataSystem)
  // SIV_SCOPE._buildNotetagDictionary('tilesets', $dataTilesets)
  // SIV_SCOPE._buildNotetagDictionary('troops', $dataTroops)
  SIV_SCOPE._buildNotetagDictionary('weapons', $dataWeapons)

  SIV_SCOPE._databaseHasLoaded()

  return true;
};


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

SIV_SCOPE._game_map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
  SIV_SCOPE._game_map_setup.apply(this, arguments)
  if ($dataMap && !SIV_SCOPE._data.notetagDictionary['maps'][mapId]) {
    SIV_SCOPE._data.notetagDictionary['maps'][mapId] = {
      notes: ($dataMap.note || '').match(/<[^\r\n]+?>/g)
    }
  }
  if (SIV_SCOPE._onQueue.onMapSetup.length) {
    for (var i = 0; i < SIV_SCOPE._onQueue.onMapSetup.length; i++) {
      SIV_SCOPE._onQueue.onMapSetup[i].apply(this, arguments)
    }
  }
};

/**
 * onInit registation function
 */
SIV_SCOPE.onMapSetup = function(func) {
  SIV_SCOPE._onQueue.onMapSetup.push(func)
}

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
 * Will fire queue functions listening to onInit.
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
 * onInit registation function
 */
SIV_SCOPE.onInit = function(func) {
  SIV_SCOPE._onQueue.onInit.push(func)
}


/**
 * BEHOLD! The Dictionary Function Switch! Lay your worship at the feet of the
 * JS Gods for this gift that have given us!
 *
 * This will fire off any functions registared by their command names. This skips
 * all the ifs and swith logic. If its registared it will run, if nothing is registared
 * then nothing happens. Instant wonderful perfect switch. ( I am kinda a fan :P )
 *
 * !!!Warning!!! Last write wins apply here. Conflicting commands will only fire
 * the last one defined.
 *
 */
SIV_SCOPE._wrapper._game_interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command) {
	SIV_SCOPE._wrapper._game_interpreter_pluginCommand.apply(this, arguments);
  if (SIV_SCOPE._pluginComands[command]) SIV_SCOPE._pluginComands[command].apply(this, arguments);
};


SIV_SCOPE.registerPlugin = function(command, func) {
  if (command && func) SIV_SCOPE._pluginComands[command] = func;
}

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

/**
 * onFrame registation function
 */
 SIV_SCOPE.onFrame = function(func) {
   SIV_SCOPE._onQueue.onFrame.push(func)
 }
