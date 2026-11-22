import IrisDataset from 'ml-dataset-iris';
import { PCA } from 'ml-pca';
import fs from 'fs';

export class IrisPCAModule {
    constructor() {
        this.rawData = [];
        this.labels = [];
        this.featureNames = [
            'Sepal Length (Çanak Yaprak Uzunluğu)',
            'Sepal Width (Çanak Yaprak Genişliği)',
            'Petal Length (Taç Yaprak Uzunluğu)',
            'Petal Width (Taç Yaprak Genişliği)'
        ];
        this.scaledData = [];
        this.pcaResult = [];
        this.explainedVariance = [];
    }

    // 1. Adım: Veri setinin yüklenmesi ve hangi verileri kapsadığının incelenmesi
    veriYukleVeIncele() {
        this.rawData = IrisDataset.getNumbers(); // 150x4 sayısal matris
        this.labels = IrisDataset.getClasses();  // 150 adet tür etiketi

        const benzersizTurler = [...new Set(this.labels)];
        const turDagilimi = {};
        this.labels.forEach(tur => {
            turDagilimi[tur] = (turDagilimi[tur] || 0) + 1;
        });

        console.log("=== 1. IRIS VERİ SETİ ÖZETİ ===");
        console.log(`Toplam Örnek (Satır) Sayısı: ${this.rawData.length}`);
        console.log(`Toplam Özellik (Sütun) Sayısı: ${this.featureNames.length}`);
        console.log("Özellikler:", this.featureNames);
        console.log("Hedef Sınıflar (Çiçek Türleri):", benzersizTurler);
        console.log("Sınıf Dağılımı:", turDagilimi);
        console.log("İlk 3 Örnek Veri:", this.rawData.slice(0, 3));

        return { data: this.rawData, labels: this.labels };
    }

    // 2. Adım: Ön işleme (Eksik/geçersiz veri kontrolü ve Z-Score Standardizasyonu)
    veriOnIsleme() {
        if (this.rawData.length === 0) {
            throw new Error("Ön işleme öncesi veri seti yüklenmelidir!");
        }

        // NaN veya null kontrolü
        const hataliSatir = this.rawData.filter(satir => satir.some(val => val === null || Number.isNaN(val)));
        console.log("\n=== 2. VERİ ÖN İŞLEME ===");
        console.log(`Tespit edilen eksik/hatalı kayıt sayısı: ${hataliSatir.length}`);

        // Z-Score Standardizasyonu (Ortalama = 0, Standart Sapma = 1)
        const numRows = this.rawData.length;
        const numCols = this.rawData[0].length;
        const means = new Array(numCols).fill(0);
        const stds = new Array(numCols).fill(0);

        // Ortalamaları hesapla
        for (let j = 0; j < numCols; j++) {
            for (let i = 0; i < numRows; i++) {
                means[j] += this.rawData[i][j];
            }
            means[j] /= numRows;
        }

        // Standart sapmaları hesapla
        for (let j = 0; j < numCols; j++) {
            for (let i = 0; i < numRows; i++) {
                stds[j] += Math.pow(this.rawData[i][j] - means[j], 2);
            }
            stds[j] = Math.sqrt(stds[j] / numRows);
        }

        // Ölçeklendirilmiş matrisi oluştur
        this.scaledData = this.rawData.map(row =>
            row.map((val, j) => (val - means[j]) / stds[j])
        );

        console.log("Veriler Z-Score Standardizasyonu ile başarıyla ölçeklendirildi.");
        return this.scaledData;
    }

    // 3. Adım: PCA Analizi Uygulanması (4 boyuttan 2 boyuta indirgeme)
    pcaUygula(bilesenSayisi = 2) {
        if (this.scaledData.length === 0) {
            throw new Error("PCA öncesi veri ön işleme tamamlanmalıdır!");
        }

        const pca = new PCA(this.scaledData);
        // Veriyi 2 temel bileşene (PC1, PC2) projekte et
        const projected = pca.predict(this.scaledData, { nComponents: bilesenSayisi });
        this.pcaResult = projected.to2DArray();

        // Açıklanan varyans oranlarını al
        const allVariances = pca.getExplainedVariance();
        this.explainedVariance = allVariances.slice(0, bilesenSayisi);

        console.log(`\n=== 3. PCA ANALİZ SONUÇLARI (${bilesenSayisi} Temel Bileşen) ===`);
        this.explainedVariance.forEach((oran, index) => {
            console.log(`PC${index + 1} (Temel Bileşen ${index + 1}) Açıklanan Varyans: %${(oran * 100).toFixed(2)}`);
        });

        const toplamVaryans = this.explainedVariance.reduce((acc, val) => acc + val, 0) * 100;
        console.log(`Toplam Korunan Bilgi (Varyans): %${toplamVaryans.toFixed(2)}`);

        return { pcaResult: this.pcaResult, explainedVariance: this.explainedVariance };
    }

    // 4. Adım: Sonuçların Görselleştirilmesi (Otomatik HTML Scatter Plot oluşturur)
    sonuclariGorsellestir(dosyaAdi = 'iris_pca_sonuc.html') {
        if (this.pcaResult.length === 0) {
            throw new Error("Görselleştirme öncesi PCA analizi yapılmalıdır!");
        }

        const gruplar = {
            setosa: [],
            versicolor: [],
            virginica: []
        };

        this.pcaResult.forEach((nokta, i) => {
            const tur = this.labels[i];
            if (gruplar[tur]) {
                gruplar[tur].push({ x: nokta[0], y: nokta[1] });
            }
        });

        const pc1Yuzde = (this.explainedVariance[0] * 100).toFixed(2);
        const pc2Yuzde = (this.explainedVariance[1] * 100).toFixed(2);

        const htmlIcerik = `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Iris Veri Seti - PCA Görselleştirme</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f4f6f9; margin: 0; }
        .container { width: 850px; background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="container">
        <canvas id="pcaChart"></canvas>
    </div>
    <script>
        const ctx = document.getElementById('pcaChart').getContext('2d');
        new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    { label: 'Iris Setosa', data: ${JSON.stringify(gruplar.setosa)}, backgroundColor: '#e74c3c', pointRadius: 6 },
                    { label: 'Iris Versicolor', data: ${JSON.stringify(gruplar.versicolor)}, backgroundColor: '#2ecc71', pointRadius: 6 },
                    { label: 'Iris Virginica', data: ${JSON.stringify(gruplar.virginica)}, backgroundColor: '#3498db', pointRadius: 6 }
                ]
            },
            options: {
                plugins: {
                    title: { display: true, text: 'Iris Veri Seti - PCA (2 Boyutlu İndirgeme) Sonucu', font: { size: 16 } }
                },
                scales: {
                    x: { title: { display: true, text: 'Temel Bileşen 1 - PC1 (%${pc1Yuzde} Varyans)' } },
                    y: { title: { display: true, text: 'Temel Bileşen 2 - PC2 (%${pc2Yuzde} Varyans)' } }
                }
            }
        });
    </script>
</body>
</html>`;

        fs.writeFileSync(dosyaAdi, htmlIcerik, 'utf-8');
        console.log(`\n=== 4. GÖRSELLEŞTİRME ===`);
        console.log(`Grafik '${dosyaAdi}' dosyasına oluşturuldu. Tarayıcıda açarak inceleyebilirsiniz.`);
    }
}

// Çalıştırma adımları
const analiz = new IrisPCAModule();
analiz.veriYukleVeIncele();
analiz.veriOnIsleme();
analiz.pcaUygula(2);
analiz.sonuclariGorsellestir();