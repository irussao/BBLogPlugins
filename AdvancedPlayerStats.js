/**
* BF4 Advanced Player stats - Add some advanced player links (Anti-Cheat) to the profile.
*
* @author I-MrFixIt-I + Elementofprgress (ACI)
* @version 1.1.12
* @url https://getbblog.com/de/board/topic/145489/1/BF4-Advanced-player-links
* original: https://bf4cheatreport.com/froadvancedplayerlinks.js
* Edited by Russao
*/

// initialize your plugin
BBLog.handle("add.plugin", {

    /**
    * The unique, lowercase id of my plugin
    * Allowed chars: 0-9, a-z, -
    */
    id : "mrfixit-bf4-advanced-player-links",

    /**
    * The name of my plugin, used to show config values in bblog options
    * Could also be translated with the translation key "plugin.name" (optional)
    *
    * @type String
    */
    name : "BF4 Advanced Player Stats",

    /**
    * Some translations for this plugins
    * For every config flag must exist a corresponding EN translation
    *   otherwise the plugin will no be loaded
    *
    * @type Object
    */
    translations : {
        "en" : {
            "use.player-stats" : "Use Advanced Player Stats",
			"use.player-links" : "Use Advanced Player Links",
            "use.ACI" : "Show ACI",
            "use.247FairPlay" : "Show 247FairPlay",
            "use.BF4DB" : "Show BF4DB",
            "use.BF4CR" : "Show BF4CR",
            "use.Google" : "Show Google"
        },
        "de" : {
            "use.player-stats" : "Use Advanced Player Stats",
			"use.player-links" : "Use Advanced Player Links",
            "use.ACI" : "ACI anzeigen",
            "use.247FairPlay" : "247FairPlay anzeigen",
            "use.BF4DB" : "BF4DB anzeigen",
            "use.BF4CR" : "BF4CR anzeigen",
            "use.Google" : "Google anzeigen"
        }
    },

    /**
    * Configuration Options that appears in the BBLog Menu
    * Every option must be an object with properties as shown bellow
    * Properties available:
    *   key : The name for your config flag - The user can toggle this option
    *         and you can retreive the users choice with instance instance.storage(YOUR_KEY_NAME) (0 or 1 will be returned)
    *   init : Can be 0 or 1 - Represent the initial status of the option when the user load the plugin for the first time
    *          If you want that this option is enabled on first load (opt-out) than set it to 1, otherwise to 0 (opt-in)
    *   handler(optional): When set as a function this config entry turns into a button (like the plugins button you see in the bblog menu)
    *                       The function well be executed when the user clicks the button
    */
    configFlags : [
		{"key" : "use.player-stats", "init" : 1},
        {"key" : "use.player-links", "init" : 1},
        {"key" : "use.ACI", "init" : 1},
        {"key" : "use.247FairPlay", "init" : 1},
        {"key" : "use.BF4DB", "init" : 1},	
        {"key" : "use.BF4CR", "init" : 1},
        {"key" : "use.Google", "init" : 1}
    ],

    /**
    * A trigger that fires everytime when the dom is changing but at max only once each 200ms (5x per second) to prevent too much calls in a short time
    * Example Case: If 10 DOM changes happen in a period of 100ms than this function will only been called 200ms after the last of this 10 DOM changes
    * This make sure that all actions in battlelog been finished before this function been called
    * This is how BBLog track Battlelog for any change, like url, content or anything
    *
    * @param object instance The instance of your plugin which is the whole plugin object
    *    Always use "instance" to access any plugin related function, not use "this" because it's not working properly
    *    For example: If you add a new function to your addon, always pass the "instance" object
    */
	loadonce: 0,
	
	waitforit: 0,
	
    domchange : function(instance){
	if (window.location.href.match(/\/soldier\//i) && window.location.href.match(/\/pc\//i) && window.location.href.match(/\/stats\//i)){
        var urlParts = window.location.pathname.replace(/\/+$/, "").split('/');
        var personaId = urlParts[urlParts.length - 2];
		var ftimeCache = new Date().getTime();
		var inwait = instance.waitforit;
		if (inwait == 0) {
			instance.waitforit = ftimeCache;
			instance.loadonce = 1;
		}
		var resultdiff = ftimeCache - instance.waitforit;
		if (resultdiff > 250) { // 300
			instance.waitforit = 0;
			instance.loadonce = 0;
		}	
		var soldierName = $("#game-stats-head .soldier-info-name span").last().text();       
        
            if(BBLog.cache("mode") == "bf4")
            {	
			if (instance.storage("use.player-links")) {	
                if (!$( "#advanced-player-links" ).length) {                  
                    var bfdbhtml = "";
					var bfdbhtmld = "";
                    var html = "<div id='advanced-player-links' class='box-content no-padding leaderboard-highlight'>";
                    html += "<div class='description'>&#9760;</div>";
   
                    if (instance.storage("use.ACI")) html += "<div class='description'><a href='//history.anticheatinc.com/bf4/index.php?searchvalue=" + soldierName + "' target='_blank'>ACI</a></div>"
                                                                + "<div class='description'>&#9760;</div>";
    
                    if (instance.storage("use.247FairPlay")) html += "<div class='description'><a href='https://www.247fairplay.com/CheatDetector/" + soldierName + "' target='_blank'>247FairPlay</a></div>"
                                                                    + "<div class='description'>&#9760;</div>";                                                                
                                                                    
                    if (instance.storage("use.BF4CR")) html += "<div class='description'><a href='https://bf4cheatreport.com?bblog=1&cnt=100&pid=" + personaId + "' target='_blank'>BF4CR</a></div>"
                                                                    + "<div class='description'>&#9760;</div>";
                    
                    if (instance.storage("use.Google")) html += "<div class='description'><a href='https://www.google.com/#q=%22" + soldierName + "%22' target='_blank'>Google</a></div>"
                                                                    + "<div class='description'>&#9760;</div>";																							
					
					if (instance.storage("use.BF4DB")) html += "<div class='description'><a href='https://bf4db.com/player/" + personaId + "' target='_blank'>BF4DB</a>"+bfdbhtmld+" </div>" + bfdbhtml;
   					
					html += "<div class='description'>&#9760;</div><div class='clear'></div></div>";

					$("#overview-info div[class=box]").first().append(html);					
					$('.leaderboard-highlight').css("height", "45px");
					$('.description').css("font-size", "16px");					
                }				
            }
			else {
				$( "#advanced-player-links" ).remove();
			}	
if (instance.storage("use.player-stats")) {
if (!$( "#advanced-player-stats" ).length) { 	
if (instance.loadonce == 0) {
instance.loadonce = 1;
instance.waitforit = 0;
$.getJSON( "https://battlelog.battlefield.com/bf4/warsawWeaponsPopulateStats/"+personaId+"/1/stats/", function( data ) {
var peristhere = $("#bfdb_"+soldierName);
var sname = $("#bfdb_"+soldierName).attr('name');
var setheight = $("#overview-skill");
if (!peristhere.length) {
if (soldierName != sname){
setheight.find(".box-content").css("height", "60px"); // 64px
setheight.find("#overview-skill-value").css("font-size", "24px"); // 28px
setheightb = $("#overview-info-list");
setheightb.find("li").css("height", "56px"); // 94px
  var items = [];
  var totwpkills = 0;
  var hswpkills = 0;
  var totacc = 0;
  var tothit = 0;
  var totfired = 0;
  var vtca = 0;
  var vtcb = 0;
  var disphs = 0;
  var isnip = 0;
  $.each( data.data.mainWeaponStats, function( key, val ) {
   var catitems = ["wA", "wL", "wC", "wX", "waPDW", "wH", "wSR", "waS", "wD"];  
   var catnonhs = ["c4-explosive", "m18-claymore", "m32-mgl", "m15-at-mine", "m2-slam", "ucav", "xm25-smoke", "m224-mortar", "m18-smoke", "m320-fb", "m26-frag", "m26-mass", "aa-mine"];
   if (catitems.indexOf(val.code) > -1) {	   
	   if (catnonhs.indexOf(val.slug) == -1){
			totwpkills = totwpkills + val.kills;
			hswpkills = hswpkills + val.headshots;
			tothit = tothit + val.shotsHit;
			totfired = totfired + val.shotsFired;
			if (vtca == 0) { 
				vtca = val.kills; 
				disphs = val.headshots;
				if (val.code == "wSR") { isnip = 20;}
			}
	   } else {
		if (vtcb == 0) { vtcb = val.kills; }   
	   }
   } else {
		if (vtcb == 0) { vtcb = val.kills; }
   }
  });

var acct = 0;  
var hsRate = 0;
if (hswpkills > 0) { hsRate = ((100 / totwpkills) * hswpkills).toFixed(2); }
var hscolor = "#ffffff";
if (hsRate < 25) hscolor = "#ffffff";
if (hsRate > 24) hscolor = "#38a220";
if (hsRate > 34) hscolor = "#ef9e2b";
if (hsRate > 49) hscolor = "#e2361f";
if (totfired > 0) { acct = 100*(tothit/totfired); }
acct = acct.toFixed(2);
var acccolor = "#ffffff";
if (acct < 20) acccolor = "#ffffff";
if (acct > 19) acccolor = "#38a220";
if (acct > 29) acccolor = "#ef9e2b";
if (acct > 39) acccolor = "#e2361f";

$("#overview-info div[class=box]").first().append("<div id='bfdb_"+soldierName+"' name='"+soldierName+"'></div>");
instance.loadonce = 1;
instance.waitforit = 0;
var myhtml = '<div id="advanced-player-stats"><li data-tooltip="Total Weapons kills, NO NADES" style="height:56px;"><span style="font-size: 12px;">Weapon Kills</span><strong id="stat-test1">'+totwpkills+'</strong></li><li style="height:56px;" data-tooltip="Headshots - Weapons only"><span style="font-size: 12px;">Headshots</span><strong id="stat-test2" style="color:'+hscolor+'">'+hswpkills+'('+hsRate+'%) </strong></li><li class="last" style="height:56px;" data-tooltip="Accuracy - Weapons only, NO NADES"><span style="font-size: 12px;">Accuracy</span> <strong id="stat-test3" style="color:'+acccolor+'">'+acct+'%</strong> </li></div>';
$("#overview-info-list").first().prepend(myhtml);
 
 if (vtca > vtcb && disphs > 0) {
	var tophsRate = ((100 / vtca) * disphs).toFixed(2); 
	var favwp = $("div[class=item-highlighted]").first();
	hscolor = "#ffffff";
	if (tophsRate < (25+isnip)) hscolor = "#ffffff";
	if (tophsRate > (24+isnip)) hscolor = "#38a220";
    if (tophsRate > (34+isnip)) hscolor = "#ef9e2b";
	if (tophsRate > (49+isnip)) hscolor = "#e2361f";
	$favwphtml = '<span class="title">Headshots:</span> <span class="title" style="color:'+hscolor+';">'+disphs+'('+tophsRate+'%)</span>';
	favwp.find("div[class=info]").append($favwphtml);
 }
 var changeli = $("#overview-info-list").first().find("li");
 changeli.find("span").eq(6).text("TOTAL KILLS");

}
}

});
instance.loadonce = 1;
instance.waitforit = 0;
		}
        }
}
	}
if (inwait == 0) {
	instance.loadonce = 1; // testando
}
	} else {
		 instance.loadonce = 0;
		 instance.waitforit = 0;
	}
    }
});
