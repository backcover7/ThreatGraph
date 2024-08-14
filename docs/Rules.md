Example rules are in the `src/modeling/built-in/` folder.

## Specs

```yaml
module:
  rule:
    - id: 7ea81d28-e509-4f6b-8f24-b2bddad9f15e
      threat: e1f06cab-4818-4c49-ace3-00a46f9e0e91
      element:
        type: process
        id: b21dc275-a75f-45fc-9522-b7fb439efeee
      designs:
        - design: additions.password.expiration = false
```

- rule.id is the universal unique UUID for this rule. You could generate such UUID using code like `node -e "console.log(require('crypto').randomUUID())"`.
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
```
attached.active.attached.zone.trust === 0
```