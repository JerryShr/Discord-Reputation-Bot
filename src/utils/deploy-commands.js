const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("../config");

// 確保控制台輸出使用UTF-8編碼
process.stdout.setEncoding('utf8');
process.stderr.setEncoding('utf8');

// 註冊應用程式指令
async function deployCommands() {
    try {
        const commands = [];
        const commandsPath = path.join(__dirname, "..", "commands");
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

        // 讀取所有命令文件
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            
            if ("data" in command && "execute" in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`[警告] ${filePath} 中的命令缺少必要的 "data" 或 "execute" 屬性`);
            }
        }

        // 準備REST API實例
        const rest = new REST().setToken(config.token);

        console.log(`開始註冊 ${commands.length} 個應用程式指令...`);

        let data;
        if (config.globalCommands) {
            // 全局註冊
            data = await rest.put(
                Routes.applicationCommands(config.clientId),
                { body: commands }
            );
            console.log(`成功註冊 ${data.length} 個全局應用程式指令`);
        } else {
            // 指定伺服器註冊
            data = await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: commands }
            );
            console.log(`成功註冊 ${data.length} 個伺服器應用程式指令`);
        }

        return data;
    } catch (error) {
        console.error("註冊應用程式指令時出錯:", error);
    }
}

module.exports = { deployCommands };
