devops logging for CCNQ

Same semantics as in `cuddly`:

Development/devops support messages
-----------------------------------

Indicate potential bug, internal inconsistency, or non-transient deployment problem.

```
tangible.dev('Expected the candy type to be set in GrabCandy().')
```

Operational support messages
----------------------------

Indicate non-customer-specific operational (transient) problem.

```
tangible.ops('The candy server is not reachable.')
```

Customer support messages
-------------------------

Indicate customer-specific problem (e.g. configuration entry).

```
tangible.csr('Customer Bar is out of candies.')
```

Debug megssages
---------------

Developper low-level messages, normally not enabled.

```
tangible('Checking 1,2,3')
```
