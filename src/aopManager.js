import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

export class AOPManager {
    constructor(logDir = './logs', outputDir = './outputs') {
        this.logDir = logDir;
        this.outputDir = outputDir;
        this.metrics = []; // Performans metriklerini tutacak dizi

        // Klasörler yoksa otomatik oluştur
        if (!fs.existsSync(this.logDir)) fs.mkdirSync(this.logDir, { recursive: true });
        if (!fs.existsSync(this.outputDir)) fs.mkdirSync(this.outputDir, { recursive: true });

        this.logFilePath = path.join(this.logDir, `execution_${new Date().toISOString().slice(0, 10)}.log`);
    }

    // 1. LOGLAMA ASPECT'İ (Hem konsola hem dosyaya zaman damgalı kayıt atar)
    log(level, methodName, message) {
        const timestamp = new Date().toISOString();
        const formattedLog = `[${timestamp}] [${level}] [${methodName}] -> ${message}`;
        
        // Konsola renkli/belirgin yazdır
        if (level === 'ERROR') {
            console.error(`\x1b[31m${formattedLog}\x1b[0m`);
        } else if (level === 'WARN') {
            console.warn(`\x1b[33m${formattedLog}\x1b[0m`);
        } else {
            console.log(`\x1b[36m${formattedLog}\x1b[0m`);
        }

        // Dosyaya ekle
        fs.appendFileSync(this.logFilePath, formattedLog + '\n', 'utf-8');
    }

    // 2. VERİ DOĞRULAMA (VALIDATION) ASPECT'İ (Before Advice)
    validateBeforeExecution(target, methodName, args) {
        this.log('INFO', methodName, `Veri doğrulama kontrolleri başlatılıyor...`);

        if (methodName === 'veriOnIsleme') {
            if (!Array.isArray(target.rawData) || target.rawData.length === 0) {
                throw new Error("Validation Hatası: 'rawData' boş veya geçersiz formatta! Önce veri yüklenmeli.");
            }
            if (target.rawData[0].length !== 4) {
                throw new Error(`Validation Hatası: Beklenen özellik sayısı 4, gelen: ${target.rawData[0].length}`);
            }
        }

        if (methodName === 'pcaUygula') {
            const bilesenSayisi = args[0] ?? 2;
            if (typeof bilesenSayisi !== 'number' || bilesenSayisi < 1 || bilesenSayisi > 4) {
                throw new Error(`Validation Hatası: Geçersiz bileşen sayısı (${bilesenSayisi}). 1 ile 4 arasında olmalıdır.`);
            }
            if (!Array.isArray(target.scaledData) || target.scaledData.length === 0) {
                throw new Error("Validation Hatası: Ölçeklendirilmiş veri (scaledData) bulunamadı!");
            }
            // Matris içinde NaN veya Infinity kontrolü
            const hasInvalidNumber = target.scaledData.some(row => row.some(val => !Number.isFinite(val)));
            if (hasInvalidNumber) {
                throw new Error("Validation Hatası: Ölçeklendirilmiş veride NaN veya Sonsuz (Infinity) değer tespit edildi!");
            }
        }

        if (methodName === 'sonuclariGorsellestir') {
            if (!Array.isArray(target.pcaResult) || target.pcaResult.length === 0) {
                throw new Error("Validation Hatası: Görselleştirilecek PCA sonucu mevcut değil!");
            }
        }

        this.log('INFO', methodName, `Veri doğrulama kontrolleri başarıyla geçildi.`);
    }

    // 3. ANA SARMALAYICI (PROXY - Pointcut & Around / Error Handling Advice)
    applyAspects(targetInstance) {
        const self = this;

        return new Proxy(targetInstance, {
            get(target, propKey) {
                const origMethod = target[propKey];

                // Sadece fonksiyon (metod) çağrılarını yakala (Join Point)
                if (typeof origMethod !== 'function') {
                    return origMethod;
                }

                return function (...args) {
                    self.log('INFO', propKey, `Metod çağrısı yakalandı. Argümanlar: ${JSON.stringify(args)}`);

                    // Performans & Zamanlama Başlangıç Ölçümleri
                    const startMemory = process.memoryUsage().heapUsed;
                    const startTime = performance.now();

                    try {
                        // A. Veri Doğrulama (Before Advice)
                        self.validateBeforeExecution(target, propKey, args);

                        // B. Asıl İş Mantığının Çalıştırılması
                        const result = origMethod.apply(target, args);

                        // C. Zamanlama ve Performans Metriklerinin Hesaplanması (After-Returning Advice)
                        const endTime = performance.now();
                        const endMemory = process.memoryUsage().heapUsed;

                        const durationMs = Number((endTime - startTime).toFixed(4));
                        const memoryDiffKb = Number(((endMemory - startMemory) / 1024).toFixed(2));

                        const metricRecord = {
                            metod: propKey,
                            sure_ms: durationMs,
                            bellek_degisimi_kb: memoryDiffKb,
                            durum: 'BAŞARILI',
                            zaman: new Date().toISOString()
                        };
                        self.metrics.push(metricRecord);

                        self.log('SUCCESS', propKey, `Tamamlandı | Süre: ${durationMs} ms | Bellek Değişimi: ${memoryDiffKb} KB`);
                        return result;

                    } catch (error) {
                        // D. Hata Yönetimi (After-Throwing Advice)
                        const endTime = performance.now();
                        const durationMs = Number((endTime - startTime).toFixed(4));

                        self.metrics.push({
                            metod: propKey,
                            sure_ms: durationMs,
                            bellek_degisimi_kb: 0,
                            durum: `HATA: ${error.message}`,
                            zaman: new Date().toISOString()
                        });

                        self.log('ERROR', propKey, `İstisna Yakalandı! Detay: ${error.message}`);
                        
                        // Programın kontrolsüz çökmesini engelle ve anlamlı hata fırlat
                        throw new Error(`[AOP Hata Yönetimi - ${propKey}]: ${error.message}`);
                    }
                };
            }
        });
    }

    // 4. PERFORMANS METRİKLERİ RAPORLAYICI
    generatePerformanceReport() {
        const totalDuration = this.metrics.reduce((sum, m) => sum + m.sure_ms, 0).toFixed(4);
        
        console.log("\n=======================================================");
        console.log("📊 AOP PERFORMANS VE METRİK ANALİZ TABLOSU");
        console.log("=======================================================");
        console.table(this.metrics);
        console.log(`Toplam Uçtan Uca İşlem Süresi: ${totalDuration} ms\n`);

        const reportPath = path.join(this.outputDir, 'performance_metrics.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            toplam_sure_ms: Number(totalDuration),
            adimlar: this.metrics
        }, null, 2), 'utf-8');

        this.log('INFO', 'generatePerformanceReport', `Performans metrikleri '${reportPath}' dosyasına kaydedildi.`);
    }
}