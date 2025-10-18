// ==UserScript==
// @name         War Commander Mod Full
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  سكربت شامل لتعديلات War Commander مع نافذة الوظائف، اختصارات الكيبورد، زر Platoons، رفع الموارد، إلغاء الكولداون، رفع مستوى المباني، فتح جميع الألغام، والتنقل السريع بين القطاعات
// @author       A7MD
// @match        *://*.kixeye.com/*
// @match        https://apps.facebook.com/warcommander/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // ----- تحذير أسفل الشاشة -----
    function showWarningMessage() {
        const warningDiv = document.createElement('div');
        warningDiv.textContent = "⚠️ تنبيه: أي تلاعب يؤدي إلى الحظر. استخدم السكربت بحذر.";
        Object.assign(warningDiv.style, {
            position: 'fixed', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: '#B22222', color: 'white', padding: '12px 20px',
            borderRadius: '8px', fontSize: '14px', fontWeight: 'bold',
            boxShadow: '0 0 10px rgba(178,34,34,0.7)', zIndex: 10000000,
            fontFamily: 'Tahoma, Arial, sans-serif', userSelect: 'none',
        });
        document.body.appendChild(warningDiv);
        setTimeout(() => { warningDiv.style.transition = 'opacity 1s'; warningDiv.style.opacity = '0'; setTimeout(() => warningDiv.remove(), 1000); }, 6000);
    }
    window.addEventListener('load', showWarningMessage);

    // ----- نافذة الوظائف -----
    const overlay = document.createElement('div');
    const modalBox = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', display: 'none',
        justifyContent: 'center', alignItems: 'center', zIndex: 9999999, userSelect: 'none',
    });
    Object.assign(modalBox.style, {
        background: 'linear-gradient(145deg, #2e0000, #550000)',
        color: '#fff', padding: '25px 30px', borderRadius: '10px', border: '2px solid #990000',
        boxShadow: '0 0 15px rgba(255,0,0,0.4),0 0 40px rgba(150,0,0,0.2),inset 0 0 10px rgba(255,0,0,0.3)',
        maxWidth: '500px', fontFamily: 'Orbitron, Tahoma, sans-serif', fontSize: '14px',
        lineHeight: '1.6', whiteSpace: 'pgetReloadTimeForUnit(d))}b.set_credits(ya.TimeToCredits(b.get_time())|','+this.getReloadTimeForUnit(d))}b.set_credits(1|');
            code = code.replace('+this.getReloadTimeFor
            code = code.replace('.ensureInt(a.credits));
                "window.platoonKeyListenerAdded||(window.

            // ======================== نهاية التعديلات ========================

            const scriptTag = document.createElement('script');
            scriptTag.textContent = code;
            document.documentElement.appendChild(scriptTag);

        } catch (err) {
            console.error("فشل تحميل أو تعديل WarCommander.js:", err);
        }
    }

})();

