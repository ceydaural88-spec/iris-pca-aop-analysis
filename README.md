# Iris Veri Seti Üzerinde PCA Analizi ve AOP Tabanlı Performans İzleme

Bu proje, makine öğrenmesinin temel veri setlerinden biri olan **Iris Veri Seti** üzerinde **Temel Bileşenler Analizi (PCA - Principal Component Analysis)** uygulayarak boyut indirgeme gerçekleştiren ve tüm bu süreci **Aspect-Oriented Programming (AOP - Cephe Yönelimli Programlama)** yaklaşımı ile ana iş mantığından bağımsız olarak izleyen, doğrulayan ve loglayan bir Node.js uygulamasıdır.

---

## 🎯 Projenin Amacı ve Kapsamı

* **Veri Bilimi / PCA Katmanı (`src/IrisPCAModule.js`):** 4 boyutlu Iris veri setinin yüklenmesi, öznitelik ve sınıf dağılımı analizi, Z-Score standardizasyonu ile ön işleme tabi tutulması, 2 temel bileşene (PC1 ve PC2) indirgenmesi ve sonuçların interaktif bir saçılım grafiği (Scatter Plot) olarak görselleştirilmesi.
* **Yazılım Mimarisi / AOP Katmanı (`src/aopManager.js`):** Çekirdek PCA koduna müdahale etmeden JavaScript `Proxy` mekanizması ile metod çağrılarının çalışma anında (runtime) kesilmesi; veri doğrulama, milisaniye hassasiyetinde süre ölçümü, bellek (Heap) değişimi analizi, hata yönetimi ve yapılandırılmış loglama işlemlerinin yürütülmesi.

---

## 🏗️ Proje Klasör Yapısı

```text
iris-pca-aop-analysis/
├── src/
│   ├── IrisPCAModule.js          # Iris veri yükleme, ön işleme, PCA ve görselleştirme sınıfı
│   ├── aopManager.js             # AOP Proxy yöneticisi (Validation, Logging, Timing, Error Handling)
│   └── index.js                  # Uygulama giriş noktası ve modül entegrasyonu
├── logs/
│   └── execution_2026-11-23.log  # Çalışma anında üretilen zaman damgalı log kayıtları
├── outputs/
│   ├── iris_pca_sonuc.html       # Chart.js tabanlı 2D PCA saçılım grafiği
│   └── performance_metrics.json  # Metod bazlı süre ve bellek kullanım metrikleri
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
