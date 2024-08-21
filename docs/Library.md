### CSRF
[Tampering, Spoofing]

### Missing HttpOnly Flag
[Spoofing]

### SMS-based 2FA Token Theft
[Spoofing, Elevation of Privilege]

### Malicious Content in Uploading
[Elevation of Privilege, Tampering]

### Large Data uploads
[Denial of Service]

### Unencrypted Data Storage
[Information disclosure]

### Hard Coded Secrets
[Information disclosure]

### Shared Secrets Between Inconsistent Trust Zones
[Information disclosure]

### Lack of Input Validation or Encoding
[Tampering]
May result in injection issue

### MiTM
[Tampering, Information disclosure]

### Outbound Network Connections
[Information disclosure, Repudiation]
arrow start from high trust zone to low trust zone 

### Lack of Log Analysis
[Repudiation]
Logs not reaching the detection mechanisms

### Secret Exposure via Logs
[Information disclosure]

### Email Infrastructure Compromise
[Spoofing]

### XXE
[Denial of Service, Information disclosure]

### Deployment System Compromise
[Tampering]
Poor CI/CD controls may result in malicious or untrusted artifacts being deployed into production environments.

### Relay Attack
[Tampering, Spoofing]

### Unauthenticated APIs or Services
[Information disclosure]

## Supply Chain Attack
### Compromised Product Binaries
[Tampering]

### Non-standard Operating System Images
[Tampering]

### Lack of Signing
[Tampering]

### Insecure Source Code Storage
[Information disclosure]

### Insecure Frameworks
[Tampering]

### Improper Artifact Storage
[Tampering]