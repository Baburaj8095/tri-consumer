$repoRoot = Resolve-Path "$PSScriptRoot\.."
$env:JAVA_HOME = Join-Path $repoRoot ".jdks\temurin-17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

mvn -q -DskipTests package

