// Optional isolated HTTP acceptance: LTO_EXTERIOR_QA_FILE=/private/tmp/lto-exterior-qa.json node --test tests/exterior-recommendation-api.test.cjs
// The local fixture API must mock FlightAware and use a separate test database.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const fixturePath=process.env.LTO_EXTERIOR_QA_FILE;
const qa=fixturePath?JSON.parse(fs.readFileSync(fixturePath,'utf8')):null;
const api='http://127.0.0.1:9017/api';
function service(token){
  const filename=path.join(__dirname,'../services/httpService.ts');
  const compiled=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
  const module={exports:{}};
  vm.runInNewContext(compiled,{module,exports:module.exports,console,FormData,JSON,
    require(name){if(name==='expo-secure-store')return {getItemAsync:async()=>token};if(name==='expo-router')return {router:{replace(){throw Error('Unexpected logout');}}};if(name==='react-native-toast-message')return {};throw Error(name);},
    fetch(url,options){assert.ok(url.startsWith('https://api-livetakeoff.herokuapp.com/api/'));return fetch(url.replace('https://api-livetakeoff.herokuapp.com/api',api),options);},
  },{filename});
  return module.exports.default;
}
for(const role of ['admin','coordinator','mixed','customer']) test(`real API via mobile authenticated HTTP service: ${role}`,{skip:!qa},async()=>{
  const http=service(qa.roles[role]);
  const req={tail_number:'N19QA',ident:'',customer_id:qa.customer_id};
  assert.deepEqual(await http.post('/tail-exterior-level-2-checker',req),{show_recommendation:true,arrived_flights_count:19});
  assert.deepEqual(await http.post('/tail-exterior-level-2-checker',{...req,tail_number:'N1QA'}),{show_recommendation:false,arrived_flights_count:1});
  assert.deepEqual(await http.post('/tail-exterior-level-2-checker',{...req,customer_id:qa.disabled_customer_id}),{show_recommendation:false});
  await assert.rejects(http.post('/tail-exterior-level-2-checker',{...req,tail_number:'NERRORQA'}),/HTTP error: 500/);
  const catalog=await http.get(`/customers/retainers-services/${qa.customer_id}/`);
  assert.equal(catalog.services.filter(s=>s.is_exterior_detail_level_2).length,1);
  assert.ok(catalog.services.some(s=>s.name.includes('Basic Exterior')));
});
