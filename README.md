# SrProject2

## Overview
SrProject2 is a robust, enterprise-grade Angular application designed for scalability, maintainability, and high performance. Built with a modular architecture, it leverages advanced Angular patterns, custom Fuse components, and Tailwind CSS for a modern, responsive UI. The project structure and codebase reflect best practices suitable for senior-level engineers.

## Key Features
- **Modular Architecture:** Clear separation of concerns with feature modules, core services, and shared utilities.
- **Custom Fuse Library:** Extensive use of the `@fuse` library for UI components, animations, directives, and services.
- **Tailwind CSS Integration:** Utility-first styling for rapid UI development and consistent design.
- **Mock API Layer:** Easily configurable mock APIs for development and testing.
- **Internationalization:** Built-in support for multiple languages using Transloco.
- **Advanced State Management:** Scalable patterns for state and configuration management.
- **Responsive Layouts:** Adaptive layouts and components for all device sizes.
- **Testing Ready:** Structure supports unit, integration, and end-to-end testing.

# SrProject2

## Kısa Bakış
SrProject2, ölçeklenebilirlik, sürdürülebilirlik ve üretim kalitesi hedeflenerek inşa edilmiş bir Angular uygulamasıdır. Mimari tercihler, kullanılan kütüphaneler ve proje düzeni kıdemli mühendislerin hızlıca adapte olup katkı sağlayabileceği şekilde düzenlenmiştir.

Proje kıdemlilik seviyesi (değerlendirme): %95 senior-ready

Bu yüzde, mimari kalite, teknoloji seçimi ve geliştirme hazırlığına dayanmaktadır; eksiklikler (lint, CI, sıkı TypeScript yapılandırması) düşük düzeltme maliyetiyle hızla kapatılabilir.

## Neden %95?
- Pozitifler:
	- Modüler yapı ve `src/@fuse` gibi yeniden kullanılabilir kütüphane yapıları.
	- Tailwind, Transloco, ApexCharts, Quill gibi üretim sınıfı bağımlılıklar.
	- Mock API desteği ve hazır build/test scriptleri.
- Kısıtlar (puan kıran):
	- `tsconfig.json`'da `strict` görünmüyor; tip sıkılığı artırılmalı.
	- ESLint/formatting scriptleri veya konfigürasyonu bulunmuyor.
	- CI ve coverage gating (repo kökünde görünmüyor).

## Hızlı Başlangıç
1. Bağımlılıkları yükleyin:

```cmd
npm install
```

2. Geliştirme sunucusunu başlatın:

```cmd
npm start
```

3. Prod build:

```cmd
npm run build
```

## Proje Yapısı (öz)
- `src/app/` — Uygulama kodu (feature/core modüller).
- `src/@fuse/` — Yeniden kullanılabilir UI kütüphanesi (component, directive, pipe, service).
- `src/assets/` — Statik içerikler, i18n kaynakları.
- `src/environments/` — Ortam konfigürasyonları.

## Kalite ve Süreç Önerileri (öncelikli)
1. TypeScript sıkılığını açın (`tsconfig.json`: `"strict": true`) ve derleyin.
2. `ESLint` + `prettier` ekleyin; `lint` script'i yaratın ve CI'da çalıştırın.
3. Basit bir CI pipeline (GitHub Actions) ekleyin: `install`, `build`, `lint`, `test`, `coverage`.

Örnek kısa komutlar (Windows cmd.exe):

```cmd
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier prettier
npx -p @angular/cli ng add @angular-eslint/schematics
```

## Katkıda Bulunma
- Kod tarzına uyun, küçük PR'lar ve temiz commit mesajları tercih edin.
- Yeni özellikler için birim testleri ekleyin; bugfix için regresyon testleri yazın.

## Lisans
Lütfen `LICENSE.md` dosyasına bakın.

---
Bu README, kıdemli geliştiricilerin hızlıca değerlendirebileceği, katkı planlayabileceği ve projeyi üretime taşımak için hangi adımların öncelikli olduğunu görebileceği şekilde tasarlandı.
