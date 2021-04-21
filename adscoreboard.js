/**
 * Advanced Scoreboard
 * 
 * @author Cr1N
 * @version 1.3.2 (edited by Russao)
 */

BBLog.handle("add.plugin", {
    /* Plugin Infos */
    id : "bf4-advanced-scoreboard-plugin-dev-1-0",
    name : "Advanced Scoreboard",
    version : '1.3.2',
    build: '20212104',

	serveinfchkload: {
		spectator : 0,
		commander : 0
	},
	
    /* Plugin load  */
    init : function(instance)
    { 
        //Store the path at initizliation
        instance.data.currentPath = location.pathname;        
        if ( location.pathname.match(new RegExp("^/bf4/(|[a-z]{2}/)(servers|serverbrowserwarsaw)/show/pc/.*","i")) ) 
        {
              instance.handler(instance);
        }
    },
    domchange : function(instance) {

        if( location.pathname !== instance.data.currentPath ) 
        {
  
            if( instance.data.pluginLoaded ) 
            {
                  instance.unloadPlugin(instance);
            }

            instance.data.currentPath = location.pathname;

              if( location.pathname.match(new RegExp("^/bf4/(|[a-z]{2}/)(servers|serverbrowserwarsaw)/show/pc/.*","i")) ) 
            {		 	
  
                $(document).ready(function()
                {
                    instance.handler(instance);
                })
            } 
        } else {
            $(document).ready(function () {
                if (instance.data.pluginLoaded && $("#live-header").is(":visible")) {
                    instance.unloadPlugin(instance);
                    instance.handler(instance);
                }
            })
        }
    },

    data: {
        advancedViewPlayer : 0, //Persona ID of player to show advanced statistics for
        animationActive : false,
        asLiveUpdate : false,
        asTrackerUpdate : false,
        charts : {"skillDistribution" : false, "tickets" : false,},
        currentChart : false,
        currentPath : '',
        drawMode: "player",
        gameServerWarsaw : gamedatawarsaw.function_warsawgameserver(),
        latestScoreboardData: {}, //Holds the most recently retrieved set of scoreboard data to present unneccessary requests
        mode: 'scoreboard', //Mode of the plugin
        onServerPage : false,
        pluginLoaded: false,
        tracker : {"tickets" : {}, "kills" : {},}, //Track various aspects of the round over time
        updateIntervalMs : 5000,
    },

    //Holds player statistics
    playerStats : {},
	
    translations: 
	{
	    "en":
		{
		    "settings-title" : "Settings",
		},
	    "de":
		{
		    "settings-title" : "Einstellungen",
		}
	},


    /* Main handler */
    handler : function(instance) {

        //Clear any previous tickers
        instance.data.asLiveUpdate = false;
        instance.data.pluginLoaded = true;
        //Check if this is the first plugin return

        //instance.storage('isConfigured', false);

        if(!instance.storage('ASisConfigured')) { //If not run before, this will return false 
            instance.debug('Initial setup!')
            instance.storage('hilightingEnabled', true);
            instance.storage('liveEnabled', true);
            instance.storage('displayStat', 'kdRatio');
            instance.storage('ASisConfigured', true);	
            instance.storage('hilightFriends', true);
			instance.storage('hilightsquad', false);
			instance.storage('movescoretop', true);
			instance.storage('bblinks', true);
			instance.storage('anticheatlinks', true);
            instance.storage('liveTracking', false);
            instance.storage('sortAttribute', "score");
            instance.storage('sortMode', "desc");
            instance.storage('useResetKdr', false);
            instance.storage('pollingIntervalMs', 5000);
			instance.storage('use.Advanced-Scoreboard', 1);	
           // alert("Configuration Parameters Successfully Set");
        }

        //Load items library from battlelog if not present
        if (!window.items) {
            var path = "/public/gamedatawarsaw/warsaw.items.js";
       
            var loadedLib = $.ajax(
            {
                type: "GET",
                dataType: "script",
                url: base.asset(path),
                cache: true
            });

        } else {
            // instance.debug("Items Library already present!")
        }
		 
		
        //Hide the server info

        //Hide the default scoreboard and insert wrapper DIV for custom scoreboard
        $("#server-players-list").hide();
		
		if (instance.storage('movescoretop')) $("#server-page-join-buttons").hide();
		
		if (!$( "#as-container" ).length) {
			        		
		if (instance.storage('movescoretop')) { 
			$("#server-page-join-buttons").after('<div id="as-container" style="margin-top: 6px !important;"></div>');
		} else {	
				$("#serverbrowser-page").after('<div id="as-container" class="box spacing-top"></div>'); 
		}	

        var roundInfoHeader = instance.drawRoundInfo(instance);
        $("#as-container").html(roundInfoHeader);

        var selectors = instance.drawSelectors(instance);
        $("#as-container").append(selectors); //  

        $("#as-container").append('<div id="as-scoreboard-container"></div>'); 

		
		}

        // console.log("Okay, instance.storage");

        var settingsLog = "Current configuration:<br /><br/>";
        settingsLog += 'Hilighting : ' + instance.storage('hilightingEnabled') + "<br/>" +
            'Live Updates : ' + instance.storage('liveEnabled') + "<br />" +
            'Displayed Stat : ' + instance.storage('displayStat') + "<br />" +
            'Live Tracking : ' + instance.storage('liveTracking') + "<br />" +
            'Sorting Attribute : ' + instance.storage('sortAttribute') + "<br />" +
            'Sorting Mode : ' + instance.storage('sortMode') + "<br />" +
            'Allow Reset Stats : ' + instance.storage('useResetKdr') + "<br />" +
            'Configuration flag : ' + instance.storage('ASisConfigured') + "<br />" +
            'Tickrate : ' + instance.storage('pollingIntervalMs') + "<br/>";

        //Draw settings/config box
        //instance.renderSettings(instance);

        //Create scoreboard from data
        instance.updateAll(instance);

        //Charting
        //instance.drawCharts(instance);

        //Live update interval
        if (instance.storage('liveEnabled')) {
            instance.data.asLiveUpdate = setInterval(function () {
                instance.updateAll(instance);
            }, 5000);
            
        } else {
            // instance.debug("Live update disabled");
        }


        /** EVENT HANDLERS **/

        //Scoreboard

        //Settings

        //Change player view

        $("#as-show-squads").click(function () {
            instance.data.drawMode = "squad";
            instance.updateHTML(instance);
         });
				
        //Handler for selector hilighting

        $(".view-selector").click(function ()
        {
            $(".view-selector").removeClass("btn-primary");
            $(this).addClass("btn-primary");
        });

        //Handler for clicking on a player row
        
        $("#as-container").on('click', '.as-player', function()
        {

            var personaId = $(this).attr('personaid');
            
            var thisRow = $(this);

            if($(this).hasClass('as-advanced-stats-selected'))
            {
                instance.data.advancedViewPlayer = false;
                instance.data.animationActive = true;
                $(".as-advanced-player-view").slideUp("fast", function()
                {
                    $(".as-scoreboard-advanced-stats-row").remove();
                    $(".as-advanced-stats-selected").removeClass("as-advanced-stats-selected");
                    instance.data.animationActive = false;
                });
                return;
            }

            var existingRows = $(".as-scoreboard-advanced-stats-row");
            //Remove all instances
            if( existingRows.length > 0 )
            {   
                var attRows = $(".as-advanced-stats-selected");
                $(".as-advanced-player-view").slideUp("fast", function()
                {
                    // console.log("Slid up");
                    existingRows.remove();
                    attRows.removeClass("as-advanced-stats-selected");
                });

                instance.data.advancedViewPlayer = personaId;
                var html = instance.createAdvancedPlayerView(instance, personaId, false);
                // console.log(html);
                thisRow.addClass('as-advanced-stats-selected').after(html);
                instance.data.animationActive = true;
                $(".as-advanced-player-view").slideDown("fast", function()
                {
                    instance.data.animationActive = false;					
                });
            } else {
                instance.data.advancedViewPlayer = personaId;
                var html = instance.createAdvancedPlayerView(instance, personaId, false);
                $(this).addClass('as-advanced-stats-selected').after(html);
                instance.data.animationActive = true;
                $(".as-advanced-player-view").slideDown("fast", function()
                {
                    instance.data.animationActive = false;					
                });
            }

        });

        //Handler for clicking a role title and expanding the top players

        $("#as-container").on('click', '.as-role-title-row', function () {
            // console.log("Clicked role title row");
            var roleRow = $(this).next("tr").find(".as-role-top-players");

            if( roleRow.is(":visible") )
            {
                roleRow.slideUp("fast");
            } else {
                roleRow.slideDown("fast");
            }
        });


        //Handler for clicking the player join button

        $("#as-container").on('click', '#as-ao-join', function(){

            var personaId = $(this).attr('persona-id');

            instance.joinPlayer(personaId);

        })

        $("#as-container").on('click', '#as-ao-radar', function()
        {
            if ( $("div.as-ao-confirm").is(":visible")) {
                return;
            }

            var personaId = $(this).attr("persona-id");

            var radarSoldiers = BBLog._storage["radar.soldier"];

            var isPresent = false;

            if (radarSoldiers) {
                for (var i = 0; i < radarSoldiers.length; i++) {
                    if (radarSoldiers[i]['id'] == personaId) {
                        isPresent = true;
                    }
                }
            }

            if (!isPresent) {
                var html = '<div class="as-ao-confirm"><span>Add to radar?</span><button id="as-ao-radar-yes">Yes</button><button id="as-ao-radar-no">No</button></div>';
            } else {
                var html = '<div class="as-ao-confirm"><span>Remove from radar?</span><button id="as-ao-remove-yes">Yes</button><button id="as-ao-radar-no">No</button></div>';
            }
            $(this).parent().after(html);
            instance.data.animationActive = true;
            $(".as-ao-confirm").slideDown('fast');
        });

        $("#as-container").on('click', '#as-ao-radar-yes', function () {

            var parent = $(this).parent();
            var personaId = $("#as-ao-radar").attr("persona-id");
            var name = $("#as-ao-name").html();

            if (name.split("]").length > 1) {
                name = name.split("]")[1];
            }

            var radarSoldier = {
                id: personaId,
                name: name,
                source: 'bf4'
            }

            if (!BBLog._storage["radar.soldier"]) {
                BBLog._storage["radar.soldier"] = [];
            }

            var radarSoldiers = BBLog._storage["radar.soldier"];
            BBLog._storage["radar.soldier"].push(radarSoldier);

            parent.slideUp('fast', function () {
                instance.data.animationActive = false;
                parent.remove();
                instance.updateHTML(instance);
            });		        
        });

        $("#as-container").on('click', '#as-ao-remove-yes', function () {

            var personaId = $("#as-ao-radar").attr("persona-id");

            var name = $("#as-ao-name").html();
            if (name.split("]").length > 1) {
                name = name.split("]")[1];
            }

            var radarSoldiers = BBLog._storage["radar.soldier"];

            for (var i = 0; i < radarSoldiers.length; i++) {
                if (radarSoldiers[i]['id'] == personaId) {
                    radarSoldiers.splice(i, 1);
                }
            }

            $(".as-ao-confirm").slideUp('fast', function () {
                $(".as-ao-confirm").remove();
                instance.data.animationActive = false;
                instance.updateHTML(instance);
            });

        });


        $("#as-container").on('click', '#as-ao-radar-no', function () {
            var parent = $(this).parent();
            parent.slideUp('fast', function () {
                parent.remove();
                instance.data.animationActive = false;
                instance.updateHTML(instance);
            });
        });

		$("#as-container").on('click', '#as-show-mkdavg', function () { 
		$('#as-select-display-stat').val('kdRatio').change();
		});
		$("#as-container").on('click', '#as-show-mskill', function () {
		$('#as-select-display-stat').val('skill').change();
		});
		$("#as-container").on('click', '#as-show-mstrength', function () {
		$('#as-select-display-stat').val('strength').change();
		});
		// show commmander n sepc
		
		instance.loadserverStats(instance);

        $("#as-container").on('click', '#as-show-squads', function () {
            instance.data.drawMode = "squad";
            instance.updateHTML(instance);
        });

        $("#as-container").on('click', '#as-show-players', function () {
            instance.data.drawMode = "player";
            instance.updateHTML(instance);
        });

        $("#as-container").on('click', '#as-show-roles', function () {
            instance.data.drawMode = "role";
            instance.updateHTML(instance);
        });

        $("#as-container").on('click', '#as-show-charts', function () {
            alert("Charts disabled for now.");
        });

        $("#as-container").on('click', '#as-settings', function () {
            instance.data.drawMode = "settings";
            instance.drawSettings(instance);
        });

        $("#as-container").on('click', '#as-quit-game', function () {
            var game = gamemanager.gameState.game;
            // console.log("Quitting game " + game);
            gamemanager._killGame(gamemanager.gameState.game);
        });

        //Handler for showing the advanced stats window

        $("#as-container").on('click', '#as-ao-advanced', function () {

            //Test animations

            var overview = $(this).parent().parent().parent();

            var slideUp = $(".as-scoreboard-wrapper").slideUp('slow');

            $.when(slideUp).done(function () {
                $("#as-scoreboard-container").html(overview.html());
            })

        });

        //Handler for hiding the stats window

        $("#server-page").on('click', '.as-stats-close', function () {

            $("#as-stats-container").animate({
                opacity: 0,
                height: 'toggle'
            },
            1000, function ()
            {
                $("#as-stats-container").remove();
                instance.data.mode = 'scoreboard';
                instance.data.animationActive = true;

                $("#as-container").animate({
                    opacity: 1,
                    height: 'toggle'
                }, 1000, function ()
                {
                    instance.data.animationActive = false;
                    instance.updateHTML(instance);
                });

                $('html, body').animate({ scrollTop: $("#as-scoreboard-container").offset().top }, 1000);
            });
        });

        //Settings

        //Event handler for the display stat select menu
        $("#as-select-display-stat").on('change', function(){

            instance.storage('displayStat', this.value);
            instance.updateHTML(instance);

        });

        $("#content").on('click', '#as-settings-close', function ()
        {
            $("#as-settings-container").remove();
        })

        //Sorting event handlers

        $("#as-container").on('click', '.as-scoreboard-head td', function()
        {   
            var elem = $(this);


            if( elem.hasClass("sort-desc") )
            {
                // console.log("has sort-desc")
                elem.removeClass("sort-desc").addClass("sort-asc");
                instance.storage('sortMode', 'asc' );
            }
            else if( elem.hasClass("sort-asc") )
            {
                // console.log("has sort-asc")
                elem.removeClass("sort-asc").addClass("sort-desc");
                instance.storage('sortMode', 'desc' );
            }
            else 
            {
                // console.log("unclassed")
                elem.addClass("sort-desc");
                instance.storage('sortMode', 'desc');
            }
            instance.storage('sortAttribute', this.getAttribute("sort"));
            instance.updateHTML(instance);
        });


        //Event handler for hilighting checkbox

        $("#as-container").on('change', '#as-enable-hilighting', function(){

            if(this.checked) {
                instance.storage('hilightingEnabled', true);
            } else {
                instance.storage('hilightingEnabled', false);
            }
            instance.updateHTML(instance);	

        });

        //Event handler for friend hilighting
       
		$("#as-container").on('change', '#as-enable-friend-hilighting', function(){	
			// console.log("test");

            if(this.checked) {
                instance.storage('hilightFriends', true);
            } else {
                instance.storage('hilightFriends', false);
            }

            instance.updateHTML(instance);	

        });
		
		//Event handler for squad playlist
       
		$("#as-container").on('change', '#as-enable-squad-hilighting', function(){	

            if(this.checked) {
                instance.storage('hilightsquad', true);
            } else {
                instance.storage('hilightsquad', false);
            }

            instance.updateHTML(instance);	

        });

		$("#as-container").on('change', '#as-scoretop', function(){	

            if(this.checked) {
                instance.storage('movescoretop', true);
            } else {
                instance.storage('movescoretop', false);
            }

            instance.updateHTML(instance);	

        });
		
		
		$("#as-container").on('change', '#as-bblinks', function(){	

            if(this.checked) {
                instance.storage('bblinks', true);
            } else {
                instance.storage('bblinks', false);
            }

            instance.updateHTML(instance);	

        });
		$("#as-container").on('change', '#as-anticheatlinks', function(){	

            if(this.checked) {
                instance.storage('anticheatlinks', true);
            } else {
                instance.storage('anticheatlinks', false);
            }

            instance.updateHTML(instance);	

        });
		
        //Scroll right in the advanced view

        //Event handler for the live update checkbox
        $("#content").on('change', '#as-enable-live', function()
        {
            if(this.checked) {

                instance.storage('liveEnabled', true);

                if(!instance.data.asLiveUpdate) {

                    instance.data.asLiveUpdate = setInterval(function(){

                        instance.updateAll(instance);

                    }, 5000);

                    instance.updateAll(instance);                   
                } 
            } else {

                instance.storage('liveEnabled', false);
                if(instance.data.asLiveUpdate) {
                    clearInterval(instance.data.asLiveUpdate);
                    instance.data.asLiveUpdate = false;                    
                }
            }

        })

        //Stats

        $("#server-page").on('click', '.as-stats-select-weapons', function ()
        {
            $(".as-stats-vehicles").slideUp('fast', function () {
                $(".as-stats-weapons").slideDown('fast');
            });
        });

        $("#server-page").on('click', '.as-stats-select-vehicles', function () {
            $(".as-stats-weapons").slideUp('fast', function () {
                $(".as-stats-vehicles").slideDown('fast');
            });
        });

        //Join on a specific team
		$("#as-container").on('click', '.as-join-team', function() {			
            var teamId = $(this).attr('team-id');			
            var teams = instance.data.latestScoreboardData.teams;

            for (var i = 0; i < teams.length; i++) {
                var team = teams[i];
                if (team.status.teamId == teamId) {
                    instance.joinTeam(team);
                    return;
                }
            }
        });
				
        $("#as-render-scorboard-button").click(function(){

            instance.updateAll(instance);
			
        });
    },

    /**
	 * Allows the user to join the server on any player regardless of if they are on your friends list
	 *
	 * @param personaId			The Battlelog Persona ID of the player to join
	 *
	 */	 
    joinPlayer : function(personaId)
    {
        var elem = document.getElementById("server-page-join-buttons");
		var guid = elem.getAttribute("data-guid");
        var platform = elem.getAttribute("data-platform");
        var game = elem.getAttribute("data-game");

        window.gamemanager.joinServerByGuid(guid, platform, game, personaId, 1);

    },
	joinTeam : function(team) {
        // Create squads

        var squads = {};

        for (var i = 0; i < team.players.length; i++) {
            var player = team.players[i];

            if (!player.hasOwnProperty('squad')) { // Player is not in a squad
                continue;
            }
            if (!squads.hasOwnProperty(player.squad)) {
                squads[player.squad] = [];
            }
            squads[player.squad].push(player);

        }
        
        var elegiblePlayers = [];

        for (var squadId in squads) {
            var squad = squads[squadId];
            var playerCount = squad.length;
            if (playerCount < 5) {
                for (var i = 0; i < playerCount; i++) {
                    elegiblePlayers.push(squad[i]);
                }
            }
        }

        // Sort by rank ascending
        elegiblePlayers.sort(function(a, b) {
            if (a.rank < b.rank)
                return -1;
            if (a.rank > b.rank)
                return 1;
            return 0;
        });

        var joinOn = elegiblePlayers[0].personaId;

        var elem = document.getElementById("server-page-join-buttons");
        var guid = elem.getAttribute("data-guid");
        var platform = elem.getAttribute("data-platform");
        var game = elem.getAttribute("data-game");
        window.gamemanager.joinServerByGuid(guid, platform, game, joinOn, 1);

    },

    drawCharts : function(instance)
    {
    	//Disabled
    	return false;

    },

    /**
	 * Refreshes all data and redraws scoreboard 
	 *
	 * @param instance			Plugin object instance
	 *
	 */
    updateAll : function(instance){

        var serverInfo = instance.getServerAttributes(); // Server attributes

        instance.queryServerScoreboard(serverInfo, function(queryResult)
        {           

            //Store the result of the query
            instance.data.latestScoreboardData = queryResult;

            //Cache player statistics
            instance.updatePlayerStats(instance, queryResult);

            //Render the scoreboard with this data
            if( !instance.data.animationActive && instance.data.mode == 'scoreboard' )
            {
                if( instance.data.drawMode == "player" ) {
                    instance.drawPlayerScoreBoard(instance, queryResult);
                } 
                else if ( instance.data.drawMode == "squad" ) {
                    instance.drawSquadScoreBoard(instance, queryResult); // Draw the scoreboard using the query result
                } else if ( instance.data.drawMode == "role" ) {
                    instance.drawRoleScoreBoard(instance, queryResult);
                }
                else if ( instance.data.drawMode == "charts" ) {
                    instance.updateTracker(instance, queryResult, function(instance)
                    {
                        // instance.updateCharts(instance);
                    });
                }
            }

            //Update the round header
            instance.updateRoundHeader(instance, queryResult);

        });
    },

    /**
	 * Redraws HTML without refreshing data sources
	 *
	 * @param instance			Plugin object instance
	 *
	 */
    updateHTML : function(instance) {

        if(!instance.data.animationActive && instance.data.mode == 'scoreboard')
        {
            if(instance.data.drawMode == "player") 
            {
                instance.drawPlayerScoreBoard(instance, instance.data.latestScoreboardData);
            } else if ( instance.data.drawMode == "role" ) {
                instance.drawRoleScoreBoard(instance, instance.data.latestScoreboardData);
            } else if (instance.data.drawMode == "squad") {
                instance.drawSquadScoreBoard(instance, instance.data.latestScoreboardData); // Draw the scoreboard using the query result
            }
        }
    },

    /**
     * Updates the tracking object with data from the server
     *
     * @param instance          Plugin object instance
     * @param serverData        Data from the server
     * @param callback          Callback function
     */
    updateTracker : function(instance, serverData, callback)
    {
        for(i = 0; i < serverData.teams.length; i++)
        {
            var team = serverData.teams[i];
            var teamId = team.status.teamId;
            var tickets = team.status.tickets;

            if( instance.data.tracker.tickets.hasOwnProperty(teamId) )
            {
                instance.data.tracker.tickets[teamId].push(tickets);
            }
            else
            {
                instance.data.tracker.tickets[teamId] = [instance.lookup.teamName(serverData.gameMode, team.status), tickets];
            }
        }        
        callback(instance);
    },

    /**
     * Updates the charts
     *
     * @param instance          Plugin object instance
     */

    updateCharts : function(instance) 
    {
        if( instance.data.currentChart ) {
            var chartData = [];
            for( var dataSet in instance.data.tracker.tickets )
            {
                var data = instance.data.tracker.tickets[dataSet];                
                chartData.push(data);
            }
            instance.data.currentChart.load({
                columns : chartData
            });
        }
    },


    /**
    * Returns an object containing the team data for the round and the total stats for each team
    *
    * @param instance           Plugin Object Instance
    * @param scoreboardData     JSON Object containing the information received from the gameserver
    */
    calculateTeamTotals : function(instance, scoreboardData)
    {
        var s = scoreboardData;
        // console.log("Gimme commander feature pls");
        // console.log(s);
        var teams = [];

        $.each(s.teams, function(teamID, team)
        {
            var players = team.players;
            var status = team.status;

            var teamObj = {
                'players' : [],
                'status' : team.status,
                'totalPlayers' : 0,
                'totalRank' : 0,
                'totalKills' : 0,
                'totalDeaths' : 0,
                'totalScore' : 0,
                'playersLoaded' : 0,
                'totalPDisplayStat': 0,
                'commander': false,
				'totalSkill': 0,
				'totalstrength': 0
            };

            $.each(team.players, function(playerId, player)
            {
                var playerObj =
				{
				    'id': player.personaId,
				    'tag': player.tag,
				    'name': player.name,
				    'rank': player.rank,
				    'role': player.role,
				    'squad': player.squad,
				    'score': player.score,
				    'kills': player.kills,
				    'deaths': player.deaths,
				    'kd': (player.deaths == 0) ? player.kills : player.kills / player.deaths,
				    'statsLoaded' : false,
				    'pDisplayStat': 0,
					'gunMasterLevel': player.gunMasterLevel
				}

                    teamObj.totalRank += player.rank;
                    teamObj.totalKills += player.kills;
                    teamObj.totalDeaths += player.deaths;
                    teamObj.totalScore += player.score;
                    teamObj.totalPlayers++;

                    //Load the players statistics from the 
                    if (instance.playerStats.hasOwnProperty(player.personaId)) {
                        playerObj.statsLoaded = true;

                        var pStats = instance.playerStats[player.personaId];
						
						// no stats fix												
						if (pStats.overviewStats == "undefined" || pStats.overviewStats == null) { 
							// console.log("overviewStats error: " + player.name, pStats);
							pStats.overviewStats = [];
							pStats.overviewStats.kills = 0;
							pStats.overviewStats.deaths = 0;
							pStats.overviewStats.kdRatio = 0;
							pStats.overviewStats.skill = 0;
							pStats.overviewStats.scorePerMinute = 0;
							pStats.overviewStats.killsPerMinute = 0;
							pStats.overviewStats.nostats = 1;
						    // return;
						//	end no stats fix
						}

                        var displayStat = instance.storage('displayStat');
                        if (displayStat == 'kdRatio' && !instance.storage('useResetKdr')) {
                            if (pStats.overviewStats.deaths == 0) {
                                playerObj.pDisplayStat = pStats.overviewStats.kills
                            } else {
                                playerObj.pDisplayStat = Math.round((pStats.overviewStats.kills / pStats.overviewStats.deaths) * 100) / 100;
                            }
                        } else if (displayStat == 'strength') {							
							var strength = (((pStats.overviewStats.killsPerMinute * pStats.overviewStats.kdRatio) * 10) + ((pStats.overviewStats.skill * pStats.overviewStats.scorePerMinute) / 10000)) * 10;                            
                            playerObj.pDisplayStat = Math.floor(strength);
                        } else {
							if (displayStat != "undefined" || displayStat != null) { 
								playerObj.pDisplayStat = pStats.overviewStats[displayStat];
							} else { console.log(player.name + " pDisplayStat: " + pDisplayStat); }	
                        }
                        teamObj.totalPDisplayStat += playerObj.pDisplayStat;
                        teamObj.playersLoaded++;
						
						teamObj.totalSkill += pStats.overviewStats.skill; 
						teamObj.totalstrength += (((pStats.overviewStats.killsPerMinute * pStats.overviewStats.kdRatio) * 10) + ((pStats.overviewStats.skill * pStats.overviewStats.scorePerMinute) / 10000)) * 10;
                    }
                    teamObj.players.push(playerObj);
					if (player.role == 2) teamObj.commander = playerObj;
            })
            teams.push(teamObj);
        })

        return teams;
    },

    /**
    * Returns an object detailing the role specializations of the team. i.e. top players by vehicle type/weapon type
    *
    * @param instance           Plugin Object Instance
    * @param scoreboardData     JSON Object cotnaining the information received from the gameserver
    */
    calculateRoles: function(instance, scoreboardData)
    {

        var start = new Date().getTime();
        var s = scoreboardData;
        var teamRoles = [];        
        $.each(s.teams, function(teamId, team) 
        {
            var players = team.players;
            var status = team.status;
            var commander = false;
            var vehicles = {};

            $.each(players, function(playerId, player)
            {
                //If the user's overviewstats have been loaded
                if( instance.playerStats.hasOwnProperty(player.personaId) ) {
                    var pStats = instance.playerStats[player.personaId];
                    
                    //Iterate over the top play vehicles and add them to the role totals for the team
					// no stats? fix												
					if (pStats.topVehicles == "undefined" || pStats.topVehicles == null) { 						
					    return;
					}

                    for (var i = 0; i < pStats.topVehicles.length; i++) {
                        var vehicle = pStats.topVehicles[i];
                        var vehicleName = vehicle.category.replace('Vehicle ', '');

                        if (vehicle.kills > 100) {
                            if ( vehicles.hasOwnProperty(vehicleName) ) {

                                var playerPresent = false;

                                //Check if player already exists in this category, e.g. AH6-J kills logged under scout category, but Z-11 have not yet been processed 
                                for (var j = 0; j < vehicles[vehicleName].topPlayers.length; j++) {
                                    if (vehicles[vehicleName].topPlayers[j].personaId == player.personaId) {
                                        playerPresent = true;
                                        vehicles[vehicleName].topPlayers[j].kills += vehicle.kills;
                                        vehicles[vehicleName].topPlayers[j].time += vehicle.timeIn;
                                        break;
                                    }
                                }

                                if (!playerPresent) {
                                    var playerVehicleStats = {
                                        personaId: player.personaId,
                                        kills: vehicle.kills,
                                        rank: player.rank,
                                        time: vehicle.time
                                    }
                                    vehicles[vehicleName].topPlayers.push(playerVehicleStats);
                                }

                                vehicles[vehicleName].totalKills += vehicle.kills;
                                vehicles[vehicleName].totalTime += vehicle.timeIn;

                            } else {

                                vehicles[vehicleName] = {
                                    topPlayers: [],
                                    totalKills: 0,
                                    totalTime: 0,
                                };

                                var playerVehicleStats = {
                                    personaId: player.personaId,
                                    kills: vehicle.kills,
                                    rank: player.rank,
                                    time: vehicle.time
                                }

                                vehicles[vehicleName].totalKills += vehicle.kills;
                                vehicles[vehicleName].totalTime += vehicle.timeIn;
                                vehicles[vehicleName].topPlayers.push(playerVehicleStats);

                                var vehicleDisplay = window.items.game_data.compact.vehicles[vehicle.guid]
                                vehicleDisplay = vehicleDisplay.see[0];
                                var lineartSlug = window.items.game_data.compact.vehicles[vehicleDisplay];
                                lineartSlug = lineartSlug.imageConfig.slug;

                                if (!vehicles[vehicleName].lineartSlug) {
                                    vehicles[vehicleName].lineart = lineartSlug;
                                }

                            }
                        }
                    }

                }
            });
            teamRoles.push(vehicles);

        });
        var end = new Date().getTime();
        var time = end - start;

        // console.log("Calculating roles took " + time + "ms");

        return teamRoles;

    },

	doteaminfo : function(instance, team, s, showtickers, teamFlag, teamName)
    {
				var dhtml = "";
				var avgKD = team.totalDeaths == 0 ? team.totalKills : (team.totalKills/team.totalDeaths).toFixed(2);            
				var avgpSkill = team.totalSkill == 0 ? '...' : (team.totalSkill/team.playersLoaded).toFixed(0);		
				var avgpstrength = team.totalstrength == 0 ? '...' : (team.totalstrength/team.playersLoaded).toFixed(0);			
				var teampoints = team.status.tickets;
				var teampointsmax = team.status.ticketsMax;
				if (s.gameMode != 2 && showtickers == 0 && teampointsmax > 10) showtickers = teampointsmax;				
				if (s.gameMode == 524288) { 
					teampoints = team.status.flags;
					teampointsmax = team.status.flagsMax;
				}
					
				var progressBarWidth = Math.floor((teampoints/teampointsmax) * 100);
				var progressBar ='<div class="progress-bar thicker no-border '+instance.lookup.teamType(team.status.teamId)+'" style="position: relative; display: inline-block; width: 100px; top: 10px;"><div class="home progress-bar-inner" style="width:'+progressBarWidth+'%"></div></div>';

				if (s.gameMode == 8) {
					teamFlag = false;
					teamName = instance.lookup.squadName(team.status.teamId);
				}
				var isflagt = "";
				if (teamFlag) {
					isflagt = '<img class="as-team-flag" style="width:20px;" src="' + teamFlag + '"></img>&nbsp;'; 
				}			

				dhtml += '<thead><tr class="as-scoreboard-details" style="background-color: rgba(7, 7, 7, 0.5);">' +
                '<td colspan="7"><div style="display:table; width: 100%; table-layout: auto; text-align: center; font-weight: 700;"> '; 
				dhtml += '<div style="display:table-row; color:#ffffffad;">'+
				'<div style="display:table-cell">TEAM</div><div style="display:table-cell;">TICKETS</div><div style="display:table-cell;">PLAYERS</div><div id="as-show-mkdavg" style="display:table-cell; cursor: pointer;">K/D(G)</div><div id="as-show-mskill" style="display:table-cell; cursor: pointer;">SKILL</div><div id="as-show-mstrength" style="display:table-cell; cursor: pointer;">STRENGTH</div><div style="display:table-cell;">&nbsp;</div>'+
				'</div><div style="display:table-row;">'+
				'<div style="display:table-cell; font-size: large;">' + teamName + '&nbsp;' + isflagt +'</div>' +
				'<div style="display:table-cell;"> <div style="position: absolute; top: 43px; margin-left: 44px;z-index: 10;">' + teampoints +'</div> ' + progressBar + '</div>' +
				'<div style="display:table-cell;">' + team.players.length + '/' + (s.maxPlayers/2).toFixed(0) + '</div>' +
				'<div style="display:table-cell;">' +  avgKD +'</div>' +
				'<div style="display:table-cell;">' + avgpSkill +'</div>' +
				'<div style="display:table-cell;">' + avgpstrength +'</div>' +
				'<div style="display:table-cell;"><div style="display:table-cell; position: relative; top: -10px;"><button class="as-join-team btn btn-tiny btn-primary arrow" team-id="' + team.status.teamId + '" data-tooltip="Join ' + teamName + '"></button></div></div>' +
				'</<div></<div>'+
				'</td>';
		return dhtml;
	},
	
	doroundinfo : function(instance, team, s, showtickers, teamFlag, teamName)
	{
		var defaultbuttons = "";
		if (instance.storage('movescoretop')) {
			$("#server-page-join-buttons").hide();
			var showbuttonstys = "";
			var showbuttonstyc = "";
			if (instance.serveinfchkload.spectator == 0) showbuttonstys = 'display:none;';
			if (instance.serveinfchkload.commander == 0) showbuttonstyc = 'display:none;';			 			
			defaultbuttons = '<button class="btn btn-primary btn-small large arrow" data-bind-action="join-mp-gameserver" data-track="serverbrowser.server.join" data-role="1" data-telemetry-action="serverbrowser"> Join server </button>'+
			'&nbsp;&nbsp;<button id="as-spectator" style="'+showbuttonstys+'" class="btn btn-small large arrow " data-bind-action="join-mp-gameserver" data-track="serverbrowser.server.spectator.join" data-role="4"> Spectator </button>' +
			'&nbsp;&nbsp;<button id="as-commander" style="'+showbuttonstyc+'" class="btn btn-small large arrow" data-bind-action="join-mp-gameserver" data-track="serverbrowser.server.commander.join" data-role="2"> Commander </button>';			
		}

		var displyscorem = "";
		if (showtickers != 0) displyscorem = ' ('+showtickers+')';
        var displayMap = '<div style="float:left; padding: 10px"><img class="current-map" src="//cdn.battlelog.com/bl-cdn/cdnprefix/9c0b010cd947f38bf5e87df5e82af64e0ffdc12fh/public/base/bf4/map_images/195x79/' + s.mapName.toLowerCase() + '.jpg"></img></div>' +
            '<div id="as-map-name" style="margin-left: 6px;position: relative;top: 8px;">' + instance.data.gameServerWarsaw.mapLookup[s.mapName].label + '</div>' +
            '<div style="margin-left: 6px;position: relative;top: 13px;" id="as-map-mode">' + instance.lookup.gameMode(s.gameMode) + ' '+displyscorem+'</div>';

        $("#as-scoreboard-mapinfo").html(displayMap);

        var serverInfo = '<table class="as-server-properties">' +
            '<tr><th>Players</th><td>' +  +  '</td></tr>' +
            '</table>';

        $("#as-round-properties").html(serverInfo);

        var defaultRoundtimeSeconds = 3600;
        var currentRoundTime = 3600 * (s.defaultRoundTimeMultiplier/100);
        var expiredTime = s.roundTime;		
        var secondsRemaining = currentRoundTime - expiredTime;

        var timeLeft = Math.floor(secondsRemaining/60) + 'm ' + (Math.round((secondsRemaining%60) * 100)/100) + 's';
		var roundtime = Math.floor(expiredTime/60) + 'm ' + (Math.round((expiredTime%60) * 100)/100) + 's';

        //HTML For the round status

        var totalPlayers = 0;
        for (var i = 0; i < s.teams.length; i++) {
            var team = s.teams[i];
            totalPlayers += team.players.length;
        }

		var playersionfoas = totalPlayers + '/' + s.maxPlayers + (s.queueingPlayers > 0 ? '[' + s.queueingPlayers + ']' : '')
		var specfafull = $("#server-page-info .box-content");
		var specfa = specfafull.first().find("h5"); 
		if(specfa) specfa.text(playersionfoas);

		var roundProperties = '<table class="as-round-properties">' +
            '<tr><td>Players:&nbsp;</td><td> ' + playersionfoas + '</td><td style="width: 100%; text-align: right;"><div style="margin-left: -5px;position: relative;top: -36px;width: 100%;">'+defaultbuttons+'</div></td></tr>' +
            '</table> </td></tr></table>' +
			'<div><span>Time:&nbsp;</span><span id="as-server-time-remaining">'+roundtime+ '(Left: '+timeLeft+')</span></div>'; 
		return roundProperties;
	},
	
    /**
	* A refactored version of the scoreboard rendering function to allow for more flexible output and design
	*
	* @param instance 		 	Plugin Object Instance
	* @param s 	JSON Object containing the information received from the gameserver
	*/
	// 
    drawPlayerScoreBoard : function(instance, scoreboardData) 
    {
		var bbcheat = false;
		var bbtarget = "_self";
		var hilightsquad = instance.storage('hilightsquad');
		if (instance.storage('bblinks')) bbtarget = "_blank";
		if (instance.storage('anticheatlinks')) bbcheat = true;
		
		
        var start = new Date().getTime();

        var s = scoreboardData;        
        var teams = instance.calculateTeamTotals(instance, scoreboardData);
		
		var spantotal = 4;
		if (s.gameMode == 512 || s.gameMode == 32 || s.gameMode == 8 || s.gameMode == 1024 || s.gameMode == 137438953472) $("#as-show-roles").hide();
		if (s.gameMode == 512) {
			spantotal = 5;
		}	
        //Disabled, fixed next version

        /* Load in the BBLog radar and check if any of the players on the server match 
        if (BBLog._storage["radar.soldier"]) {
            var radar = BBLog._storage["radar.soldier"];
        }
        else {
            var radar = false;
        }

        var radarSoldiers = [];

        if (radar) {
            for (var i = 0; i < radar.length; i++) {
                var radarSoldier = radar[i];
                radarSoldiers[radarSoldier.id] = true;
            }
        }
        */
        //We now have our custom teams object with all the relevant information
	
        var html = "";

		html += '<div style="display: table; width:100%"> '; 
		
        //Iterate over each team
		var showtickers = 0;
		function isOdd(num) { return num % 2;}
		var teamcount = 0;
        for( i = 0; i < teams.length; i++ )
        {
			
            var team = teams[i];		
			if (team.players.length < 1) break;
			var teamName = instance.lookup.teamName(s.gameMode, team.status);					
            var teamFlag = instance.lookup.teamFlag(teamName);

            //Create wrapper and table for team			
			var sspacdiv = "";
						
			var whatktab = false;
			var setmtab = isOdd(teamcount);
			if (teamcount == 0 || setmtab == 0) { 
				whatktab = true;
						 
			} else { sspacdiv = "padding-left: 5px;"; }
			teamcount += 1;
			if (whatktab) html += '<div style="display:table-row; width: 100%; '+sspacdiv+'">'; 
			
            html += '<div style="display:table-cell; width: 50%; '+sspacdiv+'" class="as-scoreboard-wrapper" teamId = "' + team.status.teamId + '">' + 
                '<table class="table table-hover scoreboard as-scoreboard-table" teamId="' + team.status.teamId + '">';                
				
			BBLog.storage("RgameModeAS", s.gameMode);
            if (s.gameMode != 512) {
				html += instance.doteaminfo(instance, team, s, showtickers, teamFlag, teamName);
			}
			
            //HTML for table header
            html += '<tr class="as-scoreboard-head">'

            var columns = [
                {header : "R", sortAttribute : "rank"},
                {header : "Name", sortAttribute : "name"},
                {header : "K", sortAttribute : "kills"},
                {header : "D", sortAttribute : "deaths"},
                {header : "Score", sortAttribute : "score"},
                {header : "K/D", sortAttribute : "kd"},
                {header : instance.lookup.displayStat(instance.storage('displayStat')), sortAttribute : "pDisplayStat"}
            ]
			var playnumba = "";
			if (s.gameMode == 512) {
				playnumba = "<td></td>";
				html += playnumba;
				columns = [
                {header : "R", sortAttribute : "rank"},
                {header : "Name", sortAttribute : "name"},
                {header : "K", sortAttribute : "kills"},
                {header : "D", sortAttribute : "deaths"},
                {header : "Score", sortAttribute : "score"},
                {header : "K/D", sortAttribute : "kd"},				
                {header : instance.lookup.displayStat(instance.storage('displayStat')), sortAttribute : "pDisplayStat"},
				{header : "Level", sortAttribute : "level"}
				]
			}

            var sortAttribute = instance.storage('sortAttribute');
            var sortMode = instance.storage('sortMode');

            for( j = 0; j < columns.length; j++)
            {   
                var column = columns[j];
                html += '<td style="cursor: pointer;" ' + (column.sortAttribute == sortAttribute ? 'class="sort-' + sortMode + '"' : '') +' sort="' + column.sortAttribute + '">' + column.header + (column.sortAttribute == sortAttribute ? '<div class="sort-' + sortMode + '"></div>' : '') + '</td>';
            }
			
            html += '</tr></thead>';

            //Here we decide the order in which players will be displayed..
            team.players.sort(function (a, b) {
                if (sortMode == 'desc') {
                    return a[sortAttribute] == b[sortAttribute] ? 0 : +(a[sortAttribute] < b[sortAttribute]) || -1;
                } else {
                    return a[sortAttribute] == b[sortAttribute] ? 0 : +(a[sortAttribute] > b[sortAttribute]) || -1;
                }
            });

            //Iterate over the players on the team and create a table row for them
            for( j = 0; j < team.players.length; j++ ) {
                var player = team.players[j];

                //Rank display html
                var pRank = '<div class="bf4-rank rank small r' + player.rank + ' rank_icon" data-rank="' + player.rank +'"></div>'

                //Player name including tags
                var pName = player.tag.length > 0 ? '[' + player.tag + ']' + player.name : player.name;                

                //Player K/D
                var pKD = player.deaths == 0 ? player.kills : player.kills/player.deaths;

                //Set hilighting class
                var hilightingType = false;
				
				var sethtpc = "";
				var sethtst = "";
                if (instance.storage('hilightingEnabled') && player.statsLoaded) {
                    hilightingType = instance.lookup.hilightingClass(instance.storage('displayStat'), player.pDisplayStat);
					var chkdisplayStata = instance.storage('displayStat');
					var chkdisplayStatb = player.pDisplayStat;
					
					/* hilightingType low, average, good, high, v-high, pro */
					var crlvl = 0;
					if (hilightingType  == "low") sethtpc = "background-color:#124377;";
					if (hilightingType  == "average") sethtpc = "background-color:#11592B;";
					if (hilightingType  == "good") sethtpc = "background-color:#7C5F1D;";
					if (hilightingType  == "high") { sethtpc = "background-color:#791D22;"; crlvl = 1; }
					if (hilightingType  == "v-high") {  sethtpc = "background-color:#6A2576;"; crlvl = 1; }
					if (hilightingType  == "pro") { sethtpc = "background-color:#060606;"; crlvl = 1; }
					if (player.name  == "IRussao" && crlvl == 0)  sethtpc = "background-color:#2C1680;";
					
					
					
                }
                /*
                if( radarSoldiers.hasOwnProperty(player.id)) {
                    hilightingType += " radar"
					
					NeverDie_Viper chkdisplayStata: kills chkdisplayStatb: 7019 hilightingType: undefined
                }
                */
				var isFriend = false;
								
				if (instance.storage('hilightFriends')) {
					var friends = comcenter.getFriendsListFromLs();					
					var mfriend = "";								
					var newname = pName;			
					for ( var k = 0; k < friends.length; k++ )
					{
						if(friends[k].username == player.name) {
							isFriend = true;
							mfriend = 'color:#000000; background-color:#00c8ff;'; // #00c8ff						
							break;
						}
					}
				}								
				var pSName = instance.lookup.squadName(player.squad);
				var sesc = "";
				var sqsc = "";
				if (hilightsquad) {
					sqsc = "&#8718; "; // ∎ ☠
					var squadscol= instance.lookup.squadColor(player.squad);
					sesc = 'color:'+squadscol+';';				
				}	
				var plalevelgun = "";				
				var playnumbs = "";			
				if (s.gameMode == 512)  {
					plalevelgun = '<td>'+player.gunMasterLevel+'</td>';
					playnumbs = '<td class="center">'+(j+1)+'</td>';					
				}	
				
				var mtip = `data-tooltip="<h2 style='`+sesc+`'>`+pSName+`</h2>"`;				
				var fontsize = "15px";
				if (pName.length > 20) fontsize = "14px";
				if (isFriend == true) { 
					 pName = `<span `+mtip+`><a style="`+fontsize+`; ` + mfriend + `"  onclick="window.open ('https://battlelog.battlefield.com/bf4/user/` + player.name + `/', '`+bbtarget+`'); return false" href="javascript:void(0);">` + player.name + `</a></span>`; 
				} else { 
					 pName = `<span `+mtip+`><a style="`+fontsize+`; `+sesc+`" onclick="window.open ('https://battlelog.battlefield.com/bf4/user/` + player.name + `/', '`+bbtarget+`'); return false" href="javascript:void(0);">` + pName + `</a></span>`; 
				} 
				var antilinks = "";
				if (bbcheat) antilinks = `<br> <span style="font-size: 24px; margin-top:-8px; `+sesc+`" `+mtip+`>`+sqsc+`</span> <a style="font-size: 11px;color:red;" href='https://bf4db.com/player/` + player.id  + `' target='_blank'>BF4DB</a> | <a style="font-size: 11px;color:#445C9C;" href='https://bf4cheatreport.com?bblog=1&cnt=100&pid=` + player.id  + `' target='_blank'>BF4CR</a>`; 

                var displayStat = player.statsLoaded ? player.pDisplayStat : '<div class="loader small"></div>';
                //Generate table row
				
				var statsExpanded = player.id == instance.data.advancedViewPlayer ? true : false;
				html += '<tr style="font-size: 14px; '+sethtpc+'" class="as-player' + (statsExpanded ? ' as-advanced-stats-selected' : '') + (hilightingType ? ' ' + hilightingType : '') + '" personaid="' + player.id + '">'+playnumbs+'<td class="center">' + pRank + '</td><td>' + pName + ' ' + antilinks + '</td><td>' + player.kills + '</td><td>' + player.deaths + '</td><td>' + player.score +'</td><td>' + pKD.toFixed(2) + '</td><td>' + displayStat + '</td>'+plalevelgun+'</tr>'

                //If a specific player is selected for the advanced view, inject the HTML here

                if  (player.id == instance.data.advancedViewPlayer ) {
                    html += instance.createAdvancedPlayerView(instance, player.id, true);					
					
                }
				
            }

            /*** Create tfoot from averages ***/
			
            //Average rank display html
            var avgRank = '<div class="bf4-rank rank small r' + Math.floor(team.totalRank/team.players.length) + ' rank_icon" data-rank="' + Math.floor(team.totalRank/team.players.length) +'"></div>'

            //HTML for scoreboard foot   
			html += '<tfoot><tr class="as-scoreboard-foot"><td colspan="2">Total</td><td>'+ team.totalKills +'</td><td>' + team.totalDeaths + '</td><td colspan="'+spantotal+'">' + team.totalScore +'</td></tr></tfoot>'; 

            html += '</table>';

            if (team.commander) {
                var commander = team.commander;

                var cRank = '<div class="bf4-rank rank small r' + commander.rank + ' rank_icon" data-rank="' + commander.rank + '"></div>'

                var cKd = commander.deaths == 0 ? commander.kills : commander.kills / commander.deaths;
                //Player name including tags
                var cName = commander.tag.length > 0 ? '[' + commander.tag + ']' + commander.name : commander.name;
				
                // pName = '<a href="/bf4/user/' + commander.name + '/">' + cName + '</a>';
				
				var pSName = instance.lookup.squadName(commander.squad);
				var sesc = "";
				var sqsc = "";
				if (hilightsquad) {
					sqsc = "&#8718; ";
					var squadscol= instance.lookup.squadColor(commander.squad);
					sesc = 'color:'+squadscol+';';				
				}
				var antilinks = "";
				mtip = `data-tooltip="<h2 style='`+sesc+`'>`+pSName+`</h2>"`;
				if (bbcheat) antilinks = `<br> <span style="font-size: 24px; margin-top:-8px; `+sesc+`" `+mtip+`>`+sqsc+`</span> <a style="font-size: 11px;color:red;" href='https://bf4db.com/player/` + commander.id  + `' target='_blank'>BF4DB</a> | <a style="font-size: 11px;color:#445C9C;" href='https://bf4cheatreport.com?bblog=1&cnt=100&pid=` + commander.id  + `' target='_blank'>BF4CR</a>`; 								
				cName= `<span `+mtip+`><a style="`+fontsize+`; `+sesc+`" onclick="window.open ('https://battlelog.battlefield.com/bf4/user/` + commander.name + `/', '`+bbtarget+`'); return false" href="javascript:void(0);">` + cName + `</a></span>`; 
                html += '<table class="table as-commander-scoreboard"><tbody><tr><td>' + cRank + '</td><td>' + cName + ' ' + antilinks + '</td><td>' + commander.kills + '</td><td>' + commander.deaths + '</td><td>' + commander.score + '</td><td>' + cKd.toFixed(2) + '</td><td>' + commander.pDisplayStat + '</td></tr></tbody></table>';
            }

            html += '</div>';
			
			if (whatktab == false) html += '</div>'; 

        }
		
		html += '</div></div>';

		var rhtml = instance.doroundinfo(instance, team, s, showtickers, teamFlag, teamName);
		
		$("#as-scoreboard-round-properties").html(rhtml);

        if ($("#as-scoreboard-container").is(':visible')) {
            $("#as-scoreboard-container").html(html)
        } else { //Catch issue with navigation
            instance.unloadPlugin(instance);
            instance.handler(instance);
        }

        var end = new Date().getTime();
        var time = end - start;

        // console.log("Drawing took " + time + "msg");
    },
	
    drawSquadScoreBoard : function(instance, scoreboardData)
    {
		var bbcheat = false;
		var bbtarget = "_self";
		if (instance.storage('bblinks')) bbtarget = "_blank";
		if (instance.storage('anticheatlinks')) bbcheat = true;
        var start = new Date().getTime();        
        var s = scoreboardData;
        var teams = instance.calculateTeamTotals(instance, scoreboardData);        
        
        html = "";
		
		html += '<div style="display: table; width:100%;">'; 
		
		var showtickers = 0;
		var teamcount = 0;
		function isOdd(num) { return num % 2;}
		
        for(var i = 0; i < teams.length; i++)
        {
            var team = teams[i];
            var teamName = instance.lookup.teamName(s.gameMode, team.status);
			
			if (team.players.length < 1) break;
			
            var teamFlag = instance.lookup.teamFlag(teamName);           

            var squads = {}; //Squads object
            var squadNames = [];

            //Sort the team players into squads, and calculate their respective totals
			
            for(j = 0; j < team.players.length; j++) 
            {
                var player = team.players[j];
                var playerSquadName = instance.lookup.squadName(player.squad);
                
                if(squads.hasOwnProperty(instance.lookup.squadName(player.squad)))
                {
                    squads[playerSquadName].players.push(player);
                } 
                else 
                {
                    squadNames.push(playerSquadName);
                    squads[playerSquadName] = {};
                    squads[playerSquadName]["rank"] = 0;
                    squads[playerSquadName]["kills"] = 0;
                    squads[playerSquadName]["deaths"] = 0;
                    squads[playerSquadName]["score"] = 0;                   
                    squads[playerSquadName]["sTotal"] = 0;  
                    squads[playerSquadName]["players"] = [];
                    squads[playerSquadName].players.push(player);
                }
                //Add player stats to squad total
                squads[playerSquadName]["kills"] += player.kills;
                squads[playerSquadName]["deaths"] += player.deaths;
                squads[playerSquadName]["score"] += player.score;
                squads[playerSquadName]["rank"] += player.rank;

                if(instance.playerStats.hasOwnProperty(player.id)) {
                    var pStats = instance.playerStats[player.id];
                    var pDisplayStat = pStats.overviewStats[instance.storage('displayStat')];					
                    squads[playerSquadName]["sTotal"] += pDisplayStat;
                }
            }
			
			var sspacdiv = "";	
			var whatktab = false;
			var setmtab = isOdd(teamcount);
			if (teamcount == 0 || setmtab == 0) { 
				whatktab = true;
						 
			} else { sspacdiv = "padding-left: 5px;"; }
			teamcount += 1;
			if (whatktab) html += '<div style="display:table-row; width: 100%; '+sspacdiv+'">'; 
						
            html += '<div style="display:table-cell; width: 50%; '+sspacdiv+'" class="as-scoreboard-wrapper" teamId = "' + team.status.teamId + '"><table class="table table-hover scoreboard as-scoreboard-table" teamId="' + team.status.teamId + '">';
			BBLog.storage("RgameModeAS", s.gameMode);		
			if (s.gameMode != 512) {
				html += instance.doteaminfo(instance, team, s, showtickers, teamFlag, teamName);
			}	          

            //HTML for table header
			var whatishere = instance.lookup.displayStat(instance.storage('displayStat'));			
            html += '<tr class="as-scoreboard-head"><td class="center">R</td><td>Name</td><td>K</td><td>D</td><td>Score</td><td>K/D</td><td>' + whatishere +'</td></tr></thead>'; 			

            //Sort the array of squadnames alphabeticaly
            squadNames.sort();

			var totstrength = 0;
            for (var j = 0; j < squadNames.length; j++)
            {
				totstrength = 0;
                var squadName = squadNames[j];
                var squad = squads[squadName];
                var sKD = squad.deaths == 0 ? squad.kills : squad.kills/squad.deaths;

				var checkifitneed = instance.storage('displayStat');
				
				if (!squadName) squadName = "No squad"; 
								
				var sesc = "";
				var sqsc = "";
				if (instance.storage('hilightsquad')) {
					sqsc = "&#8718; "; // ∎ 
					var cksc = j+1;
					if (squadName == "No Squad") cksc = 0;
					var squadscol= instance.lookup.squadColor(cksc);
					sesc = 'color:'+squadscol+';';					
				}					
				var shosqdlimit = "/5";
				if (squadName == "No Squad") shosqdlimit = '';
				var sqfirstp = 0;				

				var htmlb = "";	
                for(var k = 0; k < squad.players.length; k++)
                {
                    var player = squad.players[k];
					sqfirstp = player.id;
					
                    var pRank = '<div class="bf4-rank rank small r' + player.rank + ' rank_icon" data-rank="' + player.rank +'"></div>';
                    var pName = player.tag.length > 0 ? '[' + player.tag + ']' + player.name : player.name;

                    var pKD = player.deaths == 0 ? player.kills : player.kills/player.deaths;
                    var hilightingType = false;
										
					var sethtpc = "";
					if (instance.storage('hilightingEnabled') && pDisplayStat !== '...') {
						hilightingType = instance.lookup.hilightingClass(instance.storage('displayStat'), player.pDisplayStat);
					
						// hilightingType low, average, good, high, v-high, pro *					
						if (hilightingType  == "low") sethtpc = "background-color:#124377;";
						if (hilightingType  == "average") sethtpc = "background-color:#11592B;";
						if (hilightingType  == "good") sethtpc = "background-color:#7C5F1D;";
						if (hilightingType  == "high") 	sethtpc = "background-color:#791D22;";
						if (hilightingType  == "v-high") sethtpc = "background-color:#6A2576;";
						if (hilightingType  == "pro")  sethtpc = "background-color:#060606;";
										
                    }				
					var fontsize = "15px";
					if (pName.length > 20) fontsize = "14px";
					var isFriend = false;								
					if (instance.storage('hilightFriends')) {
						var friends = comcenter.getFriendsListFromLs();					
						var mfriend = "";								
						var newname = pName;			
						for ( var mk = 0; mk < friends.length; mk++ )
						{
							if(friends[mk].username == player.name) {
								isFriend = true;
								mfriend = 'color:#000000; background-color:#00c8ff;'; // #00c8ff						
								break;
							}
						}
					}
					 					
					if (isFriend == true) { 
						 pName = `<a style="`+fontsize+`; ` + mfriend + `"  onclick="window.open ('https://battlelog.battlefield.com/bf4/user/` + player.name + `/', '`+bbtarget+`'); return false" href="javascript:void(0);">` + player.name + `</a>`; 
					} else { 
						 pName = `<a style="`+fontsize+`; `+sesc+`" onclick="window.open ('https://battlelog.battlefield.com/bf4/user/` + player.name + `/', '`+bbtarget+`'); return false" href="javascript:void(0);">` + pName + `</a>`; 
					} 

                    //Generate table row
					if (checkifitneed == "strength") totstrength += player.pDisplayStat;
					var antilinks = "";
					if (bbcheat) antilinks = `<br> ☠ <a style="font-size: 11px;color:red;" href='https://bf4db.com/player/` + player.id  + `' target='_blank'>BF4DB</a> | <a style="font-size: 11px;color:#445C9C;" href='https://bf4cheatreport.com?bblog=1&cnt=100&pid=` + player.id  + `' target='_blank'>BF4CR</a>`;
					
                    htmlb += '<tr style="'+sethtpc+'" class="as-player' + (player.id == instance.data.advancedViewPlayer ? ' as-advanced-stats-selected' : '') + (isFriend ? ' friend' : '') + (hilightingType ? ' ' + hilightingType : '') + '" personaid="' + player.id + '"><td class="center">' + pRank + '</td><td>' + pName + ' ' + antilinks + '</td><td>' + player.kills + '</td><td>' + player.deaths + '</td><td>' + player.score +'</td><td>' + pKD.toFixed(2) + '</td><td>' + player.pDisplayStat + '</td></tr>';

                    if (player.id == instance.data.advancedViewPlayer) {
                        htmlb += instance.createAdvancedPlayerView(instance, player.id, true);
                    } 

                }

                var avgSquadRank = Math.floor(squad.rank / squad.players.length);
                var avgRank = '<div class="bf4-rank rank small r' + avgSquadRank + ' rank_icon" data-rank="' + avgSquadRank + '"></div>';
			
				var totalsgame = squad.sTotal;				
				if (checkifitneed == "strength") squad.sTotal = totstrength;
				if (checkifitneed != "kills" && checkifitneed != "deaths") totalsgame = (squad.sTotal / squad.players.length).toFixed(2);
				if (instance.storage('hilightingEnabled') && pDisplayStat !== '...') {
						hilightingType = instance.lookup.hilightingClass(instance.storage('displayStat'), totalsgame);
						sethtpc = "";
						if (hilightingType  == "low") sethtpc = "background-color:#1e70c8;";
						if (hilightingType  == "average") sethtpc = "background-color:#25c15e;";
						if (hilightingType  == "good") sethtpc = "background-color:#ba8f2c;";
						if (hilightingType  == "high") 	sethtpc = "background-color:#b92d34;";
						if (hilightingType  == "v-high") sethtpc = "background-color:#ae3dc2;";
						if (hilightingType  == "pro")  sethtpc = "background-color:#333333;";
				}		
				
				var sqdinfnum = squad.players.length;				
				if (s.gameMode != 512 && s.gameMode != 8) sqdinfnum = '[' + squad.players.length + shosqdlimit+']';
				var joinsqd = "";
				if (squad.players.length < 5 && squadName != "No Squad" && s.gameMode != 512) joinsqd = '&nbsp;<button id="as-ao-join" persona-id="' + sqfirstp + '" class="btn btn-tiny btn-primary arrow" data-tooltip="Join ' + squadName.toUpperCase() + ' squad"> </button>';
				var squadrow = '<tr class="as-squad-row" style="background-color: rgba(7, 7, 7, 0.5);"><td colspan="7" class="center" style="padding: 10px; '+sesc+'"><span style="font-size: 24px; '+sesc+'">'+sqsc+'</span><span style=font-weight: bold;>' + squadName.toUpperCase() + '</span> '+sqdinfnum+' '+joinsqd+'</td/></tr>';
				html += squadrow + "" + htmlb;
				html += '<tr style="'+sethtpc+'" class="as-squad-summary"><td colspan="2" style="font-weight: bold; padding: 5px; '+sesc+'"> '+squadName.toUpperCase()+' Total</td><td>' + squad.kills + '</td><td>' + squad.deaths + '</td><td>' + squad.score + '</td><td>' + sKD.toFixed(2) + '</td><td>' + totalsgame + '</td></tr>';
				
                for(var k = squad.players.length; k < 5; k++)
                {
                    html += '<tr class="as-squad-spacer"><td colspan="7"></td></tr>';
                }
            }
            /*** Create tfoot from averages ***/

            //Average rank display html
            var avgRank = '<div class="bf4-rank rank small r' + Math.floor(team.totalRank/team.totalPlayers) + ' rank_icon" data-rank="' + Math.floor(team.totalRank/team.totalPlayers) +'"></div>'
            //Average KD
            var avgKD = team.totalDeaths == 0 ? team.totalKills : team.totalKills/team.totalDeaths;
            //Average pDisplayStat
            var avgpDisplayStat = team.totalPDisplayStat == 0 ? '...' : (team.totalPDisplayStat/team.playersLoaded).toFixed(2);

            //HTML for scoreboard foot            
            html += '</table>'
            html += '</div>';
			
			if (whatktab == false) html += '</div>';
        }
		
		html += '</div></div>'; 
		
		var rhtml = instance.doroundinfo(instance, team, s, showtickers, teamFlag, teamName);
		$("#as-scoreboard-round-properties").html(rhtml);

        if($("#as-scoreboard-container").is(':visible')) {
            $("#as-scoreboard-container").html(html)
        } else { //Catch issue with navigation
            instance.unloadPlugin(instance);
            instance.handler(instance);
        }
    },

    drawRoleScoreBoard : function(instance, scoreboardData) 
    {
		var bbcheat = false;
		var bbtarget = "_self";
		if (instance.storage('bblinks')) bbtarget = "_blank";
		if (instance.storage('anticheatlinks')) bbcheat = true;
		
        var start = new Date().getTime();
                
        var s = scoreboardData;
        var vehicleRoles = instance.calculateRoles(instance, s);
        var teams = instance.calculateTeamTotals(instance, scoreboardData);

        //We now have our custom teams object with all the relevant information
        var html = "";

		html += '<div style="display: table; width:100%;">'
        //Iterate by vehicle type

		var showtickers = 0;
		var teamcount = 0;
		function isOdd(num) { return num % 2;}
		
        for (i = 0; i < vehicleRoles.length; i++) {
            var teamVehicleRoles = vehicleRoles[i];
            var team = teams[i];

            var teamName = instance.lookup.teamName(s.gameMode, team.status);
			
			if (team.players.length < 1) break;
			
            var teamFlag = instance.lookup.teamFlag(teamName);
            //Players lookup object

            var teamPlayers = {};

            for (var playerId in team.players) {
                var player = team.players[playerId];
                teamPlayers[player.id] = player;
            }

            // console.log("Here is team:");
            // console.log(team);
			
			var sspacdiv = "";	
			var whatktab = false;
			var setmtab = isOdd(teamcount);
			if (teamcount == 0 || setmtab == 0) { 
				whatktab = true;
						 
			} else { sspacdiv = "padding-left: 5px;"; }
			teamcount += 1;
			if (whatktab) html += '<div style="display:table-row; width: 100%; '+sspacdiv+'">'; 

            html += '<div style="display:table-cell; width: 50%; '+sspacdiv+'" class="as-scoreboard-wrapper" teamId = "' + team.status.teamId + '"><table class="table table-hover scoreboard as-scoreboard-table" teamId="' + team.status.teamId + '">';
			BBLog.storage("RgameModeAS", s.gameMode);
			if (s.gameMode != 512) {
				html += instance.doteaminfo(instance, team, s, showtickers, teamFlag, teamName);

			html += '</tr></thead>';
			}
			
            for (var vehicleRole in teamVehicleRoles) {
                var vehicle = teamVehicleRoles[vehicleRole];
                // console.log("Vehicle is here:")
                // console.log(vehicle);

                //Sort by top players

                vehicle.topPlayers.sort(function (a, b) {
                    return a.kills == b.kills ? 0 : +(a.kills < b.kills) || -1;
                });
				
				var newvehimg = vehicle.lineart.replace("_lineart", "_fancy");
                html += '<tr class="as-role-title-row"><td class="as-role-title" style="padding:6px;" colspan="7"><div class="as-role-title-text">' + vehicleRole + '</div><div class="vehicle_unlock small ' + newvehimg + ' image"></div></td></tr>';				
                html += '<tr><td colspan="7" style="padding: 0px;"><div class="as-role-top-players"><table style="width:100%; border: 0px;">';
				html += '<tr class="as-scoreboard-head"><td class="center">R</td><td>Name</td><td>K</td><td>D</td><td>Score</td><td>K/D</td><td>Kills(G)</td></tr>';
                for (var key in vehicle.topPlayers) {
                    var topPlayer = vehicle.topPlayers[key];
                    var personaId = topPlayer.personaId;
                    var kills = topPlayer.kills;

                    var playerStats = teamPlayers[personaId];
                    // console.log(playerStats);

                    if(!playerStats)
                		continue;

                    var pRank = '<div class="bf4-rank rank small r' + playerStats.rank + ' rank_icon" data-rank="' + playerStats.rank + '"></div>'

                    //Player name including tags
                    var pName = playerStats.tag.length > 0 ? '[' + playerStats.tag + ']' + playerStats.name : playerStats.name;
                    
                    //Player K/D
                    var pKD = playerStats.deaths == 0 ? playerStats.kills : playerStats.kills / playerStats.deaths;

                    //Set hilighting class
                    
					var hilightingType = false;									
					var sethtpc = "";
					if (instance.storage('hilightingEnabled') && playerStats.statsLoaded) {
						hilightingType = instance.lookup.hilightingClass(instance.storage('displayStat'), playerStats.pDisplayStat);
					
						// hilightingType low, average, good, high, v-high, pro *					
						if (hilightingType  == "low") sethtpc = "background-color:#124377;";
						if (hilightingType  == "average") sethtpc = "background-color:#11592B;";
						if (hilightingType  == "good") sethtpc = "background-color:#7C5F1D;";
						if (hilightingType  == "high") 	sethtpc = "background-color:#791D22;";
						if (hilightingType  == "v-high") sethtpc = "background-color:#6A2576;";
						if (hilightingType  == "pro")  sethtpc = "background-color:#060606;";
										
                    }		

                    var isFriend = false;
								
					if (instance.storage('hilightFriends')) {
						var friends = comcenter.getFriendsListFromLs();					
						var mfriend = "";								
						var newname = pName;			
						for ( var k = 0; k < friends.length; k++ )
						{
							if(friends[k].username == playerStats.name) {
								isFriend = true;
								mfriend = 'color:#000000; background-color:#00c8ff;'; // #00c8ff						
								break;
							}
						}
					}
					
					var pSName = instance.lookup.squadName(playerStats.squad);
					var sesc = "";
					var sqsc = "";
					if (instance.storage('hilightsquad')) {
						sqsc = "&#8718; "; // ∎ ☠
						var squadscol= instance.lookup.squadColor(playerStats.squad);
						sesc = 'color:'+squadscol+';';				
					}	
				
					var mtip = `data-tooltip="<h2 style='`+sesc+`'>`+pSName+`</h2>"`;									
					var fontsize = "15px";
					if (pName.length > 20) fontsize = "14px";
					
					if (isFriend == true) { 
						 pName = `<span `+mtip+`><a style="font-size: `+fontsize+`; ` + mfriend + `"  onclick="window.open ('https://battlelog.battlefield.com/bf4/user/` + playerStats.name + `/', '`+bbtarget+`'); return false" href="javascript:void(0);">` + playerStats.name + `</a></span>`; 
					} else { 
						 pName = `<span `+mtip+`><a style="font-size: `+fontsize+`; `+sesc+`" onclick="window.open ('https://battlelog.battlefield.com/bf4/user/` + playerStats.name + `/', '`+bbtarget+`'); return false" href="javascript:void(0);">` + pName + `</a></span>`; 
					} 
					var antilinks = "";
					if (bbcheat) antilinks = `<br> <span style="font-size: 24px; margin-top:-8px; `+sesc+`" `+mtip+`>`+sqsc+`</span> <a style="font-size: 11px;color:red;" href='https://bf4db.com/player/` + playerStats.id  + `' target='_blank'>BF4DB</a> | <a style="font-size: 11px;color:#445C9C;" href='https://bf4cheatreport.com?bblog=1&cnt=100&pid=` + playerStats.id  + `' target='_blank'>BF4CR</a>`;
					
                    // 
					html += '<tr style="'+sethtpc+' line-height: 12px;" class="as-player' + (playerStats.id == instance.data.advancedViewPlayer ? ' as-advanced-stats-selected' : '') + (isFriend ? ' friend' : '') + (hilightingType ? ' ' + hilightingType : '') + '" personaid="' + playerStats.id + '"><td class="center">' + pRank + '</td><td>' + pName + ' ' + antilinks + '</td><td>' + playerStats.kills + '</td><td>' + playerStats.deaths + '</td><td>' + playerStats.score + '</td><td>' + pKD.toFixed(2) + '</td><td>' + topPlayer.kills + '</td></tr>'

                    //If a specific player is selected for the advanced view, inject the HTML here					
                    if (playerStats.id == instance.data.advancedViewPlayer) {                        
                        html += instance.createAdvancedPlayerView(instance, playerStats.id, true);
                    }

                }
                html += '</table></div></td></tr>'								
            }			
			
            html += '</table></div>';
			
			if (whatktab == false) html += '</div>';
			
			
        }
		html += '</div>';

        if ($("#as-scoreboard-container").is(':visible')) {
            $("#as-scoreboard-container").html(html)
        } else { //Catch issue with navigation
            instance.unloadPlugin(instance);
            instance.handler(instance);
        }

    
        var end = new Date().getTime();
        var time = end - start;

        // console.log("Role Scoreboard took " + time + "ms");

    },

    //Updates the round header
    updateRoundHeader : function(instance, s) 
    {

        var totalPlayers = 0;
        // console.log("updating header");
        // console.log(s);
        for (var i = 0; i < s.teams.length; i++)
        {
            var team = s.teams[i];
            totalPlayers += team.players.length;
        }
        $("#as-server-players").html(totalPlayers + '/' + s.maxPlayers + (s.queueingPlayers > 0 ? '[' + s.queueingPlayers + ']' : ''));
    },
    /**
 	 * Creates the HTML for the advanced player view, detailing the soldiers statistics
 	 *
 	 * 
 	 *
 	 */
    createAdvancedPlayerView : function(instance, personaId, displayDefault){
       		
		var sethtpc = "";
		var notagname = "";
		var bbcheat = false;
		var bbtarget = "_self";
		if (instance.storage('bblinks')) bbtarget = "_blank";
		if (instance.storage('anticheatlinks')) bbcheat = true;
		var shownewdmg = false;
		if (BBLog.BBWF) shownewdmg = true;	
		var spantotal = 7;
		var gameMode = BBLog.storage("RgameModeAS");
		if (gameMode == 512) {
			spantotal = 9;
		}	
         //Ensure statistics are present locally
        if(!instance.playerStats.hasOwnProperty(personaId)) {
			
            html += '<div class="loader small"></div></div></td></tr>'
        } else {
            //Create stats overview here

            var pStats = instance.playerStats[personaId];

					// no stats fix				
					if (pStats.overviewStats.nostats == 1) { return; }
					
					if (instance.storage('hilightingEnabled') && pStats.pDisplayStat !== '...') {
						var pDisplayStatb = pStats.overviewStats[instance.storage('displayStat')];
						
						if(instance.storage('displayStat') == "strength") {
							var strength = (((pStats.overviewStats.killsPerMinute * pStats.overviewStats.kdRatio) * 10) + ((pStats.overviewStats.skill * pStats.overviewStats.scorePerMinute) / 10000)) * 10;                            
							pDisplayStatb = Math.floor(strength);
						}
						 hilightingType = instance.lookup.hilightingClass(instance.storage('displayStat'), pDisplayStatb);
					
						// hilightingType low, average, good, high, v-high, pro *					
						if (hilightingType  == "low") sethtpc = "background-color:#124377;";
						if (hilightingType  == "average") sethtpc = "background-color:#11592B;";
						if (hilightingType  == "good") sethtpc = "background-color:#7C5F1D;";
						if (hilightingType  == "high") 	sethtpc = "background-color:#791D22;";
						if (hilightingType  == "v-high") sethtpc = "background-color:#6A2576;";
						if (hilightingType  == "pro")  sethtpc = "background-color:#333333;";

						var wotdp = instance.storage('displayStat');
						var wotistv = pDisplayStatb;						
                    }	
					

			 var html = '<tr id ="as-scoreboard-advanced-stats-row" class="as-scoreboard-advanced-stats-row" style="'+sethtpc+'"><td colspan="'+spantotal+'" style="padding:5px;">' +		
			'<div id="as-advanced-player-view" class="as-advanced-player-view" style="'  + (displayDefault ? '' : ' display:none;') + '">'; 	
		
            var playerName = pStats.name;
            var timePlayed = pStats.overviewStats.timePlayed;


            var timePlayedHours = (timePlayed/60)/60;
            var timePlayedMinutes = (timePlayedHours - Math.floor(timePlayedHours)) * 60;

            if (pStats.activeEmblem) {
                var emblemPath = pStats.activeEmblem.cdnUrl;
                emblemPath = emblemPath.replace('[SIZE]', '128');
                emblemPath = emblemPath.replace('[FORMAT]', 'png');
            }
            notagname = pStats.name.replace(/\[.*\]/, '');
			
			//Get Dogtag Information
	
			var setembl = ["", "-3px"];
			var stylefsetemb = 'position: relative;top: -7px;z-index: 10;';
			if (pStats.activeEmblem) { 
				setembl[0] = '<td style="text-align: center; padding: 4px;"><img class="as-ao-emblem" src="' + emblemPath + '"></img></td>';
				setembl[1] = "-15px";
				stylefsetemb = 'position: absolute;top: 109px;z-index: 10; left: 9px;';
			}	
			if (bbcheat) lnhfcheat = "line-height: 29px;";
			
			var dogtagBasic = 'cdn.battlelog.com/bl-cdn/cdnprefix/production-5766-20200917/public/profile/warsaw/gamedata/dogtags/large/' + pStats.dogTagBasic.imageConfig.slug + ".png";
            var dogtagAdvanced = 'cdn.battlelog.com/bl-cdn/cdnprefix/production-5766-20200917/public/profile/warsaw/gamedata/dogtags/large/' + pStats.dogTagAdvanced.imageConfig.slug + ".png";
			var htmltags = '<div class="dogtags dogtags-chain horizontal"style="position: relative;top: '+setembl[1]+';">'+
			'<img class="basic rotated large" src="//'+dogtagBasic+'">'+
			'<img class="advanced large" src="//'+dogtagAdvanced+'">'+			
			'<div class="dog-tag-name-overlay"><p>'+notagname+'</p></div>'+
			'</div>';
			var conttaghtml = htmltags; 
			            
			var lnhfcheat = "" ;
            html += '<div class="as-ao-header" style="width: 100%;"><table style="width: 100%;"><tr>' + setembl[0] +
                '<td style="text-align: center;">'+conttaghtml+
				'<div style="'+stylefsetemb+'"><button id="as-ao-join" persona-id="' + personaId + '" class="btn btn-tiny btn-primary arrow" data-tooltip="Join Player"> </button>' +
				'&nbsp;<button class="as-ao-btn btn btn-tiny" onclick=" window.open(\'https://battlelog.battlefield.com/bf4/loadout/'+notagname+ '/'+ personaId +'/pc/#overview\',\''+bbtarget+'\')">Loadout</button>';
				
			if (bbcheat) {
				html += '&nbsp;<button class="as-ao-btn btn btn-tiny" onclick=" window.open(\'https://bf4db.com/player/'+ personaId +'\',\'_blank\')">BF4DB</button>' +				
				'&nbsp;<button class="as-ao-btn btn btn-tiny" onclick=" window.open(\'https://www.247fairplay.com/CheatDetector/'+ notagname +'\',\'_blank\')">FairPlay</button>' +
				'&nbsp;<button class="as-ao-btn btn btn-tiny" onclick=" window.open(\'https://bf4cheatreport.com?bblog=1&cnt=100&pid='+ personaId +'\',\'_blank\')">BF4CR</button>';			
			}	
            html += '</div><div></td></tr></table>';
			
            //Top kits
            var topKits = '<table style="table-layout: fixed;" class="table as-advanced-overview-top-kits">' +
			'<tr><th><div class="kit-icon xsmall kit-1"></div></th><th><div class="kit-icon xsmall kit-2"></div></th><th><div class="kit-icon xsmall kit-32"></div></th><th><div class="kit-icon xsmall kit-8"></div></th></tr>' +
			'<tr><td>&nbsp;<div class="service-star">' + pStats.overviewStats.serviceStars["1"] + '</div><div style="margin-top: 5px;">&nbsp; Kills: '+pStats.overviewStats.kills_assault+'</div></td><td><div class="service-star">' + pStats.overviewStats.serviceStars["2"] + '</div><div style="margin-top: 5px;">&nbsp; Kills: '+pStats.overviewStats.kills_engineer+'</div></td><td><div class="service-star">' + pStats.overviewStats.serviceStars["32"] + '</div><div style="margin-top: 5px;">&nbsp; Kills: '+pStats.overviewStats.kills_support+'</div></td><td><div class="service-star">' + pStats.overviewStats.serviceStars["8"] + '</div><div style="margin-top: 5px;">&nbsp; Kills: '+pStats.overviewStats.kills_recon+'</div></td>' +
		    '</table>';


            //Stats overview http://battlelog.battlefield.com/bf4/platoons/view/3353238464465530114/

            // console.log(pStats);

            //Viewport
            html += '<div class="as-ao-view" style="padding:4px;">';
            
            html += '<div class="as-ao-stats">';
            

            html += '<div class="as-advanced-overview-top-stats">' +
            '<table style="table-layout: fixed;" class="table as-advanced-overview-top-stats">' +
            '<tr><th>Kills</th><th>Deaths</th><th>KDR</th><th>Accuracy</th></tr>' +
            '<tr><td>&nbsp;' + instance.commaFormat(pStats.overviewStats.kills) + '</td><td>' + instance.commaFormat(pStats.overviewStats.deaths) + '</td><td>' + (pStats.overviewStats.kills/pStats.overviewStats.deaths).toFixed(2) + '</td><td>' + pStats.overviewStats.accuracy.toFixed(2) + '%</td></tr>' +
            '<tr><th>KPM</th><th>SPM</th><th>Skill</th><th>Time</th></tr>' +
            '<tr><td>&nbsp;' + pStats.overviewStats.killsPerMinute + '</td><td>' + pStats.overviewStats.scorePerMinute + '</td><td>' + pStats.overviewStats.skill + '</td><td>' + timePlayedHours.toFixed(0) + 'H ' + timePlayedMinutes.toFixed(0) +'M </td></tr>' +
			'</table>';

            html += topKits;

            html += '</div>'

            //Overview Stats

            //Overview Table
		
            html += '<div class="as-advanced-overview-top-roles">';
			
			var showdmghtmltr = "";
			if (shownewdmg) showdmghtmltr = "<th>DMG</th>";
			
            html += '<table style="" class="table as-advanced-overview-top-weapons">' +
            '<tr><th colspan="2">Weapon</th><th>Kills</th><th>Headshots</th><th>Accuracy</th>'+showdmghtmltr+'<th>KPM</th></tr>';
			
			var opennwbbl = bbtarget;			
            $.each(pStats.topWeapons, function(id, weapon){
                //Get vehicle name for image
				
				var showdmghtmltd= "";	
				var dmgscolor = "#ffffff";
				if (shownewdmg) {
					if (BBLog.BBWF[weapon.slug] && weapon.kills > 0) {					
						var wpndata = BBLog.BBWF[weapon.slug];
						var ShotsPerShell = wpndata.ShotsPerShell;
						var dmgMax = (wpndata.dmgMax*ShotsPerShell);						
						var shotsHit = weapon.shotsHit;						
						var pdmg = parseFloat(((weapon.kills*100)/shotsHit).toFixed(2));						
						var maxvirtualdmg = +(((dmgMax*0.54)*wpndata.hsmultiple) + (dmgMax * (1-0.54))).toFixed(2);
						if (pdmg > dmgMax) dmgscolor = "#38a220";
						if ((pdmg > (dmgMax+10)) && pdmg <= maxvirtualdmg) dmgscolor = "#ef9e2b";
						if (pdmg > maxvirtualdmg) dmgscolor = "#ef9e2b";
						if (pdmg > (maxvirtualdmg)+10) dmgscolor = "#e2361f";						
						showdmghtmltd = '<td style="color:'+dmgscolor+';" data-tooltip="<h2>Max default damage(no HC): '+dmgMax+'</h2>">'+pdmg+'</td>';						
					} else {
						showdmghtmltd = "<td>--</td>";
					}					
				}

				 // testar todos os itens
                 var weaponDisplay = window.items.game_data.compact.weapons[weapon.guid];
				 weaponDisplay = weaponDisplay.see[0];
				 var lineartSlug = window.items.game_data.compact.weapons[weaponDisplay];
                 lineartSlug = lineartSlug.imageConfig.slug.replace("_lineart", "_fancy");
				 var wpnimg = { "ucav" : "UACV_fancy", "xm25-smoke" : "XM25_fancy", "m320-fb" : "M320_fancy", "precision" : "knife_precision_fancy", "seal" : "knife_sealknife_fancy", "xm25-dart" : "XM25_fancy", "tactical" : "knife_tactical2_fancy", "m320-lvg" : "M320_fancy", "neck" : "knife_neck_fancy", "m320-dart" : "M320_fancy", "m249" : "M249_fancy", "boot" : "knife_bootknife_fancy", "m320-smk" : "M320_fancy", "bj-2" : "knife_2142_fancy", "dive" : "knife_diver_fancy", "m320-3gl" : "M320_fancy", "m26-frag" : "M26Mass_fancy", "m26-slug" : "M26Mass_fancy", "m26-dart" : "M26Mass_fancy"};
				 if (wpnimg[weapon.slug]) {
					lineartSlug = wpnimg[weapon.slug];
					console.log(lineartSlug);
				 }		
				
				var wpnkpmc = 0;
				if (weapon.kills > 0) wpnkpmc = weapon.timeEquipped > 0 ? (weapon.kills/(weapon.timeEquipped/60)).toFixed(2) : '--';	
				var kpmc = ((weapon.shotsHit / weapon.shotsFired) * 100).toFixed(2);				
				
				if (isNaN(kpmc)) kpmc = 0;
				var weaponheadshots = 0;
				if (weapon.headshots) weaponheadshots = weapon.headshots;
				var mhsRate = ((100 / weapon.kills) * weaponheadshots).toFixed(2).toString();
				
				if (isNaN(mhsRate)) mhsRate = 0;
				
				var myweaponData = weapon.category;
				var misnip = 23;	
				if (typeof myweaponData != "undefined" && myweaponData != null) {
					if (myweaponData.toUpperCase().indexOf("SNIPER") !== -1) misnip = 55;								
					if (myweaponData.toUpperCase().indexOf("DMR") !== -1) misnip = 40;
					if (myweaponData.toUpperCase().indexOf("LMG") !== -1 || weapon.slug == "id-p-xp6-iname-m60ult") misnip = 17;
					if (myweaponData.toUpperCase().indexOf("SIDEARM") !== -1) misnip = 30;
					if (myweaponData.toUpperCase().indexOf("SHOTGUN") !== -1) misnip = 6;
				}
				var mhscolor = "#ffffff";
				if (mhsRate > (misnip)) mhscolor = "#38a220";
				if (mhsRate > (11+misnip)) mhscolor = "#ef9e2b";
				if (mhsRate > (25+misnip)) mhscolor = "#e2361f";
				var mhsRatetext = ' <span style="color:'+mhscolor+'">('+mhsRate+'%)</span>';				
				var wpnlink = `style="cursor:crosshair;" onclick="window.open ('https://battlelog.battlefield.com/bf4/soldier/`+notagname+`/weapons/`+personaId+`/pc/#`+weapon.slug+`', '`+opennwbbl+`'); return false"`;
                html += '<tr><td colspan="2" '+wpnlink+'><div style="top:6px; position:relative;">&nbsp;&nbsp;'+weapon.slug.toUpperCase()+'</div><center><div class="weapon_unlock ' + lineartSlug + ' xsmall image"></div></center></td><td style="font-size:small;">' + instance.commaFormat(weapon.kills) + '</td><td style="font-size:small;">' + instance.commaFormat(weaponheadshots) + ' ' + mhsRatetext + ' </td><td>' + kpmc + '%</td>'+showdmghtmltd+'<td>'+wpnkpmc+'</td></tr>'

            });
            
			html += '</table><table style="" class="table as-advanced-overview-top-vehicles">' +
            '<tr><th colspan="2" style="width:25%;">Vehicle</th><th style="width:25%;">Kills</th><th style="width:25%;">KPM</th><th>Time</th></tr>';

            //Top vehicles
            $.each(pStats.topVehicles, function (id, vehicle) {

                //Get vehicle name for image

                var vehicleDisplay = window.items.game_data.compact.vehicles[vehicle.guid];
                vehicleDisplay = vehicleDisplay.see[0];

                var lineartSlug = window.items.game_data.compact.vehicles[vehicleDisplay];
                lineartSlug = lineartSlug.imageConfig.slug.replace("_lineart", "_fancy"); //lineartSlug.imageConfig.slug;

				kpmc = vehicle.timeIn > 0 ? (vehicle.kills/(vehicle.timeIn/60)).toFixed(2) : '--';		

				var timePlayedHoursv = (vehicle.timeIn/60)/60;
				var timePlayedMinutesv = (timePlayedHoursv - Math.floor(timePlayedHoursv)) * 60;
							
				var wpnlink = `<a style="cursor:crosshair;" onclick="window.open ('https://battlelog.battlefield.com/bf4/soldier/`+notagname+`/vehicles/`+personaId+`/pc/#`+vehicle.slug+`', '`+opennwbbl+`'); return false" href="javascript:void(0);">`+vehicle.slug.toUpperCase()+`</a>`;
                html += '<tr><td>&nbsp;' + wpnlink + '&nbsp; </td><td><div class="vehicle_unlock xsmall ' + lineartSlug + ' image"></div></td><td>' + instance.commaFormat(vehicle.kills) + '</td><td>' + kpmc + '</td><td>' + timePlayedHoursv.toFixed(0) + 'H ' + timePlayedMinutesv.toFixed(0) +'M </td></tr>'
            });


            html += '</table></div>';
            
            html += '</div>'

            //End of as-ao-stats
            html += '</div>';
        }

        return html;

    },

    //Draw the advanced statistics overview 

    drawAdvancedStats : function (instance, personaId) {

        var player = instance.playerStats[personaId];

        //Load the players weapon stats
        
        var playerVehicleStats = {};
        instance.loadPlayerVehicleStats(personaId, function (data)
        {
            playerVehicleStats = data.data;
        });

        var playerWeaponStats = {};
        instance.loadPlayerWeaponStats(personaId, function (data) {
            playerWeaponStats = data.data;
            
            $("#as-container").fadeOut('slow', function () {
                var html = '<div id="as-stats-container">' + '<button class="as-stats-close">Back</button>';

                html += '<h3>' + player.name + '</h3>';

                html += '<div class="as-stats-selectors"><button class="btn as-stats-select-weapons">Weapons</button><button class="btn as-stats-select-vehicles">Vehicles</button></div>';

                //Container to list possible cheating flags

                html += '<div class="as-stats-overview">'

                html += '<div class="as-stats-weapons">' +
                '<table class="table as-stats-weapons-table">';
               
                html += '<tr><th>Weapon</th><th>Kills</th><th>Accuracy</th><th>HSKR</th><th>KPM</th></tr>';
				
                for (var i = 0; i < playerWeaponStats.mainWeaponStats.length; i++)
                {
                    var weapon = playerWeaponStats.mainWeaponStats[i];

                    if (weapon.kills > 100) {
                        var weaponDisplay = window.items.game_data.compact.weapons[weapon.guid];
                        weaponDisplay = weaponDisplay.see[0];
                        var lineartSlug = window.items.game_data.compact.weapons[weaponDisplay];
                        lineartSlug = lineartSlug.imageConfig.slug;

                        var w_accuracy = 0;
                        if (weapon.shotsFired > 0 &&  weapon.shotsHit > 0) {
                            w_accuracy = (weapon.shotsHit / weapon.shotsFired) * 100;
                        }

                        var w_kpm = 0;
                        if (weapon.kills > 0 && weapon.timeEquipped > 0) {
                            w_kpm = (weapon.kills / (weapon.timeEquipped / 60));
                        }

                        var w_hskr = 0;
                        if (weapon.kills > 0 && weapon.headshots > 0) {
                            w_hskr = ((weapon.headshots / weapon.kills) * 100);
                        }

                        html += '<tr class="as-stats-weapon"><td><div class="weapon xsmall ' + lineartSlug + ' image"></div><div>' + weapon.slug.toUpperCase() + '</div></td><td>' + weapon.kills + '</td><td>' + w_accuracy.toFixed(2) + '%</td><td>' + w_hskr.toFixed(2) + '%</td><td>' + w_kpm.toFixed(2) + '</td></tr>';
                        
                    }
                }
                html += '</table></div><div class="as-stats-vehicles" style="display: none;"><table class="table as-stats-vehicles-table">';
                html += '<tr><th>Vehicle</th><th>Kills</th><th>Vehicles Destroyed</th><th>KPM</th><th>Time</th></tr>';                

                for (var i = 0; i < playerVehicleStats.mainVehicleStats.length; i++) {
                    var vehicle = playerVehicleStats.mainVehicleStats[i];

                    if (vehicle.kills > 100) {
                        var vehicleDisplay = window.items.game_data.compact.vehicles[vehicle.guid];
                        vehicleDisplay = vehicleDisplay.see[0];
                        var lineartSlug = window.items.game_data.compact.vehicles[vehicleDisplay];
                        lineartSlug = lineartSlug.imageConfig.slug;

                        var v_vehiclesDestroyed = 0;
                        if (vehicle.destroyXinY > 0) {
                            v_vehiclesDestroyed = vehicle.destroyXinY;
                        }

                        var v_kpm = 0;
                        if (vehicle.timeIn > 0 && vehicle.kills > 0)
                        {
                            v_kpm = (vehicle.kills / (vehicle.timeIn / 60));
                        }

                        var v_time = (vehicle.timeIn / 60).toFixed(2);



                        html += '<tr class="as-stats-vehicle"><td><div class="vehicle xsmall ' + lineartSlug + ' image"></div><div>' + vehicle.slug.toUpperCase() + '</div></td><td>' + vehicle.kills + '</td><td>' + v_vehiclesDestroyed + '</td><td>' + v_kpm.toFixed(2) + '%</td><td>' + v_time + '</td></tr>';

                    }
                }

                html += '</table></div></div>';
                
				if (instance.storage('movescoretop')) { 
						$("server-page-join-buttons").after(html);
				} else {	
						$("#serverbrowser-page").after(html); 
				}					
                
            });

        });



    },

    drawSettings : function(instance) {
        var html = '<div id="as-settings-container"><header class="as-settings-header"><h1>' + instance.t("settings-title") + '</h1></header>' +
            '<div id="as-settings-options">';

        //Get the settings       
        var hilightingEnabled = instance.storage('hilightingEnabled') ? (instance.storage('hilightingEnabled') == true ? true : false) : false;


        /** Check box for the live update **/

        html += '<table class="as-settings-table">' +
            '<tr><td class="as-settings-table-header" colspan="3">General</td></tr>' +
            '<tr><th>Live Scoreboard</h><td>' +
            '<div class="switch-container pull-right clearfix">' +
                '<div class="switch pull-left">' +
                    '<input type="checkbox" id="as-enable-live" name="as-enable-live" value="' + instance.storage('liveEnabled').toString() + '" ' + (instance.storage('liveEnabled') == true ? 'checked' : '') + '>' +
                '<div class="handle"></div>' +
                '</div>' +
            '</div></td>' +
            '<td class="option-description"> Determines whether or not the scoreboard automatically updates as the game progresses</td>' +
            '</tr>' +
            '<tr><th>Highlighting</th><td>' +
            '<div class="switch-container pull-right clearfix">' +
                '<div class="switch pull-left">' +
                    '<input type="checkbox" id="as-enable-hilighting" name="as-enable-hilighting" value="' + hilightingEnabled.toString() + '" ' + (hilightingEnabled == true ? 'checked' : '') + '>' +
                '<div class="handle"></div>' +
                '</div>' +
            '</div></td>';
			
			
			html += '<td class="option-description"> Enables highlighting based off the strength of player statistics</td>' +
            '</tr>' +
            '<tr><th>Highlight Friends</th><td>' +
            '<div class="switch-container pull-right clearfix">' +
                '<div class="switch pull-left">' +
                    '<input type="checkbox" id="as-enable-friend-hilighting" name="as-enable-friend-hilighting" value="' + instance.storage('hilightFriends').toString() + '" ' + (instance.storage('hilightFriends') == true ? 'checked' : '') + '>' +
                '<div class="handle"></div>' +
                '</div>' +
            '</div></td>';

			
       html +=  '<td class="option-description"> Enables highlighting friends</td>' +      
			'</tr>' +
            '<tr><th>Colored Squads</th><td>' +
            '<div class="switch-container pull-right clearfix">' +
                '<div class="switch pull-left">' +
                    '<input type="checkbox" id="as-enable-squad-hilighting" name="as-enable-squad-hilighting" value="' + instance.storage('hilightsquad').toString() + '" ' + (instance.storage('hilightsquad') == true ? 'checked' : '') + '>' +
                '<div class="handle"></div>' +
                '</div>' +
            '</div></td>';

			
       html +=  '<td class="option-description"> Enables Squad colors on the scoreboard.</td>' +	   
	   
	   			'</tr>' +
            '<tr><th>Top Scoreboard</th><td>' +
            '<div class="switch-container pull-right clearfix">' +
                '<div class="switch pull-left">' +
                    '<input type="checkbox" id="as-scoretop" name="as-scoretop" value="' + instance.storage('movescoretop').toString() + '" ' + (instance.storage('movescoretop') == true ? 'checked' : '') + '>' +
                '<div class="handle"></div>' +
                '</div>' +
            '</div></td>';

			
       html +=  '<td class="option-description"> Move scoreboard to the top(need to reload).</td>' +	
	   
	   '</tr>' +
            '<tr><th>Battlelog Links</th><td>' +
            '<div class="switch-container pull-right clearfix">' +
                '<div class="switch pull-left">' +
                    '<input type="checkbox" id="as-bblinks" name="as-bblinks" value="' + instance.storage('bblinks').toString() + '" ' + (instance.storage('bblinks') == true ? 'checked' : '') + '>' +
                '<div class="handle"></div>' +
                '</div>' +
            '</div></td>';

			
       html +=  '<td class="option-description"> Open Battlelog link on a new tab.</td>' +
	   
	   '</tr>' +
            '<tr><th>Anti-Cheat links</th><td>' +
            '<div class="switch-container pull-right clearfix">' +
                '<div class="switch pull-left">' +
                    '<input type="checkbox" id="as-anticheatlinks" name="as-anticheatlinks" value="' + instance.storage('anticheatlinks').toString() + '" ' + (instance.storage('anticheatlinks') == true ? 'checked' : '') + '>' +
                '<div class="handle"></div>' +
                '</div>' +
            '</div></td>';

			
       html +=  '<td class="option-description"> Display anti-cheat links</td>' +	
	   
            '</tr>' +
            '<tr><th>Polling Rate (ms)</th><td><input id="as-polling-rate" type="number" name="as-polling-rate" value="' + instance.storage('pollingIntervalMs').toString() + '"></td>' +
            '<td class="option-description"> The frequency the scoreboard queries the gameserver for information. 5000ms is the default</td>' +
            '</tr>'+
            '<tr><th>Highlighting Info</th><td></td>' +
            '<td class="option-description">' +
			'<div style="padding:6px; display:table; text-align:center;">' +
			'<div style="display:table-cell; vertical-align: middle; width:80px; height:30px; background:#124377;">Low</div>' +
			'<div style="display:table-cell; vertical-align: middle; width:80px; height:30px; background:#11592B;">Average</div>' +
			'<div style="display:table-cell; vertical-align: middle; width:80px; height:30px; background:#7C5F1D;">Good</div>' +
			'<div style="display:table-cell; vertical-align: middle; width:80px; height:30px; background:#791D22;">High</div>' +
			'<div style="display:table-cell; vertical-align: middle; width:80px; height:30px; background:#6A2576;">Very High</div>' +
			'<div style="display:table-cell; vertical-align: middle; width:80px; height:30px; background:#060606;">Pro</div>' +
			'</div></td>' +
            '</tr>';
        html += '</table>';

        /** Input field for polling rate **/$("#as-advanced-player-view").css("background-color", '#888888');

        /** Check box for hilighting **/


        $('#as-scoreboard-container').html(html);
    },

    drawRoundInfo : function(instance)
    {
				
        var serverHeader = '<div id="as-scoreboard-roundinfo" style="background-color: rgba(7, 7, 7, 0.5); padding: 6px;">';

        serverHeader += '<div id="as-scoreboard-mapinfo"></div>';
		
		var defaultbuttons =  "";
		var mtopfix = 22;
		if (instance.storage('movescoretop')) {
			defaultbuttons = '<button class="btn btn-primary btn-small large arrow" data-bind-action="join-mp-gameserver" data-track="serverbrowser.server.join" data-role="1" data-telemetry-action="serverbrowser"> Join server </button>'+
			'&nbsp;&nbsp;<button id="as-spectator" style="display:none;" class="btn btn-small large arrow " data-bind-action="join-mp-gameserver" data-track="serverbrowser.server.spectator.join" data-role="4"> Spectator </button>' +
			'&nbsp;&nbsp;<button id="as-commander" style="display:none;" class="btn btn-small large arrow" data-bind-action="join-mp-gameserver" data-track="serverbrowser.server.commander.join" data-role="2"> Commander </button>';
			mtopfix = 10;
		}
           
        serverHeader += '<div id="as-scoreboard-round-properties" style="position: relative; top: '+mtopfix+'px;">'+ defaultbuttons +
        '<div><span>Players : </span><span id="as-server-players"></span></div>' +
        '<div><span>Time : </span><span id="as-server-time-remaining"></span></div>' +
        '</div>';


        serverHeader += '<div id="as-scoreboard-options" style="display: none; display: inline-block;position: relative;left: 517px;">' +
        '<div class="as-sort-option"><label class="as-settings-label" for="as-select-display-stat">Sort Stats Based on: </label><select id="as-select-display-stat">';

        var existingDisplayStat = instance.storage('displayStat');
        var customStats = ['skill', 'kdRatio', 'kills', 'deaths', 'strength'];

        for(var i = 0; i < customStats.length; i++) 
        {
            if(customStats[i] !== existingDisplayStat) {
                serverHeader += '<option value="' + customStats[i] + '">' + instance.lookup.displayStat(customStats[i]) + '</option>';
            } else { 
                serverHeader += '<option value="' + customStats[i] + '" selected>' + instance.lookup.displayStat(customStats[i]) + '</option>';
            }
        }
        serverHeader += '</select></div></div>';

        return serverHeader;
    },

    drawSelectors : function(instance) {
        
        var selectors = [
            { htmlId: 'as-show-players', htmlText: 'Show Players', drawMode: 'player' },
            { htmlId: 'as-show-squads', htmlText: 'Show Squads', drawMode: 'squad' },
            { htmlId: 'as-show-roles', htmlText: 'Show Vehicles', drawMode: 'role' }          
        ];

		// use hide to fix no round.
		
		if (instance.storage('movescoretop')) $("#server-page-join-buttons").hide();
		
        selectorHtml = '<div id="as-scoreboard-selectors" style="display: none; text-align: center; margin-bottom: 4px; margin-top:4px; width:98.7%; background-color: rgba(7, 7, 7, 0.5); padding: 6px;">';
        for (var i = 0; i < selectors.length; i++) {
            var selector = selectors[i];
            selectorHtml += '&nbsp;&nbsp;<button class="btn btn-small view-selector ' + (instance.data.drawMode === selector.drawMode ? 'btn-primary' : '') + '" id="' + selector.htmlId + '">' + selector.htmlText + '</button>';
        }

        selectorHtml += '&nbsp;&nbsp;<button class="btn btn-small view-selector" id="as-settings">Settings</button>';
        selectorHtml += '</div>';

        return selectorHtml;

    },

	/**
	 * Simple debugging
	 *
	 * @param	msg		Debug message
	 */
	debug: function(msg) {

		if(false) // true
			console.log(msg);
	},

	/**
	 * Returns JSON object containing server attributes extracted from the DOM 
	 *
	 * @return    JSON object containing server data
	 */
	getServerAttributes : function() {

		var $joinMpServerButton = $("#server-page-join-buttons");
   
		var server = {
			ip: $joinMpServerButton.data("ip"),
			gameId: $joinMpServerButton.attr("data-gameid"),
			port: $joinMpServerButton.data("port"),
			game: $joinMpServerButton.data("game"),
			guid: $joinMpServerButton.data("guid")
		};

		return server;
	},

	/**
	 * Returns scoreboard data from the game server 
	 *
	 * @callback callback	Callback function
	 * @param serverInfo    Server information in JSON format
	 *
	 */
	queryServerScoreboard : function(serverInfo, callback) {
		
		launcher.queryServer(serverInfo, function(queryInfo) { 
			if(!queryInfo) {
				// console.log("Could not obtain query info from the server!");
			} else {
				if(queryInfo.status == "OK") {
					// as-scoreboard-options as-scoreboard-selectors
					$("#as-scoreboard-selectors").css("display", 'inline-block');
					$("#as-scoreboard-options").css("display", 'inline-block');
					callback(queryInfo.result)
				} else {
					$("#as-scoreboard-options").hide();
					$("#as-scoreboard-container").html('<div class="as-scoreboard-roundfinished" style="background-color: rgba(7, 7, 7, 0.5); padding: 6px;">Round is over. Waiting for next round to start...</div>');
					// console.log("Round has not started");
				}
			}
		});


	},

    /**
     * Checks for players who don't't have their statistics cached and fetches them
     *
     * @param   scoreboardData  Scoreboard data from the game server
     * @param   instance        Plugin instance
     *
     */
	updatePlayerStats: function (instance, scoreboardData)
	{
	    var updatePlayers = [];
	    var toLoad = 0;
	    var loaded = 0;
	    //For each team

	    $.each(scoreboardData.teams, function (teamID, team) {
	        $.each(team.players, function (playerId, player) {
	            if (!instance.playerStats.hasOwnProperty(player.personaId)) {
	                toLoad++;
	            }
	        });
	    });
	    $.each(scoreboardData.teams, function (teamID, team)
	    {
            //For each player in the team
	        $.each(team.players, function (playerID, player)
	        {
				//Only load the statistics if they are not already present in the database
	            if (!instance.playerStats.hasOwnProperty(player.personaId)) {
	                var playerName = player.tag ? '[' + player.tag + ']' + player.name : player.name;
	                instance.loadPlayerStats(player.personaId, playerName, function (overviewStats, playerName)
				    {
	                    instance.playerStats[player.personaId] = overviewStats.data;
	                    instance.playerStats[player.personaId]["name"] = playerName;
	                    loaded++;
	                    if (loaded == toLoad) {
	                        instance.updateHTML(instance);
	                    }
					})
				} 
			});

		})
	},


	/**
	 * Return player status
	 *
	 * @callback callback	Callback function
	 * @param personaId		Persona ID of the player to be queried
	 *
	 */
	 
	loadserverStats: function (instance)
	{	
		instance.serveinfchkload.spectator = 0;
		instance.serveinfchkload.commander = 0;
		$.ajax({            
			url: window.location.href + "?json=1",
			type: 'GET',
			dataType: 'json',
			async: true,
			cache: false,
			timeout: 30000,
			success: function(data) {
				var comslot = data.message.SERVER_INFO.slots[4];
				var specslot = data.message.SERVER_INFO.slots[8].max;
				if (comslot) { 
					$("#as-commander").show(); // css('display', 'inline-block');
					instance.serveinfchkload.commander = 1;
				}	
				if (specslot > 0) {
					$("#as-spectator").show(); //.css('display', 'inline-block');			
					instance.serveinfchkload.spectator = 1;
				}  
			}	
		});		
	},
	
	loadPlayerStats: function (personaId, playerName, callback)
	{	
		$.ajax({            
			url: "https://battlelog.battlefield.com/bf4/warsawoverviewpopulate/" + personaId + "/1/",
			type: 'GET',
			async: true,
			cache: false,
			timeout: 30000,
			success: function(data) {
			    callback(data, playerName);
			}
		});		
	},

    /**
     * Returns a players weapon stats
     * 
     * @callback    callback    Callback function
     * @param       personaId   Persona ID of the player to fetch
     */
	loadPlayerWeaponStats: function (personaId, callback)
	{
	    $.ajax({            
	        url: "https://battlelog.battlefield.com/bf4/warsawWeaponsPopulateStats/" + personaId + "/1/stats/",
	        type: 'GET',
	        async: true,
	        cache: false,
	        timeout: 30000,
	        success: function(data) {
	            callback(data);
	        }
	    });	
	},

    /**
     * Returns a players vehicle stats stats
     * 
     * @callback    callback    Callback function
     * @param       personaId   Persona ID of the player to fetch
     */
	loadPlayerVehicleStats : function(personaId, callback)
	{
	    $.ajax({
	        url: "https://battlelog.battlefield.com/bf4/warsawvehiclesPopulateStats/" + personaId + "/1/stats/",
	        type: 'GET',
	        async: true,
	        cache: false,
	        timeout: 30000,
	        success: function (data) {
	            callback(data);
	        }
	    });
	},

	lookup : {
		displayStat : function(displayStatValue){

			var displayStatsLookup = { 
				'skill' : 'Skill', 
				'kdRatio' : 'K/D(G)', 
				'kills' : 'Kills', 
				'deaths': 'Deaths',
                'strength' : 'Strength'
			};

			return displayStatsLookup[displayStatValue];

		},

		teamName : function(gameMode, status) {

			if(gameMode == 2) return status.teamType.charAt(0).toUpperCase() + status.teamType.slice(1);

			var factions = ["US", "RU", "CN"];

			return factions[status.faction];

		},

		teamType : function(teamId) {

			if(teamId == 1) {
				var type = 'home'
			} else {
				var type = 'away';
			}

			return type;
		},

        teamFlag : function(teamName) 
        {
            var urlPrefix = "https://cdn.battlelog.com/bl-cdn/cdnprefix/2e8fa20e7dba3f4aecb727fc8dcb902f1efef569b/public/common/flags/";
            if (teamName == "US" || teamName == "RU" || teamName == "CN") {
                return urlPrefix + teamName.toLowerCase() + '.gif';
            } else {
                return false
            }
        },

		squadName : function(squadId) {				
			var squads = ["No Squad", "Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India", "Juliett", "Kilo", "Lima", "Mike", "November", "Oscar", "Papa", "Quebec", "Romeo", "Sierra", "Tango", "Uniform", "Victor", "Whiskey", "X-Ray", "Yankee", "Zulu"];			 
			return squads[squadId];
		},
		squadColor : function(squadId) {				
			var squadsc = ["#ffffff", "#FF641D", "#00FF30", "#ffff33", "#97D7F5", "#F30E16", "#FF00FC", "#e4cfc8", "#6C9BD0", "#ccffcc", "#ccffff", "#c8e4cf", "#ccd9ff", "#f3e6ff", "#ccff33", "#d5d5dd", "#00b3b3", "#d9ffb3", "#e6f3ff", "#ffd8cc", "#e6ffe6", "#ffe6ff", "#e6e6e6", "#808000", "#fff2cc", "#ffb3b3", "#e0d1d1", "#0000ff", "#b3b3ff", "#e6ffff", "#1affff", "#ffdacc"];
			return squadsc[squadId];
		},
		gameMode: function (mode)
		{
			// need to config game mods!
			
			return gamedata.function_localizedGameMode(2048, mode); 
		},
	    /*
        * Match the players stat to a hilighting class based on a defined statistic
        *
        */
		hilightingClass: function (displayStat, pDisplayStat) {			
	        if (displayStat == 'kdRatio') {
	            if (pDisplayStat < 1) {
	                hilightingType = 'low';
	            } else if (pDisplayStat < 2) {
	                hilightingType = 'average';
	            } else if (pDisplayStat < 3) {
	                hilightingType = 'good';
	            } else if (pDisplayStat < 4) {
	                hilightingType = 'high';
	            } else if (pDisplayStat < 5) {
	                hilightingType = 'v-high';
	            } else if (pDisplayStat >= 5) {
	                hilightingType = 'pro';
	            }
	        } else if (displayStat == 'skill') {
	            if (pDisplayStat < 200) {
	                hilightingType = 'low';
	            } else if (pDisplayStat < 300) {
	                hilightingType = 'average';
	            } else if (pDisplayStat < 400) {
	                hilightingType = 'good';
	            } else if (pDisplayStat < 500) {
	                hilightingType = 'high';
	            } else if (pDisplayStat < 600) {
	                hilightingType = 'v-high';
	            } else if (pDisplayStat >= 600) {
	                hilightingType = 'pro';
	            }
	        }
	        else if (displayStat == 'strength') {
	            if (pDisplayStat < 200) {
	                hilightingType = 'low';
	            } else if (pDisplayStat < 300) {
	                hilightingType = 'average';
	            } else if (pDisplayStat < 400) {
	                hilightingType = 'good';
	            } else if (pDisplayStat < 550) {
	                hilightingType = 'high';
	            } else if (pDisplayStat < 1000) {
	                hilightingType = 'v-high';
	            }else if (pDisplayStat >= 1000) {
	                hilightingType = 'pro';
	            }
	        } else {
			  return false;		
			}	

			return hilightingType;
        }

	},

	sortBy : function(field, reverse, primer)
	{

		var key = function (x) {return primer ? primer(x[field]) : x[field]};

		return function (a,b) {
			var A = key(a), B = key(b);
			return ( (A < B) ? -1 : ((A > B) ? 1 : 0) ) * [-1,1][+!!reverse];                  
		}
	},

	commaFormat : function(number)
	{
		
		if (number == null) return "0";
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	},

	/**
	 *
	 * Unloads plugin by clearing variables and intervals
	 *
	 * @param instance		Plugin Instance
	 */

	unloadPlugin : function(instance) {

		//Clear interval
		if(instance.data.asLiveUpdate) {
			clearInterval(instance.data.asLiveUpdate);	
		}

		//instance.data.latestScoreboardData = {};
		instance.data.advancedViewPlayer = 0;
		instance.data.asLiveUpdate = false;
		instance.data.pluginLoaded = false;
        instance.data.currentChart = false;
        for(var tracked in instance.data.tracker)
        {
            instance.data.tracker[tracked] = {};
        }		
	}
});
