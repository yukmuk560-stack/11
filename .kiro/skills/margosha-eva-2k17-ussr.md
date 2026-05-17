---
name: margosha-eva-2k17-ussr
description: Skill для генерации связных text-to-image и text-to-video промптов про двух девушек — Маргошу и Еву — в стилистике 2К17, помещённых внутрь СССР как «попаданок во времени». Используется для серий вертикальных vlog-сцен с диалогами, телефонными звонками, дискачами и тусовочной хроникой.
keywords:
  - margosha
  - eva
  - 2k17
  - ussr
  - soviet
  - vlog
  - prompt-engineering
  - text-to-image
  - text-to-video
---

# Skill: Маргоша и Ева — 2К17 в СССР

Этот skill заточен под генерацию связных промптов для серии коротких видео и кадров, где две девушки-попаданки из эпохи 2К17 живут, тусуются и созваниваются внутри позднесоветского антуража.

Используй его, когда пользователь просит:
- сделать промпты «про Маргошу и Еву»;
- сцену звонка / дискача / гаражей / двора / подъезда в стиле СССР + 2К17;
- vlog-сцену от первого лица с фронталкой телефона;
- продолжение серии, где уже были Маргоша и Ева.

---

## 1. Канон персонажей

Эти описания фиксированы и должны переноситься между сценами без потери деталей. Если у пользователя есть reference image — всегда добавляй фразу `Here is the reference image of the character.` и `as in the reference image`.

### 1.1. Маргоша (главная героиня, эмоциональная, дерзкая)
- Внешний вид: красное худи с жёлтыми языками пламени на рукавах, чёрный чокер, дерзкий взгляд, эмо-энергетика 2К17.
- Характер: вспыльчивая, орёт в трубку, любит дискачи, гаражи, блейзер, Никитоса Хмурого.
- Локация по умолчанию: типовая советская квартира — обои с узором, ковёр на стене, торшер, кружевные занавески, КРТ-телевизор со статикой, полированная мебель, книжные полки, тёплый жёлтый свет.
- Реквизит: бежевый кнопочный советский телефон с проводом, трубка, провод тянется по столу.
- Лексика: «блять», «дискач», «вот дура», «прибью нахрен», «за гаражи».

### 1.2. Ева (вторая героиня, ленивая, статусная, с понтом)
- Внешний вид: чёрный худи Thrasher, длинные коричневые волосы, уставшее самодовольное лицо.
- Характер: ленивая, дерзкая, отвечает с «понтом», но мгновенно срывается на тусовку, если там Никитос Хмурый.
- Локация по умолчанию: элитная советская квартира — резная деревянная мебель, хрусталь в серванте, тяжёлые шторы, люстра с тёплым светом, ковры, лакированные поверхности, признаки достатка нетипичного для рядового советского гражданина.
- Реквизит: оранжевый iPhone 17 в руке (важно: именно оранжевый, именно 17, держит у щеки/уха).
- Лексика: «да, Маргоша, что хотела», «я не пойду если что», «раз Никита Хмурый будет — выезжаю».

### 1.3. Упоминаемые персонажи (вне кадра)
- **Никитос Хмурый** — местная легенда дискача, ради него Ева срывается с места.
- **Блейзер** — напиток, который пьют «за гаражами».

---

## 2. Базовый стиль (общий для всех сцен)

Всегда добавляй в каждый промпт следующий пакет стилистических маркеров:

- `realistic cinematic vlog-style front-facing phone shot` (или `video` для t2v)
- `the recording device not visible in frame and no separate camera shown in the hand`
- `believable arm perspective, no mirror selfie, no tripod`
- `warm nostalgic lighting`, `cinematic Soviet apartment color grading`
- `the character must feel naturally integrated into the environment with matching ambient light, matching color temperature, realistic contact shadows`
- `Full color, cinematic realism, immersive atmosphere, high detail.`

Для t2v добавляй: `subtle handheld motion`, `slow push-in toward the face`, фоновое движение (пар из чайника, мерцание КРТ, дым сигарет, шевелящиеся занавески, дальние огни города).

---

## 3. Локационные паки

### 3.1. Советская обычная квартира (Маргоша)
> patterned wallpaper, a glowing floor lamp, old carpet on the wall, lace curtains, CRT television with static, polished wooden furniture, bookshelves, dim yellow lighting, beige Soviet push-button landline telephone on a polished wooden table, steam coming from the kitchen doorway, city lights outside the window, faint TV flickering naturally happening.

### 3.2. Элитная советская квартира (Ева)
> expensive Soviet decor, crystal dishes inside cabinets, heavy curtains, glossy furniture, warm chandelier lighting, decorative carpets, expensive carved wooden chair at a polished dining table, dim kitchen lamp glowing, cigarette smoke drifting slowly, reflections on polished wood surfaces, soft city lights outside large apartment windows naturally happening.

### 3.3. Доп. локации (на будущее)
- **Гаражи**: ржавые ворота, трещины асфальта, бутылки блейзера, фонарь под жёлтой лампой, ночь, СССР.
- **Дискач/ДК**: гирлянды, дым-машина, проектор на стене, пол с шахматной плиткой, толпа в спортивках и худи 2К17.
- **Подъезд**: стены масляной краской до середины, лампа Ильича, советские почтовые ящики, граффити маркером.
- **Двор**: панельки, ковры на балконах, лавочка у подъезда, бабки в платках.

---

## 4. Шаблон сцены

Каждая сцена идёт двумя блоками: **TEXT-TO-IMAGE PROMPT** и **TEXT-TO-VIDEO PROMPT** (со spoken script).

```
<emoji> Сцена N — <короткое название>

TEXT-TO-IMAGE PROMPT:
A realistic cinematic vlog-style front-facing phone shot of the character from the reference image in <локация>. Here is the reference image of the character. The character is wearing <канон-наряд> as in the reference image, as a believable time traveler inside the scene. The shot is captured from the character’s front-facing phone camera at arm’s length, with the recording device not visible in frame and no separate camera shown in the hand. <действие персонажа>. <эмоция>. <предметная среда из локационного пака>. In the background, <фоновое движение> naturally happening. The character must feel naturally integrated into the environment with matching ambient light, matching color temperature, realistic contact shadows, cinematic Soviet apartment color grading, atmospheric depth, and warm nostalgic lighting. Full color, cinematic realism, immersive atmosphere, believable arm perspective, no mirror selfie, no tripod, high detail.

TEXT-TO-VIDEO PROMPT:
Spoken Script:
"<реплика персонажа на русском, в характере>"

A realistic cinematic vlog-style front-facing phone video of the character from the reference image <действие> inside <локация>. <развитие действия в динамике>. Background motion includes <2-4 живых элемента фона>. The camera slowly pushes closer toward her face. Cinematic realism, immersive Soviet apartment atmosphere, subtle handheld motion, warm nostalgic lighting, high detail.
```

---

## 5. Правила связности серии

1. **Один наряд — одна арка**: в рамках одного сюжета Маргоша всегда в красном худи с пламенем + чокер, Ева всегда в чёрном Thrasher. Менять только если пользователь явно попросил.
2. **Два устройства — две эпохи**: у Маргоши только советский кнопочный телефон с трубкой и проводом; у Евы только оранжевый iPhone 17. Никогда не путать.
3. **Реплики строго в характере** (см. лексику выше). Маргоша орёт и матерится по-доброму, Ева цедит лениво.
4. **Параллельный монтаж** телефонного разговора: чередуй сцены «у Маргоши» и «у Евы», свет и цвет должны контрастировать (тёплый жёлтый vs роскошный янтарный с люстрой).
5. **Финальный кадр (look-to-camera)**: серию хорошо закрывать кадром, где Маргоша смотрит в камеру и комментирует ситуацию («вот дура, забыла сказать что в трэшерах надо ехать блять»).
6. **Reference images**: если пользователь приложил фото — всегда упоминай `the second reference image` для Евы и `the reference image` для Маргоши, чтобы модель не путала героинь.

---

## 6. Готовые мини-блоки (copy-paste)

### Маргоша — наряд
> wearing the same modern red hoodie with yellow flames, black choker, and overall appearance as in the reference image, as a believable time traveler inside the scene

### Ева — наряд
> wearing a black Thrasher hoodie, with long brown hair and the same overall appearance as in the reference image, as a believable time traveler inside the luxurious Soviet apartment

### Реквизит Маргоши
> an old beige Soviet push-button landline telephone on a polished wooden table, holding the receiver nervously, coiled phone cord stretching across the table

### Реквизит Евы
> holding an orange iPhone 17 in her hand near her cheek, glowing screen reflecting warm chandelier light

### Фоновая жизнь (Маргоша)
> steam drifting from the kitchen doorway, CRT television flickering, lace curtains moving slightly, distant city lights shimmering outside

### Фоновая жизнь (Ева)
> chandelier light reflections moving across polished furniture, drifting cigarette smoke, curtains swaying slightly near open windows, soft glowing city lights outside

---

## 7. Чеклист перед выдачей промптов пользователю

- [ ] У каждой сцены есть и t2i, и t2v блок (если пользователь не сказал «только картинки»).
- [ ] У каждого t2v блока есть Spoken Script на русском в характере героини.
- [ ] Маргоша = красное худи + советский кнопочный телефон + обычная квартира.
- [ ] Ева = чёрный Thrasher + оранжевый iPhone 17 + элитная квартира.
- [ ] Везде есть фраза про front-facing phone, отсутствие зеркала и штатива.
- [ ] Везде есть советский антураж (обои, ковёр, КРТ, люстра, хрусталь и т.д.).
- [ ] Между сценами сохраняется свет, цвет, время суток, наряды.
- [ ] Если есть reference — упомянут как `the reference image` / `the second reference image`.

---

## 8. Расширения (на будущее)

- **Сцена «гаражи»**: Маргоша + блейзер, ночь, фонарь, друзья в адиках.
- **Сцена «дискач»**: ДК, дым, Никитос Хмурый появляется в кадре.
- **Сцена «подъезд»**: Ева спускается по лестнице с iPhone 17 в руке.
- **Сцена «такси-копейка»**: Ева едет к Маргоше на ВАЗ-2101 с водителем-дядей Витей.
- **Сцена «утро после»**: обе на кухне у Маргоши, кефир, голова болит, КРТ показывает «Утреннюю звезду».
