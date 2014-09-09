//interpolate template settings
_.templateSettings = {
	interpolate : /\{\{(.+?)\}\}/g
};

// UI UTILITIES

(function($, Game, undefined) {

	Game.ENGINE = Game.ENGINE || {};
	Game.ENGINE.UI = Game.ENGINE.UI || {};

	Game.ENGINE.UI = (function() {

		var _public = {
			render : function(contents, target) {
				target.append(contents);
				return this;
			},
			clearConsole : function() {
				$("#msgWindow").empty();
				return this;
			},
			writeMessage : function(msg) {
				$("#msgWindow").append(msg + "<br/>");
				$("#gameConsole").animate({
					scrollTop : $('#msgWindow').prop("scrollHeight")
				}, 0).promise().done(function() {
					Game.ENGINE.UI.refreshStatsContainer();
				});
			},
			refreshStatsContainer : function() {
				$("#statsContainer").empty();
				var template = _
						.template("<span class=\"stats\" ><span class=\"statName\">Level:</span>  <span id=\"#playerLevel\">{{ level }}</span> </span>"
								+ "<span class=\"stats\" ><span class=\"statName\">Exp:</span>	 <span id=\"#playerExp\">{{ exp }}</span> </span>"
								+ "<span class=\"stats\" ><span class=\"statName\">HP:</span>	 <span id=\"playerHP\">{{ currentHp }}</span> </span>"
								+ "<span class=\"stats\" ><span class=\"statName\">MP:</span>	 <span id=\"playerMP\">{{ mp }}</span> </span>"
								+ "<span class=\"stats\" ><span class=\"statName\">Gold:</span>	 <span id=\"playerMP\">{{ gold }}</span> </span>");

				this.render(template(Game.ENGINE.Environment.player),
						$("#statsContainer"));

			}
		};

		return _public;
	})();

})(jQuery, window.Game = window.Game || {});

// BATTLE ENGINE CORE
(function($, Game, undefined) {

	Game.ENGINE = Game.ENGINE || {};
	Game.ENGINE.Core = (function() {

		var _public = {

			startGame : function() {
				this.startBattle(Game.ENGINE.Environment.monsters[1001]);
			},
			startBattle : function(monster) {
				var player = Game.ENGINE.Environment.player;
				var localMonster = {};
				$.extend(localMonster, monster);
				var slaying = true;
				var totalDealtDamage = 0;
				var totalReceivedDamage = 0;
				var gainedExp = 0;
				while (slaying) {

					var youHit = Math.floor(Math.random()
							+ (player.accuracy / 100)); // your chance to hit
					var monsterHit = Math.floor(Math.random()
							+ (localMonster.accuracy / 100)); // monsters
																// chance to hit

					if (youHit) {
						var criticalHit = Math.floor(Math.random()
								+ (player.critical / 100));
						if (criticalHit) {
							var damageThisRound = Math.floor(Math.random()
									* (player.attack * 1.5) + 1); // calculates
																	// user
																	// damage
							Game.ENGINE.UI
									.writeMessage("Critical Hit! You deal the "
											+ damageThisRound
											+ " of damage to the "
											+ localMonster.name);
							localMonster.hp -= damageThisRound;
						} else {
							var damageThisRound = Math.floor(Math.random()
									* player.attack + 1); // calculates user
															// damage
							Game.ENGINE.UI.writeMessage("You deal  "
									+ damageThisRound + " of damage to the "
									+ localMonster.name);
							localMonster.hp -= damageThisRound;
						}

						if (localMonster.hp <= 0) {
							gainedExp = localMonster.exp;
							Game.ENGINE.UI.writeMessage("you defeated the "
									+ localMonster.name + "! You earned "
									+ gainedExp + " exp points!");
							slaying = false;
							continue;
						}
					} else {
						Game.ENGINE.UI.writeMessage("The " + localMonster.name
								+ " dogged your attack!");
					}

					if (monsterHit) {
						var criticalHit = Math.floor(Math.random()
								+ (localMonster.critical / 100));
						if (criticalHit) {
							var damageThisRound = Math.floor(Math.random()
									* (localMonster.attack * 1.5) + 1); // calculates
																		// user
																		// damage
							Game.ENGINE.UI
									.writeMessage("Critical Hit! You lose "
											+ damageThisRound
											+ " hp due to an attack of a "
											+ localMonster.name);
							player.currentHp -= damageThisRound;

						} else {
							var damageThisRound = Math.floor(Math.random()
									* localMonster.attack + 1); // calculates
																// user damage
							Game.ENGINE.UI.writeMessage("You lose "
									+ damageThisRound
									+ " hp due to an attack of a "
									+ localMonster.name);
							player.currentHp -= damageThisRound;
						}

						if (player.currentHp <= 0) {
							Game.ENGINE.UI
									.writeMessage("you were defeated... Game over!!");
							slaying = false;
						}
					} else {
						Game.ENGINE.UI.writeMessage("You dogged the attack!!");
					}

				}
				this.endBattle(player, gainedExp);

			},
			endBattle : function(player, gainedExp) {
				this.checkLevelUp(player, gainedExp);
			},
			expTable : _.memoize(function() {
				var levels = 40;
				var table = {};
				var xp_for_first_level = 20;
				var xp_for_last_level = 5000;

				var B = Math.log(xp_for_last_level / xp_for_first_level)
						/ (levels - 1);
				var A = xp_for_first_level / (Math.exp(B) - 1.0);

				for (var i = 1; i <= levels; i++) {
					var old_xp = Math.round(A * Math.exp(B * (i - 1)));
					var new_xp = Math.round(A * Math.exp(B * i));
					table[i] = (new_xp - old_xp);
				}

				return table;

			}),
			checkLevelUp : function(player, gainedExp) {

				var gainedLvls = _.filter(Game.ENGINE.Environment.expTable,
						function(exp) {
							return ((exp > player.exp) && (exp < player.exp
									+ gainedExp));
						});
				player.exp += gainedExp;
				if (!_.isEmpty(gainedLvls)) {
					_
							.each(
									gainedLvls,
									function() {
										var gainedHP = _.random(7, 12);
										var gainedMP = _.random(2, 5);
										var gainedAttack = _.random(8, 9);
										var gainedDefense = _.random(4, 6);
										var gainedMaxLoot = _.random(0, 1);
										var gainedCritical = _.random(0, 1);
										var gainedAccuracy = (player.lvl % 2 == 0) ? 1
												: 0;

										player.level++;
										player.hp += gainedHP;
										player.mp += gainedMP;
										player.attack += gainedAttack;
										player.defense += gainedDefense;
										player.accuracy += gainedAccuracy;
										player.max_loot += gainedMaxLoot;
										player.criticyaal += gainedCritical;
										player.currentHp = player.hp;
										player.currentMp = player.mp;

										Game.ENGINE.UI
												.writeMessage("<strong>Congratulations! You advanced to lvl "
														+ player.level
														+ " </strong> ");

									});
				}

			}
		};

		return _public;
	})();

})(jQuery, window.Game = window.Game || {});

// Environment

(function($, Game, undefined) {

	Game.ENGINE = Game.ENGINE || {};

	Game.ENGINE.Environment = {

		// This is the exp table	
		expTable : Game.ENGINE.Core.expTable(),
		// This defines our grid's size and the size of each of its tiles
		  map_grid: {
		    width:  24,
		    height: 16,
		    tile: {
		      width:  32,
		      height: 32
		    }
		  },
		 
		  // The total width of the game screen. Since our grid takes up the entire screen
		  //  this is just the width of a tile times the width of the grid
		  width: function() {
		    return this.map_grid.width * this.map_grid.tile.width;
		  },
		 
		  // The total height of the game screen. Since our grid takes up the entire screen
		  //  this is just the height of a tile times the height of the grid
		  height: function() {
		    return this.map_grid.height * this.map_grid.tile.height;
		  },
		  
		  // Initialize and start our game
		  start: function() {
		    // Start crafty and set a background color so that we can see it's working
		    Crafty.init(this.width(), this.height());
		    Crafty.background('rgb(87, 109, 20)');
		 
		    // Simply start the "Loading" scene to get things going
		    Crafty.scene('Loading');
		  },
		  
		
		player : {
			level : 1,
			exp : 1,
			hp : 50,
			mp : 5,
			attack : 5,
			defense : 1,
			accuracy : 80,
			items : [],
			gold : 0,
			critical : 5,
			currentHp : 50,
			currentMp : 5
		},

		monsters : {
			1001 : {
				id : 1001,
				name : "slime",
				hp : 10,
				level : 1,
				attack : 1,
				defense : 1,
				accuracy : 80,
				max_loot : 10,
				critical : 1,
				exp : 2
			},
			1002 : {
				id : 1002,
				name : "ghost",
				hp : 10,
				level : 1,
				attack : 1,
				defense : 1,
				accuracy : 80,
				max_loot : 10,
				critical : 2,
				exp : 3
			}
		}
	};

})(jQuery, window.Game = window.Game || {});

(function($, Game, undefined) {

	Game.ENGINE = Game.ENGINE || {};

	Game.ENGINE.Init = function() {
		Game.ENGINE.UI.refreshStatsContainer();
		$(".clearLog").on("click", Game.ENGINE.UI.clearConsole);
		$("#startBattle").on("click", function() {
			Game.ENGINE.Core.startGame();			
		});
		Game.ENGINE.Environment.start();
	};

})(jQuery, window.Game = window.Game || {});
