param(
    [string]$Region = "us-east-1",
    [string]$KeyName,
    [string]$SecurityGroupName = "tri-consumer-api-ec2-sg",
    [string]$InstanceType = "t3.small",
    [string]$AmiId = "ami-0aeeebd8d2ab47354",
    [string]$SubnetId = "",
    [string]$InstanceName = "tri-consumer-api",
    [string]$JarName = "tri-consumer-api-0.0.1-SNAPSHOT.jar",
    [string]$SshUsername = "ec2-user"
)

if (-not $KeyName) {
    Write-Error "You must provide an EC2 key pair name via -KeyName."
    exit 1
}

$scriptRoot = Resolve-Path "$PSScriptRoot"
Set-Location $scriptRoot

$jarPath = Join-Path $scriptRoot "target\$JarName"
if (-not (Test-Path $jarPath)) {
    Write-Host "Building backend jar..."
    $mvn = Get-Command mvn -ErrorAction SilentlyContinue
    if (-not $mvn) {
        Write-Error "Maven is not available. Install Maven or add it to PATH.";
        exit 1
    }

    $mvnArgs = @("clean", "package", "-DskipTests")
    $proc = Start-Process -FilePath $mvn.Source -ArgumentList $mvnArgs -NoNewWindow -Wait -PassThru
    if ($proc.ExitCode -ne 0) {
        Write-Error "Maven build failed with exit code $($proc.ExitCode)."
        exit $proc.ExitCode
    }

    if (-not (Test-Path $jarPath)) {
        Write-Error "Expected jar not found at $jarPath. Confirm build output and jar name."
        exit 1
    }
} else {
    Write-Host "Found existing jar at $jarPath; skipping build."
}

Write-Host "Checking security group..."
$existingSg = aws ec2 describe-security-groups --region $Region --filters Name=group-name,Values=$SecurityGroupName --query "SecurityGroups[0].GroupId" --output text 2>$null
if ($existingSg -and $existingSg -ne "None") {
    Write-Host "Using existing security group $SecurityGroupName ($existingSg)."
    $securityGroupId = $existingSg
} else {
    $securityGroupId = aws ec2 create-security-group --region $Region --group-name $SecurityGroupName --description "EC2 security group for tri-consumer backend" --query "GroupId" --output text
    aws ec2 authorize-security-group-ingress --region $Region --group-id $securityGroupId --protocol tcp --port 22 --cidr 0.0.0.0/0
    aws ec2 authorize-security-group-ingress --region $Region --group-id $securityGroupId --protocol tcp --port 8080 --cidr 0.0.0.0/0
    Write-Host "Created security group $SecurityGroupName ($securityGroupId)."
}

Write-Host "Launching EC2 instance..."
$runArgs = @(
    "--image-id", $AmiId,
    "--count", "1",
    "--instance-type", $InstanceType,
    "--security-group-ids", $securityGroupId,
    "--key-name", $KeyName,
    "--tag-specifications", "ResourceType=instance,Tags=[{Key=Name,Value=$InstanceName}]",
    "--region", $Region
)
if ($SubnetId) {
    $runArgs += @("--subnet-id", $SubnetId)
}

$instanceId = aws ec2 run-instances @runArgs --query "Instances[0].InstanceId" --output text
Write-Host "Instance launched: $instanceId"
aws ec2 wait instance-running --instance-ids $instanceId --region $Region

$publicDns = aws ec2 describe-instances --instance-ids $instanceId --region $Region --query "Reservations[0].Instances[0].PublicDnsName" --output text
if (-not $publicDns) {
    Write-Error "Failed to retrieve public DNS for instance $instanceId."
    exit 1
}

Write-Host "Instance public DNS: $publicDns"

$privateKeyPath = Read-Host "Enter the path to your PEM private key for key pair $KeyName"
if (-not (Test-Path $privateKeyPath)) {
    Write-Error "Private key file not found: $privateKeyPath"
    exit 1
}

Write-Host "Waiting for SSH to become available..."
$sshReady = $false
for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 10
    $sshTest = & ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -i $privateKeyPath "$($SshUsername)@${publicDns}" echo ok 2>$null
    if ($sshTest -eq 'ok') {
        $sshReady = $true
        break
    }
}
if (-not $sshReady) {
    Write-Error "SSH did not become available. Check network access or key pair settings."
    exit 1
}

Write-Host "Copying jar to EC2 instance..."
$remoteJarPath = "/home/$SshUsername/$JarName"
& scp -o StrictHostKeyChecking=no -i $privateKeyPath $jarPath "$($SshUsername)@${publicDns}:${remoteJarPath}"

Write-Host "Installing Java 17 and launching application..."
$remoteCommand = @"
set -e
sudo yum install -y java-17-amazon-corretto
nohup java -jar $remoteJarPath > /home/$SshUsername/tri-consumer-api.log 2>&1 &
"@

& ssh -o StrictHostKeyChecking=no -i $privateKeyPath "$SshUsername@$publicDns" $remoteCommand

Write-Host "Deployment complete."
Write-Host "Backend should be available at http://$publicDns:8080"
