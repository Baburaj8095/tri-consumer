$pemPath = 'C:\Users\RaghavendraShenoy\Downloads\trikonektbackend.pem'
$pubPath = Join-Path $env:TEMP 'trikonektbackend.pub'
ssh-keygen -y -f $pemPath | Out-File -Encoding ascii $pubPath
aws ec2 import-key-pair --region us-east-1 --key-name 'trikonekt-deploy-key' --public-key-material fileb://$pubPath --output json
