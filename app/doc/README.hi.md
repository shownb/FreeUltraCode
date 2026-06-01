# OpenWorkflows

<div align="center">
  <a href="../../README.md">English</a> | <a href="README.zh-CN.md">中文</a> | <a href="README.fr.md">Français</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.ja.md">日本語</a> | हिन्दी | <a href="README.ar.md">العربية</a>
</div>

Claude Code ने मल्टी-एजेंट चरणों, समानांतर शाखाओं और पाइपलाइनों को निष्पादन-योग्य स्क्रिप्ट के रूप में व्यवस्थित करने के लिए एक Workflow सुविधा पेश की। OpenWorkflows इसी पैटर्न को एक विज़ुअल, मल्टी-मॉडल एडिटर में बदल देता है: एक Workflow ग्राफ़ बनाएं, फिर उसे Claude Code, Codex, Gemini, और भविष्य के लोकल या क्लाउड मॉडल रनटाइम पर चलाएं या अनुकूलित करें।

साझा IR वर्कफ़्लो की संरचना को पोर्टेबल बनाए रखता है, जबकि प्रत्येक नोड को अपना रनटाइम-सामना करने वाला मॉडल, प्रॉम्प्ट, schema और निष्पादन सेटिंग्स चुनने की सुविधा देता है।

<p align="center">
  <img src="images/0-标题使用.png" alt="OpenWorkflows एडिटर स्क्रीनशॉट" width="960">
</p>

## उपयोग ट्यूटोरियल

- [OpenWorkflows उपयोग ट्यूटोरियल](claude-code-workflow-openworkflow.en.md) - सेटअप से लेकर रनटाइम स्विचिंग तक स्क्रीनशॉट के साथ चरण-दर-चरण मार्गदर्शिका।

## मल्टी-मॉडल Workflow समर्थन

- OpenWorkflows, Claude Code Workflow के विचार को एक एकल LLM रनटाइम से आगे बढ़ाता है।
- वही Workflow ग्राफ़ विज़ुअल रूप से संपादित किया जा सकता है और Claude Code, Codex, Gemini, या अतिरिक्त अडैप्टर के लिए लक्षित किया जा सकता है।
- Claude Code-शैली के प्रिमिटिव जैसे agent चरण, समानांतर शाखाएं, और पाइपलाइन पोर्टेबल ग्राफ़ नोड बन जाते हैं।
- प्रत्येक नोड अपना स्वयं का प्रॉम्प्ट, मॉडल टियर, schema और निष्पादन सेटिंग्स रख सकता है।
- स्क्रिप्ट व्यू आज ग्राफ़ को चलाने-योग्य Claude Code-शैली के Workflow स्क्रिप्ट में संकलित करता है, और अडैप्टर परत अन्य मॉडल रनटाइम के लिए तैयार है।

## OpenWorkflows क्यों

- नीचे-दाईं ओर के AI इनपुट में लक्ष्य का वर्णन करें और एक संपादन-योग्य Workflow ब्लूप्रिंट तैयार करें।
- बड़ी मल्टी-एजेंट स्क्रिप्ट को हाथ से संपादित करने के बजाय विज़ुअल वर्कफ़्लो रचना।
- सामान्य वर्कफ़्लो पुनर्लेखन और समीक्षा प्रॉम्प्ट के साथ एक पुन: उपयोग-योग्य प्रॉम्प्ट लाइब्रेरी।
- वर्कस्पेस और सत्र इतिहास ताकि आप पहले के काम पर जल्दी लौट सकें।
- कैनवास पर प्रति-नोड निष्पादन स्थिति के साथ रन/स्टॉप नियंत्रण।
- ब्राउज़र-साइड AI सहायता के लिए लोकल API key संग्रहण, जो केवल मशीन पर ही रखा जाता है।

## त्वरित शुरुआत

```bash
cd app
npm install
npm run dev
```

डेस्कटॉप ऐप के लिए:

```bash
cd app
npm run desktop
```

Windows रिलीज़ पैकेज के लिए:

```bash
cd app
npm run package
```

रिपॉज़िटरी रूट से, `run.bat` ऐप को लॉन्च करता है और ज़रूरत पड़ने पर पुनः बिल्ड करता है, और `build.bat` Windows इंस्टॉलर को पैकेज करता है।

## बुनियादी उपयोग

1. एक नया वर्कफ़्लो बनाएं या किसी मौजूदा को खोलें।
2. नीचे-दाईं ओर के AI इनपुट में कार्य का वर्णन करें। OpenWorkflows स्वचालित रूप से Workflow ब्लूप्रिंट तैयार करता है।
3. उसी इनपुट में अनुवर्ती निर्देश टाइप करके ब्लूप्रिंट को परिष्कृत करते रहें, या संरचना, पूर्णता, लागत, विश्वसनीयता, और रोलबैक-उन्मुख संपादनों के लिए दाएं पैनल पर सामान्य प्रॉम्प्ट पर क्लिक करें।
4. जब आपको प्रॉम्प्ट, मॉडल, schema, या निष्पादन पैरामीटर मैन्युअल रूप से संपादित करने की आवश्यकता हो तो अलग-अलग नोड चुनें।
5. Claude Code, Codex, या Gemini जैसे रनटाइम अडैप्टर का चयन करें, फिर आवश्यकतानुसार नोड मॉडल को ट्यून करें।
6. वर्कफ़्लो को निष्पादित करने के लिए शीर्ष Run बटन पर क्लिक करें, प्रति-नोड स्थिति अपडेट देखें, और किसी भी समय रोकें।
7. पहले के काम को जारी रखने के लिए इतिहास रेल से सत्र या वर्कस्पेस स्विच करें।

## प्रोजेक्ट लेआउट

```text
app/
  src/                 React + TypeScript frontend
    core/              IR, parser, emitter, round-trip logic
    canvas/            React Flow canvas and node components
    panels/            Sidebar, prompt panel, AI dock
    store/             Zustand application state
  src-tauri/           Rust/Tauri desktop backend and packaging config
  doc/                 Usage tutorial and screenshots
pencil/                Pencil design files
run.bat                Build-if-needed and launch the Windows app
build.bat              Build the Windows installer
```

## और दस्तावेज़

- [चीनी README](README.zh-CN.md)
- [चीनी उपयोग ट्यूटोरियल](claude-code-workflow-openworkflow.md)

## सत्यापन

```bash
cd app
npm run typecheck
npm run lint
npm run package
```

## लाइसेंस

अभी तक कोई लाइसेंस निर्दिष्ट नहीं किया गया है।
