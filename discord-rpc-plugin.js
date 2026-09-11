#!/usr/bin/env node
/**
 * Discord RPC Plugin (Node.js)
 * مصمم لعرض حالة مخصصة على الديسكورد
 */

const { Client } = require('discord-rpc');
const fs = require('fs');
const path = require('path');

class DiscordRPCPlugin {
    constructor(configFile = 'config.json') {
        this.config = this.loadConfig(configFile);
        this.clientId = this.config.application_id;
        this.client = null;
        this.updateInterval = this.config.update_interval || 15;
    }

    loadConfig(configFile) {
        try {
            if (fs.existsSync(configFile)) {
                const data = fs.readFileSync(configFile, 'utf-8');
                return JSON.parse(data);
            } else {
                console.warn(`⚠️ ملف الإعدادات ${configFile} غير موجود`);
                return this.defaultConfig();
            }
        } catch (error) {
            console.error(`❌ خطأ في قراءة الإعدادات: ${error.message}`);
            return this.defaultConfig();
        }
    }

    defaultConfig() {
        return {
            application_id: 'YOUR_APP_ID_HERE',
            state: 'Fabric 1.21.11',
            details: 'Playing Minecraft',
            large_image: 'minecraft',
            large_text: 'SKLauncher 4.0',
            small_image: 'online',
            small_text: 'Online',
            update_interval: 15
        };
    }

    async connect() {
        try {
            this.client = new Client({ transport: 'ipc' });
            
            this.client.on('ready', () => {
                console.log('✅ متصل بـ Discord بنجاح!');
                this.updatePresence();
            });

            await this.client.login({ clientId: this.clientId });
            return true;
        } catch (error) {
            console.error(`❌ خطأ في الاتصال: ${error.message}`);
            return false;
        }
    }

    async updatePresence(state = null, details = null, largeImage = null, 
                         largeText = null, smallImage = null, smallText = null) {
        if (!this.client) {
            console.error('❌ لم تتصل بـ Discord بعد');
            return false;
        }

        try {
            await this.client.setActivity({
                state: state || this.config.state,
                details: details || this.config.details,
                largeImageKey: largeImage || this.config.large_image,
                largeImageText: largeText || this.config.large_text,
                smallImageKey: smallImage || this.config.small_image,
                smallImageText: smallText || this.config.small_text,
                startTimestamp: new Date()
            });
            console.log(`✅ تم التحديث: ${details || this.config.details}`);
            return true;
        } catch (error) {
            console.error(`❌ خطأ في التحديث: ${error.message}`);
            return false;
        }
    }

    async setCustomStatus(appName, details, state, largeImage = null, smallImage = null) {
        await this.updatePresence(
            state,
            details,
            largeImage || 'default',
            appName,
            smallImage || 'online',
            'Online'
        );
    }

    async keepAlive() {
        console.log(`⏱️  سيتم التحديث كل ${this.updateInterval} ثانية...`);
        setInterval(() => {
            this.updatePresence();
        }, this.updateInterval * 1000);
    }

    async disconnect() {
        if (this.client) {
            await this.client.destroy();
            console.log('🔌 تم قطع الاتصال');
        }
    }
}

// البرنامج الرئيسي
async function main() {
    console.log('🎮 Discord RPC Plugin (Node.js)');
    console.log('='.repeat(40));

    const plugin = new DiscordRPCPlugin();

    if (await plugin.connect()) {
        await plugin.keepAlive();

        // التعامل مع إيقاف البرنامج
        process.on('SIGINT', async () => {
            console.log('\n⏹️ إيقاف البلوجين...');
            await plugin.disconnect();
            process.exit(0);
        });
    } else {
        console.error('❌ فشل الاتصال بـ Discord');
        console.error('تأكد من تثبيت discord-rpc:');
        console.error('  npm install discord-rpc');
        process.exit(1);
    }
}

// تصدير الكلاس للاستخدام كـ module
module.exports = DiscordRPCPlugin;

// تشغيل البرنامج إذا تم استدعاؤه مباشرة
if (require.main === module) {
    main().catch(console.error);
}
