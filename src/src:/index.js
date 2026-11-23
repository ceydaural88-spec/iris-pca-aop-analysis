import { IrisPCAModule } from './IrisPCAModule.js';
import { AOPManager } from './aopManager.js';

// 1. Orijinal PCA nesnesini ve AOP yöneticisini oluştur
const rawPcaModule = new IrisPCAModule();
const aop = new AOPManager('./logs', './outputs');

// 2. PCA nesnesini AOP Proxy ile sarmala (Cross-Cutting Concerns aktif)
const monitoredPca = aop.applyAspects(rawPcaModule);

try {
    // Normal Akış
    monitoredPca.veriYukleVeIncele();
    monitoredPca.veriOnIsleme();
    monitoredPca.pcaUygula(2);
    monitoredPca.sonuclariGorsellestir('./outputs/iris_pca_sonuc.html');

    // Hata Yönetimi ve Validation Testi (İsteğe bağlı demo için yorum satırını açabilirsin)
    // monitoredPca.pcaUygula(99); // Geçersiz bileşen sayısı hatasını AOP yakalar!

} catch (err) {
    console.log("Ana akış AOP hata yakalama mekanizması tarafından güvenli şekilde sonlandırıldı.");
} finally {
    // Her durumda performans metrikleri tablosunu oluştur
    aop.generatePerformanceReport();
}