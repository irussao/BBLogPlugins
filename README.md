Better Battlelog Current version: 5.3.2

Chrome: https://chrome.google.com/webstore/detail/better-battlelog-fixbblog/ncopbeadajoekpedjllcakdmbmgnfgph
<br>Source: https://github.com/Razer2015/better-battlelog/tree/master/extensions/chrome
<br><br>
FireFox: https://addons.mozilla.org/en-US/firefox/addon/better-battlelog-fix-bblog/
<br>Source: https://github.com/Razer2015/better-battlelog/tree/master/extensions/firefox

BBL: Video: https://www.youtube.com/watch?v=8R0Wc8U6mD8

# BBLogPlugins
Plugins for Better Battlelog Extension:

Advanced Scoreboard: https://cdn.jsdelivr.net/gh/irussao/BBLogPlugins/AScoreboard.js
<br>Created by Cr1N & edited by Russao, it can list squads, sort players by kills, kd, skill, strength, etc... Show total stats of all players, like kd, skill, kills, etc... You can join any player, team or squad, colored squads, anti-cheat tools, any player is clickable and it show stats of the current selected player.
 
Advanced Scoreboard video: hhttps://www.youtube.com/watch?v=l7Z-PbmA3wM

Advanced Player Stats: https://cdn.jsdelivr.net/gh/irussao/BBLogPlugins/AdvancedPlayerStats.js
<br>if the above link dont work: https://codepen.io/russao/pen/OJPoeJW.js
<br>Info: Display anti-cheat links on the main stats and also total weapon kills(just bullets, no nades), accuracy of total weapon kills and headshot stats.

Anti-Cheat Links: https://cdn.jsdelivr.net/gh/irussao/BBLogPlugins/Anti-Cheat-Links.js
<br>if the above link dont work: https://codepen.io/russao/pen/QWwVXgr.js
<br>Info: Display BF4DB and BF4 Cheater report links for each player on the server(Not compatible with "Friends Highlighter", it's already included). 

Plugin Install:
<br><br>
After installing the browser plugin(BBlog) and restarting the browser, go to Battlelog and hoover your mouse over the new slider that appears on the left side of your screen.<br>
<br><img src="https://bfautism.ga/images/bbl/hDgeSwU.png" alt="hDgeSwU.png" class="embedImage-img importedEmbed-img"></img><br>
<br>
Click on the Plugins tab within the starting menu of BBlog (not the Plugin Gallery tab!)<br>
<br><img src="https://bfautism.ga/images/bbl/uChMhi4.png" alt="uChMhi4.png" class="embedImage-img importedEmbed-img"></img><br>
<br>
Copy each plugin URL, ie: https://cdn.jsdelivr.net/gh/irussao/BBLogPlugins/AScoreboard.js and paste it within the black input field:<br>
<br><img src="https://bfautism.ga/images/bbl/5xt3IDd.png" alt="5xt3IDd.png" class="embedImage-img importedEmbed-img"></img><br><br>
<br>
Press enter and refresh your browser. You are all done now!<br>
<br>
<b>Sources:</b><br>
BF4DB (original post): <a href="https://bf4db.com/forum/thread/the-closure-of-bblog-1479" target="_blank">https://bf4db.com/forum/thread/the-closure-of-bblog-1479</a>
<br>
BBlog site: <a href="https://getbblog.com" target="_blank">https://getbblog.com</a>

# BBLog Changes

- 5.3.2 I just fixed BF3 and BFH, BBlog was not loading for these games.(thx LibraEmbers).

--------------------------------- 5.3.1 ---------------------------------

- Fixed some issues and added EWI(extended weapon information) to loadout and weapon stats

EWI - Extended Weapon Information:

Weapon Stats: It display advanced stats from the current selected weapon and the current player's total stats of the selected weapon .

Loadout: It display advanced stats for the current selected weapon.

The weapon stats data are from the old symthic site, time to kill is updated due to bullet-out frame, but you can see both stats, the new and the old, for everything there is a tooltip, all you need to do is to put the mouse over something, then it will display more info.

There are 2 screenshots function: "SS"(will take a SS and ask you to save) and "Upload SS"(it will upload the SS to imgur and give you the link)

Also, if you click on any weapon, be it on loadout or weapon stats, you get the correct rpm info, even for weapons that did not have rpm, like pistols, shotguns, etc.. as you can see here: <a href="https://i.imgur.com/hRh1vz5.png" target="_blank">https://i.imgur.com/hRh1vz5.png</a>


# The chart(weapon damage)
Image: <a href="https://i.imgur.com/IQvVhP7.png" target="_blank">https://i.imgur.com/IQvVhP7.png</a>

Player(white, green, orange and red): total damage, flat line

Base(yellow): Max and Min damage

 HC - hardcore(strong blue): Max and Min damage

 Max base(pink): if the are any headshots, then it will display the max base damage + max headshot damage

 Max Avg.(Cyan): It's the average of Base, HC, Max Base, Max player damage + other calc. so this flat line should be most of the time above the player's flat line.

Take into account that if the player has only normal games, then most of the time the player's line will never be the same as Base line, because there are damage over distance, so at the end of the round, the player will never do MAX Damage, every hit that is not a kill will lower the damage, every hit that is over the max damage and it's a kill, will lower the damage and the same thing for Max damage, every hit on some random low health player that is a kill, it will increase the damage above max damage, so at the end, if the player is under 50% headshot ratio, then the player most likely will be below the base damage line, pistols that are used to finish a kill will also have high damage, same thing goes for hardcore players, many of them will be under base damage, some above base damage and some times even above hardcore damage line.

Cheat Score: It's just a ranking system, if the cheat score is above 0%, it does not mean that the player is cheating, could be many things, such as stats padding, trying hard a certain stats, like going for headshots, etc... not just cheating, so please don't report anyone just because you saw a cheat score above 0%.

If you think that the player is suspicious, check others weapons, also there a link to BF4CR(bf4cheatreport.com), you can set the number of BR(battle report) and check every BR.
