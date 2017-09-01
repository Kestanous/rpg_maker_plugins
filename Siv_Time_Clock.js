/*:
  * @plugindesc (v1.0.0) [requires Siv_Plugin_Sanity v0.1.0] In-game time system UI
  *
  * Released under MIT license, https://github.com/Sivli-Embir/rpg_maker_plugins/blob/master/LICENSE
  *
  * @author Sivli Embir
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

///////////////////////////////////////////////////////////////////
// Plugin registation with Siv_Plugin_Sanity dependency manager. //
///////////////////////////////////////////////////////////////////
 SIV_SCOPE.definePlugin({
   name: 'Siv_Time_Clock',
   requires: ['Siv_Time_Core'],
   plugin: function() {

     //==============================
     // * createDisplayObjects
     //==============================
     SIV_SCOPE.onSceneEvent('map', 'addObjects', function(mapId, oldMapId) {
       var clock = new Window_Clock();
       this.addChild(clock)
     })

     //TODO: Rrefresh rate limit
     //TODO: get window size

     //=============================================================================
     // ** Window_Time_Status
     //=============================================================================
     function Window_Clock() {
         this.initialize.apply(this, arguments);
     };

     Window_Clock.prototype = Object.create(Window_Base.prototype);
     Window_Clock.prototype.constructor = Window_Clock;

     //==============================
     // * Initialize
     //==============================
     Window_Clock.prototype.initialize = function() {
        var positionX = this.percentX(100, 100)
        var positionY = this.percentY(0, 100)
        Window_Base.prototype.initialize.call(this, positionX, positionY, 100, 100);
     // 	this.contents.fontSize = 20;
     // 	this._window_size = [-500,-500,0,0];
     // 	this._old_play_time = $gameSystem.playtime();
      //  this.visible = true;
      //  this.contentsOpacity = 100;
      //  this.set_window_size();
     };

     //==============================
     // * Set Window Size
     //==============================
    //  Window_Clock.prototype.set_window_size = function() {
    //    console.log('set_window_size');
    //     this.y = 100;
    //     this.x = 100;
    //     this.height = 120;
    //     this._mode = 1;
    //     this._window_size = [this.x - ($gameMap.tileWidth() / 2),this.y - $gameMap.tileHeight()
    //     , this.width + this.x - $gameMap.tileWidth(),this.height + this.y];
    //     this.refresh();
    //  };
    Window_Clock.prototype.percentX(target, offset) {
       return _percent(Graphics.boxWidth, target, offset);
     }
     Window_Clock.prototype.percentY(target, offset) {
       return _percent(Graphics.boxHeight, target, offset);
     }
     Window_Clock.prototype._percent(fullSize, target, offset) {
       var pix = fullSize * (target / 100);
       if (pix + offset > fullSize) return fullSize - offset;
       return pix;
     }

     //==============================
     // * Refresh
     //==============================
     Window_Clock.prototype.refresh = function() {
       console.log('refresh');
       this.contents.clear();
   	   this.draw_time_contents();
     };

     //==============================
     // * Update
     //==============================
    //  Window_Clock.prototype.update = function() {
    //  	Window_Base.prototype.update.call(this);
    //   this.refresh()
    //  // 	this.visible = this.need_visible();
    //   // console.log('update');
    //   // if ($gameSystem._refresh_window_time) {this.refresh();}
    //  // 	if (this.need_fade()) {this.opacity -= 15;}
    //  // 	else {this.opacity += 15};
    //  // 	this.contentsOpacity = this.opacity;
    //  // 	if (this._mode === 0 && this._old_play_time != $gameSystem.playtime()) {
    //  // 	  this.refresh(); this._old_play_time = $gameSystem.playtime()
    //  // 	};
    //  };

     //==============================
     // * Need Visible
     //==============================
     Window_Clock.prototype.need_visible = function() {
     	return $gameSystem._time_window_visible;
     };

     //==============================
     // * Need Fade
     //==============================
     Window_Clock.prototype.need_fade = function() {
     	if ($gamePlayer.screen_realX() < this._window_size[0]) {return false};
     	if ($gamePlayer.screen_realX() > this._window_size[2]) {return false};
     	if ($gamePlayer.screen_realY() < this._window_size[1]) {return false};
     	if ($gamePlayer.screen_realY() > this._window_size[3]) {return false};
     	if (this.opacity < 100) {return false};
     	return true;
     };

     //==============================
     // * Draw Time Contents
     //==============================
     Window_Clock.prototype.draw_time_contents = function() {
        var x = this.width - 130;
        var y = 26;
        console.log('draw_time_contents');
        this.contents.drawText('Hello World', 10, 10, 10, 10, "right");
        // if (this.pm_mode) {var apm = " am";if ($gameSystem.hour() >= 12) {var apm = " pm"};
     	 //   this.contents.drawText($gameSystem.hour_pm() + ":" +  $gameSystem.minute().padZero(2) + apm, x, 0, 90,32,"right");
        // }
        // else {
        //    this.contents.drawText($gameSystem.hour().padZero(2) + ":" +  $gameSystem.minute().padZero(2), x, 0, 90,32,"right");
        // };
        // if (this._mode === 1) {
        //     this.contents.drawText(Moghunter.day_word, 0, y, 90,32);
     	 //   var text = $gameSystem.day_week_name() + " " + $gameSystem.month().padZero(2) + "/" + $gameSystem.day().padZero(2);
     	 //   this.contents.drawText(text, x - 30, y, 120,32,"right");
     	 //   this.contents.drawText(Moghunter.year_word, 0, y * 2, 90,32);
     	 //   var text = $gameSystem.year() + " " + $gameSystem.season_name();
     	 //   this.contents.drawText(text, x - 30, y * 2, 120,32,"right");
        // }
        // else {
     	 //   this.contents.drawText($gameSystem.day(), x, y, 90,32,"right");
     	 //   this.contents.drawText(Moghunter.day_word, 0, y, 90,32);
     	 //   this.contents.drawText($gameSystem.day(), x, y, 90,32,"right");
     	 //   this.contents.drawText(Moghunter.day_week_word, 0, y * 2, 90,32);
     	 //   this.contents.drawText($gameSystem.day_week_name(), x, y * 2, 90,32,"right");
     	 //   this.contents.drawText(Moghunter.month_word, 0, y * 3, 90,32);
     	 //   this.contents.drawText($gameSystem.month_name(), x, y * 3, 90,32,"right");
     	 //   this.contents.drawText(Moghunter.year_word, 0, y * 4, 90,32);
     	 //   this.contents.drawText($gameSystem.year(), x, y * 4, 90,32,"right");
     	 //   this.contents.drawText(Moghunter.season_word, 0, y * 5, 90,32);
     	 //   this.contents.drawText($gameSystem.season_name(), x, y * 5, 90,32,"right");
     	 //   this.contents.drawText(Moghunter.play_time_word, 0, y * 6, 90,32);
     	 //   this.contents.drawText($gameSystem.playtimeText(), x, y * 6, 90,32,"right");
        // };
     };

   }
 })
