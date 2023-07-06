# NoSquint Plus (legacy)
 English version of text is below.

 Работающие версии аддона NoSquint Plus (основаны на NoSquint Plus 56.1.):
- 56.1(L) – для Firefox 39-56 \[\*1\], Waterfox, Waterfox Classic и Basilisk.
- 56.1.2019.0.1 – для Firefox 58-68 \[\*1\] и Waterfox Current 2019-2020.
- 56.2023.115 – для Firefox 77+ \[\*1\] и Waterfox G3/G4/G5.</br></br>

 NoSquint имеет преимущество над другими аддонами для масштабирования: NoSquint позволяет устанавливать независимые полный и текстовый масштабы одновременно и запоминает эти установки для сайтов. Другой аддон, который может дополнять NoSquint, потому что масштабирует по-другому: https://addons.mozilla.org/en-US/firefox/addon/custom-page-zoom/

 WebExtensions-версии NoSquint Plus (61.x-62.x) глючные и неюзабельные; автор забросил аддон.

      **УСТАНОВКА**</br>
 Настройки, которые должны быть в about:config перед установкой аддона:</br>
  <b>xpinstall.signatures.required = false</b></br>
  <b>extensions.legacy.enabled = true</b> – для Firefox <=73, Waterfox, Waterfox Classic, Waterfox Current</br>
  <b>extensions.experiments.enabled = true</b> – для Firefox 74+, Waterfox G3/G4</br>
 \*1 В Firefox 48+ перед установкой нужно ещё отключить обязательную проверку подписей аддонов (это не относится к версиям Developer Edition и Nightly), а в Firefox 65+ – ещё включить возможность устанавливать bootstrap-аддоны. Инструкция (https://github.com/xiaoxiaoflood/firefox-scripts#instructions ):</br>
  １. Распакуйте содержимое <b>[этого файла](https://raw.githubusercontent.com/xiaoxiaoflood/firefox-scripts/master/fx-folder.zip)</b> в папку установки Firefox (обычно C:\Program Files\Mozilla Firefox). Это отключит обязательную проверку подписей аддонов.</br>
  ２. Создайте папку chrome в профиле пользователя (папку профиля можно найти в about:profiles , она указана как Root Directory / Корневой каталог).</br>
  ３. Распакуйте в папку chrome содержимое <b>[этого файла](https://raw.githubusercontent.com/xiaoxiaoflood/firefox-scripts/master/utils_extensions_only.zip)</b>. Это позволит устанавливать bootstrap-аддоны.</br>
  ４, ５. \[Пункты 4 и 5 не требуются для установки bootstrap-аддонов.\]</br>
  ６. Откройте about:support и кликните "Clear startup cache…" / "Очистить кэш запуска…".</br>
  ７. Перезапустите Firefox.

 Для установки NoSquint Plus скачайте xpi-файл (https://github.com/Mikhail-M12/NoSquint-Plus-legacy-/releases ) и откройте его в браузере.

 56.1(L) – это оригинальный NoSquint Plus 56.1 с изменениями: 1) Устранена "временна́я бомба"; 2) Отключено автообновление; 3) Добавлена русская локализация.

****************************************************

 Working versions of NoSquint Plus addon (based on NoSquint Plus 56.1):
- 56.1(L) – for Firefox 39-56 \[\*1\], Waterfox, Waterfox Classic and Basilisk.
- 56.1.2019.0.1 – for Firefox 58-68 \[\*1\] and Waterfox Current 2019-2020.
- 56.2023.115 – for Firefox 77+ \[\*1\] and Waterfox G3/G4/G5.</br></br>

 NoSquint has "killer feature" as compared with other zoom addons: NoSquint allows to set independent full and text zoom levels simultaneously and remembers these settings for sites. Another addon that can complement with NoSquint: https://addons.mozilla.org/en-US/firefox/addon/custom-page-zoom/ . It uses different zoom method.

 NoSquint Plus WebExtensions versions (61.x-62.x) are buggy and unusable; author abandoned this addon.

      **INSTALLATION**</br>
 about:config entries must be set before install:</br>
  <b>xpinstall.signatures.required = false</b></br>
  <b>extensions.legacy.enabled = true</b> – for Firefox <=73, Waterfox, Waterfox Classic</br>
  <b>extensions.experiments.enabled = true</b> – for Firefox 74+, Waterfox G3/G4</br>
 \*1 In Firefox 48+ before installing NoSquint Plus, mandatory addon signature checking must be disabled (it doesn't affect Developer Edition and Nightly versions), and in Firefox 65+ ability of installing of bootstrap addons must be enabled. Instructions: https://github.com/xiaoxiaoflood/firefox-scripts#instructions

 For installation NoSquint Plus download xpi-file (https://github.com/Mikhail-M12/NoSquint-Plus-legacy-/releases ) and open it in browser.

 56.1(L) is original NoSquint Plus 56.1 with modifications: 1) "Time bomb" removed; 2) Autoupdating is disabled; 3) Russian localization added.
