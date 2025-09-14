# Entity Template Guide

## Overview

Entity templates define external actors, systems, and components that interact with or are part of your system in threat models. Entities represent trust boundaries and sources of potential threats or legitimate interactions in the ThreatGraph system.

## Entity Schema

### Basic Structure

```yaml
module:
  entity:
    - metadata:
        id: <UUID>                    # Unique identifier (required)
        name: <string>                # Display name (required)
        description: <string>         # Entity description (required)
        icon: <base64-data-uri>       # Icon as base64 data URI (required)
        type: <entity-type>           # Entity type (required)
      tags: <string[]>                # Category tags (required)
      object: <string>                # Object identifier (required)
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier for the entity template |
| `name` | string | Human-readable display name |
| `description` | string | Detailed description of what this entity represents |
| `icon` | string | Base64-encoded data URI for the entity icon |
| `type` | string | Entity type classification |
| `tags` | string[] | Array of tags for categorization and filtering |
| `object` | string | Unique object identifier used for referencing |

## Entity Types

### Common Entity Types

| Type | Description | Example Use Cases |
|------|-------------|-------------------|
| `browser` | Web browsers | Chrome, Firefox, Safari, Edge |
| `user` | User types | Normal user, Admin user, Attacker |
| `vendor` | External vendors/companies | Google, Amazon, Microsoft |
| `server` | Server applications | Tomcat, Nginx, Apache HTTP |
| `cdn` | Content delivery networks | CloudFlare, jsDelivr, cdnjs |
| `sso` | Single sign-on providers | Okta, Auth0, SAML providers |
| `crm` | Customer relationship management | Salesforce, HubSpot |
| `monitoring` | Monitoring services | Datadog, New Relic |
| `analytics` | Analytics platforms | Tableau, Databricks |
| `shop` | E-commerce platforms | Shopify, WooCommerce |
| `customer` | Customer service | Zendesk, Intercom |

## Tag Categories

### Standard Tags

| Tag Category | Description | Examples |
|--------------|-------------|----------|
| `client` | Client-side components | `client`, `browser`, `mobile` |
| `server` | Server-side components | `server`, `backend` |
| `vendor` | Third-party vendors | `vendor`, `company` |
| `authentication` | Auth-related entities | `authentication`, `sso`, `oauth` |
| `cloud-compute` | Cloud platforms | `cloud-compute`, `aws`, `azure` |
| `social` | Social platforms | `social`, `facebook`, `twitter` |
| `cdn` | Content delivery | `cdn`, `cloudflare` |
| `saas` | Software as a Service | `saas`, `crm` |

## Entity Examples

### Browser Entity

```yaml
module:
  entity:
    - metadata:
        id: 76c3e7fa-1dbd-450e-b3fc-2f7dbe79a390
        name: Chrome
        description: Google Chrome browser
        icon: data:image/svg+xml;base64,[base64-encoded-icon]
        type: browser
      tags: [ client, browser, chromium ]
      object: chrome
```

### User Entity

```yaml
module:
  entity:
    - metadata:
        id: 5ab6c3eb-e2f1-41f0-bfc9-d919b9153c13
        name: User
        description: Normal user
        icon: data:image/svg+xml;base64,[base64-encoded-icon]
        type: user
      tags: [ client, user ]
      object: normal-user
```

### Vendor Entity

```yaml
module:
  entity:
    - metadata:
        id: aa7e180a-6634-43b9-ae75-acef57d952db
        name: Google
        description: Google
        icon: data:image/svg+xml;base64,[base64-encoded-icon]
        type: vendor
      tags: [ vendor, company ]
      object: google
```

### Server Entity

```yaml
module:
  entity:
    - metadata:
        id: 339ed990-b246-4482-b3cd-2fdeb81d4a65
        name: Tomcat
        description: Tomcat server
        icon: data:image/svg+xml;base64,[base64-encoded-icon]
        type: server
      tags: [ server ]
      object: tomcat
```

## Icon Guidelines

### Icon Format
- **Format**: SVG as base64 data URI
- **Size**: Recommended 100x100px or similar square dimensions
- **Encoding**: `data:image/svg+xml;base64,[base64-content]`

### Icon Best Practices
1. **Simplicity**: Use simple, recognizable icons
2. **Scalability**: SVG ensures crisp rendering at any size
3. **Brand Recognition**: Use official brand icons when available
4. **Consistency**: Maintain visual consistency across similar entity types
5. **Accessibility**: Ensure sufficient contrast and clarity

### Example Icon Generation
```bash
# Convert SVG to base64 data URI
echo "data:image/svg+xml;base64,$(base64 -w 0 icon.svg)"
```

## Naming Conventions

### Object Naming
- Use kebab-case: `normal-user`, `google-chrome`
- Be descriptive but concise
- Avoid special characters except hyphens
- Use consistent naming patterns within types

### Display Names
- Use proper capitalization: `Google Chrome`, `Normal User`
- Include brand names when appropriate
- Keep names concise but descriptive

## Entity Categories by Directory

### `/client/`
Client-side entities including browsers, mobile apps, and user types:
- `browser.yml` - Web browsers
- `client.yml` - Generic client applications  
- `ide.yml` - Development environments
- `mobile.yml` - Mobile applications
- `people.yml` - User types and actors

### `/cloud/`
Cloud platform entities:
- `aws.yml` - Amazon Web Services
- `azure.yml` - Microsoft Azure
- `gcp.yml` - Google Cloud Platform
- `native.yml` - Cloud-native services

### `/code/`
Development and CI/CD entities:
- `cicd.yml` - CI/CD platforms
- `language.yml` - Programming languages
- `registry.yml` - Package registries

### `/company/`
Organizational entities:
- `company.yml` - Companies and vendors

## Usage in Threat Models

### Design Pattern Matching
Entities can be referenced in rules using design patterns:

```yaml
# Match any browser entity
design: "entity.type == 'browser'"

# Match specific vendor
design: "entity.object == 'google'"

# Match by tags
design: "entity.tags.contains('cloud-compute')"
```

### Trust Boundary Considerations
- **External Entities**: Represent external actors and systems
- **Trust Levels**: Use different entity types to represent different trust levels
- **Threat Sources**: Attackers and untrusted entities
- **Legitimate Actors**: Normal users and trusted services

## Custom Entity Creation

### Steps to Create Custom Entities
1. **Identify Need**: Determine what entity type is missing
2. **Choose Category**: Select appropriate entity type and tags
3. **Design Icon**: Create or source appropriate SVG icon
4. **Define Metadata**: Complete all required fields
5. **Add to Collection**: Place in appropriate directory structure

### Validation Checklist
- [ ] Unique UUID generated
- [ ] Descriptive name and description
- [ ] Appropriate entity type
- [ ] Relevant tags assigned
- [ ] Valid base64 SVG icon
- [ ] Unique object identifier
- [ ] Follows naming conventions

## Best Practices

### Entity Design
1. **Specificity**: Create specific entities for distinct components
2. **Reusability**: Design entities for reuse across multiple threat models
3. **Consistency**: Maintain consistent naming and tagging patterns
4. **Documentation**: Provide clear, informative descriptions

### Tag Strategy
1. **Hierarchical**: Use broader to more specific tags
2. **Functional**: Tag by function and capability
3. **Security-Relevant**: Include security-relevant classifications
4. **Searchable**: Use tags that enable effective filtering

### Icon Management
1. **Brand Guidelines**: Respect brand guidelines for official entities
2. **Consistency**: Maintain visual consistency within categories
3. **Quality**: Use high-quality, scalable icons
4. **Licensing**: Ensure proper licensing for icons used

## File Organization

### Directory Structure
```
src/built-in/element/entity/
├── api.yml              # API-related entities
├── client/              # Client-side entities
│   ├── browser.yml      # Web browsers
│   ├── client.yml       # Client applications
│   ├── ide.yml          # IDEs and dev tools
│   ├── mobile.yml       # Mobile apps
│   └── people.yml       # User types
├── cloud/               # Cloud platforms
│   ├── aws.yml          # AWS services
│   ├── azure.yml        # Azure services
│   ├── gcp.yml          # Google Cloud
│   └── native.yml       # Cloud-native
├── code/                # Development entities
│   ├── cicd.yml         # CI/CD platforms
│   ├── language.yml     # Languages
│   └── registry.yml     # Package registries
├── company.yml          # Companies/vendors
├── filetype.yml         # File types
├── map.yml              # Mapping services
├── message.yml          # Messaging services
├── network.yml          # Network entities
├── others.yml           # Miscellaneous
├── payment.yml          # Payment services
├── security.yml         # Security services
└── server.yml           # Server applications
```

This structure provides comprehensive coverage of external entities that interact with modern systems while maintaining clear organization and reusability across threat models.
