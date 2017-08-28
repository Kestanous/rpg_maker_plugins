/*:
  * @plugindesc (v1)
  * @author Sivli Embir
  *
  * @param TimeStamp Variable
  * @desc What variable should be used to count frames.
  * @type variable
  * @default 0
  *
  * @param --- Default Settings ---
  *
  * @param Start By Default
  * @desc Turns on the plugin.
  * @type boolean
  * @default true
  *
  * @param Never Wait
  * @desc Always track the time, overrides all other wait settings. Use this if you want to track durring menus.
  * @type boolean
  * @default false
  *
  * @param Wait For Events
  * @desc Stop tracking the time for any non paralel events (includeding Dialog).
  * @type boolean
  * @default true
  *
  * @param Wait For Dialog
  * @desc Stop tracking the time specifically for any "Show Message" events.
  * @type boolean
  * @default true
  *
  * @param Wait For Battle
  * @desc Stop tracking the time durring battle.
  * @type boolean
  * @default true
  *
  *
*/

if (!SIV_SCOPE) var SIV_SCOPE = {};
SIV_SCOPE.TIME_STATE = {
  parameters: PluginManager.parameters('Siv_Time_Core'),
  debug: true
};
SIV_SCOPE.TIME_STATE.timestamp_var = parseInt(SIV_SCOPE.TIME_STATE.parameters['TimeStamp Variable']) || 0;
SIV_SCOPE.TIME_STATE.enabled = SIV_SCOPE.TIME_STATE.parameters['Start By Default'] === 'true';
SIV_SCOPE.TIME_STATE.neverWait = SIV_SCOPE.TIME_STATE.parameters['Never Wait'] === 'true';
SIV_SCOPE.TIME_STATE.waitEvents = SIV_SCOPE.TIME_STATE.parameters['Wait For Events'] === 'true';
SIV_SCOPE.TIME_STATE.waitDialog = SIV_SCOPE.TIME_STATE.parameters['Wait For Dialog'] === 'true';
SIV_SCOPE.TIME_STATE.waitBattle = SIV_SCOPE.TIME_STATE.parameters['Wait For Battle'] === 'true';

/**
 * Standard Plugin config.
 */
SIV_SCOPE._game_interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	SIV_SCOPE._game_interpreter_pluginCommand.call(this,command, args)
	if (command.toUpperCase() === "ENABLE_TIME") SIV_SCOPE.TIME_STATE.enabled = true;
	if (command.toUpperCase() === "DISABLE_TIME")  SIV_SCOPE.TIME_STATE.enabled= false;
	return true;
};

/**
 * This is where we get the tick (frame). We do a few checks to see if we should
 * stamp (update var) and if so we fetch the old stamp and inc. it by 1. This
 * will result in a very Unix timestamp sytle int that should be very usuful.
 */
SIV_SCOPE.timestamp_update = function(value) {
  if (SIV_SCOPE.TIME_STATE.debug) console.log('--SIV_SCOPE.timestamp_update--');

  //Don't update if enabled is false, UNLESS its a external update call.
  //We know its an external call if value is set to a truthy.
  if (!value && !SIV_SCOPE.TIME_STATE.enabled) {
    if (SIV_SCOPE.TIME_STATE.debug) console.log('Disabled');
    return;
  }

  if (SIV_SCOPE.TIME_STATE.debug) console.log('Enabled or external call with value', value);

  //Assume null (single tick) but we can use 'value' to add or remove time as need.
  value = value || 1;
  var oldStamp;
  oldStamp = $gameVariables.value(SIV_SCOPE.TIME_STATE.timestamp_var) || 0;
  if (SIV_SCOPE.TIME_STATE.debug) console.log('Old timestamp', oldStamp);
  $gameVariables.setValue(SIV_SCOPE.TIME_STATE.timestamp_var, oldStamp + 1)
}

/**
 *
 */
SIV_SCOPE._all_scene_update = SceneManager.update;
SceneManager.update = function() {
  if (SIV_SCOPE.TIME_STATE.debug) console.log('--SceneManager Update--');
  var shouldStamp = false, sceneType = SIV_SCOPE.getScenePrototype(SceneManager._scene)
  if (!SceneManager._scene || sceneType == "boot" || sceneType == "title") {
    if (SIV_SCOPE.TIME_STATE.debug) console.log('No scene');
  } else if (SIV_SCOPE.TIME_STATE.neverWait ) {
    if (SIV_SCOPE.TIME_STATE.debug) console.log('Never Wait');
    shouldStamp = true;
  } else {
    switch (sceneType) {
      case 'map':
        if ($gameMap.isEventRunning()) {
          if (!SIV_SCOPE.TIME_STATE.waitEvents) shouldStamp = true;
          if (SIV_SCOPE.TIME_STATE.waitDialog && $gameMessage.isBusy()) shouldStamp = false;
        } else shouldStamp = true;
        break;
      case 'battle':
        if (!SIV_SCOPE.TIME_STATE.waitBattle) shouldStamp = true;
        break;
    }
  }
  if (SIV_SCOPE.TIME_STATE.debug) console.log('should stamp: ', shouldStamp);
  if (shouldStamp) SIV_SCOPE.timestamp_update();
	SIV_SCOPE._all_scene_update.call(this);
};

/**
 *
 */
SIV_SCOPE.getScenePrototype = function(sceneObject) {
  var type = 'unknown';

  if (Scene_Map.prototype.isPrototypeOf(SceneManager._scene)) type = 'map'
  else if (Scene_Battle.prototype.isPrototypeOf(SceneManager._scene)) type = 'battle';
  else if (Scene_Menu.prototype.isPrototypeOf(SceneManager._scene)) type = 'menu';
  else if (Scene_Item.prototype.isPrototypeOf(SceneManager._scene)) type = 'item';
  else if (Scene_Skill.prototype.isPrototypeOf(SceneManager._scene)) type = 'skill';
  else if (Scene_Equip.prototype.isPrototypeOf(SceneManager._scene)) type = 'equip';
  else if (Scene_Status.prototype.isPrototypeOf(SceneManager._scene)) type = 'status';
  else if (Scene_Options.prototype.isPrototypeOf(SceneManager._scene)) type = 'options';
  else if (Scene_Save.prototype.isPrototypeOf(SceneManager._scene)) type = 'save';
  else if (Scene_GameEnd.prototype.isPrototypeOf(SceneManager._scene)) type = 'GameEnd';
  else if (Scene_Title.prototype.isPrototypeOf(SceneManager._scene)) type = 'title';
  else if (Scene_Boot.prototype.isPrototypeOf(SceneManager._scene)) type = 'boot';

  if (SIV_SCOPE.TIME_STATE.debug) console.log('scene type: ', type);
  if (SIV_SCOPE.TIME_STATE.debug && type === 'unknown') console.log(SceneManager._scene);
  return type
}
