/*:
  * @plugindesc (v1.0.0) [requires Siv_Plugin_Sanity] Generate random loot in events.
  * Can be used for chests or other loot drop events.
  *
  * Released under MIT license, https://github.com/Sivli-Embir/rpg_maker_plugins/blob/master/LICENSE
  *
  * @author Sivli Embir & Noxx Embir
  *
  * @help
  * ============================================================================
  * Documentation
  * ============================================================================
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
   name: 'Siv_Random_Chest',
   requires: ['Siv_Plugin_Sanity'],
   plugin: function() {


var defaults = {
  distribute: 1,
  unlimited: false
}

SIV_SCOPE.CHEST_SCOPE = {
  parameters: PluginManager.parameters('Siv_Time_Chest'),
  chest: [],
  chestSettings: Object.assign({}, defaults)
}

// Siv_Tresure_List:
SIV_SCOPE.registerPluginCommand('Siv_Chest', function(command, args) {
  var type = args[0].toLowerCase();
  if (commandSwitch[type]) commandSwitch[type].call(this, args);
});


var commandSwitch = {}
commandSwitch["setup"] = function(args) {
  SIV_SCOPE.CHEST_SCOPE.chestSettings = Object.assign({}, defaults, {
    distribute: parseInt(args[1]),
    unlimited: (args[2] || '').toLowerCase() === 'true'
  })
}
commandSwitch["item"] = function(args) {
  for (var i = 0; i < (parseInt(args[2]) || 1); i++) {
    SIV_SCOPE.CHEST_SCOPE.chest.push({
      type: "Items",
      id: parseInt(args[1]),
      min: parseInt(args[3]),
      max: parseInt(args[4])
    })
  }
}
commandSwitch["weapon"] = function(args) {
  for (var i = 0; i < (parseInt(args[2]) || 1); i++) {
    SIV_SCOPE.CHEST_SCOPE.chest.push({
      type: "Weapons",
      id: parseInt(args[1]),
      min: parseInt(args[3]),
      max: parseInt(args[4])
    })
  }
}
commandSwitch["armor"] = function(args) {
  for (var i = 0; i < (parseInt(args[2]) || 1); i++) {
    SIV_SCOPE.CHEST_SCOPE.chest.push({
      type: "Armors",
      id: parseInt(args[1]),
      min: parseInt(args[3]),
      max: parseInt(args[4])
    })
  }
}
commandSwitch["give"] = function() {
  var items = {}
  for (var i = 0; i < SIV_SCOPE.CHEST_SCOPE.chestSettings.distribute; i++) {
    if (!SIV_SCOPE.CHEST_SCOPE.chest.length) break;
    var index = Math.randomInt(SIV_SCOPE.CHEST_SCOPE.chest.length)
    , itemData = SIV_SCOPE.CHEST_SCOPE.chest[index]
    , howMeny = itemData.min || 1
    , item = window['$data'+itemData.type][itemData.id];

    if (itemData.min && itemData.max) {
      howMeny =  Math.randomInt(itemData.max) + 1;
      if (howMeny < itemData.min) howMeny = itemData.min;
    }

    $gameParty.gainItem(item, howMeny)
    if (!items[item.name]) items[item.name] = 0;
    items[item.name] += howMeny

    if (!SIV_SCOPE.CHEST_SCOPE.chestSettings.unlimited) {
      SIV_SCOPE.CHEST_SCOPE.chest.shift(index, 1)
    }
  }

  console.log(items, SIV_SCOPE.CHEST_SCOPE.chestSettings, SIV_SCOPE.CHEST_SCOPE.chest);
  SIV_SCOPE.CHEST_SCOPE.chestSettings = Object.assign({}, defaults)
  SIV_SCOPE.CHEST_SCOPE.chest = []
}

  }
});
