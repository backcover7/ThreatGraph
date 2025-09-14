# Rule Writing Guide

## Overview

Rules are core components of the ThreatGraph threat modeling system, used to define security threats that may exist under specific conditions. Rules use design patterns to match specific configurations or states of system components, and when a match is successful, the system flags the corresponding threat.

## Rule Schema

### Basic Structure

```yaml
module:
  rule:
    - id: <UUID>                    # Unique identifier (required)
      threat: <UUID>                # Associated threat ID (required)  
      element: <element-type>       # Applicable element type (required)
      description: <string>         # Rule description (optional)
      severity: <severity-level>    # Severity override (optional)
      references: <string[]>        # Reference materials (optional)
      
      # The following three fields are mutually exclusive:
      designs: <design-item[]>      # Multi-condition combination (AND logic)
      either: <design-item[]>       # Multi-condition selection (OR logic)  
      design: <string>              # Single condition expression
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier for the rule, UUID format |
| `threat` | UUID | Associated threat ID, must exist in threat definitions |
| `element` | string | Element type the rule applies to: `zone`, `entity`, `datastore`, `process`, `dataflow` |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Detailed description of the rule |
| `severity` | string | Override severity of associated threat: `informative`, `low`, `medium`, `high`, `critical` |
| `references` | string[] | Reference links or documentation |

### Condition Definition Fields (Mutually Exclusive)

| Field | Type | Description |
|-------|------|-------------|
| `designs` | array | AND combination of multiple conditions, all must be satisfied |
| `either` | array | OR combination of multiple conditions, any one satisfied |
| `design` | string | Single condition expression |

## Design Pattern Syntax

### Expression Format

Design patterns use mathematical-like expression syntax: `left_operand operator right_operand`

Supported operators:
- `==` : equals
- `!=` : not equals
- `<` : less than
- `<=` : less than or equal
- `>` : greater than
- `>=` : greater than or equal
- `=` : variable assignment (for variable definition)

### Data Access

#### Element Property Access
Use `$.` prefix to access properties of the current analyzed element:

```yaml
# Access type property in metadata
design: $.metadata.type == 'password'

# Access nested properties
design: $.ssl.isSSL == false

# Access custom properties in additions
design: $.additions.strong_password == false
```

#### Temporary Variables
Use `$VARIABLE_NAME` to define and use temporary variables:

```yaml
designs:
  - variable: $FRIEND = $.friend        # Define variable
  - design: $FRIEND.company == 'google' # Use variable
```

#### Associated Element Access
Access other elements associated with the current element:

```yaml
# Access source node of dataflow
design: $.attached.source.metadata.element == 'entity'

# Access trust zone of source node
design: $.attached.source.attached.zone.trust != 3

# Access target node of dataflow
design: $.attached.destination.metadata.type == 'server'
```

### Data Types

#### String
Enclosed in single quotes:
```yaml
design: $.metadata.type == 'password'
```

#### Number
Direct numeric values:
```yaml
design: $.data.sensitive > 2
design: $.attached.zone.trust == 3
```

#### Boolean
Use `true` or `false`:
```yaml
design: $.ssl.isSSL == false
design: $.authentication.required == true
```

### Array Operations
When a property is an array, the system automatically matches each element in the array, returning true if any element meets the condition:

```yaml
# If tags is an array, checks if any tag.type equals 'student'
design: $.tags.type == 'student'
```

## Logic Combination

### designs (AND Logic)
All conditions must be satisfied:

```yaml
designs:
  - design: $.metadata.type == 'password'
  - design: $.additions.strong_password == false
  - design: $.authentication.required == true
```

### either (OR Logic)
Any condition satisfied:

```yaml
either:
  - design: $.metadata.object == 'mysql-client'
  - design: $.metadata.object == 'mariadb-client'
```

### Nested Combinations
You can nest designs and either:

```yaml
designs:
  - design: $.metadata.element == 'dataflow'
  - either:
    - design: $.attached.source.attached.zone.trust != 3
    - design: $.attached.destination.attached.zone.trust != 3
  - designs:
    - design: $.ssl.isSSL == false
    - design: $.data.sensitive > 2
```

### Complex Condition Example
```yaml
either:
  - designs:  # Source node might be client entity
    - design: $.attached.source.metadata.element == 'entity'
    - design: $.attached.source.metadata.type == 'client'
  - either:   # Or source node might be server entity or datastore
    - designs:
      - design: $.attached.destination.metadata.element == 'entity'
      - design: $.attached.destination.metadata.type == 'server'
    - design: $.attached.destination.metadata.element == 'datastore'
```

## Variable System

### Variable Definition
Use assignment operator to define variables:

```yaml
designs:
  - variable: $SOURCE = $.attached.source
  - variable: $DEST = $.attached.destination
  - design: $SOURCE.trust > $DEST.trust
```

### Variable Scope
- Variables are valid in current block and its sub-blocks
- Sub-blocks can access parent block variables
- Variables are automatically cleaned up when exiting blocks

### Variable Naming Rules
- Must start with `$`
- Followed by uppercase letters
- Can include numbers and underscores
- Examples: `$TAG`, `$SOURCE`, `$FRIEND`

## Practical Examples

### 1. Authentication Rules

```yaml
module:
  rule:
    # Weak password policy
    - id: 488dc7ab-928f-407d-b995-45f91e4b7afc
      threat: 461c0696-9811-413b-98ff-f5073f7b88a3
      element: process
      designs:
        - design: $.metadata.type == 'password'
        - design: $.additions.strong_password == false
    
    # Never expired credentials
    - id: 3dd6d4bf-f281-47af-aa26-ce56e9a11957
      threat: e1f06cab-4818-4c49-ace3-00a46f9e0e91
      element: process
      designs:
        - design: $.metadata.type == 'password'
        - design: $.additions.expired_password == false
```

### 2. Data Flow Security Rules

```yaml
module:
  rule:
    # Unencrypted transport
    - id: 7e836567-bf73-487c-a0a5-c10e510da1fc
      threat: ab025cee-ca17-461a-b8a7-5231031bf848
      element: dataflow
      designs:
        - design: $.ssl.isSSL == false
        - either:
          - design: $.attached.source.attached.zone.trust != 3
          - design: $.attached.destination.attached.zone.trust != 3
    
    # SQL injection risk
    - id: 0fa94631-934b-4b24-b1b2-259e978b30a8
      threat: 7b1f3a9c-8e5d-4c2a-b0f5-9e8f7a1d6b3e
      element: dataflow
      designs:
        - design: $.attached.destination.metadata.element == 'datastore'
        - design: $.attached.destination.metadata.type == 'sql-datastore'
```

### 3. Cross-Zone Access Control

```yaml
module:
  rule:
    # Improper access control
    - id: 429ac204-3fc8-4634-9953-95b767ea9934
      threat: f8e7d9c1-b6a3-4f2e-9d5c-12e3a4b5c6d7
      element: dataflow
      design: $.attached.source.attached.zone.metadata.shape != $.attached.destination.attached.zone.metadata.shape
```

### 4. Complex Condition Combinations

```yaml
module:
  rule:
    # Rogue client detection
    - id: afe52040-7029-4c04-acb8-609dc9bb71b6
      threat: d06b6da5-1214-4068-9a01-b96572716c02
      element: dataflow
      designs:
        - design: $.attached.source.attached.zone.trust < $.attached.destination.attached.zone.trust
        - either:
          - designs:
            - design: $.attached.source.metadata.element == 'entity'
            - design: $.attached.source.metadata.type == 'client'
          - either:
            - designs:
              - design: $.attached.destination.metadata.element == 'entity'
              - design: $.attached.destination.metadata.type == 'server'
            - design: $.attached.destination.metadata.element == 'datastore'
```

## Best Practices

### 1. Naming Conventions
- Use UUID format for id
- Provide clear descriptions
- Reference clearly existing threat ids

### 2. Condition Design
- Prioritize most specific conditions
- Avoid overly broad matching
- Use logical combinations reasonably to reduce false positives

### 3. Performance Considerations
- Avoid excessive nesting
- System limits maximum depth to 10 levels
- Prioritize checking most likely to fail conditions first

### 4. Maintainability
- Add appropriate comments
- Use descriptive variable names
- Keep rules atomic and independent

### 5. Testing and Validation
- Ensure rules correctly match expected scenarios
- Test boundary conditions
- Verify no false positives are generated

## Debugging Tips

### 1. Expression Validation
The system validates expression syntax at runtime:
- Check if operators are correct
- Verify property paths are valid
- Confirm variables are defined

### 2. Error Handling
- Invalid rule formats output error logs
- Undefined variables throw exceptions
- Depth limits provide warnings

### 3. Log Output
The system outputs detailed analysis logs to help debug rule matching processes.

## Extensibility

The rule system is designed with good extensibility:
- Support for new element types
- Ability to add custom operators
- Support for plugin-style function extensions

By properly using the rule system, you can build powerful and flexible threat detection mechanisms that provide comprehensive security protection for systems.
