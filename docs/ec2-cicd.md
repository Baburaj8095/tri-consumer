# EC2 CI/CD Setup

This repository deploys to the EC2 instance through GitHub Actions.

## GitHub Secrets

Add these in GitHub:

`Settings > Secrets and variables > Actions > New repository secret`

Required:

```txt
EC2_HOST=13.126.22.46
EC2_USER=ec2-user
EC2_SSH_KEY=<private key contents>
```

Optional:

```txt
EC2_BACKEND_SERVICE=triconsumer
EC2_BACKEND_DIR=/home/ec2-user
EC2_BACKEND_JAR=backend.jar
EC2_WEB_ROOT=/var/www/html
```

`EC2_SSH_KEY` must contain the full private key, including:

```txt
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

## EC2 Requirements

The EC2 instance must allow this SSH key for the deploy user.

The deploy user must be able to run `sudo` for:

```txt
mkdir
find
cp
install
rm
systemctl
nginx
```

Nginx should serve the frontend from:

```txt
/var/www/html
```

Nginx should proxy API traffic to:

```txt
http://localhost:8080/api/
```

## Backend Service

The workflow copies the backend jar to:

```txt
/home/ec2-user/backend.jar
```

The default service name is:

```txt
triconsumer
```

If the current EC2 service has a different name, either rename the service or set the GitHub secret:

```txt
EC2_BACKEND_SERVICE=<actual-service-name>
```

To find the current service name on EC2:

```bash
systemctl list-units --type=service | grep -Ei 'tri|consumer|java|spring'
```

## Manual Run

The workflow runs automatically on pushes to `main`.

It can also be run manually:

```txt
GitHub > Actions > Deploy to EC2 > Run workflow
```
