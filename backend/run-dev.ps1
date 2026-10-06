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

# Load environment variables from .env if present
$envFiles = @(
    (Join-Path $repoRoot ".env"),
    (Join-Path $PSScriptRoot ".env")
)
foreach ($ef in $envFiles) {
    if (Test-Path $ef) {
        Get-Content $ef | ForEach-Object {
            $line = $_.Trim()
            if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
                $parts = $line.Split("=", 2)
                $key = $parts[0].Trim()
                $val = $parts[1].Trim().Trim('"').Trim("'")
                if (-not [Environment]::GetEnvironmentVariable($key)) {
                    [Environment]::SetEnvironmentVariable($key, $val, "Process")
                }
            }
        }
        break
    }
}

# Ensure data directory exists
$dataDir = Join-Path $PSScriptRoot "data"
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}

# If no custom database URL is provided, default to local SQLite database
if (-not $env:DB_URL -and -not $env:SPRING_DATASOURCE_URL) {
    $sqliteDbPath = Join-Path $dataDir "trikonekt.sqlite"
    $env:SPRING_DATASOURCE_URL = "jdbc:sqlite:$($sqliteDbPath.Replace('\', '/'))?date_class=text&date_string_format=yyyy-MM-dd HH:mm:ss"
    $env:SPRING_DATASOURCE_DRIVER_CLASS_NAME = "org.sqlite.JDBC"
    $env:SPRING_DATASOURCE_USERNAME = ""
    $env:SPRING_DATASOURCE_PASSWORD = ""
    $env:SPRING_SQL_INIT_SCHEMA_LOCATIONS = "classpath:schema-sqlite.sql"
    $env:SPRING_SQL_INIT_MODE = "always"
}

Set-Location $PSScriptRoot
& $mvnExe spring-boot:run

