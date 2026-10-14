/* ================= game.js — ARSENAL & SKINS ================= */
(function () {
    'use strict';

    const isTouchDevice = ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0);
    if (isTouchDevice) document.body.classList.add('touch');

    const isLowEnd = isTouchDevice && (
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
        window.devicePixelRatio >= 3
    );
    const isMobile = isTouchDevice;

    /* =========================================================
     КОНСТАНТЫ
     ========================================================= */
    const MAP_W = 40, MAP_H = 40;
    const WALL_HEIGHT = 3.2;
    const WALL_SIZE = 1;
    const CAM_STAND = 1.65;
    const CAM_CROUCH = 1.05;
    const MOVE_SPEED = 4.2;
    const CROUCH_SPEED_MUL = 0.5;
    const JUMP_VZ = 6.0;
    const GRAVITY = 16;
    const MOUSE_SENS = 0.0022;
    const TOUCH_SENS = 0.0060;
    const PLAYER_RADIUS = 0.28;
    const PITCH_MAX = 1.45;

    const RECORDS_KEY  = 'webstrike_records_v10';
    const MAP_KEY      = 'webstrike_map_v7';
    const MONEY_KEY    = 'webstrike_money_v5';
    const INVENTORY_KEY= 'webstrike_inventory_v1';
    const SKIN_KEY     = 'webstrike_skin_v1';

    const START_MONEY = 2000;
    const KILL_REWARD = 300;
    const WAVE_BONUS = 500;
    const WAVE_BONUS_PER_LEVEL = 100;
    const GRENADE_FUSE = 2.4;
    const GRENADE_RADIUS = 4.5;
    const GRENADE_MAX_DAMAGE = 130;

    /* =========================================================
     ОРУЖИЕ — РАСШИРЕННЫЙ АРСЕНАЛ
     modelType: какую 3D-модель использовать
     ========================================================= */
    const WEAPON_CATALOG = {
        /* ---------- НОЖИ ---------- */
        knife:    { id:'knife', name:'НОЖ', cat:'melee', modelType:'knife_std', icon:'🔪', price:0, desc:'Стандартный нож', damage:90, cooldown:0.42, range:2.0, stats:{'УРОН':90} },
        bayonet:  { id:'bayonet', name:'БАЙОНЕТ', cat:'melee', modelType:'knife_bayo', icon:'🗡', price:200, desc:'Длинный штык', damage:110, cooldown:0.48, range:2.4, stats:{'УРОН':110} },
        karambit: { id:'karambit', name:'КЕРАМБИТ', cat:'melee', modelType:'knife_karam', icon:'🔪', price:500, desc:'Быстрый нож', damage:75, cooldown:0.28, range:1.8, stats:{'УРОН':75} },
        butterfly:{ id:'butterfly', name:'БАБОЧКА', cat:'melee', modelType:'knife_butt', icon:'🦋', price:1200, desc:'Раскладной нож', damage:85, cooldown:0.35, range:2.0, stats:{'УРОН':85} },
        m9:       { id:'m9', name:'M9 BAYONET', cat:'melee', modelType:'knife_m9', icon:'🔪', price:1500, desc:'Тактический штык', damage:120, cooldown:0.5, range:2.5, stats:{'УРОН':120} },

        /* ---------- ПИСТОЛЕТЫ ---------- */
        glock:    { id:'glock', name:'GLOCK-18', cat:'pistol', modelType:'pistol_std', icon:'🔫', price:200, desc:'Стандартный пистолет', damage:32, cooldown:0.18, magSize:20, startReserve:60, reserveMax:120, reloadTime:1.0, auto:false, spread:0.012, stats:{'УРОН':32,'МАГАЗИН':20} },
        usp:      { id:'usp', name:'USP-S', cat:'pistol', modelType:'pistol_sil', icon:'🔫', price:300, desc:'С глушителем', damage:40, cooldown:0.22, magSize:12, startReserve:48, reserveMax:96, reloadTime:1.1, auto:false, spread:0.008, stats:{'УРОН':40,'МАГАЗИН':12} },
        p250:     { id:'p250', name:'P250', cat:'pistol', modelType:'pistol_std', icon:'🔫', price:400, desc:'Сбалансированный', damage:44, cooldown:0.24, magSize:13, startReserve:52, reserveMax:104, reloadTime:1.05, auto:false, spread:0.01, stats:{'УРОН':44,'МАГАЗИН':13} },
        fiveseven:{ id:'fiveseven', name:'FIVE-SEVEN', cat:'pistol', modelType:'pistol_std', icon:'🔫', price:500, desc:'Быстрый', damage:38, cooldown:0.14, magSize:20, startReserve:60, reserveMax:120, reloadTime:1.15, auto:false, spread:0.012, stats:{'УРОН':38,'МАГАЗИН':20} },
        deagle:   { id:'deagle', name:'DESERT EAGLE', cat:'pistol', modelType:'pistol_big', icon:'🔫', price:700, desc:'Мощный', damage:95, cooldown:0.42, magSize:7, startReserve:21, reserveMax:42, reloadTime:1.5, auto:false, spread:0.022, stats:{'УРОН':95,'МАГАЗИН':7} },
        revolver: { id:'revolver', name:'R8 REVOLVER', cat:'pistol', modelType:'revolver', icon:'🎯', price:800, desc:'Револьвер один выстрел', damage:110, cooldown:0.85, magSize:8, startReserve:16, reserveMax:32, reloadTime:2.2, auto:false, spread:0.006, stats:{'УРОН':110,'МАГАЗИН':8} },
        cz75:     { id:'cz75', name:'CZ75-AUTO', cat:'pistol', modelType:'pistol_auto', icon:'🔫', price:600, desc:'Авто-пистолет', damage:26, cooldown:0.08, magSize:12, startReserve:36, reserveMax:72, reloadTime:1.4, auto:true, spread:0.03, stats:{'УРОН':26,'МАГАЗИН':12} },
        tec9:     { id:'tec9', name:'TEC-9', cat:'pistol', modelType:'pistol_auto', icon:'🔫', price:500, desc:'Быстрый автоматический', damage:28, cooldown:0.09, magSize:18, startReserve:54, reserveMax:108, reloadTime:1.3, auto:true, spread:0.035, stats:{'УРОН':28,'МАГАЗИН':18} },

        /* ---------- SMG ---------- */
        mp5:      { id:'mp5', name:'MP5', cat:'smg', modelType:'smg_std', icon:'💥', price:1500, desc:'Классический SMG', damage:30, cooldown:0.08, magSize:30, startReserve:90, reserveMax:180, reloadTime:1.5, auto:true, spread:0.022, stats:{'УРОН':30,'МАГАЗИН':30} },
        mp7:      { id:'mp7', name:'MP7', cat:'smg', modelType:'smg_std', icon:'💥', price:1700, desc:'Компактный SMG', damage:32, cooldown:0.075, magSize:30, startReserve:90, reserveMax:180, reloadTime:1.4, auto:true, spread:0.018, stats:{'УРОН':32,'МАГАЗИН':30} },
        p90:      { id:'p90', name:'P90', cat:'smg', modelType:'smg_p90', icon:'💥', price:2350, desc:'50 патронов', damage:28, cooldown:0.07, magSize:50, startReserve:100, reserveMax:200, reloadTime:2.1, auto:true, spread:0.024, stats:{'УРОН':28,'МАГАЗИН':50} },
        mac10:    { id:'mac10', name:'MAC-10', cat:'smg', modelType:'smg_small', icon:'💥', price:1050, desc:'Дешёвый быстрый', damage:26, cooldown:0.055, magSize:30, startReserve:90, reserveMax:180, reloadTime:1.6, auto:true, spread:0.038, stats:{'УРОН':26,'МАГАЗИН':30} },

        /* ---------- ВИНТОВКИ ---------- */
        ak47:     { id:'ak47', name:'AK-47', cat:'rifle', modelType:'rifle_ak', icon:'🔫', price:2700, desc:'Мощный автомат', damage:38, cooldown:0.11, magSize:30, startReserve:90, reserveMax:180, reloadTime:1.6, auto:true, spread:0.018, stats:{'УРОН':38,'МАГАЗИН':30} },
        m4a1:     { id:'m4a1', name:'M4A1', cat:'rifle', modelType:'rifle_m4', icon:'🔫', price:3100, desc:'Точный автомат', damage:33, cooldown:0.09, magSize:30, startReserve:90, reserveMax:180, reloadTime:1.5, auto:true, spread:0.014, stats:{'УРОН':33,'МАГАЗИН':30} },
        galil:    { id:'galil', name:'GALIL AR', cat:'rifle', modelType:'rifle_ak', icon:'🔫', price:1800, desc:'Дешёвый автомат', damage:32, cooldown:0.10, magSize:35, startReserve:105, reserveMax:210, reloadTime:1.7, auto:true, spread:0.024, stats:{'УРОН':32,'МАГАЗИН':35} },
        famas:    { id:'famas', name:'FAMAS', cat:'rifle', modelType:'rifle_bullpup', icon:'🔫', price:2200, desc:'Компактный быстрый', damage:30, cooldown:0.09, magSize:25, startReserve:75, reserveMax:150, reloadTime:1.6, auto:true, spread:0.02, stats:{'УРОН':30,'МАГАЗИН':25} },
        aug:      { id:'aug', name:'AUG', cat:'rifle', modelType:'rifle_bullpup', icon:'🔫', price:3300, desc:'Точный булл-пап', damage:35, cooldown:0.10, magSize:30, startReserve:90, reserveMax:180, reloadTime:1.7, auto:true, spread:0.012, stats:{'УРОН':35,'МАГАЗИН':30} },
        sg553:    { id:'sg553', name:'SG 553', cat:'rifle', modelType:'rifle_m4', icon:'🔫', price:3000, desc:'Точный штурмовой', damage:36, cooldown:0.10, magSize:30, startReserve:90, reserveMax:180, reloadTime:1.65, auto:true, spread:0.013, stats:{'УРОН':36,'МАГАЗИН':30} },

        /* ---------- СНАЙПЕРКИ ---------- */
        scout:    { id:'scout', name:'SSG 08 SCOUT', cat:'sniper', modelType:'sniper_light', icon:'🔭', price:1700, desc:'Лёгкая быстрая', damage:88, cooldown:0.9, magSize:10, startReserve:30, reserveMax:60, reloadTime:2.0, auto:false, spread:0.004, scope:true, stats:{'УРОН':88,'МАГАЗИН':10} },
        ssg08:    { id:'ssg08', name:'SSG 08', cat:'sniper', modelType:'sniper_light', icon:'🔭', price:2200, desc:'Точная в голову', damage:110, cooldown:1.1, magSize:10, startReserve:30, reserveMax:60, reloadTime:2.0, auto:false, spread:0.003, scope:true, stats:{'УРОН':110,'МАГАЗИН':10} },
        awp:      { id:'awp', name:'AWP', cat:'sniper', modelType:'sniper_heavy', icon:'🎯', price:4750, desc:'Один выстрел', damage:230, cooldown:1.35, magSize:10, startReserve:20, reserveMax:40, reloadTime:2.4, auto:false, spread:0.001, scope:true, stats:{'УРОН':230,'МАГАЗИН':10} },

        /* ---------- ДРОБОВИКИ ---------- */
        nova:     { id:'nova', name:'NOVA', cat:'shotgun', modelType:'shotgun_pump', icon:'🔥', price:1050, desc:'Дешёвый помповик', damage:22, pellets:8, cooldown:0.8, magSize:8, startReserve:32, reserveMax:64, reloadTime:2.2, auto:false, spread:0.08, stats:{'УРОН':22,'ПЕЛЛЕТЫ':8} },
        xm1014:   { id:'xm1014', name:'XM1014', cat:'shotgun', modelType:'shotgun_auto', icon:'🔥', price:2000, desc:'Авто-дробовик', damage:20, pellets:6, cooldown:0.30, magSize:7, startReserve:35, reserveMax:70, reloadTime:2.5, auto:true, spread:0.10, stats:{'УРОН':20,'ПЕЛЛЕТЫ':6} },
        mag7:     { id:'mag7', name:'MAG-7', cat:'shotgun', modelType:'shotgun_short', icon:'🔥', price:1800, desc:'Короткий мощный', damage:30, pellets:8, cooldown:0.85, magSize:5, startReserve:30, reserveMax:60, reloadTime:2.5, auto:false, spread:0.09, stats:{'УРОН':30,'ПЕЛЛЕТЫ':8} },

        /* ---------- ГРАНАТЫ ---------- */
        frag:     { id:'frag', name:'ОСКОЛОЧНАЯ', cat:'grenade', modelType:'grenade_frag', icon:'💣', price:300, desc:'Взрыв большой радиус', damage: GRENADE_MAX_DAMAGE, stats:{'РАДИУС': GRENADE_RADIUS} },
        flash:    { id:'flash', name:'СЛЕПЯЩАЯ', cat:'grenade', modelType:'grenade_flash', icon:'⚡', price:200, desc:'Ослепляет врагов', damage: 40, stats:{'РАДИУС': 6} },
        smoke:    { id:'smoke', name:'ДЫМОВАЯ', cat:'grenade', modelType:'grenade_smoke', icon:'💨', price:250, desc:'Облако дыма', damage: 0, stats:{'РАДИУС': 5} }
    };

    const CATEGORY_ITEMS = {
        melee: ['knife','bayonet','karambit','butterfly','m9'],
        pistol: ['glock','usp','p250','fiveseven','deagle','revolver','cz75','tec9'],
        smg: ['mp5','mp7','p90','mac10'],
        rifle: ['ak47','m4a1','galil','famas','aug','sg553'],
        sniper: ['scout','ssg08','awp'],
        shotgun: ['nova','xm1014','mag7'],
        grenade: ['frag','flash','smoke']
    };

    /* =========================================================
     СКИНЫ
     ========================================================= */
    const RARITY_NAMES = {
        common: 'ОБЫЧНЫЙ',
        uncommon: 'НЕОБЫЧНЫЙ',
        rare: 'РЕДКИЙ',
        epic: 'ЭПИЧЕСКИЙ',
        legendary: 'ЛЕГЕНДАРНЫЙ',
        knife: 'НОЖ-РЕДКИЙ'
    };

    // Утилита: colors как hex-числа
    const SKINS = [
        // УНИВЕРСАЛЬНЫЙ СТАНДАРТ
        { id:'default', name:'СТАНДАРТ', weapons:'*', rarity:'common',
            colors:{ primary:0x2b2f34, secondary:0x14171a, accent:0x0a0c0f }, metalness:0.85, roughness:0.45 },

        /* --- ОБЫЧНЫЕ (COMMON) --- */
        { id:'dust_storm', name:'DUST STORM', weapons:['glock','p250','ak47','m4a1','mp5','nova','usp','galil','mac10','mp7'],
            rarity:'common', colors:{ primary:0x8c7a5a, secondary:0x5a4c34, accent:0x2e2418 }, metalness:0.6, roughness:0.6 },
        { id:'forest_ddp', name:'FOREST DDPAT', weapons:['ak47','m4a1','galil','aug','mp5','sg553','famas'],
            rarity:'common', colors:{ primary:0x3a5a34, secondary:0x22361e, accent:0x121d10 }, metalness:0.55, roughness:0.7 },
        { id:'blue_steel', name:'СИНЯЯ СТАЛЬ', weapons:['glock','usp','p250','fiveseven','deagle','revolver','cz75','tec9'],
            rarity:'common', colors:{ primary:0x2a4a6a, secondary:0x1a2e44, accent:0x0e1a26 }, metalness:0.9, roughness:0.3 },
        { id:'urban_ruins', name:'УРБАН РУИНЫ', weapons:['ak47','m4a1','mp5','mp7','famas','galil'],
            rarity:'common', colors:{ primary:0x5a5a5a, secondary:0x3a3a3a, accent:0x1a1a1a }, metalness:0.7, roughness:0.6 },

        /* --- НЕОБЫЧНЫЕ (UNCOMMON) --- */
        { id:'carbon_fiber', name:'КАРБОН', weapons:['ak47','m4a1','awp','mp5','mp7','galil','aug','sg553','deagle','revolver','ssg08','scout','xm1014','mag7','nova','cz75','tec9','fiveseven','p250','glock','usp','famas'],
            rarity:'uncommon', colors:{ primary:0x1a1a1a, secondary:0x3a3a3a, accent:0xd0d0d0 }, metalness:0.85, roughness:0.35 },
        { id:'sand_dune', name:'ПЕСЧАНАЯ ДЮНА', weapons:['ak47','m4a1','p250','fiveseven','deagle','glock','nova','xm1014','mag7','scout','ssg08'],
            rarity:'uncommon', colors:{ primary:0xc9a86a, secondary:0x8a6f3f, accent:0x4a3a1a }, metalness:0.5, roughness:0.75 },
        { id:'snow_camo', name:'СНЕЖНЫЙ КАМО', weapons:['ak47','m4a1','awp','ssg08','scout','galil','famas','aug','sg553','deagle','revolver','usp'],
            rarity:'uncommon', colors:{ primary:0xe8ecf2, secondary:0x9aa5b3, accent:0x4a525c }, metalness:0.4, roughness:0.8 },
        { id:'military_grade', name:'ВОЕННЫЙ', weapons:['ak47','m4a1','mp5','mp7','galil','famas','aug','sg553','glock','p250','usp','fiveseven','deagle','nova','xm1014','mag7','scout','ssg08','mac10'],
            rarity:'uncommon', colors:{ primary:0x4a5a3a, secondary:0x2e3a1e, accent:0x1a2414 }, metalness:0.65, roughness:0.55 },

        /* --- РЕДКИЕ (RARE) --- */
        { id:'neon_rider', name:'NEON RIDER', weapons:['ak47','m4a1','mp5','mp7','galil','famas','aug','sg553','deagle','revolver','glock','usp','p250','fiveseven','cz75','tec9','mac10','p90','scout','ssg08','awp','nova','xm1014','mag7'],
            rarity:'rare', colors:{ primary:0x2a1a4a, secondary:0xff1493, accent:0x00e0ff }, metalness:0.7, roughness:0.35 },
        { id:'cyrex', name:'CYREX', weapons:['m4a1','ak47','glock','p250','fiveseven','deagle','mp5','mp7','galil','famas','aug','sg553'],
            rarity:'rare', colors:{ primary:0xffffff, secondary:0xd22a2a, accent:0x1a1a1a }, metalness:0.75, roughness:0.4 },
        { id:'blood_tiger', name:'КРОВАВЫЙ ТИГР', weapons:['ak47','m4a1','deagle','glock','p250','usp','fiveseven','revolver'],
            rarity:'rare', colors:{ primary:0xcc2222, secondary:0x1a1a1a, accent:0xffffff }, metalness:0.8, roughness:0.35 },
        { id:'hyper_beast', name:'ГИПЕР-ЗВЕРЬ', weapons:['ak47','m4a1','awp','mp5','mp7','glock','deagle','ssg08','scout','aug','sg553','galil','famas'],
            rarity:'rare', colors:{ primary:0xff6b20, secondary:0x1a0a2a, accent:0xffe066 }, metalness:0.85, roughness:0.3 },

        /* --- ЭПИЧЕСКИЕ (EPIC) --- */
        { id:'fire_serpent', name:'ОГНЕННЫЙ ЗМЕЙ', weapons:['ak47','glock','deagle','m4a1','awp','mp5','p90'],
            rarity:'epic', colors:{ primary:0xffcc33, secondary:0xff4400, accent:0x1a0a00 }, metalness:0.85, roughness:0.25 },
        { id:'dragon_lore', name:'DRAGON LORE', weapons:['awp','m4a1','ak47','deagle','glock','mp7','ssg08'],
            rarity:'epic', colors:{ primary:0xffea80, secondary:0x1a4f2e, accent:0xcfa830 }, metalness:0.9, roughness:0.2 },
        { id:'asiimov', name:'ASIimov', weapons:['awp','ak47','m4a1','p90','mp5','glock','p250','fiveseven','deagle','scout','ssg08','aug','sg553','famas','galil','mp7','mac10','nova','xm1014','mag7','usp','revolver','cz75','tec9'],
            rarity:'epic', colors:{ primary:0xff6b20, secondary:0xffffff, accent:0x1a1a1a }, metalness:0.8, roughness:0.35 },
        { id:'printstream', name:'PRINTSTREAM', weapons:['m4a1','ak47','deagle','usp','glock','mp5','mp7','p90','awp','ssg08','scout','aug','sg553','galil','famas','mac10','nova','xm1014','mag7','revolver','cz75','tec9','p250','fiveseven'],
            rarity:'epic', colors:{ primary:0xf0f0f0, secondary:0x2a2a2a, accent:0x1a1a1a }, metalness:0.7, roughness:0.3 },

        /* --- ЛЕГЕНДАРНЫЕ (LEGENDARY) --- */
        { id:'doppler_ruby', name:'DOPPLER РУБИН', weapons:['knife','bayonet','karambit','butterfly','m9','awp','ak47','m4a1','deagle'],
            rarity:'legendary', colors:{ primary:0x8a0e1a, secondary:0x2a0008, accent:0xff4060 }, metalness:0.95, roughness:0.15 },
        { id:'doppler_sapphire', name:'DOPPLER САПФИР', weapons:['knife','bayonet','karambit','butterfly','m9','awp','ak47','m4a1','deagle'],
            rarity:'legendary', colors:{ primary:0x0e3a8a, secondary:0x001030, accent:0x40a0ff }, metalness:0.95, roughness:0.15 },
        { id:'case_hardened', name:'CASE HARDENED', weapons:['knife','bayonet','karambit','butterfly','m9','ak47','glock','deagle','m4a1'],
            rarity:'legendary', colors:{ primary:0x2a3a6a, secondary:0x0e1a3a, accent:0xffcc33 }, metalness:0.9, roughness:0.2 },
        { id:'gamma_emerald', name:'GAMMA ИЗУМРУД', weapons:['knife','bayonet','karambit','butterfly','m9','ak47','m4a1','awp','deagle','glock'],
            rarity:'legendary', colors:{ primary:0x1a5a2a, secondary:0x08201a, accent:0x33ff88 }, metalness:0.95, roughness:0.15 },

        /* --- НОЖИ-РЕДКИЕ (особые) --- */
        { id:'fade', name:'FADE', weapons:['knife','bayonet','karambit','butterfly','m9'],
            rarity:'knife', colors:{ primary:0xffb347, secondary:0xff3080, accent:0xc0e0ff }, metalness:0.95, roughness:0.12 },
        { id:'marble_fade', name:'MARBLE FADE', weapons:['knife','bayonet','karambit','butterfly','m9'],
            rarity:'knife', colors:{ primary:0xd22a2a, secondary:0x1a3080, accent:0xffcc33 }, metalness:0.95, roughness:0.12 },
        { id:'tiger_tooth', name:'TIGER TOOTH', weapons:['knife','bayonet','karambit','butterfly','m9'],
            rarity:'knife', colors:{ primary:0xffaa00, secondary:0x1a1a1a, accent:0xffcc33 }, metalness:0.95, roughness:0.15 },
        { id:'bright_water', name:'BRIGHT WATER', weapons:['knife','bayonet','karambit','butterfly','m9','glock','usp','p250','fiveseven','deagle','m4a1','ak47','awp','mp5','mp7','p90','scout','ssg08','nova','xm1014','mag7','galil','famas','aug','sg553','mac10','revolver','cz75','tec9'],
            rarity:'knife', colors:{ primary:0x1a4a6a, secondary:0x40b0e0, accent:0xc0e8ff }, metalness:0.9, roughness:0.2 }
    ];

    const SKINS_BY_ID = {};
    SKINS.forEach(function (s) { SKINS_BY_ID[s.id] = s; });

    function getSkinsForWeapon(weaponId) {
        const w = WEAPON_CATALOG[weaponId];
        if (!w) return [];
        const cat = w.cat;
        return SKINS.filter(function (s) {
            if (s.weapons === '*') return true;
            if (Array.isArray(s.weapons)) return s.weapons.indexOf(weaponId) >= 0;
            return false;
        });
    }

    /* =========================================================
     КЕЙСЫ
     ========================================================= */
    const CASES = [
        { id:'case_basic', name:'БАЗОВЫЙ КЕЙС', icon:'📦', price:1200,
            desc:'Обычные и необычные скины',
            pool: ['dust_storm','forest_ddp','blue_steel','urban_ruins','carbon_fiber','sand_dune','snow_camo','military_grade'] },
        { id:'case_prime', name:'ПРАЙМ-КЕЙС', icon:'💼', price:3500,
            desc:'Редкие и эпические скины',
            pool: ['neon_rider','cyrex','blood_tiger','hyper_beast','fire_serpent','dragon_lore','asiimov','printstream','carbon_fiber','military_grade'] },
        { id:'case_premium', name:'ПРЕМИУМ-КЕЙС', icon:'🎁', price:7000,
            desc:'Эпические и легендарные скины',
            pool: ['fire_serpent','dragon_lore','asiimov','printstream','doppler_ruby','doppler_sapphire','case_hardened','gamma_emerald','hyper_beast','blood_tiger'] },
        { id:'case_knife', name:'НОЖ-КЕЙС', icon:'🗡', price:15000,
            desc:'Только ножи-редкие скины',
            pool: ['fade','marble_fade','tiger_tooth','bright_water','doppler_ruby','doppler_sapphire','case_hardened','gamma_emerald'] }
    ];

    /* =========================================================
     ИГРОК И СОСТОЯНИЕ
     ========================================================= */
    const player = {
        x: 5.5, z: 5.5, angle: 0, pitch: 0,
        footZ: 0, vz: 0, onGround: true, crouching: false,
        hp: 100, maxHp: 100,
        score: 0,
        money: START_MONEY,
        earnedThisGame: 0,
        currentWeaponId: 'knife',
        lastMelee: 'knife', lastPistol: 'glock', lastRifle: null,
        lastSmg: null, lastSniper: null, lastShotgun: null,
        ownedWeapons: { knife: true, glock: true },
        ownedSkins: { default: true },
        equippedSkins: { },   // weaponId -> skinId
        grenades: 0,
        grenadeType: 'frag',
        weapons: {},
        reloading: false, reloadTimer: 0, reloadDuration: 1.4,
        fireCooldown: 0, recoil: 0,
        switching: false, switchTimer: 0, switchTargetId: null,
        weaponLower: 0, meleeAnim: 0, scoped: false,
        bobPhase: 0, bobAmount: 0, breathPhase: 0,
        weaponSway: { x: 0, y: 0 },
        muzzleFlashTimer: 0
    };

    const state = {
        running: false, paused: false, gameOver: false,
        wave: 1, betweenWaves: false, waveTimer: 0, time: 0,
        shopOpenFromPause: false,
        openingCase: null,
        caseAnimating: false
    };

    /* =========================================================
     СОХРАНЕНИЕ / ЗАГРУЗКА
     ========================================================= */
    function saveInventory() {
        try {
            const data = {
                money: player.money,
                ownedWeapons: player.ownedWeapons,
                ownedSkins: player.ownedSkins,
                equippedSkins: player.equippedSkins
            };
            localStorage.setItem(INVENTORY_KEY, JSON.stringify(data));
        } catch (e) {}
    }
    function loadInventory() {
        try {
            const raw = localStorage.getItem(INVENTORY_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (data.money != null) player.money = data.money;
            if (data.ownedWeapons) {
                // Проверяем, что все оружия существуют в каталоге
                for (const id in data.ownedWeapons) {
                    if (WEAPON_CATALOG[id]) player.ownedWeapons[id] = true;
                }
            }
            if (data.ownedSkins) {
                for (const id in data.ownedSkins) {
                    if (SKINS_BY_ID[id]) player.ownedSkins[id] = true;
                }
            }
            if (data.equippedSkins) {
                for (const w in data.equippedSkins) {
                    const sId = data.equippedSkins[w];
                    if (SKINS_BY_ID[sId] && WEAPON_CATALOG[w]) player.equippedSkins[w] = sId;
                }
            }
        } catch (e) {}
    }

    /* =========================================================
     МИР (карты)
     ========================================================= */
    const world = new Uint8Array(MAP_W * MAP_H);
    function at(x, y) {
        if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return 1;
        return world[y * MAP_W + x];
    }
    function setRect(x, y, w, h, v) {
        for (let j = y; j < y + h; j++)
            for (let i = x; i < x + w; i++)
                if (i >= 0 && j >= 0 && i < MAP_W && j < MAP_H) world[j * MAP_W + i] = v;
    }
    function paintBorder(t) {
        setRect(0, 0, MAP_W, 1, t); setRect(0, MAP_H - 1, MAP_W, 1, t);
        setRect(0, 0, 1, MAP_H, t); setRect(MAP_W - 1, 0, 1, MAP_H, t);
    }

    function buildDust() {
        world.fill(0); paintBorder(2);
        setRect(3,3,8,1,2); setRect(3,3,1,8,2); setRect(10,3,1,8,2); setRect(3,10,8,1,2); setRect(6,10,2,1,0);
        setRect(29,3,8,1,2); setRect(29,3,1,8,2); setRect(36,3,1,8,2); setRect(29,10,8,1,2); setRect(32,10,2,1,0);
        setRect(3,29,8,1,2); setRect(3,29,1,8,2); setRect(10,29,1,8,2); setRect(3,36,8,1,2); setRect(6,29,2,1,0);
        setRect(29,29,8,1,2); setRect(29,29,1,8,2); setRect(36,29,1,8,2); setRect(29,36,8,1,2); setRect(32,29,2,1,0);
        setRect(16,16,8,1,1); setRect(16,23,8,1,1); setRect(16,16,1,8,1); setRect(23,16,1,8,1);
        setRect(19,19,2,2,3);
        setRect(2,16,1,8,3); setRect(3,16,6,1,3); setRect(3,23,6,1,3);
        setRect(37,16,1,8,3); setRect(31,16,6,1,3); setRect(31,23,6,1,3);
        setRect(16,2,8,1,3); setRect(16,3,1,6,3); setRect(23,3,1,6,3);
        setRect(16,37,8,1,3); setRect(16,31,1,6,3); setRect(23,31,1,6,3);
        const pil=[[14,6],[25,6],[14,33],[25,33],[6,14],[6,25],[33,14],[33,25],[14,14],[25,14],[14,25],[25,25]];
        for (let i=0;i<pil.length;i++) setRect(pil[i][0],pil[i][1],1,1,1);
    }
    function buildWarehouse() {
        world.fill(0); paintBorder(3);
        const ch=[[4,5,10,2],[4,10,10,2],[26,5,10,2],[26,10,10,2],[4,28,10,2],[4,33,10,2],[26,28,10,2],[26,33,10,2]];
        for (let i=0;i<ch.length;i++) setRect(ch[i][0],ch[i][1],ch[i][2],ch[i][3],3);
        const cv=[[16,4,2,8],[22,4,2,8],[16,28,2,8],[22,28,2,8],[4,16,8,2],[28,16,8,2],[4,22,8,2],[28,22,8,2]];
        for (let i=0;i<cv.length;i++) setRect(cv[i][0],cv[i][1],cv[i][2],cv[i][3],3);
        setRect(16,16,8,1,1); setRect(16,16,1,8,1); setRect(23,16,1,8,1); setRect(16,23,8,1,1);
        setRect(19,16,2,1,0); setRect(19,23,2,1,0);
        const cols=[[13,13],[26,13],[13,26],[26,26],[10,20],[29,20],[20,10],[20,29]];
        for (let i=0;i<cols.length;i++) setRect(cols[i][0],cols[i][1],1,1,1);
        setRect(10,14,3,1,2); setRect(27,14,3,1,2); setRect(10,25,3,1,2); setRect(27,25,3,1,2);
    }
    function buildOffice() {
        world.fill(0); paintBorder(1);
        setRect(4,4,10,1,1); setRect(4,4,1,8,1); setRect(13,4,1,8,1); setRect(4,11,10,1,1); setRect(8,11,2,1,0);
        setRect(22,4,10,1,1); setRect(22,4,1,8,1); setRect(31,4,1,8,1); setRect(22,11,10,1,1); setRect(26,11,2,1,0);
        setRect(4,16,1,8,1); setRect(4,16,32,1,1); setRect(35,16,1,8,1); setRect(4,23,32,1,1);
        setRect(8,16,2,1,0); setRect(18,16,2,1,0); setRect(30,16,2,1,0);
        setRect(12,23,2,1,0); setRect(24,23,2,1,0);
        setRect(10,18,1,4,3); setRect(17,18,1,4,3); setRect(22,18,1,4,3); setRect(29,18,1,4,3);
        setRect(4,28,10,1,1); setRect(4,28,1,8,1); setRect(13,28,1,8,1); setRect(4,35,10,1,1); setRect(8,28,2,1,0);
        setRect(22,28,10,1,1); setRect(22,28,1,8,1); setRect(31,28,1,8,1); setRect(22,35,10,1,1); setRect(26,28,2,1,0);
    }
    function buildArena() {
        world.fill(0); paintBorder(1);
        setRect(16,16,8,1,2); setRect(16,23,8,1,2); setRect(16,16,1,8,2); setRect(23,16,1,8,2);
        setRect(19,16,2,1,0); setRect(19,23,2,1,0); setRect(16,19,1,2,0); setRect(23,19,1,2,0);
        setRect(19,19,2,2,3);
        setRect(6,6,6,1,2); setRect(6,6,1,6,2); setRect(11,6,1,6,2); setRect(6,11,6,1,2); setRect(8,11,2,1,0);
        setRect(28,6,6,1,2); setRect(28,6,1,6,2); setRect(33,6,1,6,2); setRect(28,11,6,1,2); setRect(30,11,2,1,0);
        setRect(6,28,6,1,2); setRect(6,28,1,6,2); setRect(11,28,1,6,2); setRect(6,33,6,1,2); setRect(8,28,2,1,0);
        setRect(28,28,6,1,2); setRect(28,28,1,6,2); setRect(33,28,1,6,2); setRect(28,33,6,1,2); setRect(30,28,2,1,0);
        setRect(13,18,1,4,3); setRect(26,18,1,4,3); setRect(18,13,4,1,3); setRect(18,26,4,1,3);
    }
    function buildYard() {
        world.fill(0); paintBorder(1);
        setRect(6,6,8,8,1); setRect(26,6,8,8,1); setRect(16,16,8,8,1);
        setRect(6,26,8,8,1); setRect(26,26,8,8,1);
        setRect(9,6,2,8,0); setRect(29,6,2,8,0); setRect(19,16,2,8,0);
        setRect(9,26,2,8,0); setRect(29,26,2,8,0);
        const pil=[[14,14],[25,14],[14,25],[25,25],[4,4],[35,4],[4,35],[35,35]];
        for (let i=0;i<pil.length;i++) setRect(pil[i][0],pil[i][1],1,1,3);
    }

    const MAP_LIST = [
        { id:'dust', name:'DUST', desc:'Пустынная крепость', outdoor:true,
            build: buildDust, start: { x: 5.5, y: 5.5, angle: 0 },
            mpSpawns: [ {x:5.5,y:5.5,angle:0}, {x:34.5,y:34.5,angle:Math.PI}, {x:6.5,y:6.5,angle:0}, {x:33.5,y:33.5,angle:Math.PI} ] },
        { id:'warehouse', name:'СКЛАД', desc:'Промышленный комплекс',
            build: buildWarehouse, start: { x: 2.5, y: 20.5, angle: 0 },
            mpSpawns: [ {x:2.5,y:20.5,angle:0}, {x:37.5,y:20.5,angle:Math.PI}, {x:2.5,y:22.5,angle:0}, {x:37.5,y:22.5,angle:Math.PI} ] },
        { id:'office', name:'ОФИС', desc:'Бетонные коридоры',
            build: buildOffice, start: { x: 2.5, y: 20.5, angle: 0 },
            mpSpawns: [ {x:2.5,y:20.5,angle:0}, {x:37.5,y:20.5,angle:Math.PI}, {x:2.5,y:18.5,angle:0}, {x:37.5,y:22.5,angle:Math.PI} ] },
        { id:'arena', name:'АРЕНА', desc:'Симметричная зона',
            build: buildArena, start: { x: 20.5, y: 36.5, angle: -Math.PI/2 },
            mpSpawns: [ {x:20.5,y:36.5,angle:-Math.PI/2}, {x:20.5,y:3.5,angle:Math.PI/2}, {x:22.5,y:36.5,angle:-Math.PI/2}, {x:18.5,y:3.5,angle:Math.PI/2} ] },
        { id:'yard', name:'ДВОР', desc:'Открытое поле боя', outdoor:true,
            build: buildYard, start: { x: 20.5, y: 2.5, angle: Math.PI/2 },
            mpSpawns: [ {x:20.5,y:2.5,angle:Math.PI/2}, {x:20.5,y:37.5,angle:-Math.PI/2}, {x:2.5,y:20.5,angle:0}, {x:37.5,y:20.5,angle:Math.PI} ] }
    ];

    let selectedMapIdx = 0;
    let selectedMode = 'single';

    function loadPrefs() {
        try {
            const s = localStorage.getItem(MAP_KEY);
            if (s !== null) {
                const i = parseInt(s, 10);
                if (i >= 0 && i < MAP_LIST.length) selectedMapIdx = i;
            }
        } catch (e) {}
    }
    function savePrefs() { try { localStorage.setItem(MAP_KEY, String(selectedMapIdx)); } catch (e) {} }

    /* =========================================================
     THREE.JS
     ========================================================= */
    const canvas = document.getElementById('game');
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isMobile,
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false
    });
    const maxPixelRatio = isLowEnd ? 1.0 : (isMobile ? 1.35 : 2.0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    renderer.shadowMap.enabled = !isMobile && !isLowEnd;
    if (renderer.shadowMap.enabled) renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.06, 150);
    camera.rotation.order = 'YXZ';

    const ambient = new THREE.AmbientLight(0x99a5b5, isMobile ? 0.85 : 0.55);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff2d0, isMobile ? 0.85 : 1.1);
    sun.position.set(30, 50, 20);
    if (renderer.shadowMap.enabled) {
        sun.castShadow = true;
        sun.shadow.mapSize.set(isLowEnd ? 512 : 1024, isLowEnd ? 512 : 1024);
        sun.shadow.camera.left = -30;
        sun.shadow.camera.right = 30;
        sun.shadow.camera.top = 30;
        sun.shadow.camera.bottom = -30;
        sun.shadow.camera.far = 100;
    }
    scene.add(sun);

    const muzzleLight = new THREE.PointLight(0xffaa44, 0, 8, 2);
    scene.add(muzzleLight);

    const playerLight = new THREE.PointLight(0xffffff, isMobile ? 0.2 : 0.3, 10, 2);
    scene.add(playerLight);

    /* =========================================================
     ТЕКСТУРЫ МИРА
     ========================================================= */
    const TEX_SIZE = isMobile ? 64 : 128;

    function makeCanvas(size) {
        const c = document.createElement('canvas');
        c.width = size; c.height = size;
        return c;
    }
    function addNoise(g, size, amount, seed) {
        const img = g.getImageData(0, 0, size, size);
        const d = img.data;
        let s = seed || 1;
        for (let i = 0; i < d.length; i += 4) {
            s = (s * 1664525 + 1013904223) & 0xffffffff;
            const r = ((s >>> 16) & 0xff) / 255 - 0.5;
            const n = r * amount;
            d[i]   = Math.max(0, Math.min(255, d[i] + n));
            d[i+1] = Math.max(0, Math.min(255, d[i+1] + n));
            d[i+2] = Math.max(0, Math.min(255, d[i+2] + n));
        }
        g.putImageData(img, 0, 0);
    }
    function paintConcrete(g, s) {
        g.fillStyle = '#909599'; g.fillRect(0, 0, s, s);
        for (let i = 0; i < 18; i++) {
            const cx = Math.random() * s, cy = Math.random() * s;
            const r = 6 + Math.random() * 20;
            const grd = g.createRadialGradient(cx, cy, 0, cx, cy, r);
            const v = Math.random() > 0.5 ? 255 : 0;
            grd.addColorStop(0, 'rgba('+v+','+v+','+v+',0.07)');
            grd.addColorStop(1, 'rgba('+v+','+v+','+v+',0)');
            g.fillStyle = grd; g.fillRect(cx-r, cy-r, r*2, r*2);
        }
        g.strokeStyle = 'rgba(35,40,46,0.8)'; g.lineWidth = 2;
        g.beginPath();
        g.moveTo(0, s/2 + 1); g.lineTo(s, s/2 + 1);
        g.moveTo(s/2 + 1, 0); g.lineTo(s/2 + 1, s);
        g.stroke();
        addNoise(g, s, 40, 7);
    }
    function paintBrick(g, s) {
        g.fillStyle = '#4f4740'; g.fillRect(0, 0, s, s);
        addNoise(g, s, 22, 11);
        const bh = 12, bw = 26;
        for (let row = 0, y = 0; y < s; y += bh, row++) {
            const offset = (row % 2) ? bw / 2 : 0;
            for (let x = -bw; x < s + bw; x += bw) {
                const bx = x + offset + 2, by = y + 2;
                const w = bw - 4, h = bh - 4;
                const t = Math.random();
                const rBase = 130 + t * 55;
                const gBase = rBase * 0.42 + Math.random() * 10;
                const bBase = rBase * 0.32 + Math.random() * 8;
                g.fillStyle = 'rgb('+(rBase|0)+','+(gBase|0)+','+(bBase|0)+')';
                g.fillRect(bx, by, w, h);
                g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(bx, by + h - 1, w, 1);
            }
        }
        addNoise(g, s, 20, 13);
    }
    function paintMetal(g, s) {
        const grd = g.createLinearGradient(0, 0, 0, s);
        grd.addColorStop(0, '#5a6878'); grd.addColorStop(0.4, '#3d4a56');
        grd.addColorStop(0.7, '#2c3742'); grd.addColorStop(1, '#1c2630');
        g.fillStyle = grd; g.fillRect(0, 0, s, s);
        for (let y = 0; y < s; y += 8) {
            g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(0, y, s, 1);
            g.fillStyle = 'rgba(180,210,240,0.1)'; g.fillRect(0, y + 1, s, 1);
        }
        addNoise(g, s, 14, 3);
    }
    function paintFloor(g, s) {
        g.fillStyle = '#4c5058'; g.fillRect(0, 0, s, s);
        addNoise(g, s, 50, 19);
        g.strokeStyle = 'rgba(18,20,24,0.9)'; g.lineWidth = 2;
        g.beginPath();
        g.moveTo(0, 1); g.lineTo(s, 1);
        g.moveTo(0, s/2 + 1); g.lineTo(s, s/2 + 1);
        g.moveTo(1, 0); g.lineTo(1, s);
        g.moveTo(s/2 + 1, 0); g.lineTo(s/2 + 1, s);
        g.stroke();
    }
    function paintGrass(g, s) {
        g.fillStyle = '#5a6b3a'; g.fillRect(0, 0, s, s);
        for (let i = 0; i < 400; i++) {
            const x = Math.random() * s, y = Math.random() * s;
            const len = 2 + Math.random() * 4;
            const c = 60 + Math.random() * 90;
            g.strokeStyle = 'rgba('+(c*0.6|0)+','+(c|0)+','+(c*0.35|0)+',0.75)';
            g.lineWidth = 1;
            g.beginPath();
            g.moveTo(x, y);
            g.lineTo(x + (Math.random()-0.5)*2, y - len);
            g.stroke();
        }
        addNoise(g, s, 22, 3);
    }
    function paintCeiling(g, s) {
        const grd = g.createLinearGradient(0, 0, 0, s);
        grd.addColorStop(0, '#2a323b'); grd.addColorStop(0.5, '#1a2028'); grd.addColorStop(1, '#0e1319');
        g.fillStyle = grd; g.fillRect(0, 0, s, s);
        g.strokeStyle = 'rgba(8,10,14,0.95)'; g.lineWidth = 1.5;
        g.beginPath();
        for (let i = 1; i < 4; i++) {
            g.moveTo(0, i*s/4); g.lineTo(s, i*s/4);
            g.moveTo(i*s/4, 0); g.lineTo(i*s/4, s);
        }
        g.stroke();
    }
    function paintSky(g, s) {
        const grd = g.createLinearGradient(0, 0, 0, s);
        grd.addColorStop(0, '#3a72b0');
        grd.addColorStop(0.5, '#7ba8d4');
        grd.addColorStop(0.85, '#d8e5f0');
        grd.addColorStop(1, '#e8ecf2');
        g.fillStyle = grd; g.fillRect(0, 0, s, s);
        for (let i = 0; i < 14; i++) {
            const cx = Math.random() * s, cy = Math.random() * s * 0.6;
            const r = 8 + Math.random() * 22;
            const rg = g.createRadialGradient(cx, cy, 0, cx, cy, r);
            rg.addColorStop(0, 'rgba(255,255,255,0.5)');
            rg.addColorStop(1, 'rgba(255,255,255,0)');
            g.fillStyle = rg; g.fillRect(cx-r, cy-r, r*2, r*2);
        }
    }
    function makeTexture(paintFn, size) {
        size = size || TEX_SIZE;
        const c = makeCanvas(size);
        paintFn(c.getContext('2d'), size);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = isMobile ? 1 : 4;
        return t;
    }

    let texConcrete, texBrick, texMetal, texFloor, texCeil, texGrass, texSky;

    function buildTextures() {
        texConcrete = makeTexture(paintConcrete);
        texBrick    = makeTexture(paintBrick);
        texMetal    = makeTexture(paintMetal);
        texFloor    = makeTexture(paintFloor);
        texCeil     = makeTexture(paintCeiling);
        texGrass    = makeTexture(paintGrass);
        texSky      = makeTexture(paintSky, 256);
        texFloor.wrapS = texFloor.wrapT = THREE.RepeatWrapping;
        texCeil.wrapS = texCeil.wrapT = THREE.RepeatWrapping;
        texGrass.wrapS = texGrass.wrapT = THREE.RepeatWrapping;
        texFloor.repeat.set(20, 20);
        texCeil.repeat.set(20, 20);
        texGrass.repeat.set(20, 20);
    }

    /* =========================================================
     МИР В 3D
     ========================================================= */
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    function clearWorld() {
        while (worldGroup.children.length) {
            const child = worldGroup.children.pop();
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                else child.material.dispose();
            }
        }
    }

    function buildWorldFromMap() {
        clearWorld();
        const mapDef = MAP_LIST[selectedMapIdx];

        const instances = { 1: [], 2: [], 3: [] };
        for (let y = 0; y < MAP_H; y++) {
            for (let x = 0; x < MAP_W; x++) {
                const v = world[y * MAP_W + x];
                if (v > 0) instances[v].push({ x, y });
            }
        }

        const matWall1 = isMobile
            ? new THREE.MeshLambertMaterial({ map: texConcrete })
            : new THREE.MeshStandardMaterial({ map: texConcrete, roughness: 0.9, metalness: 0.05 });
        const matWall2 = isMobile
            ? new THREE.MeshLambertMaterial({ map: texBrick })
            : new THREE.MeshStandardMaterial({ map: texBrick, roughness: 0.95, metalness: 0.03 });
        const matWall3 = isMobile
            ? new THREE.MeshLambertMaterial({ map: texMetal })
            : new THREE.MeshStandardMaterial({ map: texMetal, roughness: 0.55, metalness: 0.7 });
        const wallMats = { 1: matWall1, 2: matWall2, 3: matWall3 };

        const boxGeo = new THREE.BoxGeometry(WALL_SIZE, WALL_HEIGHT, WALL_SIZE);
        const m4 = new THREE.Matrix4();
        for (let t = 1; t <= 3; t++) {
            const list = instances[t];
            if (list.length === 0) continue;
            const mesh = new THREE.InstancedMesh(boxGeo, wallMats[t], list.length);
            if (renderer.shadowMap.enabled) { mesh.castShadow = true; mesh.receiveShadow = true; }
            for (let i = 0; i < list.length; i++) {
                m4.makeTranslation(list[i].x + 0.5, WALL_HEIGHT/2, list[i].y + 0.5);
                mesh.setMatrixAt(i, m4);
            }
            mesh.instanceMatrix.needsUpdate = true;
            worldGroup.add(mesh);
        }

        const floorGeo = new THREE.PlaneGeometry(MAP_W, MAP_H);
        floorGeo.rotateX(-Math.PI/2);
        const floorMat = isMobile
            ? new THREE.MeshLambertMaterial({ map: mapDef.outdoor ? texGrass : texFloor })
            : new THREE.MeshStandardMaterial({ map: mapDef.outdoor ? texGrass : texFloor, roughness: 1, metalness: 0 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.position.set(MAP_W/2, 0, MAP_H/2);
        if (renderer.shadowMap.enabled) floor.receiveShadow = true;
        worldGroup.add(floor);

        if (!mapDef.outdoor) {
            const ceilGeo = new THREE.PlaneGeometry(MAP_W, MAP_H);
            ceilGeo.rotateX(Math.PI/2);
            const ceilMat = isMobile
                ? new THREE.MeshLambertMaterial({ map: texCeil })
                : new THREE.MeshStandardMaterial({ map: texCeil, roughness: 0.95 });
            const ceil = new THREE.Mesh(ceilGeo, ceilMat);
            ceil.position.set(MAP_W/2, WALL_HEIGHT, MAP_H/2);
            worldGroup.add(ceil);
            scene.background = new THREE.Color(0x0a0d12);
            scene.fog = new THREE.Fog(0x0a0d12, 8, 40);
            sun.intensity = isMobile ? 0.4 : 0.5;
            ambient.intensity = isMobile ? 0.9 : 0.6;
        } else {
            const skyGeo = new THREE.SphereGeometry(80, isMobile ? 16 : 24, isMobile ? 8 : 12);
            const skyMat = new THREE.MeshBasicMaterial({ map: texSky, side: THREE.BackSide, fog: false });
            const sky = new THREE.Mesh(skyGeo, skyMat);
            sky.position.set(MAP_W/2, 0, MAP_H/2);
            worldGroup.add(sky);
            scene.background = null;
            scene.fog = new THREE.Fog(0xb8c6d8, 12, 50);
            sun.intensity = isMobile ? 0.95 : 1.15;
            ambient.intensity = isMobile ? 0.85 : 0.65;
        }

        if (renderer.shadowMap.enabled) {
            sun.position.set(MAP_W/2 + 25, 45, MAP_H/2 + 15);
            sun.target.position.set(MAP_W/2, 0, MAP_H/2);
            scene.add(sun.target);
        }
    }

    /* =========================================================
     МОДЕЛЬ СОЛДАТА
     ========================================================= */
    const TEAM_PALETTE = [
        { torso: 0x3a4830, dark: 0x1f2a1a, leg: 0x364a2d, helmet: 0x2a3820, visor: 0x8cff99, skin: 0xcfa070, weapon: 0x141414 },
        { torso: 0x5a3636, dark: 0x2e1c1c, leg: 0x4d2828, helmet: 0x3a2020, visor: 0xff7a7a, skin: 0xcfa070, weapon: 0x1a1414 }
    ];
    const GEO_SOLDIER = {
        torso:  new THREE.BoxGeometry(0.55, 0.7, 0.32),
        head:   new THREE.BoxGeometry(0.28, 0.32, 0.28),
        helmet: new THREE.BoxGeometry(0.34, 0.16, 0.34),
        arm:    new THREE.BoxGeometry(0.15, 0.6, 0.15),
        leg:    new THREE.BoxGeometry(0.18, 0.75, 0.18),
        boot:   new THREE.BoxGeometry(0.2, 0.14, 0.24),
        gun:    new THREE.BoxGeometry(0.09, 0.09, 0.7),
        muzzle: new THREE.BoxGeometry(0.04, 0.04, 0.14),
        mag:    new THREE.BoxGeometry(0.06, 0.2, 0.12)
    };

    function createSoldier(team) {
        const pal = TEAM_PALETTE[team] || TEAM_PALETTE[0];
        const M = isMobile ? THREE.MeshLambertMaterial : THREE.MeshStandardMaterial;
        const matBody = new M({ color: pal.torso, ...(isMobile ? {} : { roughness: 0.85 }) });
        const matDark = new M({ color: pal.dark, ...(isMobile ? {} : { roughness: 0.9 }) });
        const matLeg  = new M({ color: pal.leg, ...(isMobile ? {} : { roughness: 0.9 }) });
        const matHelm = new M({ color: pal.helmet, ...(isMobile ? {} : { roughness: 0.7, metalness: 0.3 }) });
        const matSkin = new M({ color: pal.skin, ...(isMobile ? {} : { roughness: 0.75 }) });
        const matVisor = new THREE.MeshBasicMaterial({ color: pal.visor });
        const matGun = new M({ color: pal.weapon, ...(isMobile ? {} : { roughness: 0.5, metalness: 0.6 }) });
        const matBoot = new M({ color: 0x0a0a0a, ...(isMobile ? {} : { roughness: 0.85 }) });

        const g = new THREE.Group();
        const torso = new THREE.Mesh(GEO_SOLDIER.torso, matBody);
        torso.position.y = 1.05;
        if (renderer.shadowMap.enabled) torso.castShadow = true;
        g.add(torso);

        const vest = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.5, 0.35), matDark);
        vest.position.y = 1.05;
        g.add(vest);

        const head = new THREE.Mesh(GEO_SOLDIER.head, matSkin);
        head.position.y = 1.6;
        if (renderer.shadowMap.enabled) head.castShadow = true;
        g.add(head);

        const helmet = new THREE.Mesh(GEO_SOLDIER.helmet, matHelm);
        helmet.position.y = 1.75;
        g.add(helmet);

        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.02), matVisor);
        visor.position.set(0, 1.62, -0.14);
        g.add(visor);

        const armL = new THREE.Mesh(GEO_SOLDIER.arm, matBody);
        armL.position.set(-0.36, 1.05, 0);
        g.add(armL);
        const armR = new THREE.Mesh(GEO_SOLDIER.arm, matBody);
        armR.position.set(0.36, 1.05, 0);
        g.add(armR);

        const legL = new THREE.Mesh(GEO_SOLDIER.leg, matLeg);
        legL.position.set(-0.15, 0.375, 0);
        if (renderer.shadowMap.enabled) legL.castShadow = true;
        g.add(legL);
        const legR = new THREE.Mesh(GEO_SOLDIER.leg, matLeg);
        legR.position.set(0.15, 0.375, 0);
        if (renderer.shadowMap.enabled) legR.castShadow = true;
        g.add(legR);

        const bootL = new THREE.Mesh(GEO_SOLDIER.boot, matBoot);
        bootL.position.set(0, -0.42, -0.03);
        legL.add(bootL);
        const bootR = new THREE.Mesh(GEO_SOLDIER.boot, matBoot);
        bootR.position.set(0, -0.42, -0.03);
        legR.add(bootR);

        const gunGroup = new THREE.Group();
        const gunBody = new THREE.Mesh(GEO_SOLDIER.gun, matGun);
        gunGroup.add(gunBody);
        const gunMuzzle = new THREE.Mesh(GEO_SOLDIER.muzzle, matGun);
        gunMuzzle.position.z = -0.42;
        gunGroup.add(gunMuzzle);
        const gunMag = new THREE.Mesh(GEO_SOLDIER.mag, matGun);
        gunMag.position.set(0, -0.14, 0.05);
        gunGroup.add(gunMag);
        gunGroup.position.set(0.18, 0.95, -0.35);
        gunGroup.rotation.x = -0.05;
        g.add(gunGroup);
        armR.position.set(0.3, 1.05, -0.15);
        armR.rotation.x = -0.4;

        g.userData = { torso, head, helmet, armL, armR, legL, legR, gunGroup, visor };
        return g;
    }

    function animateSoldier(group, phase, alive) {
        const u = group.userData;
        if (!alive) {
            group.rotation.z = Math.PI / 2;
            group.position.y = 0.2;
            return;
        }
        group.rotation.z = 0;
        const swing = Math.sin(phase * 4) * 0.35;
        u.legL.rotation.x = swing;
        u.legR.rotation.x = -swing;
        group.position.y = Math.abs(Math.sin(phase * 8)) * 0.03;
    }

    /* =========================================================
     3D МОДЕЛИ ОРУЖИЯ (много моделей)
     ========================================================= */
    const weaponHolder = new THREE.Group();
    camera.add(weaponHolder);
    scene.add(camera);

    const weaponModels = {};  // кэш: id -> { mesh, materials: {primary, secondary, accent} }

    // Хелпер для создания материала с учётом скина
    function makeMat(color, metalness, roughness) {
        if (isMobile) return new THREE.MeshLambertMaterial({ color });
        return new THREE.MeshStandardMaterial({ color, metalness: metalness != null ? metalness : 0.7, roughness: roughness != null ? roughness : 0.4 });
    }

    function buildWeaponModel(id) {
        const def = WEAPON_CATALOG[id];
        if (!def) return null;
        const mt = def.modelType || 'pistol_std';

        // Базовые палитры материалов (будут перекрашены скином)
        // primary - основной корпус
        // secondary - тёмные части (рукояти, магазины)
        // accent - акцентные элементы (прицельные, линза)
        const group = new THREE.Group();
        const mats = {
            primary:   makeMat(0x2b2f34, 0.85, 0.45),
            secondary: makeMat(0x14171a, 0.55, 0.6),
            accent:    makeMat(0x0a0c0f, 0.8, 0.35),
            wood:      makeMat(0x6a3f1f, 0.1, 0.85),
            lens:      new THREE.MeshBasicMaterial({ color: 0x66aacc }),
            glow:      new THREE.MeshBasicMaterial({ color: 0xff3030 })
        };

        // Хелпер: добавить меш с материалом
        function addMesh(geometry, mat, x, y, z, rx, ry, rz) {
            const mesh = new THREE.Mesh(geometry, mat);
            mesh.position.set(x || 0, y || 0, z || 0);
            if (rx) mesh.rotation.x = rx;
            if (ry) mesh.rotation.y = ry;
            if (rz) mesh.rotation.z = rz;
            group.add(mesh);
            return mesh;
        }

        /* ================ НОЖИ ================ */
        if (mt === 'knife_std') {
            // Клинок
            addMesh(new THREE.BoxGeometry(0.04, 0.015, 0.42), mats.primary, 0, 0, -0.31);
            // Скос острия (упрощённо — тонкий треугольник)
            addMesh(new THREE.ConeGeometry(0.022, 0.08, 4), mats.primary, 0, 0, -0.56, Math.PI/2, 0, Math.PI/4);
            // Гарда
            addMesh(new THREE.BoxGeometry(0.07, 0.02, 0.03), mats.secondary, 0, 0, -0.10);
            // Рукоять
            addMesh(new THREE.BoxGeometry(0.035, 0.035, 0.16), mats.secondary, 0, 0, 0.02);
        } else if (mt === 'knife_bayo') {
            // Длинный клинок
            addMesh(new THREE.BoxGeometry(0.045, 0.015, 0.55), mats.primary, 0, 0, -0.38);
            addMesh(new THREE.ConeGeometry(0.024, 0.10, 4), mats.primary, 0, 0, -0.70, Math.PI/2, 0, Math.PI/4);
            // Дол (полоска посередине)
            addMesh(new THREE.BoxGeometry(0.015, 0.018, 0.50), mats.accent, 0, 0, -0.38);
            // Кольцо на рукояти (для крепления)
            addMesh(new THREE.TorusGeometry(0.035, 0.008, 6, 12), mats.secondary, 0, 0, 0.10, Math.PI/2);
            // Рукоять
            addMesh(new THREE.BoxGeometry(0.04, 0.04, 0.18), mats.secondary, 0, 0, -0.02);
        } else if (mt === 'knife_karam') {
            // Изогнутый клинок — приближаем 3 боксами с поворотами
            const b1 = addMesh(new THREE.BoxGeometry(0.04, 0.015, 0.18), mats.primary, 0, 0.02, -0.20, -0.3);
            const b2 = addMesh(new THREE.BoxGeometry(0.04, 0.015, 0.14), mats.primary, -0.02, 0.07, -0.35, -0.6);
            const b3 = addMesh(new THREE.ConeGeometry(0.022, 0.08, 4), mats.primary, -0.06, 0.12, -0.47, -0.9, 0, Math.PI/4);
            // Кольцо на рукояти
            addMesh(new THREE.TorusGeometry(0.04, 0.012, 6, 14), mats.secondary, 0.03, -0.02, 0.12, Math.PI/2);
            // Рукоять
            addMesh(new THREE.BoxGeometry(0.04, 0.05, 0.14), mats.secondary, 0.02, -0.02, -0.02);
        } else if (mt === 'knife_butt') {
            // Клинок "бабочки"
            addMesh(new THREE.BoxGeometry(0.04, 0.015, 0.40), mats.primary, 0, 0, -0.30);
            addMesh(new THREE.ConeGeometry(0.022, 0.10, 4), mats.primary, 0, 0, -0.55, Math.PI/2, 0, Math.PI/4);
            // Две рукояти, веером
            addMesh(new THREE.BoxGeometry(0.035, 0.03, 0.14), mats.secondary, -0.02, 0, 0.05, 0, 0, 0.15);
            addMesh(new THREE.BoxGeometry(0.035, 0.03, 0.14), mats.secondary, 0.02, 0, 0.05, 0, 0, -0.15);
        } else if (mt === 'knife_m9') {
            // Широкий тактический клинок
            addMesh(new THREE.BoxGeometry(0.05, 0.02, 0.50), mats.primary, 0, 0, -0.35);
            // Зубчатая кромка (полоски)
            for (let i = 0; i < 5; i++) {
                addMesh(new THREE.BoxGeometry(0.008, 0.022, 0.04), mats.accent, -0.026, 0, -0.20 - i*0.08);
            }
            addMesh(new THREE.ConeGeometry(0.026, 0.10, 4), mats.primary, 0, 0, -0.65, Math.PI/2, 0, Math.PI/4);
            // Рукоять
            addMesh(new THREE.BoxGeometry(0.045, 0.045, 0.20), mats.secondary, 0, 0, -0.02);
        }

        /* ================ ПИСТОЛЕТЫ ================ */
        else if (mt === 'pistol_std') {
            // Корпус/затвор
            addMesh(new THREE.BoxGeometry(0.055, 0.07, 0.26), mats.primary, 0, 0.02, -0.14);
            // Ствол
            addMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.10, 8), mats.secondary, 0, 0.02, -0.32, Math.PI/2);
            // Рукоять
            const grip = addMesh(new THREE.BoxGeometry(0.05, 0.17, 0.07), mats.secondary, 0, -0.13, -0.02, -0.2);
            // Магазин
            addMesh(new THREE.BoxGeometry(0.04, 0.14, 0.05), mats.accent, 0, -0.17, 0.03, -0.2);
            // Мушка
            addMesh(new THREE.BoxGeometry(0.015, 0.02, 0.015), mats.accent, 0, 0.075, -0.25);
            // Целик
            addMesh(new THREE.BoxGeometry(0.04, 0.02, 0.015), mats.accent, 0, 0.075, 0.02);
        } else if (mt === 'pistol_sil') {
            addMesh(new THREE.BoxGeometry(0.055, 0.07, 0.22), mats.primary, 0, 0.02, -0.14);
            // Глушитель
            addMesh(new THREE.CylinderGeometry(0.038, 0.038, 0.24, 10), mats.secondary, 0, 0.02, -0.36, Math.PI/2);
            addMesh(new THREE.BoxGeometry(0.05, 0.17, 0.07), mats.secondary, 0, -0.13, -0.02, -0.2);
            addMesh(new THREE.BoxGeometry(0.04, 0.14, 0.05), mats.accent, 0, -0.17, 0.03, -0.2);
            addMesh(new THREE.BoxGeometry(0.04, 0.02, 0.015), mats.accent, 0, 0.075, 0.02);
        } else if (mt === 'pistol_big') {
            // Deagle — крупный
            addMesh(new THREE.BoxGeometry(0.07, 0.10, 0.30), mats.primary, 0, 0.02, -0.16);
            addMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.14, 10), mats.secondary, 0, 0.03, -0.38, Math.PI/2);
            addMesh(new THREE.BoxGeometry(0.055, 0.19, 0.08), mats.secondary, 0, -0.14, -0.02, -0.2);
            addMesh(new THREE.BoxGeometry(0.045, 0.14, 0.06), mats.accent, 0, -0.18, 0.03, -0.2);
            addMesh(new THREE.BoxGeometry(0.03, 0.025, 0.02), mats.accent, 0, 0.095, -0.29);
            // Красная точка
            addMesh(new THREE.SphereGeometry(0.007, 6, 6), mats.glow, 0, 0.095, -0.29);
        } else if (mt === 'revolver') {
            // Револьвер — круглая часть
            addMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 12), mats.primary, 0, 0.01, -0.08, Math.PI/2);
            // Ствол
            addMesh(new THREE.BoxGeometry(0.04, 0.04, 0.22), mats.primary, 0, 0.01, -0.24);
            addMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 8), mats.secondary, 0, 0.01, -0.35, Math.PI/2);
            // Рукоять с изгибом
            addMesh(new THREE.BoxGeometry(0.055, 0.19, 0.08), mats.secondary, 0, -0.14, 0.02, -0.3);
            // Курок
            addMesh(new THREE.BoxGeometry(0.03, 0.05, 0.03), mats.accent, 0, 0.08, 0.03);
        } else if (mt === 'pistol_auto') {
            // CZ75/Tec9 — автоматический с большим магазином
            addMesh(new THREE.BoxGeometry(0.055, 0.08, 0.24), mats.primary, 0, 0.02, -0.13);
            addMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 8), mats.secondary, 0, 0.02, -0.30, Math.PI/2);
            addMesh(new THREE.BoxGeometry(0.05, 0.18, 0.07), mats.secondary, 0, -0.13, -0.02, -0.2);
            // Длинный магазин
            addMesh(new THREE.BoxGeometry(0.04, 0.22, 0.05), mats.accent, 0, -0.21, 0.05, -0.2);
            addMesh(new THREE.BoxGeometry(0.015, 0.02, 0.015), mats.accent, 0, 0.08, -0.24);
            // Огонь-селектор
            addMesh(new THREE.BoxGeometry(0.03, 0.015, 0.015), mats.accent, 0.04, -0.05, -0.05);
        }

        /* ================ SMG ================ */
        else if (mt === 'smg_std') {
            // Корпус
            addMesh(new THREE.BoxGeometry(0.06, 0.08, 0.35), mats.primary, 0, 0.02, -0.20);
            // Ствол
            addMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.20, 8), mats.secondary, 0, 0.02, -0.47, Math.PI/2);
            // Магазин
            addMesh(new THREE.BoxGeometry(0.045, 0.22, 0.08), mats.accent, 0, -0.17, -0.10);
            // Рукоять
            addMesh(new THREE.BoxGeometry(0.05, 0.15, 0.08), mats.secondary, 0, -0.12, 0.08, 0.1);
            // Приклад
            addMesh(new THREE.BoxGeometry(0.05, 0.08, 0.18), mats.secondary, 0, -0.01, 0.22);
            // Цевьё
            addMesh(new THREE.BoxGeometry(0.055, 0.06, 0.16), mats.secondary, 0, -0.01, -0.30);
            // Прицел
            addMesh(new THREE.BoxGeometry(0.04, 0.03, 0.02), mats.accent, 0, 0.075, 0.02);
        } else if (mt === 'smg_p90') {
            // P90 — булл-пап, характерный
            addMesh(new THREE.BoxGeometry(0.07, 0.10, 0.45), mats.primary, 0, 0.02, -0.22);
            // Верхняя магазинная часть
            addMesh(new THREE.BoxGeometry(0.06, 0.06, 0.30), mats.secondary, 0, 0.09, -0.15);
            addMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 8), mats.secondary, 0, 0.01, -0.52, Math.PI/2);
            // Передняя рукоять (дырка — упрощённо прямоугольник)
            addMesh(new THREE.BoxGeometry(0.05, 0.14, 0.06), mats.secondary, 0, -0.12, -0.05, 0.1);
        } else if (mt === 'smg_small') {
            // MAC-10 — маленький
            addMesh(new THREE.BoxGeometry(0.06, 0.09, 0.22), mats.primary, 0, 0.02, -0.13);
            addMesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 6), mats.secondary, 0, 0.02, -0.30, Math.PI/2);
            // Большой магазин прямо под стволом
            addMesh(new THREE.BoxGeometry(0.05, 0.24, 0.07), mats.accent, 0, -0.17, -0.13);
            addMesh(new THREE.BoxGeometry(0.05, 0.13, 0.06), mats.secondary, 0, -0.08, 0.05, 0.15);
        }

        /* ================ ВИНТОВКИ ================ */
        else if (mt === 'rifle_ak') {
            // AK — деревянный
            // Основной ресивер
            addMesh(new THREE.BoxGeometry(0.065, 0.10, 0.42), mats.primary, 0, 0.03, -0.22);
            // Ствол
            addMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 10), mats.secondary, 0, 0.03, -0.60, Math.PI/2);
            // Газовая трубка сверху
            addMesh(new THREE.BoxGeometry(0.04, 0.025, 0.30), mats.secondary, 0, 0.09, -0.45);
            // Дульный тормоз
            addMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 10), mats.accent, 0, 0.03, -0.79, Math.PI/2);
            // Мушка
            addMesh(new THREE.BoxGeometry(0.015, 0.03, 0.015), mats.accent, 0, 0.075, -0.72);
            // Целик
            addMesh(new THREE.BoxGeometry(0.04, 0.025, 0.02), mats.accent, 0, 0.09, -0.05);
            // Магазин — изогнутый (два бокса с разворотом)
            addMesh(new THREE.BoxGeometry(0.05, 0.16, 0.10), mats.accent, 0, -0.13, -0.16, 0.15);
            addMesh(new THREE.BoxGeometry(0.05, 0.16, 0.10), mats.accent, 0, -0.27, -0.11, 0.35);
            // Рукоять
            addMesh(new THREE.BoxGeometry(0.05, 0.17, 0.08), mats.wood, 0, -0.13, 0.05, 0.15);
            // Деревянное цевьё
            addMesh(new THREE.BoxGeometry(0.06, 0.06, 0.22), mats.wood, 0, 0.02, -0.44);
            // Приклад
            addMesh(new THREE.BoxGeometry(0.06, 0.10, 0.28), mats.wood, 0, -0.02, 0.22);
        } else if (mt === 'rifle_m4') {
            // M4 — чёрный тактический
            addMesh(new THREE.BoxGeometry(0.065, 0.10, 0.42), mats.primary, 0, 0.03, -0.22);
            addMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 10), mats.secondary, 0, 0.03, -0.58, Math.PI/2);
            // Планка Пикатинни
            addMesh(new THREE.BoxGeometry(0.05, 0.02, 0.42), mats.accent, 0, 0.09, -0.20);
            // Пламегаситель
            addMesh(new THREE.CylinderGeometry(0.028, 0.028, 0.06, 8), mats.accent, 0, 0.03, -0.76, Math.PI/2);
            // Коллиматор
            addMesh(new THREE.BoxGeometry(0.04, 0.05, 0.08), mats.accent, 0, 0.14, -0.15);
            addMesh(new THREE.CircleGeometry(0.018, 12), mats.glow, 0, 0.16, -0.15, Math.PI/2);
            // Магазин
            addMesh(new THREE.BoxGeometry(0.05, 0.18, 0.09), mats.accent, 0, -0.15, -0.13);
            // Рукоять
            addMesh(new THREE.BoxGeometry(0.05, 0.16, 0.08), mats.secondary, 0, -0.12, 0.04, 0.15);
            // Цевьё (полимерный хэндгард)
            addMesh(new THREE.BoxGeometry(0.06, 0.06, 0.22), mats.secondary, 0, 0.02, -0.42);
            // Телескопический приклад
            addMesh(new THREE.BoxGeometry(0.05, 0.10, 0.24), mats.secondary, 0, -0.02, 0.22);
        } else if (mt === 'rifle_bullpup') {
            // AUG/FAMAS — компактный булл-пап
            addMesh(new THREE.BoxGeometry(0.07, 0.11, 0.42), mats.primary, 0, 0.03, -0.22);
            addMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 10), mats.secondary, 0, 0.03, -0.56, Math.PI/2);
            // Ручка для переноски сверху
            addMesh(new THREE.BoxGeometry(0.04, 0.04, 0.30), mats.accent, 0, 0.14, -0.20);
            // Магазин позади рукояти
            addMesh(new THREE.BoxGeometry(0.05, 0.16, 0.09), mats.accent, 0, -0.13, 0.12, -0.1);
            // Передняя рукоять
            addMesh(new THREE.BoxGeometry(0.05, 0.15, 0.07), mats.secondary, 0, -0.12, -0.06, 0.15);
            // Ствол с пламегасителем
            addMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 8), mats.accent, 0, 0.03, -0.72, Math.PI/2);
        }

        /* ================ СНАЙПЕРКИ ================ */
        else if (mt === 'sniper_light') {
            // Лёгкая снайперка — тонкая длинная
            addMesh(new THREE.BoxGeometry(0.06, 0.08, 0.40), mats.primary, 0, 0.02, -0.22);
            // Длинный тонкий ствол
            addMesh(new THREE.CylinderGeometry(0.017, 0.017, 0.60, 10), mats.secondary, 0, 0.02, -0.72, Math.PI/2);
            // Небольшой прицел
            addMesh(new THREE.CylinderGeometry(0.032, 0.032, 0.20, 10), mats.accent, 0, 0.10, -0.20, Math.PI/2);
            addMesh(new THREE.CircleGeometry(0.028, 14), mats.lens, 0, 0.10, -0.30, Math.PI/2);
            // Магазин
            addMesh(new THREE.BoxGeometry(0.045, 0.14, 0.08), mats.accent, 0, -0.12, -0.15);
            // Рукоять
            addMesh(new THREE.BoxGeometry(0.05, 0.16, 0.07), mats.secondary, 0, -0.12, 0.02, 0.15);
            // Приклад
            addMesh(new THREE.BoxGeometry(0.055, 0.10, 0.26), mats.secondary, 0, -0.02, 0.20);
        } else if (mt === 'sniper_heavy') {
            // AWP — массивная
            addMesh(new THREE.BoxGeometry(0.07, 0.11, 0.48), mats.primary, 0, 0.03, -0.25);
            // Очень длинный ствол
            addMesh(new THREE.CylinderGeometry(0.024, 0.024, 0.80, 10), mats.secondary, 0, 0.03, -0.90, Math.PI/2);
            // Дульный тормоз
            addMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.06, 10), mats.accent, 0, 0.03, -1.32, Math.PI/2);
            // Большой оптический прицел
            addMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.30, 14), mats.accent, 0, 0.13, -0.22, Math.PI/2);
            // Линза
            addMesh(new THREE.CircleGeometry(0.045, 16), mats.lens, 0, 0.13, -0.38, Math.PI/2);
            // Крепление прицела
            addMesh(new THREE.BoxGeometry(0.05, 0.05, 0.04), mats.secondary, 0, 0.08, -0.10);
            addMesh(new THREE.BoxGeometry(0.05, 0.05, 0.04), mats.secondary, 0, 0.08, -0.32);
            // Магазин
            addMesh(new THREE.BoxGeometry(0.05, 0.16, 0.09), mats.accent, 0, -0.14, -0.20);
            // Рукоять
            addMesh(new THREE.BoxGeometry(0.055, 0.17, 0.08), mats.secondary, 0, -0.13, 0.02, 0.15);
            // Приклад
            addMesh(new THREE.BoxGeometry(0.06, 0.11, 0.30), mats.secondary, 0, -0.02, 0.22);
            // Бипод
            addMesh(new THREE.BoxGeometry(0.015, 0.15, 0.015), mats.accent, -0.04, -0.10, -0.40, 0, 0, 0.3);
            addMesh(new THREE.BoxGeometry(0.015, 0.15, 0.015), mats.accent, 0.04, -0.10, -0.40, 0, 0, -0.3);
        }

        /* ================ ДРОБОВИКИ ================ */
        else if (mt === 'shotgun_pump') {
            // Pump-action
            addMesh(new THREE.BoxGeometry(0.065, 0.10, 0.44), mats.primary, 0, 0.03, -0.24);
            // Толстый ствол
            addMesh(new THREE.CylinderGeometry(0.028, 0.028, 0.44, 10), mats.secondary, 0, 0.03, -0.68, Math.PI/2);
            // Подствольный магазин
            addMesh(new THREE.CylinderGeometry(0.024, 0.024, 0.36, 10), mats.accent, 0, -0.05, -0.60, Math.PI/2);
            // Помпа (передняя рукоять)
            addMesh(new THREE.BoxGeometry(0.07, 0.06, 0.16), mats.accent, 0, -0.02, -0.42);
            // Рукоять
            addMesh(new THREE.BoxGeometry(0.055, 0.17, 0.08), mats.secondary, 0, -0.13, 0.02, 0.15);
            // Приклад
            addMesh(new THREE.BoxGeometry(0.06, 0.11, 0.28), mats.secondary, 0, -0.02, 0.20);
        } else if (mt === 'shotgun_auto') {
            // Автоматический дробовик
            addMesh(new THREE.BoxGeometry(0.07, 0.11, 0.46), mats.primary, 0, 0.03, -0.25);
            addMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.40, 10), mats.secondary, 0, 0.03, -0.66, Math.PI/2);
            addMesh(new THREE.CylinderGeometry(0.026, 0.026, 0.32, 10), mats.accent, 0, -0.05, -0.58, Math.PI/2);
            // Пистолетная рукоять
            addMesh(new THREE.BoxGeometry(0.05, 0.16, 0.08), mats.secondary, 0, -0.13, 0.02, 0.15);
            // Приклад
            addMesh(new THREE.BoxGeometry(0.06, 0.10, 0.24), mats.secondary, 0, -0.02, 0.18);
        } else if (mt === 'shotgun_short') {
            // MAG-7 — очень короткий
            addMesh(new THREE.BoxGeometry(0.07, 0.10, 0.30), mats.primary, 0, 0.03, -0.18);
            addMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.20, 10), mats.secondary, 0, 0.03, -0.42, Math.PI/2);
            addMesh(new THREE.BoxGeometry(0.055, 0.16, 0.08), mats.secondary, 0, -0.13, 0.02, 0.15);
            // Магазин
            addMesh(new THREE.BoxGeometry(0.05, 0.18, 0.09), mats.accent, 0, -0.15, -0.10);
        }

        /* ================ ГРАНАТЫ ================ */
        else if (mt === 'grenade_frag') {
            addMesh(new THREE.SphereGeometry(0.10, 12, 10), mats.primary, 0, 0, -0.20);
            // Полоски
            addMesh(new THREE.BoxGeometry(0.21, 0.012, 0.21), mats.accent, 0, 0.05, -0.20);
            addMesh(new THREE.BoxGeometry(0.21, 0.012, 0.21), mats.accent, 0, -0.05, -0.20);
            // Рычаг
            addMesh(new THREE.BoxGeometry(0.03, 0.10, 0.03), mats.secondary, 0, 0.13, -0.20);
        } else if (mt === 'grenade_flash') {
            addMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.18, 12), mats.primary, 0, 0, -0.20, Math.PI/2);
            addMesh(new THREE.BoxGeometry(0.03, 0.08, 0.03), mats.secondary, 0, 0.10, -0.20);
            // Металлические полоски
            addMesh(new THREE.BoxGeometry(0.13, 0.012, 0.13), mats.accent, 0, 0.04, -0.20);
            addMesh(new THREE.BoxGeometry(0.13, 0.012, 0.13), mats.accent, 0, -0.04, -0.20);
        } else if (mt === 'grenade_smoke') {
            addMesh(new THREE.CylinderGeometry(0.055, 0.055, 0.20, 12), mats.primary, 0, 0, -0.20, Math.PI/2);
            // Две полоски
            addMesh(new THREE.BoxGeometry(0.12, 0.012, 0.12), mats.accent, 0, 0.05, -0.20);
            addMesh(new THREE.BoxGeometry(0.12, 0.012, 0.12), mats.accent, 0, -0.05, -0.20);
            addMesh(new THREE.BoxGeometry(0.03, 0.08, 0.03), mats.secondary, 0, 0.11, -0.20);
        }

        // Позиционирование в руке
        group.position.set(0.22, -0.22, -0.55);
        group.rotation.y = -0.05;

        return { mesh: group, materials: mats };
    }

    // Применить скин к материалам модели
    function applySkinToMaterials(mats, skin) {
        if (!skin) return;
        const c = skin.colors;
        mats.primary.color.setHex(c.primary);
        mats.secondary.color.setHex(c.secondary);
        mats.accent.color.setHex(c.accent);
        if (mats.primary.metalness != null) mats.primary.metalness = skin.metalness;
        if (mats.primary.roughness != null) mats.primary.roughness = skin.roughness;
        if (mats.secondary.metalness != null) mats.secondary.metalness = skin.metalness * 0.8;
        if (mats.secondary.roughness != null) mats.secondary.roughness = skin.roughness + 0.15;
        if (mats.accent.metalness != null) mats.accent.metalness = skin.metalness;
        if (mats.accent.roughness != null) mats.accent.roughness = skin.roughness;
    }

    function getSkinForWeapon(weaponId) {
        const skinId = player.equippedSkins[weaponId];
        if (skinId && SKINS_BY_ID[skinId]) return SKINS_BY_ID[skinId];
        return SKINS_BY_ID['default'];
    }

    function equipWeaponModel(id) {
        while (weaponHolder.children.length) weaponHolder.children.pop();
        if (!weaponModels[id]) weaponModels[id] = buildWeaponModel(id);
        if (!weaponModels[id]) return;
        const skin = getSkinForWeapon(id);
        applySkinToMaterials(weaponModels[id].materials, skin);
        const m = weaponModels[id].mesh;
        weaponHolder.add(m);
        m.visible = true;
        // Обновляем имя скина в HUD
        if (ui.skinName) ui.skinName.textContent = skin.name;
    }

    /* =========================================================
     ВРАГИ / ИГРА
     ========================================================= */
    let enemies = [];
    let grenades = [];
    let announceTimer = null;
    let damageFlash = 0;
    const input = { fire: false };
    const keys = {};
    const moveVec = { x: 0, y: 0 };
    let touchCrouch = false;
    let touchJump = false;

    function findSpawnPoint() {
        for (let tries = 0; tries < 300; tries++) {
            const x = 2 + Math.random() * (MAP_W - 4);
            const z = 2 + Math.random() * (MAP_H - 4);
            if (at(Math.floor(x), Math.floor(z)) !== 0) continue;
            if (!canStand(x, z, 0.5)) continue;
            const d = Math.hypot(x - player.x, z - player.z);
            if (d < 10) continue;
            let ok = true;
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                if (e.alive && Math.hypot(e.x - x, e.z - z) < 2.0) { ok = false; break; }
            }
            if (!ok) continue;
            return { x, z };
        }
        return { x: MAP_W - 2.5, z: MAP_H - 2.5 };
    }

    function spawnEnemy(wave) {
        const p = findSpawnPoint();
        const maxHp = 100 + (wave - 1) * 12;
        const mesh = createSoldier(0);
        mesh.position.set(p.x, 0, p.z);
        worldGroup.add(mesh);
        enemies.push({
            mesh, x: p.x, z: p.z,
            hp: maxHp, maxHp, alive: true, deadTimer: 7,
            speed: Math.min(2.6, 1.1 + wave * 0.08),
            damage: Math.min(22, 8 + wave * 1.1),
            cooldown: 0.8 + Math.random() * 1.4,
            radius: 0.35, hitFlash: 0,
            animPhase: Math.random() * 10, team: 0
        });
    }

    function startWave(n) {
        state.wave = n;
        const count = Math.min(3 + n, isMobile ? 8 : 12);
        for (let i = 0; i < count; i++) spawnEnemy(n);
        announce('ВОЛНА ' + n);
        const bonus = WAVE_BONUS + n * WAVE_BONUS_PER_LEVEL;
        player.money += bonus;
        player.earnedThisGame += bonus;
        setTimeout(function () { sfxMoney(); updateHUD(); saveInventory(); }, 600);
        updateHUD();
    }

    function updateWaves(dt) {
        let aliveCount = 0;
        for (let i = 0; i < enemies.length; i++) if (enemies[i].alive) aliveCount++;
        if (state.betweenWaves) {
            state.waveTimer -= dt;
            if (state.waveTimer <= 0) { state.betweenWaves = false; startWave(state.wave + 1); }
            return;
        }
        if (aliveCount === 0 && state.wave >= 1) {
            state.betweenWaves = true;
            state.waveTimer = 2.4;
            announce('ВОЛНА ' + state.wave + ' ЗАЧИЩЕНА');
        }
    }

    function updateEnemies(dt) {
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (!e.alive) {
                e.deadTimer -= dt;
                if (e.deadTimer <= 0 && e.mesh.parent) e.mesh.parent.remove(e.mesh);
                continue;
            }
            if (e.hitFlash > 0) e.hitFlash -= dt;
            e.animPhase += dt * 2;
            const dx = player.x - e.x, dz = player.z - e.z;
            const dist = Math.hypot(dx, dz) || 0.0001;
            const los = hasLineOfSight(e.x, e.z, player.x, player.z);
            const targetAngle = Math.atan2(dx, dz);
            let da = targetAngle - e.mesh.rotation.y;
            while (da > Math.PI) da -= Math.PI * 2;
            while (da < -Math.PI) da += Math.PI * 2;
            e.mesh.rotation.y += da * Math.min(1, dt * 5);
            if (e.cooldown > 0) e.cooldown -= dt;
            if (los && dist < 18 && e.cooldown <= 0 && dist > 0.8) {
                e.cooldown = 1.3 + Math.random();
                const chance = Math.max(0.16, 0.85 - dist * 0.04);
                if (Math.random() < chance) damagePlayer(e.damage);
            }
            const wantMove = dist > 2.8 || !los;
            if (wantMove) {
                const nx = dx / dist, nz = dz / dist;
                const strafe = Math.sin(state.time * 2 + i) * 0.3;
                const mx = nx - nz * strafe, mz = nz + nx * strafe;
                const len = Math.hypot(mx, mz) || 1;
                const spd = e.speed * dt;
                const bx = e.x, bz = e.z;
                tryMove(e, (mx/len) * spd, (mz/len) * spd, e.radius);
                if (Math.abs(e.x - bx) < 1e-5 && Math.abs(e.z - bz) < 1e-5) {
                    const px = -mz/len, pz = mx/len;
                    if (canStand(e.x + px * spd, e.z + pz * spd, e.radius)) { e.x += px * spd; e.z += pz * spd; }
                    else if (canStand(e.x - px * spd, e.z - pz * spd, e.radius)) { e.x -= px * spd; e.z -= pz * spd; }
                }
            }
            e.mesh.position.x = e.x;
            e.mesh.position.z = e.z;
            animateSoldier(e.mesh, e.animPhase, true);
            const torso = e.mesh.userData.torso;
            if (e.hitFlash > 0) {
                if (torso.material.emissive) {
                    torso.material.emissive.setHex(0xff2020);
                    torso.material.emissiveIntensity = 0.7;
                }
            } else {
                if (torso.material.emissive) torso.material.emissiveIntensity = 0;
            }
        }
    }

    function canStand(x, z, r) {
        return at(Math.floor(x - r), Math.floor(z - r)) === 0 &&
            at(Math.floor(x + r), Math.floor(z - r)) === 0 &&
            at(Math.floor(x - r), Math.floor(z + r)) === 0 &&
            at(Math.floor(x + r), Math.floor(z + r)) === 0;
    }
    function tryMove(ent, dx, dz, r) {
        if (canStand(ent.x + dx, ent.z, r)) ent.x += dx;
        if (canStand(ent.x, ent.z + dz, r)) ent.z += dz;
    }
    function hasLineOfSight(x1, z1, x2, z2) {
        const dx = x2 - x1, dz = z2 - z1;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.001) return true;
        const steps = Math.ceil(dist / 0.15);
        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            if (at(Math.floor(x1 + dx * t), Math.floor(z1 + dz * t)) !== 0) return false;
        }
        return true;
    }

    /* =========================================================
     ЗВУК
     ========================================================= */
    let audioCtx = null;
    function ensureAudio() {
        if (!audioCtx) {
            try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch (e) { audioCtx = null; }
        }
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(function(){});
        return audioCtx;
    }
    function beep(freq, freq2, dur, vol, wave) {
        const ac = ensureAudio();
        if (!ac) return;
        try {
            const t = ac.currentTime;
            const o = ac.createOscillator();
            const g = ac.createGain();
            o.type = wave || 'square';
            o.frequency.setValueAtTime(freq, t);
            o.frequency.exponentialRampToValueAtTime(Math.max(20, freq2), t + dur);
            g.gain.setValueAtTime(vol, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            o.connect(g); g.connect(ac.destination);
            o.start(t); o.stop(t + dur + 0.02);
        } catch (e) {}
    }
    function sfxShot(id) {
        const def = WEAPON_CATALOG[id];
        if (!def) return beep(280, 60, 0.08, 0.08, 'square');
        if (def.cat === 'shotgun') beep(200, 60, 0.16, 0.14, 'sawtooth');
        else if (def.cat === 'sniper') beep(180, 32, 0.36, 0.16, 'sawtooth');
        else if (def.cat === 'smg') beep(320, 70, 0.06, 0.08, 'square');
        else if (def.cat === 'rifle') beep(260, 55, 0.09, 0.10, 'square');
        else if (def.cat === 'pistol') beep(340, 75, 0.08, 0.09, 'square');
    }
    function sfxKnife()   { beep(1300, 280, 0.13, 0.06, 'sine'); }
    function sfxHit()     { beep(900, 400, 0.06, 0.06, 'sine'); }
    function sfxKill()    { beep(600, 1200, 0.16, 0.07, 'sawtooth'); }
    function sfxHurt()    { beep(160, 60, 0.22, 0.10, 'sawtooth'); }
    function sfxReload()  { beep(400, 700, 0.10, 0.05, 'triangle'); }
    function sfxEmpty()   { beep(180, 120, 0.05, 0.05, 'square'); }
    function sfxSwitch()  { beep(600, 900, 0.08, 0.045, 'triangle'); }
    function sfxConnect() { beep(660, 990, 0.18, 0.06, 'sine'); }
    function sfxBuy()     { beep(880, 1320, 0.14, 0.07, 'sine'); }
    function sfxDenied()  { beep(200, 100, 0.12, 0.07, 'square'); }
    function sfxGrenade() { beep(500, 250, 0.15, 0.06, 'triangle'); }
    function sfxBoom()    { beep(80, 30, 0.55, 0.20, 'sawtooth'); }
    function sfxMoney()   { beep(1200, 1800, 0.10, 0.05, 'sine'); }
    function sfxJump()    { beep(240, 500, 0.10, 0.045, 'triangle'); }
    function sfxLand()    { beep(150, 60, 0.10, 0.06, 'square'); }
    function sfxCaseTick(){ beep(1000, 1400, 0.02, 0.03, 'sine'); }
    function sfxCaseWin() { beep(660, 1320, 0.3, 0.1, 'sine'); }

    /* =========================================================
     ГРАНАТЫ
     ========================================================= */
    const grenadeGeo = new THREE.SphereGeometry(0.09, isMobile ? 8 : 12, isMobile ? 6 : 8);
    const grenadeMatFrag  = makeMat(0x2d3038, 0.6, 0.4);
    const grenadeMatFlash = makeMat(0xc0c0c0, 0.7, 0.35);
    const grenadeMatSmoke = makeMat(0x506070, 0.5, 0.5);

    function throwGrenade() {
        if (state.gameOver || state.paused || !state.running) return;
        if (player.grenades <= 0) return;
        if (player.hp <= 0) return;
        if (player.reloading) { player.reloading = false; ui.reload.classList.remove('active'); }
        player.grenades--;
        sfxGrenade();
        const pitchCos = Math.cos(player.pitch);
        const dirX = -Math.sin(player.angle) * pitchCos;
        const dirZ = -Math.cos(player.angle) * pitchCos;
        const dirY = Math.sin(player.pitch);
        const mat = player.grenadeType === 'flash' ? grenadeMatFlash :
            player.grenadeType === 'smoke' ? grenadeMatSmoke : grenadeMatFrag;
        const mesh = new THREE.Mesh(grenadeGeo, mat);
        const startY = (player.crouching ? CAM_CROUCH : CAM_STAND) + player.footZ;
        mesh.position.set(player.x + dirX*0.4, startY, player.z + dirZ*0.4);
        worldGroup.add(mesh);
        grenades.push({
            mesh,
            x: player.x + dirX*0.4, z: player.z + dirZ*0.4, y: startY,
            vx: dirX * 9, vy: dirY * 9 + 3, vz: dirZ * 9,
            fuse: GRENADE_FUSE,
            type: player.grenadeType
        });
        updateHUD();
    }

    function updateGrenades(dt) {
        for (let i = grenades.length - 1; i >= 0; i--) {
            const g = grenades[i];
            g.fuse -= dt;
            g.vy -= 16 * dt;
            const nx = g.x + g.vx * dt;
            if (at(Math.floor(nx), Math.floor(g.z)) === 0) g.x = nx; else g.vx = -g.vx * 0.4;
            const nz = g.z + g.vz * dt;
            if (at(Math.floor(g.x), Math.floor(nz)) === 0) g.z = nz; else g.vz = -g.vz * 0.4;
            g.y += g.vy * dt;
            if (g.y < 0.09) { g.y = 0.09; g.vy = -g.vy * 0.35; if (Math.abs(g.vy) < 0.4) g.vy = 0; }
            if (g.y > WALL_HEIGHT - 0.15) { g.y = WALL_HEIGHT - 0.15; g.vy = -Math.abs(g.vy) * 0.5; }
            g.vx *= 0.99; g.vz *= 0.99;
            g.mesh.position.set(g.x, g.y, g.z);
            g.mesh.rotation.x += dt * 4;
            g.mesh.rotation.z += dt * 3;
            if (g.fuse <= 0) {
                if (g.type === 'flash') explodeFlash(g);
                else if (g.type === 'smoke') explodeSmoke(g);
                else explodeGrenade(g);
                worldGroup.remove(g.mesh);
                grenades.splice(i, 1);
            }
        }
    }

    function explodeGrenade(g) {
        sfxBoom();
        muzzleLight.position.set(g.x, g.y, g.z);
        muzzleLight.color.setHex(0xffaa33);
        muzzleLight.intensity = 6;
        setTimeout(function () { muzzleLight.intensity = 0; }, 120);
        const applyDamage = (tx, tz) => {
            const dist = Math.hypot(tx - g.x, tz - g.z);
            if (dist > GRENADE_RADIUS) return 0;
            if (!hasLineOfSight(g.x, g.z, tx, tz)) return 0;
            const falloff = 1 - dist / GRENADE_RADIUS;
            return Math.round(GRENADE_MAX_DAMAGE * falloff * falloff);
        };
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (!e.alive) continue;
            const dmg = applyDamage(e.x, e.z);
            if (dmg > 0) {
                e.hp -= dmg; e.hitFlash = 0.2;
                if (e.hp <= 0) killEnemy(e, 'grenade');
            }
        }
        if (player.hp > 0) {
            const selfDmg = applyDamage(player.x, player.z) * 0.4;
            if (selfDmg > 0) damagePlayer(selfDmg);
        }
        spawnExplosionFlash(g.x, g.y, g.z);
    }
    function explodeFlash(g) {
        sfxBoom();
        muzzleLight.position.set(g.x, g.y, g.z);
        muzzleLight.color.setHex(0xffffff);
        muzzleLight.intensity = 12;
        setTimeout(function () { muzzleLight.intensity = 0; }, 400);
        // Врагов слепим (повышаем кулдаун)
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (!e.alive) continue;
            const dist = Math.hypot(e.x - g.x, e.z - g.z);
            if (dist < 6) e.cooldown = Math.max(e.cooldown, 3.5);
        }
        spawnExplosionFlash(g.x, g.y, g.z, 0xffffff);
    }
    function explodeSmoke(g) {
        sfxGrenade();
        // Большое облако — 8 сфер
        for (let i = 0; i < 8; i++) {
            const geo = new THREE.SphereGeometry(0.6 + Math.random() * 0.4, 8, 6);
            const mat = new THREE.MeshBasicMaterial({ color: 0x9aa5b3, transparent: true, opacity: 0.7 });
            const s = new THREE.Mesh(geo, mat);
            s.position.set(g.x + (Math.random() - 0.5) * 2.5, 1.2 + Math.random() * 1.5, g.z + (Math.random() - 0.5) * 2.5);
            worldGroup.add(s);
            setTimeout(function () {
                worldGroup.remove(s);
                geo.dispose();
                mat.dispose();
            }, 6000);
        }
    }
    function spawnExplosionFlash(x, y, z, color) {
        const geo = new THREE.SphereGeometry(0.6, isMobile ? 8 : 16, isMobile ? 6 : 12);
        const mat = new THREE.MeshBasicMaterial({ color: color != null ? color : 0xffaa44, transparent: true, opacity: 0.9 });
        const flash = new THREE.Mesh(geo, mat);
        flash.position.set(x, y, z);
        worldGroup.add(flash);
        let t = 0;
        const interval = setInterval(function () {
            t += 0.04;
            const s = 1 + t * 8;
            flash.scale.set(s, s, s);
            mat.opacity = Math.max(0, 0.9 - t * 3);
            if (t > 0.35) { clearInterval(interval); worldGroup.remove(flash); geo.dispose(); mat.dispose(); }
        }, 40);
    }

    /* =========================================================
     МУЛЬТИПЛЕЕР (сокращённый, сохранён базовый)
     ========================================================= */
    const MP = {
        active: false, mode: null, isHost: false, peer: null,
        myId: 'host', myTeam: 0, mySlot: 0,
        remotePlayers: {}, connections: [], players: [],
        killLimit: 15, lastSend: 0, respawnTimer: 0,
        winnerTeam: -1, winnerName: '', matchStarted: false,
        myKills: 0, myDeaths: 0, maxPlayers: 2
    };
    function mpGetSpawn(team, slot) {
        const map = MAP_LIST[selectedMapIdx];
        const spawns = map.mpSpawns || [];
        const idx = team * 2 + slot;
        const s = spawns[idx] || spawns[0];
        return { x: s.x, z: s.y, angle: s.angle };
    }
    function mpBroadcast(data, exceptConn) {
        for (let i = 0; i < MP.connections.length; i++) {
            const c = MP.connections[i];
            if (c === exceptConn) continue;
            if (c.open) { try { c.send(data); } catch (e) {} }
        }
    }
    function mpSendState() {
        if (!MP.active) return;
        mpBroadcast({
            t: 'state', id: MP.myId,
            x: player.x, z: player.z, a: player.angle, p: player.pitch,
            hp: player.hp, alive: player.hp > 0,
            w: player.currentWeaponId, k: MP.myKills, d: MP.myDeaths,
            team: MP.myTeam, slot: MP.mySlot, anim: player.bobPhase
        });
    }
    function mpHandleMessage(data, fromConn) {
        if (!data || typeof data !== 'object') return;
        switch (data.t) {
            case 'welcome':
                MP.myId = data.yourId; MP.myTeam = data.team; MP.mySlot = data.slot;
                MP.mode = data.mode; MP.killLimit = data.killLimit;
                selectedMapIdx = data.map; MP.matchStarted = true;
                mpStartGame(); break;
            case 'players': MP.players = data.list || []; break;
            case 'start': MP.matchStarted = true; mpStartGame(); break;
            case 'state': {
                let rp = MP.remotePlayers[data.id];
                if (rp) {
                    rp.targetX = data.x; rp.targetZ = data.z;
                    rp.angle = data.a; rp.pitch = data.p || 0;
                    rp.hp = data.hp; rp.alive = data.alive;
                    if (data.alive && !rp.wasAlive) { rp.x = data.x; rp.z = data.z; }
                    rp.wasAlive = data.alive;
                } else {
                    const mesh = createSoldier(data.team);
                    mesh.position.set(data.x, 0, data.z);
                    worldGroup.add(mesh);
                    MP.remotePlayers[data.id] = {
                        id: data.id, mesh, x: data.x, z: data.z,
                        targetX: data.x, targetZ: data.z,
                        angle: data.a, pitch: data.p || 0,
                        hp: data.hp, alive: data.alive, animPhase: 0,
                        kills: 0, deaths: 0, wasAlive: data.alive
                    };
                }
                if (MP.isHost && fromConn) mpBroadcast(data, fromConn);
                break;
            }
            case 'hit':
                if (data.targetId === MP.myId && player.hp > 0) mpApplyHit(data.damage, data.fromId);
                if (MP.isHost && fromConn && data.targetId !== MP.myId) mpBroadcast(data, fromConn);
                break;
            case 'death':
                if (data.killerId === MP.myId && data.victimId !== MP.myId) {
                    MP.myKills++;
                    addMoney(KILL_REWARD + 100);
                    sfxKill();
                }
                if (MP.isHost && fromConn) mpBroadcast(data, fromConn);
                mpCheckWin();
                break;
            case 'gameover': mpShowGameOver(data.winnerTeam, data.winnerName); break;
        }
    }
    function mpApplyHit(damage, fromId) {
        if (player.hp <= 0) return;
        player.hp -= damage;
        damageFlash = Math.min(1, damageFlash + 0.75);
        sfxHurt();
        if (player.hp <= 0) {
            player.hp = 0; MP.myDeaths++;
            mpBroadcast({ t: 'death', killerId: fromId, victimId: MP.myId });
            MP.respawnTimer = 3.0;
        }
        updateHUD();
    }
    function mpRespawn() {
        const sp = mpGetSpawn(MP.myTeam, MP.mySlot);
        player.x = sp.x; player.z = sp.z;
        player.hp = player.maxHp;
        player.footZ = 0; player.vz = 0; player.onGround = true;
        updateHUD();
    }
    function mpCheckWin() {
        if (!MP.active || MP.winnerTeam !== -1) return;
        if (MP.myKills >= MP.killLimit) mpShowGameOver(MP.myTeam, '');
    }
    function mpShowGameOver(team, name) {
        state.running = false; state.gameOver = true;
        input.fire = false;
        ui.crosshair.classList.remove('active');
        if (document.exitPointerLock) document.exitPointerLock();
        const won = (team === MP.myTeam);
        ui.overTitle.textContent = won ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ';
        ui.overTitle.className = won ? 'win' : 'danger';
        ui.finalScore.textContent = MP.myKills;
        ui.finalWave.textContent = MP.myDeaths;
        ui.finalMoney.textContent = '$' + player.earnedThisGame;
        ui.menuOver.classList.remove('hidden');
    }
    function mpDestroyPeer() {
        if (MP.peer) { try { MP.peer.destroy(); } catch (e) {} MP.peer = null; }
        MP.connections = []; MP.remotePlayers = {}; MP.players = [];
        MP.isHost = false; MP.matchStarted = false;
    }
    function mpHostGame() {
        if (typeof Peer === 'undefined') {
            ui.mpHostInfo.textContent = 'Ошибка: PeerJS не загружен';
            return;
        }
        mpDestroyPeer();
        MP.isHost = true; MP.mode = selectedMode;
        MP.maxPlayers = (MP.mode === '2v2') ? 4 : 2;
        MP.myId = 'host'; MP.myTeam = 0; MP.mySlot = 0;
        MP.killLimit = (MP.mode === '2v2') ? 25 : 15;
        ui.mpHostId.textContent = 'создание...';
        try { MP.peer = new Peer(); }
        catch (e) { ui.mpHostInfo.textContent = 'Ошибка: ' + e.message; return; }
        MP.peer.on('open', function (id) {
            MP.myId = id;
            ui.mpHostId.textContent = id;
            ui.mpHostInfo.textContent = 'Ожидание игроков...';
            ui.mpHostInfo.className = 'mp-info success';
        });
        MP.peer.on('connection', function (conn) {
            MP.connections.push(conn);
            conn.on('open', function () {
                const idx = MP.connections.length;
                const team = (MP.mode === '1v1') ? 1 : (idx % 2);
                const slot = (MP.mode === '1v1') ? 0 : Math.floor((idx - 1) / 2);
                try {
                    conn.send({ t: 'welcome', yourId: conn.peer, team, slot,
                        mode: MP.mode, map: selectedMapIdx, killLimit: MP.killLimit });
                } catch (e) {}
                if (MP.connections.length + 1 >= 2) ui.btnMpStart.disabled = false;
                sfxConnect();
            });
            conn.on('data', function (data) { mpHandleMessage(data, conn); });
        });
    }
    function mpJoinGame(hostId) {
        mpDestroyPeer();
        MP.isHost = false;
        try { MP.peer = new Peer(); }
        catch (e) { ui.mpJoinInfo.textContent = 'Ошибка'; return; }
        MP.peer.on('open', function (id) {
            MP.myId = id;
            const conn = MP.peer.connect(hostId, { reliable: true });
            MP.connections = [conn];
            conn.on('open', function () {
                ui.mpJoinInfo.textContent = 'Подключено! Ожидание старта...';
                ui.mpJoinInfo.className = 'mp-info success';
            });
            conn.on('data', function (data) { mpHandleMessage(data, conn); });
        });
    }
    function mpStartGame() {
        state.running = true; state.paused = false; state.gameOver = false;
        MP.active = true; MP.winnerTeam = -1;
        MP.myKills = 0; MP.myDeaths = 0;
        enemies = []; grenades = [];
        MAP_LIST[selectedMapIdx].build();
        buildWorldFromMap();
        const sp = mpGetSpawn(MP.myTeam, MP.mySlot);
        player.x = sp.x; player.z = sp.z;
        player.hp = player.maxHp;
        ui.menuStart.classList.add('hidden');
        ui.menuMp.classList.add('hidden');
        ui.menuOver.classList.add('hidden');
        ui.crosshair.classList.add('active');
        ui.scoreboard.classList.remove('hidden');
        if (!isTouchDevice && canvas.requestPointerLock) canvas.requestPointerLock();
    }

    /* =========================================================
     ОРУЖИЕ — ЛОГИКА
     ========================================================= */
    function currentDef() { return WEAPON_CATALOG[player.currentWeaponId] || WEAPON_CATALOG.knife; }
    function currentState() { return player.weapons[player.currentWeaponId] || { mag: 0, reserve: 0 }; }
    function ownsWeapon(id) { return !!player.ownedWeapons[id]; }
    function initWeaponState(id) {
        const def = WEAPON_CATALOG[id];
        if (!def) return;
        if (!player.weapons[id]) {
            player.weapons[id] = { mag: def.magSize || 0, reserve: def.startReserve || 0 };
        }
    }
    function switchToCategory(cat) {
        if (state.gameOver || !state.running) return;
        if (player.switching) return;
        if (player.hp <= 0) return;
        let targetId = null;
        if (cat === 'melee') {
            targetId = player.lastMelee;
            if (!ownsWeapon(targetId)) targetId = 'knife';
        } else if (cat === 'pistol') {
            targetId = player.lastPistol;
            if (!ownsWeapon(targetId)) {
                for (let i = 0; i < CATEGORY_ITEMS.pistol.length; i++)
                    if (ownsWeapon(CATEGORY_ITEMS.pistol[i])) { targetId = CATEGORY_ITEMS.pistol[i]; break; }
            }
        } else if (cat === 'smg') {
            targetId = player.lastSmg;
            if (!targetId || !ownsWeapon(targetId)) {
                for (let i = 0; i < CATEGORY_ITEMS.smg.length; i++)
                    if (ownsWeapon(CATEGORY_ITEMS.smg[i])) { targetId = CATEGORY_ITEMS.smg[i]; break; }
            }
        } else if (cat === 'rifle') {
            targetId = player.lastRifle;
            if (!targetId || !ownsWeapon(targetId)) {
                for (let i = 0; i < CATEGORY_ITEMS.rifle.length; i++)
                    if (ownsWeapon(CATEGORY_ITEMS.rifle[i])) { targetId = CATEGORY_ITEMS.rifle[i]; break; }
            }
        } else if (cat === 'sniper') {
            targetId = player.lastSniper;
            if (!targetId || !ownsWeapon(targetId)) {
                for (let i = 0; i < CATEGORY_ITEMS.sniper.length; i++)
                    if (ownsWeapon(CATEGORY_ITEMS.sniper[i])) { targetId = CATEGORY_ITEMS.sniper[i]; break; }
            }
        } else if (cat === 'shotgun') {
            targetId = player.lastShotgun;
            if (!targetId || !ownsWeapon(targetId)) {
                for (let i = 0; i < CATEGORY_ITEMS.shotgun.length; i++)
                    if (ownsWeapon(CATEGORY_ITEMS.shotgun[i])) { targetId = CATEGORY_ITEMS.shotgun[i]; break; }
            }
        }
        if (!targetId || !ownsWeapon(targetId)) { sfxDenied(); return; }
        switchToWeapon(targetId);
    }
    function switchToWeapon(id) {
        if (id === player.currentWeaponId) return;
        if (!ownsWeapon(id)) { sfxDenied(); return; }
        if (player.reloading) { player.reloading = false; ui.reload.classList.remove('active'); }
        player.scoped = false;
        ui.scopeOverlay.classList.remove('active');
        player.switching = true;
        player.switchTimer = 0.42;
        player.switchTargetId = id;
        sfxSwitch();
        renderWeaponSlots();
    }
    function equipCategory(id) {
        const def = WEAPON_CATALOG[id];
        if (!def) return;
        if (def.cat === 'melee') player.lastMelee = id;
        else if (def.cat === 'pistol') player.lastPistol = id;
        else if (def.cat === 'smg') player.lastSmg = id;
        else if (def.cat === 'rifle') player.lastRifle = id;
        else if (def.cat === 'sniper') player.lastSniper = id;
        else if (def.cat === 'shotgun') player.lastShotgun = id;
        else if (def.cat === 'grenade') player.grenadeType = id;
    }
    function damagePlayer(amount) {
        if (state.gameOver || MP.active) return;
        player.hp -= amount;
        damageFlash = Math.min(1, damageFlash + 0.75);
        sfxHurt();
        if (player.hp <= 0) { player.hp = 0; endGame(); }
        updateHUD();
    }
    function startReload() {
        const def = currentDef();
        if (def.cat === 'melee' || def.cat === 'grenade') return;
        if (player.reloading || player.switching) return;
        if (player.hp <= 0) return;
        const w = currentState();
        if (w.mag >= def.magSize) return;
        if (w.reserve <= 0) return;
        player.reloading = true;
        player.reloadDuration = def.reloadTime || 1.4;
        player.reloadTimer = player.reloadDuration;
        ui.reload.classList.add('active');
        sfxReload();
    }
    function finishReload() {
        const def = currentDef();
        const w = currentState();
        const need = def.magSize - w.mag;
        const take = Math.min(need, w.reserve);
        w.mag += take; w.reserve -= take;
        player.reloading = false;
        ui.reload.classList.remove('active');
        updateHUD();
    }
    function getAimDir() {
        const pitchCos = Math.cos(player.pitch);
        return new THREE.Vector3(
            -Math.sin(player.angle) * pitchCos,
            Math.sin(player.pitch),
            -Math.cos(player.angle) * pitchCos
        );
    }
    function fireMelee() {
        const def = currentDef();
        player.fireCooldown = def.cooldown;
        player.meleeAnim = 0.32;
        sfxKnife();
        const dir = getAimDir();
        const range = def.range;
        let best = null, bestDot = 0.5;
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (!e.alive) continue;
            const dx = e.x - player.x, dz = e.z - player.z;
            const d = Math.hypot(dx, dz);
            if (d > range) continue;
            const dot = (dx*dir.x + dz*dir.z) / (d || 1e-6);
            if (dot > bestDot) { bestDot = dot; best = e; }
        }
        if (best) {
            best.hp -= def.damage;
            best.hitFlash = 0.15;
            if (best.hp <= 0) killEnemy(best, 'melee');
            showHitmarker(); sfxHit();
        }
    }
    function fireGun() {
        const def = currentDef();
        const w = currentState();
        if (w.mag <= 0) { sfxEmpty(); player.fireCooldown = 0.28; startReload(); return; }
        w.mag--;
        player.fireCooldown = def.cooldown;
        player.recoil = 1;
        player.muzzleFlashTimer = 0.07;
        player.pitch = Math.min(PITCH_MAX, player.pitch + def.spread * 0.6 + 0.012);
        sfxShot(def.id);
        updateHUD();

        muzzleLight.position.copy(camera.position);
        muzzleLight.intensity = 4;
        setTimeout(function () { muzzleLight.intensity = 0; }, 50);

        const pellets = def.pellets || 1;
        const spread = def.spread * (player.scoped ? 0.2 : 1) * (player.bobAmount > 0.4 ? 1.6 : 1);

        for (let p = 0; p < pellets; p++) {
            const dir = getAimDir();
            dir.x += (Math.random() - 0.5) * spread * 2;
            dir.y += (Math.random() - 0.5) * spread * 2;
            dir.z += (Math.random() - 0.5) * spread * 2;
            dir.normalize();

            const maxRange = 50;
            let wallDist = maxRange;
            for (let d = 0.3; d < maxRange; d += 0.1) {
                const tx = player.x + dir.x * d;
                const tz = player.z + dir.z * d;
                const ty = player.footZ + (player.crouching ? CAM_CROUCH : CAM_STAND) + dir.y * d;
                if (at(Math.floor(tx), Math.floor(tz)) !== 0 && ty < WALL_HEIGHT) { wallDist = d; break; }
            }

            let bestEnemy = null, bestDist = Infinity;
            for (let i = 0; i < enemies.length; i++) {
                const e = enemies[i];
                if (!e.alive) continue;
                const dx = e.x - player.x, dz = e.z - player.z;
                const t = dx * dir.x + dz * dir.z;
                if (t <= 0 || t > wallDist) continue;
                const perpX = dx - dir.x * t;
                const perpZ = dz - dir.z * t;
                const perp = Math.hypot(perpX, perpZ);
                if (perp > 0.45) continue;
                const rayY = player.footZ + (player.crouching ? CAM_CROUCH : CAM_STAND) + dir.y * t;
                if (rayY < 0.1 || rayY > 2.0) continue;
                if (t < bestDist) { bestDist = t; bestEnemy = e; }
            }
            if (bestEnemy) {
                bestEnemy.hp -= def.damage;
                bestEnemy.hitFlash = 0.12;
                if (bestEnemy.hp <= 0) killEnemy(bestEnemy, 'gun');
                showHitmarker();
            }
            if (p === 0) spawnTracer(dir, wallDist);
        }
        if (def.pellets) sfxHit();
    }
    function spawnTracer(dir, dist) {
        const startX = player.x + dir.x * 0.4;
        const startZ = player.z + dir.z * 0.4;
        const startY = player.footZ + (player.crouching ? CAM_CROUCH : CAM_STAND) - 0.15;
        const endX = player.x + dir.x * dist;
        const endZ = player.z + dir.z * dist;
        const endY = player.footZ + (player.crouching ? CAM_CROUCH : CAM_STAND) + dir.y * dist;
        const positions = new Float32Array([startX, startY, startZ, endX, endY, endZ]);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.LineBasicMaterial({ color: 0xffe066, transparent: true, opacity: 1 });
        const line = new THREE.Line(geo, mat);
        scene.add(line);
        let t = 0;
        const interval = setInterval(function () {
            t += 0.03;
            mat.opacity = Math.max(0, 1 - t / 0.08);
            if (t > 0.08) { clearInterval(interval); scene.remove(line); geo.dispose(); mat.dispose(); }
        }, 20);
    }
    function shoot() {
        if (state.gameOver || state.paused || !state.running) return;
        if (player.reloading || player.switching) return;
        if (player.fireCooldown > 0) return;
        if (player.hp <= 0) return;
        const def = currentDef();
        if (def.cat === 'melee') fireMelee();
        else if (def.cat === 'grenade') throwGrenade();
        else fireGun();
    }
    function killEnemy(e, source) {
        e.alive = false;
        e.deadTimer = 7;
        player.score += 100 + state.wave * 15;
        sfxKill();
        let reward = KILL_REWARD;
        if (source === 'melee') reward += 100;
        if (source === 'grenade') reward += 50;
        addMoney(reward);
        animateSoldier(e.mesh, 0, false);
        e.mesh.position.y = 0.2;
        updateHUD();
    }
    function addMoney(amount) {
        player.money += amount;
        player.earnedThisGame += amount;
        updateHUD();
        sfxMoney();
        saveInventory();
    }

    /* =========================================================
     ОБНОВЛЕНИЕ ОРУЖИЯ
     ========================================================= */
    function updateWeapon(dt) {
        if (player.fireCooldown > 0) player.fireCooldown -= dt;
        if (player.recoil > 0) player.recoil = Math.max(0, player.recoil - dt * 7);
        if (player.muzzleFlashTimer > 0) player.muzzleFlashTimer -= dt;
        if (damageFlash > 0) damageFlash = Math.max(0, damageFlash - dt * 2.2);
        if (player.meleeAnim > 0) player.meleeAnim = Math.max(0, player.meleeAnim - dt);
        player.breathPhase += dt * 0.9;
        if (player.switching) {
            player.switchTimer -= dt;
            if (player.switchTimer <= 0.21 && player.switchTargetId) {
                player.currentWeaponId = player.switchTargetId;
                equipCategory(player.currentWeaponId);
                player.switchTargetId = null;
                player.scoped = false;
                ui.scopeOverlay.classList.remove('active');
                initWeaponState(player.currentWeaponId);
                equipWeaponModel(player.currentWeaponId);
                updateHUD(); updateScopeButton(); renderWeaponSlots();
            }
            if (player.switchTimer <= 0) { player.switching = false; renderWeaponSlots(); }
        }
        if (player.reloading) {
            player.reloadTimer -= dt;
            if (player.reloadTimer <= 0) finishReload();
        }
        let lower = 0;
        if (player.switching) { lower = Math.sin((1 - player.switchTimer / 0.42) * Math.PI) * 0.35; }
        if (player.reloading) {
            const rl = Math.sin((1 - player.reloadTimer / player.reloadDuration) * Math.PI) * 0.4;
            if (rl > lower) lower = rl;
        }
        player.weaponLower = lower;

        const def = currentDef();
        const weaponModel = weaponModels[player.currentWeaponId];
        if (weaponModel && weaponModel.mesh.parent === weaponHolder) {
            const bobX = Math.sin(player.bobPhase) * 0.02 * player.bobAmount;
            const bobY = Math.abs(Math.cos(player.bobPhase)) * 0.015 * player.bobAmount;
            const breathX = Math.sin(player.breathPhase) * 0.003;
            const breathY = Math.cos(player.breathPhase * 0.7) * 0.003;
            const recoil = player.recoil * 0.06;
            let mx = 0.22 + bobX + breathX;
            let my = -0.22 + bobY + breathY - lower * 0.2;
            let mz = -0.55 + recoil;
            if (def.cat === 'melee' && player.meleeAnim > 0) {
                const s = Math.sin((1 - player.meleeAnim / 0.32) * Math.PI);
                mx -= s * 0.15;
                my -= s * 0.1;
                mz += s * 0.05;
            }
            weaponModel.mesh.position.x += (mx - weaponModel.mesh.position.x) * Math.min(1, dt * 20);
            weaponModel.mesh.position.y += (my - weaponModel.mesh.position.y) * Math.min(1, dt * 20);
            weaponModel.mesh.position.z += (mz - weaponModel.mesh.position.z) * Math.min(1, dt * 20);
            weaponModel.mesh.rotation.z = (player.weaponSway.x || 0) * 0.4;
            weaponModel.mesh.rotation.x = -recoil * 2 + (player.weaponSway.y || 0) * 0.3;
        }
    }

    /* =========================================================
     ФИЗИКА ИГРОКА
     ========================================================= */
    function updatePlayer(dt) {
        if (MP.active && player.hp <= 0) {
            MP.respawnTimer -= dt;
            if (MP.respawnTimer <= 0) mpRespawn();
            return;
        }
        player.crouching = !!(keys['ShiftLeft'] || keys['ShiftRight'] ||
            keys['ControlLeft'] || keys['ControlRight'] || touchCrouch);
        if ((keys['Space'] || touchJump) && player.onGround) {
            player.vz = JUMP_VZ;
            player.onGround = false;
            sfxJump();
            touchJump = false;
        }
        if (!player.onGround) {
            player.vz -= GRAVITY * dt;
            player.footZ += player.vz * dt;
            if (player.footZ <= 0) { player.footZ = 0; player.vz = 0; player.onGround = true; sfxLand(); }
        }
        const forwardX = -Math.sin(player.angle);
        const forwardZ = -Math.cos(player.angle);
        const rightX = Math.cos(player.angle);
        const rightZ = -Math.sin(player.angle);
        let fwd = 0, str = 0;
        if (keys['KeyW'] || keys['ArrowUp']) fwd += 1;
        if (keys['KeyS'] || keys['ArrowDown']) fwd -= 1;
        if (keys['KeyD']) str += 1;
        if (keys['KeyA']) str -= 1;
        if (isTouchDevice) { fwd += -moveVec.y; str += moveVec.x; }
        let vx = forwardX * fwd + rightX * str;
        let vz = forwardZ * fwd + rightZ * str;
        const len = Math.hypot(vx, vz);
        if (len > 0.001) {
            vx /= len; vz /= len;
            player.bobPhase += dt * 11;
            player.bobAmount = Math.min(1, player.bobAmount + dt * 5);
        } else {
            player.bobAmount = Math.max(0, player.bobAmount - dt * 5);
        }
        const targetSway = { x: -vx * len * 0.02, y: -vz * len * 0.02 };
        player.weaponSway.x += (targetSway.x - player.weaponSway.x) * Math.min(1, dt * 6);
        player.weaponSway.y += (targetSway.y - player.weaponSway.y) * Math.min(1, dt * 6);
        const speedMult = player.crouching ? CROUCH_SPEED_MUL : 1;
        const speed = MOVE_SPEED * dt * speedMult * (player.scoped ? 0.45 : 1);
        tryMove(player, vx * speed, vz * speed, PLAYER_RADIUS);
        const camY = player.footZ + (player.crouching ? CAM_CROUCH : CAM_STAND);
        camera.position.x = player.x;
        camera.position.z = player.z;
        camera.position.y += (camY - camera.position.y) * Math.min(1, dt * 12);
        camera.position.y += Math.sin(player.bobPhase * 2) * 0.015 * player.bobAmount;
        const targetFOV = player.scoped ? 25 : 75;
        camera.fov += (targetFOV - camera.fov) * Math.min(1, dt * 12);
        camera.updateProjectionMatrix();
        updateWeapon(dt);
        updateGrenades(dt);
        playerLight.position.set(player.x, camera.position.y, player.z);
        if (input.fire) {
            const canFire = (isTouchDevice || document.pointerLockElement === canvas);
            if (canFire) {
                const def = currentDef();
                if (def.auto || player.fireCooldown <= 0) shoot();
            }
        }
    }

    /* =========================================================
     HUD
     ========================================================= */
    function updateHUD() {
        ui.hp.textContent = Math.max(0, Math.ceil(player.hp));
        const pct = Math.max(0, player.hp / player.maxHp) * 100;
        ui.hpBar.style.width = pct + '%';
        ui.hpBar.classList.remove('mid', 'low');
        if (pct <= 30) ui.hpBar.classList.add('low');
        else if (pct <= 60) ui.hpBar.classList.add('mid');
        const def = currentDef();
        const w = currentState();
        if (def.cat === 'melee' || def.cat === 'grenade') ui.ammo.textContent = '—';
        else ui.ammo.textContent = w.mag + ' / ' + w.reserve;
        ui.grenades.textContent = player.grenades;
        ui.money.textContent = player.money;
        ui.score.textContent = MP.active ? MP.myKills : player.score;
        ui.wave.textContent = state.wave;
        ui.weaponName.textContent = def.name;
        const skin = getSkinForWeapon(player.currentWeaponId);
        ui.skinName.textContent = skin.name;
        const mapDef = MAP_LIST[selectedMapIdx];
        ui.mapNameHud.textContent = mapDef ? mapDef.name : '';
    }
    function showHitmarker() {
        ui.hitmarker.classList.remove('show');
        void ui.hitmarker.offsetWidth;
        ui.hitmarker.classList.add('show');
    }
    function announce(text) {
        ui.announce.textContent = text;
        ui.announce.classList.add('show');
        clearTimeout(announceTimer);
        announceTimer = setTimeout(function () { ui.announce.classList.remove('show'); }, 1800);
    }
    function updateScopeButton() {
        const def = currentDef();
        if (def.scope) ui.btnScopeMob.classList.add('visible');
        else ui.btnScopeMob.classList.remove('visible');
    }
    function buildWeaponSlots() {
        ui.weaponSlots.innerHTML = '';
        const cats = [
            { id:'melee', label:'1', icon:'🔪' },
            { id:'pistol', label:'2', icon:'🔫' },
            { id:'smg', label:'3', icon:'💥' },
            { id:'rifle', label:'4', icon:'🎯' },
            { id:'sniper', label:'5', icon:'🔭' },
            { id:'shotgun', label:'6', icon:'🔥' },
            { id:'grenade', label:'7', icon:'💣' }
        ];
        for (let i = 0; i < cats.length; i++) {
            const c = cats[i];
            const btn = document.createElement('button');
            btn.className = 'weapon-slot';
            btn.dataset.cat = c.id;
            btn.innerHTML = '<span class="ws-icon">' + c.icon + '</span><span class="ws-key">' + c.label + '</span>';
            (function (cat) {
                btn.addEventListener('touchstart', function (e) {
                    e.stopPropagation(); e.preventDefault();
                    if (cat === 'grenade') throwGrenade();
                    else switchToCategory(cat);
                }, { passive: false });
                btn.addEventListener('mousedown', function (e) {
                    e.stopPropagation();
                    if (cat === 'grenade') throwGrenade();
                    else switchToCategory(cat);
                });
            })(c.id);
            ui.weaponSlots.appendChild(btn);
        }
        renderWeaponSlots();
    }
    function renderWeaponSlots() {
        const slots = ui.weaponSlots.querySelectorAll('.weapon-slot');
        const curDef = currentDef();
        for (let i = 0; i < slots.length; i++) {
            const cat = slots[i].dataset.cat;
            slots[i].classList.remove('active', 'empty');
            if (cat === curDef.cat) slots[i].classList.add('active');
            if (cat === 'grenade' && player.grenades <= 0) slots[i].classList.add('empty');
            // Проверяем наличие оружия в категории
            if (cat !== 'grenade' && cat !== 'melee') {
                const list = CATEGORY_ITEMS[cat];
                if (list) {
                    let has = false;
                    for (let k = 0; k < list.length; k++) if (ownsWeapon(list[k])) { has = true; break; }
                    if (!has) slots[i].classList.add('empty');
                }
            }
        }
    }

    /* =========================================================
     МАГАЗИН / ИНВЕНТАРЬ
     ========================================================= */
    let currentShopCat = 'melee';

    function openShop() {
        ui.shopMoney.textContent = '$' + player.money;
        ui.shopCategories.querySelectorAll('.shop-cat').forEach(function (b) {
            if (b.dataset.cat === currentShopCat) b.classList.add('selected', 'active');
            else b.classList.remove('selected', 'active');
        });
        renderShopItems(currentShopCat);
        hideAllOverlays();
        ui.menuShop.classList.remove('hidden');
    }
    function closeShop() {
        ui.menuShop.classList.add('hidden');
        if (state.running && state.paused) ui.menuPause.classList.remove('hidden');
        else if (!state.running) ui.menuStart.classList.remove('hidden');
        else {
            state.paused = false;
            ui.crosshair.classList.add('active');
            if (!isTouchDevice && canvas.requestPointerLock) canvas.requestPointerLock();
        }
    }

    // Определяем "категорию" скина для показа
    function skinDisplayName(skin) {
        if (skin.weapons === '*') return 'ВСЁ ОРУЖИЕ';
        if (Array.isArray(skin.weapons)) {
            const wIds = skin.weapons.map(function (w) { return WEAPON_CATALOG[w] ? WEAPON_CATALOG[w].name : w; });
            if (wIds.length <= 3) return wIds.join(', ');
            return wIds.length + ' видов';
        }
        return '';
    }

    function renderShopItems(cat) {
        ui.shopItems.innerHTML = '';

        if (cat === 'skins') {
            renderSkinsList();
            return;
        }
        if (cat === 'cases') {
            renderCasesList();
            return;
        }

        const items = CATEGORY_ITEMS[cat] || [];
        for (let i = 0; i < items.length; i++) {
            const id = items[i];
            const def = WEAPON_CATALOG[id];
            if (!def) continue;
            const owned = ownsWeapon(id);
            const equipped = (player.currentWeaponId === id);
            const canAfford = player.money >= def.price;
            const isGrenade = def.cat === 'grenade';

            const card = document.createElement('div');
            card.className = 'shop-item' + (owned && !isGrenade ? ' owned' : '') + (equipped ? ' equipped' : '');

            const preview = document.createElement('div');
            preview.className = 'weapon-preview';
            const skin = getSkinForWeapon(id);
            const c = skin.colors;
            const hex = '#' + c.primary.toString(16).padStart(6,'0');
            preview.style.background = 'linear-gradient(135deg, ' + hex + ' 0%, rgba(0,0,0,0.6) 100%)';
            preview.innerHTML = '<span style="position:relative;z-index:2">' + def.icon + '</span>';

            const info = document.createElement('div'); info.className = 'shop-info';
            const nm = document.createElement('div'); nm.className = 'shop-name'; nm.textContent = def.name;
            const ds = document.createElement('div'); ds.className = 'shop-desc'; ds.textContent = def.desc;
            const st = document.createElement('div'); st.className = 'shop-stats';
            for (const k in def.stats) {
                const s = document.createElement('span');
                s.innerHTML = k + ': <b>' + def.stats[k] + '</b>';
                st.appendChild(s);
            }
            info.appendChild(nm); info.appendChild(ds); info.appendChild(st);

            const priceBox = document.createElement('div'); priceBox.className = 'shop-price';

            if (isGrenade) {
                const countTag = document.createElement('span');
                countTag.style.fontSize = '11px'; countTag.style.color = '#8fa4b8';
                countTag.textContent = 'В ИНВ: ' + player.grenades;
                priceBox.appendChild(countTag);
                const pv = document.createElement('span');
                pv.className = 'shop-price-value' + (canAfford ? '' : ' cant');
                pv.textContent = '$' + def.price;
                priceBox.appendChild(pv);
                const buy = document.createElement('button');
                buy.className = 'shop-buy'; buy.textContent = 'КУПИТЬ'; buy.disabled = !canAfford;
                buy.addEventListener('click', function () {
                    if (player.money < def.price) { sfxDenied(); return; }
                    player.money -= def.price; player.grenades++;
                    player.grenadeType = id;
                    sfxBuy(); ui.shopMoney.textContent = '$' + player.money;
                    updateHUD(); saveInventory(); renderShopItems(currentShopCat); renderWeaponSlots();
                });
                priceBox.appendChild(buy);
            } else if (owned) {
                const tag = document.createElement('span');
                tag.className = 'shop-owned-tag';
                tag.textContent = equipped ? 'В РУКАХ' : 'КУПЛЕНО';
                priceBox.appendChild(tag);
                const useBtn = document.createElement('button');
                useBtn.className = 'shop-buy';
                useBtn.style.background = 'linear-gradient(180deg, #ffcb63, #f59e0b)';
                useBtn.style.boxShadow = '0 3px 0 #a8690a';
                useBtn.style.color = '#17110a';
                useBtn.textContent = equipped ? 'ВЫБРАНО' : 'ВЗЯТЬ';
                useBtn.disabled = equipped;
                useBtn.addEventListener('click', function () {
                    equipCategory(id); initWeaponState(id); sfxBuy();
                    renderShopItems(currentShopCat); renderWeaponSlots();
                });
                priceBox.appendChild(useBtn);
            } else {
                const pv = document.createElement('span');
                pv.className = 'shop-price-value' + (canAfford ? '' : ' cant');
                pv.textContent = '$' + def.price;
                priceBox.appendChild(pv);
                const buy = document.createElement('button');
                buy.className = 'shop-buy'; buy.textContent = 'КУПИТЬ'; buy.disabled = !canAfford;
                buy.addEventListener('click', function () {
                    if (player.money < def.price) { sfxDenied(); return; }
                    player.money -= def.price;
                    player.ownedWeapons[id] = true;
                    initWeaponState(id);
                    equipCategory(id);
                    if (state.running) switchToWeapon(id);
                    else player.currentWeaponId = id;
                    sfxBuy(); ui.shopMoney.textContent = '$' + player.money;
                    updateHUD(); saveInventory(); renderShopItems(currentShopCat); renderWeaponSlots();
                });
                priceBox.appendChild(buy);
            }
            card.appendChild(preview); card.appendChild(info); card.appendChild(priceBox);
            ui.shopItems.appendChild(card);
        }
    }

    function renderSkinsList() {
        // Показываем только скины, которые игрок может использовать на своём текущем оружии
        const list = SKINS.slice();
        // Сортируем: сначала экипированные, потом доступные (owned), потом недоступные
        list.sort(function (a, b) {
            const aOwn = player.ownedSkins[a.id] ? 0 : 1;
            const bOwn = player.ownedSkins[b.id] ? 0 : 1;
            if (aOwn !== bOwn) return aOwn - bOwn;
            return 0;
        });
        for (let i = 0; i < list.length; i++) {
            const skin = list[i];
            const owned = !!player.ownedSkins[skin.id];
            const card = document.createElement('div');
            card.className = 'shop-item';
            // Является ли этот скин экипированным на текущем оружии?
            const isEquipped = (player.equippedSkins[player.currentWeaponId] === skin.id) ||
                (skin.id === 'default' && !player.equippedSkins[player.currentWeaponId]);
            if (isEquipped) card.classList.add('skin-equipped');

            // Проверим, применим ли этот скин к текущему оружию
            const applicable = (skin.weapons === '*' || (Array.isArray(skin.weapons) && skin.weapons.indexOf(player.currentWeaponId) >= 0));

            const swatch = document.createElement('div');
            swatch.className = 'skin-swatch';
            const c = skin.colors;
            const hex1 = '#' + c.primary.toString(16).padStart(6,'0');
            const hex2 = '#' + c.secondary.toString(16).padStart(6,'0');
            swatch.style.background = 'linear-gradient(135deg, ' + hex1 + ' 0%, ' + hex2 + ' 100%)';
            swatch.innerHTML = '<span class="swatch-icon">🎨</span>';

            const info = document.createElement('div'); info.className = 'shop-info';
            const nm = document.createElement('div'); nm.className = 'shop-name rarity-' + skin.rarity;
            nm.textContent = skin.name;
            const r = document.createElement('div'); r.className = 'shop-desc';
            r.textContent = RARITY_NAMES[skin.rarity] + ' • ' + skinDisplayName(skin);
            const st = document.createElement('div'); st.className = 'shop-stats';
            const st1 = document.createElement('span'); st1.innerHTML = 'Оружие: <b>' + (applicable ? 'ПОДХОДИТ' : 'нет') + '</b>';
            st.appendChild(st1);
            info.appendChild(nm); info.appendChild(r); info.appendChild(st);

            const priceBox = document.createElement('div'); priceBox.className = 'shop-price';

            if (owned) {
                const tag = document.createElement('span');
                tag.className = 'shop-owned-tag';
                tag.textContent = isEquipped ? 'НА ОРУЖИИ' : 'КУПЛЕНО';
                priceBox.appendChild(tag);
                if (applicable) {
                    const useBtn = document.createElement('button');
                    useBtn.className = 'shop-buy';
                    useBtn.style.background = 'linear-gradient(180deg, #b06cff, #7a41c8)';
                    useBtn.style.boxShadow = '0 3px 0 #4a1f80';
                    useBtn.style.color = '#f0e8ff';
                    useBtn.textContent = isEquipped ? 'НАДЕТО' : 'НАДЕТЬ';
                    useBtn.disabled = isEquipped;
                    useBtn.addEventListener('click', function () {
                        player.equippedSkins[player.currentWeaponId] = skin.id;
                        equipWeaponModel(player.currentWeaponId);
                        sfxBuy(); updateHUD(); saveInventory();
                        renderSkinsList();
                    });
                    priceBox.appendChild(useBtn);
                } else {
                    const noBtn = document.createElement('span');
                    noBtn.style.fontSize = '10px';
                    noBtn.style.color = '#667889';
                    noBtn.textContent = 'Смени оружие';
                    priceBox.appendChild(noBtn);
                }
            } else {
                // Нельзя купить скин — только получить из кейса
                const noBtn = document.createElement('span');
                noBtn.style.fontSize = '10px';
                noBtn.style.color = '#667889';
                noBtn.style.letterSpacing = '1px';
                noBtn.textContent = '📦 ТОЛЬКО ИЗ КЕЙСА';
                priceBox.appendChild(noBtn);
            }

            card.appendChild(swatch); card.appendChild(info); card.appendChild(priceBox);
            ui.shopItems.appendChild(card);
        }
    }

    function renderCasesList() {
        for (let i = 0; i < CASES.length; i++) {
            const c = CASES[i];
            const card = document.createElement('div');
            card.className = 'case-item';

            const icon = document.createElement('div'); icon.className = 'case-icon'; icon.textContent = c.icon;

            const info = document.createElement('div'); info.className = 'case-info';
            const nm = document.createElement('div'); nm.className = 'case-name'; nm.textContent = c.name;
            const ds = document.createElement('div'); ds.className = 'case-desc'; ds.textContent = c.desc;
            const rar = document.createElement('div'); rar.className = 'case-rarities';
            // Собираем уникальные редкости в пуле
            const seen = {};
            for (let k = 0; k < c.pool.length; k++) {
                const s = SKINS_BY_ID[c.pool[k]];
                if (s && !seen[s.rarity]) {
                    seen[s.rarity] = true;
                    const dot = document.createElement('span');
                    dot.className = 'case-rarity-dot ' + s.rarity;
                    rar.appendChild(dot);
                }
            }
            info.appendChild(nm); info.appendChild(ds); info.appendChild(rar);

            const priceBox = document.createElement('div'); priceBox.className = 'shop-price';
            const pv = document.createElement('span');
            const canAfford = player.money >= c.price;
            pv.className = 'shop-price-value' + (canAfford ? '' : ' cant');
            pv.textContent = '$' + c.price;
            priceBox.appendChild(pv);
            const buy = document.createElement('button');
            buy.className = 'shop-buy'; buy.textContent = 'ОТКРЫТЬ'; buy.disabled = !canAfford;
            buy.addEventListener('click', function () {
                if (player.money < c.price) { sfxDenied(); return; }
                player.money -= c.price;
                sfxBuy();
                ui.shopMoney.textContent = '$' + player.money;
                updateHUD(); saveInventory();
                openCase(c);
            });
            priceBox.appendChild(buy);

            card.appendChild(icon); card.appendChild(info); card.appendChild(priceBox);
            ui.shopItems.appendChild(card);
        }
    }

    /* =========================================================
     ОТКРЫТИЕ КЕЙСА
     ========================================================= */
    let currentCase = null;

    function openCase(c) {
        currentCase = c;
        state.openingCase = c.id;
        state.caseAnimating = false;
        ui.caseTitle.textContent = 'ОТКРЫТИЕ: ' + c.name;
        ui.caseOpenPrice.textContent = '$' + c.price;
        ui.caseResult.classList.add('hidden');
        ui.btnCaseOpen.disabled = false;
        ui.btnCaseOpen.textContent = 'ОТКРЫТЬ — $' + c.price;
        ui.btnCaseOpen.innerHTML = 'ОТКРЫТЬ — <span id="case-open-price">$' + c.price + '</span>';
        ui.btnCaseOpen.disabled = player.money < c.price;
        hideAllOverlays();
        ui.menuCase.classList.remove('hidden');
        // Пустая лента
        ui.caseReel.innerHTML = '';
    }

    function rollCase() {
        if (!currentCase) return;
        if (state.caseAnimating) return;
        if (player.money < currentCase.price) { sfxDenied(); return; }
        player.money -= currentCase.price;
        ui.shopMoney.textContent = '$' + player.money;
        updateHUD(); saveInventory();
        sfxBuy();

        state.caseAnimating = true;
        ui.btnCaseOpen.disabled = true;
        ui.caseResult.classList.add('hidden');
        ui.caseReel.style.transition = 'none';
        ui.caseReel.style.transform = 'translateX(0px)';

        // Генерируем ленту: 40 случайных карточек + выигрыш на 32-й позиции
        const items = [];
        const reelLength = 40;
        const winIndex = 32;
        const pool = currentCase.pool;

        // Случайный скин по пулу (равномерно, но без учёта редкости — упрощённо)
        const winSkinId = pool[Math.floor(Math.random() * pool.length)];
        const winSkin = SKINS_BY_ID[winSkinId];

        for (let i = 0; i < reelLength; i++) {
            let skinId = winSkinId;
            if (i !== winIndex) skinId = pool[Math.floor(Math.random() * pool.length)];
            items.push(skinId);
        }

        // Рендерим
        ui.caseReel.innerHTML = '';
        const CARD_W = isMobile ? 90 : 110;
        const GAP = 12;
        for (let i = 0; i < items.length; i++) {
            const s = SKINS_BY_ID[items[i]];
            if (!s) continue;
            const card = document.createElement('div');
            card.className = 'reel-card rarity-' + s.rarity;
            const c = s.colors;
            const hex1 = '#' + c.primary.toString(16).padStart(6,'0');
            const hex2 = '#' + c.secondary.toString(16).padStart(6,'0');
            card.style.background = 'linear-gradient(135deg, ' + hex1 + ' 0%, ' + hex2 + ' 100%)';
            card.innerHTML = '<span class="reel-icon">🎨</span>' +
                '<span class="reel-rarity rarity-' + s.rarity + '">' + RARITY_NAMES[s.rarity].substring(0,6) + '</span>';
            ui.caseReel.appendChild(card);
        }

        // Позиция для выигрышной карточки: центр экрана
        const wrap = document.getElementById('case-reel-wrap');
        const wrapW = wrap.clientWidth;
        const cardTotalW = CARD_W + GAP;
        // Центрируем winIndex
        const targetOffset = -(winIndex * cardTotalW + CARD_W / 2 - wrapW / 2);

        // Небольшой случайный разброс, чтобы остановка не была в точности на центре
        const jitter = (Math.random() - 0.5) * (CARD_W * 0.6);
        const finalOffset = targetOffset + jitter;

        // Анимация через requestAnimationFrame
        const startTime = performance.now();
        const duration = 3200 + Math.random() * 600;
        let lastTickPos = 0;

        function ease(t) {
            // Кастомный ease-out для плавного замедления
            return 1 - Math.pow(1 - t, 3.5);
        }

        function frame(now) {
            const t = Math.min(1, (now - startTime) / duration);
            const e = ease(t);
            const off = e * finalOffset;
            ui.caseReel.style.transform = 'translateX(' + off + 'px)';
            // Тикаем при пересечении границ карточек
            if (Math.abs(off - lastTickPos) > cardTotalW) {
                lastTickPos = off;
                sfxCaseTick();
            }
            if (t < 1) {
                requestAnimationFrame(frame);
            } else {
                state.caseAnimating = false;
                // Сохраняем и показываем результат
                addSkinToInventory(winSkinId);
                ui.caseResult.classList.remove('hidden');
                const r = document.createElement('div');
                r.className = 'case-result-item';
                const hex1 = '#' + winSkin.colors.primary.toString(16).padStart(6,'0');
                r.style.color = hex1;
                r.innerHTML = '<span class="cri-icon">🎨</span>' +
                    '<span class="cri-name rarity-' + winSkin.rarity + '">' + winSkin.name + '</span>' +
                    '<span style="font-size:11px;color:#8fa4b8;letter-spacing:2px;font-weight:400">' + RARITY_NAMES[winSkin.rarity] + '</span>';
                ui.caseResultItem = ui.caseResultItem || document.getElementById('case-result-item');
                ui.caseResultItem.innerHTML = r.innerHTML;
                sfxCaseWin();
                ui.btnCaseOpen.disabled = player.money < currentCase.price;
                ui.btnCaseOpen.innerHTML = 'ОТКРЫТЬ ЕЩЁ — <span id="case-open-price">$' + currentCase.price + '</span>';
                updateHUD(); saveInventory();
            }
        }
        requestAnimationFrame(frame);
    }

    function addSkinToInventory(skinId) {
        if (!player.ownedSkins[skinId]) {
            player.ownedSkins[skinId] = true;
            saveInventory();
        }
    }

    /* =========================================================
     РЕКОРДЫ
     ========================================================= */
    function loadRecords() {
        try {
            const raw = localStorage.getItem(RECORDS_KEY);
            if (!raw) return [];
            const arr = JSON.parse(raw);
            if (!Array.isArray(arr)) return [];
            return arr;
        } catch (e) { return []; }
    }
    function saveRecord(score, wave, money) {
        const records = loadRecords();
        records.push({ score, wave, money: money || 0, date: new Date().toLocaleDateString('ru-RU') });
        records.sort(function (a, b) { return b.score - a.score; });
        const top = records.slice(0, 5);
        try { localStorage.setItem(RECORDS_KEY, JSON.stringify(top)); } catch (e) {}
        return top;
    }
    function renderRecords(listEl, records) {
        listEl.innerHTML = '';
        if (!records || records.length === 0) {
            const li = document.createElement('li');
            li.className = 'empty';
            li.textContent = 'Пока нет результатов';
            listEl.appendChild(li); return;
        }
        for (let i = 0; i < records.length; i++) {
            const r = records[i];
            const li = document.createElement('li');
            const rank = document.createElement('span'); rank.className = 'rank'; rank.textContent = (i + 1);
            const sc = document.createElement('span'); sc.className = 'r-score'; sc.textContent = r.score;
            const wv = document.createElement('span'); wv.className = 'r-wave'; wv.textContent = 'волна ' + r.wave;
            const dt = document.createElement('span'); dt.className = 'r-date'; dt.textContent = r.date || '';
            li.appendChild(rank); li.appendChild(sc); li.appendChild(wv); li.appendChild(dt);
            listEl.appendChild(li);
        }
    }

    /* =========================================================
     DOM
     ========================================================= */
    const ui = {
        hp: document.getElementById('hp-value'),
        hpBar: document.getElementById('hp-bar'),
        ammo: document.getElementById('ammo-value'),
        grenades: document.getElementById('grenade-value'),
        score: document.getElementById('score-value'),
        money: document.getElementById('money-value'),
        wave: document.getElementById('wave-value'),
        weaponName: document.getElementById('weapon-name'),
        skinName: document.getElementById('skin-name-hud'),
        mapNameHud: document.getElementById('map-name-hud'),
        reload: document.getElementById('reload-indicator'),
        hitmarker: document.getElementById('hitmarker'),
        announce: document.getElementById('announce'),
        crosshair: document.getElementById('crosshair'),
        scopeOverlay: document.getElementById('scope-overlay'),
        menuStart: document.getElementById('menu-start'),
        menuShop: document.getElementById('menu-shop'),
        menuCase: document.getElementById('menu-case'),
        menuMp: document.getElementById('menu-mp'),
        menuPause: document.getElementById('menu-pause'),
        menuOver: document.getElementById('menu-over'),
        recordsStart: document.getElementById('records-list-start'),
        recordsOver: document.getElementById('records-list-over'),
        overTitle: document.getElementById('over-title'),
        overLabel1: document.getElementById('over-label-1'),
        overLabel2: document.getElementById('over-label-2'),
        finalScore: document.getElementById('final-score'),
        finalWave: document.getElementById('final-wave'),
        finalMoney: document.getElementById('final-money'),
        btnStart: document.getElementById('btn-start'),
        btnOpenShop: document.getElementById('btn-open-shop'),
        btnShopClose: document.getElementById('btn-shop-close'),
        btnShopPause: document.getElementById('btn-shop-pause'),
        btnResume: document.getElementById('btn-resume'),
        btnRestart: document.getElementById('btn-restart'),
        btnAgain: document.getElementById('btn-again'),
        btnMenu: document.getElementById('btn-menu'),
        btnMenuOver: document.getElementById('btn-menu-over'),
        weaponSlots: document.getElementById('weapon-slots'),
        btnFireMob: document.getElementById('btn-fire-mobile'),
        btnReloadMob: document.getElementById('btn-reload-mobile'),
        btnScopeMob: document.getElementById('btn-scope-mobile'),
        btnGrenadeMob: document.getElementById('btn-grenade-mobile'),
        btnJumpMob: document.getElementById('btn-jump-mobile'),
        btnCrouchMob: document.getElementById('btn-crouch-mobile'),
        btnPauseMob: document.getElementById('btn-pause-mobile'),
        joystickBase: document.getElementById('joystick-base'),
        joystickKnob: document.getElementById('joystick-knob'),
        mapList: document.getElementById('map-list'),
        modeList: document.getElementById('mode-list'),
        shopMoney: document.getElementById('shop-money-value'),
        shopCategories: document.getElementById('shop-categories'),
        shopItems: document.getElementById('shop-items'),
        caseTitle: document.getElementById('case-title'),
        caseReel: document.getElementById('case-reel'),
        caseResult: document.getElementById('case-result'),
        caseOpenPrice: document.getElementById('case-open-price'),
        btnCaseOpen: document.getElementById('btn-case-open'),
        btnCaseClose: document.getElementById('btn-case-close'),
        mpModeTitle: document.getElementById('mp-mode-title'),
        mpChoose: document.getElementById('mp-step-choose'),
        mpHost: document.getElementById('mp-step-host'),
        mpJoin: document.getElementById('mp-step-join'),
        mpHostId: document.getElementById('mp-host-id'),
        mpHostInfo: document.getElementById('mp-host-info'),
        mpJoinInput: document.getElementById('mp-join-input'),
        mpJoinInfo: document.getElementById('mp-join-info'),
        btnMpHost: document.getElementById('btn-mp-host'),
        btnMpJoin: document.getElementById('btn-mp-join'),
        btnMpBack: document.getElementById('btn-mp-back'),
        btnMpStart: document.getElementById('btn-mp-start'),
        btnMpCancel: document.getElementById('btn-mp-cancel'),
        btnMpConnect: document.getElementById('btn-mp-connect'),
        btnMpJoinCancel: document.getElementById('btn-mp-join-cancel'),
        scoreboard: document.getElementById('mp-scoreboard')
    };

    /* =========================================================
     УПРАВЛЕНИЕ ИГРОЙ
     ========================================================= */
    function hideAllOverlays() {
        ui.menuStart.classList.add('hidden');
        ui.menuShop.classList.add('hidden');
        ui.menuCase.classList.add('hidden');
        ui.menuMp.classList.add('hidden');
        ui.menuPause.classList.add('hidden');
        ui.menuOver.classList.add('hidden');
    }

    function resetSingleGame() {
        MP.active = false;
        for (let i = 0; i < enemies.length; i++) if (enemies[i].mesh.parent) enemies[i].mesh.parent.remove(enemies[i].mesh);
        enemies = [];
        for (let i = 0; i < grenades.length; i++) if (grenades[i].mesh.parent) grenades[i].mesh.parent.remove(grenades[i].mesh);
        grenades = [];
        for (const id in MP.remotePlayers) {
            const rp = MP.remotePlayers[id];
            if (rp.mesh && rp.mesh.parent) rp.mesh.parent.remove(rp.mesh);
        }
        MP.remotePlayers = {};

        MAP_LIST[selectedMapIdx].build();
        buildWorldFromMap();

        const sp = MAP_LIST[selectedMapIdx].start;
        player.x = sp.x; player.z = sp.y; player.angle = sp.angle;
        player.pitch = 0; player.footZ = 0; player.vz = 0; player.onGround = true; player.crouching = false;
        player.hp = player.maxHp; player.score = 0; player.earnedThisGame = 0;
        player.grenades = 0;
        player.grenadeType = 'frag';

        player.reloading = false; player.reloadTimer = 0;
        player.fireCooldown = 0; player.recoil = 0;
        player.switching = false; player.switchTimer = 0; player.switchTargetId = null;
        player.weaponLower = 0; player.meleeAnim = 0; player.scoped = false;
        player.bobPhase = 0; player.bobAmount = 0; player.breathPhase = 0;
        player.weaponSway = { x: 0, y: 0 };

        // Стартовое оружие — нож
        player.currentWeaponId = 'knife';
        player.lastMelee = 'knife';
        initWeaponState('knife');
        equipWeaponModel('knife');

        state.wave = 1;
        state.betweenWaves = false; state.waveTimer = 0;
        state.time = 0; state.gameOver = false; state.paused = false;

        input.fire = false;
        damageFlash = 0;

        ui.reload.classList.remove('active');
        ui.scopeOverlay.classList.remove('active');
        ui.scoreboard.classList.add('hidden');
        ui.overTitle.className = 'danger';

        moveVec.x = 0; moveVec.y = 0;
        ui.joystickKnob.style.transform = 'translate(-50%, -50%)';
        touchCrouch = false; touchJump = false;

        startWave(1);
        updateHUD();
        renderWeaponSlots();
        updateScopeButton();
        saveInventory();
    }

    function startSingleGame() {
        ensureAudio();
        resetSingleGame();
        hideAllOverlays();
        state.running = true; state.paused = false; state.gameOver = false;
        ui.crosshair.classList.add('active');
        if (!isTouchDevice && canvas.requestPointerLock) canvas.requestPointerLock();
    }

    function pauseGame() {
        if (state.gameOver || !state.running) return;
        state.paused = true;
        input.fire = false;
        keys['KeyW'] = keys['KeyA'] = keys['KeyS'] = keys['KeyD'] = false;
        moveVec.x = 0; moveVec.y = 0;
        touchCrouch = false; touchJump = false;
        ui.crosshair.classList.remove('active');
        ui.menuPause.classList.remove('hidden');
        if (document.exitPointerLock) document.exitPointerLock();
    }
    function resumeGame() {
        if (state.gameOver) return;
        state.paused = false;
        ui.menuPause.classList.add('hidden');
        ui.crosshair.classList.add('active');
        if (!isTouchDevice && canvas.requestPointerLock) canvas.requestPointerLock();
    }
    function endGame() {
        state.gameOver = true; state.running = false; state.paused = false;
        input.fire = false;
        ui.crosshair.classList.remove('active');
        ui.reload.classList.remove('active');
        ui.scopeOverlay.classList.remove('active');
        if (document.exitPointerLock) document.exitPointerLock();
        saveInventory();
        const records = saveRecord(player.score, state.wave, player.earnedThisGame);
        renderRecords(ui.recordsOver, records);
        renderRecords(ui.recordsStart, records);
        ui.overTitle.textContent = 'ИГРА ОКОНЧЕНА';
        ui.overTitle.className = 'danger';
        ui.overLabel1.textContent = 'ОЧКИ';
        ui.overLabel2.textContent = 'ВОЛНА';
        ui.finalScore.textContent = player.score;
        ui.finalWave.textContent = state.wave;
        ui.finalMoney.textContent = '$' + player.earnedThisGame;
        ui.menuOver.classList.remove('hidden');
    }
    function goToMainMenu() {
        mpDestroyPeer();
        MP.active = false;
        state.running = false; state.gameOver = false;
        input.fire = false;
        ui.crosshair.classList.remove('active');
        ui.scoreboard.classList.add('hidden');
        if (document.exitPointerLock) document.exitPointerLock();
        saveInventory();
        hideAllOverlays();
        ui.menuStart.classList.remove('hidden');
        ui.mpChoose.classList.remove('hidden');
        ui.mpHost.classList.add('hidden');
        ui.mpJoin.classList.add('hidden');
    }

    /* =========================================================
     СОБЫТИЯ
     ========================================================= */
    function resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', function () { setTimeout(resize, 150); });

    document.addEventListener('keydown', function (e) {
        keys[e.code] = true;
        // В магазин по B
        if (e.code === 'KeyB') {
            if (!ui.menuShop.classList.contains('hidden')) {
                // если открыт магазин — закрываем
                closeShop();
            } else if (!ui.menuCase.classList.contains('hidden')) {
                // если открыт кейс — тоже закрываем
                ui.menuCase.classList.add('hidden');
                if (state.running && !state.paused) {
                    ui.crosshair.classList.add('active');
                    if (!isTouchDevice && canvas.requestPointerLock) canvas.requestPointerLock();
                } else {
                    ui.menuStart.classList.remove('hidden');
                }
            } else if (state.paused) {
                // из паузы открываем
                ui.menuPause.classList.add('hidden');
                openShop();
                state.shopOpenFromPause = true;
            } else if (!state.running) {
                // из главного меню открываем
                openShop();
            } else {
                // во время игры — открываем, ставим на паузу
                if (!state.running || state.gameOver) return;
                pauseGame();
                ui.menuPause.classList.add('hidden');
                openShop();
                state.shopOpenFromPause = true;
            }
            e.preventDefault();
            return;
        }
        if (e.code === 'KeyR') {
            if (state.running && !state.paused && !state.gameOver) startReload();
        }
        if (e.code === 'Digit1') switchToCategory('melee');
        if (e.code === 'Digit2') switchToCategory('pistol');
        if (e.code === 'Digit3') switchToCategory('smg');
        if (e.code === 'Digit4') switchToCategory('rifle');
        if (e.code === 'Digit5') switchToCategory('sniper');
        if (e.code === 'Digit6') switchToCategory('shotgun');
        if (e.code === 'Digit7' || e.code === 'KeyG') {
            if (state.running && !state.paused && !state.gameOver) throwGrenade();
        }
        if (e.code === 'Escape') {
            if (state.running && !state.paused && !state.gameOver) pauseGame();
        }
        if (['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight','ControlLeft','ControlRight',
            'ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
            'Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','KeyG','KeyB'].indexOf(e.code) !== -1) e.preventDefault();
    });
    document.addEventListener('keyup', function (e) { keys[e.code] = false; });

    document.addEventListener('mousemove', function (e) {
        if (isTouchDevice) return;
        if (document.pointerLockElement === canvas && state.running && !state.paused && !state.gameOver) {
            const sens = MOUSE_SENS * (player.scoped ? 0.35 : 1);
            player.angle -= e.movementX * sens;
            player.pitch -= e.movementY * sens;
            if (player.pitch > PITCH_MAX) player.pitch = PITCH_MAX;
            if (player.pitch < -PITCH_MAX) player.pitch = -PITCH_MAX;
        }
    });

    canvas.addEventListener('mousedown', function (e) {
        if (isTouchDevice) return;
        if (e.button === 2) {
            const def = currentDef();
            if (def.scope && state.running && !state.paused && !state.gameOver && player.hp > 0) {
                player.scoped = !player.scoped;
                if (player.scoped) ui.scopeOverlay.classList.add('active');
                else ui.scopeOverlay.classList.remove('active');
            }
            return;
        }
        if (e.button === 1) {
            if (state.running && !state.paused && !state.gameOver) throwGrenade();
            e.preventDefault(); return;
        }
        if (e.button !== 0) return;
        if (document.pointerLockElement !== canvas) {
            if (state.running && !state.paused && !state.gameOver) canvas.requestPointerLock();
            return;
        }
        input.fire = true;
        shoot();
    });
    document.addEventListener('mouseup', function (e) {
        if (isTouchDevice) return;
        if (e.button === 0) input.fire = false;
    });
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('pointerlockchange', function () {
        if (isTouchDevice) return;
        const locked = document.pointerLockElement === canvas;
        if (!locked && state.running && !state.paused && !state.gameOver) pauseGame();
    });

    const isRunning = function () { return state.running && !state.paused && !state.gameOver; };

    let lookTouchId = null, lookLastX = 0, lookLastY = 0;
    canvas.addEventListener('touchstart', function (e) {
        if (!isRunning()) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            if (lookTouchId === null) {
                lookTouchId = t.identifier;
                lookLastX = t.clientX; lookLastY = t.clientY;
            }
        }
    }, { passive: true });
    canvas.addEventListener('touchmove', function (e) {
        if (!isRunning()) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            if (t.identifier === lookTouchId) {
                const dx = t.clientX - lookLastX, dy = t.clientY - lookLastY;
                const sens = TOUCH_SENS * (player.scoped ? 0.4 : 1);
                player.angle -= dx * sens;
                player.pitch -= dy * sens;
                if (player.pitch > PITCH_MAX) player.pitch = PITCH_MAX;
                if (player.pitch < -PITCH_MAX) player.pitch = -PITCH_MAX;
                lookLastX = t.clientX; lookLastY = t.clientY;
                e.preventDefault();
            }
        }
    }, { passive: false });
    function endLookTouch(e) {
        for (let i = 0; i < e.changedTouches.length; i++)
            if (e.changedTouches[i].identifier === lookTouchId) lookTouchId = null;
    }
    canvas.addEventListener('touchend', endLookTouch);
    canvas.addEventListener('touchcancel', endLookTouch);

    const JOY_RADIUS = 60;
    let joyTouchId = null, joyCenterX = 0, joyCenterY = 0;
    function updateJoy(cx, cy) {
        let dx = cx - joyCenterX, dy = cy - joyCenterY;
        const d = Math.hypot(dx, dy);
        if (d > JOY_RADIUS) { dx = dx / d * JOY_RADIUS; dy = dy / d * JOY_RADIUS; }
        ui.joystickKnob.style.transform =
            'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + dy + 'px))';
        moveVec.x = dx / JOY_RADIUS;
        moveVec.y = dy / JOY_RADIUS;
    }
    ui.joystickBase.addEventListener('touchstart', function (e) {
        e.stopPropagation(); e.preventDefault();
        if (!isRunning()) return;
        if (joyTouchId !== null) return;
        const t = e.changedTouches[0];
        joyTouchId = t.identifier;
        const r = ui.joystickBase.getBoundingClientRect();
        joyCenterX = r.left + r.width / 2;
        joyCenterY = r.top + r.height / 2;
        updateJoy(t.clientX, t.clientY);
    }, { passive: false });
    document.addEventListener('touchmove', function (e) {
        if (joyTouchId === null) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            if (t.identifier === joyTouchId) { updateJoy(t.clientX, t.clientY); e.preventDefault(); }
        }
    }, { passive: false });
    function endJoyTouch(e) {
        if (joyTouchId === null) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === joyTouchId) {
                joyTouchId = null;
                moveVec.x = 0; moveVec.y = 0;
                ui.joystickKnob.style.transform = 'translate(-50%, -50%)';
            }
        }
    }
    document.addEventListener('touchend', endJoyTouch);
    document.addEventListener('touchcancel', endJoyTouch);

    ui.btnFireMob.addEventListener('touchstart', function (e) {
        e.stopPropagation(); e.preventDefault();
        if (!isRunning()) return;
        ui.btnFireMob.classList.add('pressed');
        input.fire = true; shoot();
    }, { passive: false });
    function releaseFire(e) { if (e) e.preventDefault(); ui.btnFireMob.classList.remove('pressed'); input.fire = false; }
    ui.btnFireMob.addEventListener('touchend', releaseFire, { passive: false });
    ui.btnFireMob.addEventListener('touchcancel', releaseFire, { passive: false });

    ui.btnReloadMob.addEventListener('touchstart', function (e) {
        e.stopPropagation(); e.preventDefault();
        if (!isRunning()) return;
        ui.btnReloadMob.classList.add('pressed');
        startReload();
    }, { passive: false });
    function releaseReload(e) { if (e) e.preventDefault(); ui.btnReloadMob.classList.remove('pressed'); }
    ui.btnReloadMob.addEventListener('touchend', releaseReload, { passive: false });
    ui.btnReloadMob.addEventListener('touchcancel', releaseReload, { passive: false });

    ui.btnScopeMob.addEventListener('touchstart', function (e) {
        e.stopPropagation(); e.preventDefault();
        if (!isRunning()) return;
        const def = currentDef();
        if (!def.scope) return;
        ui.btnScopeMob.classList.add('pressed');
        player.scoped = !player.scoped;
        if (player.scoped) ui.scopeOverlay.classList.add('active');
        else ui.scopeOverlay.classList.remove('active');
    }, { passive: false });
    function releaseScope(e) { if (e) e.preventDefault(); ui.btnScopeMob.classList.remove('pressed'); }
    ui.btnScopeMob.addEventListener('touchend', releaseScope, { passive: false });
    ui.btnScopeMob.addEventListener('touchcancel', releaseScope, { passive: false });

    ui.btnGrenadeMob.addEventListener('touchstart', function (e) {
        e.stopPropagation(); e.preventDefault();
        if (!isRunning()) return;
        ui.btnGrenadeMob.classList.add('pressed');
        throwGrenade();
    }, { passive: false });
    function releaseGrenade(e) { if (e) e.preventDefault(); ui.btnGrenadeMob.classList.remove('pressed'); }
    ui.btnGrenadeMob.addEventListener('touchend', releaseGrenade, { passive: false });
    ui.btnGrenadeMob.addEventListener('touchcancel', releaseGrenade, { passive: false });

    ui.btnJumpMob.addEventListener('touchstart', function (e) {
        e.stopPropagation(); e.preventDefault();
        if (!isRunning()) return;
        ui.btnJumpMob.classList.add('pressed');
        touchJump = true;
    }, { passive: false });
    function releaseJump(e) { if (e) e.preventDefault(); ui.btnJumpMob.classList.remove('pressed'); }
    ui.btnJumpMob.addEventListener('touchend', releaseJump, { passive: false });
    ui.btnJumpMob.addEventListener('touchcancel', releaseJump, { passive: false });

    ui.btnCrouchMob.addEventListener('touchstart', function (e) {
        e.stopPropagation(); e.preventDefault();
        if (!isRunning()) return;
        ui.btnCrouchMob.classList.add('pressed');
        touchCrouch = true;
    }, { passive: false });
    function releaseCrouch(e) { if (e) e.preventDefault(); ui.btnCrouchMob.classList.remove('pressed'); touchCrouch = false; }
    ui.btnCrouchMob.addEventListener('touchend', releaseCrouch, { passive: false });
    ui.btnCrouchMob.addEventListener('touchcancel', releaseCrouch, { passive: false });

    ui.btnPauseMob.addEventListener('touchstart', function (e) {
        e.stopPropagation(); e.preventDefault();
        if (state.gameOver) return;
        if (state.paused) resumeGame(); else pauseGame();
    }, { passive: false });
    ui.btnPauseMob.addEventListener('click', function () {
        if (isTouchDevice) return;
        if (state.gameOver) return;
        if (state.paused) resumeGame(); else pauseGame();
    });

    const modeBtns = ui.modeList.querySelectorAll('.mode-btn');
    for (let i = 0; i < modeBtns.length; i++) {
        modeBtns[i].addEventListener('click', function () {
            for (let j = 0; j < modeBtns.length; j++) modeBtns[j].classList.remove('selected');
            this.classList.add('selected');
            selectedMode = this.dataset.mode;
        });
    }

    ui.btnOpenShop.addEventListener('click', function () { openShop(); });
    ui.btnShopPause.addEventListener('click', function () {
        ui.menuPause.classList.add('hidden');
        openShop();
        state.shopOpenFromPause = true;
    });
    ui.btnShopClose.addEventListener('click', function () {
        closeShop();
        state.shopOpenFromPause = false;
    });
    const shopCatBtns = ui.shopCategories.querySelectorAll('.shop-cat');
    for (let i = 0; i < shopCatBtns.length; i++) {
        shopCatBtns[i].addEventListener('click', function () {
            currentShopCat = this.dataset.cat;
            for (let j = 0; j < shopCatBtns.length; j++) shopCatBtns[j].classList.remove('selected', 'active');
            this.classList.add('selected', 'active');
            renderShopItems(currentShopCat);
        });
    }

    // Открытие кейса
    ui.btnCaseOpen.addEventListener('click', function () { rollCase(); });
    ui.btnCaseClose.addEventListener('click', function () {
        ui.menuCase.classList.add('hidden');
        openShop();
    });

    ui.btnStart.addEventListener('click', function () {
        ensureAudio();
        if (selectedMode === 'single') startSingleGame();
        else {
            hideAllOverlays();
            ui.menuMp.classList.remove('hidden');
            ui.mpModeTitle.textContent = selectedMode === '1v1' ? '1 НА 1' : '2 НА 2';
            ui.mpChoose.classList.remove('hidden');
            ui.mpHost.classList.add('hidden');
            ui.mpJoin.classList.add('hidden');
            mpDestroyPeer();
        }
    });

    ui.btnMpHost.addEventListener('click', function () {
        ui.mpChoose.classList.add('hidden');
        ui.mpHost.classList.remove('hidden');
        ui.mpJoin.classList.add('hidden');
        mpHostGame();
    });
    ui.btnMpJoin.addEventListener('click', function () {
        ui.mpChoose.classList.add('hidden');
        ui.mpHost.classList.add('hidden');
        ui.mpJoin.classList.remove('hidden');
        ui.mpJoinInput.value = '';
    });
    ui.btnMpBack.addEventListener('click', function () {
        mpDestroyPeer();
        hideAllOverlays();
        ui.menuStart.classList.remove('hidden');
    });
    ui.btnMpStart.addEventListener('click', function () {
        if (MP.connections.length < 1) return;
        mpBroadcast({ t: 'start' });
        mpStartGame();
    });
    ui.btnMpCancel.addEventListener('click', function () {
        mpDestroyPeer();
        ui.mpChoose.classList.remove('hidden');
        ui.mpHost.classList.add('hidden');
        ui.mpJoin.classList.add('hidden');
    });
    ui.btnMpConnect.addEventListener('click', function () {
        const id = ui.mpJoinInput.value.trim();
        if (!id) return;
        ui.btnMpConnect.disabled = true;
        mpJoinGame(id);
        setTimeout(function () { ui.btnMpConnect.disabled = false; }, 3000);
    });
    ui.btnMpJoinCancel.addEventListener('click', function () {
        mpDestroyPeer();
        ui.mpChoose.classList.remove('hidden');
        ui.mpHost.classList.add('hidden');
        ui.mpJoin.classList.add('hidden');
    });

    ui.btnResume.addEventListener('click', resumeGame);
    ui.btnRestart.addEventListener('click', function () {
        if (MP.active) goToMainMenu();
        else startSingleGame();
    });
    ui.btnMenu.addEventListener('click', goToMainMenu);
    ui.btnAgain.addEventListener('click', function () {
        if (MP.active || MP.winnerTeam !== -1) goToMainMenu();
        else startSingleGame();
    });
    ui.btnMenuOver.addEventListener('click', goToMainMenu);

    /* =========================================================
     ИНИЦИАЛИЗАЦИЯ
     ========================================================= */
    function buildMapListUI() {
        ui.mapList.innerHTML = '';
        for (let i = 0; i < MAP_LIST.length; i++) {
            const m = MAP_LIST[i];
            const btn = document.createElement('button');
            btn.className = 'map-btn' + (i === selectedMapIdx ? ' selected' : '');
            const outTag = m.outdoor ? '<div class="map-outdoor-tag">☀ УЛИЦА</div>' : '';
            btn.innerHTML = '<div class="map-title">' + m.name + '</div>' +
                '<div class="map-desc">' + m.desc + '</div>' + outTag;
            (function (idx) {
                btn.addEventListener('click', function () {
                    selectedMapIdx = idx;
                    savePrefs();
                    const all = ui.mapList.querySelectorAll('.map-btn');
                    for (let k = 0; k < all.length; k++) all[k].classList.remove('selected');
                    all[idx].classList.add('selected');
                });
            })(i);
            ui.mapList.appendChild(btn);
        }
    }

    function init() {
        loadPrefs();
        loadInventory();
        buildMapListUI();
        buildTextures();

        // Стартовое оружие и скин
        initWeaponState('knife');
        initWeaponState('glock');
        player.ownedWeapons.knife = true;
        player.ownedWeapons.glock = true;
        player.ownedSkins.default = true;
        equipWeaponModel('knife');

        MAP_LIST[selectedMapIdx].build();
        buildWorldFromMap();

        resize();

        const records = loadRecords();
        renderRecords(ui.recordsStart, records);
        renderRecords(ui.recordsOver, records);

        buildWeaponSlots();
        updateHUD();
        updateScopeButton();

        player.x = MAP_LIST[selectedMapIdx].start.x;
        player.z = MAP_LIST[selectedMapIdx].start.y;
        player.angle = MAP_LIST[selectedMapIdx].start.angle;
        player.pitch = 0;
        camera.position.set(player.x, CAM_STAND, player.z);
        camera.rotation.y = player.angle;
        camera.rotation.x = 0;

        let lastTime = 0;
        function loop(ts) {
            requestAnimationFrame(loop);
            if (!lastTime) lastTime = ts;
            let dt = (ts - lastTime) / 1000;
            lastTime = ts;
            if (dt > 0.05) dt = 0.05;
            if (dt < 0) dt = 0;

            if (state.running && !state.paused && !state.gameOver) {
                state.time += dt;
                updatePlayer(dt);
                camera.rotation.y = player.angle;
                camera.rotation.x = player.pitch;

                if (MP.active) {
                    for (const id in MP.remotePlayers) {
                        const rp = MP.remotePlayers[id];
                        rp.x += (rp.targetX - rp.x) * Math.min(1, dt * 10);
                        rp.z += (rp.targetZ - rp.z) * Math.min(1, dt * 10);
                        rp.animPhase = (rp.animPhase || 0) + dt * 3;
                        if (rp.mesh) {
                            rp.mesh.position.x = rp.x;
                            rp.mesh.position.z = rp.z;
                            rp.mesh.rotation.y = rp.angle + Math.PI;
                            animateSoldier(rp.mesh, rp.animPhase, rp.alive);
                        }
                    }
                    MP.lastSend += dt;
                    if (MP.lastSend >= 0.05) { MP.lastSend = 0; mpSendState(); }
                } else {
                    updateEnemies(dt);
                    updateWaves(dt);
                }
            } else {
                camera.position.x = player.x;
                camera.position.z = player.z;
                camera.position.y = player.footZ + (player.crouching ? CAM_CROUCH : CAM_STAND);
                camera.rotation.y = player.angle;
                camera.rotation.x = player.pitch;
            }

            renderer.render(scene, camera);
        }
        requestAnimationFrame(loop);
    }

    init();
})();