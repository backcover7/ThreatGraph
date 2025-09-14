# Threat Definition Guide

## Overview

Threats are fundamental components of the ThreatGraph threat modeling system that define specific security risks that could affect system components. Each threat contains detailed information about the security vulnerability, its potential impact, mitigation strategies, and compliance mappings to industry standards.

## Threat Schema

### Basic Structure

```yaml
module:
  threat:
    - id: <UUID>                    # Unique identifier (required)
      name: <string>                # Threat name (required)
      severity: <severity-level>    # Severity level (required)
      description: <string>         # Detailed description (required)
      mitigation: <string>          # Mitigation strategies (required)
      compliance:                   # Compliance mapping (required)
        cwe: <string[]>             # CWE identifiers
        owasp: <string[]>           # OWASP categories
        stride: <string[]>          # STRIDE threat types
      attached: <object>            # Associated elements (optional)
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier for the threat, UUID format |
| `name` | string | Clear, descriptive name of the threat |
| `severity` | string | Threat severity level: `informative`, `low`, `medium`, `high`, `critical` |
| `description` | string | Detailed explanation of the threat, its causes and potential impacts |
| `mitigation` | string | Comprehensive mitigation strategies and countermeasures |
| `compliance` | object | Mapping to security standards and frameworks |

### Compliance Object

The compliance object maps threats to established security standards:

| Field | Type | Description |
|-------|------|-------------|
| `cwe` | string[] | Common Weakness Enumeration identifiers (e.g., "CWE-284") |
| `owasp` | string[] | OWASP Top 10 categories (e.g., "A01:2021 - Broken Access Control") |
| `stride` | string[] | STRIDE threat model categories |

### STRIDE Categories

The STRIDE methodology categorizes threats into six types:

- **Spoofing**: Impersonating something or someone else
- **Tampering**: Modifying data or code
- **Repudiation**: Claiming to have not performed an action
- **Information Disclosure**: Exposing information to unauthorized individuals
- **Denial of Service**: Denying or degrading service availability
- **Elevation of Privilege**: Gaining unauthorized capabilities

### Severity Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| `critical` | Immediate action required, severe business impact | RCE, complete system compromise |
| `high` | High priority, significant security risk | Data breaches, privilege escalation |
| `medium` | Moderate risk, should be addressed | Access control issues, information disclosure |
| `low` | Lower priority, minimal immediate risk | Configuration weaknesses, minor policy violations |
| `informative` | Advisory information, no immediate action needed | Best practice recommendations |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `attached` | object | Associated system elements (entities, processes, datastores, dataflows) |

## Threat Categories

### 1. Authentication and Authorization

#### Weak Cryptographic Algorithms
```yaml
- id: 4d573e49-5fa1-4404-be3c-d48b355980ba
  name: Weak Cryptographic Algorithms
  severity: high
  description: The use of weak cryptographic algorithms poses a significant security risk. These algorithms, which may be outdated, broken, or implemented incorrectly, can be exploited to decrypt sensitive data, forge signatures, or bypass security controls.
  mitigation: Use strong, up-to-date cryptographic algorithms recommended by security experts. Implement proper key management practices. Regularly update cryptographic libraries and frameworks.
  compliance:
    cwe:
      - 'CWE-327: Use of a Broken or Risky Cryptographic Algorithm'
      - 'CWE-326: Inadequate Encryption Strength'
    owasp:
      - 'A02:2021 - Cryptographic Failures'
    stride:
      - Information Disclosure
      - Tampering
      - Spoofing
```

#### Default Credentials
```yaml
- id: 1baed8fd-d0b1-4c7b-89df-262694e6e823
  name: Default Credentials or Empty Password
  severity: critical
  description: The use of default credentials or empty passwords is a critical security vulnerability. Many systems come with preset default credentials that are publicly known or documented.
  mitigation: Change all default passwords immediately upon system setup. Implement and enforce a strong password policy. Use multi-factor authentication where possible.
  compliance:
    cwe:
      - 'CWE-521: Weak Password Requirements'
      - 'CWE-259: Use of Hard-coded Password'
    owasp:
      - 'A07:2021 - Identification and Authentication Failures'
    stride:
      - Spoofing
      - Elevation of Privilege
```

### 2. Access Control

#### Improper Access Control
```yaml
- id: f8e7d9c1-b6a3-4f2e-9d5c-12e3a4b5c6d7
  name: Improper Access Control
  severity: high
  description: Improper access control occurs when an application fails to properly restrict access to resources or functionalities based on user privileges. This vulnerability allows unauthorized users to view, modify, or perform actions they should not have permission for.
  mitigation: Implement robust authentication mechanisms. Use role-based access control (RBAC). Apply the principle of least privilege. Consistently enforce access controls on all pages and API endpoints.
  compliance:
    cwe:
      - 'CWE-284: Improper Access Control'
      - 'CWE-285: Improper Authorization'
    owasp:
      - 'A01:2021 - Broken Access Control'
    stride:
      - Elevation of Privilege
      - Information Disclosure
      - Tampering
```

### 3. Data Protection

#### Unencrypted Data Transmission
```yaml
- id: ab025cee-ca17-461a-b8a7-5231031bf848
  name: Unencrypted Data Transmission
  severity: high
  description: Transmitting sensitive data without encryption exposes it to interception and unauthorized access. Attackers can perform man-in-the-middle attacks to capture and potentially modify data in transit.
  mitigation: Implement TLS/SSL encryption for all data transmission. Use strong cipher suites and keep SSL/TLS libraries updated. Implement certificate pinning for critical communications.
  compliance:
    cwe:
      - 'CWE-319: Cleartext Transmission of Sensitive Information'
    owasp:
      - 'A02:2021 - Cryptographic Failures'
    stride:
      - Information Disclosure
      - Tampering
```

### 4. Injection Attacks

#### SQL Injection
```yaml
- id: 7b1f3a9c-8e5d-4c2a-b0f5-9e8f7a1d6b3e
  name: SQL Injection
  severity: high
  description: SQL injection occurs when an attacker can insert or manipulate SQL commands in application queries. This can lead to unauthorized data access, data modification, or complete database compromise.
  mitigation: Use parameterized queries and prepared statements. Implement input validation and sanitization. Apply the principle of least privilege for database accounts. Use stored procedures when appropriate.
  compliance:
    cwe:
      - 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command'
    owasp:
      - 'A03:2021 - Injection'
    stride:
      - Information Disclosure
      - Tampering
      - Elevation of Privilege
```

#### NoSQL Injection
```yaml
- id: 7a3c81f9-b9d2-4e27-9c32-dc0c8a7f48e9
  name: NoSQL Injection
  severity: high
  description: NoSQL injection attacks target NoSQL databases by injecting malicious code into queries. These attacks can bypass authentication, extract sensitive data, or modify database contents.
  mitigation: Use parameterized queries specific to your NoSQL database. Validate and sanitize all user inputs. Implement proper authentication and authorization. Use database-specific security features.
  compliance:
    cwe:
      - 'CWE-943: Improper Neutralization of Special Elements in Data Query Logic'
    owasp:
      - 'A03:2021 - Injection'
    stride:
      - Information Disclosure
      - Tampering
      - Elevation of Privilege
```

## Writing Effective Threats

### 1. Naming Best Practices
- Use clear, descriptive names
- Avoid technical jargon when possible
- Be specific about the type of threat
- Follow consistent naming patterns

### 2. Description Guidelines
- Explain what the threat is
- Describe how it can be exploited
- Detail the potential impact
- Include real-world context when relevant
- Keep descriptions comprehensive but concise

### 3. Mitigation Strategies
- Provide actionable recommendations
- Include multiple mitigation approaches
- Reference specific technologies or standards
- Consider both preventive and detective controls
- Address root causes, not just symptoms

### 4. Compliance Mapping
- Include relevant CWE identifiers
- Map to current OWASP categories
- Use accurate STRIDE classifications
- Keep mappings current with standard updates

## Threat Relationships

### Threat Hierarchies
Some threats may be variations or specializations of broader threat categories:

```yaml
# General threat
- id: parent-threat-uuid
  name: Injection Attack
  
# Specific threats that inherit from general category
- id: child-threat-uuid-1
  name: SQL Injection
  
- id: child-threat-uuid-2  
  name: NoSQL Injection
```

### Associated Elements
Threats can be associated with specific system elements:

```yaml
attached:
  entities: [list of entity objects]
  datastores: [list of datastore objects]
  processes: [list of process objects]
  dataflows: [list of dataflow objects]
```

## Validation Rules

### Required Field Validation
- All required fields must be present
- ID must be valid UUID format
- Severity must be one of the defined levels
- STRIDE values must match allowed categories

### Content Quality Checks
- Descriptions should be meaningful and detailed
- Mitigations should provide actionable guidance
- CWE references should be valid identifiers
- OWASP mappings should use current taxonomy

### Consistency Checks
- Severity should match threat description
- STRIDE categories should align with threat type
- CWE and OWASP mappings should be relevant

## Best Practices

### 1. Regular Updates
- Review threat definitions quarterly
- Update compliance mappings when standards change
- Incorporate lessons learned from security incidents
- Stay current with emerging threat landscape

### 2. Collaborative Development
- Involve security experts in threat definition
- Review threats with development teams
- Validate mitigations are technically feasible
- Ensure business stakeholder understanding

### 3. Documentation Quality
- Use consistent terminology
- Provide examples where helpful
- Include references to authoritative sources
- Maintain change history for threat definitions

### 4. Integration with Rules
- Ensure threats are referenced by appropriate rules
- Validate threat-rule associations are logical
- Test that threat detection works as expected
- Monitor for false positives and negatives

## Common Threat Templates

### Authentication Threat Template
```yaml
- id: <UUID>
  name: <Authentication Threat Name>
  severity: <high|medium|low>
  description: <Detailed description of authentication vulnerability>
  mitigation: <Authentication-specific mitigations>
  compliance:
    cwe:
      - 'CWE-287: Improper Authentication'
    owasp:
      - 'A07:2021 - Identification and Authentication Failures'
    stride:
      - Spoofing
```

### Data Protection Threat Template
```yaml
- id: <UUID>
  name: <Data Protection Threat Name>
  severity: <critical|high|medium>
  description: <Detailed description of data exposure risk>
  mitigation: <Data protection specific mitigations>
  compliance:
    cwe:
      - 'CWE-200: Exposure of Sensitive Information'
    owasp:
      - 'A02:2021 - Cryptographic Failures'
    stride:
      - Information Disclosure
```

### Injection Threat Template  
```yaml
- id: <UUID>
  name: <Injection Threat Name>
  severity: high
  description: <Detailed description of injection vulnerability>
  mitigation: <Injection-specific mitigations>
  compliance:
    cwe:
      - 'CWE-<relevant injection CWE>'
    owasp:
      - 'A03:2021 - Injection'
    stride:
      - Information Disclosure
      - Tampering
      - Elevation of Privilege
```

By following these guidelines and using the provided templates, you can create comprehensive, accurate, and actionable threat definitions that enhance the security analysis capabilities of the ThreatGraph system.
