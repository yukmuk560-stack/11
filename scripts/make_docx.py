#!/usr/bin/env python3
"""Generate a .docx file (Office Open XML) using only Python stdlib (zipfile + xml).
The document explains universal/optimal CapCut export settings for TikTok uploads.
"""
import zipfile
import os
from xml.sax.saxutils import escape

OUT = "/projects/sandbox/11/CapCut-TikTok-Best-Export-Settings.docx"

BLOCKS = []

def H1(t): BLOCKS.append(("H1", t))
def H2(t): BLOCKS.append(("H2", t))
def H3(t): BLOCKS.append(("H3", t))
def P(t):  BLOCKS.append(("P",  t))
def BUL(t):BLOCKS.append(("BUL",t))
def NUM(t):BLOCKS.append(("NUM",t))
def MONO(t):BLOCKS.append(("MONO",t))
def SEP(): BLOCKS.append(("SEP", ""))

H1("Универсальные лучшие настройки экспорта CapCut и загрузки в TikTok")
P("Документ-инструкция: как экспортировать видео из CapCut максимально качественно "
  "и загрузить его в TikTok так, чтобы платформа НЕ ужала картинку до мыла. "
  "Версии CapCut: Mobile (iOS/Android) и Desktop (Windows/Mac). Год: 2026.")
P("Источник параметров — официальные рекомендации TikTok и обзоры лучших настроек "
  "CapCut за 2025–2026. Контент перефразирован для соответствия лицензионным требованиям.")
SEP()

H1("0. TL;DR — золотая формула (запомни наизусть)")
BUL("Разрешение проекта: 1080×1920 (9:16, вертикаль)")
BUL("Разрешение экспорта: 1080p (НЕ 4K — TikTok всё равно сожмёт до 1080p)")
BUL("Частота кадров: 60 fps (если исходник 30 — оставь 30)")
BUL("Кодек: H.264 (универсально) или H.265/HEVC (на 30–40% меньше файл при том же качестве)")
BUL("Битрейт: High (≈ 15–20 Mbps на 1080p / 60 fps)")
BUL("Формат контейнера: MP4")
BUL("Аудио: AAC, 48 kHz, стерео, 192–256 kbps")
BUL("Цвет: SDR (Rec.709), НЕ HDR — TikTok HDR корёжит")
BUL("Загрузка: только через мобильное приложение TikTok, режим High Quality Uploads ВКЛ, Data Saver ВЫКЛ, Wi-Fi.")
SEP()

H1("1. Подготовка проекта в CapCut (ДО монтажа)")

H2("1.1. Холст (Canvas) и соотношение сторон")
P("Прежде чем добавлять клипы, зафиксируй холст под TikTok, иначе CapCut "
  "будет масштабировать видео при экспорте, и появятся чёрные полосы или мыло.")
NUM("Открой проект → нажми Ratio (Соотношение).")
NUM("Выбери 9:16 — это вертикальный формат TikTok.")
NUM("Убедись, что разрешение проекта 1080×1920 пикселей.")

H2("1.2. Частота кадров (Frame Rate) проекта")
P("CapCut Desktop позволяет задать FPS проекта вручную.")
BUL("Если весь твой материал снят в 60 fps → ставь 60 fps.")
BUL("Если хотя бы часть исходников 30 fps → ставь 30 fps, иначе будет «дёрганый» эффект на интерполированных кадрах.")
BUL("24 fps — только если делаешь «киношный» лук вручную.")

H2("1.3. Цветовое пространство")
P("Для TikTok всегда выбирай SDR / Rec.709. HDR (HLG, PQ) на TikTok отображается "
  "пересвеченным или с поломанными цветами на большинстве телефонов.")

H2("1.4. Безопасные зоны (Safe Zones)")
P("TikTok накладывает поверх видео UI: ник, описание, кнопки лайка/комментариев "
  "справа, нижнюю плашку с музыкой. Чтобы важный контент не перекрывался:")
BUL("Снизу — отступ ~ 320 px (от низа кадра 1920 px).")
BUL("Справа — отступ ~ 180 px.")
BUL("Сверху — отступ ~ 220 px (там оказывается «For You» и поиск).")
P("В CapCut включи: Settings → Display → Safe Zone (или вручную добавь "
  "прозрачные направляющие). Все ключевые объекты, лица и текст держи в центре.")
SEP()

H1("2. Финальная проверка ПЕРЕД экспортом")
NUM("Прослушай звук в наушниках — нет ли клиппинга и щелчков на стыках.")
NUM("Прокрути таймлайн на 100% масштабе (1:1) и убедись, что текст резкий, не пиксельный.")
NUM("Проверь, что субтитры/стикеры лежат внутри безопасной зоны.")
NUM("Убери все Adjustment-слои поверх друг друга, если они дублируют эффект.")
NUM("Если использовал AI Stabilization / AI Smooth Slow-Mo / Auto Reframe — отрендерь превью полностью, чтобы не получить «дрожь» в финале.")
NUM("Проверь длительность: TikTok принимает до 10 минут, но идеал для алгоритма — 21–34 секунды для коротких форматов и 60–90 сек для длинных.")
SEP()

H1("3. Экспорт из CapCut Mobile (iOS / Android)")

H2("3.1. Где находится экспорт")
P("Кнопка экспорта — стрелка вверх в правом верхнем углу таймлайна. "
  "Нажмёшь её → откроется панель Export Settings.")

H2("3.2. Параметры (по полям)")
H3("Resolution (Разрешение)")
BUL("Выбирай 1080p.")
BUL("4K включай только если планируешь в дальнейшем кадрировать видео или использовать его на YouTube. Для TikTok 4K = пустая трата времени и места: TikTok пережмёт до 1080p, а двойное сжатие = больше артефактов.")

H3("Frame Rate (Частота кадров)")
BUL("60 fps — для динамики, спорта, танцев, экшна.")
BUL("30 fps — для talking-head, влогов, статичных сцен (меньше файл, плавнее лицо).")
BUL("Никогда не выбирай выше, чем у твоего исходника.")

H3("Code Rate / Bitrate (Битрейт)")
P("В мобильном CapCut пресет называется Code Rate. Выбирай Higher (Recommended). "
  "Это даст ~ 15–20 Mbps на 1080p/60. Не «Smart» и не «Lower».")

H3("Codec (Кодек)")
BUL("H.264 — выбирай по умолчанию. Совместимо со всем, TikTok принимает идеально.")
BUL("H.265 / HEVC — если в настройках есть. Размер файла на 30–40% меньше при том же качестве, но: 1) загружай ТОЛЬКО на iPhone (на Android-загрузчиках TikTok иногда конвертирует HEVC принудительно с потерями); 2) убедись, что финальный файл воспроизводится в галерее без «зелёных кадров».")

H3("Format (Формат / Контейнер)")
BUL("MP4 — единственно правильный выбор для TikTok.")

H3("Save to Device (Сохранение на устройство)")
P("Включи. Не используй кнопку «Share to TikTok» прямо из CapCut — она часто "
  "дополнительно пересжимает файл и обрезает битрейт. Сохрани в галерею и "
  "загружай вручную.")

H2("3.3. Итоговая мобильная конфигурация (copy-paste)")
MONO("Resolution : 1080p")
MONO("Frame rate : 60 fps  (или 30 fps если исходник 30)")
MONO("Code rate  : Higher (Recommended)")
MONO("Codec      : H.264   (или H.265 на iPhone)")
MONO("Format     : MP4")
MONO("Save to    : Device gallery")
MONO("Smart HDR  : OFF")
SEP()

H1("4. Экспорт из CapCut Desktop (Windows / Mac)")

H2("4.1. Где находится экспорт")
P("Кнопка Export — в правом верхнем углу окна (рядом с пунктом меню "
  "аккаунта). Откроется большое диалоговое окно со всеми параметрами.")

H2("4.2. Параметры (по полям)")

H3("Title / Save to (Название и путь)")
BUL("Имя файла — латиницей, без пробелов и эмодзи (TikTok иногда «спотыкается» на длинных русских именах при загрузке через web).")
BUL("Путь — лучше на SSD, чтобы не было лагов рендера.")

H3("Resolution")
BUL("1080p (1920×1080 в горизонтали или 1080×1920 в вертикали — CapCut применит твоё соотношение проекта).")
BUL("2K / 4K — только если работа НЕ для TikTok.")

H3("Frame Rate")
BUL("60 fps — стандарт для современных вертикальных видео.")
BUL("30 fps — для talking-head и контента с минимумом движения.")

H3("Code Rate (Битрейт)")
BUL("Recommended → выставит ~ 12–16 Mbps. Это безопасно.")
BUL("Higher → ~ 18–22 Mbps. Бери его, если есть много градиентов, ночные сцены, тёмные кадры — там TikTok особенно сильно «дробит» картинку.")
BUL("Custom → выставь вручную: 20 000 kbps (= 20 Mbps) для 1080p/60. Не больше — TikTok всё равно срежет.")

H3("Codec")
BUL("H.264 — выбор по умолчанию. Универсально, без сюрпризов.")
BUL("H.265 (HEVC) — экономит место. Рекомендую только если будешь грузить с iPhone.")
BUL("AV1 — НЕ выбирай для TikTok, есть случаи отказа в загрузке.")

H3("Format")
BUL("MP4 — для TikTok.")
BUL("MOV — только для архива/клиента.")

H3("Audio (Звук)")
BUL("Sample Rate: 48 kHz (или 44.1 kHz, если исходники в нём).")
BUL("Channels: Stereo.")
BUL("Bitrate: 192–256 kbps.")
BUL("Codec: AAC.")
P("Если в финале использовался музыкальный трек, обязательно проверь "
  "пиковую громкость: -1 dB True Peak максимум, средняя громкость "
  "около -14 LUFS (стандарт стриминга). Это убережёт от ограничения "
  "громкости в TikTok.")

H3("Smart HDR / HDR Export")
P("Выключи. TikTok HDR не показывает корректно.")

H2("4.3. Итоговая десктопная конфигурация (copy-paste)")
MONO("Resolution    : 1080p (1080 x 1920 для вертикали)")
MONO("Frame rate    : 60 fps (или 30)")
MONO("Code rate     : Custom 20000 kbps (или Higher)")
MONO("Encoder       : Hardware (если есть NVIDIA / Apple Silicon)")
MONO("Codec         : H.264 (или H.265 для iPhone-загрузки)")
MONO("Format        : MP4")
MONO("Audio codec   : AAC")
MONO("Audio sample  : 48 kHz, Stereo, 256 kbps")
MONO("Smart HDR     : OFF")
MONO("Color space   : Rec.709 (SDR)")
SEP()

H1("5. Аппаратное ускорение и скорость рендера")
P("Чтобы рендер не занимал час, включи аппаратное ускорение GPU:")
BUL("Settings → Performance → Hardware Acceleration → ON.")
BUL("На NVIDIA — выбери NVENC.")
BUL("На Apple Silicon (M1/M2/M3) — VideoToolbox включается автоматически.")
BUL("На AMD — AMF.")
P("Важно: hardware-кодеры на низких битрейтах дают чуть более «грязную» "
  "картинку, чем software (libx264). Поэтому именно при экспорте в "
  "TikTok ставь битрейт повыше (≥ 18 Mbps), компенсируя это.")
SEP()

H1("6. Загрузка в TikTok (это НЕ менее важно, чем экспорт)")
P("Можно сделать идеальный файл и угробить его кривой загрузкой. Алгоритм:")

H2("6.1. Настройки самого приложения TikTok")
NUM("Открой TikTok → Profile → ☰ (три полоски) → Settings and privacy.")
NUM("Cache and Cellular Data → Data Saver: ВЫКЛ. Включённый Data Saver автоматически режет качество и при просмотре, и при загрузке.")
NUM("Найди пункт High Quality Uploads (на iOS он в окне публикации, на Android — в Settings) и включи.")
NUM("В окне публикации видео разверни More options → включи Upload HD / Upload high-quality video. Без этого тумблера TikTok пережмёт видео в ~5 Mbps.")

H2("6.2. Сама загрузка")
BUL("Загружай только через мобильное приложение, НЕ через web-версию TikTok Studio (она пережимает сильнее).")
BUL("Загружай по Wi-Fi, не по 4G/LTE — на мобильной сети TikTok всё равно даунгрейдит файл, даже с включённым HD.")
BUL("Не редактируй видео внутри встроенного редактора TikTok после загрузки — каждое касание (фильтр, текст, эффект) запускает повторное сжатие. Все эффекты, текст и музыку зашивай ещё на этапе CapCut.")
BUL("Если нужна музыка из библиотеки TikTok — добавляй её в CapCut через TikTok-плагин или загружай немое видео и накладывай звук в TikTok без правок изображения.")
BUL("Размер файла — до 287.6 MB на iOS и до 72 MB на Android (через приложение). При экспорте 1080p/60/20Mbps на 60 секунд получится ~150 MB — влезает.")

H2("6.3. После загрузки")
BUL("Подожди 5–15 минут перед публикацией. TikTok делает фоновую транскодировку — иногда сразу после загрузки видео выглядит «мыльным», а через 10 минут платформа подгружает HD-версию.")
BUL("Открой свой пост на чужом телефоне или с включённым HD — убедись, что качество «доехало». Если нет, перевыложи.")
SEP()

H1("7. Частые проблемы и решения")

H2("7.1. После загрузки видео в мыле")
BUL("Проверь, выключен ли Data Saver и включён ли HD Upload.")
BUL("Перезалей по Wi-Fi.")
BUL("Не редактируй через TikTok-редактор после загрузки.")
BUL("Подожди 10–15 минут — TikTok дорендеривает HD-версию в фоне.")

H2("7.2. Видео тёмное / пересвеченное")
BUL("В CapCut выключи Smart HDR.")
BUL("Экспортируй в SDR (Rec.709).")
BUL("Если снимал на iPhone в HDR — в галерее iPhone отключи «Просмотр HDR» и проверь, как видео выглядит в SDR.")

H2("7.3. Звук тише, чем у других")
BUL("В CapCut подними средний уровень до -14 LUFS, пик до -1 dB.")
BUL("Используй Audio → Loudness в CapCut Desktop (или плагин Auto Volume на мобиле).")
BUL("Стерео, 48 kHz, AAC 256 kbps.")

H2("7.4. TikTok отказывается грузить файл")
BUL("Файл больше лимита — пережми кодеком H.265 или сократи длительность.")
BUL("Кодек AV1 — пересохрани в H.264.")
BUL("Кириллица в имени файла — переименуй латиницей.")
BUL("Поломанный контейнер MOV — экспортируй в MP4.")

H2("7.5. Дёрганые движения / эффект «мыла» в динамике")
BUL("Подними битрейт до Custom 22–25 Mbps.")
BUL("Убедись, что fps экспорта совпадает с fps исходника.")
BUL("Не используй Optical Flow интерполяцию на исходниках 24 fps без необходимости.")
SEP()

H1("8. Бонус: уникальный «фингерпринт» файла, чтобы TikTok не считал его дублем")
P("Если выкладываешь одно и то же видео на несколько аккаунтов, TikTok может "
  "пометить его как дубликат и срезать охваты. Чтобы каждая копия "
  "считалась уникальной:")
NUM("При каждом экспорте чуть-чуть меняй параметры: битрейт (20000 → 19500 → 21000 kbps).")
NUM("Меняй имя файла и дату модификации (через свойства файла или утилиту touch).")
NUM("Незаметно сдвигай начало/конец на 0.1–0.3 секунды (обрежь первый кадр).")
NUM("Накладывай тонкий шум 1–2% (CapCut → Effects → Grain) — это меняет хеш кадров.")
NUM("Незаметно меняй экспозицию на ±2% или сатурацию на ±3% в Adjustment-слое поверх всего видео.")
NUM("Зеркало по горизонтали (если в кадре нет текста) — самый радикальный, но рабочий способ.")
P("Делай 2–3 из этих шагов одновременно — этого достаточно, чтобы TikTok "
  "посчитал ролик новым контентом.")
SEP()

H1("9. Чеклист перед публикацией (распечатай и держи рядом)")
NUM("Проект 1080×1920, 9:16.")
NUM("FPS проекта = FPS исходника (30 или 60).")
NUM("Все важные элементы внутри безопасной зоны.")
NUM("Экспорт: 1080p / 60 fps / Higher или Custom 20 Mbps / H.264 / MP4 / AAC 48 kHz 256 kbps.")
NUM("Smart HDR — выключен.")
NUM("Файл сохранён в галерею с латинским именем.")
NUM("В TikTok: Data Saver — OFF, HD Upload — ON, Wi-Fi.")
NUM("Загрузка через мобильное приложение, без правок в редакторе TikTok.")
NUM("Подождать 10 минут перед публикацией — пусть HD-версия дорендерится.")
NUM("Проверить готовый пост на другом устройстве.")
SEP()

H1("10. Источники")
BUL("TikTok Help Center — рекомендованные параметры загрузки.")
BUL("CapCut официальная документация — Export presets.")
BUL("Accio.com — Best CapCut Video Settings (2026).")
BUL("Miracamp.com — How to Export High-Quality Videos in CapCut.")
BUL("Topqlearn.com — Best Export Settings for TikTok Videos (2026 Guide).")
BUL("Videoproc.com — How to Upload High Quality Videos to TikTok.")
P("Контент перефразирован для соответствия лицензионным требованиям.")

# Build .docx (Office Open XML)
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"

def run_xml(text, bold=False, mono=False, sz=None, color=None):
    rpr_parts = []
    if bold:
        rpr_parts.append('<w:b/>')
    if mono:
        rpr_parts.append('<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>')
    if sz is not None:
        rpr_parts.append(f'<w:sz w:val="{sz}"/><w:szCs w:val="{sz}"/>')
    if color:
        rpr_parts.append(f'<w:color w:val="{color}"/>')
    rpr = f'<w:rPr>{"".join(rpr_parts)}</w:rPr>' if rpr_parts else ""
    safe = escape(text)
    return f'<w:r>{rpr}<w:t xml:space="preserve">{safe}</w:t></w:r>'

def para_xml(style_id=None, runs_xml="", numId=None, ilvl=0, jc=None, shd=None):
    ppr_parts = []
    if style_id:
        ppr_parts.append(f'<w:pStyle w:val="{style_id}"/>')
    if numId is not None:
        ppr_parts.append(f'<w:numPr><w:ilvl w:val="{ilvl}"/><w:numId w:val="{numId}"/></w:numPr>')
    if jc:
        ppr_parts.append(f'<w:jc w:val="{jc}"/>')
    if shd:
        ppr_parts.append(f'<w:shd w:val="clear" w:color="auto" w:fill="{shd}"/>')
    ppr = f'<w:pPr>{"".join(ppr_parts)}</w:pPr>' if ppr_parts else ""
    return f"<w:p>{ppr}{runs_xml}</w:p>"

body_parts = []
for kind, text in BLOCKS:
    if kind == "H1":
        body_parts.append(para_xml("Heading1", run_xml(text, bold=True, sz=44, color="1F3864")))
    elif kind == "H2":
        body_parts.append(para_xml("Heading2", run_xml(text, bold=True, sz=32, color="2E74B5")))
    elif kind == "H3":
        body_parts.append(para_xml("Heading3", run_xml(text, bold=True, sz=26, color="2E74B5")))
    elif kind == "P":
        body_parts.append(para_xml(None, run_xml(text, sz=22)))
    elif kind == "BUL":
        body_parts.append(para_xml("ListBullet", run_xml(text, sz=22), numId=1, ilvl=0))
    elif kind == "NUM":
        body_parts.append(para_xml("ListNumber", run_xml(text, sz=22), numId=2, ilvl=0))
    elif kind == "MONO":
        body_parts.append(para_xml(None, run_xml(text, mono=True, sz=20), shd="F2F2F2"))
    elif kind == "SEP":
        body_parts.append(para_xml(None, run_xml(" ", sz=22)))
        body_parts.append(para_xml(None, run_xml("─" * 50, sz=20, color="BFBFBF"), jc="center"))
        body_parts.append(para_xml(None, run_xml(" ", sz=22)))

document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="{W}">
  <w:body>
    {"".join(body_parts)}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"""

styles_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:lang w:val="ru-RU"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="120" w:line="276" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:pPr>
      <w:spacing w:before="360" w:after="180"/>
      <w:outlineLvl w:val="0"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:color w:val="1F3864"/>
      <w:sz w:val="44"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:pPr>
      <w:spacing w:before="280" w:after="140"/>
      <w:outlineLvl w:val="1"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:color w:val="2E74B5"/>
      <w:sz w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:pPr>
      <w:spacing w:before="220" w:after="120"/>
      <w:outlineLvl w:val="2"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:color w:val="2E74B5"/>
      <w:sz w:val="26"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="ListBullet">
    <w:name w:val="List Bullet"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:ind w:left="720" w:hanging="360"/>
    </w:pPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="ListNumber">
    <w:name w:val="List Number"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:ind w:left="720" w:hanging="360"/>
    </w:pPr>
  </w:style>
</w:styles>
"""

numbering_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="•"/>
      <w:lvlJc w:val="left"/>
      <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
      <w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol" w:hint="default"/></w:rPr>
    </w:lvl>
  </w:abstractNum>
  <w:abstractNum w:abstractNumId="1">
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="decimal"/>
      <w:lvlText w:val="%1."/>
      <w:lvlJc w:val="left"/>
      <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
  <w:num w:numId="2"><w:abstractNumId w:val="1"/></w:num>
</w:numbering>
"""

content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>
"""

main_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"""

document_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>
"""

with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml", content_types)
    z.writestr("_rels/.rels", main_rels)
    z.writestr("word/_rels/document.xml.rels", document_rels)
    z.writestr("word/document.xml", document_xml)
    z.writestr("word/styles.xml", styles_xml)
    z.writestr("word/numbering.xml", numbering_xml)

print(f"OK -> {OUT}")
print(f"Size: {os.path.getsize(OUT)} bytes")
