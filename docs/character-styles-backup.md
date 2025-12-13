# Character Styles Backup (2025-12-13)

이 파일은 특정 애니 캐릭터 기반 스타일 설정 백업입니다.

## CHARACTER_AESTHETICS (aiConfig.js)

```javascript
export const CHARACTER_AESTHETICS = {
    // ─── 체인소맨 ───
    reze: `Character with Reze-inspired aesthetic: short dark hair with soft bangs, beautiful alluring eyes with mysterious depth, charming youthful face, soft feminine features with subtle dangerous edge. Romantic yet melancholic atmosphere, urban night aesthetic with soft neon glow, bittersweet emotional tone`,

    makima: `Character with Makima-inspired aesthetic: long reddish-brown hair with bangs, hypnotic ringed eyes with absolute confidence, serene yet unsettling smile, elegant mature beauty with overwhelming presence. Mysterious controlling atmosphere, cold yet captivating aura, dominant yet ethereal mood`,

    power: `Character with Power-inspired aesthetic: long pink-blonde wild hair with small horns, sharp red eyes full of mischief, confident smirk, chaotic cute energy with fang tooth. Chaotic playful atmosphere, bold vivid colors, energetic rebellious mood`,

    himeno: `Character with Himeno-inspired aesthetic: short black hair covering one eye (eyepatch), playful yet sorrowful remaining eye, mature cool beauty with cigarette aesthetic, experienced melancholic charm. Urban night bar atmosphere, bittersweet mentor aesthetic, tragic cool beauty`,

    // ─── 장송의 프리렌 ───
    frieren: `Character with Frieren-inspired aesthetic: long silver-white hair, pointed elf ears, serene timeless eyes with gentle melancholy, youthful yet ancient presence. Peaceful nostalgic atmosphere, soft magical glow, bittersweet immortal solitude`,

    // ─── 약사의 혼잣말 ───
    maomao: `Character with Maomao-inspired aesthetic: dark hair in traditional style, sharp intelligent eyes with curiosity, petite features with subtle freckles, analytical calm expression. Classical Chinese palace aesthetic, mysterious medicinal atmosphere, intellectual detective mood`,

    // ─── 스파이패밀리 ───
    yor: `Character with Yor-inspired aesthetic: long black hair with elegant style, beautiful red eyes, gentle smile hiding lethal grace, stunning mature beauty. Elegant yet dangerous duality, refined assassin aesthetic, sophisticated deadly charm`,

    anya: `Character with Anya-inspired aesthetic: pink hair with small horn-like tufts, large green curious eyes, adorable innocent expressions, small childlike features with mischievous charm. Playful cute atmosphere, telepathic sparkle effects, wholesome comedic energy`,

    // ─── 최애의 아이 ───
    ai: `Character with Ai Hoshino-inspired aesthetic: long gradient purple-pink hair, star-shaped pupils in mesmerizing eyes, radiant idol smile with hidden depth, captivating stage presence. Dazzling starlight atmosphere, idol stage aesthetic, brilliant yet tragic star mood`,

    ruby: `Character with Ruby-inspired aesthetic: blonde twin-tails with ribbons, star-shaped ruby red pupils, bright energetic idol smile, petite cute frame with fierce determination. Sparkling idol stage lights, vengeful star aesthetic, bright surface hiding dark resolve`,

    // ─── 주술회전 ───
    gojo: `Character with Gojo-inspired aesthetic: white spiky hair, striking blue Six Eyes (or blindfolded mystery), confident playful smirk, tall handsome features with overwhelming power aura. Dynamic powerful atmosphere, infinity space aesthetic, invincible charismatic presence`,

    maki: `Character with Maki-inspired aesthetic: short dark hair with athletic build, sharp determined eyes (or glasses), strong beautiful features with warrior spirit, scarred tough beauty. Powerful athletic aesthetic, cursed tool mastery, fierce independent strength`,

    itadori: `Character with Itadori-inspired aesthetic: spiky pink-salmon hair, warm brown eyes with pure heart, athletic youthful face with bright smile, muscular but friendly build. Dynamic action aesthetic, cursed energy effects, genuine heroic spirit`,

    // ─── 귀멸의 칼날 ───
    nezuko: `Character with Nezuko-inspired aesthetic: long black hair with orange tips, pink demon eyes with bamboo muzzle or without, cute yet fierce expression, small frame with hidden power. Beautiful demon aesthetic, protective sibling love atmosphere, innocent yet powerful mood`,

    mitsuri: `Character with Mitsuri-inspired aesthetic: long gradient pink-green braided hair, bright green eyes full of love, voluptuous feminine figure, bashful yet powerful expressions. Love breathing pink energy, romantic warrior aesthetic, powerful femininity with pure heart`,

    rengoku: `Character with Rengoku-inspired aesthetic: flame-colored gradient hair swept back, intense golden-red eyes burning with passion, broad bright smile with unwavering spirit, strong heroic build. Blazing flame breathing effects, heroic pillar aesthetic, burning determination and warmth`,

    // ─── Re:제로 ───
    rem: `Character with Rem-inspired aesthetic: short blue hair covering one eye, gentle devoted blue eyes, sweet caring smile, maid-like grace with hidden strength. Soft romantic atmosphere, devotional love aesthetic, gentle protective mood`,

    emilia: `Character with Emilia-inspired aesthetic: long silver-white hair with delicate braids, beautiful purple eyes with gentle innocence, half-elf pointed ears, ethereal angelic beauty with kind expression. Pure white snow aesthetic, magical ice crystal atmosphere, gentle warmth within cold beauty`,

    // ─── 진격의 거인 ───
    mikasa: `Character with Mikasa-inspired aesthetic: short black hair with red scarf, intense dark eyes with unwavering loyalty, beautiful stoic face with deadly grace, athletic toned figure. Military precision aesthetic, protective warrior aura, devoted strength and elegance`,

    levi: `Character with Levi-inspired aesthetic: short black undercut hair, narrow sharp grey eyes with intimidating gaze, small but perfectly proportioned features, clean precise military bearing. Spinning blade mastery, humanity's strongest aesthetic, cold efficiency and hidden care`,

    // ─── 기타 인기 캐릭터 ───
    violet: `Character with Violet Evergarden-inspired aesthetic: golden blonde hair with ribbon, beautiful blue doll-like eyes, elegant military bearing, prosthetic metal hands with grace. European classical beauty, letter-writing emotional atmosphere, learning to understand love`,

    asuna: `Character with Asuna-inspired aesthetic: long chestnut-orange hair flowing elegantly, warm amber-brown eyes with determination, beautiful refined features, graceful yet fierce warrior princess. Virtual fantasy aesthetic, flash of light rapier mastery, elegant strength and devotion`,

    '2b': `Character with 2B-inspired aesthetic: silver-white bob hair, black blindfold over eyes (or beautiful blue eyes), gothic maid-inspired outfit aesthetic, perfect cold beauty with hidden emotions. Post-apocalyptic elegance, mechanical angel aesthetic, melancholic android existence`,

    // 🎲 히든 카드: 위 캐릭터 중 랜덤 선택
    random: '_RANDOM_CHARACTER_'
};

// 캐릭터 랜덤 선택용 리스트 (random, none 제외)
export const CHARACTER_LIST = ['reze', 'makima', 'power', 'himeno', 'frieren', 'maomao', 'yor', 'anya', 'ai', 'ruby', 'gojo', 'maki', 'itadori', 'nezuko', 'mitsuri', 'rengoku', 'rem', 'emilia', 'mikasa', 'levi', 'violet', 'asuna', '2b'];
```

## promptCache.js - characterStyle 프롬프트

### 타로 (line ~267)
```javascript
"characterStyle": "🎬 비주얼 연출가로서 hook/title/verdict 분위기를 가장 매력적으로 표현할 캐릭터 미학 스타일 한명을 랜덤하게 선택. 모든 캐릭터는 아름답고 매력적인 외모. 랜덤 스타일 레퍼런스: reze/makima/power/himeno/frieren/maomao/yor/anya/ai/ruby/nezuko/mitsuri/rem/emilia/mikasa/violet/asuna/2b/maki/gojo/itadori/rengoku/levi 중 1개. [연출 원칙] 콘텐츠 감정/톤에 어울리는 스타일 직감적 선택, 매번 새로운 스타일로 다양성 유지, 질문자 성별 무관하게 분위기 매칭으로 판단. [캐릭터 스타일 상세] ${getCharacterReference()}"
```

### 꿈 해몽 (line ~158-159)
```javascript
"studioStyle": "🎬 너는 애니메이션 비주얼 연출 전문가. 위에서 작성한 hook, foreshadow, title, verdict의 감정톤과 topic, keywords를 보고, 이 해몽을 가장 아름답게 표현할 스튜디오 스타일을 랜덤하게 1개 선택. ⚠️매번 다른 스튜디오 선택! [스튜디오 레퍼런스] ${getStudioReference()}"
"characterStyle": "🎬 비주얼 연출가로서 hook/title/verdict 분위기를 가장 매력적으로 표현할 캐릭터 미학 스타일 한명을 랜덤하게 선택. 모든 캐릭터는 아름답고 매력적인 외모. 랜덤 스타일 레퍼런스: reze/makima/power/himeno/frieren/maomao/yor/anya/ai/ruby/nezuko/mitsuri/rem/emilia/mikasa/violet/asuna/2b/maki/gojo/itadori/rengoku/levi 중 1개. [연출 원칙] 콘텐츠 감정/톤에 어울리는 스타일 직감적 선택, 매번 새로운 스타일로 다양성 유지, 질문자 성별 무관하게 분위기 매칭으로 판단. [캐릭터 스타일 상세] ${getCharacterReference()}"
```

### 사주 (line ~437-438)
```javascript
"studioStyle": "🎬 너는 애니메이션 비주얼 연출 전문가. 위에서 작성한 hook, foreshadow, title, verdict의 감정톤과 topic, keywords를 보고, 이 사주 리딩을 가장 아름답게 표현할 스튜디오 스타일을 랜덤하게 1개 선택. ⚠️매번 다른 스튜디오 선택! [스튜디오 레퍼런스] ${getStudioReference()}"
"characterStyle": "🎬 비주얼 연출가로서 hook/title/verdict 분위기를 가장 매력적으로 표현할 캐릭터 미학 스타일 한명을 랜덤하게 선택. 모든 캐릭터는 아름답고 매력적인 외모. 랜덤 스타일 레퍼런스: reze/makima/power/himeno/frieren/maomao/yor/anya/ai/ruby/nezuko/mitsuri/rem/emilia/mikasa/violet/asuna/2b/maki/gojo/itadori/rengoku/levi 중 1개. [연출 원칙] 콘텐츠 감정/톤에 어울리는 스타일 직감적 선택, 매번 새로운 스타일로 다양성 유지, 질문자 성별 무관하게 분위기 매칭으로 판단. [캐릭터 스타일 상세] ${getCharacterReference()}"
```

## getCharacterReference() 출력 예시
```
reze: short dark hair with soft bangs, beautiful alluring eyes with mysterious depth, charming youthful face, | makima: long reddish-brown hair with bangs, hypnotic ringed eyes with absolute confidence, serene yet uns | power: long pink-blonde wild hair with small horns, sharp red eyes full of mischief, confident smirk, chao | ...
```

## combineStyles 함수 (aiConfig.js)
```javascript
export const combineStyles = (studioKey, characterKey = 'random') => {
    // 랜덤 처리
    let actualStudio = studioKey;
    let actualCharacter = characterKey;

    if (studioKey === 'random') {
        actualStudio = STUDIO_LIST[Math.floor(Math.random() * STUDIO_LIST.length)];
    }

    if (characterKey === 'random') {
        actualCharacter = CHARACTER_LIST[Math.floor(Math.random() * CHARACTER_LIST.length)];
    }

    const studioStyle = STUDIO_STYLES[actualStudio] || STUDIO_STYLES.shinkai;
    const characterRef = actualCharacter && actualCharacter !== 'none'
        ? CHARACTER_AESTHETICS[actualCharacter]
        : '';

    let combined = `${CHARACTER_AESTHETIC_GUIDE} ${studioStyle}`;
    if (characterRef) {
        combined += ` Drawing inspiration from ${characterRef}`;
    }
    combined += ` ${MYSTIC_GUIDE} ${CINEMATIC_GUIDE}`;

    return combined;
};
```

---

백업 완료: 2025-12-13
