import json
r=json.load(open('.taste-skill/consistency/report.json',encoding='utf-8'))
seen={}
for w in r['widths']:
    for f in w['findings']:
        if f['sev']!='FAIL': continue
        k=(f['check'],f['sel'][:60])
        if k in seen: seen[k][1].append(w['width']); continue
        seen[k]=(f,[w['width']])
for (c,s),(f,ws) in sorted(seen.items()):
    print(c,ws,'|',s,'|',f['msg'][:240])
for k in ('slow','sweep','narrow'):
    v=r.get(k)
    if isinstance(v,dict):
        for f in v.get('findings',[]):
            if f.get('sev')=='FAIL': print(k,f['check'],f['sel'][:60],'|',f['msg'][:160])
