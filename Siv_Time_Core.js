/*:
  * @plugindesc (v1.1.0) [requires Siv_Plugin_Sanity v0.0.0] Tracks your frames like Seconds in a Epoch (UNIX) time
  * format. This gives you very flexible in-game time tracking.
  *
  * @author Sivli Embir
  *
  * @param ---Variables---
  *
  * @param TimeStamp Variable
  * @parent ---Variables---
  * @desc What variable should be used to count frames.
  * @type variable
  * @default 0
  *
  * @param ---Parameters---
  *
  * @param Start By Default
  * @parent ---Parameters---
  * @desc Turns on the plugin.
  * @type boolean
  * @default true
  *
  * @param Time Units
  * @parent ---Parameters---
  * @desc [Optional] What time units to use in the Util functions
  * @type string
  * @default Seconds, Minutes, Hours, Days, Weeks, Months, Years
  *
  * @param Time Unit Devitions
  * @parent ---Parameters---
  * @desc [Optional] How meny of each sub unit to devide into. (frames * 60 = Seconds) Match the order in Time Units.
  * @type string
  * @default 60, 60, 60, 24, 7, 4, 12
  *
  * @param ---Wait-Settings---
  *
  * @param Never Wait
  * @parent ---Wait-Settings---
  * @desc Always track the time, overrides all other wait settings. Use this if you want to track during all Scenes.
  * @type boolean
  * @default false
  *
  * @param Wait For Events
  * @parent ---Wait-Settings---
  * @desc Stop tracking the time for any non parallel events (including Dialog).
  * Will cause wait in Battle.
  * @type boolean
  * @default true
  *
  * @param Wait For Dialog
  * @parent ---Wait-Settings---
  * @desc Stop tracking the time specifically for any "Show Message" events.
  * @type boolean
  * @default true
  *
  * @param Allowed Scenes
  * @parent ---Wait-Settings---
  * @desc What Scenes should be tracked, e.g. "Map, Battle". See help for more
  * info.
  * @type string
  * @default 'Map'
  *
  * @help
  * ============================================================================
  * Documentation
  * ============================================================================
  *
  * WARNING: This requires the Siv_Plugin_Sanity plugin be loaded first!
  *
  * This is a fairly simple utility plugin. With the default settings and the
  * TimeStamp variable assigned, it will count the total number of frames the
  * player has experienced while running around on the map.
  *
  * Unless you are skilled with JS you will likely want to use this with
  * another plugin. By default it makes no assumptions on how you want to break
  * up the frames (seconds, minutes, ext...) and offers no way to display it
  * outside the variable.
  *
  * ============================================================================
  * Plugin Commands
  * ============================================================================
  *
  * ENABLE_TIME
  * - Sets the plugin to enabled and it will start tracking frames.
  * DISABLE_TIME
  * - Sets the plugin to disabled and it will stop tracking frames.
  * ADD_TIME value [Number], set [Boolean: True or False]
  * - Lets you add "Frames" as a means of skipping time forward. DANGER: If the
  * second argument is true it replaces the current time with the value.
  * REMOVE_TIME value [Number]
  * - Lets you remove "Frames" as a means of rolling time backwards.
  *
  * ============================================================================
  * Note Tags
  * ============================================================================
  *
  * <SIV_TIME_DISABLE> [Map]
  * - Will disable the plugin on map setup (when it loads)
  * <SIV_TIME_ENABLE> [Map]
  * - Will enable the plugin on map setup (when it loads)
  *
  * Use the plugin commands for Events and Battle start.
  *
  * ============================================================================
  * Wait Settings
  * ============================================================================
  *
  * Unless you are comfortable debugging in the console you should leave these
  * alone. These settings control when the plugin should count frames.
  *
  * Never Wait
  * - This will count frames at all times. Basically, time will always be
  * tracking even if the game is paused. This might be useful if you are
  * disabling the plugin manually when you want to wait.
  *
  * Wait For Events
  * - If any non-parrallel event is running it will wait. The most common case
  * would be manually controlling the characters movement or during dialog but
  * it also includes things like opening a treasure chest.
  *
  * Wait For Dialog
  * - If you are frame counting during events but you want it to pause during
  * Show Message events then set 'Wait For Events' to false and this to true.
  * This could be useful if you want to count frames during battle.
  *
  * Allowed Scenes
  * - This is where the real headache will come from. There are no clear ways to
  * get the current view the user is on. The most common are Map and Battle but
  * Menu is much more complex. The Main Menu is called Menu and each sub menu
  * has its own name. For example, the Item Menu is Item. If all you want to do
  * is track time for maps and battles use: "Map, Battle" (or "Battle" for just
  * battles). If you want more fine control see the Coder Stuff section.
  *
  * ============================================================================
  * Uses Case
  * ============================================================================
  *
  * For the best understanding you will want to study up on Epoch (or UNIX)
  * time. That said, it comes down to simple division math. Let's assume you
  * want to use standard time with the in-game time moving at the same speed as
  * real time.
  *
  * Assume the game frame count is 36,000 frames and we want 60 frames per
  * second, which is the real time rate.
  *
  * 36,000 frames / 60fps = 600 seconds
  *
  * Now let's convert that to minutes. Give 60 seconds in a minute:
  *
  * 600 seconds / 60fps = 10 minutes
  *
  * So to get the total minutes elapsed:
  * 36,000f / 60fps / 60spm = 10 minutes
  *
  * Now lets say you want to have the game time move at 2x speed real time. All
  * you have to do is cut the frames per second in half: 60fps / 2 = 30fps.
  * 36,000f / 30fps / 60spm = 20 minutes
  *
  * You can also have non-standard time, like say 10 minutes per hour.
  * 36,000f / 30fps / 60spm / 10mph = 2 hours
  *
  * The math does get a bit more complex when you get fractions. That said Epoch
  * math is well documentation online so this should not be to hard for you to
  * work out with a bit of study.
  *
  * ============================================================================
  * Coder Stuff
  * ============================================================================
  *
  * The code itself is documented but the key points to note are:
  *
  * SIV_SCOPE.TIME_SCOPE.debug = boolean
  * - if true it will dump endless streams of logs. Usually you want to turn
  * this on and off quickly and scroll backwards.
  *
  * SIV_SCOPE.TIME_SCOPE.enabled = boolean
  * - if false it will do nothing every frame.
  *
  * SIV_SCOPE.TIME_SCOPE.timestampUpdate = function (value, set)
  * - this is where the variable gets updated, see the comments for details
  * (or just read the code TBH).
  *
  * ============================================================================
  * Shout Out
  * ============================================================================
  *
  * Huge thanks to Yanfly! His code helped me sort out layout and all around how
  * to hack up RPG Maker MV.
  *
  * Also shout out the author(s) of MOG_TimeSystem which inspired this plugin.
  * While it did not quite meet my needs it is how I figured out how to build
  * this, at least over a weekend -_^
  *
  * ============================================================================
  * Change Log
  * ============================================================================
  *
  * Version 1.1.0:
  * - Added notetags for map enable/diable
  * - Now requires Siv_Plugin_Sanity!
  *
  * Version 1.0.0:
  * - Finished plugin!
*/

/**
 * Params and other config
 */
SIV_SCOPE.TIME_SCOPE = {
  parameters: PluginManager.parameters('Siv_Time_Core'),
  debug: false
};
SIV_SCOPE.TIME_SCOPE._timestamp_var = parseInt(SIV_SCOPE.TIME_SCOPE.parameters['TimeStamp Variable']) || 0;
SIV_SCOPE.TIME_SCOPE.enabled = SIV_SCOPE.TIME_SCOPE.parameters['Start By Default'] === 'true';
SIV_SCOPE.TIME_SCOPE.neverWait = SIV_SCOPE.TIME_SCOPE.parameters['Never Wait'] === 'true';
SIV_SCOPE.TIME_SCOPE.waitEvents = SIV_SCOPE.TIME_SCOPE.parameters['Wait For Events'] === 'true';
SIV_SCOPE.TIME_SCOPE.waitDialog = SIV_SCOPE.TIME_SCOPE.parameters['Wait For Dialog'] === 'true';
SIV_SCOPE.TIME_SCOPE.allowedSceneList = SIV_SCOPE.TIME_SCOPE.parameters['Allowed Scenes'].replace(/ /g,'').toUpperCase().split(',')
SIV_SCOPE.TIME_SCOPE.timeUnitsPerFrame = []
SIV_SCOPE.TIME_SCOPE.timeUnits = SIV_SCOPE.TIME_SCOPE.parameters['Time Units'].split(', ')
SIV_SCOPE.TIME_SCOPE.timeUnitsPerSub = SIV_SCOPE.TIME_SCOPE.parameters['Time Unit Devitions'].replace(/ /g,'').split(',').map(function (n) {
  return parseInt(n)
})

for (var i = 0; i < SIV_SCOPE.TIME_SCOPE.timeUnitsPerSub.length; i++) {
  var base = SIV_SCOPE.TIME_SCOPE.timeUnitsPerSub[i], multiplyer = 1;
  for (var ii = i-1; ii >= 0; ii--) multiplyer = SIV_SCOPE.TIME_SCOPE.timeUnitsPerSub[ii] * multiplyer;
  SIV_SCOPE.TIME_SCOPE.timeUnitsPerFrame[i] = base * multiplyer;
}


/**
 * Main Code
 */

/**
 * onFrame via Siv_Plugin_Sanity
 */
SIV_SCOPE.onFrame(function() {
  if (SIV_SCOPE.TIME_SCOPE.debug) console.log('--SceneManager Update--');
  if (!SIV_SCOPE.TIME_SCOPE.enabled) {
    if (SIV_SCOPE.TIME_SCOPE.debug) console.log('Disabled');
    return;
  }

  var shouldStamp = false, sceneAllow;
  if (!SceneManager._scene) {
    if (SIV_SCOPE.TIME_SCOPE.debug) console.log('No scene');
  } else if (SIV_SCOPE.TIME_SCOPE.neverWait) {
    if (SIV_SCOPE.TIME_SCOPE.debug) console.log('Never Wait');
    shouldStamp = true;
  } else if (SIV_SCOPE.TIME_SCOPE._isSceneAllowed(SceneManager._scene)) {
    if (SIV_SCOPE.TIME_SCOPE.debug) console.log('Scene allowed');
    if ($gameMap.isEventRunning()) {
      if (!SIV_SCOPE.TIME_SCOPE.waitEvents) shouldStamp = true;
      if (SIV_SCOPE.TIME_SCOPE.debug) console.log('Event allow: ', shouldStamp);
      if (SIV_SCOPE.TIME_SCOPE.waitDialog && $gameMessage.isBusy()) {
        if (SIV_SCOPE.TIME_SCOPE.debug) console.log('Allowing Dialog');
        shouldStamp = false;
      }
    } else shouldStamp = true;
  }

  if (SIV_SCOPE.TIME_SCOPE.debug) console.log('should stamp: ', shouldStamp);
  if (shouldStamp) SIV_SCOPE.TIME_SCOPE.timestampUpdate();
});

/**
 * Simple if scene type (string) is in the allow array then truthy.
 *
 * I will admit to some hesitance to using 'constructor.name' as JS prototype is all kinds of
 * wonky. That said we should be using Node in all cases so this should be safe so long as
 * the MV core teem keeps the same Class config. It will also be JS2016+ Class safe so yay...
 */
SIV_SCOPE.TIME_SCOPE._isSceneAllowed = function(sceneObject) {
  var type = (sceneObject || {}).constructor.name.split('_')[1].toUpperCase();
  if (SIV_SCOPE.TIME_SCOPE.debug) console.log('scene type: ', type);
  return SIV_SCOPE.TIME_SCOPE.allowedSceneList.contains(type)
}

/**
 * This is where we finaly do work. If we get to this point then we have passed all the
 * allow/dissalow rules. We can also use this to for add/remove time and static sets.
 * For remove time just call with a negative value (e.g. -3000).
 */
SIV_SCOPE.TIME_SCOPE.timestampUpdate = function(value, shouldSet) {
  if (SIV_SCOPE.TIME_SCOPE.debug) console.log('--SIV_SCOPE.timestampUpdate--');

  if (shouldSet && value) {
    $gameVariables.setValue(SIV_SCOPE.TIME_SCOPE._timestamp_var, value)
  } else {
    value = value || 1;
    var oldStamp = $gameVariables.value(SIV_SCOPE.TIME_SCOPE._timestamp_var) || 0;
    if (SIV_SCOPE.TIME_SCOPE.debug) console.log('Old timestamp', oldStamp);
    $gameVariables.setValue(SIV_SCOPE.TIME_SCOPE._timestamp_var, oldStamp + value)
  }
}


/**
 * Plugin registration via Siv_Plugin_Sanity.
 */
SIV_SCOPE.registerPlugin("ENABLE_TIME", function() {
  SIV_SCOPE.TIME_SCOPE.enabled = true;
})
SIV_SCOPE.registerPlugin("DISABLE_TIME", function() {
  SIV_SCOPE.TIME_SCOPE.enabled = false;
})
SIV_SCOPE.registerPlugin("ADD_TIME", function(command, args) {
  SIV_SCOPE.TIME_SCOPE.timestampUpdate(parseInt(args[0]), args[1]);
})
SIV_SCOPE.registerPlugin("REMOVE_TIME", function() {
  SIV_SCOPE.TIME_SCOPE.timestampUpdate(-1 * parseInt(args[0]));
})


/**
 * Notetags and onMapSetup via Siv_Plugin_Sanity.
 */

 SIV_SCOPE.onMapSetup(function(mapId) {
   if (SIV_SCOPE.TIME_SCOPE.enabled) {
     if (SIV_SCOPE.hasNotetag({ type: 'maps', id: mapId, match: "<SIV_TIME_DISABLE>" })) {
       SIV_SCOPE.TIME_SCOPE.enabled = false;
     }
   } else {
     if (SIV_SCOPE.hasNotetag({ type: 'maps', id: mapId, match: "<SIV_TIME_ENABLE>" })) {
       SIV_SCOPE.TIME_SCOPE.enabled = true;
     }
   }

 })

/**
 * Time Utilitys
 */

/**
 * I used basily the same setup that webkit (chrome/safari) use in c++ for JS DATE
 * http://trac.webkit.org/browser/webkit/releases/WebKitGTK/webkit-1.1.1/JavaScriptCore/runtime/DateMath.cpp
 */
SIV_SCOPE.TIME_SCOPE.getTime = function() {
  var frames = $gameVariables.value(SIV_SCOPE.TIME_SCOPE._timestamp_var) || 0
  , time = {}, timeUnits = SIV_SCOPE.TIME_SCOPE.timeUnits
  , perSub = SIV_SCOPE.TIME_SCOPE.timeUnitsPerSub
  , perFrame = SIV_SCOPE.TIME_SCOPE.timeUnitsPerFrame
  , lastIndex = timeUnits.length - 1;

  for (var i = 0; i < lastIndex; i++) {
    time[timeUnits[i]] = Math.fmod(Math.floor(frames / perFrame[i]), perSub[i+1])
    if (time[timeUnits[i]] < 0) time[timeUnits[i]] = perFrame[i+1];
  }
  time[timeUnits[lastIndex]] = Math.floor(frames / perFrame[lastIndex])
  if (time[timeUnits[lastIndex]] < 0) time[timeUnits[lastIndex]] = 0;
  return time
}
