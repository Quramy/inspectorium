#!/usr/bin/env python2.7

import json

contents = json.loads(open('deployment_scripts/services.json').read())

rule_tmpl = '''      - path: /{branch}
        backend:
          serviceName: {name}
          servicePort: 4000'''

specs = [
    rule_tmpl.format(
        name=item['metadata']['name'],
        branch=item['metadata']['labels']['suffix'])
    for item in contents['items'] if item['metadata']['name'] != 'web-master'
]

print open('k8s/ingress.tmpl.yml').read()
print '\n'.join(specs)
