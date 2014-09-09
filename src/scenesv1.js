// Game scene
// -------------
// Runs the core gameplay loop
Crafty.scene('Game', function() {
  // A 2D array to keep track of all occupied tiles
  this.occupied = new Array(Game.ENGINE.Environment.map_grid.width);
  for (var i = 0; i < Game.ENGINE.Environment.map_grid.width; i++) {
    this.occupied[i] = new Array(Game.ENGINE.Environment.map_grid.height);
    for (var y = 0; y < Game.ENGINE.Environment.map_grid.height; y++) {
      this.occupied[i][y] = false;
    }
  }
 

 
  // Place a tree at every edge square on our grid of 16x16 tiles
  for (var x = 0; x < Game.ENGINE.Environment.map_grid.width; x++) {
    for (var y = 0; y < Game.ENGINE.Environment.map_grid.height; y++) {
      var at_edge = x == 0 || x == Game.ENGINE.Environment.map_grid.width - 1 ||
                    y == 0 || y == Game.ENGINE.Environment.map_grid.height - 1;
		Crafty.e('Grass').at(x, y);
      if (at_edge) {
        // Place a tree entity at the current tile
        Crafty.e('Tree').at(x, y);
        this.occupied[x][y] = true;
      } else if (Math.random() < 0.06 && !this.occupied[x][y]) {
        // Place a bush entity at the current tile
        var bush_or_rock = (Math.random() > 0.3) ? 'Bush' : 'Rock';
        Crafty.e(bush_or_rock).at(x, y);
        this.occupied[x][y] = true;
      }
    }
  }
 
  // Generate five graves on the map in random locations
  var max_graves = 5;
  for (var x = 0; x < Game.ENGINE.Environment.map_grid.width; x++) {
    for (var y = 0; y < Game.ENGINE.Environment.map_grid.height; y++) {
      if (Math.random() < 0.03) {
        if (Crafty('Grave').length < max_graves && !this.occupied[x][y]) {
          Crafty.e('Grave').at(x, y);
        }
      }
    }
  }
 
   // Generate five monsters
  var max_monsters = 5;
  for (var x = 0; x < Game.ENGINE.Environment.map_grid.width; x++) {
    for (var y = 0; y < Game.ENGINE.Environment.map_grid.height; y++) {
      if (Math.random() < 0.03) {
        if (Crafty('Monster').length < max_monsters && !this.occupied[x][y]) {
          Crafty.e('Monster').at(x, y);
        }
      }
    }
  }
    // Player character, placed at 5, 5 on our grid
  this.player = Crafty.e('PlayerCharacter').at(5, 5);
  this.occupied[this.player.at().x][this.player.at().y] = true;
  
  // Play a ringing sound to indicate the start of the journey
  Crafty.audio.play('ring');
 //battle
 this.start_battle = this.bind('StartBattle', function() {    
      Crafty.scene('Battle_Phase');    
	  /* if (!Crafty('Monster').length) {
      Crafty.scene('Victory');
    }*/
  });
  
  
  // Show the victory screen once all monsters are killed
  this.show_victory = this.bind('MonsterKilled', function() {
    if (!Crafty('Monster').length) {
      Crafty.scene('Victory');
    }
  });
  
  
}, function() {
  // Remove our event binding from above so that we don't
  //  end up having multiple redundant event watchers after
  //  multiple restarts of the game
  this.unbind('MonsterKilled', this.show_victory);
}



);//end Game
 
 
// Victory scene
// -------------
// Tells the player when they've won and lets them start a new game
Crafty.scene('Victory', function() {
  // Display some text in celebration of the victory
  Crafty.e('2D, DOM, Text')
    .text('killed all monsters!')
    .attr({ x: 0, y: Game.ENGINE.Environment.height()/2 - 24, w: Game.ENGINE.Environment.width() })
    .css($text_css);
 
  // Give'em a round of applause!
  Crafty.audio.play('applause');
 
  // After a short delay, watch for the player to press a key, then restart
  // the game when a key is pressed
  var delay = false;
  
  this.restart_game = Crafty.bind('KeyDown', function() {
    if (!delay) {
      Crafty.scene('Game'); 
    }
  });
}, function() {
  // Remove our event binding from above so that we don't
  //  end up having multiple redundant event watchers after
  //  multiple restarts of the game
  this.unbind('KeyDown', this.restart_game);
});
 
// Loading scene
// -------------
// Handles the loading of binary assets such as images and audio files
Crafty.scene('Loading', function(){
  // Draw some text for the player to see in case the file
  //  takes a noticeable amount of time to load
  Crafty.e('2D, DOM, Text')
    .text('Loading; please wait...')
    .attr({ x: 0, y: Game.ENGINE.Environment.height()/2 - 24, w: Game.ENGINE.Environment.width() })
    .css({
    	  'font-size': '24px',
    	  'font-family': 'Arial',
    	  'color': 'white',
    	  'text-align': 'center'
    	});
 
  // Load our sprite map image
  Crafty.load([
    'assets/16x16_forest_2.gif',
    'assets/hunter.png',
    'assets/door_knock_3x.mp3',
    'assets/door_knock_3x.ogg',
    'assets/door_knock_3x.aac',
    'assets/board_room_applause.mp3',
    'assets/board_room_applause.ogg',
    'assets/board_room_applause.aac',
    'assets/candy_dish_lid.mp3',
    'assets/candy_dish_lid.ogg',
    'assets/candy_dish_lid.aac'
    ], function(){
    // Once the images are loaded...
 
    // Define the individual sprites in the image
    // Each one (spr_tree, etc.) becomes a component
    // These components' names are prefixed with "spr_"
    //  to remind us that they simply cause the entity
    //  to be drawn with a certain sprite
    Crafty.sprite(32, 'assets/env32x32.png', {
      spr_tree:    [0, 0],
      spr_bush:    [1, 0],
      spr_grave: [0, 1],
      spr_rock:    [1, 1]	  
    });
	
	Crafty.sprite(32, 'assets/grass32x32.png', {
      spr_grass:    [0, 0]     
    });
	Crafty.sprite(32, 'assets/player32x32.png', {
      spr_player:  [0, 0]
    });	
    Crafty.sprite(32, 'assets/orc32x32.png', {
      spr_monster:  [0, 0]
    });
 
    
    
 
    // Define our sounds for later use
    Crafty.audio.add({
      knock:     ['assets/door_knock_3x.mp3',
                  'assets/door_knock_3x.ogg',
                  'assets/door_knock_3x.aac'],
      applause:  ['assets/board_room_applause.mp3',
                  'assets/board_room_applause.ogg',
                  'assets/board_room_applause.aac'],
      ring:      ['assets/candy_dish_lid.mp3',
                  'assets/candy_dish_lid.ogg',
                  'assets/candy_dish_lid.aac']
    });
 
    // Now that our sprites are ready to draw, start the game
    Crafty.scene('Game');
  })
});


// Battle scene
// -------------
// Tells the player when they've won and lets them start a new game
Crafty.scene('Battle_Phase', function() {
  Crafty.e('2D, DOM, Text')
    .text('These will take you to the battle stuff')
    .attr({ x: 0, y: Game.ENGINE.Environment.height()/2 - 24, w: Game.ENGINE.Environment.width() })
    .css($text_css);
 
  // After a short delay, watch for the player to press a key, then restart
  // the game when a key is pressed
  var delay = false;
  
  this.restart_game = Crafty.bind('KeyDown', function() {
    if (!delay) {
      Crafty.scene('Game');
    }
  });
}, function() {
  // Remove our event binding from above so that we don't
  //  end up having multiple redundant event watchers after
  //  multiple restarts of the game
  this.unbind('KeyDown', this.restart_game);
});