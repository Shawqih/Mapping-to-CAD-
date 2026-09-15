# بناء تطبيق Android دون Expo EAS

يستخدم المشروع سير عمل GitHub Actions مستقلًا عن Expo EAS. عند كل دفع إلى `main` أو عند تشغيله يدويًا من تبويب **Actions**، ينفذ GitHub الخطوات التالية:

1. تثبيت Node.js وpnpm وJava 17.
2. تثبيت اعتمادات المشروع من `pnpm-lock.yaml`.
3. توليد مشروع Android الأصلي من إعدادات Expo الحالية عبر `expo prebuild`.
4. بناء ملف APK باستخدام Android Gradle Plugin ومهمة `assembleRelease`.
5. رفع ملف APK كـ GitHub Actions Artifact باسم `agon-surveyor-android-apk`.

لا يستخدم هذا المسار EAS أو حساب Expo للبناء. يحتفظ التطبيق بنفس شاشات React Native، وظائف الخريطة، التخزين، التصدير، الصلاحيات، الهوية، والموارد الموجودة في المشروع. يتم توليد مجلد `android` أثناء سير العمل لضمان توافقه مع نسخة Expo/React Native المحددة في `package.json`.

## التشغيل

افتح مستودع GitHub ثم **Actions → Build Android APK → Run workflow**. بعد اكتمال المهمة، حمّل artifact المسمى `agon-surveyor-android-apk`.

> ملاحظة: نسخة `release` الناتجة تستخدم إعداد التوقيع الافتراضي الموجود في مشروع prebuild لتسهيل التثبيت والاختبار. قبل النشر العام على Google Play، يجب استبدال ذلك بمفتاح توقيع إنتاجي محفوظ في GitHub Secrets.
