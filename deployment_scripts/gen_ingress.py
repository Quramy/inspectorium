#!/usr/bin/env python2.7
import json

f = open('deployment_scripts/services.json')
contents = json.loads(f.read())

names = [item["metadata"]["name"] for item in contents["items"]]

specs = ['''      - path: /master
        backend:
          serviceName: {name}
          servicePort: 4000'''.format(name=name) for name in names]

print open('k8s/ingress.tmpl.yml').read()
print '\n'.join(specs)
