/***Código creado por Gardex (Gardex6872 en MC) / Code was created by Gardex (Gardex6872 in MC)
 * Por favor, en caso de usarlo en proyectos propios o hacerle una "review" dar créditos al autor (yo :D) / If this's used in own proyects or reviewing it, you must give the original author credits please (me :D)
 * De igual forma, agradezco a todos los que me ayudaron a codificar este complemento / Likewise, I thank the Bedrock AddOns Script API community for helping me.***/
import { world, system } from "@minecraft/server";

const HELP = [
    '§g<————————Help Menu————————>§r',
    `§eCommands:§r`,
    `!teams help: Help Menu.`,
    `!teams new <team-name>: Create a new team. You must be opped to use this command`,
    `!teams add <player-name>: Add a player to your team.`,
    `!teams remove <player-name>: Remove the player from your team.`,
    `!teams delete <nombre-de-equipo>: Delete your team (use this command if you want to delete the team and remove yourself).`,
    `!tm <message>: Messages to your team.`,
    `#<messages>: Global messages.`,
    `!teams start players: Teleports the player to start.`,
    `§7You must put as many armor_stands called TPP as players (if there're 7 players, there must be 7 armor_stands)§r`,
    `!teams start teams: Teleports the teams to start.`,
    `§7You must put as many armor_stands called TPT as teams (if there're 3 teams, there must be 3 armor_stands)§r`,
    `!teams list: List about all created teams.`
    ]

/**Sistema de Creación de equipos y Búsqueda de Jugadores / Creating teams and Searching Players System**/

var TEAMS = JSON.parse(world.getDynamicProperty("teamNames") ?? "[]");

const OW = world.getDimension("overworld")

//Agregar Equipos / Add Teams
function addTeam(tmn,sender){
    sender.runCommandAsync("tag @s add T_Leader")
    if(TEAMS.length === 20 && !TEAMS.includes("")){
        sender.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou can't create one team more.§r"}]}`)
    } else {
        const voidIndex = TEAMS.findIndex((name) => name === "")
        if(voidIndex !== -1){
            TEAMS.splice(voidIndex,1,tmn)
            world.setDynamicProperty("teamNames",JSON.stringify(TEAMS))
        } else {
            TEAMS.push(tmn)
            world.setDynamicProperty("teamNames",JSON.stringify(TEAMS))
        }
    }
};
//Eliminar equipos / Delete teams
function removeTeam(tmn,player){
    player.runCommandAsync("tag @s remove T_Leader")
    let i = TEAMS.indexOf(tmn);
    world.getAllPlayers().forEach((p) => {
        if(i === -1){
            return
        } else if(TEAMS.length - i < i){
            player = p
            world.sendMessage(`Team ${tmn} was eliminated`)
            TEAMS = JSON.parse(world.setDynamicProperty("teamNames","[]"));
            player.setDynamicProperty("teams",undefined);
            world.setDynamicProperty("teamNames",JSON.stringify(TEAMS))
        } else {
            world.sendMessage(`Team ${tmn} was deleted`)
            player.setDynamicProperty("teams",undefined)
            TEAMS.splice(i,1,"");
            world.setDynamicProperty("teamNames",JSON.stringify(TEAMS));
            if(p.getDynamicProperty("teams") === tmn){
                p.setDynamicProperty("teams",undefined)
            }
        }
    })
};

//Mensajes Globales/ Global messages
function globalMessages(player,msg){
    msg = msg.substring(1)
    player.runCommandAsync(`tellraw @a {"rawtext":[{"text":"§c§l[Global]§r "},{"selector":"@s"},{"text": ": ${msg}"}]}`)
};

//Función para enviar mensajes de equipo / Function to send team messages
function toTargets(player,msg){
    let tg = `${player.getTags().filter((tag) => tag.includes("team"))}`
    msg = msg.substring(4)
    if(tg.length <= 0){
        player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou don't belong to any team.§r"}]}`)
    } else {
        player.runCommandAsync(`tellraw @a[tag=${tg}] {"rawtext":[{"text":"§a§l[TEAM]§r "},{"selector":"@s"},{"text": ": ${msg}"}]}`)
    }
};

//TP Jugadores / TP Players
function tpPlayers(){
    world.getAllPlayers().forEach((player) => {
        player.runCommandAsync("tp @s @e[type=armor_stand,name=TPP,c=1]")
        player.runCommandAsync("execute as @s at @s run kill @e[type=armor_stand,name=TPP,r=2]")
    })
};

//TP Equipos / TP Teams
function tpTeams(){
    const mainTags = []
    world.getAllPlayers().forEach((player) => {
        const pTags = player.getTags()
        mainTags.push(`${pTags.filter((tag) => tag.includes("team"))}`)
        player.runCommandAsync(`tp @a[tag=${mainTags[0]}] @e[type=armor_stand,name=TPT,c=1]`)
        player.runCommandAsync(`execute as @a[tag=${mainTags[0]}] at @a[tag=${mainTags[0]}] run kill @e[type=armor_stand,name=TPT,r=2]`)
        mainTags.shift()
    })
};

function start(){
    let CDP = 11
    system.runInterval(() => {
        CDP -= 1
        if(CDP == 10){
            world.sendMessage("§eThe match is coming to start!§r");
            OW.runCommandAsync("playsound random.pop @a");
            OW.runCommandAsync(`titleraw @a title {"rawtext":[{"text":"§d${CDP}§R"}]}`);
        };
        if(CDP <= 9 && CDP > 5){
            OW.runCommandAsync(`titleraw @a title {"rawtext":[{"text":"§d${CDP}§R"}]}`);
            OW.runCommandAsync("playsound block.click @a")
        };
        if(CDP <= 5 && CDP > 0){
            OW.runCommandAsync(`titleraw @a title {"rawtext":[{"text":"§c${CDP}§R"}]}`);
            OW.runCommandAsync("playsound block.click @a")
        };
        if(CDP == 0) {
           world.sendMessage("§e§lMatch have started!§r")
           OW.runCommandAsync("playsound mob.wither.spawn @a")
        };
    },20);
};

const TAGS = ["team1","team2","team3","team4","team5","team6","team7","team8","team9","team10","team11","team12","team13","team14","team15","team16","team17","team18","team19","team20"]

world.beforeEvents.chatSend.subscribe( e => {
    const sender = e.sender;
    
    const create = '!teams new'
    
    const search = "!teams add"
    
    const Delete = "!teams delete"
    
    const remove = "!teams remove"
    
//Crear Equipos / Create Teams
    if(e.message.startsWith(create)){
        e.cancel = true;
        let teamName = "§a" + `${e.message.substring(11)}` + "§r"
        if(!TEAMS.includes(teamName) && sender.getDynamicProperty("teams") == undefined){
            sender.setDynamicProperty("teams",teamName);
            world.sendMessage(`Team ${teamName} was created.`);
            addTeam(teamName,sender)
        } else if (sender.getDynamicProperty("teams") !== undefined){
            sender.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou are already on a team.§r"}]}`)
        } else {
            sender.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cThis team name is already used.§r"}]}`)
        }
//Remover Equipos / Removing Teams
    } else if(e.message.startsWith(Delete)){
        e.cancel = true;
        let teamName = "§a" + `${e.message.substring(14)}` + "§r"
        if(!TEAMS.includes(teamName)){
            sender.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cThat team doesn't exist.§r"}]}`)
        };
        if(sender.getDynamicProperty("teams") !== teamName){
            sender.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou don't belong to that team.§r"}]}`)
        } else {
            removeTeam(teamName,sender)
        }
//Buscar Jugadores / Searching Players
    } else if(e.message.startsWith(search)){
        e.cancel = true;
        if(!sender.hasTag("T_Leader") || sender.getDynamicProperty("teams") === undefined) return sender.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou don't have permissions to do this action.§r"}]}`);
        let nameSearch = e.message.substring(11).trimEnd();
        const playerSearched = world.getPlayers({ name: nameSearch, excludeNames: [`${sender.name}`]})
        if(!playerSearched[0]){
        sender.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§c${nameSearch} wasn't found§r"}]}`)
        }
        else {
            for(let player of playerSearched){
                if(!TEAMS.includes(player.getDynamicProperty("teams"))){
                let teamName = sender.getDynamicProperty("teams")
                player.setDynamicProperty("teams",teamName);
                sender.runCommandAsync(`tellraw @s {"rawtext":[{"text":"${nameSearch} has joined to your team."}]}`)
                player.runCommandAsync(`tellraw @a[name=${nameSearch}] {"rawtext":[{"text":"You have joined to ${sender.name}'s team."}]}`)
                } else {
                sender.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cPlayer's already on a team.§r"}]}`)
                }
            };
        }
    } else if(e.message.startsWith("!tm")){
        e.cancel = true
        toTargets(sender,e.message)
    } else if(e.message.startsWith(remove)){
        e.cancel = true;
        if(!sender.hasTag("T_Leader") || sender.getDynamicProperty("teams") === undefined) return sender.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou don't have permissions to do this action.§r"}]}`);
        
        let nameSearch = e.message.substring(14).trimEnd();
        const playerSearched = world.getPlayers({ name: nameSearch, excludeNames: [`${sender.name}`]})
        if(!playerSearched[0]){
        sender.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§c${nameSearch} wasn't found§r"}]}`)
        }
        else {
            for(let player of playerSearched){
                if(sender.getDynamicProperty("teams") === player.getDynamicProperty("teams")){
                player.setDynamicProperty("teams",undefined);
                sender.runCommandAsync(`tellraw @s {"rawtext":[{"text":"You removed ${nameSearch} from your team"}]}`)
                player.runCommandAsync(`tellraw @a[name=${nameSearch}] {"rawtext":[{"text":"${sender.name} removed you from their team"}]}`)
                } else {
                sender.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cThat player doesn't belong to your team.§r"}]}`)
                }
            }
        }
    } else if(e.message === "!teams start players"){
        e.cancel= true;
        if(!sender.isOp()){
            sender.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou don't have permissions to do this action.§r"}]}`);
        } else {
            tpPlayers();
            start();
        }
    } else if(e.message === "!teams start teams"){
        e.cancel= true;
        if(!sender.isOp()){
            sender.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§cYou don't have permissions to do this action.§r"}]}`);
        } else {
            tpTeams();
            start();
        }
    } else if(e.message === "!teams list"){
        e.cancel = true;
        system.run(() => {
            const TEAMS2 = TEAMS.filter((team) => team !== "");
            if(TEAMS2.length <= 0){
                sender.runCommandAsync(`tellraw @a {"rawtext":[{"text":"§cThere is not any team created.§r"}]}`)
            } else {
                sender.runCommandAsync(`tellraw @a {"rawtext":[{"text":"There's ${TEAMS2.length}/20 teams:\n"},{"text":"${TEAMS2.join("\n")}"}]}`)
            }
        })
    } else if(e.message === "!teams help"){
        e.cancel = true;
        sender.runCommandAsync(`tellraw @s {"rawtext":[{"text":"${HELP.join("\n")}"}]}`)
    } else if(e.message.startsWith("#")){
        e.cancel = true
        globalMessages(sender,e.message)
    } else {
        e.cancel = true;
        sender.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§b[Me]§r: "},{"text":"${e.message}"}]}`)
    }
});

let kills = world.scoreboard.getObjective("Kills") ?? world.scoreboard.addObjective("Kills","Kills");
let deaths = world.scoreboard.getObjective("Deaths") ?? world.scoreboard.addObjective("Deaths","Deaths")

world.afterEvents.entityDie.subscribe((e) => {
    if(e.deadEntity.typeId === "minecraft:player" && e.damageSource.damagingEntity?.typeId === "minecraft:player"){
        const killer = e.damageSource.damagingEntity
        const dead = e.deadEntity;
        kills.addScore(killer,1);
        deaths.addScore(dead,1)
    } else if(e.deadEntity.typeId === "minecraft:player"){
        const dead = e.deadEntity;
        deaths.addScore(dead,1)
    }
});

world.afterEvents.playerSpawn.subscribe((e) => {
    e.player.triggerEvent("teams:cancel_damage")
});

system.runInterval(() => {
    OW.runCommandAsync("effect @e[type=armor_stand,name=TPP] invisibility 2 0 true")
    OW.runCommandAsync("effect @e[type=armor_stand,name=TPT] invisibility 1 0 true")
    if(TEAMS[TEAMS.length - 1] === ''){
        TEAMS.splice(TEAMS.length - 1,1)
    }
    for (let player of world.getAllPlayers()){
        kills.addScore(player,0)
        let team = player.getDynamicProperty("teams");
        const playerTags = player.getTags()
        let teamIndex = TEAMS.indexOf(team);
        let tag = TAGS[teamIndex];
        const teammates = world.getPlayers({ tags: [`${tag}`], excludeNames: [`${player.name}`]});
        let teammateName = ["You"];
        teammates.forEach((tm) => {
            let data = tm.name + " " + "§c" + `${Math.round(tm.getComponent("minecraft:health")?.currentValue)}` + `❤§r`;
            teammateName.push(data);
        });
        if(team !== undefined){
            player.nameTag = player.name + "\n" + `${team}`
            player.addTag(`${tag}`);
        } else {
            player.nameTag = player.name;
            player.removeTag(`${playerTags.filter((tag) => tag.includes("team"))}`);
        }
        player.removeTag("undefined")
        const INFO = [
            `      §6§lBEDROCK TEAMS§r`,
            ``,
            `§bYour Teammate(s)§r:`,
            `${teammateName.join("\n")}`,
            ``,
            `§7Kills ☠§r: ${kills.getScore(player)}`,
            `§cDeaths ☠§r: ${deaths.getScore(player)}`
            ].join("\n")
        player.onScreenDisplay.setActionBar(INFO)
    };
},20);

/***Código creado por Gardex (Gardex6872 en MC) / Code was created by Gardex (Gardex6872 in MC)
 * Por favor, en caso de usarlo en proyectos propios o hacerle una "review" dar créditos al autor (yo :D) / If this's used in own proyects or reviewing it, you must give the original author credits please (me :D)
 * De igual forma, agradezco a todos los que me ayudaron a codificar este complemento / Likewise, I thank the Bedrock AddOns Script API community for helping me.***/