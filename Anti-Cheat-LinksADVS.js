/**
* Friends Highlighter - Highlights your friends in the scoreboard and battlereports
*
* @author I-MrFixIt-I
* @version 1.3.2
* @url https://getbblog.com/
* Edited by Russao
* Added bf4db and bf4cheatreport for each player + advanced stats for battle report
*/

BBLog.handle("add.plugin", {

    stdColor : "#00c8ff",

    id : "mrfixit-friends-highlighter",

    name : "Anti-Cheat Links & Advanced Stats",

    translations : {
        "en" : {
			"use.adv-battlereport" : "Advanced Battlereport",
			"use.adv-style" : "Style: Name 1st",
			"use.adv-basic" : "Basic list + detailed stats",
			"use.BFLinks" : "Show Anti-Cheat links",
            "use.friends-highlighter" : "Use Friends Highlighter",
            "change-color" : "Change color",
            "choose-color" : "Choose a color of your choice. Example: #00c8ff"
        },
        "de" : {
			"use.adv-battlereport" : "Advanced Battlereport",
			"use.BFLinks" : "Show Anti-Cheat links",
            "use.friends-highlighter" : "Friends Highlighter verwenden",         
            "change-color" : "Farbe ändern",
            "choose-color" : "Wähle eine Farbe deiner Wahl. Beispiel: #00c8ff"
        }
    },

    configFlags : [
		{"key" : "use.adv-battlereport", "init" : 1},
		{"key" : "use.adv-style", "init" : 1},
		{"key" : "use.adv-basic", "init" : 0},
		{"key" : "use.BFLinks", "init" : 1},
        {"key" : "use.friends-highlighter", "init" : 1},
        {"key" : "change-color", "init" : 0, "handler" : function(instance){
            var color = prompt(instance.t("choose-color"));
	    if (!color) return;	
            if (color.charAt(0) != "#")
            {
                color =+ "#";
            }
            
            var isHexValue  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
            if (isHexValue)
            {
                instance.storage("color", color);
            }
        }}
    ],

    friendsListcontainsUsername : function(soldierName){
        var containsUsername = false;
        var friendsList = comcenter.getFriendsListFromLs();
        friendsList.forEach(function(friend) {
            if (friend.username == soldierName)
            {
                containsUsername = true;
            }
        });
        
        return containsUsername;
    },
    
	delaycount: 20,
	
    highlightFriends : function(instance, rows, templa){
	  var teamchk = Surface.Renderer.state.surface.battlereport.battleReport;
	  var shownewdmg = false;
	  if (BBLog.BBWF) shownewdmg = true;	
	  var datajax = {};
	  var showadvbr = "yes";
	  var usealstyle = 0;
	  var usebasicstats = 0;
	  var datstopb = "";
	  var sttots = [];
	  var team = [];
	  var twot = 0;
	  var delaycountb = {};
	  if (instance.storage("use.adv-style")) usealstyle = 1;
	  if (instance.storage("use.adv-basic")) usebasicstats = 1;
	  if (window.location.href.match(/\/servers\/show\/pc\//i)) showadvbr = "no";	
	  if (instance.storage("use.adv-battlereport") && showadvbr == "yes") {
		  showadvbr = "yes";
	  } else {
		  showadvbr = "no";	
	  }
	  if (showadvbr == "yes" && usebasicstats == 0) {		
		var gsquads = $("#battlereport-squads");
		var gteams = $("#battlereport-teamstats");
		var isactteam = $("#battlereport-scoreboard .active").first();
		
		var sqdfill = $("#battlereport-squads .squadrow-fillup");
		if (sqdfill) {
			var sqdsp = sqdfill.find("td");	
			sqdsp.attr('colspan' , '9');
		}
		var doadvst = 2;
		if (gteams) {
		  if (doadvst == 2) { // 1
			var bluet = gteams.find(".tr-color-allied");
			var redt = gteams.find(".tr-color-enemy"); 
			var sbluet = gsquads.find(".tr-color-allied"); 
			var sredt = gsquads.find(".tr-color-enemy"); 
			
			var cifloaded = gteams.find("#infocheck").first();
			datstopb = cifloaded.attr('data-load');	
			if (datstopb != "yes") {				
				var chntib = bluet.find(".last");
				var chntir = redt.find(".last"); 
				var schntib = sbluet.find(".last"); 
				var schntir = sredt.find(".last");
										
				var htmlcth = '<th class="center">KD</th><th class="center" data-tooltip="<b>KILL ASSISTS</b>">A</th><th class="center" data-tooltip="<b>REVIVES</b>">R</th><th class="center" data-tooltip="<b>HEALS</b>">H</th>';
				chntib.before(htmlcth);
				chntir.before(htmlcth);
				schntib.before(htmlcth);
				schntir.before(htmlcth);
				var gteam = bluet.find("th").first();
				if (gteam) {
					team[1] = gteam.text();
					team[2] = redt.find("th").first().text();
					if (team[1].toUpperCase().indexOf("US") !== -1) twot = 1;
					if (team[1].toUpperCase().indexOf("CN") !== -1) twot = 1;
					if (team[1].toUpperCase().indexOf("RU") !== -1) twot = 1;
				}
			} 
		  }	
		}
	  }	
		
        $.each($(rows), function() {
			var loadft = 0;			
            var soldierNameContainer = $(this).find(".soldier-name .user-info .common-playername-personaname-nolink");
            var soldierName = $(soldierNameContainer).text();
            if (soldierName.length < 2) {
                soldierNameContainer = $(this).find(".soldier-name .user-info .common-playername-personaname");
                soldierName = $(soldierNameContainer).text();
                soldierName = soldierName.replace(/\n/g, "");
                soldierName = soldierName.replace(/ /g, "");                
            }
    	    var tag = $(soldierNameContainer).find(".bblog-tag").text(); // get clan tag from player	
			var html = "";
    	    
    	    if (tag.length > 0)
    	    {
    	        soldierName = soldierName.substr(tag.length); // get playername and cut the clantag from it
    	    }
    		
            if (instance.storage("use.friends-highlighter")) { 
			  if(instance.friendsListcontainsUsername(soldierName))
              {
				
                if (instance.storage("change-color"))
                {
                    var color = instance.storage("color");
                    if (color !== null)
                    {
                        $(soldierNameContainer).css("color", color);
                    }
                    else
                    {
                        $(soldierNameContainer).css("color", instance.stdColor);
                    }
                    
                }
                else
                {
                    $(soldierNameContainer).css("color", instance.stdColor);
                }
              } else {

			  }
		    }
			
				var newsname = soldierName.replace(" ", "_");
				var didit = $("#bfdb_"+newsname).attr('name'); 
				var datapid = $(this).attr("data-personaid");
				
				$(document).ready(function() {
					if (soldierName != didit) {						
						var bfdbcode = ""; 
						var linkpos = "font-size: 11px; color: red; margin-left: -70px; top:-25px";
						var setleft = "68px";
						
						var iscomm = 0;
						if ($("#battlereport-commander-scoreboard tr[data-personaid=\"" + datapid + "\"]").hasClass('commander')) iscomm = 1;
		
						if (showadvbr == "yes") linkpos = "font-size: 7px; color: red; z-index: 1; left: "+setleft+"; top: 14px; position: absolute;";
						if (usealstyle == 1)  linkpos = "font-size: 7px; color: red; z-index: 1; left: 65px; top: 28px; position: absolute;";
						if (usebasicstats == 1 || templa == "server") linkpos = "font-size: 7px; color: red; z-index: 1; left: 75px; top: 34px; position: absolute;";
						if (instance.storage("use.BFLinks") && showadvbr == "no" && usealstyle == 1) linkpos = "font-size: 7px; color: red; z-index: 1; left: 75px; top: 34px; position: absolute;";
						if (instance.storage("use.BFLinks")) bfdbcode = ` <a style="font-size: 11px;color:red;" href='https://bf4db.com/player/` + datapid + `' target='_blank'>BF4DB</a> | <a style="font-size: 11px;color:#445C9C;" href='https://bf4cheatreport.com?bblog=1&cnt=100&pid=` + datapid + `' target='_blank'>BF4CR</a>`;

						html = `<div id='bfdb_`+newsname+`' name='`+soldierName+`' value='yes' style='`+linkpos+`'>` + bfdbcode + `</div>`;
												
						if (iscomm == 1) {
							$("tr[data-personaid=\"" + datapid + "\"] div[class=user-info]").first().append(html);
						} else {	
							$("tr[data-personaid=\"" + datapid + "\"] div[class=user-info]").append(html); 
						}
						if (showadvbr == "yes") {
						  if (usebasicstats == 0) {
							$("tr[data-personaid=\"" + datapid + "\"] td[class=soldier-name]").css({'padding': '6px'});								
							var brdatab = Surface.Renderer.state.surface.battlereport.battleReport;
							var chkhsawardb = brdatab.allPersonalPrizes[datapid];
							if (chkhsawardb) {
								if (chkhsawardb[0] == "headshots") {									
									var codehsml = '<div style="position: absolute;right: 1px; top: 39px;" data-tooltip="Face Off ('+chkhsawardb[1]+' Headshots)"> &#9760;</div>';									
									$("tr[data-personaid=\"" + datapid + "\"] div[class=user-info]").append(codehsml);
								}	
							}	

							if (usealstyle == 1) {
							  var esr = $("tr[data-personaid=\"" + datapid + "\"] div[class=user-personarank]");
  							  var es = $("tr[data-personaid=\"" + datapid + "\"] div[class=user-info]");
							  var eb = $("tr[data-personaid=\"" + datapid + "\"] td[class=soldier-name]");
							  if (iscomm == 1) {
								esr = $("tr[data-personaid=\"" + datapid + "\"] div[class=user-personarank]").first();
								es = $("tr[data-personaid=\"" + datapid + "\"] div[class=user-info]").first();
								eb = $("tr[data-personaid=\"" + datapid + "\"] td[class=soldier-name]").first();
							  }	
							  esr.css({'margin-top': '24px'});						
							  es.css({'position': 'absolute'});						
							  var aeb = eb.find(".avatar");					
							  eb.append('<div style="width: 134px;"></div>');
							  aeb.css({'margin-top': '25px'});
							}

						  }
							$("tr[data-personaid=\"" + datapid + "\"]").on("click", function () {
								var chkload = $("#movhere-"+datapid);
								if (chkload){
									if (chkload[0]) {
										var getextra = $("#advsta-"+datapid);
										if (getextra) getextra.css({'display': 'none'}); 	
										return;
									}	
								}							
									var isactteamb = $("#battlereport-scoreboard .active").first();
									var teamrow = isactteamb.attr("data-contentid");
									var cspcol = $("#battlereport-player-score-"+teamrow+"-"+ datapid);								
									var rpcsp = cspcol.find("td").first();
									rpcsp.attr('colspan' , '9');									
									$(document).ajaxStop(function(){										
										rpcsp = cspcol.find("td").first();
										rpcsp.attr('colspan' , '9');
									});
																
									if (delaycountb[datapid]) {
										if (delaycountb[datapid].id == datapid) loadft = 1;
									}	
									if (loadft == 0) {									
										delaycountb[datapid] = { "id": datapid, "stats":0 };								
									} else {
										rpcsp = cspcol.find("td").first();	
										rpcsp.attr('colspan' , '9');
									    if (delaycountb[datapid]) {
									      if (delaycountb[datapid].stats) {										
										    instance.doavgstats(datapid, delaycountb[datapid].stats, "cached", teamrow, shownewdmg, usebasicstats);	
									      }	
									    }	
								    }
							});
		
$( document ).ajaxComplete(function( event, xhr, settings ) {
  var chkurl = settings.url;
  if(chkurl.indexOf(datapid) != -1) {
	var okgo = false;  
	if (xhr) { 
		if (xhr.statusText == "OK") okgo = true;
	}
	if (okgo) { 
	  datajax = JSON.parse(xhr.responseText);
	  if (delaycountb[datapid]) {
		  var isactteamc = $("#battlereport-scoreboard .active").first();
		  var teamrowc = isactteamc.attr("data-contentid");
		  delaycountb[datapid].stats = datajax;
		  instance.doavgstats(datapid, datajax, "live", teamrowc, shownewdmg, usebasicstats);
	  }
    }	  
  }
});
							  
							  if (doadvst == 2 && usebasicstats == 0) {								
								var advst = Surface.Renderer.state.surface.battlereport.battleReport.players[datapid];
								if (advst) {
								  var testt = $("tr[data-personaid=\"" + datapid + "\"]");									  
								  if (sttots[datapid] == advst["personaId"]) return;
  								  sttots[datapid] = advst["personaId"];
								  var teamid = advst["team"];	
								 	
								  if (sttots[teamid]) {
									sttots[teamid] = [sttots[teamid][0] + advst["kills"], sttots[teamid][1] + advst["deaths"], sttots[teamid][2] + advst["killAssists"], sttots[teamid][3] + advst["revives"], sttots[teamid][4] + advst["heals"], sttots[teamid][5] + advst["combatScore"]];
								  } else {  
									sttots[teamid] = [advst["kills"], advst["deaths"], advst["killAssists"], advst["revives"], advst["heals"], advst["combatScore"]];
								  }	
								  var test = [advst["kills"], advst["deaths"], advst["killAssists"], advst["revives"], advst["heals"], advst["combatScore"]];
								  var pkd = advst["deaths"] == 0 ? advst["kills"]: (advst["kills"]/advst["deaths"]).toFixed(2).replace(/(\.0*|(?<=(\..*))0*)$/, '') || 0;
								  var infhtml = '<td class="center">' + pkd + '</td><td class="center" data-tooltip="<b>KILL ASSISTS</b>">' + advst["killAssists"] + '</td><td class="center" data-tooltip="<b>REVIVES</b>">' + advst["revives"] + '</td><td class="center" data-tooltip="<b>HEALS</b>">' + advst["heals"] +'</td>';
								  var testtb = testt.find(".last");							
								    if (iscomm == 1) {
									  testtb.first().before(infhtml); 
								    } else {
									  testtb.before(infhtml); 
								   }
							    }				
							}
						}							
					}
				});	
			
        });
		
		// scoreboardfoot
		$(document).ready(function() {
		if (showadvbr == "yes") {
		  if (gteams) {				
			if (datstopb != "yes") {
				var sgettotf = $("#battlereport-squads tfoot");
				var tgettotf = $("#battlereport-teamstats tfoot");
				gteams.prepend('<div id="infocheck" data-load="yes">');				
				if (tgettotf) {
					var adcodtd = '<td></td><td></td><td></td><td></td>';
					var bluetf =  $("#battlereport-teamstats tfoot").eq(0);
					var redtf =  $("#battlereport-teamstats tfoot").eq(1);
					var chkta = bluetf.find("td").eq(1);
					var chktb = bluetf.find("td").eq(3);
					if (chkta && chktb && twot == 1) {						
						var valfta = +chkta.text();
						var valftb = +chktb.text().replace(",", "");
						if (sttots[1]) {														
							var tkda = sttots[2][1] == 0 ? sttots[2][0]: (sttots[2][0]/sttots[2][1]).toFixed(2) || 0;
							var tkdb = sttots[1][1] == 0 ? sttots[1][0]: (sttots[1][0]/sttots[1][1]).toFixed(2) || 0;
							var totalsta = '<td>'+tkda+'</td><td>'+sttots[2][2]+'</td><td>'+sttots[2][3]+'</td><td>'+sttots[2][4]+'</td>';
							var totalstb = '<td>'+tkdb+'</td><td>'+sttots[1][2]+'</td><td>'+sttots[1][3]+'</td><td>'+sttots[1][4]+'</td>';
							if (valfta == sttots[1][0] && valftb == sttots[1][5]) {
							 totalsta = '<td>'+tkdb+'</td><td>'+sttots[1][2]+'</td><td>'+sttots[1][3]+'</td><td>'+sttots[1][4]+'</td>';
							 totalstb = '<td>'+tkda+'</td><td>'+sttots[2][2]+'</td><td>'+sttots[2][3]+'</td><td>'+sttots[2][4]+'</td>';
							}	
						}
						bluetf.find(".right").before(totalsta);
						redtf.find(".right").before(totalstb);
						
					} else {
					tgettotf.find(".right").before(adcodtd);
					}
				}	
				if (sgettotf) {
					var adcodtd = '<td></td><td></td><td></td><td></td>';
					sgettotf.find(".right").before(adcodtd);
				}	
			}	
		  }
		}	
		});	
    },

	doavgstats: function (plyid, plydata, rstatus, teamrow, shownewdmg, usebasicstats) {
		var cspcol = $("#battlereport-player-score-"+teamrow+"-"+ plyid);
		var chkactv = $("tr[data-personaid=\"" + plyid + "\"]");
		var imgsvg = cspcol.find(".player-score-pie").first();
		var advhtml = "";
		if (plydata.stats) {
			var spancode = "<span style='color:#E38204;font-weight:bold'>";
			var brdata = Surface.Renderer.state.surface.battlereport.battleReport;
			var phits = plydata.stats.shots_hit || 0;
			var pfired = plydata.stats.shots_fired || 0;
			var pkills = plydata.stats.kills;
			var pdeaths = plydata.stats.deaths;
			var pdmg = pdeaths == 0 ? pkills: parseFloat(((pkills*100)/phits).toFixed(2)) || 0;	
			var chkhsaward = brdata.allPersonalPrizes[plyid];
			var bwpn = plydata.best.weapon;
			var bvhc = plydata.best.vehicle;
			var wpnmi = cspcol.find(".player-stats li");
			var dmginfo = "";
			var headshots = 0;
			var dmgstyle = "";
			if (chkhsaward) {
				if (chkhsaward[0] == "headshots") headshots = chkhsaward[1];				
			}
			var pchs = 0;
			var jsObjects = plydata.unlocks.awards;
			var spotr = 0;
			if (headshots > 0) { 
				pchs = ((headshots * 100) / pkills).toFixed(0);
			} else {
				if (plydata.unlocks) {
					var awhs = jsObjects.find(function(el){
						return el.nameSID === 'WARSAW_ID_P_AWARD_R04_NAME';
					});
					if (awhs) {
						if (awhs.timesTaken) headshots = awhs.timesTaken*3;
						if (headshots > 0) pchs = ((headshots * 100) / pkills).toFixed(0);
					}
				}
			}	
			if (plydata.unlocks) {
				var awspot = jsObjects.find(function(el){
					return el.nameSID === 'WARSAW_ID_P_AWARD_R07_NAME';
				});
				if (awspot) {
					if (awspot.timesTaken) spotr = awspot.timesTaken*4;
				}			
			}
			if (bwpn) {
				if (bwpn.kills > 0) {
					var pcowk = ((bwpn.kills * 100) / pkills).toFixed(1);
					var wpnftip = "";
					if (shownewdmg) {
						if (BBLog.BBWF[bwpn.slug])	{
							var wpndata = BBLog.BBWF[bwpn.slug];
							if (bwpn.slug == "sr338") wpndata.hsmultiple = 2;
							if (bwpn.slug == "usas-12-flir"|| bwpn.slug == "usas-12") { wpndata.dmgMax += wpndata.dmgSplash; wpndata.dmgMin += wpndata.dmgSplash; }	
							var mxdmg = wpndata.dmgMax*wpndata.ShotsPerShell;
							var midmg = wpndata.dmgMin*wpndata.ShotsPerShell;
							var tmtkall = BBLog.newcaclttk(100, mxdmg, wpndata.dmgFallStart, wpndata); 	
							var aspchs = 0;
							if (pchs > 0) aspchs = pchs/100; 
							var tmtkinf = "";
							if (tmtkall[0] != tmtkall[1]) tmtkinf = `<br> (old symthic: `+tmtkall[1]+`ms)`;
							wpnftip += `<hr>Info:<br>`+spancode+`Max dmg:</span> `+mxdmg.toFixed(0)+`<br>
									  `+spancode+`Min dmg:</span> `+midmg.toFixed(0)+`<br>
									  `+spancode+`Time	to kill:</span> `+tmtkall[0]+`ms ` + tmtkinf;
							dmginfo = ``;
							if (pcowk >= 70 && bwpn.kills > 9) {						
								var maxposdmg = +(((mxdmg*aspchs)*wpndata.hsmultiple) + (mxdmg * (1-aspchs))).toFixed(2);
								var kphhcbase = +parseFloat(((mxdmg)*60)/100).toFixed(2);	
								var hcdamage = +parseFloat((kphhcbase) + (mxdmg)).toFixed(2);	
								var tesmaxb = +(((hcdamage*aspchs)*wpndata.hsmultiple) + (hcdamage *(1-aspchs))).toFixed(2);
								var tesmax = hcdamage;						
								if (pdmg > maxposdmg) dmgstyle = " color: #ef9e2b;";
								if (pdmg >= tesmax && pdmg > maxposdmg) dmgstyle = " color: #ed8578;";
								if (pdmg >= tesmaxb) dmgstyle = " color: #e2361f;";							
							}
						}
					}	
					if (wpnmi) {
						var wpn_name = wpnmi.eq(2).find("span").last().text();
						if (!wpn_name) wpn_name = bwpn.slug;
						var wkills = "";
						if (bwpn.kills > 1) wkills = "s";
						var bwtext = `<h6>` + wpn_name + `</h6>					
						`+bwpn.kills+` kill`+wkills+` (`+pcowk+`% of the total kills)
						`;
						wpnftip = bwtext + wpnftip;
						wpnmi.eq(2).prepend('<div style="float: right; position: relative;right: 15px;" data-tooltip="'+wpnftip+'"><span class="label" style="float: inline-end; margin-left: 2px; font-size: 13px;">('+bwpn.kills+'  - '+pcowk+'%)</span></div>');
					}	
				}
			}
			if (bvhc) {
				if (bvhc.kills > 0) {
					var pcovk = ((bvhc.kills * 100) / pkills).toFixed(1);
					if (wpnmi) {
						var bvh_name = wpnmi.eq(3).find("span").last().text();
						if (!bvh_name) bvh_name = bvhc.slug;
						var vkills = "";
						if (bvhc.kills > 1) vkills = "s";
						var bvtext = `<h6>` + bvh_name + `</h6>						
						`+bvhc.kills+` kill`+vkills+` (`+pcovk+`% of the total kills)
						`;		
						if (wpnmi) wpnmi.eq(3).prepend('<div style="float: right; position: relative;right: 15px;" data-tooltip="'+bvtext+'"><span class="label" style="float: inline-end; margin-left: 2px; font-size: 13px;">('+bvhc.kills+'  - '+pcovk+'%)</span></div>');					
					}
				}
			}
			var stmiss = pfired - phits;
			if (stmiss < 0) stmiss = 0;
			dmginfo = `Percentage of kills per shot hit--100*kills/shotsHit.<br>`+spancode+`Fired:</span> ` +pfired+ `<br>`+spancode+`Hits:</span> ` + phits+ `<br>`+spancode+`Missed:</span> ` + stmiss;
			
			
			advhtml = `<div id="advsta-`+plyid+`"><div style="position: absolute; top: 24px; width: 29%;"><ul class="player-stats" style="width: 100%; height: 20px;"><li><span class="label" style="margin-left: 2px; font-size: 12px;" data-tooltip="`+dmginfo+`">Damage</span><span class="center" style="float: right;`+dmgstyle+`" data-tooltip="`+dmginfo+`">`+pdmg+`</span></li></ul></div>
					  <div style="position: absolute; top: 50px; width: 29%;"><ul class="player-stats" style="width: 100%; height: 20px;"><li><span class="label" style="margin-left: 2px; font-size: 12px;">Headshots</span><span class="center" style="float: right;">`+headshots+` (`+pchs+`%)</span></li></ul></div>					  
					  <div style="position: absolute; top: 130px; width: 29%;"><ul class="player-stats" style="width: 100%; height: 20px;"><li><span class="label" style="margin-left: 2px; font-size: 12px;">Spots</span><span class="center" style="float: right;">`+spotr+`</span></li></ul></div>
					  </div>`;
		}
		var svgbaspos = ["12px", "20px"];
		if (usebasicstats == 1) {
			svgbaspos = ["15px", "-3px"];
			imgsvg.find("svg").css({'transform': 'scale(0.6)'}); 		
		}	
	    advhtml += `<div id="movhere-`+plyid+`" style="left: `+svgbaspos[1]+`;position: relative;height: 120px;top: `+svgbaspos[0]+`;"></div>`;
		imgsvg.prepend(advhtml);
		imgsvg.find("svg").appendTo("#movhere-"+plyid);
	
	},

    domchange : function(instance){
		instance.delaycount = 20;
        if(window.location.href.match(/\/servers\/show\/pc\//i)) {
		if (instance.storage("use.Advanced-Scoreboard") != 1) {
			instance.highlightFriends(instance, $("#server-players-list .row table tbody tr"), "server");
		}
            }
            else if(window.location.href.match(/\/battlereport\/show\/1\//i)) {
                instance.highlightFriends(instance, $("#battlereport-scoreboard .row table tbody tr"), "breport");
            }
    }
});
