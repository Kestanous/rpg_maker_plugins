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
  * By using plugin commands you can build randomly generate loot for chests.
  * A standard example, in a common event:
  * - Plugin Command: Siv_Chest setup 1
  * - Plugin Command: Siv_Chest item 1
  * - Plugin Command: Siv_Chest item 2
  * - Plugin Command: Siv_Chest give
  * This will give out 1 item with id 1 or 2. In this example setup is optional.
  * You can load in as many items (or weapons and armors) as you want. Only
  * when you call "give" does the event actually give the player anything.
  *
  * Be careful and always call "give" when you are done as the loot list will
  * exits until it is called or the game is closed. You can also build random
  * chests out of map events if you wish.
  *
  * ============================================================================
  * Plugin Commands
  * ============================================================================
  * Plugin Command: Siv_Chest setup count unlimited
  * - this builds the chest settings.
  * -- count is the number of item sets you want to give to the player.
  * -- if unlimited is true the chest can give out the same set as many times
  * as the count allows. By default a set loses 1 weight each time it is given.
  *
  * Plugin Command: Siv_Chest type id weight min max
  * - this adds a set to the loot list.
  * -- type: item, weapon, armor
  * -- id: the index of the game item.
  * -- weight: the likelyhood of this set being given. the chances are:
  * (this set weight / total weight). By default set weight is 1. So if there
  * are three sets with 1 weight there is a 1/3 chance of giving this set.
  * -- min: the minimum number of this item to give. Default 1.
  * -- max: if max, the chest will randomly give (min to max) number of this
  * item EACH time it is called. So if you have chest "setup 3" and
  * "item 1 3 1 3" (say potion id = 1) and this item gets called 3 times it
  * will give 3 to 9 potions.
  *
  * Plugin Command: Siv_Chest give
  * - When you are done adding items to the loot list call give to run the chest
  * event and actually give the loot to the player.
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
   plugin: function() {


var defaults = {
  distribute: 1,
  unlimited: false
}

SIV_SCOPE.CHEST_SCOPE = {
  parameters: PluginManager.parameters('Siv_Random_Chest'),
  chest: [],
  chestSettings: Object.assign({}, defaults)
}

// TODO: replace static text with dynamic vars
SIV_SCOPE.CHEST_SCOPE.youFound = 'You found'
SIV_SCOPE.CHEST_SCOPE.punctuation = "!"

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
  SIV_SCOPE.CHEST_SCOPE.displayResults.call(this, items)
  SIV_SCOPE.CHEST_SCOPE.chestSettings = Object.assign({}, defaults)
  SIV_SCOPE.CHEST_SCOPE.chest = []
}

SIV_SCOPE.CHEST_SCOPE.displayResults = function(items) {
  var text = SIV_SCOPE.CHEST_SCOPE.youFound + ' ', itemNames = Object.keys(items);
  for (var i = 0; i < itemNames.length; i++) {
    if (i != 0) {
      if (i == itemNames.length - 1) {
        if (i == 1) text += ' and '
        else text += ', and '
      }
      else text += ', '
    }
    if (items[itemNames[i]] > 1) text += items[itemNames[i]] + ' ';
    else text += indefiniteArticle(itemNames[i]) + ' '
    text += pluralize(itemNames[i], items[itemNames[i]])
  }
  $gameMessage.add(text + SIV_SCOPE.CHEST_SCOPE.punctuation);
}


  }
});

/**
 * pluralize
 * https://github.com/blakeembrey/pluralize
 * https://github.com/blakeembrey/pluralize/blob/master/LICENSE
 */
!function(e,a){"function"==typeof require&&"object"==typeof exports&&"object"==typeof module?module.exports=a():"function"==typeof define&&define.amd?define(function(){return a()}):e.pluralize=a()}(this,function(){function e(e){return"string"==typeof e?new RegExp("^"+e+"$","i"):e}function a(e,a){return e===a?a:e===e.toUpperCase()?a.toUpperCase():e[0]===e[0].toUpperCase()?a.charAt(0).toUpperCase()+a.substr(1).toLowerCase():a.toLowerCase()}function i(e,a){return e.replace(/\$(\d{1,2})/g,function(e,i){return a[i]||""})}function s(e,s){return e.replace(s[0],function(r,o){var t=i(s[1],arguments);return""===r?a(e[o-1],t):a(r,t)})}function r(e,a,i){if(!e.length||c.hasOwnProperty(e))return a;for(var r=i.length;r--;){var o=i[r];if(o[0].test(a))return s(a,o)}return a}function o(e,i,s){return function(o){var t=o.toLowerCase();return i.hasOwnProperty(t)?a(o,t):e.hasOwnProperty(t)?a(o,e[t]):r(t,o,s)}}function t(e,a,i,s){return function(s){var o=s.toLowerCase();return!!a.hasOwnProperty(o)||!e.hasOwnProperty(o)&&r(o,o,i)===o}}function n(e,a,i){var s=1===a?n.singular(e):n.plural(e);return(i?a+" ":"")+s}var u=[],l=[],c={},h={},$={};return n.plural=o($,h,u),n.isPlural=t($,h,u),n.singular=o(h,$,l),n.isSingular=t(h,$,l),n.addPluralRule=function(a,i){u.push([e(a),i])},n.addSingularRule=function(a,i){l.push([e(a),i])},n.addUncountableRule=function(e){"string"!=typeof e?(n.addPluralRule(e,"$0"),n.addSingularRule(e,"$0")):c[e.toLowerCase()]=!0},n.addIrregularRule=function(e,a){a=a.toLowerCase(),e=e.toLowerCase(),$[e]=a,h[a]=e},[["I","we"],["me","us"],["he","they"],["she","they"],["them","them"],["myself","ourselves"],["yourself","yourselves"],["itself","themselves"],["herself","themselves"],["himself","themselves"],["themself","themselves"],["is","are"],["was","were"],["has","have"],["this","these"],["that","those"],["echo","echoes"],["dingo","dingoes"],["volcano","volcanoes"],["tornado","tornadoes"],["torpedo","torpedoes"],["genus","genera"],["viscus","viscera"],["stigma","stigmata"],["stoma","stomata"],["dogma","dogmata"],["lemma","lemmata"],["schema","schemata"],["anathema","anathemata"],["ox","oxen"],["axe","axes"],["die","dice"],["yes","yeses"],["foot","feet"],["eave","eaves"],["goose","geese"],["tooth","teeth"],["quiz","quizzes"],["human","humans"],["proof","proofs"],["carve","carves"],["valve","valves"],["looey","looies"],["thief","thieves"],["groove","grooves"],["pickaxe","pickaxes"],["whiskey","whiskies"]].forEach(function(e){return n.addIrregularRule(e[0],e[1])}),[[/s?$/i,"s"],[/[^\u0000-\u007F]$/i,"$0"],[/([^aeiou]ese)$/i,"$1"],[/(ax|test)is$/i,"$1es"],[/(alias|[^aou]us|tlas|gas|ris)$/i,"$1es"],[/(e[mn]u)s?$/i,"$1s"],[/([^l]ias|[aeiou]las|[emjzr]as|[iu]am)$/i,"$1"],[/(alumn|syllab|octop|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i,"$1i"],[/(alumn|alg|vertebr)(?:a|ae)$/i,"$1ae"],[/(seraph|cherub)(?:im)?$/i,"$1im"],[/(her|at|gr)o$/i,"$1oes"],[/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i,"$1a"],[/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i,"$1a"],[/sis$/i,"ses"],[/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i,"$1$2ves"],[/([^aeiouy]|qu)y$/i,"$1ies"],[/([^ch][ieo][ln])ey$/i,"$1ies"],[/(x|ch|ss|sh|zz)$/i,"$1es"],[/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i,"$1ices"],[/(m|l)(?:ice|ouse)$/i,"$1ice"],[/(pe)(?:rson|ople)$/i,"$1ople"],[/(child)(?:ren)?$/i,"$1ren"],[/eaux$/i,"$0"],[/m[ae]n$/i,"men"],["thou","you"]].forEach(function(e){return n.addPluralRule(e[0],e[1])}),[[/s$/i,""],[/(ss)$/i,"$1"],[/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i,"$1fe"],[/(ar|(?:wo|[ae])l|[eo][ao])ves$/i,"$1f"],[/ies$/i,"y"],[/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i,"$1ie"],[/\b(mon|smil)ies$/i,"$1ey"],[/(m|l)ice$/i,"$1ouse"],[/(seraph|cherub)im$/i,"$1"],[/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|tlas|gas|(?:her|at|gr)o|ris)(?:es)?$/i,"$1"],[/(analy|ba|diagno|parenthe|progno|synop|the|empha|cri)(?:sis|ses)$/i,"$1sis"],[/(movie|twelve|abuse|e[mn]u)s$/i,"$1"],[/(test)(?:is|es)$/i,"$1is"],[/(alumn|syllab|octop|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i,"$1us"],[/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i,"$1um"],[/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i,"$1on"],[/(alumn|alg|vertebr)ae$/i,"$1a"],[/(cod|mur|sil|vert|ind)ices$/i,"$1ex"],[/(matr|append)ices$/i,"$1ix"],[/(pe)(rson|ople)$/i,"$1rson"],[/(child)ren$/i,"$1"],[/(eau)x?$/i,"$1"],[/men$/i,"man"]].forEach(function(e){return n.addSingularRule(e[0],e[1])}),["adulthood","advice","agenda","aid","alcohol","ammo","anime","athletics","audio","bison","blood","bream","buffalo","butter","carp","cash","chassis","chess","clothing","cod","commerce","cooperation","corps","debris","diabetes","digestion","elk","energy","equipment","excretion","expertise","flounder","fun","gallows","garbage","graffiti","headquarters","health","herpes","highjinks","homework","housework","information","jeans","justice","kudos","labour","literature","machinery","mackerel","mail","media","mews","moose","music","manga","news","pike","plankton","pliers","pollution","premises","rain","research","rice","salmon","scissors","series","sewage","shambles","shrimp","species","staff","swine","tennis","traffic","transporation","trout","tuna","wealth","welfare","whiting","wildebeest","wildlife","you",/[^aeiou]ese$/i,/deer$/i,/fish$/i,/measles$/i,/o[iu]s$/i,/pox$/i,/sheep$/i].forEach(n.addUncountableRule),n});

/**
 * indefinite-article
 * https://github.com/rigoneri/indefinite-article.js
 * https://github.com/rigoneri/indefinite-article.js/blob/master/LICENSE
 */
window.indefiniteArticle=function(e){var n=/\w+/.exec(e);if(!n)return"an";var r=n[0],a=r.toLowerCase(),i=["honest","hour","hono"];for(var o in i)if(0==a.indexOf(i[o]))return"an";if(1==a.length)return"aedhilmnorsx".indexOf(a)>=0?"an":"a";if(r.match(/(?!FJO|[HLMNS]Y.|RY[EO]|SQU|(F[LR]?|[HL]|MN?|N|RH?|S[CHKLMNPTVW]?|X(YL)?)[AEIOU])[FHLMNRSX][A-Z]/))return"an";regexes=[/^e[uw]/,/^onc?e\b/,/^uni([^nmd]|mo)/,/^u[bcfhjkqrst][aeiou]/];for(var o in regexes)if(a.match(regexes[o]))return"a";return r.match(/^U[NK][AIEO]/)?"a":r==r.toUpperCase()?"aedhilmnorsx".indexOf(a[0])>=0?"an":"a":"aeiou".indexOf(a[0])>=0?"an":a.match(/^y(b[lor]|cl[ea]|fere|gg|p[ios]|rou|tt)/)?"an":"a"};
