@echo off
echo [1/3] Dosyalar ekleniyor...
git add .
echo [2/3] Kaydediliyor...
git commit -m "%~1"
echo [3/3] Sunucuya gonderiliyor...
git push origin main
echo.
echo ==========================================
echo    ISLEM BASARIYLA TAMAMLANDI! 🚀
echo ==========================================
pause
