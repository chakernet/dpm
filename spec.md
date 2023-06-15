## Spec

### dep refrences
`a` tag style

### Packages
package definitions should always be checked for validity
```json
{
  "kind": 30241,
  "tags": [
    [
      "d",
      "some id, MUST be consistent"
    ],
    [
      "description",
      "Description"
    ],
    [
      "name",
      "Name of the package"
    ]
  ],
  "content": ""
}
```

### Versions

all package versions should have the same author as the package definition and should always be checked for validity.
```json
{
  "kind": 30242,
  "tags": [
    [
      "d",
      "<random id>"
    ],
    ["a", "30241:<pubkey>:<d-id>", "<relay url>"],
    [
      "version",
      "<package version>"
    ],
    ["uri", "<uri for download>"]
  ],
  "content": "<changelog or some other notes>"
}
```

## Deletions
Clients MUST obey NIP-09 Event Deletions
