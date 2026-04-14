@echo off
chcp 65001 > nul
set CUR=%1
set TOTAL=%2
set LOG=%~3
echo. >> "%LOG%"
echo.
echo ========================================= >> "%LOG%"
echo =========================================
echo 循环 %CUR% / %TOTAL% >> "%LOG%"
echo 循环 %CUR% / %TOTAL%
echo 时间: %date% %time% >> "%LOG%"
echo 时间: %date% %time%
echo ========================================= >> "%LOG%"
echo =========================================
echo Git 状态: >> "%LOG%"
echo Git 状态:
git log --oneline -1 >> "%LOG%" 2>&1
git log --oneline -1
echo. >> "%LOG%"
echo.
echo 执行 Claude Code... >> "%LOG%"
echo 执行 Claude Code...
echo param($L) > "%TEMP%\_tee.ps1"
echo $w = [System.IO.StreamWriter]::new($L, $true, [System.Text.UTF8Encoding]::new($false)) >> "%TEMP%\_tee.ps1"
echo foreach ($line in $input) { Write-Host $line; $w.WriteLine($line) } >> "%TEMP%\_tee.ps1"
echo $w.Close() >> "%TEMP%\_tee.ps1"
claude --dangerously-skip-permissions --print "请从.claude/features.json中选择一个status为pending的任务，完成它，测试它，然后更新status为completed。如果所有任务都完成了，请告诉我。所有新增和修改的文本文件必须使用UTF-8编码（无BOM）。在Windows下读取文件内容时，必须显式使用UTF-8（例如 Get-Content -Encoding UTF8），禁止使用默认编码读取。并在提交前检查是否存在乱码（如 mojibake/异常中文），如发现需在本次任务中一并修复。" 2>&1 | powershell -NoProfile -File "%TEMP%\_tee.ps1" -L "%LOG%"
del "%TEMP%\_tee.ps1" >nul 2>&1
echo. >> "%LOG%"
echo.
echo 执行后 Git 状态: >> "%LOG%"
echo 执行后 Git 状态:
git log --oneline -1 >> "%LOG%" 2>&1
git log --oneline -1
set /a NEXT=%CUR%+1
if %NEXT% LEQ %TOTAL% (
  echo 等待 2 秒... >> "%LOG%"
  echo 等待 2 秒...
  timeout /t 2 /nobreak >nul
)
