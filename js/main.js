(function(){
	var Tile = function(type, orientation, fixed, entrance){
		this.type = type;
		this.orientation = orientation;
		this.fixed = fixed === undefined ? false : fixed;
		this.entrance = entrance === undefined ? -1 : entrance % 4; // spawn point for placer n (0-3)
		this.treasure = -1; // default value: -1 (no treasure)
		this.$container = null;
		this.x = -1;
		this.y = -1;
	};
	Tile.prototype.addShiftListener = function(listener) {
		var self = this;
		
		this.listener = listener;
		this.$container.click(function(){
			self.listener.shift(self.x, self.y);
			console.log('Move tile to ' + self.x + '/' + self.y);
		});
	};	
	Tile.prototype.setTreasure = function(treasure) {
		this.treasure = treasure;
	};
	Tile.prototype.createContainer = function() {
		var $container = this.$container = $('<div/>')
		  , classes = 'tile ' + Tile.getTypeClassName(this.type) + ' ' + Tile.getOrientationClassName(this.orientation)
					
		if (this.fixed) {
			classes += ' fixed';
		}
		if (this.entrance != -1) {
			var $entrance = $('<div/>').addClass('entrance ' + Tile.getPlayerClassName(this.entrance));
			$container.append($entrance);
		}		
		$container.attr('class', classes);
	};
	Tile.prototype.setPosition = function(x, y) {
		var xPos = Tile.SIZE_IN_PX + Tile.SIZE_IN_PX * x;
		var yPos = Tile.SIZE_IN_PX + Tile.SIZE_IN_PX * y;
		
		this.x = x;
		this.y = y;
		this.$container.css({'top' : yPos + 'px', 'left' : xPos + 'px'});
	};
	/**
	 * Animate movement.
	 * 
	 * @param x coordinate X
	 * @param y coordiante Y
	 * @see setPosition
	*/
	Tile.prototype.moveTo = function(x, y) {
		var xPos = Tile.SIZE_IN_PX + Tile.SIZE_IN_PX * x;
		var yPos = Tile.SIZE_IN_PX + Tile.SIZE_IN_PX * y;
		
		this.x = x;
		this.y = y;
		this.$container.css({'top' : yPos + 'px', 'left' : xPos + 'px'});
		// TODO add CSS animations
	};
	Tile.prototype.rotate = function() {
		switch (orientation) {
			case Tile.ORIENTATION.NORTH:
				this.$container.removeClass('north').addClass('east');
				this.orientation = Tile.ORIENTATION.EAST;
				break;
			case Tile.ORIENTATION.EAST:
				this.$container.removeClass('east').addClass('south');
				this.orientation = Tile.ORIENTATION.SOUTH;
				break;
			case Tile.ORIENTATION.SOUTH:
				this.$container.removeClass('south').addClass('west');
				this.orientation = Tile.ORIENTATION.WEST;
				break;
			case Tile.ORIENTATION.WEST:
				this.$container.removeClass('west').addClass('north');
				this.orientation = Tile.ORIENTATION.NORTH;
				break;
		}
	};
	Tile.getTypeClassName = function(type) {
		switch (type) {
			case Tile.TYPE.CORNER:   return 'corner';
			case Tile.TYPE.STRAIGHT: return 'straight';
			case Tile.TYPE.CROSSING: return 'crossing';
		}
	};
	Tile.getOrientationClassName = function(orientation) {
		switch (orientation) {
			case Tile.ORIENTATION.NORTH: return 'north';
			case Tile.ORIENTATION.EAST:  return 'east';
			case Tile.ORIENTATION.SOUTH: return 'south';
			case Tile.ORIENTATION.WEST:  return 'west';
		}
	};
	Tile.getPlayerClassName = function(player) {
		switch (player) {
			case Tile.PLAYER.RED:   return 'red';
			case Tile.PLAYER.BROWN: return 'brown';
			case Tile.PLAYER.WHITE: return 'white';
			case Tile.PLAYER.BLUE:  return 'blue';
		}
	};
	Tile.TYPE = {
		CORNER: 0,   // north:  |_
		STRAIGHT: 1, // north:  |
		CROSSING: 2  // north: _|_
	};
	Tile.ORIENTATION = {
		NORTH: 0,
		EAST: 1,
		SOUTH: 2,
		WEST: 3
	};
	Tile.PLAYER = {
		RED: 0,
		BROWN: 1,
		WHITE: 2,
		BLUE: 3
	};	
	Tile.SIZE_IN_PX = 78;

	var CrazyMaze = function(){	
		var maze = [
			[
				new Tile(Tile.TYPE.CORNER, Tile.ORIENTATION.EAST, true),
				null,
				new Tile(Tile.TYPE.CROSSING, Tile.ORIENTATION.SOUTH, true),
				null,
				new Tile(Tile.TYPE.CROSSING, Tile.ORIENTATION.SOUTH, true),
				null,
				new Tile(Tile.TYPE.CORNER, Tile.ORIENTATION.SOUTH, true)
			],
			[null, null, null, null, null, null, null],
			[
				new Tile(Tile.TYPE.CROSSING, Tile.ORIENTATION.EAST, true),
				null,
				new Tile(Tile.TYPE.CROSSING, Tile.ORIENTATION.EAST, true, Tile.PLAYER.RED),
				null,
				new Tile(Tile.TYPE.CROSSING, Tile.ORIENTATION.SOUTH, true, Tile.PLAYER.BROWN),
				null,
				new Tile(Tile.TYPE.CROSSING, Tile.ORIENTATION.WEST, true)
			],
			[null, null, null, null, null, null, null],
			[
				new Tile(Tile.TYPE.CROSSING, Tile.ORIENTATION.EAST, true),
				null,
				new Tile(Tile.TYPE.CROSSING, Tile.ORIENTATION.NORTH, true, Tile.PLAYER.WHITE),
				null,
				new Tile(Tile.TYPE.CROSSING, Tile.ORIENTATION.WEST, true, Tile.PLAYER.BLUE),
				null,
				new Tile(Tile.TYPE.CROSSING, Tile.ORIENTATION.WEST, true)
			],
			[null, null, null, null, null, null, null],
			[
				new Tile(Tile.TYPE.CORNER, Tile.ORIENTATION.NORTH, true),
				null,
				new Tile(Tile.TYPE.CROSSING, Tile.ORIENTATION.NORTH, true),
				null,
				new Tile(Tile.TYPE.CROSSING, Tile.ORIENTATION.NORTH, true),
				null,
				new Tile(Tile.TYPE.CORNER, Tile.ORIENTATION.WEST, true)
			]
		];
		this.freeTile = null;
		
		this.init = function() {
			var self = this;
			var type, orientation;
			var corners   = CrazyMaze.CORNERS;
			var straights = CrazyMaze.STRAIGHTS;
			var crossings = CrazyMaze.CROSSINGS;
			
			for (var row = 0; row < maze.length; ++row) {
				for (var col = 0; col < maze[row].length; ++col) {
					if (maze[row][col] == null) {
						type = Math.floor(Math.random() * 100) % 3;
						orientation = Math.floor(Math.random() * 100) % 4;
						
						// intentionally check all types for fallback
						if (type == Tile.TYPE.CORNER) {
							if (corners > 0) {
								corners--;
							} else {
								type = Tile.TYPE.STRAIGHT;
							}
						}
						if (type == Tile.TYPE.STRAIGHT) {
							if (straights > 0) {
								straights--;
							} else {
								type = Tile.TYPE.CROSSING;
							}
						}
						if (type == Tile.TYPE.CROSSING) {
							if (crossings > 0) {
								crossings--;
							}
						}
						
						maze[row][col] = new Tile(type, orientation);
					}
				}
			}
			
			orientation = Math.floor(Math.random() * 100) % 4;
			if (corners > 0) {
				this.freeTile = new Tile(Tile.TYPE.CORNER, orientation);
			} else if (straights > 0) {
				this.freeTile = new Tile(Tile.TYPE.STRAIGHT, orientation);
			} else {
				this.freeTile = new Tile(Tile.TYPE.CROSSING, orientation);
			}
		};
		
		this.render = function(){
			var $maze = $('#maze');
			
			for (var row = 0; row < maze.length; ++row) {
				for (var col = 0; col < maze[row].length; ++col) {
					var tile = maze[row][col];
					
					tile.createContainer();
					$maze.append(tile.$container);
					tile.setPosition(col, row);
					tile.addShiftListener(this);
				}
			}
			
			this.freeTile.createContainer();
			$maze.append(this.freeTile.$container);
			this.freeTile.setPosition(1, 7);
			this.freeTile.addShiftListener(this);
		};
		
		/**
		 * ShiftListener interface.
		*/
		this.shift = function(x, y) {
			if (x == 0) {
				this.shiftEast(x, y, this.freeTile);
			} else if (x == CrazyMaze.SIZE - 1) {
				this.shiftWest(x, y, this.freeTile);
			} else if (y == 0) {
				this.shiftSouth(x, y, this.freeTile);
			} else if (y == CrazyMaze.SIZE - 1) {
				this.shiftNorth(x, y, this.freeTile);
			}
			// else: ignore move
		};
		
		this.shiftNorth = function(x, y, tile) {
			// TODO check range
			var tmpTile, currTile = tile;
			
			for (var row = y; row > 0; --row) {
				currTile.moveTo(x, row);
				
				tmpTile = maze[row][x];
				maze[row][x] = currTile;
				currTile = tmpTile;
			}
			this.freeTile = currTile;
		};
		
		this.shiftSouth = function(x, y, tile) {
			// TODO check range
			var tmpTile, currTile = tile;
			
			for (var row = y; row < CrazyMaze.SIZE; ++row) {
				currTile.moveTo(x, row);
				
				tmpTile = maze[row][x];
				maze[row][x] = currTile;
				currTile = tmpTile;
			}
			this.freeTile = currTile;
		};
		
		this.shiftEast = function(x, y, tile) {
			// TODO check range
			var tmpTile, currTile = tile;
			
			for (var col = x; col > 0; --col) {
				currTile.moveTo(col, y);
				
				tmpTile = maze[y][col];
				maze[y][col] = currTile;
				currTile = tmpTile;
			}
			this.freeTile = currTile;
		};
		
		this.shiftWest = function(x, y, tile) {
			// TODO check range
			var tmpTile, currTile = tile;
			
			for (var col = x; col < CrazyMaze.SIZE; ++col) {
				currTile.moveTo(col, y);
				
				tmpTile = maze[y][col];
				maze[y][col] = currTile;
				currTile = tmpTile;
			}
			this.freeTile = currTile;
		};
	};
	CrazyMaze.CROSSINGS = 6;
	CrazyMaze.CORNERS = 15;
	CrazyMaze.STRAIGHTS = 13;
	CrazyMaze.SIZE = 7;
	
	$(function(){
		window.game = new CrazyMaze();
		
		window.game.init();
		window.game.render();
	});
})();

