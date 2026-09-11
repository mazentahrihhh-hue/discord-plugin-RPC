#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Discord RPC Plugin
مصمم لعرض حالة مخصصة على الديسكورد
"""

import time
import json
import os
from pypresence import Presence

class DiscordRPCPlugin:
    def __init__(self, config_file='config.json'):
        """تهيئة البلوجين"""
        self.config = self.load_config(config_file)
        self.client_id = self.config.get('application_id')
        self.rpc = None
        
    def load_config(self, config_file):
        """تحميل الإعدادات من ملف JSON"""
        if os.path.exists(config_file):
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            print(f"⚠️ ملف الإعدادات {config_file} غير موجود")
            return self.default_config()
    
    def default_config(self):
        """الإعدادات الافتراضية"""
        return {
            "application_id": "YOUR_APP_ID_HERE",
            "state": "Fabric 1.21.11",
            "details": "Playing Minecraft",
            "large_image": "minecraft",
            "large_text": "SKLauncher 4.0",
            "small_image": "online",
            "small_text": "Online",
            "update_interval": 15
        }
    
    def connect(self):
        """الاتصال بـ Discord"""
        try:
            self.rpc = Presence(self.client_id)
            self.rpc.connect()
            print(f"✅ متصل بـ Discord بنجاح!")
            return True
        except Exception as e:
            print(f"❌ خطأ في الاتصال: {e}")
            return False
    
    def update_presence(self, state=None, details=None, large_image=None, 
                       large_text=None, small_image=None, small_text=None):
        """تحديث حالة الديسكورد"""
        if not self.rpc:
            print("❌ لم تتصل بـ Discord بعد")
            return False
        
        try:
            self.rpc.update(
                state=state or self.config.get('state'),
                details=details or self.config.get('details'),
                large_image=large_image or self.config.get('large_image'),
                large_text=large_text or self.config.get('large_text'),
                small_image=small_image or self.config.get('small_image'),
                small_text=small_text or self.config.get('small_text'),
                start=int(time.time())
            )
            print(f"✅ تم التحديث: {details}")
            return True
        except Exception as e:
            print(f"❌ خطأ في التحديث: {e}")
            return False
    
    def set_custom_status(self, app_name, details, state, large_image=None, small_image=None):
        """تعيين حالة مخصصة"""
        config = {
            "state": state,
            "details": details,
            "large_image": large_image or "default",
            "large_text": app_name,
            "small_image": small_image or "online",
            "small_text": "Online"
        }
        self.update_presence(**config)
    
    def keep_alive(self):
        """إبقاء الاتصال نشطاً"""
        try:
            while True:
                time.sleep(self.config.get('update_interval', 15))
                self.update_presence()
        except KeyboardInterrupt:
            print("\n⏹️ إيقاف البلوجين...")
            self.disconnect()
    
    def disconnect(self):
        """قطع الاتصال بـ Discord"""
        if self.rpc:
            self.rpc.close()
            print("🔌 تم قطع الاتصال")


def main():
    """الدالة الرئيسية"""
    print("🎮 Discord RPC Plugin")
    print("=" * 40)
    
    # إنشاء instance من البلوجين
    plugin = DiscordRPCPlugin()
    
    # الاتصال
    if plugin.connect():
        # تحديث الحالة
        plugin.update_presence()
        
        # إبقاء الاتصال نشطاً
        try:
            plugin.keep_alive()
        except KeyboardInterrupt:
            plugin.disconnect()
    else:
        print("❌ فشل الاتصال بـ Discord")
        print("تأكد من تثبيت pypresence:")
        print("  pip install pypresence")


if __name__ == "__main__":
    main()
