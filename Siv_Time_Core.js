/*:
  * @plugindesc (v1.3.0) [requires Siv_Plugin_Sanity v0.3.0] Tracks your frames like Seconds in a Epoch (UNIX) time format.
  *
  * Released under MIT license, https://github.com/Sivli-Embir/rpg_maker_plugins/blob/master/LICENSE
  *
  * @author Sivli Embir & Noxx Embir
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
  * @param Autostart On Map
  * @parent ---Parameters---
  * @desc For use with Notetags, will enable the plugin when you change maps unless it has <SIV_TIME_DISABLE>.
  * @type boolean
  * @default false
  *
  * @param Time Unit Names
  * @parent ---Parameters---
  * @desc [Optional] See help. What time units to use in the getTime utility function.
  * @type string
  * @default Seconds, Minutes, Hours, Days, Months, Years
  *
  * @param Time Units
  * @parent ---Parameters---
  * @desc [Optional] See help. With defaults 60 frames = 1 sec, 60 sec = 1 min... 12 months = 1 year. Match name order.
  * @type string
  * @default 60, 60, 60, 24, 30, 12
  *
  * @param ---Wait-Settings---
  *
  * @param Never Wait
  * @parent ---Wait-Settings---
  * @desc Always tracks the time, overrides all other wait settings. Use this if you want to track during all Scenes.
  * @type boolean
  * @default false
  *
  * @param Wait For Events
  * @parent ---Wait-Settings---
  * @desc Stops tracking the time for any non parallel events (including Dialog).
  * Will cause wait in Battle.
  * @type boolean
  * @default true
  *
  * @param Wait For Dialog
  * @parent ---Wait-Settings---
  * @desc Stops tracking the time specifically for any "Show Message" events.
  * @type boolean
  * @default true
  *
  * @param Allowed Scenes
  * @parent ---Wait-Settings---
  * @desc What Scenes should be tracked, e.g. "Map, Battle". See help for more info.
  * @type string
  * @default Map
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
  * another plugin as it offers no way to display the time.
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
  * - Will enable the plugin on map setup (when it loads). This is redundant
  * with Autostart on Map on.
  *
  * Use the plugin commands for Events and Battle start.
  *
  * ============================================================================
  * Time Unit Settings
  * ============================================================================
  *
  * If this section confuses you, consider scrolling down and reading "TimeStamp
  * Math Explained". You can also leave these settings alone.
  *
  * Time Unit Names
  * - These are the names of the untis of time you want to use. It can be
  * anything you want like: "Ticks, Tocks, Clocks", which would take the place
  * of "Seconds, Minutes, Hours". You can also have as few or many as you want.
  * For example if you don't want Seconds just start with Minutes. Just be
  * aware that the last unit will continue to count up like years. If you want
  * the last unit to have a cap and reset then add a fake unit at the end.
  *
  * Time Units
  * - This is how many sub units you want per unit. For example how many Seconds
  * are in your version of a Minute? By default it's set to 60sec per 1min. It's
  * important to remember that the first unit is frames per unit (Seconds). This
  * is set by default to be 60 frames per 1 Second or 1 real world Second per 1
  * in-game Second. So if you want faster or slower in-game time, set the first
  * number to something else. (see "TimeStamp Math Explained" for the math.)
  *
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
  * - If any non-parrallel event is running it will pause and stop counting time
  * until the event is over. The most common case would be manually controlling
  * the characters movement or during dialog but it also includes things like
  * opening a treasure chest.
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
  * TimeStamp Math Explained
  * ============================================================================
  * For the best understanding you will want to study up on Epoch (or UNIX)
  * time. That said, it comes down to simple division math. Let's assume you
  * want to use standard time with the in-game time moving at the same speed as
  * real time.
  *
  * Assume the game frame count comes to 36,000 frames and we want 60 frames per
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
  * Now lets say you want to have the game time move at 2x the speed of real
  * time. All you have to do is cut the frames per second in half:
  * 60fps / 2 = 30fps.
  * 36,000f / 30fps / 60spm = 20 minutes
  *
  * You can also have non-standard time, like say 10 minutes per hour.
  * 36,000f / 30fps / 60spm / 10mph = 2 hours
  *
  * The math does get a bit more complex when you get fractions. That said Epoch
  * math is well documentation online so this should not be to hard for you to
  * work out with a bit of study. Or you could just use the Time Units.
  *
  * ============================================================================
  * Coder Stuff (API)
  * ============================================================================
  *
  * The code itself is documented but the key points to note are:
  *
  * SIV_SCOPE.TIME_SCOPE.debug = boolean
  * - if true it will dump endless streams of logs. Usually you want to turn
  * this on and off quickly and scroll backwards.
  *
  * SIV_SCOPE.TIME_SCOPE.enable & SIV_SCOPE.TIME_SCOPE.disable
  * - turns the plugin on and off respectivly, may be overloaded with other
  * plugins.
  *
  * SIV_SCOPE.TIME_SCOPE._enabled == boolean
  * - if false it will do nothing every frame.
  *
  * SIV_SCOPE.TIME_SCOPE.timestampUpdate = function (value, set)
  * - this is where the variable gets updated, see the comments for details
  * (or read the code).
  *
  * SIV_SCOPE.TIME_SCOPE.getTime = function()
  * - Assuming you have configured time units (or left the defaults) this will
  * convert the timestamp into something human readable.
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
  * Version 1.3.0:
  * - added SIV_TIME_CORE_WAIT plugin commands that persist on save!
  *
  * Version 1.2.0:
  * - add enable/diable methods and moved enabled to _enabled
  *
  * Version 1.1.0:
  * - Now requires Siv_Plugin_Sanity!
  * - Added notetags for map enable/diable
  * - Added Autostart on map parameters
  * - Added getTime utility function
  * - Added Time Units parameters
  *
  * Version 1.0.0:
  * - Finished plugin!
  '
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

///////////////////////////////////////////////////////////////////
// Plugin registation with Siv_Plugin_Sanity dependency manager. //
///////////////////////////////////////////////////////////////////
 SIV_SCOPE.definePlugin({
   name: 'Siv_Time_Core',
   plugin: function() {

 /////////////////////////////
 // Params and other config //
 /////////////////////////////

 SIV_SCOPE.TIME_SCOPE = {}
 SIV_SCOPE.TIME_SCOPE.parameters = PluginManager.parameters('Siv_Time_Core');
 SIV_SCOPE.TIME_SCOPE.debug = false;
 SIV_SCOPE.TIME_SCOPE._timestamp_var = parseInt(SIV_SCOPE.TIME_SCOPE.parameters['TimeStamp Variable']) || 0;
 SIV_SCOPE.TIME_SCOPE._enabled = SIV_SCOPE.TIME_SCOPE.parameters['Start By Default'] === 'true';
 SIV_SCOPE.TIME_SCOPE.autoStart = SIV_SCOPE.TIME_SCOPE.parameters['Autostart On Map'] === 'true';

 // time unit config
 SIV_SCOPE.TIME_SCOPE.timeUnits = SIV_SCOPE.TIME_SCOPE.parameters['Time Unit Names'].split(', ')
 SIV_SCOPE.TIME_SCOPE.timeUnitsPerSub = SIV_SCOPE.TIME_SCOPE.parameters['Time Units'].replace(/ /g,'').split(',').map(function (n) {
   return parseInt(n)
 })
 SIV_SCOPE.TIME_SCOPE.timeUnitsPerFrame = []

 // do some frame math now to save time later.
 for (var i = 0; i < SIV_SCOPE.TIME_SCOPE.timeUnitsPerSub.length; i++) {
   var base = SIV_SCOPE.TIME_SCOPE.timeUnitsPerSub[i], multiplyer = 1;
   for (var ii = i-1; ii >= 0; ii--) multiplyer = SIV_SCOPE.TIME_SCOPE.timeUnitsPerSub[ii] * multiplyer;
   SIV_SCOPE.TIME_SCOPE.timeUnitsPerFrame[i] = base * multiplyer;
 }

 // Wait config
 SIV_SCOPE.TIME_SCOPE.neverWait = SIV_SCOPE.TIME_SCOPE.parameters['Never Wait'] === 'true';
 SIV_SCOPE.TIME_SCOPE.waitEvents = SIV_SCOPE.TIME_SCOPE.parameters['Wait For Events'] === 'true';
 SIV_SCOPE.TIME_SCOPE.waitDialog = SIV_SCOPE.TIME_SCOPE.parameters['Wait For Dialog'] === 'true';
 SIV_SCOPE.TIME_SCOPE.allowedSceneList = SIV_SCOPE.TIME_SCOPE.parameters['Allowed Scenes'].replace(/ /g,'').toUpperCase().split(',')

 //event wait
 SIV_SCOPE.TIME_SCOPE._waitingEvent = {}
 SIV_SCOPE.TIME_SCOPE._waiting = []


 ///////////////
 // Main Code //
 ///////////////

 /**
  * onFrame via Siv_Plugin_Sanity
  * We use this to check if we should update the timestamp.
  */
 SIV_SCOPE.onFrame(function() {
   if (SIV_SCOPE.TIME_SCOPE.debug) console.log('--SceneManager Update--');
   if (!SIV_SCOPE.TIME_SCOPE._enabled) {
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

 SIV_SCOPE.TIME_SCOPE.enable = function() {
   SIV_SCOPE.TIME_SCOPE._enabled = true
   SIV_SCOPE.fireCustomEvent('time_core', 'enable')
 }

 SIV_SCOPE.TIME_SCOPE.disable = function() {
   SIV_SCOPE.TIME_SCOPE._enabled = false
   SIV_SCOPE.fireCustomEvent('time_core', 'disable')
 }

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
     SIV_SCOPE.TIME_SCOPE._checkWaiting(value)
   } else {
     value = value || 1;
     var oldStamp = $gameVariables.value(SIV_SCOPE.TIME_SCOPE._timestamp_var) || 0;
     if (SIV_SCOPE.TIME_SCOPE.debug) console.log('Old timestamp', oldStamp);
     $gameVariables.setValue(SIV_SCOPE.TIME_SCOPE._timestamp_var, oldStamp + value)
     SIV_SCOPE.TIME_SCOPE._checkWaiting(oldStamp + value)
   }
 }

  SIV_SCOPE._makeSaveContents.push(function(contents) {
    contents['TIME_SCOPE'] = {
      waiting:      SIV_SCOPE.TIME_SCOPE._waiting,
      waitingEvent: SIV_SCOPE.TIME_SCOPE._waitingEvent
    }
  })

  SIV_SCOPE._extractSaveContents.push(function(contents) {
    if (contents['TIME_SCOPE']) {
      SIV_SCOPE.TIME_SCOPE._waiting = contents['TIME_SCOPE'].waiting || [];
      SIV_SCOPE.TIME_SCOPE._waitingEvent = contents['TIME_SCOPE'].waitingEvent || {};
    }
  })

 /////////////////////////////////////////////////////////
 // Plugin command registration via Siv_Plugin_Sanity.  //
 /////////////////////////////////////////////////////////


 SIV_SCOPE.registerPluginCommand("ENABLE_TIME", function() {
   SIV_SCOPE.TIME_SCOPE.enable()
 })
 SIV_SCOPE.registerPluginCommand("DISABLE_TIME", function() {
   SIV_SCOPE.TIME_SCOPE.disable()
 })
 SIV_SCOPE.registerPluginCommand("ADD_TIME", function(command, args) {
   SIV_SCOPE.TIME_SCOPE.timestampUpdate(parseInt(args[0]), args[1]);
 })
 SIV_SCOPE.registerPluginCommand("REMOVE_TIME", function() {
   SIV_SCOPE.TIME_SCOPE.timestampUpdate(-1 * parseInt(args[0]));
 })
 SIV_SCOPE.registerPluginCommand("SIV_TIME_CORE_WAIT", function(command, args) {
   var key = [this._mapId, this._eventId, args[1].toUpperCase()].join()
   , timestamp = $gameVariables.value(SIV_SCOPE.TIME_SCOPE._timestamp_var) || 0;
   timestamp += parseInt(args[0])
   if (SIV_SCOPE.TIME_SCOPE._waiting.indexOf(timestamp) == -1) {
     SIV_SCOPE.TIME_SCOPE._waiting.push(timestamp)
     SIV_SCOPE.TIME_SCOPE._waiting.sort(function(a,b) { return a > b })
   }
   if (!SIV_SCOPE.TIME_SCOPE._waitingEvent[timestamp]) SIV_SCOPE.TIME_SCOPE._waitingEvent[timestamp] = []
   SIV_SCOPE.TIME_SCOPE._waitingEvent[timestamp].push({key: key, on: (args[2] || '').toUpperCase() !== 'OFF'})
 })

SIV_SCOPE.TIME_SCOPE._checkWaiting = function(timestamp) {
  for (var i = 0; i < SIV_SCOPE.TIME_SCOPE._waiting.length; i++) {
    if (timestamp >= SIV_SCOPE.TIME_SCOPE._waiting[i]) {
      var timeIndex = SIV_SCOPE.TIME_SCOPE._waiting.splice(i, 1)[0];
      if (SIV_SCOPE.TIME_SCOPE._waitingEvent[timeIndex]) {
        for (var i = 0; i < SIV_SCOPE.TIME_SCOPE._waitingEvent[timeIndex].length; i++) {
          $gameSelfSwitches.setValue(SIV_SCOPE.TIME_SCOPE._waitingEvent[timeIndex][i].key
            , SIV_SCOPE.TIME_SCOPE._waitingEvent[timeIndex][i].on);
        }
      }
    } else break;
  }
}


 ////////////////////////////////////////////////////
 // Notetags and onMapCreate via Siv_Plugin_Sanity. //
 ////////////////////////////////////////////////////

SIV_SCOPE.onSceneEvent(Scene_Map, 'create', function(mapId, newMapId) {
  var notes = SIV_SCOPE.getNotetags({ type: 'maps', id: mapId, name: "SIV_TIME" });
  if (!notes.length) return;
  for (var i = 0; i < notes.length; i++) {
    var setting = (notes[i].args[0] || '').toLowerCase();
    if (setting === 'disable') SIV_SCOPE.TIME_SCOPE.disable()
    else if (SIV_SCOPE.TIME_SCOPE.autoStart || setting === 'enable') SIV_SCOPE.TIME_SCOPE.enable()
  }
})

 ///////////////////
 // Time Utilitys //
 ///////////////////

 /**
  * I used basily the same setup that webkit (chrome/safari) use in c++ for JS DATE
  * http://trac.webkit.org/browser/webkit/releases/WebKitGTK/webkit-1.1.1/JavaScriptCore/runtime/DateMath.cpp
  */
 SIV_SCOPE.TIME_SCOPE.getTime = function(frames, shooldPadZero) {
   frames = frames || $gameVariables.value(SIV_SCOPE.TIME_SCOPE._timestamp_var) || 0
   var time = {}, timeUnits = SIV_SCOPE.TIME_SCOPE.timeUnits
   , perSub = SIV_SCOPE.TIME_SCOPE.timeUnitsPerSub
   , perFrame = SIV_SCOPE.TIME_SCOPE.timeUnitsPerFrame
   , lastIndex = timeUnits.length - 1;

   for (var i = 0; i < lastIndex; i++) {
     time[timeUnits[i]] = Math.fmod(Math.floor(frames / perFrame[i]), perSub[i+1])
     if (time[timeUnits[i]] < 0) time[timeUnits[i]] = perFrame[i+1];
     if (shooldPadZero) time[timeUnits[i]] = time[timeUnits[i]].padZero(perSub[i].toString().length)
   }
   time[timeUnits[lastIndex]] = Math.floor(frames / perFrame[lastIndex])
   if (time[timeUnits[lastIndex]] < 0) time[timeUnits[lastIndex]] = 0;
   return time
 }
   }
 })
