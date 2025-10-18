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
        lineHeight: '1.6', whiteSpace: 'pre-line', userSelect: 'text', cursor: 'default',
        textShadow: '0 0 5px #990000', textAlign: 'left',
    });
    modalBox.textContent = `وظائف السكربت:
- تعطيل الحماية وأخطاء الحفظ
- زيادة الموارد (ذهب، نفط، معادن)
- رفع قدرات القوات الجوية والبرية
- إلغاء أوقات الانتظار والكولداون
- فتح جميع الألغام
- زر Platoons في المعركة وقائمة البحث
- اختصارات كيبورد (A, Y, Ctrl+Y, Ctrl+M, 1..8)
- التنقل السريع بين القطاعات
- رفع مستوى المباني والموارد
- فتح المباني أثناء الترقية
- وأكثر من ذلك`;
    overlay.appendChild(modalBox);
    document.documentElement.appendChild(overlay);

    document.addEventListener("keydown", e => { if (e.keyCode === 96) overlay.style.display = 'flex'; });
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });

    // ====== اعتراض سكربت اللعبة وتعديله ======
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.tagName === 'SCRIPT' && node.src && node.src.includes("WarCommander.js")) {
                    node.type = "javascript/blocked";
                    node.remove();
                    injectModifiedScript(node.src);
                }
            }
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    async function injectModifiedScript(jsUrl) {
        try {
            const res = await fetch(jsUrl);
            let code = await res.text();

            // ======================== تعديلاتك ========================
            // زر إلغاء ترقية المباني
            code = code.replace(
                'this.get_canMove()&&(a.push(zc.createContextMenuButton(m.getString("build_button__move"),h(this,this.StartMove))),',
                'this.get_canMove()&&(a.push(wc.createContextMenuButton(m.getString("build_button__move"),h(this,this.StartMove))),this.isUpgrading()&&a.push(rc.createContextMenuButton(m.getString("common_button__cancel_upgrade"),h(this,this.ConfirmCancelUpgrade))),'
            );
            // Hack platoons / نشر القوات
            code = code.replace('validateDeployPlatoon:function(){return 4==','validateDeployPlatoon:function(){return 0==');
            code = code.replace('getGroundDeployMaxCapacity=function(){return','getGroundDeployMaxCapacity=function(){return 7000;');
            code = code.replace('getAirDeployMaxCapacity=function(){','getAirDeployMaxCapacity=function(){return 7000;');
            // GOLD / Credits
            code = code.replace('+this.getReloadTimeForUnit(d))}b.set_credits(ya.TimeToCredits(b.get_time())|','+this.getReloadTimeForUnit(d))}b.set_credits(1|');
            code = code.replace('+this.getReloadTimeForUnit(d))}b.set_credits(xa.TimeToCredits(b.get_time())|','+this.getReloadTimeForUnit(d))}b.set_credits(1|');
            code = code.replace('+this.getReloadTimeForUnit(d))}b.set_credits(za.TimeToCredits(b.get_time())|','+this.getReloadTimeForUnit(d))}b.set_credits(1|');
            // إزالة تكلفة الموارد
            code = code.replace("get_productionCostR1:function(){return this._productionCostR1},get_productionCostR2:function(){return this._productionCostR2},","get_productionCostR1:function(){return 0},get_productionCostR2:function(){return 0},");
            // إلغاء رسائل هجوم
            code = code.replace('c=m.getString("worldmap__cannot_attack");','');
            code = code.replace('d=m.getString("worldmap__you_cannot_attack_target",{target:l});','');
            code = code.replace('null==c&&De.Show(m.getString("ui__starting_attack"));','');
            code = code.replace('null==c&&Fe.Show(m.getString("ui__starting_attack"));','');
            code = code.replace('null==c&&He.Show(m.getString("ui__starting_attack"));','');
            code = code.replace('null==c&&Ge.Show(m.getString("ui__starting_attack"));','');
            code = code.replace('null==c&&Be.Show(m.getString("ui__starting_attack"));','');
            code = code.replace('case 2212:c=m.getString("worldmap_title__under_attack");d=m.getString("worldmap_body__someone_else_launched_attack",{target:l});break;','');
            // leve pouton b7th rkm 10//
            code = code.replace('!1;for(var b=0,c=D._units;b<c.length;', '!0;for(var b=0,c=D._units;b<c.length;');
            // الشروط (معارك / مناجم)
            code = code.replace(';if(this.get_mine()||F.IsAdvanceScouting())a*=.6;0<this._f',';if(this.get_mine()||F.IsSyncBattleDefender()||F.IsBattle()||F.IsPlatoon()||F.IsAdvanceScouting())a*=.6;0<this._');
            code = code.replace(';if(this.get_mine()||G.IsAdvanceScouting())a*=.6;0<this._f',';if(this.get_mine()||G.IsSyncBattleDefender()||G.IsBattle()||G.IsPlatoon()||G.IsAdvanceScouting())a*=.6;0<this._');
            // اختصارات الكيبورد (A للهجوم،)
            code = code.replace("this.performScout(a.shiftKey)","this.performScout(a.shiftKey);break;case 65:null==this.get_mousedOverTile()||this.confirmAttack();break;case 89:U.Show(new km)");
            code = code.replace('null==this.get_mousedOverTile()||this.performScout(a.shiftKey)}},','null==this.get_mousedOverTile()||this.performScout(a.shiftKey);break;case 65:null==this.get_mousedOverTile()||this.confirmAttack()}},');
            // استهداف/هجوم
            code = code.replace('get_currentTarget()&&c.get_defenderEntity()','get_currentTarget()||c.get_defenderEntity()');
            code = code.replace('null==Y.get_controller().get_currentTarget()','null!=Y.get_controller().get_currentTarget()');
            code = code.replace('null==X.get_controller().get_currentTarget()','null!=X.get_controller().get_currentTarget()');
            // إزالة تقييد وقت انتظار (ازالة كول داون للاوبس)
            code = code.replace('clearMissileCooldown:function(){Gc.canUseService(this._wcDataStorageService,','clearMissileCooldown:function(){');
            code = code.replace('clearMissileCooldown:function(){Kc.canUseService(this._wcDataStorageService,','clearMissileCooldown:function(){');
            code = code.replace('"clearMissileCooldown")&&this._wcDataStorageService.resetMissileCooldown()','');
            code = code.replace('resetCooldown:function(a){Gc.canUseService(this._wcDataStorageService,','resetCooldown:function(a){},');
            code = code.replace('resetCooldown:function(a){Kc.canUseService(this._wcDataStorageService,','resetCooldown:function(a){},');
            code = code.replace('"resetCooldown")&&this._wcDataStorageService.resetCooldown(a)},','');
            // Save // Faster // Error //
            code = code.replace('CanSaveBase:function(){return this.IsScouting()?!1:0!=this._state?3==this._state:!0},','CanSaveBase:function(){return this.IsScouting()?!1:0!=this._state?3==this._state:!0},');
            code = code.replace('.handleError','.handleSuccess');
            code = code.replace('.canSaveBase():!1}','.canSaveBase():!0}');
            code = code.replace('onPlatoonError:function(a){T.debug("PLATOON ERROR: "+','onPlatoonError:function(a){return;T.debug("PLATOON ERROR: "+');
            code = code.replace('{if(0==a.error)this.SaveSuccess(a)','{if(0>=0)this.SaveSuccess(a)');
            code = code.replace('onSaveErrorReceived:function(a,b){','onSaveErrorReceived:function(a,b){return false;');
            code = code.replace('handleSaveFailed:function(a){1<this.getAllQueuedSaveData()','handleSaveFailed:function(a){0<this.getAllQueuedSaveData()');
            code = code.replace('.canSaveBase():!1}','.canSaveBase():!0}');
            code = code.replace('canRetreatGround=function(){return','canRetreatGround=function(){return!0;');
            code = code.replace('||!x.canSaveBase()','');
            code = code.replace('||!G.canSaveBase()','');
            code = code.replace('||!F.canSaveBase()','');
            code = code.replace('||!v.canSaveBase()','');
            //Repair toons while under attack
            code = code.replace('ye._uiSettings.displaySyncBattle=!0,ye._uiSettings.displayBottomOne=!0','ye._uiSettings.displaySyncBattle=!0,ye._uiSettings.displayBottomButtonBar=!0,ye._uiSettings.displayBottomOne=!0');
            code = code.replace('te._uiSettings.displaySyncBattle=!0,te._uiSettings.displayBottomOne=!0','te._uiSettings.displaySyncBattle=!0,te._uiSettings.displayBottomButtonBar=!0,te._uiSettings.displayBottomOne=!0');
            // التحكم بالمعركة
            code = code.replace('isInBattle:function(){','isInBattle:function(){return!1;');
            code = code.replace('get_canMove:function(){return','get_canMove:function(){return!0;');
            // الرجوع للخريطة بعد الأنيميشن
            code = code.replace('.onComplete(wb.onAnimDone))','.onComplete(n.ShowMap()))');
            code = code.replace('.onComplete(Db.onAnimDone))','.onComplete(q.ShowMap()))');
            // تعطيل الخروج الكامل (Fullscreen)
            code = code.replace('{n.ExitFullscreen();U.HideAll();','{return;n.ExitFullscreen();U.HideAll();');
            code = code.replace('{n.ExitFullscreen();W.HideAll();','{return;n.ExitFullscreen();W.HideAll();');
            code = code.replace('{q.ExitFullscreen();W.HideAll();','{return;q.ExitFullscreen();V.HideAll();');
            code = code.replace('{n.ExitFullscreen();V.HideAll();','{return;n.ExitFullscreen();V.HideAll();');
            //بناء كل الالغام مع بعض
            code = code.replace(
            'Ha.ProduceMine(this._mineSlot))},',
            'Ha.ProduceMine(1),Ha.ProduceMine(0),Ha.ProduceMine(2),Ha.ProduceMine(3),Ha.ProduceMine(4),Ha.ProduceMine(5),Ha.ProduceMine(6),Ha.ProduceMine(7),Ha.ProduceMine(8),Ha.ProduceMine(9),Ha.ProduceMine(10),Ha.ProduceMine(11),Ha.ProduceMine(12),Ha.ProduceMine(13),Ha.ProduceMine(14),Ha.ProduceMine(15),Ha.ProduceMine(16),Ha.ProduceMine(17),Ha.ProduceMine(18))},');
            //1 button relocate remove bottom 2 slashes//
            // code = code.replace("Db._destinationSector=a", "Db._destinationSector=83");
            // code = code.replace("Db.ShowConfirmation(Db.onConfirmedSector)", "Db.BeginRelocate();Db._relocatedToFriend=!1;Y.get_controller().moveToSector(Db._relocateToSector)");
            code = code.replace(':0==this._platoon.get_properties().get_canDamagedUnitsExit()&&this._platoon.hasDamagedUnits()&&!',':');
            //  Sector-Breach  //
// إلغاء شرط منع تفكيك الوحدات المتضررة (Disband)
code = code.replace(
    "0==this._platoon.get_properties().get_canDamagedUnitsExit()&&this._platoon.hasDamagedUnits()",
    "false"
);

// إلغاء شرط منع تفكيك الوحدات المتضررة (ReturnUnit / MovePlatoonToStorage)
code = code.replace(
    "0==this._platoon.get_properties().get_canDamagedUnitsExit()&&d.needRepairs()",
    "false"
);
            // code = code.replace('Ab.DisplayMessage(l.getString("widget_title__repair_fireteams_before_disband"),l.getString("widget_body__repair_fireteams_before_disband")):','');
            // code = code.replace(':0==this._platoon.get_properties().get_canDamagedUnitsExit()&&this._platoon.hasDamagedUnits()&&!n.get_AllowDamagedPlatoonManagement()?Db.DisplayMessage(m.getString("widget_title__repair_units_before_disband"),m.getString("widget_body__repair_units_before_disband")):',':');
            // code = code.replace('zb.DisplayMessage(m.getString("widget_title__repair_fireteams_before_disband"),m.getString("widget_body__repair_fireteams_before_disband")):','h(this,this.DisbandConfirm):');
            // code = code.replace('if(null!=this._destinationHexTile&&null!=this._destinationHexTile.getMapCell()&&c.hasEntities()&&null!=this._selectedHexMapCell&&null!=g&&','if(');
            // code = code.replace('&&0==b.get_properties().get_canDamagedUnitsExit()&&this._unit.needRepairs()&&(a="widget__unit_must_be_fully_repaired_leave_platoon")','');
            // code = code.replace('get_canDamagedUnitsExit:function(){return this._canDamagedUnitsExit}','get_canDamagedUnitsExit:function(){return!1}');
            //onRelocate:function(a){this._signalRelocate.dispatch([a])
             code = code.replace(/b&&0==b\.get_properties\(\)\.get_canDamagedUnitsExit\(\)&&this\._unit\.needRepairs\(\)&&\(a="widget__unit_must_be_fully_repaired_leave_platoon"\)\);null!=a\?\(Ta\.get_instance\(\)\.playSound\("ui_error"\),J\.ToolTip\(this,.*?\)\):/g,'Ta.get_instance().playSound("ui_click"),W.Message(8,{unit:this._unit}));');

            //Unstealth Units   b7teh rkm 4
            code = code.replace('c?c._stealthRatio=b?1:0:','c?c._stealthRatio=b?0:0:');
            // Boost.V.1 //
            code = code.replace('shouldDisplayBoost:function(a){return a.get_hidden()?!1:this.isBoostAvailable(a)},','shouldDisplayBoost:function(a){return !0 },');
            //  Oli //  Metal //  Power //
            code = code.replace('get_produce:function(){return this._produce}','get_produce:function(){return this._produce=70000000}');
            code = code.replace('get_cycleTime:function(){return this._cycleTime}','get_cycleTime:function(){return this._cycleTime=300000000}');
            code = code.replace('get_canMove:function(){return','get_canMove:function(){return!0;');
            code = code.replace("n._ROOT.stage.addEventListener(\"keyDown\", h(this,this.onKeyDown));","n._ROOT.stage.addEventListener(\"keyDown\", h(this,this.onKeyDown));window.platoonKeyListenerAdded||(window.platoonKeyListenerAdded=!0,n._ROOT.stage.addEventListener(\"keyDown\",function(e){if(e && e.keyCode===68){try{if(this.onInspect){var originalInspect=this.onInspect.toString().replace(/if\\s*\\(!this\\.get_isOwned\\(\\)\\)\\s*return;?/g, \"\");this.onInspect=eval(\"(\"+originalInspect+\")\");this.onInspect();}}catch(err){console.error(\"Error running onInspect:\",err);}}}.bind(this)));");
            //T5ER AL ESM FREE//
            //code = code.replace('V.Show(new Cb(m.getString("common__error"),m.getString("popups_body__change_nickname_error",{name:ia.playerInfo.get_alias()}),!0,"",null,1));nf.RevertAlias()','V.Show(new Cb("Nickname Change Success", "Your nickname has been changed successfully.", true, "", null, 1));');
            //code = code.replace('currentName="oldName"', 'currentName="newName"');
            //max all things//
            // code = code.replace('get_level:function(){return this._level},get_maxLevel:function(){return aa.IsDecorationType(this._buildingProps.get_id())?999:this._buildingProps.maxLevel},getAlternateLevelForType:function(a){return this._alternateLevels.h.hasOwnProperty(a)?this._alternateLevels.h[a].buildingLevel:1}','get_level:function(){return aa.IsDecorationType(this._buildingProps.get_id())?999:this._buildingProps.maxLevel},get_maxLevel:function(){return aa.IsDecorationType(this._buildingProps.get_id())?999:this._buildingProps.maxLevel},getAlternateLevelForType:function(a){return this._alternateLevels.h.hasOwnProperty(a)?this._alternateLevels.h[a].buildingLevel:1}');
            //  Realod by (1) Gold  //
            code = code.replace('+this.getReloadTimeForUnit(d))}b.set_credits(xa.TimeToCredits(b.get_time())|0);return b}','+this.getReloadTimeForUnit(d))}b.set_credits(1|0);return b}');
            code = code.replace('+this.getReloadTimeForUnit(d))}b.set_credits(ya.TimeToCredits(b.get_time())|0);return b}','+this.getReloadTimeForUnit(d))}b.set_credits(1|0);return b}');
            code = code.replace('+this.getReloadTimeForUnit(d))}b.set_credits(za.TimeToCredits(b.get_time())|0);return b}','+this.getReloadTimeForUnit(d))}b.set_credits(1|0);return b}');
            //code = code.replace('.set_credits(ya.TimeToCredits(b.get_time())','.set_credits(0');
            //pvp hack nkel teran in battel//
            code = code.replace('get_isMoving:function(){return null!=this._mapEntity?null!=this._mapEntity.get_path():!1},isInBattle:function(){if(this.get_isAircraftPlatoon())return va.instance.get_IsOwnerAttackerInActiveBattles();','get_isMoving:function(){return null!=this._mapEntity?null!=this._mapEntity.get_path():!1},isInBattle:function(){if(this.get_isAircraftPlatoon())return !1;')
            code = code.replace('getSharedDeployMaxCapacity=function(){','getSharedDeployMaxCapacity=function(){return 7000;');
            //GOLD HACK//
            code = code.replace('.ensureInt(a.credits));null!=a.resources&&','.ensureInt(1998));null!=a.resources&&');

            // فتح المباني أثناء الترقية
            //code = code.replace(';else 0<this.RemainingDozerTime()?',';else 0>this.RemainingDozerTime()?');

            // إلغاء رسائل الهجوم
            code = code.replace(/c=m.getString\("worldmap__cannot_attack"\);/g,'');
            code = code.replace(/d=m.getString\("worldmap__you_cannot_attack_target",{target:l}\);/g,'');
            code = code.replace(/null==c&&.*Show\(m.getString\("ui__starting_attack"\)\);/g,'');
            // Trophy //
            //code = code.replace('.prototype,{ImageCallback:function(a,b){','.prototype,{ImageCallback:function(a,b){return!1;');
            code = code.replace("Ga.prototype.ImageCallback.call(this,a,b)","document.addEventListener('keydown',e=>{if(e.altKey&&e.keyCode===81&&!G.IsEnemyBase()){Ga.prototype.ImageCallback.call(this,a,b);}});");
            // زر Platoons في المعركة والخريطة
            code = code.replace(
                'IsBattleStarted()?(this._leaveButton=this._widget.AddButton(m.getString("ui_button__leave"),g(this,this.LeaveBattle)),',
                'IsBattleStarted()?(this._leaveButton=this._widget.AddButton(m.getString("卐"),g(this,function(){ W.Show(new Dm); })),this._leaveButton=this._widget.AddButton(m.getString("ui_button__leave"),g(this,this.LeaveBattle)),'
            );
            code = code.replace(
                'this._findButton=this._widgetFindEnter.AddButton(m.getString("ui_worldmap__find_base"),g(this,this.OnFindBaseClick));',
                'this._findButton=this._widgetFindEnter.AddButton(m.getString("卐"),g(this,function(){ W.Show(new Dm); }));this._findButton=this._widgetFindEnter.AddButton(m.getString("ui_worldmap__find_base"),g(this,this.OnFindBaseClick));'
            );

            // اختصارات الكيبورد 1..3
            code = code.replace(
                "this._widget=new TA;G.IsBattle",
                "this._widget=new TA;" +
                "window.platoonKeyListenerAdded||(window.platoonKeyListenerAdded=!0,document.addEventListener(\"keydown\",function(e){if(e&&e.keyCode===49){W.Show(new Dm);}}));" +
                "window.missileKeyListenerAdded||(window.missileKeyListenerAdded=!0,document.addEventListener(\"keydown\",function(e){if(e&&e.keyCode===50){W.Show(new bq(4));}}));" +
                "window.mineFactoryKeyListenerAdded||(window.mineFactoryKeyListenerAdded=!0,document.addEventListener(\"keydown\",function(e){if(e&&e.keyCode===51){W.Show(new $z);}}));" +
                "G.IsBattle"
            );

          // ====== تنقل سريع بين القطاعات ======
        code = code.replace(
            "Db.onConfirmedLeaderboard=function(){Db.BeginRelocate();Db._relocatedToFriend=!1;Y.get_controller().moveToSector(Db._relocateToSector)};",
            "Db.handleKeyPress=function(e){if(e.ctrlKey&&e.keyCode===192){showCustomPrompt(\"sector Number:\",function(sectorId){if(sectorId){Db._relocateToSector=sectorId;Db.BeginRelocate();Y.get_controller().moveToSector(Db._relocateToSector);}else{showAlert(\"No sector ID entered. Cancelled.\");}});}};Db.init=function(){document.addEventListener('keydown',Db.handleKeyPress)};Db.init();function showAlert(message){let alertBox=document.createElement(\"div\");alertBox.style.position=\"fixed\";alertBox.style.top=\"10px\";alertBox.style.left=\"50%\";alertBox.style.transform=\"translateX(-50%)\";alertBox.style.padding=\"10px\";alertBox.style.backgroundColor=\"#B22222\";alertBox.style.color=\"white\";alertBox.style.fontSize=\"16px\";alertBox.style.borderRadius=\"5px\";alertBox.style.zIndex=\"9999\";alertBox.style.boxShadow=\"0px 4px 10px rgba(0, 0, 0, 0.3)\";alertBox.style.textAlign=\"center\";let msg=document.createElement(\"div\");msg.innerText=message;let gam=document.createElement(\"div\");gam.innerText=\"GAM\";gam.style.marginTop=\"5px\";gam.style.fontWeight=\"bold\";gam.style.fontSize=\"18px\";alertBox.appendChild(msg);alertBox.appendChild(gam);document.body.appendChild(alertBox);setTimeout(function(){alertBox.remove();},3000);}function showCustomPrompt(message,callback){let promptBox=document.createElement(\"div\");promptBox.style.position=\"fixed\";promptBox.style.top=\"50%\";promptBox.style.left=\"50%\";promptBox.style.transform=\"translate(-50%, -50%)\";promptBox.style.padding=\"20px\";promptBox.style.backgroundColor=\"#3B542C\";promptBox.style.color=\"white\";promptBox.style.fontSize=\"16px\";promptBox.style.borderRadius=\"8px\";promptBox.style.zIndex=\"9999\";promptBox.style.textAlign=\"center\";promptBox.style.boxShadow=\"0px 4px 10px rgba(0, 0, 0, 0.3)\";let promptMessage=document.createElement(\"p\");promptMessage.innerText=message;promptBox.appendChild(promptMessage);let inputBox=document.createElement(\"input\");inputBox.type=\"text\";inputBox.style.marginTop=\"10px\";inputBox.style.padding=\"8px\";inputBox.style.fontSize=\"14px\";inputBox.style.width=\"100%\";inputBox.style.borderRadius=\"4px\";inputBox.style.border=\"1px solid #ccc\";inputBox.style.backgroundColor=\"white\";inputBox.style.color=\"black\";promptBox.appendChild(inputBox);let submitButton=document.createElement(\"button\");submitButton.innerText=\"OK\";submitButton.style.marginTop=\"10px\";submitButton.style.padding=\"8px 16px\";submitButton.style.backgroundColor=\"#556B2F\";submitButton.style.color=\"white\";submitButton.style.border=\"none\";submitButton.style.borderRadius=\"4px\";submitButton.style.cursor=\"pointer\";promptBox.appendChild(submitButton);document.body.appendChild(promptBox);submitButton.addEventListener(\"click\",function(){let inputValue=inputBox.value.trim();callback(inputValue);promptBox.remove();});inputBox.addEventListener(\"keydown\",function(e){if(e.key===\"Escape\"){promptBox.remove();}});}"
        );

        code = code.replace(
            "wb.onConfirmedLeaderboard=function(){wb.BeginRelocate();wb._relocatedToFriend=!1;X.get_controller().moveToSector(wb._relocateToSector)};",
            "wb.handleKeyPress=function(e){if(e.ctrlKey&&e.keyCode===192){showCustomPrompt(\"sector Number:\",function(sectorId){if(sectorId){wb._relocateToSector=sectorId;wb.BeginRelocate();X.get_controller().moveToSector(wb._relocateToSector);}else{showAlert(\"No sector ID entered. Cancelled.\");}});}};wb.init=function(){document.addEventListener('keydown',wb.handleKeyPress)};wb.init();function showAlert(message){let alertBox=document.createElement(\"div\");alertBox.style.position=\"fixed\";alertBox.style.top=\"10px\";alertBox.style.left=\"50%\";alertBox.style.transform=\"translateX(-50%)\";alertBox.style.padding=\"10px\";alertBox.style.backgroundColor=\"#B22222\";alertBox.style.color=\"white\";alertBox.style.fontSize=\"16px\";alertBox.style.borderRadius=\"5px\";alertBox.style.zIndex=\"9999\";alertBox.style.boxShadow=\"0px 4px 10px rgba(0, 0, 0, 0.3)\";alertBox.style.textAlign=\"center\";let msg=document.createElement(\"div\");msg.innerText=message;let gam=document.createElement(\"div\");gam.innerText=\"GAM\";gam.style.marginTop=\"5px\";gam.style.fontWeight=\"bold\";gam.style.fontSize=\"18px\";alertBox.appendChild(msg);alertBox.appendChild(gam);document.body.appendChild(alertBox);setTimeout(function(){alertBox.remove();},3000);}function showCustomPrompt(message,callback){let promptBox=document.createElement(\"div\");promptBox.style.position=\"fixed\";promptBox.style.top=\"50%\";promptBox.style.left=\"50%\";promptBox.style.transform=\"translate(-50%, -50%)\";promptBox.style.padding=\"20px\";promptBox.style.backgroundColor=\"#3B542C\";promptBox.style.color=\"white\";promptBox.style.fontSize=\"16px\";promptBox.style.borderRadius=\"8px\";promptBox.style.zIndex=\"9999\";promptBox.style.textAlign=\"center\";promptBox.style.boxShadow=\"0px 4px 10px rgba(0, 0, 0, 0.3)\";let promptMessage=document.createElement(\"p\");promptMessage.innerText=message;promptBox.appendChild(promptMessage);let inputBox=document.createElement(\"input\");inputBox.type=\"text\";inputBox.style.marginTop=\"10px\";inputBox.style.padding=\"8px\";inputBox.style.fontSize=\"14px\";inputBox.style.width=\"100%\";inputBox.style.borderRadius=\"4px\";inputBox.style.border=\"1px solid #ccc\";inputBox.style.backgroundColor=\"white\";inputBox.style.color=\"black\";promptBox.appendChild(inputBox);let submitButton=document.createElement(\"button\");submitButton.innerText=\"OK\";submitButton.style.marginTop=\"10px\";submitButton.style.padding=\"8px 16px\";submitButton.style.backgroundColor=\"#556B2F\";submitButton.style.color=\"white\";submitButton.style.border=\"none\";submitButton.style.borderRadius=\"4px\";submitButton.style.cursor=\"pointer\";promptBox.appendChild(submitButton);document.body.appendChild(promptBox);submitButton.addEventListener(\"click\",function(){let inputValue=inputBox.value.trim();callback(inputValue);promptBox.remove();});inputBox.addEventListener(\"keydown\",function(e){if(e.key===\"Escape\"){promptBox.remove();}});}"
        );
       // رفع لفل الى 53
       //code = code.replace('null!=a.r1&&0<a.r1&&x.PointsAdd(Math.ceil(a.r1/50),!0)','x.PointsAdd(65876004771, !0)');
       //code = code.replace('null!=a.r2&&0<a.r2&&x.PointsAdd(Math.ceil(a.r2/50),!0)','x.PointsAdd(65876004771, !0)');
        // =============== اماكن تحديث المعلومات السابقة لفتح المباني ===============
            //clickedMine:function(){this._fired فتح الالغام
            //this.setupColdStorage();this.updateCapacity();this.updateMode()},clickedOpenPlatoon:function//فتح الباتون
            //OpenMissileSilo:function(a){a=w.getUniqueBuildingForType(37)//الصواريخ


            // ======================== نهاية التعديلات ========================

            const scriptTag = document.createElement('script');
            scriptTag.textContent = code;
            document.documentElement.appendChild(scriptTag);

        } catch (err) {
            console.error("فشل تحميل أو تعديل WarCommander.js:", err);
        }
    }

})();
