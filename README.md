# Iris Veri Seti Üzerinde PCA Analizi ve AOP Tabanlı Performans İzleme

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PCA](https://img.shields.io/badge/Machine%20Learning-PCA-blue?style=for-the-badge)
![Architecture](https://img.shields.io/badge/Architecture-AOP%20Proxy-purple?style=for-the-badge)

Bu proje, makine öğrenmesi ve istatistiksel veri analizinin temel referans veri setlerinden biri olan **Iris (Süsen Çiçeği) Veri Seti** üzerinde **Temel Bileşenler Analizi (PCA - Principal Component Analysis)** uygulayarak boyut indirgeme gerçekleştiren; tüm bu analiz sürecini ise **Aspect-Oriented Programming (AOP - Cephe Yönelimli Programlama)** yaklaşımı ile ana iş mantığından (Core Business Logic) tamamen bağımsız olarak izleyen, doğrulayan, performansını ölçen ve loglayan modüler bir Node.js uygulamasıdır.

---

## 📋 İçindekiler
- [Projenin Amacı ve Mimari Yaklaşım](#-projenin-amacı-ve-mimari-yaklaşım)
- [Proje Klasör Yapısı](#-proje-klasör-yapısı)
- [Kullanılan Teknolojiler ve Kütüphaneler](#-kullanılan-teknolojiler-ve-kütüphaneler)
- [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
- [Modüllerin Teknik Detayları](#-modüllerin-teknik-detayları)
  - [1. Veri Bilimi ve PCA Katmanı](#1-veri-bilimi-ve-pca-katmanı-srcirispca-module)
  - [2. AOP (Cephe Yönelimli Programlama) Katmanı](#2-aop-cephe-yönelimli-programlama-katmanı-srcaopmanagerjs)
- [Elde Edilen Analiz Sonuçları ve Çıktılar](#-elde-edilen-analiz-sonuçları-ve-çıktılar)
- [Grup Üyeleri ve İş Bölümü](#-grup-üyeleri-ve-iş-bölümü)

---

## 🎯 Projenin Amacı ve Mimari Yaklaşım

Büyük ölçekli veri işleme ve makine öğrenmesi uygulamalarında veri bilimi algoritmaları ile sistem izleme (loglama, süre ölçümü, hata yakalama, veri doğrulama) kodlarının iç içe geçmesi kod karmaşıklığına (Code Tangling) ve bakımı zor bir yapıya yol açar.

Bu projede **Separation of Concerns (İlgi Alanlarının Ayrılması)** prensibi benimsenerek sistem iki ana katmana ayrılmıştır:
1. **Çekirdek İş Mantığı (Core Logic):** Yalnızca Iris veri setinin yüklenmesi, Z-Score standardizasyonu, PCA boyut indirgeme matematiksel hesaplamaları ve sonuçların görselleştirilmesine odaklanır.
2. **Çapraz Kesen İlgiler (Cross-Cutting Concerns / AOP):** Çekirdek PCA sınıfının kaynak koduna tek bir satır dahi müdahale edilmeden, JavaScript `Proxy` mekanizması aracılığıyla metot çağrıları çalışma anında (runtime) sarmalanır. Her adımın giriş/çıkış parametreleri doğrulanır, milisaniye hassasiyetinde çalışma süreleri ve bellek (Heap) tüketimleri ölçülür, merkezi hata yönetimi sağlanır ve yapılandırılmış log dosyaları üretilir.

---

## 🏗️ Proje Klasör Yapısı

```text
iris-pca-aop-analysis/
├── src/
│   ├── IrisPCAModule.js          # Veri yükleme, ön işleme, PCA ve görselleştirme sınıfı
│   ├── aopManager.js             # AOP Proxy yöneticisi (Validation, Logging, Timing, Error Handling)
│   └── index.js                  # Uygulama giriş noktası ve modül entegrasyonu
├── logs/
│   └── execution_2026-11-23.log  # Çalışma anında üretilen zaman damgalı log kayıtları
├── outputs/
│   ├── iris_pca_sonuc.html       # Chart.js tabanlı interaktif 2D PCA saçılım grafiği
│   └── performance_metrics.json  # Metot bazlı çalışma süresi ve bellek kullanım metrikleri
├── package.json                  # Proje bağımlılıkları ve ES Module yapılandırması
├── package-lock.json             # Kilitli bağımlılık ağacı
├── .gitignore                    # Versiyon kontrolü hariç tutma kuralları
└── README.md                     # Proje dokümantasyonu
🛠️ Kullanılan Teknolojiler ve KütüphanelerTeknoloji / PaketKullanım AmacıNode.js (ES Modules)Uygulama çalışma zamanı (Runtime) ve modüler dosya yönetimi (fs)ml-dataset-iris150 örnek ve 4 öznitelikten oluşan standart Iris veri setinin yüklenmesiml-pcaKovaryans matrisi, özdeğer/özvektör ayrışımı ve temel bileşen izdüşümüJavaScript Proxy APIRuntime seviyesinde metot yakalama (interception) ve AOP katmanı inşasıChart.js (HTML5 Canvas)İndirgenen 2 boyutlu bileşenlerin tarayıcı tabanlı interaktif görselleştirilmesi🚀 Kurulum ve ÇalıştırmaProjeyi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:1. Depoyu KlonlayınBashgit clone [https://github.com/ceydaural88-spec/iris-pca-aop-analysis.git](https://github.com/ceydaural88-spec/iris-pca-aop-analysis.git)
cd iris-pca-aop-analysis
2. Bağımlılıkları YükleyinBashnpm install
3. Uygulamayı BaşlatınBashnode src/index.js
(Not: Yalnızca PCA modülünü bağımsız test etmek isterseniz node src/IrisPCAModule.js komutunu kullanabilirsiniz.)Uygulama çalıştırıldığında terminal ekranında adım adım analiz ve AOP izleme logları görüntülenecek; eşzamanlı olarak logs/ ve outputs/ dizinleri altına log dosyası, JSON performans raporu ve HTML grafik dosyası kaydedilecektir.⚙️ Modüllerin Teknik Detayları1. Veri Bilimi ve PCA Katmanı (src/IrisPCAModule.js)Bu modül, 4 boyutlu veriyi bilgi kaybını minimize ederek 2 boyuta indirgemek üzere 4 temel metottan oluşur:veriYukleVeIncele(): Iris veri setini belleğe aktarır. Toplam 150 örneğin 4 sayısal özniteliğini (Sepal Length, Sepal Width, Petal Length, Petal Width) ve 3 hedef sınıfın (Setosa, Versicolor, Virginica - her biri 50 örnek) dağılımını analiz eder.veriOnIsleme(): Veri setinde eksik veya bozuk (null / NaN) kayıt kontrolü yapar. PCA varyans temelli bir algoritma olduğu için büyük ölçekli özelliklerin analizi domine etmesini engellemek amacıyla Z-Score Standardizasyonu ($z = \frac{x - \mu}{\sigma}$) uygular ve tüm özellikleri ortalaması 0, standart sapması 1 olacak şekilde ölçeklendirir.pcaUygula(bilesenSayisi = 2): Standartlaştırılmış 4 boyutlu veriyi birbirine dik (ortogonal) ve korelasyonsuz 2 temel bileşene (PC1 ve PC2) dönüştürür. Her bir bileşenin açıkladığı varyans oranını hesaplar.sonuclariGorsellestir(): İndirgenen 2 boyutlu koordinatları sınıf etiketleriyle eşleştirerek harici bir grafik programına ihtiyaç duymadan outputs/iris_pca_sonuc.html dosyasını üretir.2. AOP (Cephe Yönelimli Programlama) Katmanı (src/aopManager.js)Bu modül, IrisPCAModule örneğini bir Proxy nesnesi ile sarmalayarak her metot çağrısında aşağıdaki işlemleri otomatik yürütür:Veri Doğrulama (Pre-Execution Validation): Metotlar çalışmadan önce giriş verilerinin boş olup olmadığını, matris boyutlarının tutarlılığını ve bileşen sayısının geçerliliğini denetler.Performans ve Zamanlama Ölçümü (Performance Profiling): performance.now() ve process.memoryUsage() API'leri ile her metodun milisaniye cinsinden çalışma süresini ve bellek (Heap) değişimini ölçerek outputs/performance_metrics.json dosyasına kaydeder.Yapılandırılmış Loglama (Structured Logging): Her işlemin başlangıç zamanı, durumu (SUCCESS / ERROR), süresi ve özet çıktıları zaman damgalı olarak logs/ klasörüne yazılır.Merkezi Hata Yönetimi (Exception Handling): Çalışma anında oluşabilecek istisnaları yakalar, sistemin kontrolsüz çökmesini önler ve hata detaylarını log dosyasına işler.📊 Elde Edilen Analiz Sonuçları ve ÇıktılarPCA Varyans Açıklama Performansı4 boyutlu Iris veri seti 2 boyuta indirgendiğinde elde edilen istatistiksel sonuçlar:Temel BileşenAçıklanan Varyans OranıKümülatif Varyans (Korunan Bilgi)PC1 (1. Temel Bileşen)%72.96%72.96PC2 (2. Temel Bileşen)%22.85%95.81PC3 + PC4 (Elenen Bileşenler)%4.19%100.00Yorum: Orijinal verideki bilginin %95.81'i yalnızca 2 bileşenle korunmuş, veri boyutu yarı yarıya düşürülürken yalnızca %4.19'luk ihmal edilebilir bir bilgi kaybı yaşanmıştır.Kümeleme Analizi: Üretilen saçılım grafiğinde Iris Setosa türünün PC1 ekseninin negatif bölgesinde diğer iki türden tamamen keskin bir şekilde ayrıştığı; Iris Versicolor ve Iris Virginica türlerinin ise pozitif bölgede birbirine yakın ancak belirgin küme merkezleriyle konumlandığı gözlemlenmiştir.👥 Grup Üyeleri ve İş Bölümü Ceyda Ural — Veri Bilimi ve PCA Modülü (IrisPCAModule.js), Veri Ön İşleme, Boyut İndirgeme Analizi ve Görselleştirme Süeda Kayar — Yazılım Mimarisi ve AOP Katmanı (aopManager.js), Proxy Tabanlı Metot İzleme, Performans Metrikleri, Loglama ve Hata Yönetimi
