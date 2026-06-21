@echo off
title Deploying to GitHub Pages
echo ==============================================================
echo        Library System GitHub Pages Deployer
echo ==============================================================
echo.

echo [1/4] Building frontend production files...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed!
    cd ..
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo [2/4] Temporarily staging build files...
:: Temporarily comment out dist in .gitignore
powershell -Command "(Get-Content frontend\.gitignore) -replace 'dist', '#dist' | Set-Content frontend\.gitignore"

:: Add the build files and commit them temporarily
git add frontend/dist
git add frontend/.gitignore
git commit -m "Temporary deployment commit"

echo.
echo [3/4] Pushing to gh-pages branch...
git subtree push --prefix frontend/dist origin gh-pages

echo.
echo [4/4] Cleaning up temporary commit...
:: Undo the commit but keep changes unstaged
git reset --soft HEAD~1
:: Restore .gitignore
powershell -Command "(Get-Content frontend\.gitignore) -replace '#dist', 'dist' | Set-Content frontend\.gitignore"
git checkout frontend/.gitignore
:: Remove the untracked dist files from git cache
git rm -r --cached frontend/dist >nul 2>&1

echo.
echo ==============================================================
echo  Deployment complete!
echo  Your live changes should be active in a few minutes at:
echo  https://gourav226.github.io/Ritika-Library/
echo ==============================================================
echo.
pause
