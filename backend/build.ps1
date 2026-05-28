$repoRoot = Resolve-Path "$PSScriptRoot\.."
$localMvn = Join-Path $repoRoot ".maven\apache-maven-3.9.6\bin"
$env:Path = "$localMvn;$env:Path"

$localJdk = Join-Path $repoRoot ".jdks\temurin-17"
if (Test-Path $localJdk) {
    $env:JAVA_HOME = $localJdk
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
}

Set-Location $PSScriptRoot
mvn -q -DskipTests package

