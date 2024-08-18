Example rules are in the `src/modeling/built-in/` folder.
JSON Schema of yaml temaplates are written in `schema.tsx`.

Any UUID value listed below using code like `node -e "console.log(require('crypto').randomUUID())"`.

# Module
There are three kinds of module including `element`, `threat` and `rule`. It could helps engine to know what kind of yaml is parsing and loading right now.
```yaml
module:
  <element | threat | rule>:
    ...
```

Different modules could be put together in one or different yaml files. Template engine could be able to parse and load them all separately.

# Element
## Specs
`metadata` is a commonly used proeprty object in every element.
- element.metadata.id is the universal unique UUID. Rule will map the element by this id.
- element.metadata.name is the name of this element.
- element.metadata.description is the description of this element.
- element.metadata.icon is the data protocol based url of this threat.
- element.metadata.type is the type of every element. For example, public type of a zone, client type of an entity, etc.
- element.groups is an array including all groups which might be able to map this element. This is useful to categorize elements and display them in a better way.

### Zone
```yaml
module:
  zone:
    - metadata:
        id: <UUID>
        name: <zone name>
        description: <description>
        icon: <data url of icon image>
        type: <kind of zone>
      groups: [group1, group2, ...]
      trust: <0 | 1 | 2 | 3>
      additions:
        <additional attributes>
```
- zone.trust is the trust level of the zone. 0 is totally untrusted, 3 is totally trusted.

### Entity
```yaml
module:
  entity:
    - metadata:
        id: <UUID>
        name: <entity name>
        description: <description>
        icon: <data url of icon image>
        type: <kind of entity>
      groups: [group1, group2, ...]
      object: <entity object>
      additions:
        <additional attributes>
```
- zone.object is the exact name for entity, like `browser`, `ec2`, etc.

### Datastore
```yaml
module:
  datastore:
    - metadata:
        id: <UUID>
        name: <datastore name>
        description: <description>
        icon: <data url of icon image>
        type: <kind of datastore>
      groups: [group1, group2, ...]
      additions:
        <additional attributes>
```

### Process
```yaml
module:
  process:
    - metadata:
        id: <UUID>
        name: <datastore name>
        description: <description>
        icon: <data url of icon image>
        type: <kind of datastore>
      attributes:
        critical: <0 | 1 | 2 | 3>
        isSanitizer: <true | false>
        isAuthn: <true | false>
        operation: <r | w | rw>
      calls: [call1, call2, ...]
      additions:
        <additional attributes>
```
- zone.attributes is a property object to describe several common features of the process.
  - zone.attributes.critical is the importance of the data used through this process. 0 is totally uncritical, 3 is totally critical.
  - zone.attributes.isSanitizer tells whether this process is a security related process, like `login`.
  - zone.attributes.isAuthn tells whether this process is about an authorized process, like `changing password`.
  - zone.attributes.operation is how does this process operate the data. `GET` is `read`, `POST` is `write`. If `GET` and `POST` both exists, then it is `rw`. For example, a sql connection should be `rw`.
- zone.calls is an array to contain function signatures which will be finally used in this process.

### Dataflow
```yaml
module:
  dataflow:
    - metadata:
        id: <UUID>
        name: <datastore name>
        description: <description>
        type: <http | websocket | ssh | rpc | sql | dns | rmi | other kind of dataflow>
      ssl:
        isSSL: <true | false>
        mTLS: <true | false>
      data:
        sensitive: <0 | 1 | 2 | 3>
        content: <normal | secret | PII | credit card | code | any other content>
      additions:
        <additional attributes>
```
- dataflow.ssl is a property object to describe how to implement encryption in the data transportation.
  - dataflow.ssl.isSSL tells whether the protocol is over `SSL/TLS`.
  - dataflow.ssl.mTLS tells whether `mTLS` is implemented to authenticate client side and server side both.
- dataflow.data is a property object to describe data transmitted in the flow.
  - dataflow.data.sensitive is privacy level of data transmitted in the flow. `0` is totally insensitive, `3` is totally sensitive.
  - dataflow.data.content is to describe exact type of transmitted data, like `secret token` or `code`.

## Additions
`addtions` is a customizing property in every element. This is used to add some extra attributes of every element to describe this element more sepcifically. For example, a authentication process element might need some more items like `requireCaptcha` to tell engine whether this process is able to prevent brute force attacking by captcha validation. Any one of extra items should be constructed with two basic properties, `type` and `description`.
```yaml
requireCaptcha:
  type: boolean
  description: Whether CAPTCHA is required during authentication
```


# Threat
## Specs
```yaml
module:
  threat:
    - id: <UUID>
      name: <threat name>
      severity: <informative | low | medium | high | critical>
      description: <description>
      mitigation: <mitigataion>
      compliance:
        cwe:
          - 'CWE-<NUM>: <CWE Name>'
          - ...
        owasp:
          - 'A01:2021 - <OWASP Name>'
          - ...
        stride:
          - <Spoofing | Tampering | Repudiation | Information Disclosure | Denial of Service | Elevation of Privilege>
          - ...
```
- threat.id is the universal unique UUID. Rule will map the threat by this id.
- threat.name is the name of this threat.
- threat.severity is the severity level of this threat. There five options for this property: informative, low, medium, high and critical.
- threat.description is the description of this threat.
- threat.mitigation is the mitigation of this threat.
- threat.compliance is the compliance collections of this threat. There are three properties in the compliance property object. For every threat, there probably have more than one cwe or owasp or stride.

# Rule
## Specs
```yaml
module:
  rule:
    - id: <UUID>
      threat: <UUID>
      element:
        type: <process>
        id: <UUID>
      designs:
        - design: <expression>
```

- rule.id is the universal unique UUID for this rule.
- rule.threat is the universal unique UUID for a threat. It means this rule is going to detect whether this mapping threat exist in the threat model.
- rule.element is an object to describe any possible matched element.
  - rule.element.type describes what kind of element is in detection for this rule.
  - rule.element.id describes exact built-in element. This is an optional property.
- rule.designs is an object to describe the specifications for this particular rule. There are three keywords you could use as property in this object.
  - designs: All designs under this property has to be true. It's like AND logic.
  - either: Any one of the designs under this property will directly determine the final of this rule block. It's like OR logic.
  - design: The basic single rule of every rule block.

## How to write designs?
design is like a simple comparison like `A operator B`. `A` and `B` are objects you are going to compare.
There are several supported operators as following:
- `=`
- `!=`
- `<`
- `<=`
- `>`
- `>=`

You could retrieve a value from the element object like `isSSL.SSL` from the following element.
```json
{
  "model": {
    "metadata": {
      "element": "dataflow",
      "id": "847e90d9-bb58-41fb-8aac-e5a1ab26dcbd",
      "name": "http",
      "type": "http"
    },
    "ssl": {
      "isSSL": false,
      "mTLS": false
    },
    "data": {
      "sensitive": 3,
      "content": "secret"
    }
  }
}
```

You could also use `attached` property to search any connected element in the canvas. The following design rule is checking whether the start binding node of this dataflow is in a zone whose trust is 0.
```js
attached.active.attached.zone.trust === 0
```