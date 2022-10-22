<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [bitburner](./bitburner.md) &gt; [CodingContract](./bitburner.codingcontract.md) &gt; [getContractType](./bitburner.codingcontract.getcontracttype.md)

## CodingContract.getContractType() method

Get the type of a coding contract.

<b>Signature:</b>

```typescript
getContractType(filename: string, host?: string): string;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  filename | string | Filename of the contract. |
|  host | string | Hostname of the server containing the contract. Optional. Defaults to current server if not provided. |

<b>Returns:</b>

string

Name describing the type of problem posed by the Coding Contract.

## Remarks

RAM cost: 5 GB

Returns a name describing the type of problem posed by the Coding Contract. (e.g. Find Largest Prime Factor, Total Ways to Sum, etc.)
