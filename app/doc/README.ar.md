# OpenWorkflows

<div align="center">
  <a href="../../README.md">English</a> | <a href="README.zh-CN.md">中文</a> | <a href="README.fr.md">Français</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.ja.md">日本語</a> | <a href="README.hi.md">हिन्दी</a> | العربية
</div>

مَكَّن Claude Code ميزة Workflow لتنسيق خطوات الوكلاء المتعددة، والفروع المتوازية، وخطوط المعالجة باعتبارها نصوصًا قابلة للتنفيذ. يحوّل OpenWorkflows هذا النمط إلى محرّر بصري متعدد النماذج: تبني رسمًا بيانيًا واحدًا لسير العمل، ثم تشغّله أو تُكيّفه عبر Claude Code وCodex وGemini وأنظمة تشغيل النماذج المحلية أو السحابية المستقبلية.

يحافظ تمثيل IR المشترك على قابلية نقل بنية سير العمل، مع السماح لكل عقدة باختيار النموذج الموجّه إلى نظام التشغيل، والمُوجّه (prompt)، وschema، وإعدادات التنفيذ الخاصة بها.

<p align="center">
  <img src="images/0-标题使用.png" alt="لقطة شاشة لمحرّر OpenWorkflows" width="960">
</p>

## دليل الاستخدام

- [دليل استخدام OpenWorkflows](claude-code-workflow-openworkflow.en.md) - شرح تفصيلي خطوة بخطوة مع لقطات الشاشة من الإعداد حتى التبديل بين أنظمة التشغيل.

## دعم سير العمل متعدد النماذج

- يوسّع OpenWorkflows فكرة Claude Code Workflow لتتجاوز نظام تشغيل نموذج لغوي واحد.
- يمكن تحرير رسم سير العمل نفسه بصريًا وتوجيهه إلى Claude Code أو Codex أو Gemini أو محوّلات إضافية.
- تتحوّل العناصر الأولية بأسلوب Claude Code، مثل خطوات الوكلاء والفروع المتوازية وخطوط المعالجة، إلى عقد رسم بياني قابلة للنقل.
- يمكن لكل عقدة أن تحمل المُوجّه الخاص بها، ومستوى النموذج، وschema، وإعدادات التنفيذ.
- يقوم عرض النص البرمجي بترجمة الرسم البياني إلى نصوص Workflow قابلة للتشغيل بأسلوب Claude Code اليوم، مع طبقة محوّلات جاهزة لأنظمة تشغيل النماذج الأخرى.

## لماذا OpenWorkflows

- صِف الهدف في حقل إدخال الذكاء الاصطناعي أسفل اليمين وولّد مخطط Workflow قابلًا للتحرير.
- تأليف بصري لسير العمل بدلاً من التحرير اليدوي لنصوص الوكلاء المتعددة الكبيرة.
- مكتبة مُوجّهات قابلة لإعادة الاستخدام تتضمّن عمليات إعادة كتابة شائعة لسير العمل ومُوجّهات للمراجعة.
- مساحة عمل وسجل للجلسات حتى تتمكن من العودة إلى عملك السابق بسرعة.
- عناصر تحكم للتشغيل/الإيقاف مع حالة تنفيذ لكل عقدة على اللوحة.
- تخزين محلي لمفتاح API لمساعدة الذكاء الاصطناعي من جانب المتصفح، يُحفظ على الجهاز فقط.

## البدء السريع

```bash
cd app
npm install
npm run dev
```

لتطبيق سطح المكتب:

```bash
cd app
npm run desktop
```

لحزمة إصدار Windows:

```bash
cd app
npm run package
```

من جذر المستودع، يُشغّل `run.bat` التطبيق ويعيد بناءه عند الحاجة، ويحزم `build.bat` مُثبّت Windows.

## الاستخدام الأساسي

1. أنشئ سير عمل جديدًا أو افتح واحدًا موجودًا.
2. صِف المهمة في حقل إدخال الذكاء الاصطناعي أسفل اليمين. يولّد OpenWorkflows مخطط Workflow تلقائيًا.
3. واصل تحسين المخطط بكتابة تعليمات متابعة في الحقل نفسه، أو انقر المُوجّهات الشائعة في اللوحة اليمنى للتعديلات المتعلقة بالبنية، والاكتمال، والتكلفة، والموثوقية، والتراجع.
4. حدّد عقدًا فردية عندما تحتاج إلى تحرير المُوجّهات أو النماذج أو schemas أو معاملات التنفيذ يدويًا.
5. اختر محوّل نظام تشغيل مثل Claude Code أو Codex أو Gemini، ثم اضبط نماذج العقد حسب الحاجة.
6. انقر زر التشغيل في الأعلى لتنفيذ سير العمل، وراقب تحديثات الحالة لكل عقدة، وأوقفه في أي وقت.
7. بدّل بين الجلسات أو مساحات العمل من شريط السجل لمتابعة العمل السابق.

## بنية المشروع

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

## مزيد من الوثائق

- [README بالصينية](README.zh-CN.md)
- [دليل الاستخدام بالصينية](claude-code-workflow-openworkflow.md)

## التحقق

```bash
cd app
npm run typecheck
npm run lint
npm run package
```

## الترخيص

لم يُحدَّد أي ترخيص بعد.
