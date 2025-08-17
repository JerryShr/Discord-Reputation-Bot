// 設置控制台編碼為UTF-8，解決中文顯示亂碼問題
process.stdout.setEncoding('utf8');
process.stderr.setEncoding('utf8');

const { Client, GatewayIntentBits, Collection, Events } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./src/config");
const { deployCommands } = require("./src/utils/deploy-commands");

// 創建客戶端實例
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// 命令集合
client.commands = new Collection();

// 載入命令
const commandsPath = path.join(__dirname, "src", "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[警告] ${filePath} 中的命令缺少必要的 "data" 或 "execute" 屬性`);
    }
}

// 載入事件
const eventsPath = path.join(__dirname, "src", "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// 處理斜線命令交互
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`找不到命令 ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "執行命令時發生錯誤！", ephemeral: true });
        } else {
            await interaction.reply({ content: "執行命令時發生錯誤！", ephemeral: true });
        }
    }
});

// 啟動時註冊應用程式指令
client.once(Events.ClientReady, async () => {
    console.log(`已登入為 ${client.user.tag}`);
    await deployCommands();
});

// 登入Discord
client.login(config.token);
