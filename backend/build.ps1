$repoRoot = Resolve-Path "$PSScriptRoot\.."
$candidateMvnDirs = @(
    (Join-Path $repoRoot ".maven\apache-maven-3.9.6\bin"),
    (Join-Path $env:USERPROFILE ".maven\maven-3.9.15\bin")
)
$mvnExe = "mvn"
foreach ($mvnDir in $candidateMvnDirs) {
    if (Test-Path (Join-Path $mvnDir "mvn.cmd")) {
        $mvnExe = Join-Path $mvnDir "mvn.cmd"
        $env:Path = "$mvnDir;$env:Path"
        break
    } elseif (Test-Path $mvnDir) {
        $env:Path = "$mvnDir;$env:Path"
        break
    }
}

$localJdk = Join-Path $repoRoot ".jdks\temurin-17"
if (Test-Path $localJdk) {
    $env:JAVA_HOME = $localJdk
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
}

Set-Location $PSScriptRoot
& $mvnExe -q -DskipTests package

