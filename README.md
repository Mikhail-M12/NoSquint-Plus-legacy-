# NoSquint Plus (legacy)
 English version of text is below.

 Работающие версии аддона NoSquint Plus (основаны на NoSquint Plus 56.1.):
- 56.1(L) – для Firefox 39-56\*, Waterfox, Waterfox Classic и Basilisk.
- 56.1.2019.0.1 – для Firefox 58-68\*\* и Waterfox Current 2019-2020.
- 56.2020.77 – для Firefox 77+\*\* и Waterfox G3.</br></br>
\* 56.1(L) не подходит\*1 для версий Firefox 48+: Release, Beta (в них не отключить проверку подписей аддонов).</br>
\*\* 56.1.2019.0.1 и 56.2020.77 не подходят\*1\*2 для версий Firefox: Release, ESR, Beta (в них нельзя устаналивать не-WE аддоны).

 NoSquint имеет преимущество над другими аддонами для масштабирования: NoSquint позволяет устанавливать независимые полный и текстовый масштабы одновременно и запоминает эти установки для сайтов. Другой аддон, который может дополнять NoSquint, потому что масштабирует по-другому: https://addons.mozilla.org/en-US/firefox/addon/custom-page-zoom/

 WebExtensions-версии NoSquint Plus (61.x-62.x) глючные и неюзабельные; автор забросил аддон.

      УСТАНОВКА</br>
 Настройки, которые должны быть в about:config перед установкой аддона:</br>
  <b>xpinstall.signatures.required = false</b></br>
  <b>extensions.legacy.enabled = true</b> – для Firefox <=73, Waterfox, Waterfox Classic</br>
  <b>extensions.experiments.enabled = true</b> – для Firefox 74+</br>
 В Firefox 65+ перед установкой нужно ещё установить <b>аддон bootstrap loader</b>: https://github.com/xiaoxiaoflood/firefox-scripts/tree/master/extensions/bootstrapLoader

 Для установки скачайте xpi-файл (https://github.com/Mikhail-M12/NoSquint-Plus-legacy-/releases ) и откройте его в браузере.

 56.1(L) – это оригинальный NoSquint Plus 56.1 с изменениями: 1) Устранена "временна́я бомба"; 2) Отключено автообновление; 3) Добавлена русская локализация.

\*1 Для Firefox 48+ отключение проверки подписи дополнений возможно в ESR, Developer Edition, Nightly или unbranded. Но можно использовать специальную конфигурацию для отключения проверки подписей в Firefox 48+: https://forum.mozilla-russia.org/viewtopic.php?id=70326</br>
\*2 Но можно использовать специальную инсталляцию аддона: https://www.ggbs.de/extensions/Firefox.html

****************************************************

 Working versions of NoSquint Plus addon (based on NoSquint Plus 56.1):
- 56.1(L) – for Firefox 39-56\*, Waterfox, Waterfox Classic and Basilisk.
- 56.1.2019.0.1 – for Firefox 58-68\*\* and Waterfox Current 2019-2020.
- 56.2020.77 – for Firefox 77+\*\* and Waterfox G3.</br></br>
\* 56.1(L) doesn't fit\*1 for Firefox 48+ versions: Release, Beta (it's impossible to disable addon signature checking in them).</br>
\*\* 56.1.2019.0.1 and 56.2020.77 doesn't fit\*1\*2 for Firefox versions: Release, ESR, Beta (they can't install non-WE addons).

 NoSquint has "killer feature" as compared with other zoom addons: NoSquint allows to set independent full and text zoom levels simultaneously and remembers these settings for sites. Another addon that can complement with NoSquint: https://addons.mozilla.org/en-US/firefox/addon/custom-page-zoom/ . It uses different zoom method.

 NoSquint Plus WebExtensions versions (61.x-62.x) are buggy and unusable; author abandoned this addon.

      INSTALLATION</br>
 about:config entries must be set before install:</br>
  <b>xpinstall.signatures.required = false</b></br>
  <b>extensions.legacy.enabled = true</b> – for Firefox <=73, Waterfox, Waterfox Classic</br>
  <b>extensions.experiments.enabled = true</b> – for Firefox 74+</br>
 In Firefox 65+ <b>bootstrap loader addon</b> must be installed: https://github.com/xiaoxiaoflood/firefox-scripts/tree/master/extensions/bootstrapLoader

 For installation download xpi-file (https://github.com/Mikhail-M12/NoSquint-Plus-legacy-/releases ) and open it in browser.

 56.1(L) is original NoSquint Plus 56.1 with modifications: 1) "Time bomb" removed; 2) Autoupdating is disabled; 3) Russian localization added.

\*1 For Firefox 48+ disabling of addon signature checking is possible for ESR, Developer Edition, Nightly or unbranded. But it's possible to use special configuration for disabling of signature checking in Firefox 48+: https://forum.mozilla-russia.org/viewtopic.php?id=70326</br>
\*2 But it's possible to use special installation of addon: https://www.ggbs.de/extensions/Firefox.html
