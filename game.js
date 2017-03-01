var grid = []; 
var successfulRoute;
var lis = [];	
var massF = [];
var massT = [];
var massD = [];
var k = 0;
var sravnenie;
//Создаём треугольник 
function initGamePad() {
	var gp = document.getElementById("game_pad");
	var ul, li;
	var gridRow;
	var pos = 0;
	var n = 5;
	for (var i = 0; i < n; i++) {
		ul = document.createElement('ul');
		gridRow = [];
		for (var j = 0; j <= i; j++, pos++) {
			li = document.createElement('li');
			li.onclick = start;

			li.appendChild(document.createTextNode(pos+1));
			li._pos = pos;

			ul.appendChild(li);
			lis.push(li);		
			gridRow.push(pos);	
		}
		gp.appendChild(ul);
		grid[i] = gridRow; 
	}
}
//Отображает каждое перемещение на новом треугольнике
function newGamePad(pads, FROM, TO, lastComponent) {
	var ul, li;
	var pos = 0;
	var n = 5;
	FROM = FROM + 1;
	TO = TO + 1;
	var delta = (TO + FROM) / 2;
	if((TO + FROM) % 2 !== 0 ) delta = (TO + FROM - 1)/2;

	massD.push(delta);	
	massF.push(FROM);		

	for(var L = 0; L < pads.length; L++) {
		for(var J = L+1; J < pads.length; J++) {	
  			if(massD[J] === massT[L]) {
  				delete massT[L];
  			}
  			if(massF[J] === massT[L]) {
  				delete massT[L];
  			}
		}
	}		
	massT.push(TO);
	for (var i = 0; i < n; i++) {
		ul = document.createElement('ul');
		for (var j = 0; j <= i; j++, pos++) {
			li = document.createElement('li');
			if(k == 0) {
				li.className = 'filled';
			}
			li.appendChild(document.createTextNode(pos+1));	
			ul.appendChild(li);

			if($.inArray(pos+1, massD) !== -1) {
				li.className = '';
			}
			if($.inArray(pos+1, massF) !== -1) {
				li.className = '';
			}
			if($.inArray(pos+1, massT) !== -1) {
				li.className = 'filled';
			}
		}	
		game_pad2.appendChild(ul);
	}			
	if(lastComponent == -1) {
		massD = [];
		massF = [];
		massT = [];
	}		
}	
//Получает координаты для перемещения колышка
function showResult(route) {
	var rs = document.getElementById('result');
	rs.innerHTML = '';		

	var rss = document.getElementById('game_pad2');
	rss.innerHTML = '';

	var ul = document.createElement('ol');
	var li;
	for(var i=0 ; i<route.length ; i++) {
		li = document.createElement('li');
		li.appendChild(document.createTextNode('From: ' + (route[i].from+1) + ' - to: ' + (route[i].to+1)));
		if(i == route.length-1) {
			var lastComponent = -1;
		} else lastComponent = 0;

		newGamePad(route, route[i].from, route[i].to, lastComponent);
		ul.appendChild(li);
	}
	rs.appendChild(ul);
}
//Закрашивает в первом треугольнике всё, кроме выбранного круга
function startPlacing(startPos) {
	for(var i = 0; i < lis.length; i++) {
		li = lis[i];
		if(i != startPos) {
			li.className = 'filled';	
		}								
		else {
			li.className = '';
		}
	}
}
//Начало алгоритма
function start() {
	var pos = +this._pos;
	startPlacing(pos);	
	var startGrid = grid.map(function(row, x) { 
		return row.map(function(cell, y) {		

			if(grid[x][y] != pos) {
				return 1;
			}
			else {
				return 0;
			}
		});
	});

	startGrid._steps = []; 
	successfulRoute = null; 
	findRoute(startGrid); 
	showResult(successfulRoute);
}
//Алгоритм нахождения координат перемещения
function findRoute(curGrid) {											
	var row, cell;														
	for(var x = 0; x < curGrid.length; x++) {							
		row = curGrid[x];												
		for(var y = 0; y < row.length; y++) {							
			cell = row[y];												
			var from, to, over;											
			if(cell === 0) {					
				to = {x: x, y: y};					
				//1
				if((curGrid[x][y-2]==1) && (curGrid[x][y-1]==1)) {
					from = {x: x, y: y-2};
					over = {x: x, y: y-1};
					setStep(curGrid, from, to, over);
					
				}
				//2
				if((curGrid[x][y+2]==1) && (curGrid[x][y+1]==1)) {
					from = {x: x, y: y+2};
					over = {x: x, y: y+1};
					setStep(curGrid, from, to, over);
					
				}
				//3
				if(curGrid[x-2] && curGrid[x-1] && (curGrid[x-2][y]==1) && (curGrid[x-1][y]==1)) {
					from = {x: x-2, y: y};
					over = {x: x-1, y: y};
					setStep(curGrid, from, to, over);
					
				}
				//4
				if(curGrid[x+2] && curGrid[x+1] && (curGrid[x+2][y]==1) && (curGrid[x+1][y]==1)) {
					from = {x: x+2, y: y};
					over = {x: x+1, y: y};
					setStep(curGrid, from, to, over);
					
				}
				//5
				if(curGrid[x-2] && curGrid[x-1] && (curGrid[x-2][y-2]==1) && (curGrid[x-1][y-1]==1)) {
					from = {x: x-2, y: y-2};
					over = {x: x-1, y: y-1};
					setStep(curGrid, from, to, over);
					
				}
				//6
				if(curGrid[x+2] && curGrid[x+1] && (curGrid[x+2][y+2]==1) && (curGrid[x+1][y+1]==1)) {
					from = {x: x+2, y: y+2};
					over = {x: x+1, y: y+1};
					setStep(curGrid, from, to, over);
					
				}
			}
		}
	}
}
//Возвращает найденные координаты
function setStep(curGrid, from, to, over) {
	if(successfulRoute) {
		return;
	}	
	var gridTree = curGrid.map(function(row){
		return row.slice(0);
	});

	gridTree[from.x][from.y] = 0;
	gridTree[to.x][to.y] = 1;
	gridTree[over.x][over.y] = 0;

	gridTree._steps = curGrid._steps.slice(0); 
	gridTree._steps.push({from: grid[from.x][from.y], to: grid[to.x][to.y]});

	var pegsCount = getPegsCount(gridTree);
	if(pegsCount == 1) {
		successfulRoute = gridTree._steps;
	}
	else {
		findRoute(gridTree);
	}
}

function getPegsCount(curGrid) {
	var pegsCount = 0;
	curGrid.forEach(function(row) {
		row.forEach(function(cell) {
			if(cell == 1) {
				pegsCount++;
			}
		});
	});
	return pegsCount;
}


initGamePad();
