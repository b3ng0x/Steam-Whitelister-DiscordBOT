const Discord = require("discord.js");
const winston = require("winston");
const waitUntil = require('wait-until');
const DOMParser = require('xmldom').DOMParser;
const fetch = require('node-fetch');
var mysql = require('mysql');

require('dotenv').config();

const logger = winston.createLogger({
  level: "info",
  transports: [
    
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.simple(),
        winston.format.colorize()
      )
    })
  ]
});

const client = new Discord.Client();
function dec2hex(str){ // .toString(16) only works up to 2^53
    var dec = str.toString().split(''), sum = [], hex = [], i, s
    while(dec.length){
        s = 1 * dec.shift()
        for(i = 0; s || i < sum.length; i++){
            s += (sum[i] || 0) * 10
            sum[i] = s % 16
            s = (s - sum[i]) / 16
        }
    }
    while(sum.length){
        hex.push(sum.pop().toString(16))
    }
    return hex.join('')
}



client.on("ready", evt => {
  logger.info("Connected");
  const { username, id } = client.user;
  logger.info(`Logged in as: ${username} (${id})`);
  
  client.user.setActivity(`Wach Al 7bibbaaa`);
});

// Change This

var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "qbus"
});

client.on("message", async message => {

  switch(message.channel.type) {
    case "text":
	if (message.channel.name === 'hi') {
      if (message.content.includes("help")) {
        message.channel.send("Send me Steam url like: `https://steamcommunity.com/id/your_profile_name/`or`https://steamcommunity.com/profiles/your_profile_id/` ");
      }
      
      if ((message.content.includes("https://steamcommunity.com/id") || message.content.includes("https://steamcommunity.com/profiles")) && !message.content.includes("your_profile_name")) {
        const url = message.content.concat("?xml=1");
        try {
          const resp = await fetch(url);
          const text = await resp.text();
          const doc = new DOMParser().parseFromString(text);
          const ele = doc.documentElement.getElementsByTagName("steamID64");
          const elea = doc.documentElement.getElementsByTagName("steamID");
          const steamIDD = ele.item(0).firstChild.nodeValue;
          const steamIDN = elea.item(0).firstChild.nodeValue;
          var stt = dec2hex(steamIDD);
         
          message.channel.send(`Steam id: ${steamIDD}`);
          message.channel.send(`SteamIDHEX: ${stt}`);
          message.channel.send(`Steam Name: ${steamIDN} `);
		  message.channel.send(`By ${message.author} !!`);
          
          
          con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");      
  message.channel.send("`Connected Successfully to Database`:white_check_mark:");
  var sql = `INSERT INTO whitelist (steam, license, name) VALUES ('steam:${stt}', '${steamIDD}','${steamIDN}')`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    message.channel.send({embed: {
  color: 3066993,
  title: "Whitlisted"
}});
  });
});
          

        } catch (error) {
          console.log(error);
          message.channel.send("An error occurred retrieving your steam id :x: ");
        }
      }
  }}

  if (message.channel.type==="dm"||message.channel.type==="group") {
    //message.channel.send(':warning:  Send me private Steam url');
    return false;
  }
  
});



client.login(process.env.TOKEN);
