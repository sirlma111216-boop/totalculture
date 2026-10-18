// Uses the already authorized Wrangler session in memory; never prints credentials.
import fs from 'node:fs';
import path from 'node:path';
const config=path.join(process.env.APPDATA,'xdg.config','.wrangler','config','default.toml');
const token=fs.readFileSync(config,'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)?.[1];
if(!token)throw new Error('Run wrangler login first.');
const account='3c166b189a0b269ef920ffe9301ae05d';
const base=`https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects`;
const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
const mode=process.argv[2]||'inspect';
if(mode==='inspect'){
 const r=await fetch(base+'/totalculture',{headers});const d=await r.json();console.log(JSON.stringify({success:d.success,errors:d.errors,project:d.result?{name:d.result.name,subdomain:d.result.subdomain,source:d.result.source,build_config:d.result.build_config}:null},null,2));
}else if(mode==='create'){
 const body={name:'totalculture',production_branch:'main',build_config:{build_command:'npm run build',destination_dir:'dist',root_dir:''},source:{type:'github',config:{owner:'sirlma111216-boop',repo_name:'totalculture',production_branch:'main',pr_comments_enabled:true,deployments_enabled:true,production_deployments_enabled:true,preview_deployment_setting:'all'}}};
 const r=await fetch(base,{method:'POST',headers,body:JSON.stringify(body)});const d=await r.json();console.log(JSON.stringify({success:d.success,errors:d.errors,project:d.result?{name:d.result.name,subdomain:d.result.subdomain,source:d.result.source}:null},null,2));
}else if(mode==='deployments'){
 const r=await fetch(base+'/totalculture/deployments',{headers});const d=await r.json();console.log(JSON.stringify({success:d.success,errors:d.errors,deployments:d.result?.slice(0,3).map(x=>({id:x.id,url:x.url,environment:x.environment,latest_stage:x.latest_stage,deployment_trigger:x.deployment_trigger}))},null,2));
}else if(mode==='logs'){
 const id=process.argv[3];if(!/^[a-f0-9-]+$/.test(id))throw Error('Invalid deployment id');
 const r=await fetch(base+`/totalculture/deployments/${id}/history/logs`,{headers});const d=await r.json();console.log(JSON.stringify(d.result?.data?.map(x=>x.line)||d.errors));
}
