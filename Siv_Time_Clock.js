/*:
  * @plugindesc (v1.0.0) [requires Siv_Time_Core] In-game clock / time UI
  *
  * Released under MIT license, https://github.com/Sivli-Embir/rpg_maker_plugins/blob/master/LICENSE
  *
  * @author Sivli Embir & Noxx Embir
  *
  * @param ---Window Settings---
  *
  * @param Position X
  * @parent ---Window Settings---
  * @desc Where you want to center the window width wize. 0-100 (%)
  * @type number
  * @min 0
  * max 100
  * @default 50
  *
  * @param Position Y
  * @parent ---Window Settings---
  * @desc Where you want to center the window height wize. 0-100 (%)
  * @type number
  * @min 0
  * max 100
  * @default 0
  *
  * @param Font Size
  * @parent ---Window Settings---
  * @desc How large you want the text to be.
  * @type number
  * @min 0
  * @default 20
  *
  * @param Padding
  * @parent ---Window Settings---
  * @desc How much space inside the border before the text starts.
  * @type number
  * @min 0
  * @default 18
  *
  * @param Text Spacing
  * @parent ---Window Settings---
  * @desc How much space after each row before the next row starts.
  * @type number
  * @min 0
  * @default 4
  *
  * @param ---Settings---
  *
  * @param Rate Limiter
  * @parent ---Settings---
  * @desc Only update the clock when this time unit updates
  * @type text
  * @default Seconds
  *
  * @param Disable on Time Core Disable
  * @parent ---Settings---
  * @desc Hide clock if time core is disabled.
  * @type boolean
  * @default true
  *
  * @param ---Time Display---
  *
  * @param Text Row 1
  * @parent ---Time Display---
  * @desc First row of your clock
  * @type text
  * @default Current Time
  *
  * @param Text Row 2
  * @parent ---Time Display---
  * @desc Second row of your clock (optional)
  * @type text
  * @default {{Hours}}:{{Minutes}}:{{Seconds}}
  *
  * @param Text Row 3
  * @parent ---Time Display---
  * @desc Third row of your clock (optional)
  * @type text
  * @default {{Days}}/{{Months}}/{{Years}}
  *
  * @help
  * ============================================================================
  * Documentation
  * ============================================================================
  * This is a simple drop in clock for Siv_Time_Core.js
  * It's designed to be as customizable as possible while maintaining the look
  * and feel of RPG Maker. You can position it anywhere on the map with
  * percentage positioning. This will let your clock keep its position even if
  * you change game resolutions.
  *
  * It lets you build 3 custom text rows to display the time however you want.
  * Just add your time unit (from Siv_Time_Core) inside double curly braces.
  * For example if Hours = 10 "It is {{Hours}} O' clock!" will print:
  * - It is 10 O' Clock!
  *
  * ============================================================================
  * Change Log
  * ============================================================================
  *
  * Version 1.0.0:
  * - Finished plugin!
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
   name: 'Siv_Time_Clock',
   requires: ['Siv_Time_Core'],
   plugin: function() {
SIV_SCOPE.CLOCK_SCOPE = {
  parameters: PluginManager.parameters('Siv_Time_Clock'),
  visible: true,
  _canvas: document.createElement('canvas')
}
SIV_SCOPE.CLOCK_SCOPE.timeDisplayText = []
SIV_SCOPE.CLOCK_SCOPE.disableOnTimeDisable = SIV_SCOPE.CLOCK_SCOPE.parameters['Disable on Time Core Disable'] == 'true'
SIV_SCOPE.CLOCK_SCOPE._canvas_context = SIV_SCOPE.CLOCK_SCOPE._canvas.getContext('2d')

var timeUnitIndex = SIV_SCOPE.TIME_SCOPE.timeUnits.indexOf(SIV_SCOPE.CLOCK_SCOPE.parameters['Rate Limiter'])
SIV_SCOPE.CLOCK_SCOPE.rateLimiter = SIV_SCOPE.TIME_SCOPE.timeUnitsPerFrame[timeUnitIndex]

SIV_SCOPE.CLOCK_SCOPE.positionX = parseInt(SIV_SCOPE.CLOCK_SCOPE.parameters['Position X'])
SIV_SCOPE.CLOCK_SCOPE.positionY = parseInt(SIV_SCOPE.CLOCK_SCOPE.parameters['Position Y'])
SIV_SCOPE.CLOCK_SCOPE.fontSize  = parseInt(SIV_SCOPE.CLOCK_SCOPE.parameters['Font Size'])
SIV_SCOPE.CLOCK_SCOPE.padding   = parseInt(SIV_SCOPE.CLOCK_SCOPE.parameters['Padding'])
SIV_SCOPE.CLOCK_SCOPE.textSpacing = parseInt(SIV_SCOPE.CLOCK_SCOPE.parameters['Text Spacing'])

for(var key in SIV_SCOPE.CLOCK_SCOPE.parameters) {
  if(/Text Row/.test(key)) {
    SIV_SCOPE.CLOCK_SCOPE.timeDisplayText.push(SIV_SCOPE.CLOCK_SCOPE.parameters[key])
  }
}

//////////////
//API START //
//////////////


SIV_SCOPE.CLOCK_SCOPE.enable = function() {
  SIV_SCOPE.CLOCK_SCOPE.visible = true;
  if (SIV_SCOPE.CLOCK_SCOPE.clock) SIV_SCOPE.CLOCK_SCOPE.clock.refresh();
};

SIV_SCOPE.CLOCK_SCOPE.disable = function() {
  SIV_SCOPE.CLOCK_SCOPE.visible = false;
  if (SIV_SCOPE.CLOCK_SCOPE.clock) SIV_SCOPE.CLOCK_SCOPE.clock.refresh();
};

SIV_SCOPE.registerPluginCommand("ENABLE_TIME_Clock", function() {
  SIV_SCOPE.CLOCK_SCOPE.enable()
})
SIV_SCOPE.registerPluginCommand("DISABLE_TIME_Clock", function() {
  SIV_SCOPE.CLOCK_SCOPE.disable()
})

SIV_SCOPE.onSceneEvent(Scene_Map, 'create', function(mapId, newMapId) {
  var notes =  SIV_SCOPE.getNotetags({ type: 'maps', id: mapId, name: "SIV_TIME_CLOCK" });
  if (!notes.length) return;
  for (var i = 0; i < notes.length; i++) {
    var setting = (notes[i].args[0] || '').toLowerCase();
    console.log(setting, notes[i]);
    if (setting === 'disable') SIV_SCOPE.CLOCK_SCOPE.disable()
    else if (setting === 'enable') SIV_SCOPE.CLOCK_SCOPE.enable()
  }
})

/////////////
// API END //
/////////////

//rather then update every frame only update when the var changes
//also only update when there is a visible change.
SIV_SCOPE.onVariableChange(SIV_SCOPE.TIME_SCOPE._timestamp_var, function(index, value) {
 if (SIV_SCOPE.CLOCK_SCOPE.clock && SIV_SCOPE.CLOCK_SCOPE.clock.visible) {
   var delta = Math.floor(value / SIV_SCOPE.CLOCK_SCOPE.rateLimiter)
   if (delta != SIV_SCOPE.CLOCK_SCOPE._lastUpdate) {
     SIV_SCOPE.CLOCK_SCOPE._lastUpdate = delta
     SIV_SCOPE.CLOCK_SCOPE.clock.refresh();
   }
 }
})

//Only load the time core events if we will use them
if (SIV_SCOPE.CLOCK_SCOPE.disableOnTimeDisable) {
  SIV_SCOPE.onEvent('time_core', 'enable', function() {
    SIV_SCOPE.CLOCK_SCOPE.visible = true;
    if (SIV_SCOPE.CLOCK_SCOPE.clock) SIV_SCOPE.CLOCK_SCOPE.clock.refresh();
  })
  SIV_SCOPE.onEvent('time_core', 'disable', function() {
    SIV_SCOPE.CLOCK_SCOPE.visible = false;
    if (SIV_SCOPE.CLOCK_SCOPE.clock) SIV_SCOPE.CLOCK_SCOPE.clock.refresh();
  })
}

//add the clock to each map (in case they manually enable it)
SIV_SCOPE.onSceneEvent(Scene_Map, 'addObjects', function(mapId, oldMapId) {
  SIV_SCOPE.CLOCK_SCOPE.clock = new Window_Clock({
    positionX:    SIV_SCOPE.CLOCK_SCOPE.positionX,
    positionY:    SIV_SCOPE.CLOCK_SCOPE.positionY,
    fontSize:     SIV_SCOPE.CLOCK_SCOPE.fontSize,
    padding:      SIV_SCOPE.CLOCK_SCOPE.padding,
    textSpacing:  SIV_SCOPE.CLOCK_SCOPE.textSpacing,
    visible:      SIV_SCOPE.CLOCK_SCOPE.visible
  }); //118, 56
  this.addChild(SIV_SCOPE.CLOCK_SCOPE.clock)
  SIV_SCOPE.CLOCK_SCOPE.clock.refresh()
})

//////////////////////////////////////////////////////////////
// Window_Smart_Text from Siv_Plugin_Sanity.                //
// It acts like the help window but is much more adjustable //
//////////////////////////////////////////////////////////////
function Window_Clock() { Window_Smart_Text.prototype.initialize.apply(this, arguments) }
Window_Clock.prototype = Object.create(Window_Smart_Text.prototype);
Window_Clock.prototype.addContents = function() {
  this.visible = SIV_SCOPE.CLOCK_SCOPE.visible;
  if (!this.visible) return;
  for (var i = 0; i < SIV_SCOPE.CLOCK_SCOPE.timeDisplayText.length; i++) {
    if (SIV_SCOPE.CLOCK_SCOPE.timeDisplayText[i].length) {
      this.addText(Mustache.render(SIV_SCOPE.CLOCK_SCOPE.timeDisplayText[i], SIV_SCOPE.TIME_SCOPE.getTime(null, true)))
    }
  }
};

   }
 })
